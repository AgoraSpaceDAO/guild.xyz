import { Tooltip } from "@chakra-ui/react"
import { useAddRewardDiscardAlert } from "components/[guild]/AddRewardButton/hooks/useAddRewardDiscardAlert"
import { useAddRewardContext } from "components/[guild]/AddRewardContext"
import Button from "components/common/Button"
import DynamicDevTool from "components/create-guild/DynamicDevTool"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useAccount } from "wagmi"
import { Chains } from "wagmiConfig/chains"
import NftDataForm, { CreateNftFormType } from "./components/NftDataForm"
import useCreateNft, {
  CONTRACT_CALL_SUPPORTED_CHAINS,
  ContractCallSupportedChain,
  CreateNFTResponse,
} from "./hooks/useCreateNft"

type Props = {
  onSuccess: (newGuildPlatform: CreateNFTResponse["guildPlatform"]) => void
}

const getDefaultChain = (chainId: number) =>
  (CONTRACT_CALL_SUPPORTED_CHAINS.includes(
    Chains[chainId] as ContractCallSupportedChain
  )
    ? Chains[chainId]
    : CONTRACT_CALL_SUPPORTED_CHAINS[0]) as ContractCallSupportedChain

const CreateNftForm = ({ onSuccess }: Props) => {
  const { isConnected: isEvmConnected, address, chainId } = useAccount()

  const methods = useForm<CreateNftFormType>({
    mode: "all",
    defaultValues: {
      chain: getDefaultChain(chainId),
      tokenTreasury: address,
      name: "",
      price: 0,
      description: "",
      richTextDescription: "",
      image: null,
      attributes: [],
      maxSupply: 0,
      mintableAmountPerUser: 1,
      soulbound: "true",
    },
  })
  useAddRewardDiscardAlert(methods.formState.isDirty)

  const chain = useWatch({
    control: methods.control,
    name: "chain",
  })
  const shouldSwitchChain = Chains[chainId] !== chain

  const { setShouldShowCloseAlert, setIsBackButtonDisabled } =
    useAddRewardContext() ?? {}
  const { onSubmit, isLoading, loadingText } = useCreateNft((newGuildPlatform) => {
    setShouldShowCloseAlert?.(false)
    onSuccess(newGuildPlatform)
  })

  return (
    <FormProvider {...methods}>
      <NftDataForm>
        <Tooltip
          label={
            isEvmConnected
              ? "Please switch to a supported chain"
              : "Please connect an EVM wallet"
          }
          isDisabled={isEvmConnected && !shouldSwitchChain}
          hasArrow
        >
          <Button
            data-test="create-nft-button"
            colorScheme="indigo"
            isDisabled={!isEvmConnected || shouldSwitchChain || isLoading}
            isLoading={isLoading}
            loadingText={loadingText}
            onClick={(e) => {
              setShouldShowCloseAlert?.(true)
              setIsBackButtonDisabled?.(true)
              return methods.handleSubmit(onSubmit)(e)
            }}
          >
            Create NFT & continue setup
          </Button>
        </Tooltip>
      </NftDataForm>

      <DynamicDevTool control={methods.control} />
    </FormProvider>
  )
}

export default CreateNftForm
