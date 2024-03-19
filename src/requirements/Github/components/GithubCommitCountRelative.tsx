import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react"
import RelativeMinMaxTimeFormControls from "components/common/RelativeMinMaxTimeFormControls"
import { useController, useFormState } from "react-hook-form"
import { RequirementFormProps } from "requirements"
import parseFromObject from "utils/parseFromObject"

const GithubCommitCountRelative = ({ baseFieldPath }: RequirementFormProps) => {
  const { errors } = useFormState()

  const {
    field: { ref, value, onChange, onBlur },
  } = useController({
    name: `${baseFieldPath}.data.id`,
    rules: {
      required: "This field is required.",
      min: {
        value: 1,
        message: "Amount must be greater than 0",
      },
    },
  })

  return (
    <>
      <RelativeMinMaxTimeFormControls
        minTimeFieldName={`${baseFieldPath}.data.minAmount`}
        maxTimeFieldName={`${baseFieldPath}.data.maxAmount`}
        minTimeLabel="From"
        maxTimeLabel="To"
      />

      <FormControl
        isRequired
        isInvalid={!!parseFromObject(errors, baseFieldPath)?.data?.id}
      >
        <FormLabel>Github commit count</FormLabel>

        <NumberInput
          ref={ref}
          value={value}
          onChange={(newValue) => {
            const parsedValue = parseInt(newValue)
            onChange(isNaN(parsedValue) ? "" : parsedValue)
          }}
          onBlur={onBlur}
          min={0}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>

        <FormErrorMessage>
          {parseFromObject(errors, baseFieldPath)?.data?.id?.message}
        </FormErrorMessage>
      </FormControl>
    </>
  )
}

export default GithubCommitCountRelative
