import {
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import { Modal } from "components/common/Modal"
import AlphaTag from "./components/AlphaTag"
import MintCredentialButton from "./components/buttons/MintCredentialButton"
import CredentialFees from "./components/CredentialFees"
import CredentialImage from "./components/CredentialImage"
import MintCredentialChainPicker from "./components/MintCredentialChainPicker"
import TransactionStatusModal from "./components/TransactionStatusModal"
import OpenseaLink from "./components/TransactionStatusModal/components/OpenseaLink"
import { useMintCredentialContext } from "./MintCredentialContext"

const MintCredential = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useMintCredentialContext()

  const { colorMode } = useColorMode()

  return (
    <>
      <Button
        onClick={onOpen}
        data-dd-action-name="Mint Credential"
        variant="outline"
        borderColor={colorMode === "dark" ? "whiteAlpha.200" : "blackAlpha.200"}
        {...(colorMode === "light"
          ? {
              _hover: {
                bg: "blackAlpha.50",
              },
              _active: {
                bg: "blackAlpha.200",
              },
            }
          : {})}
      >
        Mint Credential
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} colorScheme="dark">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader pb={4} pr={16}>
            <Text as="span" mr={2}>
              Mint Credential
            </Text>
            <AlphaTag />
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb="6">
            <CredentialImage />
          </ModalBody>

          <ModalFooter flexDir="column">
            <Stack w="full" spacing={4}>
              <MintCredentialChainPicker />
              <CredentialFees />
              <MintCredentialButton />
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <TransactionStatusModal
        title="Mint Credential"
        successTitle="Successful mint"
        successText="Successful transaction! You've just received your Guild Credential NFT!"
        successLinkComponent={<OpenseaLink />}
        errorComponent={<Text mb={4}>Couldn't mint credential</Text>}
      />
    </>
  )
}

export default MintCredential
