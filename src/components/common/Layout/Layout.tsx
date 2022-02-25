import {
  AspectRatio,
  Box,
  Center,
  Container,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react"
import useIsomorphicLayoutEffect from "hooks/useIsomorphicLayoutEffect"
import Head from "next/head"
import { useRouter } from "next/router"
import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react"
import GuildLogo from "../GuildLogo"
import AccountButton from "./components/Account/components/AccountButton"
import AccountCard from "./components/Account/components/AccountCard"
import Header from "./components/Header"

type Props = {
  imageUrl?: string
  imageBg?: string
  title: string
  description?: string
  showLayoutDescription?: boolean
  textColor?: string
  action?: ReactNode | undefined
  background?: string
  backgroundImage?: string
}

const Layout = ({
  imageUrl,
  imageBg,
  title,
  description,
  showLayoutDescription,
  textColor,
  action,
  background,
  backgroundImage,
  children,
}: PropsWithChildren<Props>): JSX.Element => {
  const childrenWrapper = useRef(null)
  const [bgHeight, setBgHeight] = useState("0")
  const isMobile = useBreakpointValue({ base: true, sm: false })

  useIsomorphicLayoutEffect(() => {
    if ((!background && !backgroundImage) || !childrenWrapper?.current) return

    const rect = childrenWrapper.current.getBoundingClientRect()
    setBgHeight(`${rect.top + (isMobile ? 32 : 36)}px`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, childrenWrapper?.current, action])

  const router = useRouter()

  const guildLogoSize = useBreakpointValue({ base: 48, lg: 56 })
  const guildLogoIconSize = useBreakpointValue({ base: 20, lg: 28 })

  const skipToVideo = () => {
    router.push("/video")
  }

  useEffect(() => {}, [])

  const TypingAnimation = ({ content = "", speed = 1000, fontFamily }) => {
    const [displayedContent, setDisplayedContent] = useState("")

    const [index, setIndex] = useState(0)

    useEffect(() => {
      /*Create a new setInterval and store its id*/
      const animKey = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        setIndex((index) => {
          /*This setState function will set the index
        to index+1 if there is more content otherwise
        it will destory this animation*/

          if (index >= content.length - 1) {
            clearInterval(animKey)
            return index
          }
          return index + 1
        })
        return
      }, speed)
    }, [content, speed])

    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      setDisplayedContent((displayedContent) => displayedContent + content[index])
    }, [content, index])

    return (
      <>
        <Text fontFamily={fontFamily || "display"} className="type-writer">
          {displayedContent}
        </Text>
      </>
    )
  }

  return (
    <Box>
      <Head>
        <title>{`${title}`}</title>
        <meta property="og:title" content={`${title}`} />
        {description && (
          <>
            <meta name="description" content={description} />
            <meta property="og:description" content={description} />
          </>
        )}
      </Head>

      <Box
        zIndex={10}
        bgColor={"#150000"}
        bgImage={"url('/assets/fire.png')"}
        width={"100%"}
        backgroundSize={"cover"}
        d="flex"
        flexDir={"column"}
        justifyContent="center"
        overflowX="hidden"
      >
        <Header />
        <Container
          // to be above the absolutely positioned background box
          position="relative"
          maxW="container.lg"
          pt={{ base: 6, md: 9 }}
          pb={24}
          px={{ base: 4, sm: 6, md: 8, lg: 10 }}
          zIndex={1}
        >
          <VStack spacing={{ base: 7, md: 10 }} pb={{ base: 9, md: 14 }} w="full">
            <HStack justify="center" w="full" spacing={3}>
              <HStack
                flexDirection="column"
                justify="center"
                spacing={{ base: 4, lg: 5 }}
              >
                {imageUrl && (
                  <GuildLogo
                    imageUrl={imageUrl}
                    size={guildLogoSize}
                    iconSize={guildLogoIconSize}
                    mt={{ base: 1, lg: 2 }}
                    bgColor={imageBg ? imageBg : undefined}
                    priority
                  />
                )}
                <Heading
                  marginTop={12}
                  as="h1"
                  fontSize={80}
                  fontFamily="display"
                  color={"#C9C8C3"}
                  fontWeight="bold"
                  wordBreak={"break-word"}
                  textAlign="center"
                >
                  {title}
                </Heading>

                <Text
                  as="h2"
                  fontSize={80}
                  fontFamily="display"
                  color={"#C9C8C3"}
                  wordBreak={"break-word"}
                  textAlign="center"
                  marginTop={-22}
                >
                  <TypingAnimation
                    content={`and taste the spice`}
                    speed={100}
                    fontFamily={"display"}
                  />
                </Text>

                <Center width={1000} height={400}>
                  <Stack>
                    <Container
                      maxW="container.md"
                      width="350px"
                      height="343px"
                      justifyContent="center"
                      margingTop={-32}
                    >
                      <AspectRatio
                        px={{ base: 40, sm: 6, md: 8, lg: 2 }}
                        maxW={350}
                        height={343}
                        ratio={1}
                        autoPlay={true}
                      >
                        <iframe
                          title="fire-breathing-gif"
                          src="https://www.kapwing.com/e/6216f880e8513f007fc21173"
                        />
                      </AspectRatio>
                    </Container>
                    <Center>
                      <Link
                        href={`/video`}
                        prefetch={false}
                        _hover={{ textDecor: "none" }}
                      >
                        <AccountCard>
                          <AccountButton width={200} onClick={() => skipToVideo()}>
                            see what we're about
                          </AccountButton>
                        </AccountCard>
                      </Link>
                    </Center>
                  </Stack>
                </Center>

                {/* <Text textAlign="justify" fontSize="24">
                    Juicy yields and impeccable tase <br />
                    <br />
                    We are a Treasure guild serving up the spice. Join us to max out
                    your $Magic yield`s, stake your Treasures or Legions for bonuses,
                    and more!
                    <br />
                    <br />
                    Treasure is an ecosystem build on cooperation. Group coordination
                    leads to higher rewards for all!
                  </Text>*/}

                {/* <Link
                  href={`https://www.treasure.lol/`}
                  target={"_blank"}
                  prefetch={false}
                  _hover={{ textDecor: "none" }}
                >
                  <AccountCard>
                    <AccountButton
                      // isLoading={!triedEager}
                      // onClick={openWalletSelectorModal}
                      width={316}
                      height={74}
                      fontSize="32"
                    >
                      get A dragontail
                    </AccountButton>
                  </AccountCard>
                </Link> */}
              </HStack>
              {action}
            </HStack>
            {showLayoutDescription && description?.length && (
              <Text w="full" fontWeight="semibold" color={textColor}>
                {description}
              </Text>
            )}
          </VStack>
          <Box ref={childrenWrapper}>{children}</Box>
        </Container>
        {/* <Footer /> */}
      </Box>
    </Box>
  )
}

export default Layout
