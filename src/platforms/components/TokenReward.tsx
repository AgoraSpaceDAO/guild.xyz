import { Spinner } from "@chakra-ui/react"
import {
  RewardDisplay,
  RewardIcon,
  RewardProps,
} from "components/[guild]/RoleCard/components/Reward"
import { calculateFromDynamicAmount } from "platforms/Token/TokenRewardCard"
import {
  TokenRewardProvider,
  useTokenRewardContext,
} from "platforms/Token/TokenRewardContext"
import { RolePlatform } from "types"

const TokenReward = ({ platform }: { platform: RolePlatform }) => {
  const { isTokenLoading, token, rewardImageUrl } = useTokenRewardContext()
  const claimableAmount = calculateFromDynamicAmount(platform.dynamicAmount)

  return (
    <RewardDisplay
      icon={
        isTokenLoading ? (
          <Spinner boxSize={6} />
        ) : (
          <RewardIcon
            rolePlatformId={platform.id}
            guildPlatform={platform?.guildPlatform}
            owerwriteImg={rewardImageUrl}
          />
        )
      }
      label={`Claim: ${claimableAmount || ""} ${token?.symbol || "tokens"}`}
    />
  )
}

const TokenRewardWrapper = ({ platform }: RewardProps) => {
  return (
    <TokenRewardProvider
      tokenReward={{
        chain: platform?.guildPlatform?.platformGuildData?.chain,
        address: platform?.guildPlatform?.platformGuildData?.contractAddress,
        rewardsByRoles: [
          {
            rewards: [
              { rolePlatform: platform, guildPlatform: platform?.guildPlatform },
            ],
          },
        ],
      }}
    >
      <TokenReward platform={platform} />
    </TokenRewardProvider>
  )
}

export default TokenRewardWrapper
