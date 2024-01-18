import { GridItem, HStack, SimpleGrid } from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import Button from "components/common/Button"
import StickyBar from "components/common/Layout/StickyBar"
import { useActivityLog } from "../ActivityLogContext"
import { ActivityLogActionGroup } from "../constants"
import DateRangeInput from "./components/DateRangeInput"
import FiltersInput from "./components/FiltersInput"

const ActivityLogFiltersBar = (): JSX.Element => {
  const { isUserActivityLog, withActionGroups, actionGroup, setActionGroup } =
    useActivityLog()
  const { featureFlags } = useGuild()

  const shouldShowDateRangeInput = isUserActivityLog || featureFlags?.includes("CRM")

  return (
    <StickyBar>
      <SimpleGrid columns={3} gap={4}>
        {!!withActionGroups && (
          <>
            <GridItem colSpan={{ base: 3, md: 2 }}>
              <HStack gap={2}>
                <Button
                  isActive={actionGroup === ActivityLogActionGroup.UserAction}
                  onClick={() => setActionGroup(ActivityLogActionGroup.UserAction)}
                >
                  User actions
                </Button>
                <Button
                  isActive={actionGroup === ActivityLogActionGroup.AdminAction}
                  onClick={() => setActionGroup(ActivityLogActionGroup.AdminAction)}
                >
                  Admin actions
                </Button>
              </HStack>
            </GridItem>

            {shouldShowDateRangeInput && (
              <GridItem colSpan={{ base: 3, md: 1 }}>
                <DateRangeInput />
              </GridItem>
            )}

            <GridItem colSpan={3}>
              <FiltersInput />
            </GridItem>
          </>
        )}

        {!withActionGroups && (
          <>
            <GridItem colSpan={shouldShowDateRangeInput ? { base: 3, md: 2 } : 3}>
              <FiltersInput />
            </GridItem>

            {shouldShowDateRangeInput && (
              <GridItem colSpan={{ base: 3, md: 1 }}>
                <DateRangeInput />
              </GridItem>
            )}
          </>
        )}
      </SimpleGrid>
    </StickyBar>
  )
}

export default ActivityLogFiltersBar
