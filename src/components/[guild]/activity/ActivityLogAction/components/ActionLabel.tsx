import { Stack, Text } from "@chakra-ui/react"
import platforms from "platforms/platforms"
import capitalize from "utils/capitalize"
import { useActivityLog } from "../../ActivityLogContext"
import { ACTION } from "../../constants"
import { useActivityLogActionContext } from "../ActivityLogActionContext"
import { ClickableRewardTag } from "./RewardTag"
import { ClickableRoleTag } from "./RoleTag"
import UserTag from "./UserTag"

const ActionLabel = (): JSX.Element => {
  const { data: activityLog } = useActivityLog()

  const { action, ids, data, parentId } = useActivityLogActionContext()

  const capitalizedName = capitalize(action)

  return (
    <Stack
      direction={{ base: "column", sm: "row" }}
      spacing={{ base: 1, sm: 2 }}
      fontWeight="semibold"
    >
      {(() => {
        switch (action) {
          case ACTION.UpdateGuild:
            return (
              <>
                <Text as="span">{capitalizedName} by </Text>
                <UserTag id={ids.user} />
              </>
            )
          case ACTION.AddAdmin:
          case ACTION.RemoveAdmin:
            return (
              <>
                <Text as="span">{capitalizedName}:</Text>
                {/* <UserTag /> TODO */}
              </>
            )
          case ACTION.CreateRole:
          case ACTION.UpdateRole:
          case ACTION.DeleteRole:
            return (
              <>
                <Text as="span">{capitalizedName}</Text>
                <ClickableRoleTag id={ids.role} guildId={ids.guild} />
                <Text as="span">by</Text>
                <UserTag id={ids.user} />
              </>
            )
          case ACTION.AddReward:
          case ACTION.RemoveReward:
          case ACTION.UpdateReward:
          case ACTION.SendReward:
          case ACTION.RevokeReward:
          case ACTION.LoseReward:
            return (
              <>
                <Text as="span">{capitalizedName}</Text>
                <ClickableRewardTag rolePlatformId={ids.rolePlatform} />
              </>
            )
          case ACTION.ClickJoinOnWeb:
            return (
              <>
                <Text as="span">Join Guild through website</Text>
                <UserTag id={ids.user} />
              </>
            )
          case ACTION.ClickJoinOnPlatform:
            return (
              <>
                <Text as="span">{`Join Guild through ${
                  platforms[data.platformName].name
                }`}</Text>
                <UserTag id={ids.user} />
              </>
            )
          case ACTION.GetRole:
          case ACTION.LoseRole:
            const parentaction = activityLog?.entries?.find(
              (log) => log.id === parentId
            )?.action
            const isChildOfUserStatusUpdate = [
              ACTION.UserStatusUpdate,
              ACTION.JoinGuild,
              ACTION.ClickJoinOnWeb,
              ACTION.ClickJoinOnPlatform,
              ACTION.LeaveGuild,
            ].includes(parentaction)

            return (
              <>
                <Text as="span">
                  {capitalizedName}
                  {isChildOfUserStatusUpdate ? ":" : ""}
                </Text>
                {isChildOfUserStatusUpdate ? (
                  <ClickableRoleTag id={ids.role} guildId={ids.guild} />
                ) : (
                  <UserTag id={ids.user} />
                )}
              </>
            )
          case ACTION.AddRequirement:
          case ACTION.UpdateRequirement:
          case ACTION.RemoveRequirement:
            return (
              <>
                <Text as="span">{capitalizedName} in role:</Text>
                <ClickableRoleTag id={ids.role} guildId={ids.guild} />
                <Text as="span">by</Text>
                <UserTag id={ids.user} />
              </>
            )

          // TODO:
          //   ConnectIdentity,
          //   DisconnectIdentity

          default:
            return (
              <>
                <Text as="span">{capitalizedName}</Text>
                {ids.role ? (
                  <ClickableRoleTag id={ids.role} guildId={ids.guild} />
                ) : ids.user ? (
                  <UserTag id={ids.user} />
                ) : null}
              </>
            )
        }
      })()}
    </Stack>
  )
}

export default ActionLabel
