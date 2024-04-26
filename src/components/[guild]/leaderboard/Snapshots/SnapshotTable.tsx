import {
  Box,
  BoxProps,
  CloseButton,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react"
import CopyableAddress from "components/common/CopyableAddress"
import useDebouncedState from "hooks/useDebouncedState"
import { MagnifyingGlass } from "phosphor-react"
import { useMemo, useState } from "react"

type Props = {
  snapshotData: {
    rank: number
    points: number
    address: string
  }[]
  chakraProps?: BoxProps
}

const SnapshotTable = ({ snapshotData, chakraProps }: Props) => {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedState(search)

  const borderColor = useColorModeValue("gray.200", "gray.600")
  const borderRightColor = useColorModeValue("blackAlpha.200", "whiteAlpha.200")
  const bgColor = useColorModeValue("gray.200", "gray.700")

  const searchResults = useMemo(() => {
    if (!debouncedSearch) return snapshotData
    return snapshotData.filter((row) =>
      row.address.includes(debouncedSearch.trim().toLowerCase())
    )
  }, [snapshotData, debouncedSearch])

  return (
    <>
      <Box
        maxH={64}
        overflowY={"auto"}
        border={"1px"}
        borderColor={borderColor}
        rounded={"md"}
        mt={4}
        {...chakraProps}
      >
        <Table
          size={"sm"}
          variant="simple"
          style={{ borderCollapse: "separate", borderSpacing: "0" }}
        >
          <Thead height={10}>
            <Tr>
              <Th
                position={"sticky"}
                top={0}
                borderRightColor={borderRightColor}
                background={bgColor}
                zIndex={2}
              >
                #
              </Th>
              <Th
                position={"sticky"}
                top={0}
                borderRightColor={borderRightColor}
                background={bgColor}
                zIndex={2}
              >
                <InputGroup>
                  <InputLeftElement h="8" w="auto">
                    <Icon boxSize={3.5} as={MagnifyingGlass} />
                  </InputLeftElement>
                  <Input
                    placeholder={"Search addresses"}
                    noOfLines={1}
                    fontSize={"small"}
                    variant={"unstyled"}
                    h="8"
                    pl="6"
                    pr="6"
                    color="var(--chakra-colors-chakra-body-text)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <InputRightElement h="8" w="auto">
                      <CloseButton
                        size="sm"
                        rounded="full"
                        onClick={() => setSearch("")}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
              </Th>
              <Th
                textTransform={"capitalize"}
                letterSpacing={"normal"}
                position={"sticky"}
                top={0}
                background={bgColor}
                zIndex={2}
              >
                Points
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {searchResults
              ?.sort((a, b) => a.rank - b.rank)
              .map((row) => (
                <Tr key={row.rank}>
                  <Td>{row.rank}</Td>
                  <Td>
                    <CopyableAddress
                      address={row.address}
                      decimals={5}
                      fontSize="sm"
                    />
                  </Td>
                  <Td>{row.points}</Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </Box>
    </>
  )
}

export default SnapshotTable
