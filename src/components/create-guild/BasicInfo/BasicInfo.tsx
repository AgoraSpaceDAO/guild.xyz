import { Box, FormLabel, HStack, SimpleGrid, Stack } from "@chakra-ui/react"
import BackgroundImageUploader from "components/[guild]/EditGuild/components/BackgroundImageUploader"
import ColorPicker from "components/[guild]/EditGuild/components/ColorPicker"
import UrlName from "components/[guild]/EditGuild/components/UrlName"
import { useThemeContext } from "components/[guild]/ThemeContext"
import Section from "components/common/Section"
import usePinata from "hooks/usePinata"
import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import slugify from "slugify"
import { GuildFormType } from "types"
import getRandomInt from "utils/getRandomInt"
import { useCreateGuildContext } from "../CreateGuildContext"
import Description from "../Description"
import GuildCreationProgress from "../GuildCreationProgress"
import IconSelector from "../IconSelector"
import Name from "../Name"
import useSetImageAndNameFromPlatformData from "../hooks/useSetImageAndNameFromPlatformData"
import ContactInfo from "./components/ContactInfo"

const BasicInfo = (): JSX.Element => {
  const { nextStep } = useCreateGuildContext()
  const {
    setLocalBackgroundImage,
    localThemeColor,
    setLocalThemeColor,
    localBackgroundImage,
  } = useThemeContext()

  const {
    control,
    getValues,
    setValue,
    formState: { errors, dirtyFields, touchedFields },
  } = useFormContext<GuildFormType>()

  const name = useWatch({ control, name: "name" })
  const guildPlatforms = useWatch({ control, name: "guildPlatforms" })

  const iconUploader = usePinata({
    onSuccess: ({ IpfsHash }) => {
      setValue("imageUrl", `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${IpfsHash}`, {
        shouldTouch: true,
      })
    },
    onError: () => {
      setValue("imageUrl", `/guildLogos/${getRandomInt(286)}.svg`, {
        shouldTouch: true,
      })
    },
  })

  const discordPlatformData = guildPlatforms.find(
    (platform) => platform.platformName === "DISCORD"
  )?.platformGuildData

  const telegramPlatformData = guildPlatforms.find(
    (platform) => platform.platformName === "TELEGRAM"
  )?.platformGuildData

  const imageUrlFromPlatformData = () => {
    if (discordPlatformData?.imageUrl) return discordPlatformData.imageUrl

    if (telegramPlatformData?.imageUrl) return telegramPlatformData.imageUrl

    return undefined
  }

  const nameFromPlatformData = () => {
    if (discordPlatformData?.name) return discordPlatformData.name

    if (telegramPlatformData?.name) return telegramPlatformData.name

    return undefined
  }

  useSetImageAndNameFromPlatformData(
    imageUrlFromPlatformData(),
    nameFromPlatformData(),
    iconUploader.onUpload
  )

  useEffect(() => {
    if (name && !dirtyFields.urlName)
      setValue("urlName", slugify(name), { shouldValidate: true })
  }, [name, dirtyFields])

  useEffect(() => {}, [touchedFields.imageUrl])

  const backgroundUploader = usePinata({
    onSuccess: ({ IpfsHash }) => {
      setValue(
        "theme.backgroundImage",
        `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${IpfsHash}`,
        { shouldDirty: true }
      )
    },
    onError: () => {
      setLocalBackgroundImage(null)
    },
  })

  return (
    <>
      <Stack spacing={10}>
        <Stack spacing={{ base: 5, md: 6 }}>
          <SimpleGrid
            w="full"
            spacing="5"
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
          >
            <Box flex="1">
              <FormLabel>Logo and name</FormLabel>
              <HStack alignItems="start">
                <IconSelector uploader={iconUploader} minW={512} minH={512} />
                <Name width={null} />
              </HStack>
            </Box>
            <UrlName maxWidth="unset" />
          </SimpleGrid>
          <Description />
        </Stack>
        <Stack direction={{ base: "column", md: "row" }} spacing="5">
          <ColorPicker fieldName="theme.color" />
          <BackgroundImageUploader uploader={backgroundUploader} />
        </Stack>
        <Section title="How could we contact you?" spacing="4">
          <ContactInfo showAddButton={false} />
        </Section>
      </Stack>
      <GuildCreationProgress
        next={nextStep}
        progress={25}
        isDisabled={!name || !!Object.values(errors).length}
      />
    </>
  )
}

export default BasicInfo
