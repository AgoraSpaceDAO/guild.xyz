import { Checkbox, CheckboxProps, Radio, RadioProps, Stack } from "@chakra-ui/react"
import { ComponentType } from "react"
import { CreateFieldParams } from "../../schemas"

type Props = {
  field: CreateFieldParams
}

const FieldComponents: Record<
  "SINGLE_CHOICE" | "MULTIPLE_CHOICE",
  ComponentType<RadioProps | CheckboxProps>
> = {
  SINGLE_CHOICE: Radio,
  MULTIPLE_CHOICE: Checkbox,
}

const Choice = ({ field }: Props) => {
  // We probably won't run into this case, but needed to add this line to get valid intellisense
  if (field.type !== "SINGLE_CHOICE" && field.type !== "MULTIPLE_CHOICE") return null

  const options = field.options.map((option) =>
    typeof option === "number" || typeof option === "string" ? option : option.value
  )

  const FieldComponent = FieldComponents[field.type]

  return (
    <Stack spacing={1}>
      {options.map((option) => (
        <FieldComponent key={option} value={option.toString()}>
          {option}
        </FieldComponent>
      ))}
      {field.allowOther && (
        <FieldComponent value="Other...">Other...</FieldComponent>
      )}
    </Stack>
  )
}
export default Choice
