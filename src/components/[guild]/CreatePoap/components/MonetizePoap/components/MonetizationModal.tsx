import {
  Collapse,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Icon,
  Img,
  Input,
  InputGroup,
  InputLeftElement,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import { WalletConnect } from "@web3-react/walletconnect"
import Button from "components/common/Button"
import NetworkButtonsList from "components/common/Layout/components/Account/components/NetworkModal/components/NetworkButtonsList"
import requestNetworkChange from "components/common/Layout/components/Account/components/NetworkModal/utils/requestNetworkChange"
import { Modal } from "components/common/Modal"
import StyledSelect from "components/common/StyledSelect"
import DynamicDevTool from "components/create-guild/DynamicDevTool"
import { Chains, RPC } from "connectors"
import useFeeCollectorContract from "hooks/useFeeCollectorContract"
import useToast from "hooks/useToast"
import { Check, CoinVertical } from "phosphor-react"
import { useEffect } from "react"
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form"
import { MonetizePoapForm, SelectOption } from "types"
import shortenHex from "utils/shortenHex"
import { useCreatePoapContext } from "../../CreatePoapContext"
import useFeeInUSD from "../hooks/useFeeInUSD"
import useIsGnosisSafe from "../hooks/useIsGnosisSafe"
import useRegisterVault from "../hooks/useRegisterVault"
import useUsersGnosisSafes from "../hooks/useUsersGnosisSafes"
import TokenPicker from "./TokenPicker"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const ADDRESS_REGEX = /^0x[A-F0-9]{40}$/i

const coingeckoCoinIds = {
  1: "ethereum",
  137: "matic-network",
  100: "xdai",
  56: "binancecoin",
  5: "ethereum",
}

const handlePriceChange = (newValue, onChange) => {
  if (/^[0-9]*\.0*$/i.test(newValue)) return onChange(newValue)
  const parsedValue = parseFloat(newValue)
  return onChange(isNaN(parsedValue) ? "" : parsedValue)
}

const MonetizationModal = ({ isOpen, onClose }: Props): JSX.Element => {
  const modalBg = useColorModeValue(undefined, "gray.800")
  const { account, chainId, connector } = useWeb3React()

  // TODO: check on which chain has the user monetized their POAP and if they've already monetized on the current chain, show the network selector modal where they must pick another chain.

  const toast = useToast()
  // TODO: refactor the NetworkButtonsList component, and maybe provide this function in a context, so we can use it everywhere.
  const requestManualNetworkChange = (chain) => () =>
    toast({
      title: "Your wallet doesn't support switching chains automatically",
      description: `Please switch to ${chain} from your wallet manually!`,
      status: "error",
    })
  const changeNetwork = async (newChainId: number) => {
    try {
      if (connector instanceof WalletConnect)
        requestManualNetworkChange(Chains[newChainId])()
      else await requestNetworkChange(Chains[newChainId], () => {}, true)()
    } catch (err) {
      // User cancelled network change
      if (err?.code === 4001) setValue("chainId", chainId)
    }
  }

  const { poapDropSupportedChains } = useCreatePoapContext()
  const feeCollectorContract = useFeeCollectorContract()

  const methods = useForm<MonetizePoapForm>({
    mode: "all",
    defaultValues: {
      chainId,
      token: "0x0000000000000000000000000000000000000000",
      owner: account,
    },
  })

  const {
    control,
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = methods

  const mappedChains = poapDropSupportedChains?.map((cId) => ({
    value: cId,
    label: RPC[Chains[cId]]?.chainName,
    img: RPC[Chains[cId]]?.iconUrls?.[0],
  }))

  const formChainId = useWatch({ control, name: "chainId" })

  useEffect(() => {
    if (!formChainId || formChainId === chainId) return
    changeNetwork(formChainId)
  }, [formChainId])

  useEffect(() => {
    if (!chainId) return
    if (chainId !== formChainId) setValue("chainId", chainId)
  }, [chainId])

  const token = useWatch({ control, name: "token" })
  const fee = useWatch({ control, name: "fee" })
  const coingeckoId =
    token === "0x0000000000000000000000000000000000000000"
      ? coingeckoCoinIds[chainId]
      : undefined
  const { feeInUSD, isFeeInUSDLoading } = useFeeInUSD(fee, coingeckoId)

  const pastedAddress = useWatch({ control, name: "owner" })
  const { isGnosisSafe } = useIsGnosisSafe(pastedAddress)
  const { usersGnosisSafes } = useUsersGnosisSafes()

  const gnosisSafeLogoUrl = useColorModeValue(
    "/img/gnosis-safe-green.svg",
    "/img/gnosis-safe-white.svg"
  )

  const { onSubmit, isLoading, response } = useRegisterVault()

  useEffect(() => {
    if (!response) return
    onClose()
  }, [response])

  return (
    <FormProvider {...methods}>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader bgColor={modalBg}>{`Monetize on ${
            RPC[Chains[chainId]].chainName
          }`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody bgColor={modalBg}>
            {poapDropSupportedChains.includes(chainId) ? (
              <Grid
                mb={12}
                templateColumns="repeat(2, 1fr)"
                columnGap={4}
                rowGap={6}
                w="full"
                maxW="lg"
              >
                <GridItem colSpan={2}>
                  <FormControl
                    textAlign="left"
                    mb={4}
                    maxW={{ base: "full", md: "calc(50% - 0.5rem)" }}
                  >
                    <FormLabel>Pick a chain</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Img
                          src={RPC[Chains[formChainId]]?.iconUrls?.[0]}
                          alt={RPC[Chains[formChainId]]?.chainName}
                          boxSize={4}
                        />
                      </InputLeftElement>

                      <Controller
                        name="chainId"
                        defaultValue={mappedChains?.find(
                          (_chain) => _chain.value === chainId
                        )}
                        render={({ field: { onChange, onBlur, value, ref } }) => (
                          <StyledSelect
                            ref={ref}
                            options={mappedChains}
                            value={mappedChains?.find(
                              (_chain) => _chain.value === value
                            )}
                            onChange={(newValue: SelectOption) =>
                              onChange(newValue?.value)
                            }
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </InputGroup>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={{ base: 2, md: 1 }}>
                  <TokenPicker />
                </GridItem>

                <GridItem colSpan={{ base: 2, md: 1 }}>
                  <FormControl isRequired isInvalid={!!errors?.fee}>
                    <FormLabel>Price</FormLabel>
                    <Controller
                      name="fee"
                      control={control}
                      rules={{
                        required: "This field is required.",
                        min: {
                          value: 0,
                          message: "Amount must be positive",
                        },
                      }}
                      render={({ field: { onChange, onBlur, value, ref } }) => (
                        <NumberInput
                          ref={ref}
                          value={value ?? undefined}
                          onChange={(newValue) =>
                            handlePriceChange(newValue, onChange)
                          }
                          onBlur={onBlur}
                          min={0}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    />
                    <Collapse in={feeInUSD > 0}>
                      <FormHelperText>
                        {isFeeInUSDLoading || !feeInUSD
                          ? "Loading..."
                          : `$${feeInUSD.toFixed(2)}`}
                      </FormHelperText>
                    </Collapse>
                    <FormErrorMessage>{errors?.fee?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <Stack textAlign="left">
                    <FormControl isRequired isInvalid={!!errors?.owner}>
                      <FormLabel>Address to pay to</FormLabel>
                      <InputGroup>
                        {isGnosisSafe && (
                          <InputLeftElement>
                            <Img
                              src={gnosisSafeLogoUrl}
                              alt="Gnosis Safe"
                              boxSize={5}
                            />
                          </InputLeftElement>
                        )}

                        <Input
                          {...register("owner", {
                            required: "This field is required.",
                            pattern: {
                              value: ADDRESS_REGEX,
                              message:
                                "Please input a 42 characters long, 0x-prefixed hexadecimal address.",
                            },
                          })}
                        />
                      </InputGroup>
                      <FormErrorMessage>{errors?.owner?.message}</FormErrorMessage>
                    </FormControl>

                    <Collapse in={usersGnosisSafes?.length > 0}>
                      <Stack pt={8}>
                        <Text mb={4} color="gray">
                          We've detected that you are an owner of one or more Gnosis
                          Safes. Consider using a safe for more secure payments.
                        </Text>

                        {usersGnosisSafes?.map((safe) => (
                          <HStack key={safe}>
                            <Img
                              src={gnosisSafeLogoUrl}
                              alt="Gnosis Safe"
                              boxSize={4}
                            />

                            <Tooltip label={safe}>
                              <Text
                                as="span"
                                color="gray"
                                fontWeight="bold"
                                fontSize="sm"
                              >
                                {shortenHex(safe, 5)}
                              </Text>
                            </Tooltip>

                            <Button
                              size="xs"
                              borderRadius="lg"
                              leftIcon={
                                safe.toLowerCase() ===
                                  pastedAddress?.toLowerCase() && (
                                  <Icon
                                    as={Check}
                                    bgColor="green.400"
                                    rounded="full"
                                    boxSize={4}
                                    p={1}
                                    color="white"
                                  />
                                )
                              }
                              isDisabled={
                                safe.toLowerCase() === pastedAddress?.toLowerCase()
                              }
                              onClick={() =>
                                setValue("owner", safe, { shouldValidate: true })
                              }
                            >
                              Use this safe
                            </Button>
                          </HStack>
                        ))}
                      </Stack>
                    </Collapse>
                  </Stack>
                </GridItem>
              </Grid>
            ) : (
              <VStack
                spacing={4}
                pb={{ base: 6, sm: 0 }}
                alignItems={{ base: "start", sm: "center" }}
              >
                <Text>Please switch to a supported chain!</Text>
                <NetworkButtonsList listedChainIDs={poapDropSupportedChains} />
              </VStack>
            )}
          </ModalBody>

          <ModalFooter bgColor={modalBg}>
            <Button mr={2} onClick={onClose}>
              Cancel
            </Button>
            {poapDropSupportedChains.includes(chainId) && (
              <>
                {feeCollectorContract ? (
                  <Button
                    colorScheme="indigo"
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    loadingText="Registering vault"
                    onClick={handleSubmit(onSubmit, console.log)}
                    leftIcon={<Icon as={CoinVertical} />}
                  >
                    Monetize POAP
                  </Button>
                ) : (
                  // This shouldn't happen, but handled this case too until we test this feature
                  <Tooltip
                    label="Contract error. Please switch to a supported chain"
                    shouldWrapChildren
                  >
                    <Button
                      colorScheme="indigo"
                      isDisabled
                      leftIcon={<Icon as={CoinVertical} />}
                    >
                      Monetize POAP
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      <DynamicDevTool control={control} />
    </FormProvider>
  )
}

export default MonetizationModal
