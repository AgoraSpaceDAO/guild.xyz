import { Tooltip } from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import useGuildPermission from "components/[guild]/hooks/useGuildPermission"
import Button from "components/common/Button"
import { useClaimedReward } from "hooks/useClaimedReward"
import Link from "next/link"
import { claimTextButtonTooltipLabel } from "platforms/SecretText/TextCardButton"
import platforms from "platforms/platforms"
import { GuildPlatform } from "types"
import {
  getRolePlatformStatus,
  getRolePlatformTimeframeInfo,
} from "utils/rolePlatformHelpers"

type Props = {
  platform: GuildPlatform
}

const PoapCardButton = ({ platform }: Props) => {
  const { urlName, roles } = useGuild()
  const { isAdmin } = useGuildPermission()

  const rolePlatform = roles
    ?.find((r) => r.rolePlatforms.some((rp) => rp.guildPlatformId === platform.id))
    ?.rolePlatforms?.find((rp) => rp.guildPlatformId === platform?.id)

  const { isAvailable: isButtonEnabled } = getRolePlatformTimeframeInfo(rolePlatform)
  const { claimed } = useClaimedReward(rolePlatform.id)

  const buttonLabel =
    !rolePlatform?.capacity && isAdmin
      ? "Upload mint links"
      : claimed
      ? "View POAP"
      : "Claim POAP"

  const buttonProps = {
    isDisabled: !isButtonEnabled && !claimed,
    w: "full",
    colorScheme: platforms.POAP.colorScheme,
  }

  return (
    <>
      <Tooltip
        isDisabled={isButtonEnabled}
        label={claimTextButtonTooltipLabel[getRolePlatformStatus(rolePlatform)]}
        hasArrow
        shouldWrapChildren
      >
        {!isButtonEnabled ? (
          <Button {...buttonProps}>{buttonLabel}</Button>
        ) : (
          <Button
            as={Link}
            href={`/${urlName}/claim-poap/${platform.platformGuildData.fancyId}`}
            {...buttonProps}
          >
            {buttonLabel}
          </Button>
        )}
      </Tooltip>
    </>
  )
}
export default PoapCardButton
