import { HTMLAttributes, ReactNode, useMemo } from "react"
import { JoinState } from "../../utils/mapAccessJobState"
import ProgressJoinStep from "./components/ProgressJoinStep"

const SatisfyRequirementsJoinStep = ({
  joinState,
  fallbackText,
  ...props
}: {
  joinState: JoinState
  fallbackText?: JSX.Element
  RightComponent?: ReactNode
} & HTMLAttributes<HTMLDivElement>) => {
  const status = useMemo(() => {
    switch (joinState?.state) {
      case "NO_ACCESS":
        return "NO_ACCESS"

      case "MANAGING_ROLES":
      case "MANAGING_REWARDS":
      case "FINISHED":
        return "DONE"

      case "PREPARING":
      case "CHECKING":
        return "LOADING"

      default:
        return "INACTIVE"
    }
  }, [joinState])

  return (
    <ProgressJoinStep
      title="Meet the requirements"
      countLabel={
        status === "LOADING" ? "requirements checked" : "requirements satisfied"
      }
      status={status}
      // so we render the no access fallbackText from JoinModal in case of no access
      total={status !== "NO_ACCESS" && joinState?.requirements?.all}
      current={
        status === "LOADING"
          ? joinState?.requirements?.checked
          : joinState?.requirements?.satisfied
      }
      fallbackText={
        fallbackText ||
        (status === "NO_ACCESS"
          ? "Requirements not satisfied"
          : "Preparing access check")
      }
      {...props}
    />
  )
}

export { ProgressJoinStep }
export default SatisfyRequirementsJoinStep
