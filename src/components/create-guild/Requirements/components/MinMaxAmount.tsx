import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import { Question } from "phosphor-react"
import { useEffect, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { GuildFormType, Requirement } from "types"

type Props = {
  index: number
  field: Requirement
  format?: "INT" | "FLOAT"
}

const MinMaxAmount = ({ index, field, format = "INT" }: Props): JSX.Element => {
  const {
    control,
    unregister,
    formState: { errors },
  } = useFormContext<GuildFormType>()

  const [showMax, setShowMax] = useState(!isNaN(field.data?.maxAmount))

  const toggleShowMax = () => setShowMax(!showMax)

  useEffect(() => {
    if (showMax) return
    unregister(`requirements.${index}.data.maxAmount`)
  }, [showMax])

  const parse = (value: string) =>
    format === "INT" ? parseInt(value) : parseFloat(value)

  return (
    <FormControl>
      <Flex justifyContent={"space-between"} w="full">
        <HStack mb={2} spacing={0}>
          <FormLabel mb={0}>{showMax ? "Amount:" : "Minimum amount:"}</FormLabel>

          {showMax && (
            <Tooltip
              label={`min <= amount to hold ${format === "INT" ? "<=" : "<"} max`}
            >
              <Question color="gray" />
            </Tooltip>
          )}
        </HStack>
        <Button
          size="xs"
          variant="ghost"
          borderRadius={"lg"}
          onClick={toggleShowMax}
        >
          <Text colorScheme={"gray"}>
            {showMax ? "remove max amount" : "+ set max amount"}
          </Text>
        </Button>
      </Flex>

      <HStack w="full" spacing={2} alignItems="start">
        <FormControl isInvalid={!!errors?.requirements?.[index]?.data?.minAmount}>
          <Controller
            name={`requirements.${index}.data.minAmount` as const}
            control={control}
            defaultValue={field.data?.minAmount}
            rules={{
              required: "This field is required.",
              min: {
                value: 0,
                message: "Amount must be positive",
              },
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <NumberInput
                ref={ref}
                value={value}
                defaultValue={field.data?.minAmount}
                onChange={(newValue) => {
                  const parsedValue = parse(newValue)
                  onChange(isNaN(parsedValue) ? "" : parsedValue)
                }}
                onBlur={onBlur}
                min={0}
              >
                <NumberInputField placeholder="Min" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            )}
          />

          <FormErrorMessage>
            {errors?.requirements?.[index]?.data?.minAmount?.message}
          </FormErrorMessage>
        </FormControl>

        {showMax && (
          <>
            <Text as="span" h={10} lineHeight={10}>
              -
            </Text>

            <FormControl
              isInvalid={!!errors?.requirements?.[index]?.data?.maxAmount}
            >
              <Controller
                name={`requirements.${index}.data.maxAmount` as const}
                control={control}
                defaultValue={field.data?.maxAmount}
                rules={{
                  required: "This field is required.",
                  min: {
                    value: 0,
                    message: "Amount must be positive",
                  },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <NumberInput
                    ref={ref}
                    value={value}
                    defaultValue={field.data?.maxAmount}
                    onChange={(newValue) => {
                      const parsedValue = parse(newValue)
                      onChange(isNaN(parsedValue) ? "" : parsedValue)
                    }}
                    onBlur={onBlur}
                    min={0}
                  >
                    <NumberInputField placeholder="Max" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}
              />

              <FormErrorMessage>
                {errors?.requirements?.[index]?.data?.maxAmount?.message}
              </FormErrorMessage>
            </FormControl>
          </>
        )}
      </HStack>
    </FormControl>
  )
}

export default MinMaxAmount
