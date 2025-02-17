import { walletSelectorModalAtom } from "@/components/Providers/atoms"
import { useWeb3ConnectionManager } from "@/components/Web3ConnectionManager/hooks/useWeb3ConnectionManager"
import { Collapse, Tooltip } from "@chakra-ui/react"
import Button from "components/common/Button"
import { useSetAtom } from "jotai"

const ConnectWalletButton = (): JSX.Element => {
  const { type, isWeb3Connected } = useWeb3ConnectionManager()
  const setIsWalletSelectorModalOpen = useSetAtom(walletSelectorModalAtom)

  return (
    <Collapse in={type !== "EVM"}>
      <Tooltip
        label="Disconnect your Fuel wallet first"
        isDisabled={!isWeb3Connected}
        hasArrow
      >
        <Button
          size="lg"
          colorScheme="blue"
          onClick={() => setIsWalletSelectorModalOpen(true)}
          isDisabled={isWeb3Connected}
          w="full"
        >
          Connect wallet
        </Button>
      </Tooltip>
    </Collapse>
  )
}

export default ConnectWalletButton
