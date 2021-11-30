import {
  Icon,
  InputGroup,
  InputLeftAddon,
  Select,
  useBreakpointValue,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import { SortAscending } from "phosphor-react"
import { useEffect } from "react"
import { Guild, Hall } from "temporaryData/types"

const ordering = {
  name: (a: Guild | Hall, b: Guild | Hall) => {
    const nameA = a.name.toUpperCase()
    const nameB = b.name.toUpperCase()
    if (nameA < nameB) return -1
    if (nameA > nameB) return 1
    return 0
  },
  oldest: (a: Guild | Hall, b: Guild | Hall) => a.id - b.id,
  newest: (a: Guild | Hall, b: Guild | Hall) => b.id - a.id,
  "most members": (a: Guild | Hall, b: Guild | Hall) =>
    b.members?.length - a.members?.length,
}

const OrderSelect = ({ order, setOrder }) => {
  const icon = useBreakpointValue({
    base: <Icon as={SortAscending} />,
    md: false,
  })

  const router = useRouter()

  // Replacing the URL if ordering changes
  useEffect(() => {
    if (order === router.query.order) return

    const newQuery = {
      ...router.query,
      order,
    }

    router.replace({ pathname: router.pathname, query: newQuery })
  }, [order])

  return (
    <InputGroup
      size="lg"
      maxW={{ base: "50px", md: "full" }}
      sx={{
        ".chakra-select__wrapper": { h: "47px" },
      }}
    >
      <InputLeftAddon d={{ base: "none", md: "flex" }}>Order by</InputLeftAddon>
      <Select
        borderLeftRadius={{ md: "0" }}
        onChange={(e) => setOrder(e.target.value)}
        value={order}
        icon={icon ? (icon as JSX.Element) : undefined}
        w={{ base: "45px", md: "full" }}
      >
        {Object.keys(ordering).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </InputGroup>
  )
}

export default OrderSelect
