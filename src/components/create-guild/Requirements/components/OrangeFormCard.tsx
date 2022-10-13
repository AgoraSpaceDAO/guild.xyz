import { FormControl, FormLabel, Input } from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import { Controller, useFormContext } from "react-hook-form"
import { Requirement } from "types"

type Props = {
  index: number
  field: Requirement
}

const OrangeFormCard = ({ index, field }: Props) => {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <>
      <FormControl isRequired isInvalid={errors?.requirements?.[index]?.data?.id}>
        <FormLabel>ID:</FormLabel>

        <Controller
          name={`requirements.${index}.data.id` as const}
          control={control}
          defaultValue={field.data?.id ?? ""}
          rules={{ required: "This field is required." }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              type="text"
              ref={ref}
              value={value ?? ""}
              placeholder="Required"
              onChange={(newChange) => {
                const newValue = newChange.target.value
                const split = newValue.split("/")
                onChange(split[split.length - 1])
              }}
              onBlur={onBlur}
            />
          )}
        />

        <FormErrorMessage>
          {errors?.requirements?.[index]?.data?.id?.message}
        </FormErrorMessage>
      </FormControl>
    </>
  )
}

export default OrangeFormCard
