import { useRumAction, useRumError } from "@datadog/rum-react-integration"
import useJsConfetti from "components/create-guild/hooks/useJsConfetti"
import useMatchMutate from "hooks/useMatchMutate"
import useShowErrorToast from "hooks/useShowErrorToast"
import { useSubmitWithSign, WithValidation } from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useRouter } from "next/router"
import { Guild, PlatformName } from "types"
import fetcher from "utils/fetcher"
import replacer from "utils/guildJsonReplacer"
import preprocessRequirements from "utils/preprocessRequirements"

type FormInputs = {
  platform?: PlatformName
  DISCORD?: { platformId?: string }
  TELEGRAM?: { platformId?: string }
  channelId?: string
}
type RoleOrGuild = Guild & FormInputs

const useCreateGuild = () => {
  const addDatadogAction = useRumAction("trackingAppAction")
  const addDatadogError = useRumError()
  const matchMutate = useMatchMutate()

  const toast = useToast()
  const showErrorToast = useShowErrorToast()
  const triggerConfetti = useJsConfetti()
  const router = useRouter()

  const fetchData = async ({
    validation,
    data,
  }: WithValidation<RoleOrGuild>): Promise<RoleOrGuild> =>
    fetcher("/guild", {
      validation,
      body: data,
    })

  const useSubmitResponse = useSubmitWithSign<any, RoleOrGuild>(fetchData, {
    onError: (error_) => {
      addDatadogError(`Guild creation error`, { error: error_ }, "custom")
      showErrorToast(error_)
    },
    onSuccess: (response_) => {
      addDatadogAction(`Successful guild creation`)
      triggerConfetti()

      toast({
        title: `Guild successfully created!`,
        description: "You're being redirected to it's page",
        status: "success",
      })
      router.push(`/${response_.urlName}`)

      matchMutate(/^\/guild\/address\//)
      matchMutate(/^\/guild\?order/)
    },
  })

  return {
    ...useSubmitResponse,
    onSubmit: (data_) => {
      const data = {
        ...data_,
        // Handling TG group ID with and without "-"
        platformId: data_[data_.platform]?.platformId,
        roles: [
          {
            imageUrl: data_.imageUrl,
            name: "Member",
            requirements: preprocessRequirements(data_?.requirements),
          },
        ],
      }

      return useSubmitResponse.onSubmit(JSON.parse(JSON.stringify(data, replacer)))
    },
  }
}

export default useCreateGuild
