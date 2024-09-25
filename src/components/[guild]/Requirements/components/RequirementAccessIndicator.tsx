import { accountModalAtom } from "@/components/Providers/atoms"
import { Button } from "@/components/ui/Button"
import {
  ArrowSquareIn,
  Check,
  LockSimple,
  Warning,
  X,
} from "@phosphor-icons/react/dist/ssr"
import RecheckAccessesButton from "components/[guild]/RecheckAccessesButton"
import { useRoleMembership } from "components/explorer/hooks/useMembership"
import { useSetAtom } from "jotai"
import dynamic from "next/dynamic"
import { RequirementAccessIndicatorUI } from "./RequirementAccessIndicatorUI"
import { useRequirementContext } from "./RequirementContext"

const DynamicCompleteCaptcha = dynamic(
  () => import("requirements/Captcha/components/CompleteCaptcha")
)
const DynamicSetupPassport = dynamic(
  () => import("requirements/GitcoinPassport/components/SetupPassport")
)
const DynamicConnectRequirementPlatformButton = dynamic(
  () => import("./ConnectRequirementPlatformButton")
)

const NON_CONNECTABLE_PLATFORM_ERRORS = new Set([
  "EVM address not connected",
  "FUEL address not connected",
  "Email address not found, please create one.",
])

const RequirementAccessIndicator = () => {
  const setIsAccountModalOpen = useSetAtom(accountModalAtom)
  const { id, roleId, type, data, isNegated } = useRequirementContext()

  const { reqAccesses, hasRoleAccess } = useRoleMembership(roleId)
  if (!reqAccesses) return null

  const reqAccessData = reqAccesses?.find((obj) => obj.requirementId === id)

  if (reqAccessData?.access)
    return (
      <RequirementAccessIndicatorUI colorScheme="green" icon={Check}>
        <p className="font-semibold">🎉 Requirement satisfied</p>
      </RequirementAccessIndicatorUI>
    )

  if (
    (reqAccessData?.errorType === "PLATFORM_NOT_CONNECTED" ||
      reqAccessData?.errorType === "PLATFORM_CONNECT_INVALID") &&
    !NON_CONNECTABLE_PLATFORM_ERRORS.has(reqAccessData?.errorMsg ?? "")
  )
    return (
      <RequirementAccessIndicatorUI
        colorScheme="blue"
        icon={LockSimple}
        isAlwaysOpen={!hasRoleAccess}
      >
        <p className="font-semibold">
          {type === "CAPTCHA"
            ? "Complete CAPTCHA to check access"
            : type.startsWith("GITCOIN_")
              ? "Setup GitCoin Passport to check access"
              : "Connect account to check access"}
        </p>
        <div className="mt-2 flex justify-end">
          {type === "CAPTCHA" ? (
            <DynamicCompleteCaptcha size="sm" iconSpacing={2} />
          ) : type.startsWith("GITCOIN_") ? (
            <DynamicSetupPassport size="sm" />
          ) : (
            <DynamicConnectRequirementPlatformButton className="gap-2" size="sm" />
          )}
        </div>
      </RequirementAccessIndicatorUI>
    )

  if (reqAccessData?.access === null) {
    return (
      <RequirementAccessIndicatorUI
        colorScheme="orange"
        icon={Warning}
        isAlwaysOpen={!hasRoleAccess}
      >
        <p className="font-semibold">
          {reqAccessData?.errorMsg
            ? `Error: ${reqAccessData.errorMsg}`
            : `Couldn't check access`}
          <RecheckAccessesButton
            roleId={roleId}
            size="sm"
            ml="2"
            variant={"outline"}
          />
        </p>
      </RequirementAccessIndicatorUI>
    )
  }

  return (
    <RequirementAccessIndicatorUI
      colorScheme="gray"
      icon={X}
      isAlwaysOpen={!hasRoleAccess}
    >
      <p className="font-semibold">
        {`Requirement not satisfied with your connected accounts`}
      </p>
      {reqAccessData?.amount !== null && !!data?.minAmount && (
        <p>
          {isNegated
            ? `Expected max amount is ${data.minAmount}${
                data.maxAmount ? `-${data.maxAmount}` : ""
              } and you have ${reqAccessData?.amount}`
            : `Expected amount is ${data.minAmount}${
                data.maxAmount ? `-${data.maxAmount}` : ""
              } but you ${data.maxAmount ? "" : "only"} have ${
                reqAccessData?.amount
              }`}
        </p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          rightIcon={<ArrowSquareIn weight="bold" />}
          onClick={() => setIsAccountModalOpen(true)}
        >
          View connections
        </Button>
        <RecheckAccessesButton roleId={roleId} size="sm" />
      </div>
    </RequirementAccessIndicatorUI>
  )
}

export { RequirementAccessIndicator }
