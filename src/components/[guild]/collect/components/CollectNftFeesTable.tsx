import { HStack, Skeleton, Td, Text, Tr } from "@chakra-ui/react"
import FeesTable from "components/[guild]/Requirements/components/GuildCheckout/components/FeesTable"
import { useCollectNftContext } from "components/[guild]/collect/components/CollectNftContext"
import { CHAIN_CONFIG } from "connectors"
import { formatUnits } from "viem"
import useGuildFee from "../hooks/useGuildFee"
import useNftDetails from "../hooks/useNftDetails"

type Props = {
  bgColor?: string
}

const CollectNftFeesTable = ({ bgColor }: Props) => {
  const { chain, nftAddress } = useCollectNftContext()

  const { guildFee } = useGuildFee(chain)
  const formattedGuildFee = guildFee
    ? Number(formatUnits(guildFee, CHAIN_CONFIG[chain].nativeCurrency.decimals))
    : undefined

  const { fee } = useNftDetails(chain, nftAddress)
  const formattedFee =
    typeof fee === "bigint"
      ? Number(formatUnits(fee, CHAIN_CONFIG[chain].nativeCurrency.decimals))
      : undefined

  const isFormattedGuildFeeLoaded = typeof formattedGuildFee === "number"
  const isFormattedFeeLoaded = typeof formattedFee === "number"

  return (
    <FeesTable
      buttonComponent={
        <HStack justifyContent={"space-between"} w="full">
          <Text fontWeight={"medium"}>Minting fee:</Text>

          <Text as="span">
            <Skeleton
              display="inline"
              isLoaded={isFormattedGuildFeeLoaded && isFormattedFeeLoaded}
            >
              {isFormattedGuildFeeLoaded && isFormattedFeeLoaded
                ? `${Number((formattedGuildFee + formattedFee).toFixed(5))} ${
                    CHAIN_CONFIG[chain].nativeCurrency.symbol
                  }`
                : "Loading"}
            </Skeleton>
            <Text as="span" colorScheme="gray">
              {" + gas"}
            </Text>
          </Text>
        </HStack>
      }
      bgColor={bgColor}
    >
      <Tr>
        <Td>Price</Td>
        <Td isNumeric>
          <Skeleton display="inline" isLoaded={isFormattedFeeLoaded}>
            {isFormattedFeeLoaded
              ? `${formattedFee} ${CHAIN_CONFIG[chain].nativeCurrency.symbol}`
              : "Loading"}
          </Skeleton>
        </Td>
      </Tr>

      <Tr>
        <Td>Minting fee</Td>
        <Td isNumeric>
          <Skeleton display="inline" isLoaded={isFormattedGuildFeeLoaded}>
            {isFormattedGuildFeeLoaded
              ? `${formattedGuildFee} ${CHAIN_CONFIG[chain].nativeCurrency.symbol}`
              : "Loading"}
          </Skeleton>
        </Td>
      </Tr>

      <Tr>
        <Td>Total</Td>
        <Td isNumeric color="WindowText">
          <Text as="span">
            <Skeleton
              display="inline"
              isLoaded={isFormattedGuildFeeLoaded && isFormattedFeeLoaded}
            >
              {isFormattedGuildFeeLoaded && isFormattedFeeLoaded
                ? `${Number((formattedGuildFee + formattedFee).toFixed(5))} ${
                    CHAIN_CONFIG[chain].nativeCurrency.symbol
                  }`
                : "Loading"}
            </Skeleton>
            <Text as="span">{" + gas"}</Text>
          </Text>
        </Td>
      </Tr>
    </FeesTable>
  )
}

export default CollectNftFeesTable
