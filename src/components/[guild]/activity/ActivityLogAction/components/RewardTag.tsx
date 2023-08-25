import { Tag, TagLabel, TagLeftIcon, Tooltip } from "@chakra-ui/react"
import { useRouter } from "next/router"
import platforms from "platforms/platforms"
import { useActivityLog } from "../../ActivityLogContext"

type Props = {
  rolePlatformId: number
}
const RewardTag = ({ rolePlatformId }: Props): JSX.Element => {
  const { data, baseUrl } = useActivityLog()

  const reward = data.values.rolePlatforms.find((rp) => rp.id === rolePlatformId)

  const router = useRouter()

  return (
    <Tooltip label="Filter by reward" placement="top" hasArrow>
      <Tag
        as="button"
        bgColor={`${platforms[reward?.platformName]?.colorScheme}.500` ?? "gray.500"}
        color="white"
        minW="max-content"
        h="max-content"
        onClick={() => {
          router.push({
            pathname: baseUrl,
            query: { ...router.query, rolePlatformId },
          })
        }}
      >
        {platforms[reward?.platformName]?.icon && (
          <TagLeftIcon as={platforms[reward?.platformName].icon} />
        )}

        <TagLabel>
          {reward?.platformGuildName ?? reward?.data?.name ?? "Unknown reward"}
        </TagLabel>
      </Tag>
    </Tooltip>
  )
}

export default RewardTag
