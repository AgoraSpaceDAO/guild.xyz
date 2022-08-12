import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import PermissionSelection from "components/common/GoogleGuildSetup/components/PermissionSelection"
import { useRolePlatform } from "components/[guild]/RolePlatforms/components/RolePlatformProvider"
import capitalize from "utils/capitalize"

const MOCK_ROLE = "mocked role"

const GoogleCardSettings = () => {
  const { platformRoleData, guildPlatform, index } = useRolePlatform()

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <HStack>
        <Text color="gray">{capitalize(platformRoleData?.role ?? MOCK_ROLE)}</Text>
        <Button size="sm" onClick={onOpen}>
          Edit
        </Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PermissionSelection
              fieldName={`rolePlatforms.${index}.platformRoleData.role`}
              mimeType={guildPlatform?.platformGuildData?.mimeType}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GoogleCardSettings
