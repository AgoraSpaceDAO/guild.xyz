import PlatformCard from "components/[guild]/RolePlatforms/components/PlatformCard"
import useGuild from "components/[guild]/hooks/useGuild"
import useGuildPermission from "components/[guild]/hooks/useGuildPermission"
import rewards from "rewards"
import { cardPropsHooks } from "rewards/cardPropsHooks"
import rewardComponents from "rewards/components"
import { GuildPlatform, PlatformName, PlatformType } from "types"
import PlatformAccessButton from "./PlatformAccessButton"

const AccessedGuildPlatformCard = ({ platform }: { platform: GuildPlatform }) => {
  const { isDetailed } = useGuild()
  const { isAdmin } = useGuildPermission()

  if (!rewards[PlatformType[platform.platformId]]) return null

  const {
    // cardPropsHook: useCardProps,
    cardMenuComponent: PlatformCardMenu,
    cardWarningComponent: PlatformCardWarning,
    cardButton: PlatformCardButton,
  } = rewardComponents[PlatformType[platform.platformId] as PlatformName]
  const useCardProps = cardPropsHooks[PlatformType[platform.platformId]]

  return (
    <PlatformCard
      usePlatformCardProps={useCardProps}
      guildPlatform={platform}
      cornerButton={
        isAdmin && isDetailed && PlatformCardMenu ? (
          <PlatformCardMenu platformGuildId={platform.platformGuildId} />
        ) : PlatformCardWarning ? (
          <PlatformCardWarning guildPlatform={platform} />
        ) : null
      }
      h="full"
      p={4}
    >
      {PlatformCardButton ? (
        <PlatformCardButton platform={platform} />
      ) : (
        <PlatformAccessButton platform={platform} />
      )}
    </PlatformCard>
  )
}
export default AccessedGuildPlatformCard
