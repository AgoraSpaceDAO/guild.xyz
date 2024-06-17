import { GoogleLogo } from "phosphor-react"
import { PlatformAsRewardRestrictions, Rewards } from "platforms/types"
import useGoogleCardProps from "./useGoogleCardProps"
import GoogleCardSettings from "./GoogleCardSettings"
import GoogleCardMenu from "./GoogleCardMenu"
import GoogleCardWarning from "./GoogleCardWarning"
import dynamicComponents from "./DynamicComponents"

const results = {
  GOOGLE: {
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
    ...dynamicComponents,
  },
} as const satisfies Partial<Rewards>

export default results
