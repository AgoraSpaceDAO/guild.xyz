import { useToast } from "@/components/ui/hooks/useToast"
import { Schemas } from "@guildxyz/types"
import { SignedValidation, useSubmitWithSign } from "hooks/useSubmit"
import fetcher from "utils/fetcher"
import { revalidateContribution } from "../_server_actions/revalidateContribution"
import { useContributions } from "./useContributions"
import { useProfile } from "./useProfile"

export const useCreateContribution = () => {
  const { toast } = useToast()
  const { data: profile } = useProfile()
  const contributions = useContributions()

  const update = async (signedValidation: SignedValidation) => {
    return fetcher(
      `/v2/profiles/${(profile as Schemas["Profile"]).username}/contributions`,
      {
        method: "POST",
        ...signedValidation,
      }
    )
  }

  const submitWithSign = useSubmitWithSign<Schemas["Contribution"]>(update, {
    onOptimistic: (response, payload) => {
      if (!profile?.userId) return
      contributions.mutate(
        async () => {
          if (!contributions.data) return
          const contribution = await response
          contributions.data[
            contributions.data.findLastIndex(({ id }) => id === -1)
          ] = contribution
          return contributions.data.filter(({ id }) => id !== -1)
        },
        {
          revalidate: false,
          rollbackOnError: true,
          optimisticData: () => {
            // @ts-expect-error: incorrect types coming from lib
            const fakeContribution: Schemas["Contribution"] = {
              ...(payload as Schemas["ContributionUpdate"]),
              id: -1,
              profileId: profile.userId,
            }
            if (!contributions.data) return [fakeContribution]
            contributions.data.push(fakeContribution)
            return contributions.data
          },
        }
      )
    },
    onSuccess: () => {
      revalidateContribution()
    },
    onError: (response) => {
      toast({
        variant: "error",
        title: "Failed to create contribution",
        description: response.error,
      })
    },
  })
  return {
    ...submitWithSign,
    onSubmit: (payload: Schemas["ContributionUpdate"]) =>
      profile && submitWithSign.onSubmit(payload),
  }
}
