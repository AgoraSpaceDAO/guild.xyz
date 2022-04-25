import {
  Box,
  Flex,
  Heading,
  HStack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react"
import { Player } from "@lottiefiles/react-lottie-player"
import Button from "components/common/Button"
import LinkButton from "components/common/LinkButton"
import { useRouter } from "next/router"
import { useRef } from "react"

const Hero = (): JSX.Element => {
  const router = useRouter()
  const lottiePlayer = useRef(null)
  const logoSize = useBreakpointValue({ base: 64, md: 80, lg: 112 })

  const showExplorer = () =>
    router.push({ query: { ...router.query, view: "explorer" } }, undefined, {
      scroll: false,
      shallow: true,
    })

  return (
    <Box as="section" zIndex={-1} sx={{ transformStyle: "preserve-3d" }}>
      <Box
        position="absolute"
        inset={0}
        bgImage="url('/guildGuard/bg.svg')"
        bgSize={{ base: "cover", lg: "calc(100% - 2.25rem) auto" }}
        bgRepeat="no-repeat"
        bgPosition="top 1.75rem center"
        opacity={0.075}
        zIndex={-1}
        sx={{
          transform: "translateZ(-1px) scale(1.5)",
        }}
      />
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear-gradient(to top, var(--chakra-colors-gray-800), transparent)"
      />
      <Flex
        position="relative"
        direction="column"
        alignItems="center"
        justifyContent="center"
        mx="auto"
        px={8}
        w="full"
        maxW={{
          base: "full",
          md: "container.md",
          lg: "container.lg",
          "2xl": "container.xl",
        }}
        height="100vh"
      >
        <Box
          onMouseEnter={() => {
            lottiePlayer.current?.setPlayerDirection(-1)
            lottiePlayer.current?.play()
          }}
          onMouseLeave={() => {
            lottiePlayer.current?.setPlayerDirection(1)
            lottiePlayer.current?.play()
          }}
        >
          <Player
            ref={lottiePlayer}
            autoplay
            keepLastFrame
            speed={1}
            src="/logo_lottie.json"
            style={{
              marginBottom: 24,
              height: logoSize,
              width: logoSize,
            }}
          />
        </Box>
        <Heading
          as="h2"
          mb={4}
          fontFamily="display"
          fontSize={{ base: "4xl", md: "5xl", lg: "7xl" }}
          lineHeight="95%"
          textAlign="center"
        >
          Build your <br />
          tokenized Guild
        </Heading>
        <Text
          mb={12}
          maxW="container.lg"
          color="gray.450"
          fontSize={{ base: "lg", lg: "2xl" }}
          fontWeight="bold"
          textAlign="center"
          lineHeight={{ base: "125%", md: "115%" }}
        >
          Automated membership management for the <br />
          platforms your community already use.
        </Text>

        <HStack spacing={{ base: 2, md: 3 }} mb={3}>
          <LinkButton
            href="/create-guild"
            colorScheme="DISCORD"
            px={{ base: 4, "2xl": 6 }}
            h={{ base: 12, "2xl": 14 }}
            fontFamily="display"
            fontWeight="bold"
            letterSpacing="wide"
            lineHeight="base"
          >
            Add to Discord
          </LinkButton>
          <Button
            onClick={showExplorer}
            colorScheme="solid-gray"
            px={{ base: 4, "2xl": 6 }}
            h={{ base: 12, "2xl": 14 }}
            fontFamily="display"
            fontWeight="bold"
            letterSpacing="wide"
            lineHeight="base"
          >
            Explore Guilds
          </Button>
        </HStack>

        <Text
          color="gray.450"
          fontFamily="display"
          fontWeight="bold"
          fontSize={{ base: "xs", lg: "sm" }}
        >
          Guild creation is free and gasless
        </Text>
      </Flex>
    </Box>
  )
}

export default Hero
