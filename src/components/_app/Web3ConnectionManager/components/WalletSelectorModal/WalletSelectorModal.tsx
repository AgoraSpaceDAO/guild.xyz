import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Center,
  Collapse,
  Icon,
  IconButton,
  Img,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { IPlayerProps, Player } from "@lottiefiles/react-lottie-player"
import MetaMaskOnboarding from "@metamask/onboarding"
import { useUserPublic } from "components/[guild]/hooks/useUser"
import Button from "components/common/Button"
import CardMotionWrapper from "components/common/CardMotionWrapper"
import CopyableAddress from "components/common/CopyableAddress"
import { Error as ErrorComponent } from "components/common/Error"
import GuildAvatar from "components/common/GuildAvatar"
import { addressLinkParamsAtom } from "components/common/Layout/components/Account/components/AccountModal/components/LinkAddressButton"
import Link from "components/common/Link"
import { Modal } from "components/common/Modal"
import ModalButton from "components/common/ModalButton"
import { publicClient } from "connectors"
import useDriveOAuth from "hooks/useDriveOAuth"
import useFuel from "hooks/useFuel"
import useSetKeyPair from "hooks/useSetKeyPair"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import {
  ArrowLeft,
  ArrowSquareOut,
  LockSimple,
  Question,
  Wallet,
} from "phosphor-react"
import { useEffect, useRef, useState } from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { mutate } from "swr"
import { fetcherWithSign } from "utils/fetcher"
import {
  getDriveFileAppProperties,
  listWalletsOnDrive,
  uploadBackupDataToDrive,
} from "utils/googleDrive"
import type { CWaaSConnector } from "waasConnector"
import { useAccount, useConnect } from "wagmi"
import useWeb3ConnectionManager from "../../hooks/useWeb3ConnectionManager"
import AccountButton from "./components/AccountButton"
import ConnectorButton from "./components/ConnectorButton"
import DelegateCashButton from "./components/DelegateCashButton"
import FuelConnectorButtons from "./components/FuelConnectorButtons"
import GoogleTerms from "./components/GoogleTerms"
import useCountdownSeconds from "./hooks/useCountdownSeconds"
import useIsWalletConnectModalActive from "./hooks/useIsWalletConnectModalActive"
import useLinkAddress from "./hooks/useLinkAddress"
import processConnectionError from "./utils/processConnectionError"

type Props = {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

type LottieInstance = Parameters<IPlayerProps["lottieRef"]>[0]

// We don't open the modal on these routes
const ignoredRoutes = ["/_error", "/tgauth", "/oauth", "/googleauth"]

const genericErrorToastCallback =
  (toast: ReturnType<typeof useToast>) => (error: any) => {
    toast({
      status: "error",
      title: "Error",
      description: error instanceof Error ? error.message : "Unknown error",
    })
  }

const GoogleLoginButton = () => {
  const onboardingModal = useDisclosure()
  const recaptchaRef = useRef<ReCAPTCHA>()
  const { connectors, connectAsync, connect } = useConnect()
  const cwaasConnector = connectors.find(
    ({ id }) => id === "cwaasWallet"
  ) as CWaaSConnector

  const googleAuth = useDriveOAuth()

  const set = useSetKeyPair()
  const toast = useToast()

  const [isNewWallet, setIsNewWallet] = useState(false)

  const createOrRestoreWallet = useSubmit(
    async (accessToken: string) => {
      const { files } = await listWalletsOnDrive(accessToken)

      if (files.length <= 0) {
        setIsNewWallet(true)
      }

      onboardingModal.onOpen()

      if (files.length <= 0) {
        const { wallet, account } = await cwaasConnector.createWallet()
        await uploadBackupDataToDrive(wallet.backup, account.address, accessToken)
        return true
      } /* if (files.length == 1) */ else {
        const {
          appProperties: { backupData },
        } = await getDriveFileAppProperties(files[0].id, accessToken)

        // TODO: Check if the current wallet (if there is one) is the same. If so, don't call restore
        await cwaasConnector.restoreWallet(backupData)
        return false
      }

      // TODO: Prompt user to choose from the backed up wallets
    },
    {
      onError: (error) => {
        console.error(error)
        genericErrorToastCallback(toast)(error)
      },
    }
  )

  const verify = useSubmit(
    async () => {
      const walletClient = await cwaasConnector.getWalletClient()

      const verifyResult = await set.onSubmit(
        {
          signProps: {
            walletClient,
            address: walletClient.account.address,
          },
        },
        true
      )

      return verifyResult
    },
    { onError: genericErrorToastCallback(toast) }
  )
  // TODO use this, need to pass sign props
  // const connectGoogle = usePlatformConnect()
  const connectGoogle = useSubmit(async ({ authData, userId, keyPair }) => {
    const walletClient = await cwaasConnector.getWalletClient()

    const result = await fetcherWithSign(
      {
        keyPair,
        walletClient,
        address: walletClient.account.address,
        publicClient: publicClient({}),
      },
      `/v2/users/${walletClient.account.address}/platform-users`,
      {
        method: "POST",
        body: {
          platformName: "GOOGLE",
          authData,
        },
      }
    )

    if (userId) {
      await mutate(
        [`/v2/users/${userId}/profile`, { method: "GET", body: {} }],
        (prev) => ({
          ...prev,
          platformUsers: [...(prev?.platformUsers ?? []), result],
        })
      )
    }

    return result
  })

  const logInWithGoogle = useSubmit(
    async () => {
      // 1) Google OAuth
      const { authData } = await googleAuth.onOpen()

      // 2) Create or Restore wallet
      const isNew = await createOrRestoreWallet.onSubmit(
        (authData as any)?.access_token,
        true
      )

      const { keyPair, user } = await verify.onSubmit(null, true)

      await connectGoogle
        .onSubmit({ authData, userId: user?.id, keyPair: keyPair?.keyPair }, true)
        .catch(() => {})

      if (!isNew) {
        await connectAsync({ connector: cwaasConnector })
        onboardingModal.onClose()
      }

      // TODO We could load the Player dynamically here
      return true
    },
    {
      onError: () => {
        onboardingModal.onClose()
      },
    }
  )

  const [successPlayer, setSuccessPlayer] = useState<LottieInstance>()
  const [isSuccessAnimDone, setIsSuccessAnimDone] = useState(false)
  const [accordionIndex, setAccordionIndex] = useState(0)

  const isSuccess = !!logInWithGoogle.response && !!successPlayer

  // Timer to decide if resend button is disabled
  const { seconds, start } = useCountdownSeconds(5)

  // Play the success animation if everything was successful, and the player is ready
  useEffect(() => {
    if (!isSuccess) return
    successPlayer.play()

    const animDone = () => {
      setIsSuccessAnimDone(true)
      setAccordionIndex(1)
      start()
    }

    successPlayer.addEventListener("complete", animDone)

    // return () => {
    //   successPlayer.removeEventListener("complete", animDone)
    // }
  }, [isSuccess])

  return (
    <>
      <Button
        mt="4"
        size="xl"
        isLoading={logInWithGoogle.isLoading}
        onClick={logInWithGoogle.onSubmit}
        colorScheme="white"
        leftIcon={
          <Center boxSize={6}>
            <Img
              src={`/walletLogos/google.png`}
              maxW={6}
              maxH={6}
              alt={`Google logo`}
            />
          </Center>
        }
        justifyContent="start"
        gap={3}
        loadingText={googleAuth.isAuthenticating ? "Confirm in popup..." : "Loading"}
      >
        Sign in with Google
      </Button>
      {/* Maybe move ReCAPTCHA to _app to avoid duplication */}
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
        size="invisible"
      />

      <Modal isOpen={onboardingModal.isOpen} onClose={onboardingModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {logInWithGoogle.isLoading
              ? isNewWallet
                ? "Generating a wallet for you..."
                : "Restoring your wallet..."
              : "Your new wallet"}
          </ModalHeader>
          <ModalBody>
            <Stack alignItems={"center"} gap={8}>
              <Stack alignItems={"center"}>
                <Box
                  backgroundColor={"blackAlpha.200"}
                  boxSize={20}
                  borderRadius={"full"}
                  position={"relative"}
                >
                  {!isSuccess && (
                    <>
                      <Spinner w="full" h="full" speed="0.8s" thickness={"4px"} />
                      <Icon
                        as={Wallet}
                        position={"absolute"}
                        top={"50%"}
                        left={"50%"}
                        transform={"translate(-50%, -50%)"}
                        boxSize={7}
                      />
                    </>
                  )}

                  <Collapse in={!isSuccessAnimDone}>
                    <Player
                      // keepLastFrame
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "var(--chakra-sizes-24)",
                        height: "var(--chakra-sizes-24)",
                      }}
                      src="/success_lottie.json"
                      lottieRef={(player) => {
                        setSuccessPlayer(player)
                      }}
                    />
                  </Collapse>

                  {isSuccessAnimDone && (
                    <Center h="full">
                      <GuildAvatar
                        address={cwaasConnector?._currentAddress?.address}
                      />
                    </Center>
                  )}
                </Box>

                {isSuccessAnimDone ? (
                  <CopyableAddress
                    decimals={5}
                    address={cwaasConnector?._currentAddress?.address ?? ""}
                  />
                ) : (
                  isNewWallet && <Box height="1.5rem" />
                )}
              </Stack>

              {isNewWallet && (
                <Accordion index={accordionIndex}>
                  <AccordionItem borderTop={"none"} pb={2}>
                    <AccordionButton px={1} onClick={() => setAccordionIndex(0)}>
                      <Question size={18} />
                      <Text fontWeight={600} ml={2} flexGrow={1} textAlign={"left"}>
                        What's a wallet?
                      </Text>

                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} pl={8} pt={0} color={"whiteAlpha.600"}>
                      A wallet lets you store your digital assets like Guild Pins,
                      NFTs and other tokens. It's essential to have one to explore
                      Guild and all things web3!
                    </AccordionPanel>
                  </AccordionItem>

                  <AccordionItem borderBottom={"none"} pt={2}>
                    <AccordionButton px={1} onClick={() => setAccordionIndex(1)}>
                      <LockSimple size={18} />
                      <Text fontWeight={600} ml={2} flexGrow={1} textAlign={"left"}>
                        How can I access my wallet?
                      </Text>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} pl={8} pt={0} color={"whiteAlpha.600"}>
                      {logInWithGoogle.isLoading
                        ? "Your wallet has a private key that we'll save to your Google Drive. As long as it's there, you'll be able to restore your wallet / sign in to Guild with Google. If you lose it, we won't be able to restore your account!"
                        : "Your wallet has a private key that we've saved to your Google Drive. As long as it's there, you'll be able to restore your wallet / sign in to Guild with Google. If you lose it, we won't be able to restore your account!"}
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            {isSuccessAnimDone ? (
              <Button
                w={"full"}
                size="lg"
                colorScheme="green"
                isDisabled={seconds > 0}
                onClick={() => {
                  connect({ connector: cwaasConnector })
                  onboardingModal.onClose()
                }}
              >
                {seconds > 0 ? `Wait ${seconds} sec...` : "Got it"}
              </Button>
            ) : (
              <GoogleTerms />
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

const WalletSelectorModal = ({ isOpen, onClose, onOpen }: Props): JSX.Element => {
  const {
    isWeb3Connected,
    isDelegateConnection,
    setIsDelegateConnection,
    isInSafeContext,
    disconnect,
  } = useWeb3ConnectionManager()

  const { connectors, error, connect, pendingConnector, isLoading } = useConnect()
  const { connector } = useAccount()

  const [addressLinkParams] = useAtom(addressLinkParamsAtom)
  const isAddressLink = !!addressLinkParams?.userId

  const { captchaVerifiedSince } = useUserPublic()

  // initialize metamask onboarding
  const onboarding = useRef<MetaMaskOnboarding>()
  if (typeof window !== "undefined") {
    onboarding.current = new MetaMaskOnboarding()
  }

  const closeModalAndSendAction = () => {
    onClose()
    setTimeout(() => {
      disconnect()
    }, 200)
  }

  const { keyPair, id } = useUserPublic()
  const set = useSetKeyPair()

  useEffect(() => {
    if (keyPair) onClose()
  }, [keyPair])

  const router = useRouter()

  useEffect(() => {
    if (
      !!id &&
      !keyPair &&
      router.isReady &&
      !ignoredRoutes.includes(router.route) &&
      !!connector?.connect
    ) {
      const activate = connector.connect()
      if (typeof activate !== "undefined") {
        activate.finally(() => onOpen())
      }
    }
  }, [keyPair, router])

  const isConnectedAndKeyPairReady = isWeb3Connected && !!id

  const isWalletConnectModalActive = useIsWalletConnectModalActive()

  const { windowFuel } = useFuel()

  const recaptchaRef = useRef<ReCAPTCHA>()

  const linkAddress = useLinkAddress()

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModalAndSendAction}
      closeOnOverlayClick={!isWeb3Connected || !!keyPair}
      closeOnEsc={!isWeb3Connected || !!keyPair}
      trapFocus={!isWalletConnectModalActive}
    >
      <ModalOverlay />
      <ModalContent data-test="wallet-selector-modal">
        <ModalHeader display={"flex"}>
          <Box
            {...((isConnectedAndKeyPairReady && !keyPair) || isDelegateConnection
              ? {
                  w: "10",
                  opacity: 1,
                }
              : {
                  w: "0",
                  opacity: 0,
                })}
            transition="width .2s, opacity .2s"
            mt="-1px"
          >
            <IconButton
              rounded={"full"}
              aria-label="Back"
              size="sm"
              icon={<ArrowLeft size={20} />}
              variant="ghost"
              onClick={() => {
                if (
                  isDelegateConnection &&
                  !(isConnectedAndKeyPairReady && !keyPair)
                ) {
                  setIsDelegateConnection(false)
                  return
                }
                set.reset()
                disconnect()
              }}
            />
          </Box>
          <Text>
            {isAddressLink
              ? "Link address"
              : isDelegateConnection
              ? "Connect hot wallet"
              : "Connect wallet"}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ErrorComponent
            {...(set.error || linkAddress.error
              ? {
                  error: set.error ?? linkAddress.error,
                  processError: (err: any) => {
                    if (err?.code === "ACTION_REJECTED") {
                      return {
                        title: "Rejected",
                        description: "Signature request has been rejected",
                      }
                    }

                    return {
                      title: "Error",
                      description:
                        err?.message ?? typeof err?.error === "string"
                          ? err?.error
                          : typeof err === "string"
                          ? err
                          : err?.errors?.[0]?.msg,
                    }
                  },
                }
              : { error, processError: processConnectionError })}
          />
          {isConnectedAndKeyPairReady && !keyPair && (
            <Text mb="6" animation={"fadeIn .3s .1s both"}>
              Sign message to verify that you're the owner of this address.
            </Text>
          )}

          {isWeb3Connected ? (
            <CardMotionWrapper>
              <AccountButton />
            </CardMotionWrapper>
          ) : (
            <Stack spacing="0">
              {!connector && (
                <>
                  <GoogleLoginButton />
                  <Text
                    mt={6}
                    mb={2}
                    textTransform={"uppercase"}
                    fontSize={"xs"}
                    fontWeight={700}
                    color={"gray"}
                  >
                    Or connect with wallet
                  </Text>
                </>
              )}

              {connectors
                .filter(
                  (conn) =>
                    (isInSafeContext || conn.id !== "safe") &&
                    (!!connector || conn.id !== "cwaasWallet")
                )
                .map((conn) => (
                  <CardMotionWrapper key={conn.id}>
                    <ConnectorButton
                      connector={conn}
                      connect={connect}
                      isLoading={isLoading}
                      pendingConnector={pendingConnector}
                      error={error}
                    />
                  </CardMotionWrapper>
                ))}
              {!isDelegateConnection && (
                <CardMotionWrapper>
                  <DelegateCashButton />
                </CardMotionWrapper>
              )}
              {windowFuel && (
                <CardMotionWrapper key="fuel">
                  <FuelConnectorButtons />
                </CardMotionWrapper>
              )}
            </Stack>
          )}

          {isConnectedAndKeyPairReady && !keyPair && (
            <>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                size="invisible"
              />
              <Box animation={"fadeIn .3s .1s both"}>
                <ModalButton
                  data-test="verify-address-button"
                  size="xl"
                  mb="4"
                  colorScheme={"green"}
                  onClick={() => {
                    if (isAddressLink) {
                      return linkAddress.onSubmit(addressLinkParams)
                    }
                    return set.onSubmit()
                  }}
                  isLoading={linkAddress.isLoading || set.isLoading || !id}
                  isDisabled={!id}
                  loadingText={!id ? "Looking for keypairs" : "Check your wallet"}
                >
                  {isAddressLink ? "Link address" : "Verify address"}
                </ModalButton>
              </Box>
            </>
          )}
        </ModalBody>
        <ModalFooter mt="-4">
          {!isConnectedAndKeyPairReady ? (
            <Stack textAlign="center" fontSize="sm" w="full">
              <Text colorScheme="gray">
                New to Ethereum wallets?{" "}
                <Link
                  colorScheme="blue"
                  href="https://ethereum.org/en/wallets/"
                  isExternal
                >
                  Learn more
                  <Icon as={ArrowSquareOut} mx="1" />
                </Link>
              </Text>

              <Text colorScheme="gray">
                By continuing, you agree to our{" "}
                <Link
                  href="/privacy-policy"
                  fontWeight={"semibold"}
                  onClick={onClose}
                >
                  Privacy Policy
                </Link>
                {` and `}
                <Link
                  href="/terms-and-conditions"
                  fontWeight={"semibold"}
                  onClick={onClose}
                >
                  Terms & conditions
                </Link>
              </Text>
            </Stack>
          ) : (
            <Stack textAlign="center" fontSize="sm" w="full">
              <Text colorScheme={"gray"}>
                Signing the message doesn't cost any gas
              </Text>
              <Text colorScheme="gray">
                This site is protected by reCAPTCHA, so the Google{" "}
                <Link
                  href="https://policies.google.com/privacy"
                  isExternal
                  fontWeight={"semibold"}
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="https://policies.google.com/terms"
                  isExternal
                  fontWeight={"semibold"}
                >
                  Terms of Service
                </Link>{" "}
                apply
              </Text>
            </Stack>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default WalletSelectorModal
