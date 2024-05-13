import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Divider,
  HStack,
  Heading,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import RequirementDisplayComponent from "components/[guild]/Requirements/components/RequirementDisplayComponent"
import Card from "components/common/Card"
import { Lightning, Question, X } from "phosphor-react"
import { Requirement, RolePlatform } from "types"

const SnapshotRequirementDetails = ({
  requirement,
  rolePlatform,
}: {
  requirement?: Requirement
  rolePlatform: RolePlatform
}) => {
  const dynamicAmount: any = rolePlatform.dynamicAmount.operation

  return (
    <>
      <HStack mb="3">
        <Heading fontSize="md">Linked to value</Heading>
        <Tooltip
          label="For dynamic rewards, the reward amount is calculated from a base value, originated from a requirement. "
          placement="bottom"
          hasArrow
        >
          <Icon as={Question} color="GrayText" />
        </Tooltip>
      </HStack>
      <Stack>
        {requirement !== undefined && (
          <Card px={4} py={2}>
            <RequirementDisplayComponent
              requirement={requirement as Requirement}
              dynamicDisplay
            />
          </Card>
        )}
        {!requirement && (
          <Alert status="warning">
            <AlertIcon mt={0} /> This reward is not linked to any specific
            requirements and therefore will not distribute any tokens.
          </Alert>
        )}
      </Stack>

      <Stack mt={8}>
        <HStack>
          <Heading fontSize="md">With conversion</Heading>
          <Tooltip
            label="Your claimable token amount is determined by applying a conversion function to your points from the snapshot."
            placement="bottom"
            hasArrow
          >
            <Icon as={Question} color="GrayText" />
          </Tooltip>
        </HStack>

        <HStack gap={1}>
          <Text fontWeight={"semibold"} ml="auto" colorScheme="gray" fontSize="sm">
            Multiplier:
          </Text>
          <Icon boxSize={3} as={X} />
          <Text fontWeight={"semibold"} mr={2} fontSize="sm">
            {dynamicAmount.params.multiplier}
          </Text>
        </HStack>
      </Stack>
    </>
  )
}

const DynamicRewardModal = ({
  isOpen,
  onClose,
  linkedRequirement,
  rolePlatform,
}: {
  isOpen: boolean
  onClose: () => void
  linkedRequirement?: Requirement
  rolePlatform: RolePlatform
}) => {
  const handleClose = () => {
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={"lg"} colorScheme={"dark"}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>
          <Text>
            <Icon color="green.500" boxSize={4} weight="fill" as={Lightning} />{" "}
            Dynamic Reward
          </Text>
        </ModalHeader>

        <ModalBody>
          <SnapshotRequirementDetails
            rolePlatform={rolePlatform}
            requirement={linkedRequirement}
          />

          <Stack mt="8">
            <Divider mb={1} mt={3} />
            <Accordion allowToggle>
              <AccordionItem border={"none"}>
                <AccordionButton
                  display={"flex"}
                  rounded={"lg"}
                  fontWeight={"semibold"}
                  px={0}
                  opacity={0.5}
                  _hover={{ opacity: 1 }}
                >
                  <Icon as={Question} mr={2} />
                  What's a dynamic reward?
                  <AccordionIcon ml={"auto"} />
                </AccordionButton>
                <AccordionPanel>
                  <Text color={"GrayText"}>
                    Dynamic rewards adjust the amount of rewards you can earn based
                    on various factors, like completing specific requirements,
                    accumulating points, or your activities within the guild.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default DynamicRewardModal
