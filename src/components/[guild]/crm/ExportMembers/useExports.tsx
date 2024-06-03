import useGuild from "components/[guild]/hooks/useGuild"
import { useState } from "react"
import useSWRImmutable from "swr/immutable"
import { useFetcherWithSign } from "utils/fetcher"

export const crmOrderByParams = { joinedAt: "Join date", roles: "Number of roles" }
type CRMOrderByParams = keyof typeof crmOrderByParams

export type ExportData = {
  id: number
  bucketName: string
  filename: string
  status: "STARTED" | "FINISHED" | "FAILED"
  data: {
    count: number
    params: {
      search: string
      roleIds: number[]
      logic: "AND" | "OR"
      order: CRMOrderByParams
      sortOrder: "desc" | "asc"
    }
  }
  createdAt: string
  updatedAt: string
}

export type ExportsEndpoint = {
  exports: ExportData[]
}

const useExports = () => {
  const { id } = useGuild()
  const [shouldPoll, setShouldPoll] = useState(false)
  const fetcherWithSign = useFetcherWithSign()

  const fetchExports = (endpoint) =>
    fetcherWithSign([endpoint, { method: "GET" }]).then((res: ExportsEndpoint) => {
      if (res.exports.some((exp) => exp.status === "STARTED")) setShouldPoll(true)
      else setShouldPoll(false)

      return res
    })

  return useSWRImmutable<ExportsEndpoint>(
    `/v2/crm/guilds/${id}/exports`,
    fetchExports,
    {
      keepPreviousData: true,
      refreshInterval: shouldPoll ? 500 : null,
    }
  )
}

export default useExports
