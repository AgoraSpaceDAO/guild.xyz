import { HStack, Img } from "@chakra-ui/react"
import BlockExplorerUrl from "components/[guild]/Requirements/components/BlockExplorerUrl"
import DataBlock from "components/[guild]/Requirements/components/DataBlock"
import Requirement, {
  RequirementProps,
} from "components/[guild]/Requirements/components/Requirement"
import { RequirementLinkButton } from "components/[guild]/Requirements/components/RequirementButton"
import { useRequirementContext } from "components/[guild]/Requirements/components/RequirementContext"
import { RPC } from "connectors"
import useResolveAddress from "hooks/resolving/useResolveAddress"
import shortenHex from "utils/shortenHex"

export const EAS_SCAN_BASE = {
  ARBITRUM: "https://arbitrum.easscan.org/schema/view",
  OPTIMISM: "https://optimism.easscan.org/schema/view",
  ETHEREUM: "https://easscan.org/schema/view",
  SEPOLIA: "https://sepolia.easscan.org/schema/view",
  BASE_GOERLI: "https://base-goerli.easscan.org/schema/view",
} as const

const EthereumAttestationRequirement = (props: RequirementProps): JSX.Element => {
  const requirement = useRequirementContext()

  const recipientDomain = useResolveAddress(requirement.data?.recipient)
  const attesterDomain = useResolveAddress(requirement.data?.attester)

  return (
    <Requirement
      image={
        <Img
          src={"/requirementLogos/eas.png"}
          maxWidth={"var(--chakra-space-8)"}
          maxHeight={"var(--chakra-space-8)"}
        />
      }
      footer={
        <HStack spacing={4}>
          <RequirementLinkButton
            href={`${EAS_SCAN_BASE[requirement?.chain ?? "ETHEREUM"]}/${
              requirement?.data?.schemaId
            }`}
            imageUrl="/requirementLogos/eas.png"
          >
            {/* View schema on EAS scan */}
            Schema
          </RequirementLinkButton>
          <BlockExplorerUrl
            path="address"
            address={requirement.data?.attester ?? requirement.data?.recipient}
            // label={`View ${
            //   requirement.type === "EAS_ATTEST" ? "recipient" : "attester"
            // } on explorer`}
            label={requirement.type === "EAS_ATTEST" ? "Recipient" : "Attester"}
          />
        </HStack>
      }
      {...props}
    >
      {requirement.type === "EAS_ATTEST" ? (
        <>
          Attest{" "}
          <DataBlock>
            {recipientDomain ?? shortenHex(requirement.data?.recipient ?? "", 3)}
          </DataBlock>{" "}
          according to schema{" "}
        </>
      ) : (
        <>
          Be attested by{" "}
          <DataBlock>
            {attesterDomain ?? shortenHex(requirement.data?.attester ?? "", 3)}
          </DataBlock>{" "}
          according to schema{" "}
        </>
      )}
      <DataBlock>{shortenHex(requirement.data.schemaId, 3)}</DataBlock>
      {requirement.data.key && (
        <>
          {" with key "}
          <DataBlock>{requirement.data.key}</DataBlock>
          {requirement.data.val && (
            <>
              {" and value "}
              <DataBlock>{requirement.data.val}</DataBlock>
            </>
          )}
        </>
      )}{" "}
      on {RPC[requirement.chain].chainName}
    </Requirement>
  )
}

export default EthereumAttestationRequirement
