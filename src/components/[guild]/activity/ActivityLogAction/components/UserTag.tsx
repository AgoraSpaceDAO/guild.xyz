import {
  forwardRef,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagProps,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react"
import GuildAvatar from "components/common/GuildAvatar"

import { useRouter } from "next/router"
import shortenHex from "utils/shortenHex"
import { useActivityLog } from "../../ActivityLogContext"

type Props = {
  address?: string
  userId?: number
} & TagProps

const UserTag = forwardRef<Props, "span">(
  ({ address: addressProp, userId, ...rest }, ref): JSX.Element => {
    const variant = useColorModeValue("subtle", "solid")
    const colorScheme = useColorModeValue("alpha", "gray")

    const { data } = useActivityLog()
    const address =
      addressProp ?? data?.values.users.find((u) => u.id === userId)?.address

    return (
      <Tag
        ref={ref}
        variant={variant}
        colorScheme={colorScheme}
        cursor="pointer"
        minW="max-content"
        h="max-content"
        {...rest}
      >
        {address && (
          <TagLeftIcon mr={0.5} as={GuildAvatar} address={address} size={3} />
        )}
        <TagLabel>
          {address ? shortenHex(address, 3) : userId ?? "Unknown user"}
        </TagLabel>
      </Tag>
    )
  }
)

type ClickableUserTagProps = {
  id: number
}

const ClickableUserTag = ({ id }: ClickableUserTagProps): JSX.Element => {
  const { data, baseUrl } = useActivityLog()
  const address = data.values.users.find((u) => u.id === id)?.address

  const router = useRouter()

  return (
    <Tooltip label="Filter by user" placement="top" hasArrow>
      <UserTag
        as="button"
        onClick={() => {
          router.push({
            pathname: baseUrl,
            query: { ...router.query, userId: id },
          })
        }}
        address={address}
      />
    </Tooltip>
  )
}

export default UserTag
export { ClickableUserTag }
