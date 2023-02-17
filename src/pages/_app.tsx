import { Web3ReactProvider } from "@web3-react/core"
import Chakra from "components/_app/Chakra"
import Datadog from "components/_app/Datadog"
import ExplorerProvider from "components/_app/ExplorerProvider"
import IntercomProvider from "components/_app/IntercomProvider"
import { Web3ConnectionManager } from "components/_app/Web3ConnectionManager"
import { connectors } from "connectors"
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import Script from "next/script"
import { IconContext } from "phosphor-react"
import { Fragment } from "react"
import { SWRConfig } from "swr"
import "theme/custom-scrollbar.css"
import fetcher from "utils/fetcher"

const App = ({
  Component,
  pageProps,
}: AppProps<{ cookies: string }>): JSX.Element => {
  const router = useRouter()

  const DatadogComponent = router.asPath.includes("linkpreview") ? Fragment : Datadog

  return (
    <>
      <Head>
        <meta name="theme-color" content="#4285f4" />
      </Head>
      <Script src="/intercom.js" />
      <Chakra cookies={pageProps.cookies}>
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
