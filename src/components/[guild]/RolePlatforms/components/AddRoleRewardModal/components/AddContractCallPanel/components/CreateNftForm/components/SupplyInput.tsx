import {
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react"
import SegmentedControl from "components/common/SegmentedControl"
import { useEffect, useState } from "react"
import { useController, useFormContext } from "react-hook-form"
import { CreateNftFormType } from "../CreateNftForm"

type SupplyType = "LIMITED" | "UNLIMITED"
const options = [
  {
    label: "Unlimited",
    value: "UNLIMITED",
  },
  {
    label: "Custom amount",
    value: "LIMITED",
  },
] satisfies { label: string; value: SupplyType }[]

const SupplyInput = () => {
  const [supplyType, setSupplyType] = useState<SupplyType>("UNLIMITED")

  const {
    control,
    formState: { errors },
  } = useFormContext<CreateNftFormType>()
  const {
    field: { onChange: maxSupplyFieldOnChange, ...maxSupplyField },
  } = useController({
    control,
    name: "maxSupply",
    defaultValue: 0, // 0 = unlimited
    rules: {
      min: supplyType === "LIMITED" ? 1 : 0,
    },
  })

  useEffect(() => {
    maxSupplyFieldOnChange(supplyType === "LIMITED" ? 1 : 0)
  }, [maxSupplyFieldOnChange, supplyType])

  return (
    <Grid templateColumns="repeat(3, 1fr)" columnGap={4} rowGap={2}>
      <GridItem as={FormControl} colSpan={{ base: 3, md: 2 }}>
        <FormLabel>Supply</FormLabel>
        <SegmentedControl
          options={options}
          onChange={(newSupplyType) => setSupplyType(newSupplyType)}
        />
      </GridItem>

      <GridItem
        as={FormControl}
        colSpan={{ base: 3, md: 1 }}
        isInvalid={!!errors.maxSupply}
        isDisabled={supplyType === "UNLIMITED"}
      >
        <FormLabel>Max</FormLabel>
        <NumberInput
          {...maxSupplyField}
          onChange={maxSupplyFieldOnChange}
          min={supplyType === "LIMITED" ? 1 : 0}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </GridItem>
    </Grid>
  )
}
export default SupplyInput
