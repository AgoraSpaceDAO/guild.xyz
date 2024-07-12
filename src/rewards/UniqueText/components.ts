import dynamic from "next/dynamic"
import { Key } from "phosphor-react"
import TextCardButton from "rewards/SecretText/TextCardButton"
import LoadingRewardPreview from "rewards/components/LoadingRewardPreview"
import { PlatformAsRewardRestrictions, RewardData } from "rewards/types"
import UniqueTextCardMenu from "./UniqueTextCardMenu"
import useUniqueTextCardProps from "./useUniqueTextCardProps"

export default {
  cardPropsHook: useUniqueTextCardProps,
  cardButton: TextCardButton,
  cardMenuComponent: UniqueTextCardMenu,
  RewardPreview: dynamic(() => import("rewards/components/UniqueTextPreview"), {
    ssr: false,
    loading: LoadingRewardPreview,
  }),
  RoleCardComponent: dynamic(() => import("rewards/components/TextReward"), {
    ssr: false,
  }),
} satisfies RewardComponentsData
