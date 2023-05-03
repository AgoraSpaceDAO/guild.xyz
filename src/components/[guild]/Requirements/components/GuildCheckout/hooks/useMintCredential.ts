import { useWeb3React } from "@web3-react/core"
import useGuild from "components/[guild]/hooks/useGuild"
import { Chains } from "connectors"
import useContract from "hooks/useContract"
import useShowErrorToast from "hooks/useShowErrorToast"
import useToast from "hooks/useToast"
import { useState } from "react"
import fetcher from "utils/fetcher"
import {
  GUILD_CREDENTIAL_CONTRACT,
  NULL_ADDRESS,
} from "utils/guildCheckout/constants"
import { GuildAction, useMintCredentialContext } from "../MintCredentialContext"
import useCredentialFee from "./useCredentialFee"
import useSubmitTransaction from "./useSubmitTransaction"

type MintData = {
  userAddress: string
  guildAction: GuildAction
  guildId: number
  timestamp: number
  cid: string
  signature: string
}

const useMintCredential = () => {
  const toast = useToast()
  const showErrorToast = useShowErrorToast()

  const { chainId, account } = useWeb3React()
  const { id } = useGuild()
  const { credentialType, setMintedTokenId } = useMintCredentialContext()
  const [loadingText, setLoadingText] = useState<string>("")

  const guildCredentialContract = useContract(
    GUILD_CREDENTIAL_CONTRACT[Chains[chainId]]?.address,
    GUILD_CREDENTIAL_CONTRACT[Chains[chainId]]?.abi,
    true
  )

  const { credentialFee } = useCredentialFee()

  const mintCredential = async () => {
    setLoadingText("Uploading metadata")
    const {
      userAddress,
      guildAction,
      guildId,
      timestamp,
      cid,
      signature,
    }: MintData = await fetcher("/assets/credentials", {
      body: {
        userAddress: account,
        guildId: id,
        guildAction: credentialType,
      },
    })

    setLoadingText("Check your wallet")
    const contractCallParams = [
      NULL_ADDRESS,
      userAddress,
      guildAction,
      guildId,
      timestamp,
      cid,
      signature,
      { value: credentialFee },
    ]

    try {
      await guildCredentialContract.callStatic.claim(...contractCallParams)
    } catch (callstaticError) {
      return Promise.reject(callstaticError.errorName ?? "Contract error")
    }

    return guildCredentialContract.claim(...contractCallParams)
  }

  return {
    ...useSubmitTransaction<null>(mintCredential, {
      onSuccess: (txReceipt) => {
        setLoadingText("")

        const transferEvent = txReceipt.events?.find((e) => e.event === "Transfer")

        if (transferEvent) {
          try {
            const tokenId = transferEvent.args.tokenId.toNumber()
            setMintedTokenId(tokenId)
          } catch {}
        }

        toast({
          status: "success",
          title: "Successfully minted credential!",
        })
      },
      onError: (error) => {
        showErrorToast(error)
        setLoadingText("")
      },
    }),
    loadingText,
  }
}

export default useMintCredential
