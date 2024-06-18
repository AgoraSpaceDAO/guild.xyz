import { PlatformAsRewardRestrictions, Rewards } from "platforms/types"
import usePoapCardProps from "./usePoapCardProps"
import PoapCardButton from "./PoapCardButton"
import PoapCardMenu from "./PoapCardMenu"
import dynamicComponents from "./DynamicComponents"

const rewards = {
  POAP: {
    icon: null,
    imageUrl: "/platforms/poap.png",
    name: "POAP",
    colorScheme: "purple",
    gatedEntity: "POAP",
    cardPropsHook: usePoapCardProps,
    cardButton: PoapCardButton,
    cardMenuComponent: PoapCardMenu,
    asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
    ...dynamicComponents,
  },
} as const satisfies Partial<Rewards>

export default rewards
