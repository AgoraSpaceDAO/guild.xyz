import { Circle, HStack, Icon, Img, Text, Tooltip } from "@chakra-ui/react"
import Button from "components/common/Button"
import usePlatformAccessButton from "components/[guild]/AccessHub/components/usePlatformAccessButton"
import useGuild from "components/[guild]/hooks/useGuild"
import useIsMember from "components/[guild]/hooks/useIsMember"
import { useOpenJoinModal } from "components/[guild]/JoinModal/JoinModalProvider"
import GoogleCardWarning from "components/[guild]/RolePlatforms/components/PlatformCard/components/useGoogleCardProps/GoogleCardWarning"
import { ArrowSquareOut, LockSimple } from "phosphor-react"
import { PlatformType, RolePlatform } from "types"
import capitalize from "utils/capitalize"

type Props = {
  roleMemberCount: number // Temporary workaround until we caN't fetch the full member list for every role
  platform: RolePlatform
}

const getRewardLabel = (platform: RolePlatform) => {
  switch (platform.guildPlatform.platformId) {
    case PlatformType.DISCORD:
      return "Role in: "

    case PlatformType.GOOGLE:
      return `${capitalize(platform.platformRoleData?.role ?? "reader")} access to: `

    default:
      return "Access to: "
  }
}

const Reward = ({ roleMemberCount, platform }: Props) => {
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
      <Text px="2" maxW="calc(100% - var(--chakra-sizes-12))">
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
            iconSpacing="1"
            {...(isMember ? buttonProps : { onClick: openJoinModal })}
            maxW="full"
          >
            {platform.guildPlatform?.platformGuildName ||
              platform.guildPlatform?.platformGuildId}
          </Button>
        </Tooltip>
      </Text>

      {platform.guildPlatform?.platformId === PlatformType.GOOGLE && (
        <GoogleCardWarning
          guildPlatform={platform.guildPlatform}
          roleMemberCount={roleMemberCount}
          size="sm"
        />
      )}
    </HStack>
  )
}

const RewardWrapper = ({ roleMemberCount, platform }: Props) => {
  const { guildPlatforms } = useGuild()

  const guildPlatform = guildPlatforms?.find(
    (p) => p.id === platform.guildPlatformId
  )

  if (!guildPlatform) return null

  const platformWithGuildPlatform = { ...platform, guildPlatform }

  return (
    <Reward platform={platformWithGuildPlatform} roleMemberCount={roleMemberCount} />
  )
}

export default RewardWrapper
