import { Flex, Heading, Icon, Text } from "@chakra-ui/react"
import Button from "components/common/Button"
import Head from "next/head"
import { DiscordLogo } from "phosphor-react"
import NotFoundIcon from "static/avatars/58.svg"

const Page = ({ statusCode }): JSX.Element => (
  <>
    <Head>
      <title>{`Guild - ${statusCode || "Client-side"} error`}</title>
    </Head>
    <Flex
      alignItems="center"
      justifyContent="center"
      direction="column"
      minH="100vh"
      maxW={{ base: "full", sm: "530px" }}
      mx="auto"
      p={4}
      textAlign="center"
    >
      <Icon as={NotFoundIcon} boxSize={24} alt="Not found" />
      {statusCode ? (
        <Heading
          mt={2}
          mb={6}
          fontFamily="display"
          as="h1"
          fontSize={{ base: "8xl", md: "9xl" }}
        >
          {statusCode}
        </Heading>
      ) : (
        <Heading mt={6} mb={10} fontFamily="display" as="h1" fontSize={"6xl"}>
          Client-side error
        </Heading>
      )}
      <Text fontSize="lg" mb={10} fontWeight="medium">
        Uh-oh! Something went wrong, please contact us on our Discord server if you
        think you shouldn't see this page!
      </Text>
      <Button
        as="a"
        href="https://discord.gg/bryPA3peuT"
        target="_blank"
        leftIcon={<DiscordLogo />}
        colorScheme="DISCORD"
        iconSpacing={3}
        size="lg"
      >
        Guild.xyz Discord
      </Button>
    </Flex>
  </>
)

Page.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Page
