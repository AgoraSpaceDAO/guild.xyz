import { Stack, useBreakpointValue, useColorModeValue } from "@chakra-ui/react"
import { ThemeProvider } from "components/[guild]/ThemeContext"
import ActivityLogAction from "components/[guild]/activity/ActivityLogAction"
import {
  ActivityLogProvider,
  useActivityLog,
} from "components/[guild]/activity/ActivityLogContext"
import ActivityLogFiltersBar from "components/[guild]/activity/ActivityLogFiltersBar"
import ActivityLogSkeleton from "components/[guild]/activity/ActivityLogSkeleton"
import useUser from "components/[guild]/hooks/useUser"
import Layout from "components/common/Layout"
import { SectionTitle } from "components/common/Section"

const ActivityLog = (): JSX.Element => {
  const bgColor = useColorModeValue("var(--chakra-colors-gray-800)", "#37373a") // dark color is from whiteAlpha.200, but without opacity so it can overlay the banner image
  const bgOpacity = useColorModeValue(0.06, 0.1)
  const bgLinearPercentage = useBreakpointValue({ base: "50%", sm: "55%" })

  // TODO: show an error if the user isn't connected

  const { data, isValidating } = useActivityLog()

  return (
    <Layout
      title="Activity log"
      background={bgColor}
      backgroundProps={{
        opacity: 1,
        _before: {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          bg: `linear-gradient(to top right, ${bgColor} ${bgLinearPercentage}, transparent), url('/banner.png ')`,
          bgSize: { base: "auto 100%", sm: "auto 115%" },
          bgRepeat: "no-repeat",
          bgPosition: "top 10px right 0px",
          opacity: bgOpacity,
        },
      }}
      textColor="white"
      backgroundOffset={46}
    >
      <ActivityLogFiltersBar />

      <SectionTitle title="Actions" mt={8} mb="4" />
      <Stack spacing={2.5}>
        {data?.entries?.length > 0 &&
          data.entries.map((action) => (
            <ActivityLogAction key={action.id} action={action} />
          ))}

        {isValidating && <ActivityLogSkeleton />}
      </Stack>
    </Layout>
  )
}

const ActivityLogWrapper = (): JSX.Element => {
  const { id } = useUser()

  return (
    <ThemeProvider>
      <ActivityLogProvider userId={id}>
        <ActivityLog />
      </ActivityLogProvider>
    </ThemeProvider>
  )
}

export default ActivityLogWrapper
