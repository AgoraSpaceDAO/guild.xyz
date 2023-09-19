import { Checkbox, HStack, Text } from "@chakra-ui/react"
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import CRMTable, { Member } from "components/[guild]/crm/CRMTable"
import ExportMembers from "components/[guild]/crm/ExportMembers"
import FilterByRoles, {
  roleFilter,
  roleSort,
} from "components/[guild]/crm/FilterByRoles"
import Identities from "components/[guild]/crm/Identities"
import IdentitiesSearch, {
  identitiesFilter,
} from "components/[guild]/crm/IdentitiesSearch"
import OrderByColumn from "components/[guild]/crm/OrderByColumn"
import RoleTags from "components/[guild]/crm/RoleTags"
import {
  buildQueryFromState,
  parseFiltersFromQuery,
  parseSortingFromQuery,
} from "components/[guild]/crm/transformTableStateToAndFromQuery"
import useMembers from "components/[guild]/crm/useMembers"
import useGuild from "components/[guild]/hooks/useGuild"
import TabButton from "components/[guild]/Tabs/components/TabButton"
import Tabs from "components/[guild]/Tabs/Tabs"
import { ThemeProvider, useThemeContext } from "components/[guild]/ThemeContext"
import GuildLogo from "components/common/GuildLogo"
import Layout from "components/common/Layout"
import Head from "next/head"
import { useRouter } from "next/router"
import ErrorPage from "pages/_error"
import { useEffect, useMemo, useState } from "react"
import { Visibility } from "types"

const columnHelper = createColumnHelper<Member>()

const GuildPage = (): JSX.Element => {
  const { textColor, localThemeColor, localBackgroundImage } = useThemeContext()
  const { name, roles, urlName, description, imageUrl, socialLinks } = useGuild()
  const hasHiddenRoles = roles?.some((role) => role.visibility === Visibility.HIDDEN)

  const router = useRouter()
  const [columnFilters, setColumnFilters] = useState(() =>
    parseFiltersFromQuery(router.query)
  )
  const [sorting, setSorting] = useState(() => parseSortingFromQuery(router.query))

  const query = useMemo(
    () => buildQueryFromState(columnFilters, sorting),
    [columnFilters, sorting]
  )

  useEffect(() => {
    if (!urlName) return

    router.replace({ query: { ...query, guild: urlName } }, undefined, {
      scroll: false,
    })
  }, [query])

  const { data, error } = useMembers(query)

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            {...{
              isChecked: table.getIsAllRowsSelected(),
              isIndeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
            colorScheme="primary"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              isChecked: row.getIsSelected(),
              isDisabled: !row.getCanSelect(),
              isIndeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
            colorScheme="primary"
            mt="2px"
          />
        ),
      },
      columnHelper.accessor((row) => row, {
        id: "identity",
        filterFn: identitiesFilter,
        cell: (info) => <Identities member={info.getValue()} />,
        header: ({ column }) => <IdentitiesSearch column={column} />,
      }),
      {
        accessorKey: "roles",
        header: ({ column }) => (
          <HStack w="full" justifyContent={"space-between"}>
            <Text>{`Roles ${hasHiddenRoles ? "(hidden, public)" : ""}`}</Text>
            <HStack spacing="0">
              <FilterByRoles column={column} />
              <OrderByColumn label="Number of roles" column={column} />
            </HStack>
          </HStack>
        ),
        filterFn: roleFilter,
        sortingFn: roleSort,
        columns: [
          ...(hasHiddenRoles
            ? [
                {
                  id: "hiddenRoles",
                  accessorFn: (row) => row.roles.hidden,
                  cell: (info) => <RoleTags roles={info.getValue()} />,
                },
              ]
            : []),
          {
            id: "publicRoles",
            accessorFn: (row) => row.roles.public,
            cell: (info) => <RoleTags roles={info.getValue()} />,
          },
        ],
      },
      columnHelper.accessor("joinedAt", {
        header: ({ column }) => (
          <HStack w="full" justifyContent={"space-between"}>
            <Text>Joined at</Text>
            <OrderByColumn label="Join date" column={column} />
          </HStack>
        ),
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
    ],
    [hasHiddenRoles]
  )

  const table = useReactTable({
    data: useMemo(() => data ?? [], [data]),
    columns,
    state: {
      columnFilters,
      sorting,
    },
    initialState: {
      columnFilters,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    getFilteredRowModel: getFilteredRowModel(),
    manualFiltering: true,
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableRowSelection: true,
  })

  return (
    <>
      <Head>
        <meta name="theme-color" content={localThemeColor} />
      </Head>

      <Layout
        title={name}
        ogTitle={`Members - ${name}`}
        textColor={textColor}
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
        backgroundOffset={112}
        showFooter={false}
      >
        <Tabs sticky rightElement={<ExportMembers table={table} />}>
          <TabButton href={`/${urlName}`}>Home</TabButton>
          <TabButton href={`${urlName}/members`} isActive>
            Members
          </TabButton>
          <TabButton href={`/${urlName}/activity`}>Activity log</TabButton>
        </Tabs>
        {/* {JSON.stringify(table.getState(), null, 2)} */}
        <CRMTable {...{ table, data, error }} />
      </Layout>
    </>
  )
}

const GuildPageWrapper = (): JSX.Element => {
  const { featureFlags, name, error } = useGuild()
  const router = useRouter()

  if (error) return <ErrorPage statusCode={404} />

  if (featureFlags && !featureFlags?.includes("CRM"))
    return <ErrorPage statusCode={404} />

  return (
    <>
      <Head>
        <title>{`${name} members`}</title>
        <meta property="og:title" content={`${name} members`} />
      </Head>
      <ThemeProvider>{router.isReady && <GuildPage />}</ThemeProvider>
    </>
  )
}

export default GuildPageWrapper
