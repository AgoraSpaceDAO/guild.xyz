import {
  HStack,
  IconButton,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react"
import { usePostHogContext } from "components/_app/PostHogProvider"
import Button from "components/common/Button"
import { ArrowLeft, Info } from "phosphor-react"
import SelectRoleOrSetRequirements from "platforms/components/SelectRoleOrSetRequirements"
import useSubmitEverything, {
  SubmitData,
} from "platforms/components/useSubmitEverything"
import rewards, { CAPACITY_TIME_PLATFORMS } from "platforms/rewards"
import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Visibility } from "types"
import { RoleTypeToAddTo, useAddRewardContext } from "../AddRewardContext"
import useGuild from "../hooks/useGuild"
import { defaultValues } from "./AddRewardButton"
import AvailabilitySetup from "./components/AvailabilitySetup"
import useSubmitAddReward from "./hooks/useSubmitAddReward"

const SelectRolePanel = ({
  onSuccess,
}: {
  onSuccess?: Parameters<typeof useSubmitAddReward>[0]["onSuccess"]
}) => {
  const { modalRef, selection, activeTab, setStep, isBackButtonDisabled } =
    useAddRewardContext()

  const { urlName } = useGuild()
  const { captureEvent } = usePostHogContext()

  const lightModalBgColor = useColorModeValue("white", "gray.700")

  const methods = useFormContext()
  const rolePlatform = methods.getValues("rolePlatforms.0")

  const requirements = useWatch({ name: "requirements", control: methods.control })
  const roleIds = useWatch({ name: "roleIds", control: methods.control })

  const postHogOptions = {
    guild: urlName,
    type: activeTab,
    requirements: requirements,
    roleIds: roleIds,
  }

  // const { onSubmit, isLoading } = useSubmitAddReward({
  //   onSuccess: (res) => {
  //     captureEvent("reward created (AddRewardButton)", postHogOptions)
  //     onSuccess?.(res)
  //   },
  // })

  const { onSubmit, isLoading } = useSubmitEverything({
    onSuccess: () => {},
  })

  const [saveAsDraft, setSaveAsDraft] = useState(false)

  const isRoleSelectorDisabled = selection === "ERC20"
  const isAddRewardButtonDisabled =
    activeTab === RoleTypeToAddTo.NEW_ROLE || isRoleSelectorDisabled
      ? !requirements?.length
      : !roleIds?.length

  const { RewardPreview } = rewards[selection] ?? {}

  const goBack = () => {
    if (!rewards[selection].autoRewardSetup) methods.reset(defaultValues)
    setStep("REWARD_SETUP")
  }

  const changeDataToDraft = (data: SubmitData): SubmitData => {
    const { rolePlatforms, requirements, roleIds = [], ...role } = data
    const hiddenRolePlatforms = rolePlatforms.map((rp) => ({
      ...rp,
      visibility: Visibility.HIDDEN,
    }))
    const hiddenRequirements = requirements.map((req) =>
      req.type === "FREE" ? req : { ...req, visibility: Visibility.HIDDEN }
    )

    let roleToCreate = role
    if (roleIds.length === 0) {
      roleToCreate = { ...role, visibility: Visibility.HIDDEN }
    }

    return {
      ...roleToCreate,
      rolePlatforms: hiddenRolePlatforms,
      requirements: hiddenRequirements,
      roleIds,
    }
  }

  return (
    <ModalContent>
      <ModalCloseButton />
      <ModalHeader bgColor={lightModalBgColor} boxShadow={"sm"} zIndex={1}>
        <Stack spacing={8}>
          <HStack>
            <IconButton
              isDisabled={isBackButtonDisabled}
              rounded="full"
              aria-label="Back"
              size="sm"
              mb="-3px"
              icon={<ArrowLeft size={20} />}
              variant="ghost"
              onClick={goBack}
            />
            <Text>{`Add ${rewards[selection]?.name} reward`}</Text>
          </HStack>

          <RewardPreview>
            {CAPACITY_TIME_PLATFORMS.includes(selection) && (
              <AvailabilitySetup
                platformType={rolePlatform?.guildPlatform?.platformName}
                rolePlatform={rolePlatform}
                defaultValues={{
                  /**
                   * If the user doesn't upload mint links for a POAP, we should
                   * fallback to undefined, since 0 is not a valid value here
                   */
                  capacity:
                    rolePlatform?.guildPlatform?.platformGuildData?.texts?.length ||
                    undefined,
                  /** POAPs have default startTime and endTime */
                  startTime: rolePlatform?.startTime,
                  endTime: rolePlatform?.endTime,
                }}
                onDone={({ capacity, startTime, endTime }) => {
                  methods.setValue(`rolePlatforms.0.capacity`, capacity)
                  methods.setValue(`rolePlatforms.0.startTime`, startTime)
                  methods.setValue(`rolePlatforms.0.endTime`, endTime)
                }}
              />
            )}
          </RewardPreview>
        </Stack>
      </ModalHeader>

      <ModalBody
        ref={modalRef}
        className="custom-scrollbar"
        display="flex"
        flexDir="column"
      >
        <SelectRoleOrSetRequirements
          selectedPlatform={selection}
          isRoleSelectorDisabled={isRoleSelectorDisabled}
        />
      </ModalBody>

      <ModalFooter pt="6" pb="8" gap={2}>
        <Button
          isDisabled={isAddRewardButtonDisabled}
          onClick={methods.handleSubmit((data) => {
            setSaveAsDraft(true)
            const draftData = changeDataToDraft(data as SubmitData)
            onSubmit(draftData)
          })}
          isLoading={saveAsDraft && isLoading}
          rightIcon={
            <Tooltip
              label={
                activeTab === RoleTypeToAddTo.EXISTING_ROLE
                  ? "The reward will be added to the role you select with hidden visibility, so users won't see it yet. You can edit & activate it later"
                  : "The role will be created with hidden visibility, so users won't see it yet. You can edit & activate it later"
              }
            >
              <Info />
            </Tooltip>
          }
        >
          Save as draft
        </Button>
        <Button
          isDisabled={isAddRewardButtonDisabled}
          colorScheme="green"
          onClick={methods.handleSubmit(onSubmit)}
          isLoading={!saveAsDraft && isLoading}
        >
          Save
        </Button>
      </ModalFooter>
    </ModalContent>
  )
}

export default SelectRolePanel
