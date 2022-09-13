import { useCreatePoapContext } from "components/[guild]/CreatePoap/components/CreatePoapContext"
import { useState } from "react"
import useSWRImmutable from "swr/immutable"

type VoiceParticipant = {
  participationTime: number
  isEligible: boolean
  discordTag: string
}

const useVoiceParticipants = (): {
  voiceParticipants: VoiceParticipant[]
  isVoiceParticipantsLoading: boolean
  mutateVoiceParticipants: () => void
} => {
  const { poapData } = useCreatePoapContext()

  const [latestFetch, setLatestFetch] = useState(Date.now())

  const { data, isValidating, mutate } = useSWRImmutable(
    poapData?.id ? `/assets/poap/voiceParticipants/${poapData.id}` : null
  )

  return {
    voiceParticipants: data,
    isVoiceParticipantsLoading: isValidating,
    mutateVoiceParticipants: async () => {
      if (Date.now() - latestFetch <= 15000) return
      mutate()
      setLatestFetch(Date.now())
    },
  }
}

export default useVoiceParticipants
