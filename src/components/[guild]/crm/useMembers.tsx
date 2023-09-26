import { useCallback, useMemo, useState } from "react"
import useSWRInfinite from "swr/infinite"
import { PlatformAccountDetails, Visibility } from "types"
import { useFetcherWithSign } from "utils/fetcher"
import useGuild from "../hooks/useGuild"

type CrmRole = {
  roleId?: number
  requirementId?: number
  access?: boolean
  amount?: number
}

type Member = {
  userId: number
  addresses: string[]
  platformUsers: PlatformAccountDetails[]
  joinedAt: string
  roles: {
    hidden?: CrmRole[]
    public: CrmRole[]
  }
}

const LIMIT = 50

const useMembers = (queryString) => {
  const { id } = useGuild()
  const [hasReachedTheEnd, setHasReachedTheEnd] = useState(true)

  const getKey = useCallback(
    (pageIndex, previousPageData) => {
      if (!id) return null

      if (previousPageData && previousPageData.length < LIMIT) {
        setHasReachedTheEnd(true)
        return null
      }

      const pagination = `offset=${pageIndex * LIMIT}&limit=${LIMIT}`

      return `/v2/crm/guilds/${id}/members?${[queryString, pagination].join("&")}`
    },
    [queryString, id]
  )

  const fetcherWithSign = useFetcherWithSign()
  const fetchMembers = useCallback(
    (url: string) =>
      fetcherWithSign([
        url,
        {
          method: "GET",
          body: {},
        },
      ]).then((res) => {
        if (res.length === LIMIT) setHasReachedTheEnd(false)

        return res.map((user) => ({
          ...user,
          roles: {
            hidden: user.roles.filter(
              (role) => role.visibility === Visibility.HIDDEN
            ),
            public: user.roles.filter(
              (role) => role.visibility !== Visibility.HIDDEN
            ),
          },
        }))
      }),
    [fetcherWithSign]
  )

  const { data, ...rest } = useSWRInfinite<Member[]>(getKey, fetchMembers, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateFirstPage: false,
    revalidateOnMount: true,
  })

  const flattenedData = useMemo(() => data?.flat(), [data])

  return {
    data: flattenedData,
    hasReachedTheEnd,
    ...rest,
  }
}

export default useMembers
export type { CrmRole, Member }
