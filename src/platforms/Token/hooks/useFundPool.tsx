import { usePostHogContext } from "components/_app/PostHogProvider"
import useShowErrorToast from "hooks/useShowErrorToast"
import useSubmitTransaction from "hooks/useSubmitTransaction"
import tokenRewardPoolAbi from "static/abis/tokenRewardPool"
import { findEvent } from "utils/findEventInTxResponse"
import { ERC20_CONTRACTS, NULL_ADDRESS } from "utils/guildCheckout/constants"
import { Chain } from "wagmiConfig/chains"

const useFundPool = (
  chain: Chain,
  tokenAddress: `0x${string}`,
  poolId: bigint,
  amount: bigint,
  onSuccess: () => void
) => {
  const showErrorToast = useShowErrorToast()

  const { captureEvent } = usePostHogContext()
  const postHogOptions = {
    chain: chain,
    poolId: poolId,
    hook: "useFundPool",
  }

  const tokenIsNative = tokenAddress === NULL_ADDRESS

  const transactionConfig = {
    abi: tokenRewardPoolAbi,
    address: ERC20_CONTRACTS[chain],
    functionName: "fundPool",
    args: [poolId, amount],
    ...(tokenIsNative && { value: amount }),
  }

  return useSubmitTransaction(transactionConfig, {
    onError: (error) => {
      showErrorToast("Failed to fund pool! Please try again later.")
      captureEvent("Failed to fund pool", { ...postHogOptions, error })
      console.error(error)
    },
    onSuccess: (_, events) => {
      const poolFundedEvent = findEvent<typeof tokenRewardPoolAbi, "PoolFunded">(
        events as [],
        "PoolFunded"
      )

      if (!poolFundedEvent) {
        showErrorToast("Failed to fund pool! Please try again later.")
        captureEvent("Pool funded event missing", postHogOptions)
        return
      }

      captureEvent("Funded pool", postHogOptions)

      onSuccess()
    },
  })
}

export default useFundPool
