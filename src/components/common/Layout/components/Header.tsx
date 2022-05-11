import { Button, Flex, HStack, Icon, IconButton, Img } from "@chakra-ui/react"
import { useThemeContext } from "components/[guild]/ThemeContext"
import { useRouter } from "next/dist/client/router"
import dynamic from "next/dynamic"
import NextLink from "next/link"
import { ArrowLeft } from "phosphor-react"
import React from "react"
import Account from "../components/Account"
import InfoMenu from "../components/InfoMenu"

const AnimatedLogo = dynamic(() => import("components/explorer/AnimatedLogo"), {
  ssr: false,
  loading: () => <Img src="/guildLogos/logo.svg" boxSize={4} />,
})

export type HeaderProps = {
  showBackButton?: boolean
}

const Header = ({ showBackButton = true }: HeaderProps): JSX.Element => {
  const colorContext = useThemeContext()
  const router: any = useRouter()
  const hasNavigated = router.components && Object.keys(router.components).length > 2

  return (
    <Flex
      position="relative"
      w="full"
      justifyContent="space-between"
      alignItems="center"
      p="2"
      // temporary
      sx={{
        "[aria-label]": {
          color: colorContext?.localThemeMode
            ? colorContext?.textColor === "whiteAlpha.900"
              ? "whiteAlpha.900"
              : "gray.900"
            : undefined,
        },
      }}
    >
      {showBackButton && hasNavigated ? (
        <IconButton
          aria-label="Go back"
          variant="ghost"
          isRound
          h="10"
          icon={<Icon width="1.1em" height="1.1em" as={ArrowLeft} />}
          onClick={() => router.back()}
        />
      ) : (
        <NextLink passHref href="/">
          <Button
            as="a"
            aria-label="Guild.xyz home"
            variant="ghost"
            leftIcon={<AnimatedLogo />}
            fontFamily={"display"}
            fontWeight="black"
            borderRadius={"2xl"}
          >
            Guild
          </Button>
        </NextLink>
      )}
      <HStack spacing="2" ml="auto">
        <Account />
        <InfoMenu />
      </HStack>
    </Flex>
  )
}

export default Header
