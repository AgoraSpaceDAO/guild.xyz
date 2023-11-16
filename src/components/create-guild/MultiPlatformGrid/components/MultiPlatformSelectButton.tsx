import {
  Circle,
  Heading,
  HStack,
  Icon,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import useUser from "components/[guild]/hooks/useUser"
import useConnectPlatform from "components/[guild]/JoinModal/hooks/useConnectPlatform"
import useWeb3ConnectionManager from "components/_app/Web3ConnectionManager/hooks/useWeb3ConnectionManager"
import DisplayCard from "components/common/DisplayCard"
import { useCreateGuildContext } from "components/create-guild/CreateGuildContext"
import CreateGuildContractCall from "components/create-guild/MultiPlatformGrid/components/CreateGuildContractCall"
import CreateGuildDiscord from "components/create-guild/MultiPlatformGrid/components/CreateGuildDiscord"
import CreateGuildGithub from "components/create-guild/MultiPlatformGrid/components/CreateGuildGithub"
import CreateGuildGoogle from "components/create-guild/MultiPlatformGrid/components/CreateGuildGoogle"
import CreateGuildSecretText from "components/create-guild/MultiPlatformGrid/components/CreateGuildSecretText"
import CreateGuildTelegram from "components/create-guild/MultiPlatformGrid/components/CreateGuildTelegram"
import CreateGuildTwitter from "components/create-guild/MultiPlatformGrid/components/CreateGuildTwitter"
import CreateGuildUniqueText from "components/create-guild/MultiPlatformGrid/components/CreateGuildUniqueText"
import Image from "next/image"
import { CheckCircle, IconProps } from "phosphor-react"
import platforms from "platforms/platforms"
import { ComponentType, RefAttributes } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { GuildFormType, PlatformName, Rest } from "types"
import { useAccount } from "wagmi"

export type PlatformHookType = ({
  platform,
  onSelection,
}: {
  platform: PlatformName
  onSelection: (platform: PlatformName) => void
}) => {
  onClick: () => void
  isLoading: boolean
  loadingText: string
  rightIcon: ComponentType<IconProps & RefAttributes<SVGSVGElement>>
}

const createGuildPlatformComponents: Record<
  Exclude<PlatformName, "POAP" | "TWITTER_V1" | "EMAIL">,
  (props: { isOpen: boolean; onClose: () => void }) => JSX.Element
> = {
  DISCORD: CreateGuildDiscord,
  TELEGRAM: CreateGuildTelegram,
  GOOGLE: CreateGuildGoogle,
  GITHUB: CreateGuildGithub,
  CONTRACT_CALL: CreateGuildContractCall,
  TEXT: CreateGuildSecretText,
  TWITTER: CreateGuildTwitter,
  UNIQUE_TEXT: CreateGuildUniqueText,
}

type Props = {
  platform: PlatformName
  hook?: PlatformHookType
  title: string
  description?: string
  imageUrl?: string
  icon?: ComponentType<IconProps & RefAttributes<SVGSVGElement>>
  onSelection: (platform: PlatformName) => void
} & Rest

const MultiPlatformSelectButton = ({
  platform,
  title,
  description,
  imageUrl,
  icon,
  onSelection,
  ...rest
}: Props) => {
  const { address } = useAccount()
  const { openWalletSelectorModal } = useWeb3ConnectionManager()
  const { removePlatform } = useCreateGuildContext()
  const { setValue } = useFormContext<GuildFormType>()
  const { isOpen, onClose, onOpen } = useDisclosure()
  const user = useUser()

  const { onConnect, isLoading, loadingText } = useConnectPlatform(
    platform,
    () => onSelection(platform),
    false,
    "creation"
  )

  const guildPlatforms = useWatch({ name: "guildPlatforms" })
  const twitterLink = useWatch({ name: "socialLinks.TWITTER" })

  const isTwitter = platform === "TWITTER"
  const isPlatformConnected =
    !platforms[platform].oauth ||
    user.platformUsers?.some(
      ({ platformName, platformUserData }) =>
        platformName === platform && !platformUserData?.readonly
    ) ||
    isTwitter

  const circleBgColor = useColorModeValue("gray.700", "gray.600")

  const isDone = () => {
    const platformAddedToGuild = guildPlatforms.find(
      (platfomAdded) => platform === platfomAdded.platformName
    )

    if (isTwitter) {
      if (twitterLink) {
        return true
      } else {
        return false
      }
    }

    return platformAddedToGuild
  }

  const PlatformModal = createGuildPlatformComponents[platform]

  return (
    <>
      <DisplayCard
        cursor="pointer"
        onClick={
          !address
            ? openWalletSelectorModal
            : isPlatformConnected
            ? isDone()
              ? () => {
                  if (isTwitter) {
                    setValue("socialLinks.TWITTER", "")
                  } else {
                    removePlatform(platform)
                  }
                }
              : () => {
                  onOpen()
                  onSelection(platform)
                }
            : onConnect
        }
        h="auto"
        py={6}
        px={5}
        {...rest}
        data-test={`${platform}-select-button${
          isPlatformConnected ? "-connected" : ""
        }`}
      >
        <HStack spacing={4}>
          {imageUrl ? (
            <Circle size="12" pos="relative" overflow="hidden">
              <Image src={imageUrl} alt="Guild logo" layout="fill" />
            </Circle>
          ) : (
            <Circle
              bgColor={circleBgColor}
              size="12"
              pos="relative"
              overflow="hidden"
            >
              <Icon as={icon} boxSize={5} color={"white"} />
            </Circle>
          )}
          <VStack
            spacing={{ base: 0.5, lg: 1 }}
            alignItems="start"
            w="full"
            maxW="full"
          >
            <Heading
              fontSize={"md"}
              fontWeight="bold"
              letterSpacing="wide"
              maxW="full"
              noOfLines={1}
            >
              {title}
            </Heading>
            {description && (
              <Text letterSpacing="wide" colorScheme="gray">
                {(isLoading && `${loadingText}...`) || description}
              </Text>
            )}
          </VStack>
          {isDone() && (
            <Icon as={CheckCircle} weight="fill" boxSize={6} color={"green.500"} />
          )}
        </HStack>
      </DisplayCard>
      <PlatformModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}

export default MultiPlatformSelectButton
