import { Img } from "@chakra-ui/react"
import { Requirement } from "types"
import { RequirementLinkButton } from "./common/RequirementButton"
import RequirementCard from "./common/RequirementCard"

type Props = {
  requirement: Requirement
}

const OrangeRequirementCard = ({ requirement }: Props) => (
  <RequirementCard
    requirement={requirement}
    image={<Img src="/requirementLogos/orange.png" />}
    footer={
      <RequirementLinkButton
        imageUrl="https://app.orangeprotocol.io/logo.svg"
        href={`https://app.orangeprotocol.io/campaigns/details/${requirement.data.id}`}
      >
        View campaign
      </RequirementLinkButton>
    }
  >
    {`Have the badge of Orange campaign `}
    <pre>{`#${requirement.data.id}`}</pre>
  </RequirementCard>
)

export default OrangeRequirementCard
