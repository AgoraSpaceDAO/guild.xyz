import {
  Center,
  Icon,
  Img,
  Spinner,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import useDropzone from "hooks/useDropzone"
import usePinata from "hooks/usePinata"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import BoxIcon from "static/icons/box.svg"
import { TextRewardForm } from "../TextDataForm"

const RewardImagePicker = () => {
  const { setValue } = useFormContext<TextRewardForm>()

  const iconButtonBgColor = useColorModeValue("gray.700", "blackAlpha.300")
  const iconButtonHoverBgColor = useColorModeValue("gray.600", "blackAlpha.200")
  const iconButtonActiveBgColor = useColorModeValue("gray.500", "blackAlpha.100")
  const spinnerBgColor = useColorModeValue("whiteAlpha.700", "blackAlpha.700")

  const { onUpload, isUploading } = usePinata({
    onSuccess: ({ IpfsHash }) => {
      setValue("imageUrl", `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${IpfsHash}`)
    },
  })

  const [preview, setPreview] = useState<string>()
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    noClick: false,
    onDrop: (acceptedFiles) => {
      setPreview(URL.createObjectURL(acceptedFiles[0]))
      onUpload({ data: [acceptedFiles[0]] })
    },
  })

  return (
    <Tooltip label="Upload custom image" placement="top" hasArrow>
      <Button
        position="relative"
        rounded="full"
        boxSize={10}
        p={0}
        overflow="hidden"
        colorScheme="gray"
        aria-label="Guild logo"
        variant="outline"
        borderWidth={1}
        bg={iconButtonBgColor}
        _hover={{ bg: iconButtonHoverBgColor }}
        _active={{ bg: iconButtonActiveBgColor }}
        {...getRootProps()}
      >
        {preview ? (
          <Img aspectRatio={1} objectFit="cover" src={preview} alt="Secret image" />
        ) : (
          <Icon as={BoxIcon} color="white" display="flex" />
        )}

        {isUploading && (
          <Center position="absolute" inset={0} bg={spinnerBgColor}>
            <Spinner size="sm" />
          </Center>
        )}

        <input {...getInputProps()} hidden />
      </Button>
    </Tooltip>
  )
}
export default RewardImagePicker
