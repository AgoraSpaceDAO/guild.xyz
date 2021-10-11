import {
  Flex,
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
import Link from "components/common/Link"
import Modal from "components/common/Modal"
import ModalButton from "components/common/ModalButton"
import usePersonalSign from "hooks/usePersonalSign"
import { ArrowSquareOut, CheckCircle } from "phosphor-react"
import QRCode from "qrcode.react"
import platformsContent from "../../platformsContent"
import DCAuthButton from "./components/DCAuthButton"
import useDCAuthMachine from "./hooks/useDCAuthMachine"
import useJoinPlatform from "./hooks/useJoinPlatform"
import processJoinPlatformError from "./utils/processJoinPlatformError"

type Props = {
  platform?: string
  isOpen: boolean
  onClose: () => void
}

const JoinDiscordModal = ({
  platform = "DISCORD",
  isOpen,
  onClose,
}: Props): JSX.Element => {
  const {
    title,
    join: { description },
  } = platformsContent[platform]
  const [authState, authSend] = useDCAuthMachine()
  const {
    data,
    isLoading,
    onSubmit,
    error: joinError,
    removeError,
  } = useJoinPlatform("DISCORD", authState.context.id)
  const {
    error: signError,
    isSigning,
    callbackWithSign,
    removeError: removeSignError,
  } = usePersonalSign()

  const closeModal = () => {
    authSend("CLOSE_MODAL")
    removeError()
    removeSignError()
    onClose()
  }

  const handleJoin = () => {
    authSend("HIDE_NOTIFICATION")
    callbackWithSign(onSubmit())()
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Join {title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Error
            error={authState.context.error || joinError || signError}
            processError={processJoinPlatformError}
          />
          {!data ? (
            <Text>{description}</Text>
          ) : (
            /** Negative margin bottom to offset the Footer's padding that's there anyway */
            <VStack spacing="6" mb="-8">
              {data.alreadyJoined ? (
                <Flex alignItems="center">
                  <Icon
                    as={CheckCircle}
                    color="green.500"
                    boxSize="16"
                    weight="light"
                  />
                  <Text ml="6">
                    Seems like you've already joined the Discord server, you should
                    get access to the correct channels soon!
                  </Text>
                </Flex>
              ) : (
                <>
                  <Text>Here’s your invite link:</Text>
                  <Link href={data.inviteLink} colorScheme="blue" isExternal>
                    {data.inviteLink}
                    <Icon as={ArrowSquareOut} mx="2" />
                  </Link>
                  <QRCode size={150} value={data.inviteLink} />
                </>
              )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          {/* margin is applied on AuthButton, so there's no jump when it collapses and unmounts */}
          <VStack spacing="0" alignItems="strech">
            <DCAuthButton state={authState} send={authSend} />
            {["successNotification", "idKnown"].some(authState.matches) ? (
              (() => {
                if (data) return null
                if (isSigning)
                  return (
                    <ModalButton isLoading loadingText="Waiting for confirmation" />
                  )
                if (isLoading)
                  return (
                    <ModalButton isLoading loadingText="Generating invite link" />
                  )
                return <ModalButton onClick={handleJoin}>Join {title}</ModalButton>
              })()
            ) : (
              <ModalButton disabled colorScheme="gray">
                Sign
              </ModalButton>
            )}
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default JoinDiscordModal
