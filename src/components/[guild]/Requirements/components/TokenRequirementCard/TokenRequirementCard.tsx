import { Requirement } from "types"
import BlockExplorerUrl from "../common/BlockExplorerUrl"
import RequirementCard from "../common/RequirementCard"
import useTokenImage from "./hooks/useTokenImage"

type Props = {
  requirement: Requirement
}

const TokenRequirementCard = ({ requirement }: Props) => {
  const { tokenImage, isLoading } = useTokenImage(
    requirement.chain,
    requirement.address
  )

  return (
    <RequirementCard
      requirement={requirement}
      image={tokenImage}
      loading={isLoading}
      footer={<BlockExplorerUrl requirement={requirement} />}
    >
      {`Hold ${
        requirement.data?.maxAmount
          ? `${requirement.data.minAmount} - ${requirement.data.maxAmount}`
          : requirement.data?.minAmount > 0
          ? `at least ${requirement.data?.minAmount}`
          : "any amount of"
      } ${requirement.symbol}`}
    </RequirementCard>
  )
}

export default TokenRequirementCard
