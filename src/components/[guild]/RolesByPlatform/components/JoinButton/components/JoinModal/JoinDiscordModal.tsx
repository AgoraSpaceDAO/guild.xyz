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
import { useState } from "react"
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

const fetchUserID = async (authorization: string): Promise<string> => {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      authorization,
    },
  }).catch(() => {
    Promise.reject({
      error: "Network error",
      errorDescription:
        "Unable to connect to Discord server. If you're using some tracking blocker extension, please try turning that off",
    })
    return undefined
  })

  if (!response?.ok) {
    Promise.reject({
      error: "Discord error",
      errorDescription: "There was an error, while fetching the user data",
    })
  }

  const { id } = await response.json()
  return id
}

const JoinDiscordModal = ({ isOpen, onClose }: Props): JSX.Element => {
  const {
    title,
    join: { description },
  } = platformsContent.DISCORD
  const { discordId: idKnownOnBackend } = useUser()
  const { onOpen, data: id, error, isAuthenticating } = useDCAuth(fetchUserID)
  const [hideDCAuthNotification, setHideDCAuthNotification] = useState(false)
  const {
    response,
    isLoading,
    onSubmit,
    error: joinError,
    isSigning,
  } = useJoinPlatform("DISCORD", id)

  const onJoinSubmit = () => {
    setHideDCAuthNotification(true)
    onSubmit()
  }

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
              <DCAuthButton
                {...{
                  onOpen,
                  id,
                  isAuthenticating,
                  hideDCAuthNotification,
                  setHideDCAuthNotification,
                }}
              />
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

              return <ModalButton onClick={onJoinSubmit}>Verify address</ModalButton>
            })()}
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default JoinDiscordModal
