import { Skeleton } from "@chakra-ui/react"
import { Requirement } from "types"
import RequirementCard from "../common/RequirementCard"
import useGalaxyCampaign from "./hooks/useGalaxyCampaign"

type Props = {
  requirement: Requirement
}

const GalaxyRequirementCard = ({ requirement }: Props): JSX.Element => {
  const { campaign, isLoading } = useGalaxyCampaign(requirement?.data?.galaxyId)

  return (
    <RequirementCard
      requirement={requirement}
      image={isLoading ? "" : campaign?.thumbnail}
      loading={isLoading}
    >
      {`Participate in the `}
      <Skeleton display="inline" isLoaded={!isLoading}>
        {isLoading ? "Loading..." : campaign?.name}
      </Skeleton>
      {` Galaxy campaign`}
    </RequirementCard>
  )
}

export default GalaxyRequirementCard
