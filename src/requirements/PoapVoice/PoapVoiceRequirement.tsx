import { Icon } from "@chakra-ui/react"
import Withdraw from "components/[guild]/CreatePoap/components/PoapRoleCard/components/Withdraw"
import useGuild from "components/[guild]/hooks/useGuild"
import useGuildPermission from "components/[guild]/hooks/useGuildPermission"
import DataBlock from "components/[guild]/Requirements/components/DataBlock"
import Requirement, {
  RequirementProps,
} from "components/[guild]/Requirements/components/Requirement"
import { RequirementProvider } from "components/[guild]/Requirements/components/RequirementContext"
import { SpeakerSimpleHigh } from "phosphor-react"
import { GuildPoap, PlatformType, RequirementType } from "types"
import usePoapEventDetails from "./hooks/usePoapEventDetails"
import useVoiceChannels from "./hooks/useVoiceChannels"

type Props = { guildPoap: GuildPoap } & RequirementProps

const PoapPaymentRequirement = ({ guildPoap, ...props }: Props) => {
  const { isAdmin } = useGuildPermission()
  const { guildPlatforms } = useGuild()
  // TODO: only works if there's only one Discord reward in the guild
  const discordGuildPlatform = guildPlatforms?.find(
    (platform) => platform.platformId === PlatformType.DISCORD
  )
  const { voiceChannels, isVoiceChannelsLoading } = useVoiceChannels(
    discordGuildPlatform.platformGuildId
  )
  const { poapEventDetails, isPoapEventDetailsLoading } = usePoapEventDetails(
    guildPoap?.poapIdentifier
  )
  const { voiceRequirement, voiceChannelId } = poapEventDetails ?? {}

  const requirement = {
    id: null,
    type: "VOICE" as RequirementType,
    chain: null,
    address: null,
    data: voiceRequirement,
    roleId: null,
    name: null,
    symbol: null,
    isNegated: null,
  }

  return (
    <RequirementProvider requirement={requirement}>
      <Requirement
        image={<Icon as={SpeakerSimpleHigh} boxSize={6} />}
        footer={isAdmin && <Withdraw poapId={guildPoap?.id} />}
        {...props}
      >
        {`Be in the `}
        <DataBlock isLoading={isPoapEventDetailsLoading || isVoiceChannelsLoading}>
          {voiceChannels?.find((voice) => voice.id === voiceChannelId)?.name ??
            voiceChannelId}
        </DataBlock>
        {` voice channel for at least ${
          voiceRequirement?.percent
            ? `${voiceRequirement?.percent}% of `
            : `${voiceRequirement?.minute} minutes during `
        } the event`}
      </Requirement>
    </RequirementProvider>
  )
}

export default PoapPaymentRequirement
