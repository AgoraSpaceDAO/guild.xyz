import {
  Center,
  Circle,
  Divider,
  HStack,
  Icon,
  IconButton,
  Img,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react"
import { CoinbaseWallet } from "@web3-react/coinbase-wallet"
import { useWeb3React } from "@web3-react/core"
import { MetaMask } from "@web3-react/metamask"
import { WalletConnect } from "@web3-react/walletconnect-v2"
import Button from "components/common/Button"
import CopyableAddress from "components/common/CopyableAddress"
import GuildAvatar from "components/common/GuildAvatar"
import { Modal } from "components/common/Modal"
import useUser from "components/[guild]/hooks/useUser"
import { deleteKeyPairFromIdb } from "components/_app/KeyPairProvider"
import { useWeb3ConnectionManager } from "components/_app/Web3ConnectionManager"
import { Chains, RPC } from "connectors"
import useResolveAddress from "hooks/resolving/useResolveAddress"
import { LinkBreak, SignOut } from "phosphor-react"
import NetworkModal from "../NetworkModal"
import AccountConnections from "./components/AccountConnections"
import PrimaryAddressTag from "./components/PrimaryAddressTag"
import UsersGuildPins from "./components/UsersGuildCredentials"

const AccountModal = () => {
  const { account, connector, chainId } = useWeb3React()
  const {
    isOpen: isNetworkModalOpen,
    onOpen: openNetworkModal,
    onClose: closeNetworkModal,
  } = useDisclosure()
  const {
    setIsDelegateConnection,
    isAccountModalOpen: isOpen,
    closeAccountModal: onClose,
  } = useWeb3ConnectionManager()
  const { id, addresses } = useUser()

  const connectorName = (c) =>
    c instanceof MetaMask
      ? typeof window !== "undefined" && (window.ethereum as any)?.isBraveWallet
        ? "Brave Wallet"
        : (window as any).okxwallet
        ? "OKX Wallet"
        : "MetaMask"
      : c instanceof WalletConnect
      ? "WalletConnect"
      : c instanceof CoinbaseWallet
      ? "Coinbase Wallet"
      : ""

  const handleLogout = () => {
    setIsDelegateConnection(false)
    onClose()
    connector.resetState()
    connector.deactivate?.()

    const keysToRemove = Object.keys({ ...window.localStorage }).filter((key) =>
      /^dc_auth_[a-z]*$/.test(key)
    )

    keysToRemove.forEach((key) => {
      window.localStorage.removeItem(key)
    })

    deleteKeyPairFromIdb(id)?.catch(() => {})
  }

  const domain = useResolveAddress(account)

  const avatarBg = useColorModeValue("gray.100", "blackAlpha.200")

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      colorScheme="duotone"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pb="6">Account</ModalHeader>
        <ModalCloseButton />
        {account ? (
          <>
            <ModalBody>
              <HStack spacing="3" alignItems="center" mb="8">
                <Circle size={12} bg={avatarBg}>
                  <GuildAvatar address={account} size={5} />
                </Circle>
                <Stack w="full" alignItems={"flex-start"} spacing="1">
                  <HStack>
                    <CopyableAddress
                      address={account}
                      domain={domain}
                      decimals={5}
                      fontWeight="bold"
                    />
                    {(typeof addresses?.[0] === "string"
                      ? (addresses as any)?.indexOf(account.toLowerCase())
                      : addresses?.findIndex(
                          ({ address }) => address === account.toLowerCase()
                        )) === 0 && addresses.length > 1 ? (
                      <PrimaryAddressTag size="sm" />
                    ) : null}
                  </HStack>
                  <HStack spacing="1">
                    <Text
                      colorScheme="gray"
                      fontSize="sm"
                      fontWeight="medium"
                      noOfLines={1}
                    >
                      {`Connected with ${connectorName(connector)} on`}
                    </Text>
                    <Button
                      variant="ghost"
                      p="0"
                      onClick={openNetworkModal}
                      size="xs"
                      mt="-2px"
                    >
                      <Center>
                        {RPC[Chains[chainId]]?.iconUrls?.[0] ? (
                          <Img src={RPC[Chains[chainId]].iconUrls[0]} boxSize={4} />
                        ) : (
                          <Icon as={LinkBreak} />
                        )}
                      </Center>
                    </Button>
                  </HStack>
                  <NetworkModal
                    isOpen={isNetworkModalOpen}
                    onClose={closeNetworkModal}
                  />
                </Stack>
                <Tooltip label="Disconnect">
                  <IconButton
                    size="sm"
                    variant="outline"
                    onClick={handleLogout}
                    icon={<Icon as={SignOut} p="1px" />}
                    aria-label="Disconnect"
                  />
                </Tooltip>
              </HStack>

              <AccountConnections />
              <Divider my="7" />
              <UsersGuildPins />
            </ModalBody>
          </>
        ) : (
          <ModalBody>
            <Text mb="6" fontSize={"2xl"} fontWeight="semibold">
              Not connected
            </Text>
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  )
}

export default AccountModal
