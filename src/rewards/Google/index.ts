import { GoogleLogo } from "@phosphor-icons/react"
import dynamic from "next/dynamic"
import { AddRewardPanelLoadingSpinner } from "rewards/components/AddRewardPanelLoadingSpinner"
import LoadingRewardPreview from "rewards/components/LoadingRewardPreview"
import { PlatformAsRewardRestrictions, RewardData } from "rewards/types"
import GoogleCardMenu from "./GoogleCardMenu"
import GoogleCardSettings from "./GoogleCardSettings"
import GoogleCardWarning from "./GoogleCardWarning"
import useGoogleCardProps from "./useGoogleCardProps"

export default {
  icon: GoogleLogo,
  imageUrl: "/platforms/google.png",
  name: "Google Workspace",
  colorScheme: "blue",
  gatedEntity: "document",
  cardPropsHook: useGoogleCardProps,
  cardSettingsComponent: GoogleCardSettings,
  cardMenuComponent: GoogleCardMenu,
  cardWarningComponent: GoogleCardWarning,
  asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
  isPlatform: true,
  AddRewardPanel: dynamic(
    () =>
      import(
        "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddGooglePanel"
      ),
    {
      ssr: false,
      loading: AddRewardPanelLoadingSpinner,
    }
  ),
  RewardPreview: dynamic(() => import("rewards/components/GooglePreview"), {
    ssr: false,
    loading: LoadingRewardPreview,
  }),
} as const satisfies RewardData
