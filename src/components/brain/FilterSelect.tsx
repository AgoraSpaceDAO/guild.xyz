import { GroupBase, Select } from "chakra-react-select"

export type FilterOption = {
  value: string
  label: string
}

type Props = {
  filterOptions: Array<FilterOption>
  setFilterData
}

const FilterSelect = ({ filterOptions, setFilterData }: Props): JSX.Element => (
  <Select<FilterOption, true, GroupBase<FilterOption>>
    isMulti
    instanceId="filter-select"
    options={filterOptions}
    placeholder="Filter"
    chakraStyles={{
      control: (provided) => ({
        ...provided,
        minH: "48px",
        borderRadius: "0.75rem",
      }),
      menu: (provided) => ({
        ...provided,
        zIndex: 2,
      }),
    }}
    onChange={(e) => setFilterData(e)}
  />
)

export default FilterSelect
