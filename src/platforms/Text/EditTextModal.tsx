import {
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { Modal } from "components/common/Modal"
import useEditGuildPlatform from "components/[guild]/AccessHub/hooks/useEditGuildPlatform"
import useToast from "hooks/useToast"
import { FormProvider, useForm } from "react-hook-form"
import { GuildPlatform, PlatformGuildData } from "types"
import TextDataForm, { TextRewardForm } from "./TextDataForm"

type Props = {
  isOpen: boolean
  onClose: () => void
  guildPlatformId: number
  platformGuildData: GuildPlatform["platformGuildData"]
}

const EditTextModal = ({
  isOpen,
  onClose,
  guildPlatformId,
  platformGuildData,
}: Props) => {
  const { name, image, text } = platformGuildData

  const methods = useForm<TextRewardForm>({
    mode: "all",
    defaultValues: {
      name,
      image,
      text,
    },
  })

  const toast = useToast()
  const { onSubmit, isLoading } = useEditGuildPlatform({
    guildPlatformId,
    onSuccess: () => {
      toast({
        status: "success",
        title: "Successfully updated reward",
      })
      onClose()
    },
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit text reward</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <FormProvider {...methods}>
            <TextDataForm
              isLoading={isLoading}
              onSubmit={(data) =>
                onSubmit({ platformGuildData: data as PlatformGuildData["TEXT"] })
              }
            />
          </FormProvider>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
export default EditTextModal
