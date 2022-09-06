import {
  Center,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
} from "@chakra-ui/react"
import useDebouncedState from "hooks/useDebouncedState"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useController, useFormState } from "react-hook-form"
import { Requirement } from "types"

const TWITTER_LINK_CHECK_REGEX = /twitter\.com\/(.*)$/i

const Following = ({ index }: { index: number; field?: Requirement }) => {
  const { errors } = useFormState()

  const { field } = useController({
    name: `requirements.${index}.data.id`,
    rules: {
      required: "Please paste a link or enter a username",
    },
  })

  const debouncedUsername = useDebouncedState(field.value)

  const [shouldFallbackToDefaultImage, setShouldFallbackToDefaultImage] =
    useState(false)

  useEffect(() => {
    setShouldFallbackToDefaultImage(false)
  }, [debouncedUsername])

  return (
    <FormControl isInvalid={!!errors?.requirements?.[index]?.data?.id?.message}>
      <FormLabel>User to follow</FormLabel>

      <HStack>
        {debouncedUsername?.length > 0 && (
          <Center
            position={"relative"}
            width={"40px"}
            height={"40px"}
            border={"1px solid var(--chakra-colors-whiteAlpha-300)"}
            borderRadius={"full"}
            overflow={"hidden"}
          >
            <Image
              blurDataURL={`https://guild.xyz/api/twitter-avatar/${debouncedUsername}?placeholder=true`}
              placeholder="blur"
              src={
                shouldFallbackToDefaultImage
                  ? "/default_twitter_icon.png"
                  : `https://guild.xyz/api/twitter-avatar/${debouncedUsername}`
              }
              layout="fill"
              alt="Twitter avatar"
              onError={() => setShouldFallbackToDefaultImage(true)}
            />
          </Center>
        )}

        <Input
          {...field}
          onChange={({ target: { value } }) => {
            if (value.length <= 0) return field.onChange(value)

            const linkMatch = value.match(TWITTER_LINK_CHECK_REGEX)?.[1]
            if (linkMatch) {
              if (linkMatch.startsWith("@"))
                return field.onChange(linkMatch.slice(1))
              return field.onChange(linkMatch)
            }

            if (value.startsWith("@")) return field.onChange(value.slice(1))
            return field.onChange(value)
          }}
          value={field.value?.length > 0 ? `@${field.value}` : field.value}
          w="auto"
          flexGrow={1}
        />
      </HStack>
      <FormHelperText>Paste a link or enter a username</FormHelperText>
      <FormErrorMessage>
        {errors?.requirements?.[index]?.data?.id?.message}
      </FormErrorMessage>
    </FormControl>
  )
}

export default Following
