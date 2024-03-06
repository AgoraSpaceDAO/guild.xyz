import { RequirementFormProps } from "requirements"
import MinMaxAmount from "requirements/common/MinMaxAmount"

const TwitterMinimumCount = ({ baseFieldPath, field }: RequirementFormProps) => (
  <MinMaxAmount
    field={field}
    baseFieldPath={baseFieldPath}
    format="INT"
    hideSetMaxButton
  />
)

export default TwitterMinimumCount
