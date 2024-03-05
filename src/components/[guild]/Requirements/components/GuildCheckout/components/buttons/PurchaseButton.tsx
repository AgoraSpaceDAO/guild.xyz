import { Chains } from "chains"
import useGuild from "components/[guild]/hooks/useGuild"
import { usePostHogContext } from "components/_app/PostHogProvider"
import Button from "components/common/Button"
import { NULL_ADDRESS } from "utils/guildCheckout/constants"
import { useAccount, useBalance, useChainId } from "wagmi"
import { useRequirementContext } from "../../../RequirementContext"
import useAllowance from "../../hooks/useAllowance"
import usePrice from "../../hooks/usePrice"
import usePurchaseAsset from "../../hooks/usePurchaseAsset"
import useTokenBuyerContractData from "../../hooks/useTokenBuyerContractData"
import { useGuildCheckoutContext } from "../GuildCheckoutContext"

const PurchaseButton = (): JSX.Element => {
  const { captureEvent } = usePostHogContext()
  const { urlName } = useGuild()

  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const requirement = useRequirementContext()
  const { pickedCurrency, agreeWithTOS } = useGuildCheckoutContext()

  const {
    data: { maxPriceInWei },
    isValidating: isPriceLoading,
    error,
  } = usePrice()

  const tokenBuyerContractData = useTokenBuyerContractData()

  const { allowance, isAllowanceLoading, allowanceError } = useAllowance(
    pickedCurrency,
    tokenBuyerContractData[Chains[chainId]]?.address
  )

  const { onSubmitTransaction, isLoading, isPreparing, estimatedGas } =
    usePurchaseAsset()

  const isSufficientAllowance =
    typeof maxPriceInWei === "bigint" && typeof allowance === "bigint"
      ? maxPriceInWei <= allowance
      : false

  const pickedCurrencyIsNative = pickedCurrency === NULL_ADDRESS

  const { data: coinBalanceData, isLoading: isCoinBalanceLoading } = useBalance({
    address,
    chainId: Chains[requirement?.chain],
  })
  const { data: tokenBalanceData, isLoading: isTokenBalanceLoading } = useBalance({
    address,
    token: pickedCurrency,
    chainId: Chains[requirement?.chain],
    query: {
      enabled: !pickedCurrencyIsNative,
    },
  })

  const isBalanceLoading = isCoinBalanceLoading || isTokenBalanceLoading

  const isSufficientBalance =
    typeof maxPriceInWei === "bigint" &&
    (coinBalanceData || tokenBalanceData) &&
    (pickedCurrencyIsNative
      ? coinBalanceData?.value >= maxPriceInWei
      : tokenBalanceData?.value >= maxPriceInWei)

  const errorMsg =
    (error && "Couldn't calculate price") ??
    (!estimatedGas && "Couldn't estimate gas") ??
    (isConnected && !isSufficientBalance && "Insufficient balance")

  const isDisabled =
    !isConnected ||
    error ||
    !agreeWithTOS ||
    Chains[chainId] !== requirement.chain ||
    (!pickedCurrencyIsNative &&
      (isPriceLoading ||
        isAllowanceLoading ||
        allowanceError ||
        !isSufficientAllowance)) ||
    isBalanceLoading ||
    !isSufficientBalance ||
    isPreparing ||
    !!errorMsg

  const onClick = () => {
    onSubmitTransaction()
    captureEvent("Click: PurchaseButton (GuildCheckout)", {
      guild: urlName,
    })
  }

  return (
    <Button
      size="lg"
      isDisabled={isDisabled}
      isLoading={isLoading}
      loadingText="Check your wallet"
      colorScheme={!isDisabled ? "blue" : "gray"}
      w="full"
      onClick={onClick}
    >
      {errorMsg || "Purchase"}
    </Button>
  )
}

export default PurchaseButton
