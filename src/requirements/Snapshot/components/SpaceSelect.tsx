import { FormControl, FormHelperText, FormLabel } from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import { ControlledCombobox } from "components/zag/Combobox"
import useDebouncedState from "hooks/useDebouncedState"
import { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { RequirementFormProps } from "requirements"
import useSWRImmutable from "swr/immutable"
import { SelectOption } from "types"
import parseFromObject from "utils/parseFromObject"

type Props = RequirementFormProps & {
  isDisabled?: boolean
  optional?: boolean // Using "optional" here because this field is required most of the time anyways
  helperText?: string
}

const SPACE_ID_REGEX = /.+\.[a-z]*/

export type Space = {
  id: string
  name: string
}

const customOptionsFilter = (
  option: SelectOption<string>,
  inputValue: string
): boolean =>
  option.label.toLowerCase().includes(inputValue?.toLowerCase()) ||
  option.details?.toLowerCase().includes(inputValue?.toLowerCase())

const SpaceSelect = ({
  baseFieldPath,
  optional,
  isDisabled,
  helperText,
}: Props): JSX.Element => {
  const {
    resetField,
    formState: { errors },
  } = useFormContext()

  const [searchSpaceId, setSearchSpaceId] = useState("")
  const debouncedSearchSpaceId = useDebouncedState(searchSpaceId)
  const { data: spaces, isValidating: isSpacesLoading } = useSWRImmutable<Space[]>(
    "/assets/snapshot/space"
  )
  const { data: singleSpace, isValidating: isSingleSpaceLoading } =
    useSWRImmutable<Space>(
      debouncedSearchSpaceId
        ? `/assets/snapshot/space/${debouncedSearchSpaceId}`
        : null
    )

  const mappedSpaces = useMemo<SelectOption[]>(
    () =>
      (singleSpace ? [singleSpace] : spaces)?.map((space) => ({
        label: space.name,
        value: space.id,
        details: space.id,
      })) ?? [],
    [spaces, singleSpace]
  )

  return (
    <FormControl
      isDisabled={isDisabled}
      isRequired={!optional}
      isInvalid={!!parseFromObject(errors, baseFieldPath)?.data?.space}
    >
      <FormLabel>Space</FormLabel>

      <ControlledCombobox
        name={`${baseFieldPath}.data.space`}
        rules={{
          required: !optional && "This field is required.",
        }}
        placeholder="Search by ID"
        isClearable
        isLoading={isSpacesLoading || isSingleSpaceLoading}
        options={mappedSpaces}
        beforeOnChange={() => resetField(`${baseFieldPath}.data.proposal`)}
        customOptionsFilter={customOptionsFilter}
        onInputChange={(text) => {
          setSearchSpaceId("")
          if (!SPACE_ID_REGEX.test(text)) return
          setSearchSpaceId(text)
        }}
      />

      <FormErrorMessage>
        {parseFromObject(errors, baseFieldPath)?.data?.space?.message}
      </FormErrorMessage>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export default SpaceSelect
