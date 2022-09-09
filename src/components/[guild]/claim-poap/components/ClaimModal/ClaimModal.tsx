import {
  Box,
  Divider,
  HStack,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuList,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useBreakpointValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { formatUnits } from "@ethersproject/units"
import { useWeb3React } from "@web3-react/core"
import { Error } from "components/common/Error"
import NetworkButtonsList from "components/common/Layout/components/Account/components/NetworkModal/components/NetworkButtonsList"
import { Modal } from "components/common/Modal"
import ModalButton from "components/common/ModalButton"
import DynamicDevTool from "components/create-guild/DynamicDevTool"
import usePoapVault from "components/[guild]/CreatePoap/hooks/usePoapVault"
import useIsMember from "components/[guild]/hooks/useIsMember"
import ConnectPlatform from "components/[guild]/JoinModal/components/ConnectPlatform"
import JoinStep from "components/[guild]/JoinModal/components/JoinStep"
import WalletAuthButton from "components/[guild]/JoinModal/components/WalletAuthButton"
import WalletAuthButtonWithBalance from "components/[guild]/JoinModal/components/WalletAuthButtonWithBalance"
import useJoin from "components/[guild]/JoinModal/hooks/useJoin"
import processJoinPlatformError from "components/[guild]/JoinModal/utils/processJoinPlatformError"
import { Chains } from "connectors"
import useClearUrlQuery from "hooks/useClearUrlQuery"
import useTokenData from "hooks/useTokenData"
import {
  ArrowSquareOut,
  CaretDown,
  Check,
  CheckCircle,
  CurrencyCircleDollar,
  LinkBreak,
} from "phosphor-react"
import { FormProvider, useForm } from "react-hook-form"
import { GuildPoap, Poap } from "types"
import useClaimPoap from "../../hooks/useClaimPoap"
import useHasPaid from "../../hooks/useHasPaid"
import usePayFee from "../../hooks/usePayFee"
import PayFeeMenuItem from "./components/PayFeeMenuItem"

type Props = {
  isOpen: boolean
  onClose: () => void
  poap: Poap
  guildPoap: GuildPoap
}

const ClaimModal = ({ isOpen, onClose, poap, guildPoap }: Props): JSX.Element => {
  const query = useClearUrlQuery()
  const networkModalSize = useBreakpointValue({ base: "lg", md: "2xl", lg: "4xl" })

  const { isActive, account, chainId } = useWeb3React()

  const methods = useForm({
    mode: "all",
    defaultValues: {
      platforms: {},
    },
  })
  const { handleSubmit } = methods

  const vaultId = guildPoap?.poapContracts
    ?.map((poapContract) => poapContract.chainId)
    ?.includes(chainId)
    ? guildPoap?.poapContracts?.find(
        (poapContract) => poapContract?.chainId === chainId
      )?.vaultId
    : guildPoap?.poapContracts?.[0]?.vaultId
  const vaultChainId = guildPoap?.poapContracts
    ?.map((poapContract) => poapContract.chainId)
    ?.includes(chainId)
    ? chainId
    : guildPoap?.poapContracts?.[0]?.chainId
  const { vaultData, isVaultLoading } = usePoapVault(vaultId, vaultChainId)

  const isMonetized = typeof vaultId === "number"
  const isWrongChain =
    chainId &&
    guildPoap?.poapContracts?.length &&
    !guildPoap?.poapContracts
      ?.map((poapContract) => poapContract.chainId)
      .includes(chainId)

  const {
    data: { symbol, decimals },
    isValidating: isTokenDataLoading,
  } = useTokenData(Chains[vaultChainId], vaultData?.token)

  const {
    onSubmit: onClaimPoapSubmit,
    isLoading: isClaimPoapLoading,
    response: claimPoapResponse,
  } = useClaimPoap(poap)

  const {
    response: joinResponse,
    isLoading: isJoinLoading,
    onSubmit: onJoinSubmit,
    error: joinError,
    isSigning,
    signLoadingText,
  } = useJoin(onClaimPoapSubmit)

  const { onSubmit: onPayFeeSubmit, loadingText } = usePayFee(vaultId)

  const { hasPaid, hasPaidLoading } = useHasPaid(poap?.id)
  const isMember = useIsMember()

  const {
    isOpen: isChangeNetworkModalOpen,
    onOpen: onChangeNetworkModalOpen,
    onClose: onChangeNetworkModalClose,
  } = useDisclosure()

  const multiChainMonetized = guildPoap?.poapContracts?.length > 1

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent overflow="visible">
          <FormProvider {...methods}>
            <ModalHeader>Claim {poap?.name} POAP</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Error
                error={
                  joinError ||
                  (joinResponse?.success === false && !isJoinLoading && "NO_ACCESS")
                }
                processError={processJoinPlatformError}
              />
              {!claimPoapResponse ? (
                <>
                  <VStack
                    spacing="3"
                    alignItems="strech"
                    w="full"
                    divider={<Divider />}
                  >
                    {isMonetized ? (
                      <WalletAuthButtonWithBalance
                        token={{
                          address: vaultData?.token,
                          symbol,
                          decimals: decimals ?? 18,
                          name: "",
                        }}
                      />
                    ) : (
                      <WalletAuthButton />
                    )}
                    <ConnectPlatform platform={"DISCORD"} query={query} />
                    {isMonetized && (
                      <>
                        <JoinStep
                          isRequired
                          isDisabled={
                            (!isActive && "Connect wallet first") ||
                            (multiChainMonetized && isWrongChain && "Wrong network")
                          }
                          isDone={hasPaid}
                          isLoading={
                            isVaultLoading ||
                            hasPaidLoading ||
                            !!loadingText ||
                            (isTokenDataLoading && !symbol && !decimals)
                          }
                          loadingText={loadingText}
                          title={hasPaid ? "Fee paid" : "Pay fee"}
                          buttonLabel={
                            isWrongChain
                              ? "Switch chain"
                              : hasPaid
                              ? "Paid fee"
                              : `${hasPaid ? "Paid" : "Pay"} ${formatUnits(
                                  vaultData?.fee ?? "0",
                                  decimals ?? 18
                                )} ${symbol}`
                          }
                          colorScheme="blue"
                          icon={
                            isWrongChain ? (
                              <Icon as={LinkBreak} />
                            ) : hasPaid ? (
                              <Icon as={Check} rounded="full" />
                            ) : (
                              <Icon as={CurrencyCircleDollar} />
                            )
                          }
                          onClick={
                            isWrongChain && !multiChainMonetized
                              ? onChangeNetworkModalOpen
                              : onPayFeeSubmit
                          }
                          addonButton={
                            !hasPaid &&
                            multiChainMonetized && (
                              <Menu placement="bottom-end">
                                <MenuButton
                                  as={IconButton}
                                  icon={<CaretDown />}
                                  colorScheme="blue"
                                  borderLeftRadius={0}
                                />
                                <MenuList zIndex="modal">
                                  {guildPoap.poapContracts.map((poapContract) => (
                                    <PayFeeMenuItem
                                      key={poapContract.id}
                                      poapContractData={poapContract}
                                    />
                                  ))}
                                </MenuList>
                              </Menu>
                            )
                          }
                        />
                      </>
                    )}
                  </VStack>

                  <ModalButton
                    mt={8}
                    onClick={
                      isMember ? onClaimPoapSubmit : handleSubmit(onJoinSubmit)
                    }
                    colorScheme="green"
                    isLoading={isSigning || isJoinLoading || isClaimPoapLoading}
                    loadingText={
                      signLoadingText ||
                      (isJoinLoading && "Joining guild") ||
                      (isClaimPoapLoading && "Getting your link")
                    }
                    isDisabled={!isActive || (isMonetized && !hasPaid)}
                  >
                    Get minting link
                  </ModalButton>
                </>
              ) : (
                <HStack spacing={0}>
                  <Icon
                    as={CheckCircle}
                    color="green.500"
                    boxSize="16"
                    weight="light"
                  />
                  <Box pl="6" w="calc(100% - var(--chakra-sizes-16))">
                    <Text>{`You can mint your POAP on the link below:`}</Text>
                    <Link
                      mt={2}
                      maxW="full"
                      href={`${claimPoapResponse}?address=${account}`}
                      colorScheme="blue"
                      isExternal
                      fontWeight="semibold"
                    >
                      <Text as="span" isTruncated>
                        {`${claimPoapResponse}?address=${account}`}
                      </Text>
                      <Icon as={ArrowSquareOut} />
                    </Link>
                  </Box>
                </HStack>
              )}
            </ModalBody>
          </FormProvider>
        </ModalContent>
        <DynamicDevTool control={methods.control} />
      </Modal>

      <Modal
        isOpen={isChangeNetworkModalOpen}
        onClose={onChangeNetworkModalClose}
        size={networkModalSize}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change network</ModalHeader>
          <ModalBody>
            <NetworkButtonsList
              manualNetworkChangeCallback={onChangeNetworkModalClose}
              listedChainIDs={guildPoap?.poapContracts?.map(
                (poapContract) => poapContract.chainId
              )}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ClaimModal
