import {
  Box,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react"
import { SignOut } from "@phosphor-icons/react"
import LogicDivider from "components/[guild]/LogicDivider"
import Button from "components/common/Button"
import { Modal } from "components/common/Modal"
import { useAtom } from "jotai"
import { walletLinkHelperModalAtom } from "../Providers/atoms"

const WalletLinkHelperModal = () => {
  const [isWalletLinkHelperModalOpen, setIsWalletLinkModalOpen] = useAtom(
    walletLinkHelperModalAtom
  )

  const onClose = () => setIsWalletLinkModalOpen(false)

  return (
    <Modal isOpen={isWalletLinkHelperModalOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Link address</ModalHeader>
        <ModalBody>
          <Text mt="-3">
            Please switch to the account you want to link and connect with it in your
            wallet!
          </Text>
          <Box borderRadius={"lg"} overflow="hidden" mt="4" minH="448px">
            <video src="/videos/metamask-switch-account.webm" muted autoPlay loop>
              Your browser does not support the HTML5 video tag.
            </video>
          </Box>
          <LogicDivider logic="OR" my="1" />
          <Button onClick={onClose} w="full" rightIcon={<SignOut />}>
            Connect another wallet
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
export default WalletLinkHelperModal
