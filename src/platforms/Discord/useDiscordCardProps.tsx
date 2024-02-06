import { Icon, Text } from "@chakra-ui/react"
import { isAfterJoinAtom } from "components/[guild]/JoinModal/hooks/useMembershipUpdate"
import { useAtom } from "jotai"
import { Info } from "phosphor-react"
import { GuildPlatform, PlatformName } from "types"

const useDiscordCardProps = (guildPlatform: GuildPlatform) => {
  // const rolePlatform = useRolePlatform()
  // const { data } = useServerData(guildPlatform.platformGuildId, {
  //   swrOptions: {
  //     revalidateOnFocus: false,
  //   },
  // })

  /**
   * Temporary to show "You might need to wait a few minutes to get your roles" on
   * the Discord reward card after join until we implement queues generally
   */
  const [isAfterJoin] = useAtom(isAfterJoinAtom)

  const roleName = undefined
  // const roleName = useMemo(() => {
  //   if (!rolePlatform) return null
  //   if (!rolePlatform.platformRoleId) return "Create a new Discord role"
  //   const discordRole = data?.roles?.find(
  //     (role) => role.id === rolePlatform.platformRoleId
  //   )
  //   if (!discordRole) return "Deleted role"
  //   return `${discordRole.name} role`
  // }, [rolePlatform, data])

  return {
    type: "DISCORD" as PlatformName,
    // image: data?.serverIcon || "/default_discord_icon.png",
    // name: data?.serverName || "",
    image: "/default_discord_icon.png",
    name: guildPlatform.platformGuildName,
    info:
      roleName ??
      (isAfterJoin && (
        <Text>
          <Icon as={Info} display="inline-block" mr="0.5" mb="-2px" />
          You might need to wait a few minutes to get your roles
        </Text>
      )),
  }
}

export default useDiscordCardProps
