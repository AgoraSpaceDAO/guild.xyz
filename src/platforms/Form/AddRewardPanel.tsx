import dynamic from "next/dynamic"
import { AddRewardPanelLoadingSpinner } from "platforms/components/AddRewardPanelLoadingSpinner"

export const AddRewardPanel = dynamic(
  () =>
    import(
      "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddFormPanel"
    ),
  {
    ssr: false,
    loading: AddRewardPanelLoadingSpinner,
  }
)
