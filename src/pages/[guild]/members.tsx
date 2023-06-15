import { Center, Heading, HStack, Link, Spinner, Wrap } from "@chakra-ui/react"
import CRMTable from "components/[guild]/crm/CRMTable"
import useGuild from "components/[guild]/hooks/useGuild"
import useGuildPermission from "components/[guild]/hooks/useGuildPermission"
import SocialIcon from "components/[guild]/SocialIcon"
import Tabs from "components/[guild]/Tabs/Tabs"
import { ThemeProvider, useThemeContext } from "components/[guild]/ThemeContext"
import Button from "components/common/Button"
import GuildLogo from "components/common/GuildLogo"
import Layout from "components/common/Layout"
import dynamic from "next/dynamic"
import Head from "next/head"
import ErrorPage from "pages/_error"
import { Export } from "phosphor-react"
import { SocialLinkKey } from "types"
import parseDescription from "utils/parseDescription"

const DynamicActiveStatusUpdates = dynamic(
  () => import("components/[guild]/ActiveStatusUpdates")
)

const GuildPage = (): JSX.Element => {
  const { id: guildId, name, description, imageUrl, socialLinks } = useGuild()

  const { textColor, localThemeColor, localBackgroundImage } = useThemeContext()

  return (
    <>
      <Head>
        <meta name="theme-color" content={localThemeColor} />
      </Head>

      <Layout
        title={name}
        textColor={textColor}
        ogDescription={description}
        description={
          <>
            {description && parseDescription(description)}
            {Object.keys(socialLinks ?? {}).length > 0 && (
              <Wrap w="full" spacing={3} mt="3">
                {Object.entries(socialLinks).map(([type, link]) => {
                  const prettyLink = link
                    .replace(/(http(s)?:\/\/)*(www\.)*/i, "")
                    .replace(/\/+$/, "")

                  return (
                    <HStack key={type} spacing={1.5}>
                      <SocialIcon type={type as SocialLinkKey} size="sm" />
                      <Link
                        href={link?.startsWith("http") ? link : `https://${link}`}
                        isExternal
                        fontSize="sm"
                        fontWeight="semibold"
                        color={textColor}
                      >
                        {prettyLink}
                      </Link>
                    </HStack>
                  )
                })}
              </Wrap>
            )}
          </>
        }
        image={
          <GuildLogo
            imageUrl={imageUrl}
            size={{ base: "56px", lg: "72px" }}
            mt={{ base: 1, lg: 2 }}
            bgColor={textColor === "primary.800" ? "primary.800" : "transparent"}
          />
        }
        imageUrl={imageUrl}
        background={localThemeColor}
        backgroundImage={localBackgroundImage}
        backButton={{ href: "/explorer", text: "Go back to explorer" }}
      >
        <Tabs tabTitle={"Home"}>
          <HStack>
            <Button leftIcon={<Export />} variant="ghost" size="sm">
              Export members
            </Button>
          </HStack>
        </Tabs>
        <CRMTable />
      </Layout>
    </>
  )
}

const GuildPageWrapper = (): JSX.Element => {
  const guild = useGuild()
  const { isAdmin } = useGuildPermission()

  if (guild.isLoading)
    return (
      <Center h="100vh" w="screen">
        <Spinner />
        <Heading fontFamily={"display"} size="md" ml="4" mb="1">
          Loading guild...
        </Heading>
      </Center>
    )

  if (!guild.id) return <ErrorPage statusCode={404} />

  return (
    <>
      <Head>
        <title>{`${guild.name} members`}</title>
        <meta property="og:title" content={`${guild.name} members`} />
      </Head>
      <ThemeProvider>
        <GuildPage />
      </ThemeProvider>
    </>
  )
}

export default GuildPageWrapper
