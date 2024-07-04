import { PencilSimpleLine } from "@phosphor-icons/react"
import { PlatformAsRewardRestrictions, RewardData } from "rewards/types"

export default {
  icon: PencilSimpleLine,
  imageUrl: null,
  name: "Form",
  colorScheme: "primary",
  gatedEntity: "",
  autoRewardSetup: false,
  isPlatform: false,
  asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
} satisfies RewardData
