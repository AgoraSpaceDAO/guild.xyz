import {
  Box,
  Circle,
  Flex,
  HStack,
  Img,
  Skeleton,
  SkeletonCircle,
  Spinner,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  VStack,
  Wrap,
} from "@chakra-ui/react"
import { formatUnits } from "@ethersproject/units"
import { useWeb3React } from "@web3-react/core"
import Card from "components/common/Card"
import Link from "components/common/Link"
import useGuild from "components/[guild]/hooks/useGuild"
import usePoap from "components/[guild]/Requirements/components/PoapRequirementCard/hooks/usePoap"
import { Chains, RPC } from "connectors"
import useTokenData from "hooks/useTokenData"
import { CoinVertical, DiscordLogo, PencilSimple, Upload } from "phosphor-react"
import { useMemo } from "react"
import usePoapLinks from "../../hooks/usePoapLinks"
import usePoapVault from "../../hooks/usePoapVault"
import { useCreatePoapContext } from "../CreatePoapContext"
import ActionButton from "./components/ActionButton"
import Withdraw from "./components/Withdraw"

type Props = {
  poapFancyId: string
}

const PoapListItem = ({ poapFancyId }: Props): JSX.Element => {
  const borderColor = useColorModeValue("blackAlpha.300", "blackAlpha.600")

  const { chainId } = useWeb3React()
  const { urlName, poaps } = useGuild()
  const guildPoap = poaps?.find((p) => p.fancyId === poapFancyId)
  const guildPoapChainId = guildPoap?.poapContracts
    ?.map((poapContract) => poapContract.chainId)
    ?.includes(chainId)
    ? chainId
    : guildPoap?.poapContracts?.[0]?.chainId
  const { poap, isLoading } = usePoap(poapFancyId)
  const { poapLinks, isPoapLinksLoading } = usePoapLinks(poap?.id)

  const vaultId = guildPoap?.poapContracts
    ?.map((poapContract) => poapContract.chainId)
    ?.includes(chainId)
    ? guildPoap?.poapContracts?.find(
        (poapContract) => poapContract?.chainId === chainId
      )?.vaultId
    : guildPoap?.poapContracts?.[0]?.vaultId
  const { vaultData, isVaultLoading, vaultError } = usePoapVault(
    vaultId,
    guildPoapChainId
  )

  const {
    data: { decimals },
  } = useTokenData(
    Chains[guildPoapChainId],
    vaultData?.token === "0x0000000000000000000000000000000000000000"
      ? undefined
      : vaultData?.token
  )

  const { setStep } = useCreatePoapContext()

  const {
    data: { symbol },
    isValidating: isTokenDataLoading,
  } = useTokenData(Chains[guildPoapChainId], vaultData?.token)

  const { setPoapData } = useCreatePoapContext()

  const isExpired = useMemo(() => {
    if (!poap) return false
    const currentTime = Date.now()

    // Hotfix so it works well in Firefox too
    const [day, month, year] = poap.expiry_date?.split("-")
    const convertedPoapExpiryDate = `${day}-${month}${year}`

    const expiryTime = new Date(convertedPoapExpiryDate)?.getTime()

    return currentTime >= expiryTime
  }, [poap])

  const isActive = useMemo(
    () =>
      !poap || !poaps
        ? false
        : poaps.find((p) => p.poapIdentifier === poap.id)?.activated,
    [poap, poaps]
  )
  const isReady = useMemo(() => poapLinks && poapLinks?.total > 0, [poapLinks])

  const tooltipLabel = isExpired
    ? "Your POAP has expired."
    : isActive
    ? "Your poap is being distributed."
    : isReady
    ? "You can send the Discord claim button."
    : "You haven't uploaded the mint links for your POAP yet."

  const statusText = isExpired
    ? "Expired"
    : isActive
    ? "Active"
    : isReady
    ? "Pending"
    : "Setup required"

  const statusColor = isExpired
    ? "gray.500"
    : isActive
    ? "green.500"
    : isReady
    ? "yellow.500"
    : "gray.500"

  const isTagLoading = isVaultLoading || isTokenDataLoading

  const sendClaimButtonText = useBreakpointValue({
    base: "Send",
    md: isActive ? "Send claim button" : "Set up Discord claim",
  })

  const formattedPrice = vaultError
    ? "Error"
    : vaultData?.fee
    ? formatUnits(vaultData.fee, decimals ?? 18)
    : undefined

  return (
    <Card>
      <HStack
        alignItems="start"
        spacing={{ base: 2, md: 3 }}
        p={4}
        borderRadius="xl"
      >
        <SkeletonCircle
          boxSize={{ base: 10, md: 14 }}
          isLoaded={!isLoading && !!poap?.image_url}
        >
          <Box position="relative" boxSize={{ base: 10, md: 14 }}>
            <Img
              src={poap?.image_url}
              alt={poap?.name}
              boxSize={{ base: 10, md: 14 }}
              rounded="full"
            />

            {guildPoapChainId && (
              <Tooltip label={RPC[Chains[guildPoapChainId]]?.chainName}>
                <Circle
                  position="absolute"
                  top={{ base: -1, md: 0 }}
                  left={{ base: -1, md: 0 }}
                  size={5}
                  bgColor={"gray.100"}
                  borderWidth={1}
                  borderColor={borderColor}
                >
                  <Img
                    src={RPC[Chains[guildPoapChainId]]?.iconUrls?.[0]}
                    alt={RPC[Chains[guildPoapChainId]]?.chainName}
                    boxSize={3}
                  />
                </Circle>
              </Tooltip>
            )}

            <Flex
              position="absolute"
              left={0}
              right={0}
              bottom={-2}
              justifyContent="center"
            >
              <Tag
                size="sm"
                w="full"
                justifyContent="center"
                m={0}
                py={0}
                px={1}
                textTransform="uppercase"
                fontSize="xx-small"
                bgColor={vaultData?.fee ? "indigo.500" : "gray.500"}
                color="white"
                borderWidth={1}
                borderColor={borderColor}
              >
                {isTagLoading ? (
                  <Spinner size="xs" />
                ) : (
                  <TagLabel isTruncated>
                    {formattedPrice && formattedPrice !== "Error"
                      ? `${formattedPrice} ${symbol}`
                      : formattedPrice ?? "Free"}
                  </TagLabel>
                )}
              </Tag>
            </Flex>
          </Box>
        </SkeletonCircle>
        <VStack
          pt={1}
          alignItems="start"
          spacing={0}
          maxW={{
            base: "calc(100% - var(--chakra-space-14))",
            md: "calc(100% - var(--chakra-space-20))",
          }}
        >
          <Skeleton isLoaded={!isLoading && !!poap?.name} maxW="full">
            <Text
              as="span"
              display="block"
              fontWeight="bold"
              fontSize={{ base: "sm", md: "md" }}
              w="full"
              isTruncated
            >
              {poap?.name ?? "Loading POAP..."}
            </Text>
          </Skeleton>

          <Box py={0.5}>
            <Skeleton
              isLoaded={!isLoading && !!poap && !isPoapLinksLoading && !!poapLinks}
            >
              <HStack pb={2} spacing={1}>
                <HStack spacing={0}>
                  <Circle size={2.5} mr={1} bgColor={statusColor} />
                  <Tooltip label={tooltipLabel}>
                    <Text as="span" fontSize="xs" colorScheme="gray">
                      {statusText}
                    </Text>
                  </Tooltip>
                </HStack>

                {isActive && (
                  <Text as="span" fontSize="xs" colorScheme="gray">
                    {` • ${poapLinks?.claimed}/${poapLinks?.total} `}
                    <Text as="span" display={{ base: "none", md: "inline" }}>
                      claimed
                    </Text>
                  </Text>
                )}

                {isActive && (
                  <Text as="span" fontSize="xs" colorScheme="gray">
                    {` • `}
                    <Link href={`/${urlName}/claim-poap/${poapFancyId}`}>
                      Claim page
                    </Link>
                  </Text>
                )}
              </HStack>
            </Skeleton>
          </Box>

          <Wrap spacing={1}>
            <ActionButton
              leftIcon={PencilSimple}
              onClick={() => {
                setPoapData(poap as any)
                setStep(0)
              }}
            >
              Edit
            </ActionButton>

            {!isExpired && (
              <ActionButton
                leftIcon={Upload}
                onClick={() => {
                  setPoapData(poap as any)
                  setStep(1)
                }}
              >
                Upload mint links
              </ActionButton>
            )}

            {!isExpired && !isVaultLoading && isReady && !isActive && (
              <ActionButton
                leftIcon={CoinVertical}
                onClick={() => {
                  setPoapData(poap as any)
                  setStep(2)
                }}
                // disabled={isExpired}
              >
                Monetize
              </ActionButton>
            )}

            <Withdraw poapId={guildPoap?.id} />

            {!isExpired && isReady && (
              <ActionButton
                leftIcon={DiscordLogo}
                onClick={() => {
                  setPoapData(poap as any)
                  setStep(3)
                }}
              >
                {sendClaimButtonText}
              </ActionButton>
            )}
          </Wrap>
        </VStack>
      </HStack>
    </Card>
  )
}

export default PoapListItem
