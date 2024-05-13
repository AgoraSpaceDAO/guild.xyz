import { useTransactionStatusContext } from "components/[guild]/Requirements/components/GuildCheckout/components/TransactionStatusContext"
import { ContractCallFunction } from "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddContractCallPanel/components/CreateNftForm/hooks/useCreateNft"
import useNftDetails from "components/[guild]/collect/hooks/useNftDetails"
import useGuild from "components/[guild]/hooks/useGuild"
import { usePostHogContext } from "components/_app/PostHogProvider"
import useShowErrorToast from "hooks/useShowErrorToast"
import useSubmit from "hooks/useSubmit"
import { useToastWithTweetButton } from "hooks/useToast"
import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import guildRewardNftAbi from "static/abis/guildRewardNft"
import legacyGuildRewardNftAbi from "static/abis/legacyGuildRewardNft"
import { useFetcherWithSign } from "utils/fetcher"
import processViemContractError from "utils/processViemContractError"
import { TransactionReceipt } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { Chains } from "wagmiConfig/chains"
import { CollectNftForm } from "../components/CollectNft/CollectNft"
import { useCollectNftContext } from "../components/CollectNftContext"
import useGuildFee from "./useGuildFee"
import useGuildRewardNftBalanceByUserId from "./useGuildRewardNftBalanceByUserId"
import useTopCollectors from "./useTopCollectors"

// address, userId, signedAt, signature (signedAt isn't used actually)
type LegacyClaimArgs = [`0x${string}`, number, number, `0x${string}`]

// amount, address, userId, signedAt, signature
type ClaimArgs = [number, `0x${string}`, number, number, `0x${string}`]

type ClaimData = {
  // signed value which we need to send in the contract call
  uniqueValue: `0x${string}`
  data: {
    args: LegacyClaimArgs | ClaimArgs
  }
}

const validateDefaultClaimArgs = (args: any[]) => {
  const [userAddress, userId, signedAt, signature] = args
  return (
    userAddress?.startsWith("0x") &&
    typeof userId === "number" &&
    typeof signedAt === "number" &&
    signature?.startsWith("0x")
  )
}

const isLegacyClaimArgs = (
  args: ClaimData["data"]["args"]
): args is LegacyClaimArgs => {
  if (args.length !== 4) return false
  return validateDefaultClaimArgs(args)
}

const isClaimArgs = (args: ClaimData["data"]["args"]): args is ClaimArgs => {
  if (args.length !== 5) return false
  const [amount, ...legacyClaimArgs] = args
  return typeof +amount === "number" && validateDefaultClaimArgs(legacyClaimArgs)
}

const useCollectNft = () => {
  const { captureEvent } = usePostHogContext()
  const { id: guildId, urlName } = useGuild()
  const postHogOptions = { guild: urlName }

  const tweetToast = useToastWithTweetButton()
  const showErrorToast = useShowErrorToast()

  const { address: userAddress, chainId, status } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const { chain, nftAddress, roleId, rolePlatformId, guildPlatform } =
    useCollectNftContext()
  const { setTxHash, setTxError, setTxSuccess, assetAmount, setAssetAmount } =
    useTransactionStatusContext() ?? {}

  const { guildFee } = useGuildFee(chain)
  const { fee, name, refetch: refetchNftDetails } = useNftDetails(chain, nftAddress)

  const { refetch: refetchBalance } = useGuildRewardNftBalanceByUserId({
    nftAddress,
    chainId: Chains[chain],
  })
  const { mutate: mutateTopCollectors } = useTopCollectors()

  const shouldSwitchChain = chainId !== Chains[chain]

  const [loadingText, setLoadingText] = useState("")
  const fetcherWithSign = useFetcherWithSign()

  const { resetField } = useFormContext<CollectNftForm>()
  const claimAmountFromForm = useWatch<CollectNftForm, "amount">({
    name: "amount",
  })
  const claimAmount = claimAmountFromForm ?? 1

  const mint = async () => {
    setTxError(false)
    setTxSuccess(false)

    if (shouldSwitchChain)
      return Promise.reject("Please switch network before minting")

    setLoadingText("Claiming NFT")

    const { data: claimData }: ClaimData = await fetcherWithSign([
      `/v2/guilds/${guildId}/roles/${roleId}/role-platforms/${rolePlatformId}/claim`,
      {
        body: {
          args:
            guildPlatform?.platformGuildData?.function ===
            ContractCallFunction.DEPRECATED_SIMPLE_CLAIM
              ? []
              : [claimAmount],
        },
      },
    ])

    const claimFee =
      typeof guildFee === "bigint" && typeof fee === "bigint"
        ? (guildFee + fee) * BigInt(claimAmount)
        : BigInt(0)

    let request

    if (isLegacyClaimArgs(claimData.args)) {
      const [address, userId, , signature] = claimData.args
      const { request: legacyClaimRequest } = await publicClient.simulateContract({
        abi: legacyGuildRewardNftAbi,
        address: nftAddress,
        functionName: "claim",
        args: [address, BigInt(userId), signature],
        value: claimFee,
      })
      request = legacyClaimRequest
    }

    if (isClaimArgs(claimData.args)) {
      const [amount, address, userId, signedAt, signature] = claimData.args
      const { request: newClaimRequest } = await publicClient.simulateContract({
        abi: guildRewardNftAbi,
        address: nftAddress,
        functionName: "claim",
        args: [BigInt(amount), address, BigInt(userId), BigInt(signedAt), signature],
        value: claimFee,
      })
      request = newClaimRequest
    }

    if (process.env.NEXT_PUBLIC_MOCK_CONNECTOR) {
      return Promise.resolve({} as TransactionReceipt)
    }

    const hash = await walletClient.writeContract({
      ...request,
      account: walletClient.account,
    })

    setTxHash(hash)

    const receipt: TransactionReceipt = await publicClient.waitForTransactionReceipt(
      { hash }
    )

    if (receipt.status !== "success") {
      throw new Error(`Transaction failed. Hash: ${hash}`)
    }

    setTxSuccess(true)

    return receipt
  }

  return {
    ...useSubmit<undefined, TransactionReceipt>(mint, {
      onSuccess: () => {
        setAssetAmount(claimAmount)

        resetField("amount", {
          defaultValue: 1,
        })
        setLoadingText("")

        refetchBalance()
        refetchNftDetails()

        mutateTopCollectors(
          (prevValue) => ({
            topCollectors: [
              ...(prevValue?.topCollectors ?? []),
              {
                address: userAddress?.toLowerCase(),
                balance: assetAmount,
              },
            ].sort((a, b) => b.balance - a.balance),
            uniqueCollectors: (prevValue?.uniqueCollectors ?? 0) + 1,
          }),
          {
            revalidate: false,
          }
        )

        captureEvent("Minted NFT (GuildCheckout)", postHogOptions)

        tweetToast({
          title: `Successfully collected ${
            assetAmount > 1 ? `${assetAmount} ` : ""
          }NFT${assetAmount > 1 ? "s" : ""}!`,
          tweetText: `Just collected my ${name} NFT${
            assetAmount > 1 ? "s" : ""
          }!\nguild.xyz/${urlName}/collect/${chain.toLowerCase()}/${nftAddress.toLowerCase()}`,
        })
      },
      onError: (error) => {
        setLoadingText("")
        setTxError(true)

        const prettyError = error.correlationId
          ? error
          : processViemContractError(error, (errorName) => {
              if (errorName === "AlreadyClaimed")
                return "You've already collected this NFT"
            })
        showErrorToast(prettyError)

        captureEvent("Mint NFT error (GuildCheckout)", {
          ...postHogOptions,
          error: prettyError,
          originalError: error,
          wagmiAccountStatus: status,
        })
      },
    }),
    loadingText,
  }
}

export default useCollectNft
