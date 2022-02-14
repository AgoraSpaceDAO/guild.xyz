import type { Web3Provider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import Cookies from "js-cookie"
import { useCallback, useState } from "react"
import useSWR, { mutate } from "swr"
import fetcher from "utils/fetcher"

const usePersonalSign = () => {
  const { library, account } = useWeb3React<Web3Provider>()
  const [error, setError] =
    useState<{ error: string; errorDescription: string }>(null)
  const [isSigning, setIsSigning] = useState<boolean>(false)

  const { data: sessionToken } = useSWR(
    "sessionToken",
    () => Cookies.get("sessionToken"),
    { refreshInterval: 1000 }
  )

  const getSessionToken = useCallback(async (): Promise<string> => {
    if (!Cookies.get("sessionToken")) {
      const challenge = "challenge" /*await fetcher("/auth/challenge", {
        method: "POST",
        body: { address: account },
      }).catch((e) => {
        console.log(e)
        throw Error("Failed to request signature challenge")
      })
      */
      const addressSignedMessage = await library
        .getSigner(account)
        .signMessage(challenge)

      await fetcher(/* "/auth/session" */ "/api/dummy-token", {
        method: "POST",
        body: { address: account, addressSignedMessage },
      })
    }
    await mutate("sessionToken")
    return Cookies.get("sessionToken")
  }, [account, library])

  const removeError = () => setError(null)

  const callbackWithSign = (callback) => async (props?) => {
    removeError()
    setIsSigning(true)
    const authorization = await getSessionToken()
      .catch((e) => {
        setError(e)
        throw e
      })
      .finally(() => setIsSigning(false))
    return callback({ ...props, authorization })
  }

  return {
    sessionToken,
    sign: getSessionToken,
    callbackWithSign,
    isSigning,
    // explicit undefined instead of just "&& error" so it doesn't change to false
    error: !sessionToken && !isSigning ? error : undefined,
    removeError,
  }
}

export default usePersonalSign
