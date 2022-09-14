import { HStack, Icon, Skeleton, Stack, Text, Wrap } from "@chakra-ui/react"
import Button from "components/common/Button"
import Card from "components/common/Card"
import useGuild from "components/[guild]/hooks/useGuild"
import useServerData from "hooks/useServerData"
import useToast from "hooks/useToast"
import { ArrowElbowDownRight, Play, Stop, Timer } from "phosphor-react"
import { useEffect, useState } from "react"
import { useCreatePoapContext } from "../../../CreatePoapContext"
import usePoapEventDetails from "../../../Requirements/components/VoiceParticipation/hooks/usePoapEventDetails"
import useVoiceChannels from "../../../Requirements/components/VoiceParticipation/hooks/useVoiceChannels"
import EligibleMembers from "./components/EligibleMembers"
import useManageEvent from "./hooks/useManageEvent"

const ManageEvent = (): JSX.Element => {
  const { id: guildId } = useGuild()
  const { discordServerId } = useCreatePoapContext()
  const { voiceChannels } = useVoiceChannels(discordServerId)
  const { poapEventDetails, mutatePoapEventDetails } = usePoapEventDetails()
  const { data: dcServerData } = useServerData(discordServerId)

  const voiceChannelName = voiceChannels?.find(
    (c) => c.id === poapEventDetails?.voiceChannelId
  )?.name

  const { onSubmit, isLoading, response } = useManageEvent()
  const toast = useToast()

  useEffect(() => {
    if (!response) return
    toast({
      status: "success",
      title: "Updated event!",
    })
    console.log("mutating data...")
    mutatePoapEventDetails()
  }, [response])

  const startTimeInMs = (poapEventDetails?.voiceEventStartedAt ?? 0) * 1000

  const [time, setTime] = useState(null)

  useEffect(() => {
    let interval

    if (startTimeInMs && !poapEventDetails?.voiceEventEndedAt) {
      interval = setInterval(() => {
        setTime(new Date(Date.now() - startTimeInMs).toISOString().slice(11, 19))
      }, 1000)
    } else {
      clearInterval(interval)
    }

    return () => {
      clearInterval(interval)
    }
  }, [startTimeInMs, poapEventDetails])

  const sumTime =
    poapEventDetails?.voiceEventStartedAt && poapEventDetails?.voiceEventEndedAt
      ? new Date(
          (poapEventDetails?.voiceEventEndedAt -
            poapEventDetails?.voiceEventStartedAt) *
            1000
        )
          .toISOString()
          .slice(11, 19)
      : undefined

  return (
    <Card px={6} py={7} maxW="sm">
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Skeleton as="span" isLoaded={!!dcServerData}>
            <Text
              as="span"
              fontFamily="display"
              fontWeight="bold"
              letterSpacing="wide"
              fontSize="xl"
            >
              {dcServerData?.serverName ?? discordServerId}
            </Text>
          </Skeleton>

          <Skeleton as="span" isLoaded={!!voiceChannelName}>
            <Icon as={ArrowElbowDownRight} color="gray" mr={1} />
            <Text
              as="span"
              fontFamily="display"
              fontWeight="bold"
              letterSpacing="wide"
              color="gray"
            >
              {`#${voiceChannelName ?? poapEventDetails?.voiceChannelId}`}
            </Text>
          </Skeleton>
        </Stack>

        <HStack>
          <Icon as={Timer} />
          <Text fontWeight="bold">{sumTime ?? time ?? "00:00:00"}</Text>
          <EligibleMembers />
        </HStack>

        <Wrap pt={2}>
          <Button
            size="sm"
            borderRadius="lg"
            leftIcon={
              !poapEventDetails?.voiceEventEndedAt && (
                <Icon as={startTimeInMs ? Stop : Play} />
              )
            }
            colorScheme={
              poapEventDetails?.voiceEventEndedAt
                ? "gray"
                : startTimeInMs
                ? "red"
                : "indigo"
            }
            onClick={() =>
              onSubmit({
                guildId,
                poapId: poapEventDetails?.poapIdentifier,
                action: startTimeInMs ? "STOP" : "START",
              })
            }
            isLoading={isLoading}
            isDisabled={poapEventDetails?.voiceEventEndedAt}
            loadingText="Please wait"
          >
            {poapEventDetails?.voiceEventEndedAt
              ? "Event ended"
              : startTimeInMs
              ? "Stop event"
              : "Start event"}
          </Button>

          {/* <Button
            size="sm"
            borderRadius="lg"
            leftIcon={<Icon as={ArrowsCounterClockwise} />}
            isDisabled={!!poapEventDetails?.voiceEventEndedAt}
          >
            Reset
          </Button> */}
        </Wrap>
      </Stack>
    </Card>
  )
}

export default ManageEvent
