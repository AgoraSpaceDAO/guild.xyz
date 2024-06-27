import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react"
import { consts } from "@guildxyz/types"
import Button from "components/common/Button"
import { useCallback } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { usePairOfTokenId } from "requirements/Uniswap/hooks/usePairOfTokenId"
import {
  UNISWAP_POOL_URL,
  UniswapChains,
  useParsePoolTokenId,
} from "requirements/Uniswap/hooks/useParsePoolTokenId"
import { ADDRESS_REGEX } from "requirements/Uniswap/hooks/useParseVaultAddress"
import { useSymbolsOfPair } from "requirements/Uniswap/hooks/useSymbolsOfPair"
import ChainPicker from "requirements/common/ChainPicker"
import parseFromObject from "utils/parseFromObject"
import { CHAIN_CONFIG, Chains } from "wagmiConfig/chains"

const SelectLiquidityPoolStep = ({ onContinue }: { onContinue: () => void }) => {
  const {
    formState: { errors, touchedFields },
    setValue,
    clearErrors,
    register,
  } = useFormContext()

  const resetForm = () => {
    if (!parseFromObject(touchedFields, "pool")?.address) return
    setValue(`pool.data.token0`, undefined)
    setValue(`pool.data.token1`, undefined)
    clearErrors([`pool.data.token0`, `pool.data.token1`])
  }

  const chain: UniswapChains = useWatch({
    name: `pool.chain`,
  })

  const setTokensAndFee = ([t0, t1, fee]: [
    `0x${string}`,
    `0x${string}`,
    number
  ]) => {
    setValue(`pool.data.token0`, t0, { shouldDirty: true })
    setValue(`pool.data.token1`, t1, { shouldDirty: true })
    setValue(`pool.data.defaultFee`, fee, { shouldDirty: true })
  }

  const onChainFromParam = useCallback(
    (chainFromParam: UniswapChains) => {
      setValue(`pool.chain`, chainFromParam, { shouldDirty: true })
    },
    [setValue]
  )

  const tokenId = useParsePoolTokenId("pool", onChainFromParam)

  const { isLoading: isFetchingFromTokenId, error: tokenIdError } = usePairOfTokenId(
    chain,
    tokenId,
    setTokensAndFee
  )

  const token0 = useWatch({ name: `pool.data.token0` })
  const token1 = useWatch({ name: `pool.data.token1` })

  const { symbol0, symbol1 } = useSymbolsOfPair(Chains[chain], token0, token1)

  return (
    <Stack gap={5}>
      <Text colorScheme="gray">
        Select the chain and enter the URL or contract address of the liquidity pool.
      </Text>

      <ChainPicker
        controlName={`pool.chain` as const}
        showDivider={false}
        supportedChains={
          consts.UniswapV3PositionsChains as unknown as UniswapChains[]
        }
        onChange={resetForm}
      />

      <FormControl
        isRequired
        isInvalid={
          !!parseFromObject(errors, "pool")?.data?.lpVault || !!tokenIdError
        }
      >
        <FormLabel>Pool address or URL</FormLabel>
        <Input
          {...register(`pool.data.lpVault`, {
            required: "This field is required",
            validate: (value) =>
              ADDRESS_REGEX.test(value) ||
              UNISWAP_POOL_URL.test(value) ||
              "Field must be a uniswap pool url, or has to contain a valid EVM address",
          })}
          placeholder="https://app.uniswap.org/pools/606400?chain=base"
        />

        {(isFetchingFromTokenId ||
          (symbol0 && symbol1) ||
          isFetchingFromTokenId) && (
          <FormHelperText>
            <Skeleton isLoaded={!!symbol0 && !!symbol1} display="inline">
              <strong>
                {symbol0 ?? "___"}/{symbol1 ?? "___"}
              </strong>{" "}
              pair detected on <strong>{CHAIN_CONFIG[chain]?.name}</strong>. If this
              is not correct, ensure the correct chain is selected
            </Skeleton>
          </FormHelperText>
        )}

        <FormErrorMessage>
          {parseFromObject(errors, "pool")?.data?.lpVault?.message ??
            "Failed to identify pool. Make sure the correct chain is selected"}
        </FormErrorMessage>
      </FormControl>

      <Button
        colorScheme={"indigo"}
        isDisabled={!!errors?.pool || !chain || tokenIdError || (!token0 && !token1)}
        onClick={onContinue}
        mb={5}
        mt={3}
      >
        Continue
      </Button>
    </Stack>
  )
}

export default SelectLiquidityPoolStep
