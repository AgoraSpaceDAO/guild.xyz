import { Center, FormControl, FormLabel, Input, Stack } from "@chakra-ui/react"
import { Schemas } from "@guildxyz/types"
import Color from "color"
import ColorThief from "colorthief/dist/color-thief.mjs"
import Card from "components/common/Card"
import FormErrorMessage from "components/common/FormErrorMessage"
import usePinata from "hooks/usePinata"
import { useFormContext } from "react-hook-form"
import CreateGuildButton from "./CreateGuildButton"
import IconSelector from "./IconSelector"
import Name from "./Name"

export type CreateGuildFormType = Pick<
  Schemas["GuildCreationPayload"],
  "name" | "imageUrl" | "contacts" | "theme"
>

const getColorByImage = (imageUrl: string) =>
  new Promise<string>((resolve, _) => {
    const colorThief = new ColorThief()

    const imgEl = document.createElement("img")
    imgEl.src = imageUrl
    imgEl.width = 64
    imgEl.height = 64
    imgEl.crossOrigin = "anonymous"

    imgEl.addEventListener("load", () => {
      const dominantRgbColor = colorThief.getColor(imgEl)
      const dominantHexColor = Color.rgb(dominantRgbColor).hex()
      resolve(dominantHexColor)
    })
  })

const CreateGuildForm = () => {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateGuildFormType>()

  const iconUploader = usePinata({
    fieldToSetOnSuccess: "imageUrl",
    fieldToSetOnError: "imageUrl",
    control,
  })

  return (
    <Stack spacing={4} w="full">
      <Card pt={12} pb={8} px={{ base: 5, md: 6 }}>
        <Stack spacing={6}>
          <Center>
            <IconSelector
              uploader={iconUploader}
              minW={512}
              minH={512}
              onGeneratedBlobChange={async (objectURL) => {
                const generatedThemeColor = await getColorByImage(objectURL)
                setValue("theme.color", generatedThemeColor)
              }}
              boxSize={28}
            />
          </Center>

          <FormControl isRequired>
            <FormLabel>Guild name</FormLabel>
            <Name width="full" />
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.contacts?.[0]?.contact}>
            <FormLabel>Your email</FormLabel>
            <Input
              {...register("contacts.0.contact", {
                required: "This field is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid e-mail format",
                },
              })}
              size="lg"
            />
            <FormErrorMessage>
              {errors.contacts?.[0]?.contact?.message}
            </FormErrorMessage>
          </FormControl>
        </Stack>
      </Card>
      <CreateGuildButton />
    </Stack>
  )
}

export default CreateGuildForm
