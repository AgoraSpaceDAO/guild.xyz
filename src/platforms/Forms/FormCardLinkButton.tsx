import useGuild from "components/[guild]/hooks/useGuild"
import { useGuildForm } from "components/[guild]/hooks/useGuildForms"
import LinkButton from "components/common/LinkButton"
import { Check } from "phosphor-react"
import platforms from "platforms/platforms"
import { GuildPlatform } from "types"
import useUserSubmission from "./hooks/useUserSubmission"

type Props = {
  platform: GuildPlatform
}

const FormCardLinkButton = ({ platform }: Props) => {
  const { urlName } = useGuild()
  const { form, isValidating: isFormsValidating } = useGuildForm(
    platform.platformGuildData?.formId
  )

  const { data: userSubmission, isValidating } = useUserSubmission(form)

  return (
    <LinkButton
      isDisabled={!form || !!userSubmission}
      isLoading={isFormsValidating || isValidating}
      prefetch={false}
      href={!!form && !userSubmission ? `/${urlName}/forms/${form?.id}` : "#"}
      w="full"
      colorScheme={platforms.FORM.colorScheme}
      leftIcon={userSubmission && <Check />}
    >
      {userSubmission ? "Already submitted" : "Fill form"}
    </LinkButton>
  )
}
export default FormCardLinkButton
