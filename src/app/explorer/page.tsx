import { Layout } from "@/components/Layout"
import { Anchor } from "@/components/ui/Anchor"
import { env } from "env"
import Head from "next/head"
import { unstable_serialize as infinite_unstable_serialize } from "swr/infinite"
import { Explorer } from "./_components/Explorer"
import { ExplorerSWRProvider } from "./_components/ExplorerSWRProvider"
import { HeaderBackground } from "./_components/HeaderBackground"
import { ActiveSection } from "./types"

const Page = async () => {
  const path = `/v2/guilds?order=FEATURED&offset=0&limit=24`
  const ssrGuilds = await fetch(`${env.NEXT_PUBLIC_API.replace("/v1", "")}${path}`, {
    next: {
      revalidate: 300,
    },
  })
    .then((res) => res.json())
    .catch((_) => [])

  return (
    <ExplorerSWRProvider
      value={{
        fallback: {
          [infinite_unstable_serialize(() => path)]: ssrGuilds,
        },
      }}
    >
      <HeaderBackground />
      <Layout.Root>
        <Layout.Hero>
          <Layout.Header />
          <div id={ActiveSection.YourGuilds}>
            <Layout.Headline title="Guildhall" />
          </div>
          <Layout.Banner>
            <Head>
              <link rel="preload" as="image" href="/banner.png" />
            </Head>
            <div className="absolute inset-0 bg-[auto_115%] bg-[right_top_10px] bg-[url('/banner.png')] bg-no-repeat opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-50% from-banner to-transparent" />
          </Layout.Banner>
        </Layout.Hero>

        <Layout.Main>
          <Explorer />
        </Layout.Main>

        <Layout.Footer>
          <p className="my-8 text-center text-muted-foreground text-sm">
            This website is{" "}
            <Anchor
              href="https://github.com/guildxyz/guild.xyz"
              target="_blank"
              showExternal
            >
              open source
            </Anchor>
            , and built on the{" "}
            <Anchor
              target="_blank"
              href="https://www.npmjs.com/package/@guildxyz/sdk"
              showExternal
            >
              Guild SDK
            </Anchor>
          </p>
        </Layout.Footer>
      </Layout.Root>
    </ExplorerSWRProvider>
  )
}

export default Page
