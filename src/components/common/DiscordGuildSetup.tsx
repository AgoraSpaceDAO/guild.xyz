import { GridItem, HStack, SimpleGrid, Spinner, Text } from "@chakra-ui/react"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import ErrorAlert from "components/common/ErrorAlert"
import DCServerCard from "components/guard/setup/DCServerCard"
import ServerSetupCard from "components/guard/setup/ServerSetupCard"
import useGuild from "components/[guild]/hooks/useGuild"
import useDCAuth from "components/[guild]/RolesByPlatform/components/JoinButton/components/JoinModal/hooks/useDCAuth"
import { AnimatePresence } from "framer-motion"
import useUsersServers from "hooks/useUsersServers"
import { useEffect, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"

const DiscordGuildSetup = ({
  defaultValues,
  selectedServer,
  fieldName,
  children,
  rolePlatforms = undefined,
  onSubmit = undefined,
  allowCurrentGuildSelection = false,
}) => {
  const { reset, setValue } = useFormContext()

  const { authorization } = useDCAuth("guilds")

  const { servers, isValidating } = useUsersServers(authorization)

  const selectedServerOption = useMemo(
    () => servers?.find((server) => server.id === selectedServer),
    [selectedServer] // servers excluded on purpose
  )

  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (selectedServer)
      setTimeout(() => {
        setShowForm(true)
      }, 300)
    else setShowForm(false)
  }, [selectedServer])

  const resetForm = () => {
    reset(defaultValues)
    setValue(fieldName, null)
  }

  const guild = useGuild()

  const guildPlatformsOfRole = guild?.guildPlatforms?.filter((gp) =>
    rolePlatforms?.some((rp) => rp.guildPlatformId === gp.id)
  )

  useEffect(() => console.log(rolePlatforms), [rolePlatforms])

  if (((!servers || servers.length <= 0) && isValidating) || !authorization) {
    return (
      <HStack spacing="6" py="5">
        <Spinner size="md" />
        <Text fontSize="lg">Loading servers...</Text>
      </HStack>
    )
  }

  if (servers?.length <= 0) {
    return (
      <ErrorAlert label="Seem like you're not an admin of any Discord server yet" />
    )
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
      <AnimatePresence>
        {(selectedServerOption ? [selectedServerOption] : servers ?? [])
          .filter(
            guildPlatformsOfRole
              ? (serverData) =>
                  guildPlatformsOfRole?.every(
                    (gp) => gp.platformGuildId != serverData.id
                  )
              : () => true
          )
          .map((serverData) => (
            <CardMotionWrapper key={serverData.id}>
              <GridItem>
                <DCServerCard
                  allowCurrentGuildSelection={allowCurrentGuildSelection}
                  serverData={serverData}
                  onSelect={
                    selectedServer
                      ? undefined
                      : (newServerId) => setValue(fieldName, newServerId)
                  }
                  onCancel={
                    selectedServer !== serverData.id ? undefined : () => resetForm()
                  }
                />
              </GridItem>
            </CardMotionWrapper>
          ))}

        {showForm && (
          <GridItem colSpan={2}>
            <ServerSetupCard onSubmit={onSubmit}>{children}</ServerSetupCard>
          </GridItem>
        )}
      </AnimatePresence>
    </SimpleGrid>
  )
}

export default DiscordGuildSetup
