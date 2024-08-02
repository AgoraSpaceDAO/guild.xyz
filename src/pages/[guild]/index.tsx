import { Header } from "@/components/Header"
import {
  Layout,
  LayoutBanner,
  LayoutHeadline,
  LayoutHero,
  LayoutMain,
  LayoutTitle,
} from "@/components/Layout"
import { LayoutContainer } from "@/components/Layout/Layout"
import { Anchor } from "@/components/ui/Anchor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils"
import {
  Box,
  Center,
  Divider,
  HStack,
  Heading,
  Icon,
  Spinner,
  Tag,
  TagLeftIcon,
  Text,
} from "@chakra-ui/react"
import { Info, Users } from "@phosphor-icons/react"
import AccessHub from "components/[guild]/AccessHub"
import { useAccessedGuildPlatforms } from "components/[guild]/AccessHub/AccessHub"
import { useEditGuildDrawer } from "components/[guild]/EditGuild/EditGuildDrawerContext"
import { EditGuildDrawerProvider } from "components/[guild]/EditGuild/EditGuildDrawerProvider"
import JoinButton from "components/[guild]/JoinButton"
import JoinModalProvider from "components/[guild]/JoinModal/JoinModalProvider"
import LeaveButton from "components/[guild]/LeaveButton"
import Members from "components/[guild]/Members"
import { MintGuildPinProvider } from "components/[guild]/Requirements/components/GuildCheckout/MintGuildPinContext"
import Roles from "components/[guild]/Roles"
import SocialIcon from "components/[guild]/SocialIcon"
import useStayConnectedToast from "components/[guild]/StayConnectedToast"
import GuildTabs from "components/[guild]/Tabs/GuildTabs"
import { ThemeProvider, useThemeContext } from "components/[guild]/ThemeContext"
import useGuild from "components/[guild]/hooks/useGuild"
import useGuildPermission from "components/[guild]/hooks/useGuildPermission"
import BackButton from "components/common/Layout/components/BackButton"
import LinkPreviewHead from "components/common/LinkPreviewHead"
import Section from "components/common/Section"
import useMembership from "components/explorer/hooks/useMembership"
import useUniqueMembers from "hooks/useUniqueMembers"
import { GetStaticPaths, GetStaticProps } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import Image from "next/image"
import ErrorPage from "pages/_error"
import { useEffect } from "react"
import { MintPolygonIDProofProvider } from "rewards/PolygonID/components/MintPolygonIDProofProvider"
import { SWRConfig } from "swr"
import { Guild, SocialLinkKey } from "types"
import fetcher from "utils/fetcher"
import { addIntercomSettings } from "utils/intercom"
import parseDescription from "utils/parseDescription"

const DynamicOngoingIssuesBanner = dynamic(
  () => import("components/[guild]/OngoingIssuesBanner")
)
const DynamicEditGuildButton = dynamic(() => import("components/[guild]/EditGuild"))
const DynamicAddAndOrderRoles = dynamic(
  () => import("components/[guild]/AddAndOrderRoles")
)
const DynamicAddRewardAndCampaign = dynamic(
  () => import("components/[guild]/AddRewardAndCampaign")
)
const DynamicMembersExporter = dynamic(
  () => import("components/[guild]/Members/components/MembersExporter")
)
const DynamicActiveStatusUpdates = dynamic(
  () => import("components/[guild]/ActiveStatusUpdates")
)
const DynamicRecheckAccessesButton = dynamic(() =>
  import("components/[guild]/RecheckAccessesButton").then(
    (module) => module.TopRecheckAccessesButton
  )
)
const DynamicDiscordBotPermissionsChecker = dynamic(
  () => import("components/[guild]/DiscordBotPermissionsChecker"),
  {
    ssr: false,
  }
)

const GuildPage = (): JSX.Element => {
  const {
    name,
    description,
    imageUrl,
    admins,
    memberCount,
    roles,
    isLoading,
    socialLinks,
    tags,
    featureFlags,
    isDetailed,
  } = useGuild()

  const { isAdmin } = useGuildPermission()
  const { isMember } = useMembership()
  const { onOpen } = useEditGuildDrawer()

  // Passing the admin addresses here to make sure that we render all admin avatars in the members list
  const members = useUniqueMembers(
    roles,
    admins?.map((admin) => admin.address)
  )

  const { textColor, localThemeColor, localBackgroundImage } = useThemeContext()

  const accessedGuildPlatforms = useAccessedGuildPlatforms()

  useStayConnectedToast(() => {
    onOpen()
    setTimeout(() => {
      const addContactBtn = document.getElementById("add-contact-btn")
      if (addContactBtn) addContactBtn.focus()
    }, 200)
  })

  return (
    <>
      <Head>
        <meta name="theme-color" content={localThemeColor} />
        <title>{name}</title>
        <meta property="og:title" content={name} />
        <link rel="shortcut icon" href={imageUrl ?? "/guild-icon.png"} />
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
      </Head>

      {featureFlags?.includes("ONGOING_ISSUES") && <DynamicOngoingIssuesBanner />}

      <Layout>
        <LayoutHero>
          <LayoutBanner>
            {localBackgroundImage ? (
              <Image
                src={localBackgroundImage}
                alt="Guild background image"
                priority
                fill
                sizes="100vw"
                style={{
                  filter: "brightness(30%)",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                className={cn("h-full w-full", {
                  // TODO: don't use Chakra CSS variables
                  "opacity-50": textColor !== "primary.800",
                })}
                style={{
                  backgroundColor: localThemeColor,
                }}
              ></div>
            )}
          </LayoutBanner>

          <Header />

          <LayoutContainer className="-mb-8 mt-6">
            <BackButton />
          </LayoutContainer>

          <LayoutHeadline>
            {imageUrl && (
              <Avatar
                className={cn("row-span-2 size-14 lg:size-[72px]", {
                  // TODO rework ThemeContext & use a non-Chakra CSS variable
                  "bg-[var(--chakra-colors-primary-800)]":
                    textColor === "primary.800",
                })}
              >
                <AvatarImage
                  src={imageUrl}
                  alt={`${name} logo`}
                  width={48}
                  height={48}
                />
                <AvatarFallback>
                  <Skeleton className="size-full" />
                </AvatarFallback>
              </Avatar>
            )}
            <LayoutTitle
              className={cn({
                // TODO rework ThemeContext & use a non-Chakra CSS variable
                "text-[var(--chakra-colors-primary-800)]":
                  textColor === "primary.800",
              })}
            >
              {name}
            </LayoutTitle>
            {/* TODO: verified icon */}

            {isAdmin && isDetailed && <DynamicEditGuildButton />}
          </LayoutHeadline>

          {(description || Object.keys(socialLinks ?? {}).length > 0) && (
            <LayoutContainer
              className={cn("mt-6 font-semibold text-white", {
                // TODO rework ThemeContext & use a non-Chakra CSS variable
                "text-[var(--chakra-colors-primary-800)]":
                  textColor === "primary.800",
              })}
            >
              {/* TODO: remove Chakra related stuff from parseDescription */}
              {description && parseDescription(description)}
              {Object.keys(socialLinks ?? {}).length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {Object.entries(socialLinks ?? {}).map(([type, link]) => {
                    const prettyLink = link
                      .replace(/(http(s)?:\/\/)*(www\.)*/i, "")
                      .replace(/\?.*/, "") // trim query params
                      .replace(/\/+$/, "") // trim ending slash

                    return (
                      <div key={type} className="flex items-center gap-1.5">
                        <SocialIcon type={type as SocialLinkKey} size="sm" />
                        <Anchor
                          href={link?.startsWith("http") ? link : `https://${link}`}
                          className={cn("font-semibold text-sm text-white", {
                            // TODO rework ThemeContext & use a non-Chakra CSS variable
                            "text-[var(--chakra-colors-primary-800)]":
                              textColor === "primary.800",
                          })}
                        >
                          {prettyLink}
                        </Anchor>
                      </div>
                    )
                  })}
                </div>
              )}
            </LayoutContainer>
          )}
        </LayoutHero>

        <LayoutMain>
          <GuildTabs
            activeTab="HOME"
            rightElement={
              <HStack>
                {isMember && !isAdmin && <DynamicRecheckAccessesButton />}
                {!isMember ? (
                  <JoinButton />
                ) : !isAdmin ? (
                  <LeaveButton />
                ) : (
                  <DynamicAddRewardAndCampaign />
                )}
              </HStack>
            }
          />

          <AccessHub />

          <Section
            title={
              (isAdmin || isMember || !!accessedGuildPlatforms?.length) && "Roles"
            }
            titleRightElement={
              isAdmin && (
                <Box my="-2 !important" ml="auto !important">
                  <DynamicAddAndOrderRoles />
                </Box>
              )
            }
            mb="10"
          >
            <Roles />
          </Section>
          {/* we'll remove Members section completely, just keeping it for admins for now because of the Members exporter */}
          {isAdmin && (
            <>
              <Divider my={10} />
              <Section
                title="Members"
                titleRightElement={
                  <HStack justifyContent="space-between" w="full" my="-2 !important">
                    <Tag maxH={6} pt={0.5}>
                      <TagLeftIcon as={Users} />
                      {isLoading ? (
                        <Spinner size="xs" />
                      ) : (
                        new Intl.NumberFormat("en", {
                          notation: "compact",
                        }).format(memberCount ?? 0) ?? 0
                      )}
                    </Tag>
                    {isAdmin && <DynamicMembersExporter />}
                  </HStack>
                }
              >
                <Box>
                  {isAdmin && <DynamicActiveStatusUpdates />}

                  <Members members={members} />
                  <Text mt="6" colorScheme={"gray"}>
                    <Icon as={Info} mr="2" mb="-2px" />
                    Members section is only visible to admins and is under rework,
                    until then only admins are shown
                  </Text>
                </Box>
              </Section>
            </>
          )}
        </LayoutMain>
      </Layout>

      {isAdmin && <DynamicDiscordBotPermissionsChecker />}
    </>
  )
}

type Props = {
  fallback: { string: Guild }
}

const GuildPageWrapper = ({ fallback }: Props): JSX.Element => {
  const guild = useGuild()

  useEffect(() => {
    if (!guild?.id) return

    addIntercomSettings({
      guildId: guild.id,
      featureFlags: guild.featureFlags?.toString(),
      memberCount: guild.memberCount,
    })
  }, [guild])

  if (!fallback) {
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
  }

  return (
    <>
      <LinkPreviewHead
        path={fallback ? Object.values(fallback)[0].urlName : guild.urlName}
      />
      <Head>
        <title>{fallback ? Object.values(fallback)[0].name : guild.name}</title>
        <meta
          property="og:title"
          content={fallback ? Object.values(fallback)[0].name : guild.name}
        />
      </Head>
      <SWRConfig value={fallback && { fallback }}>
        <ThemeProvider>
          <MintGuildPinProvider>
            <MintPolygonIDProofProvider>
              <JoinModalProvider>
                <EditGuildDrawerProvider>
                  <GuildPage />
                </EditGuildDrawerProvider>
              </JoinModalProvider>
            </MintPolygonIDProofProvider>
          </MintGuildPinProvider>
        </ThemeProvider>
      </SWRConfig>
    </>
  )
}

const getStaticProps: GetStaticProps = async ({ params }) => {
  const endpoint = `/v2/guilds/guild-page/${params.guild?.toString()}`

  const data = await fetcher(endpoint).catch((_) => ({}))

  if (!data?.id)
    return {
      props: {},
      revalidate: 300,
    }

  /**
   * Removing members and requirements, so they're not included in the SSG source
   * code, we only fetch them client side. Temporary until we switch to the new API
   * that won't return them on this endpoint anyway
   */
  const filteredData = { ...data }
  filteredData.roles?.forEach((role) => {
    role.members = []
    role.requirements = []
  })
  filteredData.isFallback = true

  return {
    props: {
      fallback: {
        [endpoint]: filteredData,
      },
    },
    revalidate: 300,
  }
}

const getStaticPaths: GetStaticPaths = async () => {
  const mapToPaths = (_: Guild[]) =>
    Array.isArray(_)
      ? _.map(({ urlName: guild }) => ({
          params: { guild },
        }))
      : []

  const paths = await fetcher(`/v2/guilds`).then(mapToPaths)

  return {
    paths,
    fallback: "blocking",
  }
}

export { getStaticPaths, getStaticProps }

export default GuildPageWrapper
