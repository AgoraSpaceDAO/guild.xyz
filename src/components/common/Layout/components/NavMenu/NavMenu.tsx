import {
  Grid,
  HStack,
  Icon,
  Img,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react"
import Button from "components/common/Button"
import dynamic from "next/dynamic"
import NextLink from "next/link"
import {
  Code,
  DiscordLogo,
  House,
  Info,
  List,
  MagnifyingGlass,
  RocketLaunch,
  TwitterLogo,
} from "phosphor-react"
import NavButton from "./components/NavButton"
import NavGroup from "./components/NavGroup"
import useUpvoty from "./hooks/useUpvoty"

const AnimatedLogo = dynamic(() => import("components/explorer/AnimatedLogo"), {
  ssr: false,
  loading: () => <Img src="/guildLogos/logo.svg" boxSize={4} />,
})

const NavMenu = (): JSX.Element => {
  const { url: upvotyUrl } = useUpvoty()

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button
          aria-label="Navigation menu"
          rightIcon={<Icon as={List} mt="1px" />}
          iconSpacing="3"
          fontFamily={"display"}
          fontWeight="black"
          borderRadius={"2xl"}
          variant="ghost"
          data-dd-action-name="Navigation menu"
        >
          <HStack spacing={"7px"}>
            <AnimatedLogo />
            <Text as="span">Guild</Text>
          </HStack>
        </Button>
      </PopoverTrigger>
      <PopoverContent w="auto" minW="xs" borderRadius={"lg"} py="2">
        <PopoverBody px={{ base: 2, sm: 3 }}>
          <Grid
            templateColumns={{ base: "1fr", sm: "1fr 150px", md: "1fr 150px 150px" }}
            gap={{ base: 2, sm: "8" }}
          >
            <NavGroup title="About">
              <NextLink passHref href="/">
                <NavButton
                  leftIcon={<House />}
                  data-dd-action-name="Navigation menu - Landing"
                >
                  What's Guild.xyz?
                </NavButton>
              </NextLink>
              <NextLink passHref href="/explorer">
                <NavButton
                  leftIcon={<MagnifyingGlass />}
                  data-dd-action-name="Navigation menu - Explorer"
                >
                  Explore all guilds
                </NavButton>
              </NextLink>
              <NavButton
                target="_blank"
                href="https://docs.guild.xyz/guild"
                rel="noopener"
                leftIcon={<Info />}
                data-dd-action-name="Navigation menu - Guide"
              >
                Guide
              </NavButton>
            </NavGroup>
            <NavGroup title="Socials">
              <NavButton
                target="_blank"
                href="https://discord.gg/guildxyz"
                rel="noopener"
                leftIcon={<DiscordLogo />}
                data-dd-action-name="Navigation menu - Discord"
              >
                Discord
              </NavButton>
              <NavButton
                target="_blank"
                href="https://twitter.com/guildxyz"
                rel="noopener"
                leftIcon={<TwitterLogo />}
                data-dd-action-name="Navigation menu - Twitter"
              >
                Twitter
              </NavButton>
            </NavGroup>
            <NavGroup title="Other">
              <NavButton
                target="_blank"
                href={upvotyUrl}
                rel="noopener"
                leftIcon={<RocketLaunch />}
                data-dd-action-name="Navigation menu - Roadmap"
              >
                Roadmap
              </NavButton>
              <NavButton
                target="_blank"
                href="https://github.com/agoraxyz/guild.xyz"
                rel="noopener"
                leftIcon={<Code />}
                data-dd-action-name="Navigation menu - Code"
              >
                Code
              </NavButton>
            </NavGroup>
          </Grid>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default NavMenu
