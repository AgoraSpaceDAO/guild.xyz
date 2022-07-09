import {
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import { Modal } from "components/common/Modal"
import { Web3Connection } from "components/_app/Web3ConnectionManager"
import { useContext } from "react"
import NetworkButtonsList from "./components/NetworkButtonsList"

const NetworkModal = ({ isOpen, onClose }) => {
  const { listedChainIDs } = useContext(Web3Connection)

  const modalSize = useBreakpointValue({ base: "lg", md: "2xl", lg: "4xl" })

  const { isActive } = useWeb3React()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isActive ? "Supported networks" : "Select network"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!listedChainIDs?.length && (
            <Text mb={8}>
              It doesn't matter which supported chain you're connected to, it's only
              used to know your address and sign messages so each will work equally.
            </Text>
          )}
          <NetworkButtonsList manualNetworkChangeCallback={onClose} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default NetworkModal
