import { Link } from "@chakra-ui/next-js"
import {
  Center,
  Fade,
  HStack,
  Img,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useClipboard,
  useDisclosure,
} from "@chakra-ui/react"
import { usePostHogContext } from "components/_app/PostHogProvider"
import Button from "components/common/Button"
import { Modal } from "components/common/Modal"
import ConfirmationAlert from "components/create-guild/Requirements/components/ConfirmationAlert"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { Check, Copy, Wallet } from "phosphor-react"
import { useState } from "react"
import { useConnect } from "wagmi"
import {
  WAAS_CONNECTOR_ID,
  WAAS_DEPRECATION_ERROR_MESSAGE,
  WaaSConnector,
} from "wagmiConfig/waasConnector"
import { connectorButtonProps } from "../../ConnectorButton"
import useDriveOAuth from "../hooks/useDriveOAuth"
import { getDriveFileAppProperties, listWalletsOnDrive } from "../utils/googleDrive"

const ExportWaasModal = ({
  onClose,
  isOpen,
}: {
  onClose: () => void
  isOpen: boolean
}) => {
  const alert = useDisclosure()
  const { captureEvent } = usePostHogContext()
  const googleAuth = useDriveOAuth()
  const { connectors, connect } = useConnect()
  const toast = useToast()
  const [hasCopiedAtLeastOnce, setHasCopiedAtLeastOnce] = useState(false)

  const cwaasConnector = connectors.find(
    ({ id }) => id === WAAS_CONNECTOR_ID
  ) as WaaSConnector

  const injectedConnector = connectors.find(({ id }) => id === "injected")

  const {
    response: privateKey,
    isLoading,
    onSubmit: onGeneratePrivateKey,
  } = useSubmit(
    async () => {
      // 1) Google OAuth
      const { authData, error } = await googleAuth.onOpen()

      if (!authData || !!error) {
        // Ignore cases, when the user cancels the OAuth
        if (error?.error !== "access_denied") {
          captureEvent("[WaaS] Google OAuth failed", { error })
        } else {
          captureEvent("[WaaS] Google OAuth denied", { error })
        }
        return
      }

      // 2) Get backup from Drive
      const { files } = await listWalletsOnDrive(authData.access_token)
      if (files.length <= 0) {
        throw new Error(WAAS_DEPRECATION_ERROR_MESSAGE)
      }

      // 3) Restore wallet
      const {
        appProperties: { backupData },
      } = await getDriveFileAppProperties(files[0].id, authData.access_token)
      await cwaasConnector.restoreWallet(backupData)

      // 4) Generate private key
      const pk = await (cwaasConnector as any)
        .exportKeys(backupData)
        .catch(() => null)
      if (!pk?.[0]?.ecKeyPrivate) {
        throw new Error(
          "Failed to export private key, make sure to authenticate with the correct Google account"
        )
      }

      return pk[0].ecKeyPrivate
    },
    {
      onError: (error) => {
        toast({
          status: "error",
          description: error?.message || "Something went wrong, please try again",
        })

        if (error?.message === WAAS_DEPRECATION_ERROR_MESSAGE) {
          onClose()
        }
      },
    }
  )

  const { onCopy, hasCopied } = useClipboard(privateKey, 3000)

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxWidth={privateKey ? "2xl" : undefined}>
          <ModalHeader>
            {privateKey ? "Import & back up your wallet" : "Export Google Wallet"}
          </ModalHeader>
          <ModalBody>
            {!privateKey ? (
              <VStack alignItems={"start"}>
                <Text>
                  This feature is <strong>deprecated</strong>
                </Text>
                <Text>
                  <strong>Import</strong> your Google-based account{" "}
                  <strong>into an external wallet</strong> by authenticating with the
                  button below and following the steps
                </Text>
                <Text>
                  If you don't have a Google-based account or have no value on it,
                  use the <strong>Smart Wallet</strong> sign-in option
                </Text>
              </VStack>
            ) : (
              <HStack alignItems={"start"}>
                <VStack>
                  <Text>
                    You can now copy your private key, and import it into a wallet
                    app, like{" "}
                    <Link
                      href="https://metamask.io"
                      isExternal
                      fontWeight={"semibold"}
                    >
                      MetaMask
                    </Link>
                  </Text>
                  <Text>
                    It is highly recommended to <strong>safely store</strong> the
                    copied private key somewhere, as this export option on Guild
                    won't be available forever
                  </Text>
                  <Text>
                    <strong>Never share the private key with anyone!</strong> This
                    key is the only way to access your wallet, and anyone, who knows
                    the private key has access
                  </Text>
                </VStack>
                <video
                  src="/videos/import-wallet-into-metamask.webm"
                  muted
                  autoPlay
                  loop
                  width={300}
                  style={{
                    borderRadius: 8,
                  }}
                >
                  Your browser does not support the HTML5 video tag.
                </video>
              </HStack>
            )}
          </ModalBody>
          <ModalFooter>
            {!privateKey ? (
              <Button
                onClick={onGeneratePrivateKey}
                colorScheme={"white"}
                borderWidth="2px"
                isLoading={isLoading}
                loadingText={
                  googleAuth.isAuthenticating
                    ? "Auhenticate in the popup"
                    : "Generating private key"
                }
                leftIcon={
                  <Center boxSize={6}>
                    <Img
                      src={`/walletLogos/google.svg`}
                      maxW={6}
                      maxH={6}
                      alt={`Google logo`}
                    />
                  </Center>
                }
                {...connectorButtonProps}
              >
                Authenticate with Google
              </Button>
            ) : (
              <HStack>
                <Fade in={hasCopiedAtLeastOnce}>
                  <Button leftIcon={<Wallet />} onClick={alert.onOpen}>
                    Backup and import done
                  </Button>
                </Fade>

                <Button
                  onClick={() => {
                    onCopy()
                    setHasCopiedAtLeastOnce(true)
                  }}
                  isDisabled={hasCopied}
                  colorScheme="white"
                  borderWidth="2px"
                  leftIcon={hasCopied ? <Check /> : <Copy />}
                >
                  {hasCopied ? "Private key copied" : "Copy private key"}
                </Button>
              </HStack>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ConfirmationAlert
        isOpen={alert.isOpen}
        onClose={alert.onClose}
        onConfirm={() => {
          alert.onClose()
          onClose()
          connect({ connector: injectedConnector })
        }}
        title="Are you sure?"
        description="Please double check that the wallet has been imported and it is backed up safely"
        confirmationText="I'm sure"
      />
    </>
  )
}

export default ExportWaasModal
