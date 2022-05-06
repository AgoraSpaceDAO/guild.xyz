import { GroupBase, Props, Select, SelectInstance } from "chakra-react-select"
import { forwardRef, Ref } from "react"
import CustomClearIndicator from "./components/CustomClearIndicator"
import CustomMenuList from "./components/CustomMenuList"
import CustomSelectOption from "./components/CustomSelectOption"

const StyledSelect = forwardRef(
  (
    props: Props & { as?: any },
    ref: Ref<SelectInstance<unknown, boolean, GroupBase<unknown>>>
  ): JSX.Element => {
    const SelectComponent = props.as ?? Select
    return (
      <SelectComponent
        ref={ref}
        {...props}
        chakraStyles={{
          container: (provided) => ({
            ...provided,
            width: "full",
            maxWidth: "full",
            overflow: "hidden",
            padding: "1px",
          }),
          control: (provided) => ({
            ...provided,
            width: "full",
          }),
          inputContainer: (provided) => ({
            ...provided,
            display: "flex",
          }),
          menu: (provided) => ({
            ...provided,
            overflow: "visible",
          }),
          placeholder: (provided) => ({
            ...provided,
            maxWidth: "calc(100% - 2rem)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            pointerEvents: "none",
          }),
        }}
        components={{
          ...props.components,
          Option: CustomSelectOption,
          MenuList: CustomMenuList,
          ClearIndicator: CustomClearIndicator,
        }}
        menuPortalTarget={document?.getElementById("chakra-react-select-portal")}
        menuShouldBlockScroll={true}
      />
    )
  }
)

export default StyledSelect
