import {
  ButtonGroup,
  Icon,
  PopoverBody,
  PopoverFooter,
  PopoverHeader,
  Text,
} from "@chakra-ui/react"
import { ArrowSquareIn, Check, LockSimple, Warning, X } from "@phosphor-icons/react"
import RecheckAccessesButton from "components/[guild]/RecheckAccessesButton"
import useWeb3ConnectionManager from "components/_app/Web3ConnectionManager/hooks/useWeb3ConnectionManager"
import Button from "components/common/Button"
import { useRoleMembership } from "components/explorer/hooks/useMembership"
import dynamic from "next/dynamic"
import RequirementAccessIndicatorUI from "./RequirementAccessIndicatorUI"
import { useRequirementContext } from "./RequirementContext"

const DynamicConnectPolygonID = dynamic(
  () => import("requirements/PolygonID/components/ConnectPolygonID")
)
const DynamicCompleteCaptcha = dynamic(
  () => import("requirements/Captcha/components/CompleteCaptcha")
)
const DynamicSetupPassport = dynamic(
  () => import("requirements/GitcoinPassport/components/SetupPassport")
)
const DynamicConnectRequirementPlatformButton = dynamic(
  () => import("./ConnectRequirementPlatformButton")
)

const RequirementAccessIndicator = () => {
  const { openAccountModal } = useWeb3ConnectionManager()
  const { id, roleId, type, data, isNegated } = useRequirementContext()

  const { reqAccesses, hasRoleAccess } = useRoleMembership(roleId)
  if (!reqAccesses) return null

  const reqAccessData = reqAccesses?.find((obj) => obj.requirementId === id)

  if (reqAccessData?.access)
    return (
      <RequirementAccessIndicatorUI
        colorScheme={"green"}
        circleBgSwatch={{ light: 400, dark: 300 }}
        icon={Check}
      >
        <PopoverHeader {...POPOVER_HEADER_STYLES}>
          <Text as="span" mr="2">
            🎉
          </Text>
          Requirement satisfied
        </PopoverHeader>
      </RequirementAccessIndicatorUI>
    )

  if (
    reqAccessData?.errorType === "PLATFORM_NOT_CONNECTED" ||
    reqAccessData?.errorType === "PLATFORM_CONNECT_INVALID"
  )
    return (
      <RequirementAccessIndicatorUI
        colorScheme={"blue"}
        circleBgSwatch={{ light: 300, dark: 300 }}
        icon={LockSimple}
        isAlwaysOpen={!hasRoleAccess}
      >
        <PopoverHeader {...POPOVER_HEADER_STYLES}>
          {type === "CAPTCHA"
            ? "Complete CAPTCHA to check access"
            : type.startsWith("GITCOIN_")
            ? "Setup GitCoin Passport to check access"
            : "Connect account to check access"}
        </PopoverHeader>
        <PopoverFooter {...POPOVER_FOOTER_STYLES}>
          {type === "POLYGON_ID_QUERY" || type === "POLYGON_ID_BASIC" ? (
            <DynamicConnectPolygonID size="sm" iconSpacing={2} />
          ) : type === "CAPTCHA" ? (
            <DynamicCompleteCaptcha size="sm" iconSpacing={2} />
          ) : type.startsWith("GITCOIN_") ? (
            <DynamicSetupPassport size="sm" />
          ) : (
            <DynamicConnectRequirementPlatformButton size="sm" iconSpacing={2} />
          )}
        </PopoverFooter>
      </RequirementAccessIndicatorUI>
    )

  if (reqAccessData?.access === null) {
    return (
      <RequirementAccessIndicatorUI
        colorScheme={"orange"}
        circleBgSwatch={{ light: 300, dark: 300 }}
        icon={Warning}
        isAlwaysOpen={!hasRoleAccess}
      >
        <PopoverHeader {...POPOVER_HEADER_STYLES}>
          {reqAccessData?.errorMsg
            ? `Error: ${reqAccessData.errorMsg}`
            : `Couldn't check access`}
          <RecheckAccessesButton size="sm" ml="2" variant={"outline"} />
        </PopoverHeader>
      </RequirementAccessIndicatorUI>
    )
  }

  return (
    <RequirementAccessIndicatorUI
      colorScheme={"gray"}
      circleBgSwatch={{ light: 300, dark: 500 }}
      icon={X}
      isAlwaysOpen={!hasRoleAccess}
    >
      <PopoverHeader {...POPOVER_HEADER_STYLES}>
        {`Requirement not satisfied with your connected accounts`}
      </PopoverHeader>
      {reqAccessData?.amount !== null && !!data?.minAmount && (
        <PopoverBody pt="0">
          {isNegated
            ? `Expected max amount is ${data.minAmount}${
                data.maxAmount ? `-${data.maxAmount}` : ""
              } and you have ${reqAccessData?.amount}`
            : `Expected amount is ${data.minAmount}${
                data.maxAmount ? `-${data.maxAmount}` : ""
              } but you ${data.maxAmount ? "" : "only"} have ${
                reqAccessData?.amount
              }`}
        </PopoverBody>
      )}
      <PopoverFooter {...POPOVER_FOOTER_STYLES}>
        <ButtonGroup size="sm">
          <Button
            rightIcon={<Icon as={ArrowSquareIn} />}
            onClick={openAccountModal}
            variant="outline"
          >
            View connections
          </Button>
          <RecheckAccessesButton />
        </ButtonGroup>
      </PopoverFooter>
    </RequirementAccessIndicatorUI>
  )
}

export const POPOVER_HEADER_STYLES = {
  fontWeight: "semibold",
  border: "0",
  px: "3",
}

export const POPOVER_FOOTER_STYLES = {
  display: "flex",
  justifyContent: "flex-end",
  border: "0",
  pt: "2",
}

export default RequirementAccessIndicator
