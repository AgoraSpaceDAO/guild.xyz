import { Stack } from "@chakra-ui/react"
import useIsConnected from "hooks/useIsConnected"
import usePinata from "hooks/usePinata"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { GuildFormType } from "types"
import DynamicDevTool from "./DynamicDevTool"
import Pagination from "./Pagination"
import TelegramGroup from "./TelegramGroup"

const CreateGuildTelegram = (): JSX.Element => {
  const router = useRouter()
  const isConnected = useIsConnected("TELEGRAM")

  useEffect(() => {
    if (!isConnected) {
      router.push("/create-guild")
    }
  }, [isConnected])

  const methods = useFormContext<GuildFormType>()

  const guildPlatformId = useWatch({
    control: methods.control,
    name: "guildPlatforms.0.platformGuildId",
  })

  const { onUpload } = usePinata({
    // TODO: display an upload indicator somewhere
    onSuccess: ({ IpfsHash }) => {
      methods.setValue(
        "imageUrl",
        `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${IpfsHash}`
      )
    },
  })

  return (
    <>
      <Stack spacing={10}>
        {/* TODO: generalize the TelegramGroup component + rename it to TelegramGuildSetup? */}
        <TelegramGroup
          onUpload={onUpload}
          fieldName="guildPlatforms.0.platformGuildId"
        />

        <Pagination nextButtonDisabled={!guildPlatformId} />
      </Stack>
      <DynamicDevTool control={methods.control} />
    </>
  )
}

export default CreateGuildTelegram
