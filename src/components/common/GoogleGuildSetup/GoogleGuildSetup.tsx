import {
  ButtonGroup,
  GridItem,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  useClipboard,
  useDisclosure,
  usePrevious,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import useUser from "components/[guild]/hooks/useUser"
import { useWeb3ConnectionManager } from "components/_app/Web3ConnectionManager"
import { AnimatePresence } from "framer-motion"
import { Check, CopySimple, PencilSimple } from "phosphor-react"
import { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { PlatformType } from "types"
import AddCard from "../AddCard"
import CardMotionWrapper from "../CardMotionWrapper"
import { Modal } from "../Modal"
import GoogleDocCard, { GoogleSkeletonCard } from "./components/GoogleDocCard"
import GoogleDocSetupCard from "./components/GoogleDocSetupCard"
import useGoogleGateables from "./hooks/useGoogleGateables"

type Props = {
  defaultValues: Record<string, any>
  fieldNameBase?: string
  onSelect?: (dataToAppend: any) => void
  shouldSetName?: boolean
  permissionField?: string
  skipSettings?: boolean
}

const GoogleGuildSetup = ({
  defaultValues,
  fieldNameBase = "",
  onSelect,
  shouldSetName,
  permissionField,
  skipSettings,
}: Props): JSX.Element => {
  const fieldName = `${fieldNameBase}platformGuildId`

  const { googleGateables, isGoogleGateablesLoading } = useGoogleGateables()

  const { isOpen, onClose, onOpen } = useDisclosure()

  const prevGoogleGateables = usePrevious(googleGateables)
  useEffect(() => {
    if (googleGateables?.length > prevGoogleGateables?.length) {
      onClose()
    }
  }, [prevGoogleGateables, googleGateables])
  useEffect(() => {
    if (googleGateables?.length === 0) onOpen()
  }, [googleGateables])

  const { control, setValue, reset, handleSubmit } = useFormContext()
  const platformGuildId = useWatch({ control, name: fieldName })

  const selectedFile = googleGateables?.find(
    (file) => file.platformGuildId === platformGuildId
  )

  const [showForm, setShowForm] = useState(false)

  const resetForm = () => {
    reset(defaultValues)
    setValue(fieldName, null)
  }

  const handleSelect = onSelect ? handleSubmit(onSelect) : undefined

  useEffect(() => {
    if (selectedFile)
      setTimeout(() => {
        setShowForm(true)
      }, 300)
    else setShowForm(false)
  }, [selectedFile])

  if (isGoogleGateablesLoading)
    return (
      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 3 }}
        spacing={{ base: 4, md: 6 }}
        alignItems="stretch"
      >
        {[...Array(5)].map((_, i) => (
          <GridItem key={i}>
            <GoogleSkeletonCard />
          </GridItem>
        ))}
      </SimpleGrid>
    )

  return (
    <>
      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 3 }}
        spacing={{ base: 4, md: 6 }}
        alignItems="stretch"
      >
        <AnimatePresence>
          {(selectedFile ? [selectedFile] : googleGateables)?.map((file) => (
            <CardMotionWrapper key={file.platformGuildId}>
              <GridItem>
                <GoogleDocCard
                  file={file}
                  onSelect={
                    selectedFile
                      ? undefined
                      : (newPlatformGuildId: string) => {
                          setValue(fieldName, newPlatformGuildId)
                          if (!fieldNameBase?.length)
                            setValue(`platformGuildName`, file.name)
                          if (shouldSetName) setValue("name", file.name)

                          setValue(`${fieldNameBase}platformGuildData`, {
                            mimeType: file.mimeType,
                            iconLink: file.iconLink,
                          })

                          if (skipSettings) handleSelect()
                        }
                  }
                  onCancel={
                    selectedFile?.platformGuildId !== file.platformGuildId
                      ? undefined
                      : resetForm
                  }
                />
              </GridItem>
            </CardMotionWrapper>
          ))}

          {!selectedFile && (
            <CardMotionWrapper key={"add-file"}>
              <AddCard text="Add document" minH={"28"} onClick={onOpen} />
            </CardMotionWrapper>
          )}
        </AnimatePresence>
        {showForm && (
          <GridItem>
            <GoogleDocSetupCard
              fieldNameBase={fieldNameBase}
              onSubmit={handleSelect}
              permissionField={permissionField}
            />
          </GridItem>
        )}
      </SimpleGrid>

      <AddDocumentModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}

const GUILD_EMAIL_ADDRESS = process.env.NEXT_PUBLIC_GOOGLE_SERVICE_ACCOUNT_EMAIL
const AddDocumentModal = ({ isOpen, onClose = undefined }) => {
  const { platformUsers } = useUser()
  const googleAcc = platformUsers?.find(
    (acc) => acc.platformId === PlatformType.GOOGLE
  )

  const { hasCopied, onCopy } = useClipboard(GUILD_EMAIL_ADDRESS)
  const { openAccountModal } = useWeb3ConnectionManager()

  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent minW={{ base: "auto", md: "2xl" }}>
        <ModalHeader>Add document</ModalHeader>
        {onClose && <ModalCloseButton />}
        <ModalBody as={Stack} spacing="4" pb="2">
          <Text>
            Invite the official Guild.xyz email address as an editor to the file you
            want to gate so it can manage accesses:
          </Text>
          <ButtonGroup isAttached display="flex" my="2">
            <Button
              variant="outline"
              isDisabled
              opacity="1 !important"
              fontWeight={"bold"}
            >
              {GUILD_EMAIL_ADDRESS}
            </Button>
            <Button
              flexShrink="0"
              onClick={onCopy}
              colorScheme="blue"
              rightIcon={hasCopied ? <Check /> : <CopySimple />}
              fontWeight={"bold"}
            >
              {hasCopied ? "Copied" : `Copy`}
            </Button>
          </ButtonGroup>

          <video src="/videos/google-config-guide.webm" muted autoPlay loop>
            Your browser does not support the HTML5 video tag.
          </video>
        </ModalBody>
        <ModalFooter pb="8" pt="5">
          <Text colorScheme={"gray"}>
            You have to be the owner of the file with your connected account:{" "}
            <Button
              variant="link"
              color="inherit"
              onClick={openAccountModal}
              rightIcon={<PencilSimple />}
            >
              {googleAcc?.platformUserData?.username}
            </Button>
          </Text>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default GoogleGuildSetup
