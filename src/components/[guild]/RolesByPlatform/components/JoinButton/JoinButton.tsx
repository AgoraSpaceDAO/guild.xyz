import {
  Box,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { PlatformType } from "types"
import useAccess from "../../hooks/useAccess"
import useJoinSuccessToast from "./components/JoinModal/hooks/useJoinSuccessToast"
import JoinModal from "./components/JoinModal/JoinModal"

type Props = {
  platform: PlatformType
}

const styleProps = { h: 10, flexShrink: 0 }

const JoinButton = ({ platform }: Props): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const { hasAccess, isLoading } = useAccess()

  useJoinSuccessToast(onClose, platform)
  const router = useRouter()

  useEffect(() => {
    if (hasAccess && router.query.hash) onOpen()
  }, [hasAccess])

  const bgColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("black", "white")
  const buttonText = useBreakpointValue({
    base: "Join Guild",
    md: "Join Guild to get roles",
  })

  if (isLoading) {
    return (
      <Box bgColor={bgColor} borderRadius="xl">
        <Button
          {...styleProps}
          isLoading
          loadingText="Checking access"
          data-dd-action-name="Checking access"
          color={textColor}
        />
      </Box>
    )
  }

  return (
    <Box bgColor={bgColor} borderRadius="xl">
      <Button
        {...styleProps}
        onClick={onOpen}
        colorScheme="green"
        data-dd-action-name="Join"
      >
        {buttonText}
      </Button>
      <JoinModal {...{ isOpen, onClose }} />
    </Box>
  )
}

export default JoinButton
