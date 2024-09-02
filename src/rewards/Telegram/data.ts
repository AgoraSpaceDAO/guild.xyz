import { TelegramLogo } from "@phosphor-icons/react"
import { PlatformAsRewardRestrictions, RewardData } from "rewards/types"

export const telegramData = {
  icon: TelegramLogo,
  imageUrl: "/platforms/telegram.png",
  name: "Telegram",
  colorScheme: "TELEGRAM",
  gatedEntity: "group",
  autoRewardSetup: false,
  isPlatform: true,
  asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
  requiredForRequirements: true,
} as const satisfies RewardData
