import { Img } from "@chakra-ui/react"
import { RequirementComponentProps } from "requirements"
import DataBlock from "requirements/common/DataBlock"
import Requirement from "../common/Requirement"
import { rabbitholeCourses } from "./RabbitholeForm"

const RabbitholeRequirement = ({
  requirement,
  ...rest
}: RequirementComponentProps) => (
  <Requirement image={<Img src="/requirementLogos/rabbithole.png" />} {...rest}>
    {`Have an NFT from the `}
    <DataBlock>
      {
        rabbitholeCourses.find((course) => course.value === requirement.address)
          .label
      }
    </DataBlock>
    {` Rabbithole skill`}
  </Requirement>
)

export default RabbitholeRequirement
