import {
  Collapse,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import useDebouncedState from "hooks/useDebouncedState"
import { LinkMetadata } from "pages/api/link-metadata"
import { useEffect } from "react"
import { useController, useFormContext } from "react-hook-form"
import { RequirementFormProps } from "requirements"
import useSWRImmutable from "swr/immutable"
import parseFromObject from "utils/parseFromObject"

const VisitLinkForm = ({ baseFieldPath }: RequirementFormProps) => {
  const {
    setValue,
    formState: { errors },
  } = useFormContext()

  const {
    field: { onChange, ...field },
  } = useController({
    name: `${baseFieldPath}.data.id`,
    rules: {
      required: "This field is required",
      pattern: {
        value: /^https:\/\/(.)+\.(.)+$/,
        message: "Invalid URL",
      },
    },
  })

  const debounceLink = useDebouncedState(field.value)

  const error = !!parseFromObject(errors, baseFieldPath).data?.id

  const { data: metadata, isValidating } = useSWRImmutable<LinkMetadata>(
    debounceLink && !error ? `/api/link-metadata?url=${debounceLink}` : null
  )

  useEffect(() => {
    if (!metadata?.title) return
    setValue(`${baseFieldPath}.data.customName`, `Visit link: [${metadata.title}]`)
  }, [metadata])

  return (
    <FormControl isInvalid={error}>
      <FormLabel>Link user has to go to</FormLabel>
      <Input
        {...field}
        placeholder="https://guild.xyz"
        onChange={(e) => {
          const position = e.target.selectionStart
          onChange(e.target.value.toLowerCase())
          // The cursor's position was always set to e.target.value.length without timeout
          setTimeout(() => {
            e.target.setSelectionRange(position, position)
          })
        }}
      />

      <FormErrorMessage>
        {parseFromObject(errors, baseFieldPath).data?.id?.message}
      </FormErrorMessage>

      <Collapse in={!!metadata?.title || isValidating}>
        <FormHelperText>
          {isValidating ? (
            <HStack>
              <Spinner size="xs" />
              <Text as="span">Loading metadata...</Text>
            </HStack>
          ) : (
            metadata?.title
          )}
        </FormHelperText>
      </Collapse>
    </FormControl>
  )
}

export default VisitLinkForm
