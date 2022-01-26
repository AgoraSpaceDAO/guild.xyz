import { FormControl, FormHelperText, FormLabel, InputGroup } from "@chakra-ui/react"
import { Select } from "components/common/ChakraReactSelect"
import FormErrorMessage from "components/common/FormErrorMessage"
import React, { useMemo, useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { RequirementFormField } from "types"
import ChainInfo from "../ChainInfo"
import Symbol from "../Symbol"
import usePoaps from "./hooks/usePoaps"

type Props = {
  index: number
  field: RequirementFormField
}

const PoapFormCard = ({ index, field }: Props): JSX.Element => {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  const type = useWatch({ name: `requirements.${index}.type` })

  const { isLoading, poaps } = usePoaps()
  const mappedPoaps = useMemo(
    () =>
      poaps?.map((poap) => ({
        img: poap.image_url, // This will be displayed as an Img tag in the list
        label: poap.name, // This will be displayed as the option text in the list
        value: poap.fancy_id, // This is the actual value of this select
      })),
    [poaps]
  )

  // So we can show the dropdown only of the input's length is > 0
  const [valueInput, setValueInput] = useState("")

  const value = useWatch({ name: `requirements.${index}.value`, control })
  const poapByFancyId = useMemo(
    () => poaps?.find((poap) => poap.fancy_id === value) || null,
    [poaps, value]
  )

  return (
    <>
      <ChainInfo>Works on both ETHEREUM and XDAI</ChainInfo>

      <FormControl
        isRequired
        isInvalid={type && errors?.requirements?.[index]?.value}
      >
        <FormLabel>POAP:</FormLabel>
        <InputGroup>
          {value && poapByFancyId && (
            <Symbol
              symbol={poapByFancyId?.image_url}
              isInvalid={type && errors?.requirements?.[index]?.value}
            />
          )}
          <Controller
            name={`requirements.${index}.value` as const}
            control={control}
            defaultValue={field.value}
            rules={{
              required: "This field is required.",
            }}
            render={({ field: { onChange, onBlur, value: selectValue, ref } }) => (
              <Select
                ref={ref}
                isClearable
                isLoading={isLoading}
                options={mappedPoaps}
                placeholder="Search..."
                value={mappedPoaps?.find((poap) => poap.value === selectValue)}
                defaultValue={mappedPoaps?.find(
                  (poap) => poap.value === field.value
                )}
                onChange={(newValue) => onChange(newValue?.value)}
                onBlur={onBlur}
                onInputChange={(text, _) => setValueInput(text)}
                menuIsOpen={valueInput.length > 2}
                filterOption={(candidate, input) =>
                  candidate.label.toLowerCase().startsWith(input?.toLowerCase()) ||
                  candidate.label
                    .toLowerCase()
                    .split(" ")
                    .includes(input?.toLowerCase())
                }
                // Hiding the dropdown indicator
                components={{
                  DropdownIndicator: () => null,
                  IndicatorSeparator: () => null,
                }}
              />
            )}
          />
        </InputGroup>
        <FormHelperText>Type at least 3 characters.</FormHelperText>
        <FormErrorMessage>
          {errors?.requirements?.[index]?.value?.message}
        </FormErrorMessage>
      </FormControl>
    </>
  )
}

export default PoapFormCard
