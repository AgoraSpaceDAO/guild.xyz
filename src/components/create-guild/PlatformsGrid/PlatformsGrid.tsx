import { Box, Heading, SimpleGrid, Stack, StackProps } from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import rewards from "platforms/rewards"
import { PlatformName, PlatformType } from "types"
import PlatformSelectButton from "./components/PlatformSelectButton"

type Props = {
  onSelection: (platform: PlatformName) => void
  disabledList?: { name: PlatformName; description: string }[]
} & StackProps

type PlatformsGridData = {
  platform: PlatformName
  description?: string
  isGeneral?: boolean
}

const PlatformsGrid = ({ onSelection, disabledList, ...rest }: Props) => {
  const { guildPlatforms, featureFlags } = useGuild()

  // TODO: move back out of the component and remove optional POAP logic once it'll be a real reward
  const platformsData: PlatformsGridData[] = [
    {
      platform: "DISCORD",
      description: "Manage roles",
    },
    {
      platform: "TELEGRAM",
      description: "Manage groups",
    },
    {
      platform: "GOOGLE",
      description: "Manage documents",
    },
    {
      platform: "GITHUB",
      description: "Manage repositories",
    },
    {
      platform: "POAP",
      description: "Mint POAP",
    },
    {
      platform: "GATHER_TOWN",
      description: "Manage spaces",
    },
    ...(!guildPlatforms.find(
      (platform) => platform.platformId === PlatformType.POLYGON_ID
    )
      ? [
          {
            platform: "POLYGON_ID",
            description: "Prove role membership",
          } as PlatformsGridData,
        ]
      : []),
    {
      platform: "TEXT",
      description: "Gate special content, links, etc",
      isGeneral: true,
    },
    {
      platform: "CONTRACT_CALL",
      description: "Create a gated NFT",
      isGeneral: true,
    },
    {
      platform: "POINTS",
      description: "Gamification utility",
      isGeneral: true,
    },
    {
      platform: "ERC20",
      description: "Create airdrops, reward tokens",
      isGeneral: true,
    },
    ...(featureFlags.includes("FORMS")
      ? [
          {
            platform: "FORM",
            description: "Gather responses",
            isGeneral: true,
          } as PlatformsGridData,
        ]
      : []),
  ]

  return (
    <Stack spacing={7} {...rest}>
      <PlatformSelectButtons
        platformsData={platformsData.filter((p) => !p.isGeneral)}
        onSelection={onSelection}
        disabledList={disabledList}
      />

      <Box>
        <Heading as="h3" fontSize={"md"} mb="3">
          General
        </Heading>
        <PlatformSelectButtons
          platformsData={platformsData.filter((p) => p.isGeneral)}
          onSelection={onSelection}
          disabledList={disabledList}
        />
      </Box>
    </Stack>
  )
}

const PlatformSelectButtons = ({
  platformsData,
  onSelection,
  disabledList,
}: {
  platformsData: PlatformsGridData[]
  onSelection: Props["onSelection"]
  disabledList?: { name: PlatformName; description: string }[]
}) => (
  <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 4, md: 5 }}>
    {platformsData.map(({ platform, description }) => (
      <PlatformSelectButton
        key={platform}
        platform={platform}
        title={rewards[platform].name}
        description={description}
        icon={rewards[platform].icon}
        imageUrl={rewards[platform].imageUrl}
        onSelection={onSelection}
        disabledText={disabledList?.find((pf) => pf.name === platform)?.description}
      />
    ))}
  </SimpleGrid>
)

export default PlatformsGrid
