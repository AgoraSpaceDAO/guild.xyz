import { Icon, Spinner, Tooltip } from "@chakra-ui/react"
import { parseUnits } from "@ethersproject/units"
import { useWeb3React } from "@web3-react/core"
import Button from "components/common/Button"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import useAllowance from "components/[guild]/Requirements/components/GuildCheckout/hooks/useAllowance"
import { Chains, RPC } from "connectors"
import useTokenData from "hooks/useTokenData"
import { Check, Question, Warning } from "phosphor-react"
import { TOKEN_BUYER_CONTRACT } from "utils/guildCheckout"
import useAllowSpendingTokens from "../../hooks/useAllowSpendingToken"
import usePrice from "../../hooks/usePrice"
import { useGuildCheckoutContext } from "../GuildCheckoutContex"

const AllowanceButton = (): JSX.Element => {
  const { pickedCurrency, requirement } = useGuildCheckoutContext()
  const requirementChainId = Chains[requirement.chain]

  const { chainId } = useWeb3React()

  const {
    data: { symbol, name },
  } = useTokenData(requirement.chain, pickedCurrency)
  const nativeCurrency = RPC[Chains[chainId]]?.nativeCurrency
  const isNativeCurrencyPicked = pickedCurrency === nativeCurrency?.symbol

  const tokenSymbol = isNativeCurrencyPicked ? nativeCurrency.symbol : symbol
  const tokenName = isNativeCurrencyPicked ? nativeCurrency.name : name

  const { data: priceData, isValidating: isPriceLoading } = usePrice()
  const { allowance, isAllowanceLoading, allowanceError } = useAllowance(
    pickedCurrency,
    TOKEN_BUYER_CONTRACT
  )

  const {
    data: { decimals },
    error,
  } = useTokenData(requirement?.chain, pickedCurrency)

  const priceInBigNumber =
    priceData && decimals
      ? parseUnits(priceData.price.toFixed(6), decimals)
      : undefined
  const isEnoughAllowance =
    priceInBigNumber && allowance
      ? parseUnits(priceData.price.toFixed(6), decimals).lte(allowance)
      : false

  const { onSubmit, isLoading } = useAllowSpendingTokens(
    pickedCurrency,
    TOKEN_BUYER_CONTRACT,
    priceInBigNumber
  )

  if (!pickedCurrency || chainId !== requirementChainId || isNativeCurrencyPicked)
    return null

  return (
    <CardMotionWrapper>
      <Button
        size="xl"
        colorScheme={allowanceError || error ? "red" : "blue"}
        isDisabled={
          isPriceLoading ||
          isAllowanceLoading ||
          allowanceError ||
          error ||
          isEnoughAllowance
        }
        isLoading={isPriceLoading || isAllowanceLoading || isLoading}
        loadingText={
          isPriceLoading || isAllowanceLoading
            ? "Checking allowance"
            : "Check your wallet"
        }
        onClick={onSubmit}
        w="full"
        leftIcon={
          isPriceLoading || isAllowanceLoading ? (
            <Spinner />
          ) : allowanceError || error ? (
            <Icon as={Warning} />
          ) : isEnoughAllowance ? (
            <Icon as={Check} />
          ) : null
        }
        rightIcon={
          !isEnoughAllowance && (
            <Tooltip
              label={`You have to give the Guild smart contracts permission to use your ${tokenName}. You only have to do this once per token.`}
            >
              <Icon as={Question} />
            </Tooltip>
          )
        }
      >
        {allowanceError || error
          ? "Couldn't fetch allowance"
          : `Allow Guild to use your ${tokenSymbol}`}
      </Button>
    </CardMotionWrapper>
  )
}

export default AllowanceButton
