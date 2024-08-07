import { useToast } from "@/components/ui/hooks/useToast"
import { Schemas } from "@guildxyz/types"
import { SignedValidation, useSubmitWithSign } from "hooks/useSubmit"
import fetcher from "utils/fetcher"
import { useProfile } from "./useProfile"

export const useUpdateContribution = ({
  contributionId,
}: { contributionId: Schemas["ProfileContribution"]["id"] }) => {
  const { toast } = useToast()
  const { data: profile } = useProfile()

  const update = async (signedValidation: SignedValidation) => {
    return fetcher(
      `/v2/profiles/${(profile as Schemas["Profile"]).id}/contributions/${contributionId}`,
      {
        method: "PUT",
        ...signedValidation,
      }
    )
  }

  const submitWithSign = useSubmitWithSign<Schemas["Profile"]>(update, {
    onSuccess: (response) => {
      console.log("onSuccess", response)
      toast({
        variant: "success",
        title: "Successfully updated contributions",
      })
    },
    onError: (response) => {
      console.log("onError", response)
      toast({
        variant: "error",
        title: "Failed to update contributions",
        description: response.error,
      })
    },
  })
  return {
    ...submitWithSign,
    onSubmit: (payload: Schemas["ProfileContributionUpdate"]) =>
      profile && submitWithSign.onSubmit(payload),
  }
}
