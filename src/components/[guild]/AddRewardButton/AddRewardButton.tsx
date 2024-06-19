import { ModalOverlay, useDisclosure } from "@chakra-ui/react"
import Button from "components/common/Button"
import DiscardAlert from "components/common/DiscardAlert"
import { Modal } from "components/common/Modal"
import useShowErrorToast from "hooks/useShowErrorToast"
import { atom, useAtomValue } from "jotai"
import { Plus } from "phosphor-react"
import rewards, { modalSizeForPlatform } from "platforms/rewards"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { Requirement, RoleFormType, Visibility } from "types"
import { AddRewardProvider, useAddRewardContext } from "../AddRewardContext"
import { ClientStateRequirementHandlerProvider } from "../RequirementHandlerContext"
import SelectRewardPanel from "../RolePlatforms/components/AddRoleRewardModal/SelectRewardPanel"
import { useIsTabsStuck } from "../Tabs"
import { useThemeContext } from "../ThemeContext"
import SelectRolePanel from "./SelectRolePanel"
import { useAddRewardDiscardAlert } from "./hooks/useAddRewardDiscardAlert"

export type AddRewardForm = {
  // TODO: we could simplify the form - we don't need a rolePlatforms array here, we only need one rolePlatform
  rolePlatforms: RoleFormType["rolePlatforms"][number][]
  // TODO: use proper types, e.g. name & symbol shouldn't be required on this type
  requirements?: Omit<Requirement, "id" | "roleId" | "name" | "symbol">[]
  roleIds?: number[]
  visibility: Visibility
  roleName?: string // Name for role, if new role is created with reward
}

export const defaultValues: AddRewardForm = {
  rolePlatforms: [],
  requirements: [{ type: "FREE" }],
  roleIds: [],
  visibility: Visibility.PUBLIC,
}

export const canCloseAddRewardModalAtom = atom(true)

const AddRewardButton = (): JSX.Element => {
  const [isAddRewardPanelDirty, setIsAddRewardPanelDirty] =
    useAddRewardDiscardAlert()
  const {
    isOpen: isDiscardAlertOpen,
    onOpen: onDiscardAlertOpen,
    onClose: onDiscardAlertClose,
  } = useDisclosure()

  const canClose = useAtomValue(canCloseAddRewardModalAtom)

  const {
    selection,
    step,
    setStep,
    isOpen,
    onOpen,
    onClose: onAddRewardModalClose,
  } = useAddRewardContext()

  const methods = useForm<AddRewardForm>({
    defaultValues,
  })

  const visibility = useWatch({ name: "visibility", control: methods.control })

  const { isStuck } = useIsTabsStuck()
  const { textColor, buttonColorScheme } = useThemeContext()

  const { AddRewardPanel } = rewards[selection] ?? {}
  const showErrorToast = useShowErrorToast()

  const isRewardSetupStep = selection && step !== "HOME" && step !== "SELECT_ROLE"

  const handleClose = () => {
    if (!canClose) {
      showErrorToast("You can't close the modal until the transaction finishes")
      return
    }
    if (isAddRewardPanelDirty) onDiscardAlertOpen()
    else {
      methods.reset(defaultValues)
      onAddRewardModalClose()
    }
  }

  const closeAndClear = () => {
    methods.reset(defaultValues)
    onAddRewardModalClose()
    setIsAddRewardPanelDirty(false)
  }

  return (
    <>
      <Button
        data-test="add-reward-button"
        leftIcon={<Plus />}
        onClick={onOpen}
        variant="ghost"
        size="sm"
        {...(!isStuck && {
          color: textColor,
          colorScheme: buttonColorScheme,
        })}
      >
        Add reward
      </Button>

      <FormProvider {...methods}>
        <Modal
          isOpen={isOpen}
          onClose={handleClose}
          size={
            step === "SELECT_ROLE"
              ? "2xl"
              : isRewardSetupStep
              ? modalSizeForPlatform(selection)
              : "4xl"
          }
          scrollBehavior="inside"
          colorScheme="dark"
        >
          <ModalOverlay />

          <ClientStateRequirementHandlerProvider methods={methods}>
            {step === "HOME" && <SelectRewardPanel />}

            {isRewardSetupStep && (
              <AddRewardPanel
                onAdd={(createdRolePlatform) => {
                  const {
                    roleName = null,
                    requirements = null,
                    ...rest
                  } = createdRolePlatform
                  methods.setValue("rolePlatforms.0", {
                    ...rest,
                    visibility,
                  })
                  if (roleName) methods.setValue("roleName", roleName)
                  if (requirements?.length > 0) {
                    methods.setValue("requirements", requirements)
                  }
                  setStep("SELECT_ROLE")
                }}
                skipSettings
              />
            )}

            {step === "SELECT_ROLE" && <SelectRolePanel onSuccess={closeAndClear} />}
          </ClientStateRequirementHandlerProvider>
        </Modal>
      </FormProvider>
      <DiscardAlert
        isOpen={isDiscardAlertOpen}
        onClose={onDiscardAlertClose}
        onDiscard={() => {
          onAddRewardModalClose()
          onDiscardAlertClose()
          setIsAddRewardPanelDirty(false)
        }}
      />
    </>
  )
}

const AddRewardButtonWrapper = (): JSX.Element => (
  <AddRewardProvider>
    <AddRewardButton />
  </AddRewardProvider>
)

export default AddRewardButtonWrapper
