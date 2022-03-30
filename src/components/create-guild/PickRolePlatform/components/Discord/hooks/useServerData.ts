import { useEffect } from "react"
import useSWR from "swr"

const fallbackData = {
  serverId: "",
  channels: [],
  isAdmin: null,
}

const useServerData = (serverId: string, swrOptions = {}) => {
  const shouldFetch = serverId?.length >= 0

  useEffect(() => {
    console.log("shouldFetch", shouldFetch)
  }, [shouldFetch])

  const { data, isValidating, error } = useSWR(
    shouldFetch ? `/discord/server/${serverId}` : null,
    {
      fallbackData,
      ...swrOptions,
    }
  )

  return { data, isLoading: isValidating, error }
}

export default useServerData
