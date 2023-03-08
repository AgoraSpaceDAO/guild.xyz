import {
  Box,
  ButtonProps,
  Center,
  Icon,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import Button from "components/common/Button"
import ErrorAlert from "components/common/ErrorAlert"
import { Modal } from "components/common/Modal"
import useAccess from "components/[guild]/hooks/useAccess"
import { useRequirementContext } from "components/[guild]/Requirements/components/RequirementContext"
import { Robot } from "phosphor-react"
import { useEffect } from "react"
import useSWRImmutable from "swr/immutable"
import { useFetcherWithSign } from "utils/fetcher"
import useVerifyCaptcha from "../hooks/useVerifyCaptcha"

const CompleteCaptcha = (props: ButtonProps): JSX.Element => {
  const { id, roleId } = useRequirementContext()
  const { onOpen, onClose, isOpen } = useDisclosure()

  const { data: roleAccess } = useAccess(roleId, isOpen && { refreshInterval: 5000 })

  const hasAccess = roleAccess?.requirements?.find(
    (req) => req.requirementId === id
  )?.access

  if (!roleAccess || hasAccess) return null

  return (
    <>
      <Button
        size="xs"
        onClick={onOpen}
        colorScheme="cyan"
        leftIcon={<Icon as={Robot} />}
        iconSpacing="1"
        {...props}
      >
        Complete CAPTCHA
      </Button>

      <CompleteCaptchaModal onClose={onClose} isOpen={isOpen} />
    </>
  )
}

const CompleteCaptchaModal = ({ isOpen, onClose }) => {
  const { type } = useRequirementContext()

  const fetcherWithSign = useFetcherWithSign()
  const {
    data: getGateCallbackData,
    isValidating,
    error: getGateCallbackError,
  } = useSWRImmutable(
    isOpen ? [`/util/getGateCallback/${type}`, { body: {} }] : null,
    fetcherWithSign
  )

  const { onSubmit, isLoading, response } = useVerifyCaptcha()

  useEffect(() => {
    if (!response) return
    onClose()
  }, [response])

  return (
    <Modal
      {...{
        isOpen,
        onClose,
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Complete CAPTCHA</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Center flexDirection={"column"}>
            {getGateCallbackError ? (
              <ErrorAlert label="Couldn't generate CAPTCHA" />
            ) : (!getGateCallbackData?.callbackUrl && isValidating) || isLoading ? (
              <>
                <Spinner size="xl" mt="8" />
                <Text mt="4" mb="8">
                  {`${isLoading ? "Verifying" : "Generating"} CAPTCHA`}
                </Text>
              </>
            ) : (
              <>
                <Box>
                  <HCaptcha
                    sitekey="05bdce9d-3de2-4457-8318-85633ffd281c"
                    onVerify={(token) =>
                      onSubmit({
                        callback: getGateCallbackData?.callbackUrl,
                        token,
                      })
                    }
                  />
                </Box>
                <Text mt="10" textAlign="center">
                  Please complete the CAPTCHA above! The modal will automatically
                  close on success
                </Text>
              </>
            )}
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default CompleteCaptcha
