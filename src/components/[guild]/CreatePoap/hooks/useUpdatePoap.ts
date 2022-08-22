import useShowErrorToast from "hooks/useShowErrorToast"
import useSubmit from "hooks/useSubmit"
import { CreatedPoapData } from "types"
import fetcher from "utils/fetcher"

const updatePoap = async (data: CreatedPoapData) =>
  fetcher(`/api/poap/fancyId`, {
    method: "PUT",
    body: data,
  })

const useUpdatePoap = () => {
  const showErrorToast = useShowErrorToast()

  return useSubmit<CreatedPoapData, string>(updatePoap, {
    onError: (error) => showErrorToast(error?.error?.message ?? error?.error),
  })
}

export default useUpdatePoap
