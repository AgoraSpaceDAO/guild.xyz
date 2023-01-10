import {
  FormControl,
  FormHelperText,
  FormLabel,
  Icon,
  Input,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react"
import FormErrorMessage from "components/common/FormErrorMessage"
import StyledSelect from "components/common/StyledSelect"
import { ArrowSquareOut } from "phosphor-react"
import { useMemo } from "react"
import { Controller, useController, useFormContext } from "react-hook-form"
import useSnapshots from "requirements/Snapshot/hooks/useSnapshots"
import { SelectOption } from "types"
import parseFromObject from "utils/parseFromObject"

type Props = {
  baseFieldPath: string
  index: number
}

const SingleStrategy = ({ baseFieldPath, index }: Props): JSX.Element => {
  const {
    control,
    register,
    formState: { errors },
    setValue,
  } = useFormContext()

  const {
    field: {
      name: strategyFieldName,
      onBlur: strategyFieldOnBlur,
      onChange: strategyFieldOnChange,
      ref: strategyFieldRef,
      value: strategyFieldValue,
    },
  } = useController({
    name: `${baseFieldPath}.data.strategies.${index}.name`,
    rules: { required: "This field is required." },
  })

  const { strategies, isLoading } = useSnapshots()

  const mappedStrategies = useMemo(
    () =>
      Object.entries(strategies ?? {}).map(([id]) => ({
        label: id,
        value: id,
      })),
    [strategies]
  )

  const selectedStrategyData = Object.entries(strategies ?? {}).find(
    ([id]) => id === strategyFieldValue
  )?.[1]?.schema?.definitions.Strategy

  const example =
    Object.values(strategies ?? {}).find(
      (strategy) => strategy.key === strategyFieldValue
    )?.examples[0].strategy.params ?? {}

  return (
    <Stack spacing={4} alignItems="start" w="full">
      <FormControl
        position="relative"
        isRequired
        isInvalid={
          !!parseFromObject(errors, baseFieldPath)?.data?.strategies?.[index]?.name
        }
      >
        <FormLabel>Strategy</FormLabel>

        <StyledSelect
          ref={strategyFieldRef}
          name={strategyFieldName}
          isClearable
          isLoading={isLoading}
          options={mappedStrategies}
          placeholder="Search..."
          value={
            mappedStrategies?.find(
              (strategy) => strategy.value === strategyFieldValue
            ) ?? ""
          }
          onChange={(newValue: SelectOption) => {
            setValue(`${baseFieldPath}.data.strategies.${index}.params`, "")
            strategyFieldOnChange(newValue?.value)
          }}
          onBlur={strategyFieldOnBlur}
        />

        <FormHelperText>
          <Link
            href="https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies"
            isExternal
          >
            <Text fontSize="sm">Snapshot strategies</Text>
            <Icon ml={1} as={ArrowSquareOut} />
          </Link>
        </FormHelperText>

        <FormErrorMessage>
          {
            parseFromObject(errors, baseFieldPath)?.data?.strategies?.[index]?.name
              ?.message
          }
        </FormErrorMessage>
      </FormControl>
      {selectedStrategyData?.properties ? (
        Object.entries(selectedStrategyData?.properties ?? {}).map(([key, prop]) => (
          <FormControl
            key={key}
            isRequired={selectedStrategyData.required.includes(key)}
            isInvalid={
              !!parseFromObject(errors, baseFieldPath)?.data?.strategies?.[index]
                ?.params?.[key]
            }
          >
            <FormLabel>{prop.title}</FormLabel>
            {(() => {
              switch (prop.type) {
                case "number":
                  return (
                    <Controller
                      name={`${baseFieldPath}.data.strategies.${index}.params.${key}`}
                      control={control}
                      rules={{
                        required: selectedStrategyData.required.includes(key)
                          ? "This field is required."
                          : false,
                      }}
                      render={({ field: { onChange, onBlur, value, ref } }) => (
                        <NumberInput
                          ref={ref}
                          value={value ?? undefined}
                          onChange={onChange}
                          onBlur={onBlur}
                        >
                          <NumberInputField placeholder={prop.examples?.[0]} />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    />
                  )
                case "string":
                  return (
                    <Input
                      {...register(
                        `${baseFieldPath}.data.strategies.${index}.params.${key}`,
                        {
                          required: selectedStrategyData.required.includes(key)
                            ? "This field is required."
                            : false,
                          pattern: prop.pattern
                            ? {
                                value: prop.pattern,
                                message: "Invalid value",
                              }
                            : undefined,
                          minLength: prop.minLength,
                          maxLength: prop.maxLength,
                        }
                      )}
                      placeholder={prop.examples?.[0]}
                    />
                  )
                // case "object":
                //   return null
                // Unsupported field
                // e.g.: https://github.com/snapshot-labs/snapshot-strategies/blob/master/src/strategies/ctsi-staking/schema.json
              }
            })()}

            <FormErrorMessage>
              {
                parseFromObject(errors, baseFieldPath)?.data?.strategies?.[index]
                  ?.params?.[key]?.message
              }
            </FormErrorMessage>
          </FormControl>
        ))
      ) : strategyFieldValue ? (
        <FormControl
          isInvalid={
            parseFromObject(errors, baseFieldPath)?.data?.strategies?.[index]?.params
              ?.message
          }
        >
          <FormLabel>Parameters</FormLabel>
          <Controller
            name={`${baseFieldPath}.data.strategies.${index}.params`}
            rules={{
              validate: (value) => {
                try {
                  if (value.length > 0) JSON.parse(value)
                } catch (_) {
                  return "invalid format (JSON required)"
                }
              },
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <Textarea
                h={200}
                ref={ref}
                value={value ? value : JSON.stringify(example)}
                onChange={onChange}
                onBlur={onBlur}
              />
            )}
          />
          <FormErrorMessage>
            {
              parseFromObject(errors, baseFieldPath)?.data?.strategies?.[index]
                ?.params?.message
            }
          </FormErrorMessage>
        </FormControl>
      ) : null}
    </Stack>
  )
}

export default SingleStrategy
