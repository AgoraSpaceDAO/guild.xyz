import type { JoinJob } from "@guildxyz/types"
import { GUILD_PIN_MAINTENANCE } from "components/[guild]/Requirements/components/GuildCheckout/MintGuildPin/MintGuildPin"
import { useMintGuildPinContext } from "components/[guild]/Requirements/components/GuildCheckout/MintGuildPinContext"
import useGuild from "components/[guild]/hooks/useGuild"
import useUser from "components/[guild]/hooks/useUser"
import { usePostHogContext } from "components/_app/PostHogProvider"
import useMembership from "components/explorer/hooks/useMemberships"
import useSubmit from "hooks/useSubmit"
import { useToastWithButton, useToastWithTweetButton } from "hooks/useToast"
import { atom, useSetAtom } from "jotai"
import { useRouter } from "next/router"
import { CircleWavyCheck } from "phosphor-react"
import useSWRImmutable from "swr/immutable"
import { PlatformName } from "types"
import { useFetcherWithSign } from "utils/fetcher"
import mapAccessJobState, { groupBy } from "../utils/mapAccessJobState"

export const QUEUE_FEATURE_FLAG = "GUILD_QUEUES"

type PlatformResult = {
  platformId: number
  platformName: PlatformName
} & (
  | { success: true }
  | {
      success: false
      errorMsg: "Unknown Member"
      invite: string
    }
)

type Response = {
  success: boolean
  platformResults: PlatformResult[]
  accessedRoleIds: number[]
}

export type JoinData = {
  oauthData: any
}

/**
 * Temporary to show "You might need to wait a few minutes to get your roles" on the
 * Discord reward card after join until we implement queues generally
 */
export const isAfterJoinAtom = atom(false)

const useJoin = (
  onSuccess?: (response: Response) => void,
  onError?: (error?: any) => void,
  shouldShowSuccessToast = true
) => {
  const { captureEvent } = usePostHogContext()

  const guild = useGuild()
  const user = useUser()

  const hasFeatureFlag = guild?.featureFlags?.includes(QUEUE_FEATURE_FLAG)

  const posthogOptions = {
    guild: guild.urlName,
    version: hasFeatureFlag ? "v2" : "v1",
  }

  const toastWithTweetButton = useToastWithTweetButton()
  const toastWithButton = useToastWithButton()

  const { mutate } = useMembership()
  const setIsAfterJoin = useSetAtom(isAfterJoinAtom)

  const fetcherWithSign = useFetcherWithSign()

  const submit = async (data: {
    guildId: number
    shareSocials: boolean
    platforms: any[]
  }): Promise<Response | string> => {
    if (hasFeatureFlag) {
      const initialPollResult: JoinJob[] = await fetcherWithSign([
        `/v2/actions/join?${new URLSearchParams({
          guildId: `${guild?.id}`,
        }).toString()}`,
        { method: "GET" },
      ]).catch(() => null as JoinJob[])

      const jobAlreadyInProgress = initialPollResult?.find((job) => !job.done)

      if (jobAlreadyInProgress) {
        return jobAlreadyInProgress?.id
      }

      const { jobId } = await fetcherWithSign([
        `/v2/actions/join`,
        { method: "POST", body: { guildId: guild?.id } },
      ])
      return jobId
    }

    return fetcherWithSign([`/user/join`, { method: "POST", body: data }]).then(
      (body) => {
        if (body === "rejected") {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw "Something went wrong, join request rejected."
        }

        if (typeof body === "string") {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw body
        }

        return body
      }
    )
  }

  const mintGuildPinContext = useMintGuildPinContext()
  // Destructuring it separately, since we don't have a MintGuildPinContext on the POAP minting page
  const { onOpen } = mintGuildPinContext ?? {}
  const { pathname } = useRouter()

  const onJoinSuccess = (response: Response) => {
    // mutate user in case they connected new platforms during the join flow
    user?.mutate?.()

    // Mutate guild in case the user seed more entities after join due to visibilities
    guild.mutateGuild()

    onSuccess?.(response)

    if (!response.success) return

    setIsAfterJoin(true)

    if (!hasFeatureFlag) {
      mutate()
    }

    if (shouldShowSuccessToast) {
      if (
        pathname === "/[guild]" &&
        guild.featureFlags.includes("GUILD_CREDENTIAL") &&
        guild.guildPin?.isActive &&
        !GUILD_PIN_MAINTENANCE
      ) {
        toastWithButton({
          status: "success",
          title: "Successfully joined guild",
          description: "Let others know as well by minting it onchain",
          buttonProps: {
            leftIcon: <CircleWavyCheck weight="fill" />,
            children: "Mint Guild Pin",
            onClick: onOpen,
          },
        })
      } else {
        toastWithTweetButton({
          title: "Successfully joined guild",
          tweetText: `Just joined the ${guild.name} guild. Continuing my brave quest to explore all corners of web3!
        guild.xyz/${guild.urlName}`,
        })
      }
    }
  }

  const useSubmitResponse = useSubmit(submit, {
    onSuccess: hasFeatureFlag ? undefined : onJoinSuccess,
    onError: (error) => {
      captureEvent(`Guild join error`, { ...posthogOptions, error })
      onError?.(error)
    },
  })

  const getResponseByProgress = (progressRes) => ({
    success: progressRes.roleAccesses
      ? !!progressRes.roleAccesses?.some((role) => role.access === true)
      : undefined,
    accessedRoleIds: (progressRes.roleAccesses ?? [])
      .filter((roleAccess) => !!roleAccess?.access)
      .map(({ roleId }) => roleId),
    platformResults: [], // Not used
  })

  const shouldFetchProgress = hasFeatureFlag && !!useSubmitResponse?.response

  const progress = useSWRImmutable<JoinJob>(
    shouldFetchProgress
      ? `/v2/actions/join?${new URLSearchParams({
          guildId: `${guild?.id}`,
        }).toString()}`
      : null,

    (key) =>
      fetcherWithSign([key, { method: "GET" }]).then(
        (result: JoinJob[]) => result?.[0]
      ),
    {
      onSuccess: (res) => {
        const byRoleId = groupBy(res?.["children:access-check:jobs"] ?? [], "roleId")

        // Mutate membership data according to join status
        mutate(
          (prev) => ({
            guildId: prev?.guildId,
            isAdmin: prev?.isAdmin,
            joinedAt: prev?.joinedAt || res?.done ? new Date().toISOString() : null,
            roles: Object.entries(byRoleId).map(([roleIdStr, reqJobs]) => {
              const roleId = +roleIdStr
              return {
                access: res?.roleAccesses?.find(
                  (roleAccess) => roleAccess.roleId === +roleId
                )?.access,
                roleId,
                requirements: reqJobs?.map((reqJob) => ({
                  requirementId: reqJob.requirementId,
                  access: reqJob.access,
                  amount: reqJob.amount,
                  errorMsg: reqJob.userLevelErrors?.[0]?.msg,
                  errorType: reqJob.userLevelErrors?.[0]?.errorType,
                  subType: reqJob.userLevelErrors?.[0]?.subType,
                  lastCheckedAt: reqJob.done ? new Date() : null,
                })),
              }
            }),
          }),
          { revalidate: false }
        )

        if (!!res?.roleAccesses && res.roleAccesses.every((role) => !role.access)) {
          useSubmitResponse?.reset()
          return
        }

        if (res?.done) {
          // With the timeout the UI is a bit cleaner, when we transition multiple states during one poll
          setTimeout(() => {
            useSubmitResponse?.reset()
            onJoinSuccess(getResponseByProgress(res))
          }, 2000)
        }
      },
      /**
       * Needed to keep the response, even tough shouldFetchProgress gets set to
       * false because of reseting useSubmitResponse
       */
      keepPreviousData: true,
      refreshInterval:
        typeof useSubmitResponse?.response === "string" ? 500 : undefined,
    }
  )

  const noAccess = hasFeatureFlag
    ? progress?.data?.roleAccesses &&
      progress?.data?.roleAccesses?.every((role) => !role.access)
    : undefined

  const response = hasFeatureFlag
    ? (progress?.data?.done && !(progress?.data as any)?.failed) || noAccess
      ? getResponseByProgress(progress?.data)
      : undefined
    : (useSubmitResponse?.response as Response)

  const isLoading = hasFeatureFlag
    ? useSubmitResponse?.isLoading || !!useSubmitResponse?.response
    : useSubmitResponse?.isLoading

  const error = hasFeatureFlag
    ? (progress?.data as any)?.failedErrorMsg
    : useSubmitResponse?.error

  const joinProgress =
    hasFeatureFlag && (isLoading || noAccess)
      ? mapAccessJobState(progress?.data)
      : undefined

  return {
    response,
    isLoading,
    error,
    progress: hasFeatureFlag ? progress?.data : undefined,
    joinProgress,
    onSubmit: (data?) =>
      useSubmitResponse.onSubmit({
        guildId: guild?.id,
        shareSocials: data?.shareSocials,
        platforms:
          data &&
          Object.entries(data.platforms ?? {})
            .filter(([_, value]) => !!value)
            .map(([key, value]: any) => ({
              name: key,
              ...value,
            })),
      }),
    reset: () => {
      useSubmitResponse.reset()
      progress.mutate(undefined, { revalidate: false })
    },
  }
}

export default useJoin
