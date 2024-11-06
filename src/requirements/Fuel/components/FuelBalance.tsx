import { FormControl, FormLabel, Input } from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import { useFormContext } from "react-hook-form"
import MinMaxAmount from "requirements/common/MinMaxAmount"
import { RequirementFormProps } from "requirements/types"
import { FUEL_ADDRESS_REGEX } from "types"
import parseFromObject from "utils/parseFromObject"

const FuelBalance = ({ baseFieldPath, field }: RequirementFormProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <>
      <FormControl isInvalid={!!parseFromObject(errors, baseFieldPath)?.address}>
        <FormLabel>Asset id</FormLabel>
        <Input
          {...register(`${baseFieldPath}.address`, {
            validate: (value) =>
              FUEL_ADDRESS_REGEX.test(value) || "Invalid Fuel asset id",
          })}
          placeholder="0x..."
        />
        <FormErrorMessage>
          {parseFromObject(errors, baseFieldPath)?.address?.message}
        </FormErrorMessage>
      </FormControl>

      <MinMaxAmount field={field} baseFieldPath={baseFieldPath} format="FLOAT" />
    </>
  )
}

export default FuelBalance
