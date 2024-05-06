import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputFieldProps,
  NumberInputProps,
  NumberInputStepper,
} from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"
import { useController } from "react-hook-form"

type Props = {
  numberFormat?: "INT" | "FLOAT"
  placeholder?: string
  adaptiveStepSize?: boolean
  decimalsMax?: number
  replaceMin?: boolean
  replaceMax?: boolean
  numberInputFieldProps?: NumberInputFieldProps
} & NumberInputProps

/* JS starts heavy miscalcs when diving deeper than 16 */
const MAX_DECIMALS = 15

const ControlledNumberInput = ({
  numberInputFieldProps,
  numberFormat = "INT",
  adaptiveStepSize = false,
  decimalsMax = MAX_DECIMALS,
  ...props
}: Props): JSX.Element => {
  const [stepSize, setStepSize] = useState(1)

  const {
    field: { ref, name, value, onChange, onBlur },
  } = useController({
    name: props.name,
    rules: {
      required: props.isRequired && "This field is required",
      min: props.min && {
        value: props.min,
        message: `Minimum: ${props.min}`,
      },
      max: props.max && {
        value: props.max,
        message: `Maximum: ${props.max}`,
      },
    },
  })

  const decimalsLimit = decimalsMax < MAX_DECIMALS ? decimalsMax : MAX_DECIMALS

  /**
   * Makes the step size adapt to the precision. E.g., if the entered number is
   * 1.001, the step size will be set to 0.001, therefore the next step up will be
   * 1.002.
   */
  const updateStepSize = useCallback(
    (newValue) => {
      if (!adaptiveStepSize) return

      const precision = getPrecision(newValue)
      let newStepSize = 1 / Math.pow(10, precision)

      if (precision > decimalsLimit) {
        newValue = Number(newValue).toFixed(decimalsLimit).toString()
        newStepSize = 1 / Math.pow(10, precision - 1)
      }
      setStepSize(newStepSize)
    },
    [decimalsLimit, adaptiveStepSize]
  )

  useEffect(() => {
    updateStepSize(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateStepSize, value])

  const handleChange = (newValue) => {
    // We need this to allow typing in a decimal point
    if (/^[0-9]*\.[0-9]*0*$/i.test(newValue)) {
      props?.onChange?.(newValue, Number(newValue))
      return onChange(newValue)
    }

    const parsedValue = numberFormat === "INT" ? parseInt(newValue) : newValue

    const returnedValue = isNaN(parsedValue) ? "" : parsedValue

    props?.onChange?.(returnedValue, Number(returnedValue))
    return onChange(returnedValue)
  }

  const getPrecision = (value_: string | number) => {
    const parts = value_?.toString().split(".")
    return parts?.[1]?.length || 0
  }

  /**
   * Adjusts the input value to meet the specified minimum while maintaining
   * precision.
   *
   * In HTML number inputs, when a minimum value like 0.001 is set and the user types
   * 0, the field's default behavior tries to replace it with the minimum value but
   * cannot show it properly due to a precision mismatch. It results in displaying
   * just 0, hiding the actual minimum value.
   *
   * This function ensures that if the user enters a value below the minimum
   * (props.min), it will be replaced with the minimum value while maintaining the
   * appropriate precision. It also ensures that the number of decimal places shown
   * matches the higher precision between the input and the minimum, creating a
   * smoother user experience.
   *
   * For instance, if the minimum value is 0.01 and the user inputs 0.0001 (which is
   * less than 0.01), this function replaces it with 0.0100 to maintain precision and
   * accurately reflect the minimum value.
   *
   * @param {number} newValue - The value input by the user.
   * @returns {number | string} - The adjusted value, either the minimum or the
   *   original value if within the acceptable range.
   */
  const replaceWithMin = (newValue) => {
    if (!props?.min) return newValue
    if (newValue < props.min) {
      const inputPrecision = getPrecision(newValue)
      const minPrecision = getPrecision(props.min)
      return props.min.toFixed(Math.max(minPrecision, inputPrecision))
    }
    return newValue
  }

  /** See the comment for `replaceWithMin` */
  const replaceWithMax = (newValue) => {
    if (!props?.max) return newValue
    if (newValue > props.max) {
      const inputPrecision = getPrecision(newValue)
      const maxPrecision = getPrecision(props.max)
      return props.max.toFixed(Math.max(maxPrecision, inputPrecision))
    }
    return newValue
  }

  const handleBlur = (e) => {
    e.preventDefault()
    onBlur()
    handleChange(replaceWithMax(replaceWithMin(value)))
  }

  return (
    <NumberInput
      {...props}
      ref={ref}
      name={name}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      step={stepSize}
    >
      <NumberInputField
        placeholder={props.placeholder}
        {...numberInputFieldProps}
        cursor={props.isReadOnly && "default"}
      />
      <NumberInputStepper
        padding={"0 !important"}
        visibility={props.isReadOnly ? "hidden" : "visible"}
      >
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  )
}

export default ControlledNumberInput
