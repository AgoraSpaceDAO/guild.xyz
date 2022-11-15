import { Skeleton, Text } from "@chakra-ui/react"
import DataBlock from "components/common/DataBlock"
import useKycDAOContracts from "components/create-guild/Requirements/components/KycDAOForm/hooks/useKycDAOContracts"
import { RequirementComponentProps } from "types"
import BlockExplorerUrl from "./common/BlockExplorerUrl"
import Requirement from "./common/Requirement"

const KycDAORequirement = ({
  requirement,
  ...rest
}: RequirementComponentProps): JSX.Element => {
  const { isLoading, kycDAOContracts } = useKycDAOContracts()

  const contractData = kycDAOContracts?.find(
    (c) => c.value?.toLowerCase() === requirement.address.toLowerCase()
  )

  return (
    <Requirement
      image={
        <Text as="span" fontWeight="bold" fontSize="xx-small">
          KYC
        </Text>
      }
      footer={<BlockExplorerUrl requirement={requirement} />}
      {...rest}
    >
      <Text as="span">{`Get verified as `}</Text>
      <Skeleton as="span" isLoaded={!isLoading}>
        {isLoading ? (
          "Loading..."
        ) : (
          <DataBlock>{contractData?.label || requirement.address}</DataBlock>
        )}
      </Skeleton>
    </Requirement>
  )
}

export default KycDAORequirement
