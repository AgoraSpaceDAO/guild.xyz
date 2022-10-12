import { Text, ToastId, useColorModeValue } from "@chakra-ui/react"
import { useRumAction, useRumError } from "@datadog/rum-react-integration"
import { useWeb3React } from "@web3-react/core"
import Button from "components/common/Button"
import useJsConfetti from "components/create-guild/hooks/useJsConfetti"
import useGuild from "components/[guild]/hooks/useGuild"
import useMatchMutate from "hooks/useMatchMutate"
import useShowErrorToast from "hooks/useShowErrorToast"
import { useSubmitWithSign, WithValidation } from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { TwitterLogo } from "phosphor-react"
import { useRef } from "react"
import { useSWRConfig } from "swr"
import { Role } from "types"
import fetcher from "utils/fetcher"
import replacer from "utils/guildJsonReplacer"
import preprocessGatedChannels from "utils/preprocessGatedChannels"
import preprocessRequirements from "utils/preprocessRequirements"

type RoleOrGuild = Role & { guildId: number }

const useCreateRole = (mode: "SIMPLE" | "CONFETTI" = "CONFETTI") => {
  const addDatadogAction = useRumAction("trackingAppAction")
  const addDatadogError = useRumError()
  const toastIdRef = useRef<ToastId>()
  const { account } = useWeb3React()

  const { mutate } = useSWRConfig()
  const matchMutate = useMatchMutate()

  const toast = useToast()
  const showErrorToast = useShowErrorToast()
  const triggerConfetti = useJsConfetti()
  const { urlName, mutateGuild, guildPlatforms } = useGuild()
  const tweetButtonBackground = useColorModeValue("blackAlpha.100", undefined)

  const fetchData = async ({
    validation,
    data,
  }: WithValidation<RoleOrGuild>): Promise<RoleOrGuild> =>
    fetcher("/role", {
      validation,
      body: data,
    })

  const useSubmitResponse = useSubmitWithSign<any, RoleOrGuild>(fetchData, {
    onError: (error_) => {
      addDatadogError(`Role creation error`, { error: error_ }, "custom")
      showErrorToast(error_)
    },
    onSuccess: (response_) => {
      addDatadogAction(`Successful role creation`)

      if (mode === "CONFETTI") triggerConfetti()

      toastIdRef.current = toast({
        duration: 8000,
        title: "Role successfully created",
        description: (
          <>
            <Text>Let your guild know by sharing it on Twitter</Text>
            <Button
              as="a"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I've just added a new role to my guild. Check it out, maybe you have access 😉
guild.xyz/${urlName} @guildxyz`)}`}
              target="_blank"
              bg={tweetButtonBackground}
              leftIcon={<TwitterLogo weight="fill" />}
              size="sm"
              onClick={() => toast.close(toastIdRef.current)}
              mt={3}
              mb="1"
              borderRadius="lg"
            >
              Share
            </Button>
          </>
        ),
        status: "success",
      })

      mutateGuild()
      mutate(`/guild/access/${response_.guildId}/${account}`)

      matchMutate(/^\/guild\/address\//)
      matchMutate(/^\/guild\?order/)
    },
  })

  return {
    ...useSubmitResponse,
    onSubmit: (data) => {
      const guildifyRole = data?.requirements?.find((req) => !!req?.data?._guildify)

      if (guildifyRole) {
        const existingGuildPlatform = guildPlatforms?.find(
          (guildPlatform) =>
            guildPlatform.platformGuildId === guildifyRole?.data?.serverId
        )

        const rolePlatformToEdit = data.rolePlatforms.find(
          (rolePlatform) =>
            rolePlatform.isNew &&
            (rolePlatform.guildPlatform?.platformGuildId ===
              guildifyRole?.data?.serverId ||
              (!!existingGuildPlatform &&
                rolePlatform.guildPlatformId === existingGuildPlatform.id))
        )

        if (!!rolePlatformToEdit) {
          rolePlatformToEdit.platformRoleId = guildifyRole.data?.roleId ?? null
        }
      }

      data.requirements = preprocessRequirements(data?.requirements)

      data.rolePlatforms = data.rolePlatforms.map((rolePlatform) => {
        if (rolePlatform.platformRoleData?.gatedChannels)
          rolePlatform.platformRoleData.gatedChannels = preprocessGatedChannels(
            rolePlatform.platformRoleData.gatedChannels
          )
        return rolePlatform
      })

      delete data.roleType

      return useSubmitResponse.onSubmit(JSON.parse(JSON.stringify(data, replacer)))
    },
  }
}

export default useCreateRole
