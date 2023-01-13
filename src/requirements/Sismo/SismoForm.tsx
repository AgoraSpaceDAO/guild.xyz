import {
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Stack,
} from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import StyledSelect from "components/common/StyledSelect"
import OptionImage from "components/common/StyledSelect/components/CustomSelectOption/components/OptionImage"
import { Chain } from "connectors"
import { useEffect } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"
import { RequirementFormProps } from "requirements"
import ChainPicker from "requirements/common/ChainPicker"
import { SelectOption } from "types"
import parseFromObject from "utils/parseFromObject"
import useSismoBadges, { SismoBadgeChain } from "./hooks/useSismoBadges"

const sismoContracts: Record<SismoBadgeChain, string> = {
  POLYGON: "0xf12494e3545d49616d9dfb78e5907e9078618a34",
  GNOSIS: "0xa67f1c6c96cb5dd6ef24b07a77893693c210d846",
  GOERLI: "0xa251eb9be4e7e2bb382268ecdd0a5fca0a962e6c",
}

const SismoForm = ({ baseFieldPath }: RequirementFormProps): JSX.Element => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext()

  const chain = useWatch({ name: `${baseFieldPath}.chain` })
  const badgeId = useWatch({ name: `${baseFieldPath}.data.id` })
  const { data, isValidating } = useSismoBadges(chain)

  const pickedBadge = data?.find((option) => option.value === badgeId)

  useEffect(
    () => setValue(`${baseFieldPath}.address`, sismoContracts[chain]),
    [chain]
  )

  return (
    <Stack spacing={4} alignItems="start">
      <ChainPicker
        controlName={`${baseFieldPath}.chain`}
        supportedChains={Object.keys(sismoContracts) as Chain[]}
        onChange={() => setValue(`${baseFieldPath}.data.id`, null)}
      />

      <FormControl
        isRequired
        isInvalid={!!parseFromObject(errors, baseFieldPath)?.data?.id}
        isDisabled={isValidating}
      >
        <FormLabel>Badge</FormLabel>

        <InputGroup>
          {pickedBadge && (
            <InputLeftElement>
              <OptionImage img={pickedBadge?.img} alt={pickedBadge?.label} />
            </InputLeftElement>
          )}

          <Controller
            name={`${baseFieldPath}.data.id` as const}
            control={control}
            rules={{ required: "This field is required." }}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <StyledSelect
                ref={ref}
                isClearable
                options={data}
                value={data?.find((option) => option.value === value) ?? ""}
                placeholder="Choose badge"
                onChange={(newSelectedOption: SelectOption) => {
                  onChange(newSelectedOption?.value)
                }}
                onBlur={onBlur}
                isLoading={isValidating}
              />
            )}
          />
        </InputGroup>

        <FormErrorMessage>
          {parseFromObject(errors, baseFieldPath)?.data?.id?.message}
        </FormErrorMessage>
      </FormControl>
    </Stack>
  )
}

export default SismoForm
