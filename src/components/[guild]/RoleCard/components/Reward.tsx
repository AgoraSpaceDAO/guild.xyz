import { Circle, HStack, Icon, Img, Text, Tooltip } from "@chakra-ui/react"
import Button from "components/common/Button"
import usePlatformAccessButton from "components/[guild]/AccessHub/components/usePlatformAccessButton"
import useGuild from "components/[guild]/hooks/useGuild"
import useIsMember from "components/[guild]/hooks/useIsMember"
import { useOpenJoinModal } from "components/[guild]/JoinModal/JoinModalProvider"
import { ArrowSquareOut, LockSimple } from "phosphor-react"
import { PlatformType, RolePlatform } from "types"
import capitalize from "utils/capitalize"

type Props = {
  platform: RolePlatform
}

const getRewardLabel = (platform: RolePlatform) => {
  switch (platform.guildPlatform.platformId) {
    case PlatformType.DISCORD:
      return platform?.platformRoleData?.isGuarded
        ? "Guarded access to: "
        : "Role in: "

    case PlatformType.GOOGLE:
      return `${capitalize(platform.platformRoleData?.role ?? "reader")} access to: `

    default:
      return "Access to: "
  }
}

const Reward = ({ platform }: Props) => {
  const isMember = useIsMember()
  const openJoinModal = useOpenJoinModal()

  const { label, ...buttonProps } = usePlatformAccessButton(platform.guildPlatform)

  return (
    <HStack pt="3" spacing={0} alignItems={"flex-start"}>
      <Circle size={6} overflow="hidden">
        <Img
          src={`/platforms/${PlatformType[
            platform.guildPlatform?.platformId
          ]?.toLowerCase()}.png`}
          alt={platform.guildPlatform?.platformGuildName}
          boxSize={6}
        />
      </Circle>
      <Text pl="2" w="calc(100% - var(--chakra-sizes-6))">
        {getRewardLabel(platform)}
        <Tooltip
          label={
            isMember ? (
              label
            ) : (
              <>
                <Icon as={LockSimple} display="inline" mb="-2px" mr="1" />
                Join guild to get access
              </>
            )
          }
          hasArrow
        >
          <Button
            variant="link"
            rightIcon={<ArrowSquareOut />}
            {...(isMember ? buttonProps : { onClick: openJoinModal })}
            maxW="full"
          >
            {platform.guildPlatform?.platformGuildName ||
              platform.guildPlatform?.platformGuildId}
          </Button>
        </Tooltip>
      </Text>
    </HStack>
  )
}

const RewardWrapper = ({ platform }: Props) => {
  const { guildPlatforms } = useGuild()

  const guildPlatform = guildPlatforms?.find(
    (p) => p.id === platform.guildPlatformId
  )

  if (!guildPlatform) return null

  const platformWithGuildPlatform = { ...platform, guildPlatform }

  return <Reward platform={platformWithGuildPlatform} />
}

export default RewardWrapper
