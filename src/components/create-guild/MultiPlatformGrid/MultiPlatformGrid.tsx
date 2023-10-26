import { SimpleGrid, Stack } from "@chakra-ui/react"
import platforms from "platforms/platforms"
import { PlatformName } from "types"
import MultiPlatformSelectButton from "./components/MultiPlatformSelectButton"

type Props = {
  onSelection: (platform: PlatformName) => void
  showPoap?: boolean
}

type PlatformsGridData = {
  description?: string
}

const MultiPlatformsGrid = ({ onSelection, showPoap = false }: Props) => {
  // TODO: move back out of the component and remove optional POAP logic once it'll be a real reward
  const platformsData: Record<
    Exclude<
      PlatformName,
      "" | "TWITTER" | "TWITTER_V1" | "POAP" | "EMAIL" | "UNIQUE_TEXT"
    >,
    PlatformsGridData
  > = {
    DISCORD: {
      description: "Manage roles",
    },
    TELEGRAM: {
      description: "Manage groups",
    },
    GOOGLE: {
      description: "Manage documents",
    },
    GITHUB: {
      description: "Manage repositories",
    },
    ...(showPoap
      ? {
          POAP: {
            description: "Mint POAP",
          },
        }
      : {}),
    CONTRACT_CALL: {
      description: "Create a gated NFT",
    },
    TEXT: {
      description: "Gate any info as revealable text",
    },
  }

  return (
    <Stack spacing={8}>
      <SimpleGrid
        data-test="platforms-grid"
        columns={{ base: 1, md: 2 }}
        gap={{ base: 4, md: 5 }}
      >
        {Object.entries(platformsData).map(
          ([platform, { description }]: [PlatformName, { description: string }]) => (
            <MultiPlatformSelectButton
              key={platform}
              platform={platform}
              title={platforms[platform].name}
              description={description}
              icon={platforms[platform].icon}
              imageUrl={platforms[platform].imageUrl}
              onSelection={onSelection}
            />
          )
        )}
      </SimpleGrid>
    </Stack>
  )
}

export default MultiPlatformsGrid
