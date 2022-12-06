import { FormControl, FormHelperText, FormLabel } from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import StyledSelect from "components/common/StyledSelect"
import { useMemo } from "react"
import { useController, useFormState } from "react-hook-form"
import { RequirementFormProps } from "requirements"
import { SelectOption } from "types"
import parseFromObject from "utils/parseFromObject"
import useSpaces from "../hooks/useSpaces"

type Props = RequirementFormProps & {
  isDisabled?: boolean
  optional?: boolean // Using "optional" here because this field is required most of the time anyways
  helperText?: string
}

const SpaceSelect = ({
  baseFieldPath,
  optional,
  isDisabled,
  helperText,
}: Props): JSX.Element => {
  const { errors } = useFormState()

  const {
    field: { ref, name, value, onChange, onBlur },
  } = useController({
    name: `${baseFieldPath}.data.space`,
    rules: {
      required: !optional && "This field is required.",
    },
  })

  const { spaces, isSpacesLoading } = useSpaces()
  const mappedSpaces = useMemo<SelectOption[]>(
    () =>
      spaces?.map((space) => ({
        label: space.name,
        value: space.id,
      })) ?? [],
    [spaces]
  )

  return (
    <FormControl
      isDisabled={isDisabled}
      isRequired={!optional}
      isInvalid={!!parseFromObject(errors, baseFieldPath)?.data?.space}
    >
      <FormLabel>Space</FormLabel>

      <StyledSelect
        ref={ref}
        name={name}
        placeholder="Search..."
        isClearable
        isLoading={isSpacesLoading}
        options={mappedSpaces}
        value={mappedSpaces?.find((s) => s.value === value) ?? ""}
        onChange={(newValue: SelectOption) => onChange(newValue?.value)}
        onBlur={onBlur}
      />

      <FormErrorMessage>
        {parseFromObject(errors, baseFieldPath)?.data?.space?.message}
      </FormErrorMessage>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export default SpaceSelect
