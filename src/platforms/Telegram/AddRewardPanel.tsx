import dynamic from 'next/dynamic'
import { AddRewardPanelLoadingSpinner } from 'rewards/components/AddRewardPanelLoadingSpinner'

export const AddRewardPanel = dynamic(
  () =>
    import(
      "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddTelegramPanel"
    ),
  {
    ssr: false,
    loading: AddRewardPanelLoadingSpinner,
  }
)
