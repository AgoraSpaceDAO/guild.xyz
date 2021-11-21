import {
  GridItem,
  HStack,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  useColorMode,
} from "@chakra-ui/react"
import AddCard from "components/common/AddCard"
import Layout from "components/common/Layout"
import CategorySection from "components/index/CategorySection"
import GroupsGuildsNav from "components/index/GroupsGuildsNav"
import GuildCard from "components/index/GuildCard"
import useFilteredData from "components/index/hooks/useFilteredData"
import useUsersGroupsGuilds from "components/index/hooks/useUsersGroupsGuilds"
import OrderSelect from "components/index/OrderSelect"
import SearchBar from "components/index/SearchBar"
import fetchGuilds from "components/index/utils/fetchGuilds"
import { GetStaticProps } from "next"
import { useEffect, useState, useContext } from "react"
import useSWR from "swr"
import { Guild } from "temporaryData/types"
import { notifyEasterEgg } from "utils/easterEggs"
import { ConfettiContext } from "components/common/ConfettiContext"

type Props = {
  guilds: Guild[]
}

const Page = ({ guilds: guildsInitial }: Props): JSX.Element => {
  const confettiCtx = useContext(ConfettiContext)
  const { data: guilds } = useSWR("guilds", fetchGuilds, {
    fallbackData: guildsInitial,
  })
  const [searchInput, setSearchInput] = useState("")
  const [orderedGuilds, setOrderedGuilds] = useState(guilds)

  const { usersGuildsIds } = useUsersGroupsGuilds()
  const [usersGuilds, filteredGuilds, filteredUsersGuilds] = useFilteredData(
    orderedGuilds,
    usersGuildsIds,
    searchInput
  )
  const [easterEgg2IsFound, setEasterEgg2IsFound] = useState(false)

  // Setting up the dark mode, because this is a "static" page
  const { setColorMode } = useColorMode()

  useEffect(() => {
    setColorMode("dark")
    setEasterEgg2IsFound(!!window.localStorage.getItem("easterEgg2IsFound"))
  }, [])

  return (
    <Layout title="Guild" description="A place for Web3 guilds" imageUrl="/logo.svg">
      <SimpleGrid
        templateColumns={{ base: "auto 50px", md: "1fr 1fr 1fr" }}
        gap={{ base: 2, md: "6" }}
        mb={16}
      >
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <SearchBar placeholder="Search guilds" setSearchInput={setSearchInput} />
        </GridItem>
        <OrderSelect data={guilds} setOrderedData={setOrderedGuilds} />
      </SimpleGrid>

      <GroupsGuildsNav />

      <Stack spacing={12}>
        <CategorySection
          title={
            usersGuilds.length ? "Your guilds" : "You're not part of any guilds yet"
          }
          fallbackText={`No results for ${searchInput}`}
        >
          {usersGuilds.length ? (
            filteredUsersGuilds.length &&
            filteredUsersGuilds
              .map((guild) => <GuildCard key={guild.id} guildData={guild} />)
              .concat(
                <AddCard
                  key="create-guild"
                  text="Create guild"
                  link="/create-guild"
                />
              )
          ) : (
            <AddCard text="Create guild" link="/create-guild" />
          )}
        </CategorySection>
        <CategorySection
          title={
            <HStack spacing={2} alignItems="center">
              <Text as="span">All guilds</Text>
              <Tag size="sm">{filteredGuilds.length}</Tag>
            </HStack>
          }
          fallbackText={
            orderedGuilds.length
              ? `No results for ${searchInput}`
              : "Can't fetch guilds from the backend right now. Check back later!"
          }
        >
          {filteredGuilds.length &&
            filteredGuilds.map((guild) => (
              <GuildCard key={guild.id} guildData={guild} />
            ))}
        </CategorySection>
      </Stack>
      {!easterEgg2IsFound && <div onClick={() => notifyEasterEgg('egg2', confettiCtx)} style={{ position: 'absolute', left: '0.2rem', bottom: '0.2rem' }}>
        🥚
      </div>}
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const guilds = await fetchGuilds()

  return {
    props: { guilds },
    revalidate: 10,
  }
}

export default Page
