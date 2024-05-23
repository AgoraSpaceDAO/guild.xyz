import { FormControl, FormHelperText, FormLabel, useDisclosure } from "@chakra-ui/react"
import { AddRewardProvider } from "components/[guild]/AddRewardContext"
import useGuild from "components/[guild]/hooks/useGuild"
import useGuildForms from "components/[guild]/hooks/useGuildForms"
import Button from "components/common/Button"
import ControlledSelect from "components/common/ControlledSelect"
import FormErrorMessage from "components/common/FormErrorMessage"
import { useController, useFormState } from "react-hook-form"
import { RequirementFormProps } from "requirements"
import { PlatformType, SelectOption } from "types"
import parseFromObject from "utils/parseFromObject"
import CreateFormModal from "./CreateFormModal"

const FormForm = ({ baseFieldPath }: RequirementFormProps) => {
  const { id, guildPlatforms, featureFlags } = useGuild()
  const formRewardIds =
    guildPlatforms
      ?.filter((gp) => gp.platformId === PlatformType.FORM)
      .map((gp) => gp.platformGuildData.formId) ?? []
  const { data: forms, isLoading } = useGuildForms()
  const { errors } = useFormState()

  useController({
    name: `${baseFieldPath}.data.guildId`,
    defaultValue: id,
  })

  const formOptions: SelectOption<number>[] =
    forms
      ?.filter((form) => formRewardIds.includes(form.id))
      .map((form) => ({
        label: form.name,
        value: form.id,
      })) ?? []

  const isDisabled = !featureFlags?.includes("FORMS")

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (<>
    <FormControl
      isInvalid={!!parseFromObject(errors, baseFieldPath)?.data?.id}
      isDisabled={isDisabled}
    >
      <FormLabel>Fill form:</FormLabel>
      <ControlledSelect
        name={`${baseFieldPath}.data.id`}
        isDisabled={!forms || isDisabled}
        isLoading={isLoading}
        options={formOptions}
      />
      <FormHelperText>
        {isDisabled
          ? "This feature is coming soon, it's not available in your guild yet"
          : "You can create new forms in the add reward menu"}
      </FormHelperText>
      <Button onClick={onOpen}>Create new</Button>
      <FormErrorMessage>
        {parseFromObject(errors, baseFieldPath)?.data?.id?.message}
      </FormErrorMessage>
    </FormControl>

    <AddRewardProvider>
    <CreateFormModal onClose={onClose}  isOpen={isOpen} />
    </AddRewardProvider>
    </>
  )
}
export default FormForm
