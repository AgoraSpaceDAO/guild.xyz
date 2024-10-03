import { Schemas } from "@guildxyz/types"
import { Icon } from "@phosphor-icons/react"
import { UseControllerProps } from "react-hook-form"
import { Requirement } from "types"

export type RequirementType = Exclude<
  Schemas["Requirement"]["type"],
  "WORLD_ID_VERIFICATION"
>

export type RequirementFormProps = {
  baseFieldPath: string
  field?: Requirement
  addRequirement?: () => void
  setOnCloseAttemptToast?: (msg: string | boolean) => void
  providerTypesOnly?: boolean
}

export type RequirementData = {
  icon: string | Icon
  name: string
  readonly types: RequirementType[]
  disabled?: boolean
  isPlatform?: boolean
  customNameRules?: UseControllerProps["rules"]
  isNegatable?: boolean
}
