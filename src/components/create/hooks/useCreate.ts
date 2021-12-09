import { useWeb3React } from "@web3-react/core"
import replacer from "components/common/utils/guildJsonReplacer"
import useJsConfetti from "hooks/useJsConfetti"
import useShowErrorToast from "hooks/useShowErrorToast"
import { useSubmitWithSign } from "hooks/useSubmit"
import useToast from "hooks/useToast"
import useUploadImage from "hooks/useUploadImage"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import { Role } from "types"
import fetcher from "utils/fetcher"
import preprocessRequirements from "utils/preprocessRequirements"

const useCreate = () => {
  const { account } = useWeb3React()
  const { mutate } = useSWRConfig()
  const toast = useToast()
  const showErrorToast = useShowErrorToast()
  const triggerConfetti = useJsConfetti()
  const router = useRouter()
  const [data, setData] = useState<Role>()

  const fetchData = (data_: Role): Promise<Role> =>
    fetcher(`/role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        {
          ...data_,
          // Mapping requirements in order to properly send "interval-like" NFT attribute values to the API
          requirements: preprocessRequirements(data_?.requirements || []),
        },
        replacer
      ),
    })

  const { onSubmit, response, error, isLoading } = useSubmitWithSign<Role, Role>(
    fetchData,
    {
      onError: (error_) => showErrorToast(error_),
      onSuccess: (response_) => {
        triggerConfetti()
        if (router.query.guild) {
          toast({
            title: `Role successfully created!`,
            status: "success",
          })
          mutate(`/guild/urlName/${router.query.guild}`)
          router.push(`/${router.query.guild}`)
        } else {
          toast({
            title: `Guild successfully created!`,
            description: "You're being redirected to it's page",
            status: "success",
          })
          router.push(`/${response_.urlName}`)
        }
        // refetch guilds to include the new one / new role on the home page
        // the query will be the default one, which is ?order=member
        mutate(`/guild/${account}?order=members`)
        mutate(`/guild?order=members`)
      },
    }
  )

  const {
    onSubmit: onSubmitImage,
    response: imageResponse,
    error: imageError,
    isLoading: isImageLoading,
  } = useUploadImage()

  useEffect(() => {
    if (imageResponse?.publicUrl)
      onSubmit({
        ...data,
        imageUrl: imageResponse.publicUrl,
      })
  }, [imageResponse])

  return {
    onSubmit: (_data) => {
      if (_data.customImage?.length) {
        setData(_data)
        onSubmitImage(_data.customImage)
      } else onSubmit(_data)
    },
    error: error || imageError,
    isImageLoading,
    isLoading,
    response,
  }
}

export default useCreate
