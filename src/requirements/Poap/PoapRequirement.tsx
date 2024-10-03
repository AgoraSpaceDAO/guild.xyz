import { Link, Text } from "@chakra-ui/react"
import Requirement, {
  RequirementProps,
} from "components/[guild]/Requirements/components/Requirement"
import { useRequirementContext } from "components/[guild]/Requirements/components/RequirementContext"
import { DataBlock } from "components/common/DataBlock"
import { usePoap } from "./hooks/usePoaps"

const PoapRequirement = (props: RequirementProps) => {
  const requirement = useRequirementContext()

  const { poap, isLoading, error } = usePoap(requirement?.data?.id)

  return (
    <Requirement image={poap?.image_url} isImageLoading={isLoading} {...props}>
      <Text as="span">{"Own the "}</Text>
      {!poap || isLoading || error ? (
        <DataBlock
          isLoading={isLoading}
          error={error && "API error, please contact POAP to report."}
        >
          {requirement.data.id}
        </DataBlock>
      ) : (
        <Link
          href={`https://poap.gallery/event/${poap.id}`}
          isExternal
          display="inline"
          colorScheme="blue"
          fontWeight="medium"
        >
          {poap.name}
        </Link>
      )}
      <Text as="span">{" POAP"}</Text>
    </Requirement>
  )
}

export default PoapRequirement
