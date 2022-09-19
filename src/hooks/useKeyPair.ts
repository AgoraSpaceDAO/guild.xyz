import { datadogRum } from "@datadog/browser-rum"
import { useRumAction, useRumError } from "@datadog/rum-react-integration"
import { useWeb3React } from "@web3-react/core"
import { createStore, del, get, set } from "idb-keyval"
import useSWR, { KeyedMutator, mutate } from "swr"
import useSWRImmutable from "swr/immutable"
import { User } from "types"
import { bufferToHex } from "utils/bufferUtils"
import fetcher from "utils/fetcher"
import { Validation } from "./useSubmit"
import { useSubmitWithSignWithParamKeyPair } from "./useSubmit/useSubmit"
import useToast from "./useToast"

type StoredKeyPair = {
  keyPair: CryptoKeyPair
  pubKey: string
}

const getStore = () => createStore("guild.xyz", "signingKeyPairs")

const getKeyPairFromIdb = (userId: number) => get<StoredKeyPair>(userId, getStore())
const deleteKeyPairFromIdb = (userId: number) => del(userId, getStore())
const setKeyPairToIdb = (userId: number, keys: StoredKeyPair) =>
  set(userId, keys, getStore())

const generateKeyPair = () => {
  try {
    return window.crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      false,
      ["sign", "verify"]
    )
  } catch (error) {
    console.error(error)
    throw new Error("Generating a key pair is unsupported in this browser.")
  }
}

const getKeyPair = async (_: string, id: number) => {
  const keyPairAndPubKey = await getKeyPairFromIdb(id)

  if (keyPairAndPubKey === undefined) {
    return {
      keyPair: null,
      pubKey: null,
    }
  }

  return keyPairAndPubKey
}

const setKeyPair = async ({
  account,
  mutateKeyPair,
  validation,
  payload,
}: {
  account: string
  validation: Validation
  mutateKeyPair: KeyedMutator<StoredKeyPair>
  payload: StoredKeyPair
}) => {
  const { userId } = await fetcher("/user/pubKey", {
    body: {
      payload: {
        pubKey: payload.pubKey,
      },
      ...validation,
    },
    method: "POST",
  })

  /**
   * This rejects, when IndexedDB is not available, like in Firefox private window.
   * Ignoring this error is fine, since we are falling back to just storing it in memory.
   */
  await setKeyPairToIdb(userId, payload).catch(() => {})

  await mutate(`/user/${account}`).catch((error) => {
    datadogRum?.addError(`setKeyPair - mutate(\`/user/\${account}\`) call failed`)
    datadogRum?.addError(error)
    throw error
  })
  await mutateKeyPair().catch((error) => {
    datadogRum?.addError(`setKeyPair - mutateKeyPair() call failed`)
    datadogRum?.addError(error)
    throw error
  })

  return payload
}

const checkKeyPair = (
  _: string,
  address: string,
  pubKey: string,
  userId: number
): Promise<[boolean, number]> =>
  fetcher("/user/checkPubKey", {
    method: "POST",
    body: { address, pubKey },
  }).then((result) => [result, userId])

const useKeyPair = () => {
  const { account } = useWeb3React()

  const { data: user, error: userError } = useSWRImmutable<User>(
    account ? `/user/${account}` : null
  )

  const {
    data: { keyPair, pubKey },
    mutate: mutateKeyPair,
    error: keyPairError,
  } = useSWR(!!user?.id ? ["keyPair", user?.id] : null, getKeyPair, {
    revalidateOnMount: true,
    revalidateIfStale: true,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 2000,
    fallbackData: { pubKey: undefined, keyPair: undefined },
  })

  const toast = useToast()

  const addDatadogAction = useRumAction("trackingAppAction")
  const addDatadogError = useRumError()

  const { data: isKeyPairValidData } = useSWRImmutable(
    keyPair && user?.id ? ["isKeyPairValid", account, pubKey, user?.id] : null,
    checkKeyPair,
    {
      fallbackData: [false, undefined],
      revalidateOnMount: true,
      onSuccess: ([isKeyPairValid, userId]) => {
        if (!isKeyPairValid) {
          addDatadogAction("Invalid keypair", {
            data: { userId, pubKey: keyPair.publicKey },
          })

          toast({
            status: "error",
            title: "Invalid signing key",
            description:
              "Browser's signing key is invalid, please generate a new one",
          })

          deleteKeyPairFromIdb(userId).then(() => {
            mutateKeyPair({ pubKey: undefined, keyPair: undefined })
          })
        }
      },
    }
  )

  const setSubmitResponse = useSubmitWithSignWithParamKeyPair<
    StoredKeyPair,
    StoredKeyPair
  >(
    ({ data, validation }) =>
      setKeyPair({ account, mutateKeyPair, validation, payload: data }),
    {
      keyPair,
      forcePrompt: true,
      message:
        "Please sign this message, so we can generate, and assign you a signing key pair. This is needed so you don't have to sign every Guild interaction.",
      onError: (error) => {
        console.error("setKeyPair error", error)
        if (error?.code !== 4001) {
          addDatadogError(
            `Failed to set keypair`,
            { error: error?.message || error?.toString?.() || error },
            "custom"
          )
        }
      },
      onSuccess: (generatedKeyPair) => mutateKeyPair(generatedKeyPair),
    }
  )

  const ready = !(keyPair === undefined && keyPairError === undefined) || !!userError

  return {
    ready,
    pubKey,
    keyPair,
    isValid: isKeyPairValidData?.[0] ?? false,
    set: {
      ...setSubmitResponse,
      onSubmit: async () => {
        const body: StoredKeyPair = {
          pubKey: undefined,
          keyPair: undefined,
        }
        try {
          const generatedKeys = await generateKeyPair()

          try {
            const generatedPubKey = await window.crypto.subtle.exportKey(
              "raw",
              generatedKeys.publicKey
            )

            const generatedPubKeyHex = bufferToHex(generatedPubKey)
            body.pubKey = generatedPubKeyHex
            body.keyPair = generatedKeys
          } catch {
            throw new Error("Pubkey export error")
          }
        } catch (error) {
          if (error?.code !== 4001) {
            addDatadogError(
              `Keypair generation error`,
              { error: error?.message || error?.toString?.() || error },
              "custom"
            )
          }
          throw error
        }
        return setSubmitResponse.onSubmit(body)
      },
    },
  }
}

const manageKeyPairAfterUserMerge = async (fetcherWithSign, prevUser, account) => {
  try {
    const [prevKeys, newUser] = await Promise.all([
      getKeyPairFromIdb(prevUser?.id),
      fetcherWithSign(`/user/details/${account}`, {
        method: "POST",
        body: {},
      }) as Promise<User>,
    ])

    if (prevUser?.id !== newUser?.id && !!prevKeys) {
      await Promise.all([
        setKeyPairToIdb(newUser?.id, prevKeys),
        mutate(["keyPair", newUser?.id], prevKeys),
        mutate(["isKeyPairValid", account, prevKeys.pubKey, newUser?.id], true),
        mutate([`/user/details/${account}`, { method: "POST", body: {} }]),
        deleteKeyPairFromIdb(prevUser?.id),
      ])
    }
  } catch {}
}

export {
  getKeyPairFromIdb,
  setKeyPairToIdb,
  deleteKeyPairFromIdb,
  manageKeyPairAfterUserMerge,
}
export default useKeyPair
