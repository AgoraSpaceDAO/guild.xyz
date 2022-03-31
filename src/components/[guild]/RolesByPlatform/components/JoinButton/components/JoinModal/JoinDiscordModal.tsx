import {
  HStack,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Error } from "components/common/Error"
import { Modal } from "components/common/Modal"
import ModalButton from "components/common/ModalButton"
import useUser from "components/[guild]/hooks/useUser"
import { CheckCircle } from "phosphor-react"
import platformsContent from "../../platformsContent"
import DCAuthButton from "./components/DCAuthButton"
import InviteLink from "./components/InviteLink"
import useDCAuth from "./hooks/useDCAuth"
import useJoinPlatform from "./hooks/useJoinPlatform"
import processJoinPlatformError from "./utils/processJoinPlatformError"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const JoinDiscordModal = ({ isOpen, onClose }: Props): JSX.Element => {
  const {
    title,
    join: { description },
  } = platformsContent.DISCORD
  const {
    onOpen,
    data: { id },
    error,
    isAuthenticating,
  } = useDCAuth()
  const { discordId: idKnownOnBackend } = useUser()
  const {
    response,
    isLoading,
    onSubmit,
    error: joinError,
    isSigning,
  } = useJoinPlatform("DISCORD", id)

  // if addressSignedMessage is already known, submit useJoinPlatform on DC auth
  /* useEffect(() => {
    if (
      authState.matches({ idKnown: "successNotification" }) &&
      addressSignedMessage
    )
      onSubmit()
  }, [authState]) */

  // if both addressSignedMessage and DC is already known, submit useJoinPlatform on modal open
  /* useEffect(() => {
    if (isOpen && addressSignedMessage && authState.matches("idKnown") && !response)
      onSubmit()
  }, [isOpen]) */

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Join {title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Error
            error={error || joinError}
            processError={processJoinPlatformError}
          />
          {!response ? (
            <Text>{description}</Text>
          ) : (
            /** Negative margin bottom to offset the Footer's padding that's there anyway */
            <VStack spacing="6" mb="-8" alignItems="left">
              {response.alreadyJoined ? (
                <HStack spacing={6}>
                  <Icon
                    as={CheckCircle}
                    color="green.500"
                    boxSize="16"
                    weight="light"
                  />
                  <Text>
                    Seems like you've already joined the Discord server, you should
                    get access to the correct channels soon!
                  </Text>
                </HStack>
              ) : (
                <InviteLink inviteLink={response.inviteLink} />
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          {/* margin is applied on AuthButton, so there's no jump when it collapses and unmounts */}
          <VStack spacing="0" alignItems="strech" w="full">
            {!idKnownOnBackend && (
              <DCAuthButton {...{ onOpen, id, error, isAuthenticating }} />
            )}
            {(() => {
              if (!id && !idKnownOnBackend)
                return (
                  <ModalButton disabled colorScheme="gray">
                    Verify address
                  </ModalButton>
                )
              if (isSigning)
                return <ModalButton isLoading loadingText="Check your wallet" />
              if (isLoading)
                return <ModalButton isLoading loadingText="Generating invite link" />
              if (joinError)
                return <ModalButton onClick={onSubmit}>Try again</ModalButton>
              if ((!!id || idKnownOnBackend) && !response)
                return <ModalButton onClick={onSubmit}>Verify address</ModalButton>
            })()}
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default JoinDiscordModal
