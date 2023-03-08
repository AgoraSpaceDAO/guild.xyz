import {
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import Section from "components/common/Section"
import useUser from "components/[guild]/hooks/useUser"
import { Question } from "phosphor-react"
import platforms from "platforms/platforms"
import { PlatformAccountDetails, PlatformName, PlatformType } from "types"
import capitalize from "utils/capitalize"
import LinkAddressButton from "./LinkAddressButton"
import LinkedAddress from "./LinkedAddress"
import LinkedSocialAccount from "./LinkedSocialAccount"
import LinkNewSocialAccount from "./LinkNewSocialAccount"

const AccountConnections = () => {
  const { isLoading, addresses, platformUsers } = useUser()
  const { account } = useWeb3React()
  const missingPlatforms = Object.keys(platforms)
    .filter((platform) => platform !== "POAP")
    .filter(
      (p) =>
        !platformUsers
          ?.map((platform) => platform.platformName.toString())
          .includes(p)
    )

  return (
    <Stack spacing="10" w="full">
      <Section title="Social accounts">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {platformUsers?.map(
              ({
                platformId,
                platformUserId,
                platformUserData,
              }: PlatformAccountDetails) => (
                <LinkedSocialAccount
                  key={platformUserId}
                  name={
                    platformUserData?.username ??
                    `${capitalize(
                      PlatformType[platformId]?.toLowerCase() ?? "Platform"
                    )} connected`
                  }
                  image={platformUserData?.avatar}
                  type={PlatformType[platformId] as PlatformName}
                />
              )
            )}
            {missingPlatforms?.map((platform) => (
              <LinkNewSocialAccount key={platform} platformName={platform} />
            ))}
          </>
        )}
      </Section>
      <Section
        title="Linked addresses"
        titleRightElement={
          addresses?.length > 1 && (
            <Popover placement="top" trigger="hover">
              <PopoverTrigger>
                <Icon as={Question} />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverBody>
                  Each of your addresses will be used for requirement checks.
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )
        }
      >
        {isLoading ? (
          <Spinner />
        ) : addresses?.length === 1 && addresses?.[0] === account.toLowerCase() ? (
          <>
            <Text colorScheme={"gray"}>No linked addresses yet</Text>
            <LinkAddressButton />
          </>
        ) : (
          <Stack spacing={4} pt="2" alignItems="start" w="full">
            {addresses
              ?.filter((address) => address?.toLowerCase() !== account.toLowerCase())
              .map((address) => (
                <LinkedAddress key={address} address={address} />
              ))}
            <LinkAddressButton />
          </Stack>
        )}
      </Section>
    </Stack>
  )
}

export default AccountConnections
