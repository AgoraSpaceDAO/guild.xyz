import { HStack, Text } from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import GuildLogo from "components/common/GuildLogo"
import Link from "components/common/Link"
import { Role } from "types"

type Props = {
  role: Role
}

const NftByRole = ({ role }: Props) => {
  const { urlName } = useGuild()

  return (
    <HStack>
      <Text colorScheme="gray" as="span" flexShrink={0}>
        by role:
      </Text>
      <HStack spacing="1">
        <GuildLogo imageUrl={role.imageUrl} size={6} />

        <Link href={`/${urlName}#role-${role.id}`} fontWeight="bold" noOfLines={1}>
          {role.name}
        </Link>

        {/* <HStack spacing={1} color="gray" pl="1.5" mb="-1.5px">
          <Icon as={Users} boxSize={4} />
          <Text as="span">
            {new Intl.NumberFormat("en", { notation: "compact" }).format(
              role.memberCount
            )}
          </Text>
        </HStack> */}
      </HStack>
    </HStack>
  )
}

export default NftByRole
