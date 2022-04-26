import useGuild from "components/[guild]/hooks/useGuild"
import useMatchMutate from "hooks/useMatchMutate"
import useShowErrorToast from "hooks/useShowErrorToast"
import { useSubmitWithSign } from "hooks/useSubmit"
import { WithValidation } from "hooks/useSubmit/useSubmit"
import useToast from "hooks/useToast"
import { useRouter } from "next/router"
import fetcher from "utils/fetcher"

type Data = {
  deleteFromDiscord?: boolean
}

const useDeleteGuild = (beforeSuccess?: () => void) => {
  const matchMutate = useMatchMutate()
  const toast = useToast()
  const showErrorToast = useShowErrorToast()
  const router = useRouter()

  const guild = useGuild()

  const submit = async ({ validation, data }: WithValidation<Data>) =>
    fetcher(`/guild/${guild.id}`, {
      method: "DELETE",
      body: data,
      validation,
    })

  return useSubmitWithSign<Data, any>(submit, {
    onSuccess: () => {
      toast({
        title: `Guild deleted!`,
        description: "You're being redirected to the home page",
        status: "success",
      })

      matchMutate(/^\/guild\/address\//)
      matchMutate(/^\/guild\?order/)

      beforeSuccess?.()

      router.push("/")
    },
    onError: (error) => showErrorToast(error),
  })
}

export default useDeleteGuild
