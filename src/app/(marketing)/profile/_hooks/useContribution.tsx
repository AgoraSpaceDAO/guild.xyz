import { Guild, Role, Schemas } from "@guildxyz/types"
import useSWRImmutable from "swr/immutable"
import fetcher from "utils/fetcher"
import { useProfile } from "./useProfile"

export type ExtendedContribution = {
  guild: Guild
  role: Role
  contribution: Schemas["ProfileContribution"]
}

type ContributionFetcher = (
  contributions: Schemas["ProfileContribution"][]
) => Promise<ExtendedContribution[]>

export const parsedContributionFetcher: ContributionFetcher = async (
  contributions
) => {
  const roleRequests = contributions.map(({ roleId, guildId }) =>
    fetcher(`/v2/guilds/${guildId}/roles/${roleId}`)
  ) as Promise<Role>[]
  const guildRequests = contributions.map(({ guildId }) =>
    fetcher(`/v2/guilds/${guildId}`)
  ) as Promise<Guild>[]
  const rawContribution = await Promise.all([...roleRequests, ...guildRequests])
  const roles = rawContribution.slice(0, roleRequests.length) as Role[]
  const guilds = rawContribution.slice(roleRequests.length) as Guild[]

  return contributions.map((contribution) => {
    return {
      contribution,
      role: roles.find((role) => role.id === contribution.roleId)!,
      guild: guilds.find((guild) => guild.id === contribution.guildId)!,
    }
  })

  // return guilds.map((guild) => ({
  //   guild,
  //   roles: roles.filter((_, i) => contributions[i].guildId === guild.id),
  // }))
}

const contributionFetcher = async (url: string) => {
  const contributions = (await fetcher(url)) as Schemas["ProfileContribution"][]
  return parsedContributionFetcher(contributions)
}

// export type ParsedContribution = Awaited<
//   ReturnType<typeof parsedContributionFetcher>
// >[number]

export const useContribution = () => {
  const { data: profileData } = useProfile()
  // const {id: userId} = useUserPublic()
  // const {data: memberships} = useSWR<Membership>(`/v2/users/${userId}/memberships`, fetcher)
  // console.log(memberships)

  return useSWRImmutable<Schemas["ProfileContribution"][]>(
    profileData ? `/v2/profiles/${profileData.username}/contributions` : null,
    fetcher
  )
}
