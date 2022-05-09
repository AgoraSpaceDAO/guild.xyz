import { Box, Flex, Img } from "@chakra-ui/react"
import LandingSection from "./LandingSection"
import LandingSectionText from "./LandingSectionText"

const PlatformAgnosticCommunities = (): JSX.Element => (
  <LandingSection
    title="Platform-agnostic communities"
    photo={
      <Flex justifyContent="end" width="full">
        <Box position="relative" width={{ base: "80%", md: "full" }}>
          <Img
            w="full"
            src="/landing/platform-agnostic-communities.png"
            alt="Platform-agnostic communities"
          />

          <Img
            position="absolute"
            left="-30%"
            bottom={0}
            height="90%"
            src="/landing/rocket.svg"
            alt="Rocket"
          />
        </Box>
      </Flex>
    }
    content={
      <LandingSectionText>
        Bring your community to your favourite communication platfroms, management
        tools or games.
      </LandingSectionText>
    }
  />
)

export default PlatformAgnosticCommunities
