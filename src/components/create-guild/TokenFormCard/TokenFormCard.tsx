import {
  CloseButton,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Img,
  Input,
  InputGroup,
  InputLeftAddon,
  Spinner,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react"
import Card from "components/common/Card"
import { useMemo, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { RequirementTypeColors } from "temporaryData/types"
import useTokensList from "./hooks/useTokensList"

type Props = {
  index: number
  clickHandler?: () => void
}

const TokenFormCard = ({ index, clickHandler }: Props): JSX.Element => {
  const tokensList = useTokensList()

  const {
    trigger,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext()

  const type = getValues(`requirements.${index}.type`)

  const { colorMode } = useColorMode()

  const inputTimeout = useRef(null)
  const [searchInput, setSearchInput] = useState("")

  const searchResults = useMemo(() => {
    if (searchInput.length < 3) return []

    const searchText = searchInput.toLowerCase()
    const foundTokens =
      tokensList?.filter((token) =>
        searchText.startsWith("0x")
          ? token.address === searchText
          : token.name.toLowerCase().startsWith(searchText) ||
            token.symbol.toLowerCase().startsWith(searchText)
      ) || []

    return foundTokens
  }, [searchInput, tokensList])

  const searchHandler = (text: string) => {
    window.clearTimeout(inputTimeout.current)
    inputTimeout.current = setTimeout(() => setSearchInput(text), 300)
  }

  const searchResultClickHandler = (resultIndex: number) => {
    setValue(`requirements.${index}.address`, searchResults[resultIndex].address)
    searchHandler("")
    trigger(`requirements.${index}.address`)
  }

  return (
    <Card
      role="group"
      position="relative"
      px={{ base: 5, sm: 7 }}
      pt={10}
      pb={7}
      w="full"
      bg={colorMode === "light" ? "white" : "gray.700"}
      borderWidth={2}
      borderColor={RequirementTypeColors[type]}
      overflow="visible"
      _before={{
        content: `""`,
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        bg: "primary.300",
        opacity: 0,
        transition: "opacity 0.2s",
      }}
    >
      {typeof clickHandler === "function" && (
        <CloseButton
          position="absolute"
          top={2}
          right={2}
          width={8}
          height={8}
          rounded="full"
          zIndex="docked"
          aria-label="Remove level"
          onClick={clickHandler}
        />
      )}
      <VStack spacing={4} alignItems="start">
        <FormControl
          position="relative"
          isRequired
          isInvalid={
            errors.requirements &&
            errors.requirements[index] &&
            errors.requirements[index].address
          }
        >
          <FormLabel>Search for an ERC-20 token:</FormLabel>
          <InputGroup>
            {getValues(`requirements.${index}.address`) && (
              <InputLeftAddon>
                {tokensList.find(
                  (token) =>
                    token.address === getValues(`requirements.${index}.address`)
                )?.symbol || <Spinner />}
              </InputLeftAddon>
            )}
            <Input
              {...register(`requirements.${index}.address`, {
                required: "This field is required.",
              })}
              autoComplete="off"
              onChange={(e) => searchHandler(e.target.value)}
            />
          </InputGroup>
          <FormHelperText>Type at least 3 characters.</FormHelperText>
          {searchResults.length > 0 && (
            <Card
              position="absolute"
              left={0}
              top="full"
              shadow="xl"
              width="full"
              maxHeight={40}
              bgColor="gray.800"
              overflowY="auto"
              zIndex="dropdown"
            >
              <VStack spacing={1} py={2} alignItems="start">
                {searchResults.map((result, i) => (
                  <HStack
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    px={4}
                    py={1}
                    width="full"
                    transition="0.2s ease"
                    cursor="pointer"
                    _hover={{ bgColor: "gray.700" }}
                    onClick={() => searchResultClickHandler(i)}
                  >
                    <Img boxSize={6} rounded="full" src={result.logoURI} />
                    <Text fontWeight="semibold" as="span">
                      {result.name}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Card>
          )}
          <FormErrorMessage>
            {errors.requirements && errors.requirements[index]?.name?.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl
          isInvalid={errors.requirements && errors.requirements[index]?.value}
        >
          <FormLabel>Minimum amount to hold:</FormLabel>
          <Input
            type="number"
            {...register(`requirements.${index}.value`, {
              required: "This field is required.",
            })}
          />
        </FormControl>
      </VStack>
    </Card>
  )
}

export default TokenFormCard
