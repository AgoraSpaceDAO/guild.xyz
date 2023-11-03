import { Box, Progress, Slide, useColorMode } from "@chakra-ui/react"
import { AddressLinkProvider } from "components/_app/AddressLinkProvider"
import Chakra from "components/_app/Chakra"
import ExplorerProvider from "components/_app/ExplorerProvider"
import IntercomProvider from "components/_app/IntercomProvider"
import { KeyPairProvider } from "components/_app/KeyPairProvider"
import { PostHogProvider } from "components/_app/PostHogProvider"
import { Web3ConnectionManager } from "components/_app/Web3ConnectionManager"
import ClientOnly from "components/common/ClientOnly"
import AccountModal from "components/common/Layout/components/Account/components/AccountModal"
import { connectors, publicClient } from "connectors"
import type { AppProps } from "next/app"
import { useRouter } from "next/router"
import Script from "next/script"
import { IconContext } from "phosphor-react"
import { useEffect, useState } from "react"
import { SWRConfig } from "swr"
import "theme/custom-scrollbar.css"
import { fetcherForSWR } from "utils/fetcher"
import { WagmiConfig, createConfig } from "wagmi"
/**
 * Polyfill HTML inert property for Firefox support:
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inert#browser_compatibility
 */
import "wicg-inert"

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

const App = ({
  Component,
  pageProps,
}: AppProps<{ cookies: string }>): JSX.Element => {
  const router = useRouter()

  const [isRouteChangeInProgress, setIsRouteChangeInProgress] = useState(false)
  const { colorMode } = useColorMode()

  useEffect(() => {
    const handleRouteChangeStart = () => setIsRouteChangeInProgress(true)
    const handleRouteChangeComplete = () => setIsRouteChangeInProgress(false)

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
        {isRouteChangeInProgress ? (
          <Slide
            direction="top"
            in={isRouteChangeInProgress}
            initial="0.3s"
            style={{ zIndex: 10 }}
          >
            <Box position="relative" w="100%" h="5px" zIndex={2}>
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
          <SWRConfig value={{ fetcher: fetcherForSWR }}>
            <WagmiConfig config={config}>
              <PostHogProvider>
                <AddressLinkProvider>
                  <KeyPairProvider>
                    <Web3ConnectionManager>
                      <IntercomProvider>
                        <ExplorerProvider>
                          <Component {...pageProps} />
                          <ClientOnly>
                            <AccountModal />
                          </ClientOnly>
                        </ExplorerProvider>
                      </IntercomProvider>
                    </Web3ConnectionManager>
                  </KeyPairProvider>
                </AddressLinkProvider>
              </PostHogProvider>
            </WagmiConfig>
          </SWRConfig>
        </IconContext.Provider>
      </Chakra>
    </>
  )
}

export { getServerSideProps } from "components/_app/Chakra"

export default App
