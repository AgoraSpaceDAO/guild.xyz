import { Divider, useColorMode, VStack } from "@chakra-ui/react"
import { useWeb3React } from "@web3-react/core"
import ConnectWalletAlert from "components/common/ConnectWalletAlert"
import DeleteButton from "components/common/DeleteButton"
import Section from "components/common/Section"
import LogicPicker from "components/create-guild/LogicPicker"
import Requirements from "components/create-guild/Requirements"
import NameAndIcon from "components/create/NameAndIcon"

const EditForm = () => {
  const { account } = useWeb3React()
  const { colorMode } = useColorMode()

  if (!account) return <ConnectWalletAlert />

  return (
    <VStack spacing={10} alignItems="start">
      <Section title="Choose a logo and name for your Guild">
        <NameAndIcon />
      </Section>

      <Section title="Requirements logic">
        <LogicPicker />
      </Section>

      <Requirements />

      <Divider borderColor={colorMode === "light" ? "blackAlpha.400" : undefined} />

      <DeleteButton />
    </VStack>
  )
}

export default EditForm
