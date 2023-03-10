import { Box, Progress, Slide, useColorMode } from "@chakra-ui/react"
import { Web3ReactProvider } from "@web3-react/core"
import Chakra from "components/_app/Chakra"
import Datadog from "components/_app/Datadog"
import ExplorerProvider from "components/_app/ExplorerProvider"
import IntercomProvider from "components/_app/IntercomProvider"
import { Web3ConnectionManager } from "components/_app/Web3ConnectionManager"
import { connectors } from "connectors"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"
import Script from "next/script"
import { IconContext } from "phosphor-react"
import { Fragment, useEffect, useState } from "react"
import { SWRConfig } from "swr"
import "theme/custom-scrollbar.css"
import fetcher from "utils/fetcher"

const App = ({
  Component,
  pageProps,
}: AppProps<{ cookies: string }>): JSX.Element => {
  const router = useRouter()

  const DatadogComponent = router.asPath.includes("linkpreview") ? Fragment : Datadog

  const [isRouteChanges, setisRouteChanges] = useState(false)
  const { colorMode } = useColorMode()

  useEffect(() => {
    const handleRouteChangeStart = () =>
      setTimeout(() => setisRouteChanges(true), 500)

    const handleRouteChangeComplete = () => {
      setisRouteChanges(false)
    }

    router.events.on("routeChangeStart", handleRouteChangeStart)
    router.events.on("routeChangeComplete", handleRouteChangeComplete)

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart)
      router.events.off("routeChangeComplete", handleRouteChangeComplete)
    }
  }, [])

  return (
    <>
      <Script src="/intercom.js" />
      <Chakra cookies={pageProps.cookies}>
        {isRouteChanges ? (
          <Slide
            direction="top"
            in={isRouteChanges}
            initial="0.3s"
            style={{ zIndex: 10 }}
          >
            <Box position="relative" w="100%" h="100px" zIndex={2}>
              <Progress
                isIndeterminate
                w="100%"
                bg={colorMode === "light" ? "blue.50" : null}
                position="fixed"
                size="xs"
                transition="width .3s"
              />
            </Box>
          </Slide>
        ) : null}
        <IconContext.Provider
          value={{
            color: "currentColor",
            size: "1em",
            weight: "bold",
            mirrored: false,
          }}
        >
          <SWRConfig value={{ fetcher }}>
            <Web3ReactProvider connectors={connectors}>
              <Web3ConnectionManager>
                <DatadogComponent>
                  <IntercomProvider>
                    <ExplorerProvider>
                      <Component {...pageProps} />
                    </ExplorerProvider>
                  </IntercomProvider>
                </DatadogComponent>
              </Web3ConnectionManager>
            </Web3ReactProvider>
          </SWRConfig>
        </IconContext.Provider>
      </Chakra>
    </>
  )
}

export { getServerSideProps } from "components/_app/Chakra"

export default App
