import {
  Box,
  Circle,
  Flex,
  HStack,
  Heading,
  Icon,
  SimpleGrid,
  Spacer,
  Text,
  Wrap,
  useColorModeValue,
} from "@chakra-ui/react"
import LogicDivider from "components/[guild]/LogicDivider"
import RequirementDisplayComponent from "components/[guild]/Requirements/components/RequirementDisplayComponent"
import HiddenRewards from "components/[guild]/RoleCard/components/HiddenRewards"
import {
  RewardDisplay,
  RewardIcon,
} from "components/[guild]/RoleCard/components/Reward"
import Card from "components/common/Card"
import GuildLogo from "components/common/GuildLogo"
import { Check } from "phosphor-react"
import { Fragment, KeyboardEvent } from "react"
import { GuildFormType, GuildPlatform, PlatformType, Requirement } from "types"
import capitalize from "utils/capitalize"

type Template = {
  name: string
  description?: string
  roles: GuildFormType["roles"]
}

type Props = Template & {
  id: string
  selected?: boolean
  selectedGuildPlatforms: (Partial<GuildPlatform> & { platformName: string })[]
  onClick: (newTemplateId: string) => void
}

const getRewardLabel = (platform: Partial<GuildPlatform>) => {
  switch (platform.platformId) {
    case PlatformType.DISCORD:
      return "Role in: "

    case PlatformType.GOOGLE:
      return `${capitalize(platform.platformGuildId ?? "reader")} access to: `

    default:
      return "Access to: "
  }
}

const TemplateCard = ({
  id,
  name,
  description,
  roles,
  selected,
  selectedGuildPlatforms,
  onClick,
}: Props): JSX.Element => {
  const roleBottomBgColor = useColorModeValue("gray.50", "blackAlpha.300")
  const roleBottomBorderColor = useColorModeValue("gray.200", "gray.600")
  const role = roles[0]

  return (
    <Box
      tabIndex={0}
      onClick={() => onClick(id)}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key !== "Enter" && e.key !== " ") return
        e.preventDefault()
        onClick(id)
      }}
      position="relative"
      mb={{ base: 4, md: 6 }}
      borderRadius="2xl"
      overflow="hidden"
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
      _hover={{
        _before: {
          opacity: 0.1,
        },
      }}
      _focus={{
        outline: "none",
        _before: {
          opacity: 0.1,
        },
      }}
      _active={{
        _before: {
          opacity: 0.17,
        },
      }}
      cursor="pointer"
      h="max-content"
      w="full"
    >
      <Card
        scrollMarginTop={"calc(var(--chakra-space-12) + var(--chakra-space-6))"}
        overflow="clip"
        sx={{
          ":target": {
            boxShadow: "var(--chakra-shadows-outline)",
          },
        }}
        onClick={() => {
          if (window.location.hash === `#role-${role.id}`) window.location.hash = "!"
        }}
      >
        <SimpleGrid columns={{ base: 1, md: 2 }}>
          <Flex direction="column">
            <HStack spacing={3} p={5}>
              <HStack spacing={4} minW={0}>
                <GuildLogo
                  imageUrl={role.imageUrl}
                  size={{ base: "48px", md: "52px" }}
                />
                <Wrap spacingX={3} spacingY={1}>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontFamily="display"
                    minW={0}
                    overflowWrap={"break-word"}
                    mt="-1px !important"
                  >
                    {role.name}
                  </Heading>
                  {/*<Visibility entityVisibility={role.visibility} showTagLabel />*/}
                </Wrap>
              </HStack>
            </HStack>
            <Box pl={5}>{description}</Box>
            <Box p={5} pt={2} mt="auto">
              {selectedGuildPlatforms?.map((platform, i) => (
                <RewardDisplay
                  key={i}
                  label={
                    <>
                      {getRewardLabel(platform)}
                      <Text as="span" fontWeight="bold">
                        {getValueToDisplay(platform)}
                      </Text>
                    </>
                  }
                  icon={
                    <RewardIcon
                      rolePlatformId={platform.id}
                      guildPlatform={platform as any}
                      withMotionImg={false}
                    />
                  }
                />
              ))}
              {role.hiddenRewards && <HiddenRewards />}
            </Box>
          </Flex>
          <Flex
            direction="column"
            bgColor={roleBottomBgColor}
            borderLeftWidth={{ base: 0, md: 1 }}
            borderLeftColor={roleBottomBorderColor}
            transition="background .2s"
            // Card's `overflow: clip` isn't enough in Safari
            borderTopRightRadius={{ md: "2xl" }}
            borderBottomRightRadius={{ md: "2xl" }}
            pos="relative"
          >
            <HStack p={5} pb={0} mb={{ base: 4, md: 6 }} transition="transform .2s">
              <Text
                as="span"
                mt="1"
                mr="2"
                fontSize="xs"
                fontWeight="bold"
                color="gray"
                textTransform="uppercase"
                noOfLines={1}
                transition="opacity .2s"
              >
                Requirements to qualify
              </Text>
              <Spacer />
            </HStack>
            <Box p={5} pt={0}>
              {role.requirements.map((requirement, i) => (
                <Fragment key={i}>
                  <RequirementDisplayComponent
                    requirement={requirement as Requirement}
                  />
                  {i < role.requirements.length - 1 && (
                    <LogicDivider logic="AND" py={1} />
                  )}
                </Fragment>
              ))}
            </Box>
          </Flex>
        </SimpleGrid>
      </Card>
      <Flex
        position="absolute"
        inset={0}
        justifyContent="end"
        p={5}
        borderWidth={2}
        borderStyle={selected ? "solid" : "dashed"}
        borderColor={selected && "green.500"}
        borderRadius="2xl"
        pointerEvents="none"
        transition="border 0.16s ease"
      >
        {selected ? (
          <Circle
            bgColor="green.500"
            color="white"
            size={6}
            transition="opacity 0.16s ease"
            opacity={selected ? 1 : 0}
          >
            <Icon as={Check} />
          </Circle>
        ) : (
          <Circle
            borderColor={"gray"}
            borderStyle={"solid"}
            borderWidth={2}
            size={6}
          />
        )}
      </Flex>
    </Box>
  )
}

function getValueToDisplay(
  platform: Partial<GuildPlatform> & {
    platformName: string
  }
): string {
  if (platform.platformId == PlatformType.TEXT)
    return platform.platformGuildData.name ?? "Secret"

  if (platform.platformId == PlatformType.TELEGRAM)
    return platform.platformGuildData.name ?? "Telegram group"

  if (platform.platformId == PlatformType.DISCORD)
    return platform.platformGuildData.name ?? "Discord server"

  if (platform.platformId == PlatformType.CONTRACT_CALL)
    return platform.platformGuildData.name ?? "NFT"

  return platform.platformGuildName || platform.platformGuildId
}
export default TemplateCard
export type { Template }
