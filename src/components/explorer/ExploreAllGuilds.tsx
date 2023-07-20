import {
  Center,
  Divider,
  Spinner,
  Stack,
  Text,
  VStack,
  useBreakpointValue,
  usePrevious,
} from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import { TABS_HEIGHT } from "components/[guild]/Tabs/Tabs"
import { BATCH_SIZE } from "components/_app/ExplorerProvider"
import Section from "components/common/Section"
import ExplorerCardMotionWrapper from "components/explorer/ExplorerCardMotionWrapper"
import GuildCard from "components/explorer/GuildCard"
import GuildCardsGrid from "components/explorer/GuildCardsGrid"
import SearchBar from "components/explorer/SearchBar"
import useIsStuck from "hooks/useIsStuck"
import { useQueryState } from "hooks/useQueryState"
import useScrollEffect from "hooks/useScrollEffect"
import { forwardRef, useEffect } from "react"
import useSWRInfinite from "swr/infinite"
import { GuildBase } from "types"
import SearchBarFilters, { Filters } from "./SearchBarFilters"

type Props = {
  guildsInitial: GuildBase[]
}

const TABS_HEIGHT_PX = 68

const ExploreAllGuilds = forwardRef(({ guildsInitial }: Props, ref: any) => {
  const { account } = useWeb3React()
  const [search, setSearch] = useQueryState<string>("search", undefined)
  const prevSearch = usePrevious(search)
  const [order, setOrder] = useQueryState<Filters>("order", "NEWEST")
  const isMobile = useBreakpointValue({ base: true, md: false }, { fallback: "md" })
  const { ref: searchAreaRef, isStuck } = useIsStuck(
    `-${TABS_HEIGHT_PX + 1}px 0px 0px 0px`
  )
  const searchAreaHeight = useBreakpointValue({
    base: "calc(var(--chakra-space-12) + (5 * var(--chakra-space-3)))",
    md: "calc(var(--chakra-space-12) + var(--chakra-space-3))",
  })

  const query = new URLSearchParams({ order, ...(search && { search }) }).toString()

  const {
    data: filteredGuilds,
    setSize,
    isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPageData) =>
      Array.isArray(previousPageData) && previousPageData.length !== BATCH_SIZE
        ? null
        : `/guild?${query}&limit=${BATCH_SIZE}&offset=${pageIndex * BATCH_SIZE}`,
    {
      fallbackData: guildsInitial,
      dedupingInterval: 60000, // one minute
      revalidateFirstPage: false,
    }
  )
  const renderedGuilds = filteredGuilds?.flat()

  useEffect(() => {
    if (prevSearch === search || prevSearch === undefined) return
    setSize(1)
  }, [search, prevSearch])

  // TODO: we use this behaviour in multiple places now, should make a useScrollBatchedRendering hook
  useScrollEffect(() => {
    if (
      !ref.current ||
      ref.current.getBoundingClientRect().bottom > window.innerHeight ||
      isValidating
    )
      return

    setSize((prev) => prev + 1)
  }, [filteredGuilds, isValidating])

  return (
    <Stack spacing={{ base: 8, md: 10 }}>
      {account && <Divider />}
      <Section
        title="Explore all guilds"
        ref={ref}
        id="allGuilds"
        scrollMarginTop={20}
      >
        <VStack
          ref={searchAreaRef}
          position="sticky"
          top={TABS_HEIGHT_PX}
          width="full"
          zIndex={"banner"}
          alignItems="flex-start"
          transition={"all 0.2s ease"}
          spacing={3}
        >
          {isStuck && (
            <style>{`#tabs::before {height: calc(${TABS_HEIGHT} + ${searchAreaHeight});}`}</style>
          )}
          <SearchBar
            placeholder="Search guilds"
            {...{ search, setSearch }}
            rightAddon={
              !isMobile && <SearchBarFilters selected={order} onSelect={setOrder} />
            }
          />
          {isMobile && <SearchBarFilters selected={order} onSelect={setOrder} />}
        </VStack>
        {!renderedGuilds.length ? (
          isValidating ? null : !search?.length ? (
            <Text>
              Can't fetch guilds from the backend right now. Check back later!
            </Text>
          ) : (
            <Text>{`No results for ${search}`}</Text>
          )
        ) : (
          <GuildCardsGrid>
            {renderedGuilds.map((guild) => (
              <ExplorerCardMotionWrapper key={guild.urlName}>
                <GuildCard guildData={guild} />
              </ExplorerCardMotionWrapper>
            ))}
          </GuildCardsGrid>
        )}
      </Section>

      <Center>{isValidating && <Spinner />}</Center>
    </Stack>
  )
})

export default ExploreAllGuilds
