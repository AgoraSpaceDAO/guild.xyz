import Requirement, {
  RequirementProps,
  RequirementSkeleton,
} from "components/[guild]/Requirements/components/Requirement"
import { useRequirementContext } from "components/[guild]/Requirements/components/RequirementContext"
import useGuild from "components/[guild]/hooks/useGuild"
import Link from "components/common/Link"
import Star from "static/icons/star.svg"

const PointsRank = (props: RequirementProps): JSX.Element => {
  const requirement = useRequirementContext()
  const { guildPlatformId, guildId, minAmount, maxAmount } = requirement.data
  const { name, urlName, guildPlatforms } = useGuild(guildId)
  const { id } = useGuild()

  if (!guildPlatforms) return <RequirementSkeleton />

  const pointsReward = guildPlatforms.find((gp) => gp.id === guildPlatformId)

  return (
    <Requirement
      image={pointsReward.platformGuildData.imageUrl ?? <Star />}
      {...props}
    >
      {maxAmount
        ? `Have a rank between ${minAmount} - ${maxAmount} on the `
        : `Be in the top ${minAmount} members on the `}
      <Link
        colorScheme={"blue"}
        href={`/${urlName}/leaderboard/${pointsReward.id}`}
      >{`${pointsReward.platformGuildData.name} leaderboard`}</Link>
      {guildId !== id && (
        <>
          {`in the `}
          <Link colorScheme={"blue"} href={urlName}>
            {name}
          </Link>
          {` guild`}
        </>
      )}
    </Requirement>
  )
}

const PointsTotalAmount = (props: RequirementProps): JSX.Element => {
  const requirement = useRequirementContext()
  const { guildId, minAmount, maxAmount } = requirement.data
  const { name, urlName } = useGuild(guildId)
  const { id } = useGuild()

  return (
    <Requirement image={<Star />} {...props}>
      {maxAmount
        ? `Have a total score between ${minAmount} - ${maxAmount} of all point types`
        : `Have a total score of at least ${minAmount} of all point types`}
      {guildId !== id && (
        <>
          {`in the `}
          <Link href={urlName}>{name}</Link>
          {` guild`}
        </>
      )}
    </Requirement>
  )
}

const PointsAmount = (props: RequirementProps): JSX.Element => {
  const requirement = useRequirementContext()
  const { guildPlatformId, guildId, minAmount, maxAmount } = requirement.data
  const { name, urlName, guildPlatforms } = useGuild(guildId)
  const { id } = useGuild()

  if (!guildPlatforms) return <RequirementSkeleton />

  const pointsReward = guildPlatforms.find((gp) => gp.id === guildPlatformId)
  const pointsName = pointsReward.platformGuildData.name || "points"

  return (
    <Requirement
      image={pointsReward.platformGuildData.imageUrl ?? <Star />}
      {...props}
    >
      {maxAmount
        ? `Have between ${minAmount} - ${maxAmount} ${pointsName}`
        : `Have at least ${minAmount} ${pointsName}`}
      {guildId !== id && (
        <>
          {`in the `}
          <Link href={urlName}>{name}</Link>
          {` guild`}
        </>
      )}
    </Requirement>
  )
}

const types = {
  POINTS_AMOUNT: PointsAmount,
  POINTS_TOTAL_AMOUNT: PointsTotalAmount,
  POINTS_RANK: PointsRank,
}

const PointsRequirement = (props: RequirementProps) => {
  const { type } = useRequirementContext()
  const Component = types[type]
  return <Component {...props} />
}

export default PointsRequirement
