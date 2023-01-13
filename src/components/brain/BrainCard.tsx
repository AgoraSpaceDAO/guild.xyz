import { Box, Center, Divider, Flex, HStack, Img, Text } from "@chakra-ui/react"
import ColorCard from "components/common/ColorCard"
import ColorCardLabel from "components/common/ColorCard/ColorCardLabel"
import Link from "components/common/Link"
import Image from "next/image"
import { BrainCardData } from "types"

type Props = {
  pageData: BrainCardData
}

const BrainCard = ({ pageData }: Props): JSX.Element => {
  const renderedTags = pageData.tags
    .filter((tag) => tag === "reward" || tag === "requirement")
    .sort((a, b) => a.length - b.length)

  return (
    <Link
      href={`/brain/${pageData.id}`}
      prefetch={false}
      _hover={{ textDecor: "none" }}
      borderRadius="2xl"
    >
      <ColorCard color="gray.600" w="full" borderWidth={4} p={0}>
        <ColorCardLabel
          mt="-1px"
          ml="-1px"
          labelSize="md"
          label={pageData.title}
          color="white"
          borderBottomRightRadius="xl"
          borderTopLeftRadius="xl"
          backgroundColor="gray.600"
          zIndex={1}
          maxW="90%"
        ></ColorCardLabel>
        <Flex h="165px" flexDirection="column">
          <Center
            position="relative"
            py={{ base: 12, md: 20 }}
            overflow={"hidden"}
            borderRadius="xl"
          >
            {pageData.backgroundImage && (
              <Box _groupHover={{ opacity: "10%" }}>
                <Image
                  src={pageData?.backgroundImage}
                  alt="icon"
                  layout="fill"
                  objectFit="cover"
                  quality="10%"
                  style={{
                    position: "absolute",
                    opacity: "90%",
                    filter: "blur(8px)",
                  }}
                />
              </Box>
            )}

            {pageData.icon && (
              <Center boxSize={16} position="relative">
                <Image
                  src={pageData?.icon}
                  alt={pageData?.icon}
                  layout="fill"
                  objectFit="contain"
                  style={{
                    width: "10px",
                    zIndex: "1",
                    overflow: "visible",
                  }}
                />
              </Center>
            )}
          </Center>
          {renderedTags.length > 0 && (
            <Box
              right="0"
              bottom="0"
              h="29px"
              position="absolute"
              backgroundColor="blackAlpha.600"
              borderTopLeftRadius="xl"
              borderBottomRightRadius="xl"
              zIndex="1"
              py="3px"
              px="18px"
            >
              <HStack
                divider={
                  <Divider orientation="vertical" height="1em" borderWidth="1px" />
                }
                spacing="3"
              >
                {renderedTags.map((tag, index) => (
                  <Box display="inline-flex" alignItems="center" key={index}>
                    <Img src={`/${tag}.svg`} h="14px" mr="6px" alt="page logo" />
                    <Text fontWeight="bold" fontSize="14px">
                      {tag}
                    </Text>
                  </Box>
                ))}
              </HStack>
            </Box>
          )}
        </Flex>
      </ColorCard>
    </Link>
  )
}

export default BrainCard
