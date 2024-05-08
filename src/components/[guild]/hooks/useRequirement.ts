import useSWR from "swr"
import { Requirement } from "types"
import useGuild from "./useGuild"

const useRequirement = (roleId: number, requirementId: number, search?: string) => {
  const { id: guildId } = useGuild()

  return useSWR<Requirement>(
    guildId && roleId && requirementId
      ? [
          `/v2/guilds/${guildId}/roles/${roleId}/requirements/${requirementId}/${
            search ? `?search=${search}` : ""
          }`,
          { method: "GET", body: {} },
        ]
      : null
  )
}

export default useRequirement
