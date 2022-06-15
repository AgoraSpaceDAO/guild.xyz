import {
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  DrawerProps,
  FormLabel,
  HStack,
  Stack,
  useBreakpointValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import DiscardAlert from "components/common/DiscardAlert"
import DrawerHeader from "components/common/DrawerHeader"
import Section from "components/common/Section"
import Description from "components/create-guild/Description"
import DynamicDevTool from "components/create-guild/DynamicDevTool"
import IconSelector from "components/create-guild/IconSelector"
import Name from "components/create-guild/Name"
import MembersToggle from "components/[guild]/EditGuild/components/MembersToggle"
import UrlName from "components/[guild]/EditGuild/components/UrlName"
import useGuild from "components/[guild]/hooks/useGuild"
import { useThemeContext } from "components/[guild]/ThemeContext"
import usePinata from "hooks/usePinata"
import useSubmitWithUpload from "hooks/useSubmitWithUpload"
import useWarnIfUnsavedChanges from "hooks/useWarnIfUnsavedChanges"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { GuildFormType, PlatformNames } from "types"
import getRandomInt from "utils/getRandomInt"
import useGuildPermission from "../hooks/useGuildPermission"
import Admins from "./components/Admins"
import BackgroundImageUploader from "./components/BackgroundImageUploader"
import ColorModePicker from "./components/ColorModePicker"
import ColorPicker from "./components/ColorPicker"
import DeleteGuildButton from "./components/DeleteGuildButton"
import Guard from "./components/Guard"
import HideFromExplorerToggle from "./components/HideFromExplorerToggle"
import useEditGuild from "./hooks/useEditGuild"

type Props = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

const EditGuildButton = ({
  finalFocusRef,
  isOpen,
  onOpen,
  onClose,
}: Omit<DrawerProps & Props, "children">): JSX.Element => {
  const drawerSize = useBreakpointValue({ base: "full", md: "xl" })
  const { isOwner } = useGuildPermission()

  const {
    name,
    imageUrl,
    description,
    theme,
    showMembers,
    admins,
    urlName,
    guildPlatforms,
    hideFromExplorer,
    roles,
  } = useGuild()
  const isGuarded = roles?.some((role) =>
    role?.rolePlatforms?.some(
      (rolePlatform) => rolePlatform?.platformRoleData?.isGuarded
    )
  )

  const defaultValues = {
    name,
    imageUrl,
    description,
    theme: theme ?? {},
    showMembers,
    admins: admins?.flatMap((admin) => admin.address) ?? [],
    urlName,
    isGuarded,
    hideFromExplorer,
    guildPlatforms,
  }
  const methods = useForm<GuildFormType>({
    mode: "all",
    defaultValues,
  })

  const onSuccess = () => {
    onClose()
    methods.reset(undefined, { keepValues: true })
  }

  const { onSubmit, isLoading, isSigning } = useEditGuild({ onSuccess })

  const {
    localThemeColor,
    setLocalThemeMode,
    localThemeMode,
    setLocalThemeColor,
    localBackgroundImage,
    setLocalBackgroundImage,
  } = useThemeContext()

  useWarnIfUnsavedChanges(
    methods.formState?.isDirty && !methods.formState.isSubmitted
  )

  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure()

  const onCloseAndClear = () => {
    const themeMode = theme?.mode
    const themeColor = theme?.color
    const backgroundImage = theme?.backgroundImage
    if (themeMode !== localThemeMode) setLocalThemeMode(themeMode)
    if (themeColor !== localThemeColor) setLocalThemeColor(themeColor)
    if (backgroundImage !== localBackgroundImage)
      setLocalBackgroundImage(backgroundImage)
    methods.reset()
    onAlertClose()
    onClose()
  }

  const iconUploader = usePinata({
    onSuccess: ({ IpfsHash }) => {
      methods.setValue(
        "imageUrl",
        `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${IpfsHash}`,
        { shouldTouch: true }
      )
    },
    onError: () => {
      methods.setValue("imageUrl", `/guildLogos/${getRandomInt(286)}.svg`, {
        shouldTouch: true,
      })
    },
  })

  const backgroundUploader = usePinata({
    onSuccess: ({ IpfsHash }) => {
      methods.setValue(
        "theme.backgroundImage",
        `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${IpfsHash}`
      )
    },
    onError: () => {
      setLocalBackgroundImage(null)
    },
  })

  const { handleSubmit, isUploadingShown } = useSubmitWithUpload(
    methods.handleSubmit(onSubmit),
    backgroundUploader.isUploading || iconUploader.isUploading
  )

  const loadingText = (): string => {
    if (isSigning) return "Check your wallet"
    if (backgroundUploader.isUploading || iconUploader.isUploading)
      return "Uploading image"
    return "Saving data"
  }

  const isDirty =
    methods?.formState?.isDirty ||
    backgroundUploader.isUploading ||
    iconUploader.isUploading

  const router = useRouter()

  useEffect(() => {
    if (router.query.focusGuard) {
      onOpen()
      setTimeout(() => {
        methods.setFocus("isGuarded")
        methods.setValue("isGuarded", true)
      }, 500)
    }
  }, [])

  return (
    <>
      <Drawer
        isOpen={isOpen}
        placement="left"
        size={drawerSize}
        onClose={isDirty ? onAlertOpen : onClose}
        finalFocusRef={finalFocusRef}
      >
        <DrawerOverlay />
        <FormProvider {...methods}>
          <DrawerContent>
            <DrawerBody className="custom-scrollbar">
              <DrawerHeader title="Edit guild">
                <DeleteGuildButton />
              </DrawerHeader>
              <VStack spacing={10} alignItems="start">
                <Section title="General" spacing="6">
                  <Stack
                    w="full"
                    spacing="6"
                    direction={{ base: "column", md: "row" }}
                  >
                    <Box>
                      <FormLabel>Logo and name</FormLabel>
                      <HStack spacing={2} alignItems="start">
                        <IconSelector uploader={iconUploader} />
                        <Name />
                      </HStack>
                    </Box>
                    <UrlName />
                  </Stack>
                  <Description />
                </Section>

                <Section title="Appearance" spacing="6">
                  <Stack
                    direction={{ base: "column", md: "row" }}
                    justifyContent={"space-between"}
                    spacing="6"
                    sx={{
                      "> *": {
                        flex: "1 0",
                      },
                    }}
                  >
                    <ColorPicker fieldName="theme.color" />
                    <BackgroundImageUploader uploader={backgroundUploader} />
                    <ColorModePicker fieldName="theme.mode" />
                  </Stack>
                </Section>

                <Divider />

                <Section title="Security">
                  <MembersToggle />
                  <HideFromExplorerToggle />
                  {guildPlatforms?.[0]?.platformId === PlatformNames.DISCORD && (
                    <Guard
                      isOn={isGuarded}
                      isDisabled={!roles?.[0]?.rolePlatforms?.[0]?.platformRoleId}
                    />
                  )}

                  {isOwner && <Admins />}
                </Section>
              </VStack>
            </DrawerBody>

            <DrawerFooter>
              <Button variant="outline" mr={3} onClick={onCloseAndClear}>
                Cancel
              </Button>
              <Button
                disabled={
                  /* !isDirty || */ isLoading || isSigning || isUploadingShown
                }
                isLoading={isLoading || isSigning || isUploadingShown}
                colorScheme="green"
                loadingText={loadingText()}
                onClick={handleSubmit}
              >
                Save
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </FormProvider>
        <DynamicDevTool control={methods.control} />
      </Drawer>

      <DiscardAlert
        {...{
          isOpen: isAlertOpen,
          onClose: onAlertClose,
          onDiscard: onCloseAndClear,
        }}
      />
    </>
  )
}

export default EditGuildButton
