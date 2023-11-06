import {
  CloseButton,
  SimpleGrid,
  Spacer,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  Wrap,
} from "@chakra-ui/react"
import TransitioningPlatformIcons from "components/[guild]/RolePlatforms/components/TransitioningPlatformIcons"
import AddCard from "components/common/AddCard"
import Button from "components/common/Button"
import Section from "components/common/Section"
import { Plus } from "phosphor-react"
import platforms from "platforms/platforms"
import { useFormContext, useWatch } from "react-hook-form"
import { GuildPlatform, PlatformName, PlatformType } from "types"
import { AddRewardProvider, useAddRewardContext } from "../AddRewardContext"
import useGuild from "../hooks/useGuild"
import AddRoleRewardModal from "./components/AddRoleRewardModal"
import EditRolePlatformCapacityTimeButton from "./components/EditRolePlatformCapacityTimeButton"
import EditRolePlatformCapacityTimeModal from "./components/EditRolePlatformCapacityTimeModal"
import PlatformCard from "./components/PlatformCard"
import CapacityTimeTags from "./components/PlatformCard/components/CapacityTimeTags"
import RemovePlatformButton from "./components/RemovePlatformButton"
import { RolePlatformProvider } from "./components/RolePlatformProvider"

type Props = {
  roleId?: number
}

const RolePlatforms = ({ roleId }: Props) => {
  const { guildPlatforms } = useGuild()
  const { setValue } = useFormContext()

  const { onOpen } = useAddRewardContext()

  /**
   * Using fields like this with useWatch because the one from useFieldArray is not
   * reactive to the append triggered in the add platform button
   */
  const fields = useWatch({ name: "rolePlatforms" })

  const removeButtonColor = useColorModeValue("gray.700", "gray.400")
  const rewardsLabel = useBreakpointValue({
    sm: "/ platform accesses",
  })

  const {
    isOpen: isCapacityTimeOpen,
    onOpen: onCapacityTimeOpen,
    onClose: onCapacityTimeClose,
  } = useDisclosure()

  return (
    <Section
      title="Rewards"
      titleRightElement={
        <>
          <Text as="span" fontSize="sm" colorScheme={"gray"}>
            {rewardsLabel}
          </Text>
          <Spacer />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Plus />}
            rightIcon={<TransitioningPlatformIcons boxSize="4" />}
            onClick={onOpen}
          >
            Add reward
          </Button>
        </>
      }
    >
      <SimpleGrid spacing={{ base: 3 }}>
        {!fields || fields?.length <= 0 ? (
          <AddCard title="Add reward" onClick={onOpen} />
        ) : (
          fields.map((rolePlatform: any, index) => {
            let guildPlatform: GuildPlatform, type
            if (rolePlatform.guildPlatformId) {
              guildPlatform = guildPlatforms.find(
                (platform) => platform.id === rolePlatform.guildPlatformId
              )
              type = PlatformType[guildPlatform?.platformId]
            } else {
              guildPlatform = rolePlatform.guildPlatform
              type = guildPlatform?.platformName
            }

            if (!type) return null

            const showCapacityTimeTags =
              (typeof rolePlatform.capacity === "number" &&
                typeof rolePlatform.claimedCapacity === "number") ||
              !!rolePlatform.startTime ||
              !!rolePlatform.endTime

            const { cardPropsHook: useCardProps, cardSettingsComponent } =
              platforms[type]

            let PlatformCardSettings = cardSettingsComponent
            // only show Google access level settings and Discord role settings for new platforms
            if (!rolePlatform.isNew) PlatformCardSettings = null

            return (
              <RolePlatformProvider
                key={JSON.stringify(rolePlatform)}
                rolePlatform={{
                  ...rolePlatform,
                  roleId,
                  guildPlatform,
                  index,
                }}
              >
                <PlatformCard
                  usePlatformProps={useCardProps}
                  guildPlatform={guildPlatform}
                  cornerButton={
                    !rolePlatform.isNew ? (
                      <RemovePlatformButton
                        removeButtonColor={removeButtonColor}
                        guildPlatform={guildPlatform}
                      />
                    ) : (
                      <CloseButton
                        size="sm"
                        color={removeButtonColor}
                        rounded="full"
                        aria-label="Remove platform"
                        zIndex="1"
                        onClick={() => {
                          setValue(
                            `rolePlatforms`,
                            fields.filter((_, i) => i !== index)
                          )
                        }}
                      />
                    )
                  }
                  actionRow={PlatformCardSettings && <PlatformCardSettings />}
                  contentRow={
                    <Wrap>
                      {showCapacityTimeTags && (
                        <CapacityTimeTags rolePlatform={rolePlatform} />
                      )}

                      <EditRolePlatformCapacityTimeButton
                        onClick={onCapacityTimeOpen}
                        isCompact={showCapacityTimeTags}
                      />

                      <EditRolePlatformCapacityTimeModal
                        isOpen={isCapacityTimeOpen}
                        onClose={onCapacityTimeClose}
                        platformType={
                          PlatformType[guildPlatform.platformId] as PlatformName
                        }
                        defaultValues={{
                          capacity: rolePlatform.capacity,
                          startTime: rolePlatform.startTime,
                          endTime: rolePlatform.endTime,
                        }}
                        onDone={({ capacity, startTime, endTime }) => {
                          setValue(`rolePlatforms.${index}.capacity`, capacity, {
                            shouldDirty: true,
                          })
                          setValue(`rolePlatforms.${index}.startTime`, startTime, {
                            shouldDirty: true,
                          })
                          setValue(`rolePlatforms.${index}.endTime`, endTime, {
                            shouldDirty: true,
                          })
                        }}
                      />
                    </Wrap>
                  }
                />
              </RolePlatformProvider>
            )
          })
        )}
      </SimpleGrid>

      <AddRoleRewardModal />
    </Section>
  )
}

const RolePlatformsWrapper = (props: Props): JSX.Element => (
  <AddRewardProvider>
    <RolePlatforms {...props} />
  </AddRewardProvider>
)

export default RolePlatformsWrapper
