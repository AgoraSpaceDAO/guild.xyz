import {
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import { Modal } from "components/common/Modal"
import { createContext, useContext, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import rewards from "rewards"
import { cardSettings } from "rewards/CardSettings"
import { PlatformType, RoleFormType, RolePlatform } from "types"
import { RolePlatformProvider } from "./RolePlatformProvider"

type Props = {
  rolePlatform: NonNullable<RoleFormType["rolePlatforms"]>[number]
  onSubmit: (data: Partial<RolePlatform>) => void
  onClose: () => void
  isOpen: boolean
}

const EditRolePlatformContext = createContext<{
  isSubmitDisabled: boolean
  setIsSubmitDisabled: (value: boolean) => void
}>(undefined)

export const useEditRolePlatformContext = () => useContext(EditRolePlatformContext)

/**
 * Role platforms with dynamic amount will return input as an array of objects, but we handle it as a single object on the frontend, so we map it to the correct format with this function.
 *
 * Context: LINEAR operation will always have only 1 input, so we decided we could handle it as an object instead of an array with 1 object in it.
 *
 * IMPORTANT: Once we start using other operation types for dynamic amount, we should only support arrays to avoid unnecessary complexity.
 */
const convertRolePlatformToEditForm = (
  rolePlatform: Props["rolePlatform"]
): Props["rolePlatform"] => {
  if (
    !rolePlatform.dynamicAmount?.operation.input ||
    !Array.isArray(rolePlatform.dynamicAmount?.operation.input)
  )
    return rolePlatform

  const mappedRolePlatform = {
    ...rolePlatform,
    dynamicAmount: {
      ...rolePlatform.dynamicAmount,
      operation: {
        ...rolePlatform.dynamicAmount.operation,
        input: rolePlatform.dynamicAmount.operation.input[0] as any,
      },
    },
  }

  return mappedRolePlatform
}

const EditRolePlatformModal = ({
  rolePlatform,
  onClose,
  isOpen,
  onSubmit,
}: Props) => {
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false)
  const methods = useForm({
    defaultValues: convertRolePlatformToEditForm(rolePlatform),
  })
  const modalContentRef = useRef()

  const rewardName =
    rolePlatform.guildPlatform?.platformGuildName ??
    rewards[PlatformType[rolePlatform.guildPlatform.platformId]].name

  const SettingsComponent =
    cardSettings[PlatformType[rolePlatform?.guildPlatform?.platformId]]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      colorScheme={"dark"}
      initialFocusRef={modalContentRef}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent ref={modalContentRef}>
        <ModalHeader>{`${rewardName} reward settings`}</ModalHeader>
        <ModalBody>
          <VStack spacing={8} alignItems="start">
            <FormProvider {...methods}>
              <EditRolePlatformContext.Provider
                value={{ isSubmitDisabled, setIsSubmitDisabled }}
              >
                <RolePlatformProvider rolePlatform={rolePlatform}>
                  <SettingsComponent />
                </RolePlatformProvider>
              </EditRolePlatformContext.Provider>
            </FormProvider>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="green"
            isDisabled={isSubmitDisabled}
            onClick={methods.handleSubmit(onSubmit)}
          >
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditRolePlatformModal
