import { CloseButton, useColorModeValue, useDisclosure } from "@chakra-ui/react"
import AvailabilitySetup from "components/[guild]/AddRewardButton/components/AvailabilitySetup"
import DynamicTag from "components/[guild]/RoleCard/components/DynamicReward/DynamicTag"
import { ContractCallFunction } from "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddContractCallPanel/components/CreateNftForm/hooks/useCreateNft"
import EditRolePlatformModal from "components/[guild]/RolePlatforms/components/EditRolePlatformModal"
import PlatformCard from "components/[guild]/RolePlatforms/components/PlatformCard"
import { RolePlatformProvider } from "components/[guild]/RolePlatforms/components/RolePlatformProvider"
import SetVisibility from "components/[guild]/SetVisibility"
import useVisibilityModalProps from "components/[guild]/SetVisibility/hooks/useVisibilityModalProps"
import useGuild from "components/[guild]/hooks/useGuild"
import Button from "components/common/Button"
import NftAvailabilityTags from "platforms/ContractCall/components/NftAvailabilityTags"
import rewards, { CAPACITY_TIME_PLATFORMS } from "platforms/rewards"
import { useFormContext } from "react-hook-form"
import {
  GuildPlatformWithOptionalId,
  PlatformName,
  PlatformType,
  RolePlatform,
} from "types"

type Props = {
  rolePlatform: RolePlatform
  remove: () => void
}

const NewRolePlatformCard = ({ rolePlatform, remove }: Props) => {
  const { guildPlatforms } = useGuild()
  const { setValue, watch } = useFormContext()

  const setVisibilityModalProps = useVisibilityModalProps()
  const removeButtonColor = useColorModeValue("gray.700", "gray.400")

  let guildPlatform: GuildPlatformWithOptionalId, type: PlatformName
  if (rolePlatform.guildPlatformId) {
    guildPlatform = guildPlatforms.find(
      (platform) => platform.id === rolePlatform.guildPlatformId
    )
    type = PlatformType[guildPlatform?.platformId] as PlatformName
  } else {
    guildPlatform = rolePlatform.guildPlatform
    type = guildPlatform?.platformName
  }

  const {
    isOpen: isEditOpen,
    onClose: onEditClose,
    onOpen: onEditOpen,
  } = useDisclosure()

  if (!type) return null

  const isLegacyContractCallReward =
    type === "CONTRACT_CALL" &&
    guildPlatform.platformGuildData.function ===
      ContractCallFunction.DEPRECATED_SIMPLE_CLAIM

  const { cardPropsHook: useCardProps, cardSettingsComponent } = rewards[type]

  const rolePlatformData = watch(`rolePlatforms.${rolePlatform.id}`)

  return (
    <RolePlatformProvider
      key={rolePlatform.id}
      rolePlatform={{
        ...rolePlatform,
        guildPlatform,
      }}
    >
      <PlatformCard
        usePlatformCardProps={useCardProps}
        guildPlatform={guildPlatform}
        titleRightElement={
          <SetVisibility
            defaultValues={{
              visibility: rolePlatform?.visibility,
              visibilityRoleId: rolePlatform?.visibilityRoleId,
            }}
            entityType="reward"
            onSave={({ visibility, visibilityRoleId }) => {
              setValue(`rolePlatforms.${rolePlatform.id}.visibility`, visibility, {
                shouldDirty: true,
              })
              setValue(
                `rolePlatforms.${rolePlatform.id}.visibilityRoleId`,
                visibilityRoleId,
                {
                  shouldDirty: true,
                }
              )
              setVisibilityModalProps.onClose()
            }}
            {...setVisibilityModalProps}
          />
        }
        cornerButton={
          <CloseButton
            size="sm"
            color={removeButtonColor}
            rounded="full"
            aria-label="Remove platform"
            zIndex="1"
            onClick={remove}
          />
        }
        actionRow={
          cardSettingsComponent && (
            <>
              <Button
                size="sm"
                onClick={onEditOpen}
                ml={{ base: 0, md: 3 }}
                mt={{ base: 5, md: 0 }}
              >
                Edit
              </Button>
              <EditRolePlatformModal
                SettingsComponent={cardSettingsComponent}
                rolePlatform={rolePlatform}
                isOpen={isEditOpen}
                onClose={onEditClose}
                onSubmit={(data) => {
                  setValue(`rolePlatforms.${rolePlatform.id}`, {
                    ...rolePlatformData,
                    ...data,
                  })
                  onEditClose()
                }}
              />
            </>
          )
        }
        contentRow={
          <>
            {CAPACITY_TIME_PLATFORMS.includes(type) || isLegacyContractCallReward ? (
              <AvailabilitySetup
                platformType={type}
                rolePlatform={rolePlatform}
                defaultValues={{
                  capacity: rolePlatform.capacity,
                  startTime: rolePlatform.startTime,
                  endTime: rolePlatform.endTime,
                }}
                onDone={({ capacity, startTime, endTime }) => {
                  setValue(`rolePlatforms.${rolePlatform.id}.capacity`, capacity, {
                    shouldDirty: true,
                  })
                  setValue(`rolePlatforms.${rolePlatform.id}.startTime`, startTime, {
                    shouldDirty: true,
                  })
                  setValue(`rolePlatforms.${rolePlatform.id}.endTime`, endTime, {
                    shouldDirty: true,
                  })
                }}
              />
            ) : type === "CONTRACT_CALL" ? (
              <NftAvailabilityTags
                guildPlatform={guildPlatform}
                rolePlatform={rolePlatform}
                mt={1}
              />
            ) : null}
            {!!rolePlatform.dynamicAmount && (
              <DynamicTag
                rolePlatform={
                  { ...rolePlatform, guildPlatform: guildPlatform } as RolePlatform
                }
                editDisabled
                mt={1}
              />
            )}
          </>
        }
      />
    </RolePlatformProvider>
  )
}

export default NewRolePlatformCard
