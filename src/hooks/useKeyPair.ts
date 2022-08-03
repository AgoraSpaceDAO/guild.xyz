import { useRumError } from "@datadog/rum-react-integration"
import { useWeb3React } from "@web3-react/core"
import { createStore, del, get, set } from "idb-keyval"
import useSWR, { KeyedMutator, mutate } from "swr"
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
  payload: { pubKey: string; keyPair: CryptoKeyPair }
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

  await setKeyPairToIdb(userId, payload)

  await mutate(`/user/${account}`)
  await mutateKeyPair()

  return payload.keyPair
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

  const { data: user, error: userError } = useSWR<User>(
    account ? `/user/${account}` : null
  )

  const {
    data: { keyPair, pubKey },
    mutate: mutateKeyPair,
    error: keyPairError,
  } = useSWR(!!user?.id ? ["keyPair", user?.id] : null, getKeyPair, {
    revalidateOnMount: true,
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
    fallbackData: { pubKey: undefined, keyPair: undefined },
  })

  const toast = useToast()

  useSWR(
    keyPair && user?.id ? ["isKeyPairValid", account, pubKey, user?.id] : null,
    checkKeyPair,
    {
      onSuccess: ([isValid, userId]) => {
        if (!isValid) {
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

  const addDatadogError = useRumError()

  const setSubmitResponse = useSubmitWithSignWithParamKeyPair(
    ({ data, validation }) =>
      setKeyPair({ account, mutateKeyPair, validation, payload: data }),
    {
      keyPair,
      forcePrompt: true,
      message:
        "Please sign this message, so we can generate, and assign you a signing key pair. This is needed so you don't have to sign every Guild interaction.",
      onError: (error) =>
        addDatadogError(`Keypair generation error`, { error }, "custom"),
    }
  )

  const ready = !(keyPair === undefined && keyPairError === undefined) || !!userError

  return {
    ready,
    pubKey,
    keyPair,
    set: {
      ...setSubmitResponse,
      onSubmit: async () => {
        try {
          const generatedKeys = await generateKeyPair()

          const generatedPubKey = await window.crypto.subtle.exportKey(
            "raw",
            generatedKeys.publicKey
          )

          const generatedPubKeyHex = bufferToHex(generatedPubKey)
          const body = { pubKey: generatedPubKeyHex, keyPair: generatedKeys }

          return setSubmitResponse.onSubmit(body)
        } catch (error) {
          addDatadogError(`Keypair generation error`, { error }, "custom")
          throw error
        }
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
