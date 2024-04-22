import {
  Box,
  Circle,
  Flex,
  HStack,
  Icon,
  Skeleton,
  Spinner,
  Stack,
  Tag,
  TagProps,
  TagRightIcon,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react"
import { useAccessedGuildPoints } from "components/[guild]/AccessHub/hooks/useAccessedGuildPoints"
import {
  RewardDisplay,
  RewardIcon,
  RewardProps,
} from "components/[guild]/RoleCard/components/Reward"
import ClickableTagPopover from "components/[guild]/activity/ActivityLogAction/components/ClickableTagPopover"
import useGuildPermission from "components/[guild]/hooks/useGuildPermission"
import useRequirements from "components/[guild]/hooks/useRequirements"
import Button from "components/common/Button"
import GuildLogo from "components/common/GuildLogo"
import ConfirmationAlert from "components/create-guild/Requirements/components/ConfirmationAlert"
import { useRoleMembership } from "components/explorer/hooks/useMembership"
import useToast from "hooks/useToast"
import {
  ArrowRight,
  ArrowSquareIn,
  Coin,
  DotsThreeVertical,
  Wallet,
} from "phosphor-react"
import ClaimTokenModal from "platforms/Token/ClaimTokenModal"
import FundPoolModal from "platforms/Token/FundPoolModal"
import {
  TokenRewardProvider,
  useTokenRewardContext,
} from "platforms/Token/TokenRewardContext"
import { useCalculateForRolePlatform } from "platforms/Token/hooks/useCalculateToken"
import usePool from "platforms/Token/hooks/usePool"
import useWithdrawPool from "platforms/Token/hooks/useWithdrawPool"
import { useState } from "react"
import Star from "static/icons/star.svg"
import { RolePlatform } from "types"
import { formatUnits } from "viem"

const PoolTag = ({ poolId, ...rest }: { poolId: bigint } & TagProps) => {
  const {
    token: {
      data: { decimals },
      isLoading: isTokenLoading,
    },
    guildPlatform,
  } = useTokenRewardContext()

  const chain = guildPlatform.platformGuildData.chain

  const { data, isLoading, error, refetch } = usePool(chain, poolId)

  const toast = useToast()

  const { onSubmitTransaction: onSubmitWithdraw, isLoading: withdrawIsLoading } =
    useWithdrawPool(chain, poolId, () => {
      toast({
        status: "success",
        title: "Success",
        description: "Successfully withdrawed all funds from the pool!",
      })
      withdrawOnClose()
      refetch()
    })

  const { colorMode } = useColorMode()
  const [showClaimed, setShowClaimed] = useState(false)
  const {
    isOpen: fundIsOpen,
    onOpen: fundOnOpen,
    onClose: fundOnClose,
  } = useDisclosure()

  const {
    isOpen: withdrawIsOpen,
    onOpen: withdrawOnOpen,
    onClose: withdrawOnClose,
  } = useDisclosure()

  if (isLoading)
    return (
      <Tag>
        <Skeleton isLoaded={!isLoading && !isTokenLoading}></Skeleton>
      </Tag>
    )
  if (error) return <Tag>Failed to load balance</Tag>

  const [owner, , totalFunding, poolBalance] = data
  const capacity = Number(formatUnits(totalFunding, decimals))
  const balance = Number(formatUnits(poolBalance, decimals))

  const claimedCount = Number((capacity - balance).toFixed(4))
  const available = Number(
    (capacity - claimedCount < 0 ? 0 : capacity - claimedCount).toFixed(4)
  )

  const isWithdrawDisabled = balance === 0

  return (
    <>
      <Tag {...rest}>
        <Tooltip label={showClaimed ? "Show available" : "Show claimed"} hasArrow>
          <Box
            onClick={() => setShowClaimed((prevValue) => !prevValue)}
            cursor="pointer"
          >
            {showClaimed
              ? `${claimedCount} / ${capacity} claimed`
              : `${available} / ${capacity} available`}
          </Box>
        </Tooltip>

        <ClickableTagPopover
          options={
            <Stack gap={0}>
              <HStack
                onClick={fundOnOpen}
                px={3}
                py={1}
                _hover={{
                  cursor: "pointer",
                  background:
                    colorMode === "light" ? "blackAlpha.100" : "whiteAlpha.100",
                }}
              >
                <Icon as={Coin} weight="bold" />
                <Text fontSize={"sm"} fontWeight={"bold"}>
                  Fund pool
                </Text>
              </HStack>
              <HStack
                px={3}
                py={1}
                _hover={{
                  cursor: isWithdrawDisabled ? "default" : "pointer",
                  background:
                    colorMode === "light" ? "blackAlpha.100" : "whiteAlpha.100",
                }}
                opacity={isWithdrawDisabled ? 0.5 : 1}
                onClick={!isWithdrawDisabled ? withdrawOnOpen : () => {}}
              >
                <Icon as={Wallet} weight="bold" />
                <Text fontSize={"sm"} fontWeight={"bold"}>
                  Withdraw
                </Text>
              </HStack>
            </Stack>
          }
        >
          <TagRightIcon
            as={DotsThreeVertical}
            opacity={0.5}
            _hover={{ opacity: 1, cursor: "pointer" }}
          />
        </ClickableTagPopover>
      </Tag>

      <FundPoolModal
        poolId={poolId}
        balance={balance}
        owner={owner}
        onClose={fundOnClose}
        isOpen={fundIsOpen}
        onSuccess={() => {
          toast({
            status: "success",
            title: "Success",
            description: "Successfully funded the token pool!",
          })
          fundOnClose()
          refetch()
        }}
      />

      <ConfirmationAlert
        isLoading={withdrawIsLoading}
        isOpen={withdrawIsOpen}
        onClose={withdrawOnClose}
        onConfirm={onSubmitWithdraw}
        title="Withdraw all funds"
        description={
          <>
            Are you sure you want to withdraw all funds from the reward pool? No
            further rewards can be claimed until funded again.
          </>
        }
        confirmationText="Withdraw"
      />
    </>
  )
}

const TokenConversionTag = ({ platform }: { platform: RolePlatform }) => {
  const { imageUrl } = useTokenRewardContext()

  const calcDynamic = () => {
    const operation: any = platform.dynamicAmount.operation
    const params = operation.params
    return params?.multiplier + params?.addition
  }

  const { data: requirements } = useRequirements(
    platform.dynamicAmount?.operation?.input?.[0]?.roleId
  )
  const req = requirements?.find(
    (r) => r.id === platform.dynamicAmount?.operation?.input?.[0]?.requirementId
  )

  const pointsTypeId = req?.data?.guildPlatformId

  const accessedPoints = useAccessedGuildPoints("ALL")

  const pointType = accessedPoints?.find((ap) => ap.id === pointsTypeId)
  const bgColor = useColorModeValue("gray.800", "gray.700")

  return (
    <>
      <Tag width={"fit-content"}>
        {pointType?.platformGuildData.imageUrl ? (
          <>
            <GuildLogo
              imageUrl={pointType.platformGuildData.imageUrl}
              size={"16px"}
              mr={1}
            />
          </>
        ) : (
          <Circle size={5} bgColor={bgColor} mr={1} p={"4px"}>
            <Star color="white" />
          </Circle>
        )}
        1 <Icon as={ArrowRight} boxSize={"10px"} ml={2} />{" "}
        <GuildLogo imageUrl={imageUrl} size={"16px"} mr={1} ml={2} /> {calcDynamic()}
      </Tag>
    </>
  )
}

const TokenReward = ({ rolePlatform }: { rolePlatform: RolePlatform }) => {
  const { imageUrl, token } = useTokenRewardContext()

  const claimableAmount = useCalculateForRolePlatform(rolePlatform)

  const { isAdmin } = useGuildPermission()

  const { hasRoleAccess } = useRoleMembership(rolePlatform.roleId)

  const tokenRewardType = rolePlatform.dynamicAmount.operation.input[0].type

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Flex alignItems={"center"} gap={1} wrap={"wrap"} mt={2}>
      <RewardDisplay
        icon={
          token.isLoading ? (
            <Spinner boxSize={6} />
          ) : (
            <RewardIcon
              rolePlatformId={rolePlatform.id}
              guildPlatform={rolePlatform?.guildPlatform}
              owerwriteImg={imageUrl}
            />
          )
        }
        label={
          <>
            {`Claim: `}
            <Tooltip
              label={
                !hasRoleAccess ? (
                  `You will be able to claim these tokens if you satisfy the requirements for this role.`
                ) : (
                  <>
                    Claim reward <Icon as={ArrowSquareIn} mb="-0.5" />
                  </>
                )
              }
              shouldWrapChildren
              hasArrow
            >
              <Button
                variant="link"
                onClick={() => onOpen()}
                isDisabled={!hasRoleAccess}
              >
                {claimableAmount || 0} {token?.data?.symbol || "tokens"}
              </Button>
            </Tooltip>
          </>
        }
        whiteSpace={"nowrap"}
        pt={0}
        mr={2}
      />
      {tokenRewardType === "REQUIREMENT_AMOUNT" && (
        <TokenConversionTag platform={rolePlatform} />
      )}

      {isAdmin && (
        <PoolTag
          poolId={BigInt(rolePlatform.guildPlatform.platformGuildData.poolId)}
        />
      )}

      <ClaimTokenModal isOpen={isOpen} onClose={onClose} />
    </Flex>
  )
}

const TokenRewardWrapper = ({ platform }: RewardProps) => (
  <TokenRewardProvider guildPlatform={platform.guildPlatform}>
    <TokenReward rolePlatform={platform} />
  </TokenRewardProvider>
)

export default TokenRewardWrapper
