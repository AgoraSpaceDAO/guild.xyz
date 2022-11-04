import { FormControl, FormLabel, Input } from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import { Controller, useFormContext } from "react-hook-form"
import { Requirement } from "types"

const SoundOwnASong = ({ index }: { index: number; field?: Requirement }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <>
      <FormControl isRequired isInvalid={errors?.requirements?.[index]?.data?.id}>
        <FormLabel>Data ID:</FormLabel>
        <Controller
          name={`requirements.${index}.data.id` as const}
          control={control}
          rules={{ required: "This field is required." }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              type="text"
              ref={ref}
              value={value ?? ""}
              placeholder="Data id"
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
          {errors?.requirements?.[index]?.type?.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={errors?.requirements?.[index]?.data?.title}>
        <FormLabel>Title:</FormLabel>
        <Controller
          name={`requirements.${index}.data.title` as const}
          control={control}
          rules={{ required: "This field is required." }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <Input
              type="text"
              ref={ref}
              value={value ?? ""}
              placeholder="Data id"
              onChange={onChange}
              onBlur={onBlur}
            />
          )}
        />
        <FormErrorMessage>
          {errors?.requirements?.[index]?.data?.title?.message}
        </FormErrorMessage>
      </FormControl>
    </>
  )
}

export default SoundOwnASong
