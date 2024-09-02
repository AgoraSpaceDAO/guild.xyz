import { PlatformAsRewardRestrictions, RewardData } from "rewards/types"
import XLogo from "static/icons/x.svg"

export const twitterV1Data = {
  icon: XLogo,
  name: "X",
  colorScheme: "TWITTER",
  gatedEntity: "account",
  autoRewardSetup: false,
  isPlatform: true,
  asRewardRestriction: PlatformAsRewardRestrictions.NOT_APPLICABLE,
  requiredForRequirements: true,
} as const satisfies RewardData

export const twitterData = {
  icon: XLogo,
  imageUrl: "/platforms/x.svg",
  name: "X",
  colorScheme: "TWITTER",
  gatedEntity: "account",
  autoRewardSetup: false,
  isPlatform: false,
  asRewardRestriction: PlatformAsRewardRestrictions.NOT_APPLICABLE,
  requiredForRequirements: true,
} as const satisfies RewardData
