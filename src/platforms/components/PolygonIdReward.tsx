import { Icon, Spinner, Tooltip, useDisclosure } from "@chakra-ui/react"
import { useOpenJoinModal } from "components/[guild]/JoinModal/JoinModalProvider"
import {
  RewardDisplay,
  RewardIcon,
  RewardProps,
} from "components/[guild]/RoleCard/components/Reward"
import useAccess from "components/[guild]/hooks/useAccess"
import useGuild from "components/[guild]/hooks/useGuild"
import useIsMember from "components/[guild]/hooks/useIsMember"
import Button from "components/common/Button"
import { ArrowSquareOut, LockSimple } from "phosphor-react"
import MintPolygonIDProof from "platforms/PolygonID/components/MintPolygonIDProof"
import useConnectedDID from "platforms/PolygonID/hooks/useConnectedDID"
import platforms from "platforms/platforms"
import { useMemo } from "react"
import { PlatformType } from "types"
import { useAccount } from "wagmi"

const PolygonIDReward = ({ platform, withMotionImg }: RewardProps) => {
  const { platformId } = platform.guildPlatform
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { roles } = useGuild()
  const role = roles.find((r) =>
    r.rolePlatforms.some((rp) => rp.guildPlatformId === platform.guildPlatformId)
  )

  const isMember = useIsMember()
  const { hasAccess, isValidating } = useAccess(role.id)
  const { isConnected } = useAccount()
  const openJoinModal = useOpenJoinModal()
  const { isLoading } = useConnectedDID()

  const state = useMemo(() => {
    if (isMember && hasAccess) {
      return {
        tooltipLabel: "Mint",
        buttonProps: { isDisabled: isLoading || isValidating },
      }
    }

    if (!isConnected || (!isMember && hasAccess))
      return {
        tooltipLabel: (
          <>
            <Icon as={LockSimple} display="inline" mb="-2px" mr="1" />
            Join guild to get access
          </>
        ),
        buttonProps: { onClick: openJoinModal },
      }
    return {
      tooltipLabel: "You don't satisfy the requirements to this role",
      buttonProps: { isDisabled: true },
    }
  }, [isMember, hasAccess, isConnected, platform])

  return (
    <>
      <RewardDisplay
        icon={
          <RewardIcon
            rolePlatformId={platform.id}
            guildPlatform={platform?.guildPlatform}
            withMotionImg={withMotionImg}
          />
        }
        label={
          <Tooltip label={state.tooltipLabel} hasArrow shouldWrapChildren>
            {`Mint: `}
            <Button
              variant="link"
              rightIcon={
                isLoading || isValidating ? (
                  <Spinner boxSize="1em" />
                ) : (
                  <ArrowSquareOut />
                )
              }
              iconSpacing="1"
              maxW="full"
              onClick={onOpen}
              {...state.buttonProps}
            >
              {platforms[PlatformType[platformId]].name} proofs
            </Button>
          </Tooltip>
        }
      />

      <MintPolygonIDProof isOpen={isOpen} onClose={onClose} />
    </>
  )
}
export default PolygonIDReward
