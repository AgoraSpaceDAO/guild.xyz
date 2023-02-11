import { MaxUint256 } from "@ethersproject/constants"
import { Contract } from "@ethersproject/contracts"
import { useWeb3React } from "@web3-react/core"
import { Chains, RPC } from "connectors"
import useContract from "hooks/useContract"
import useShowErrorToast from "hooks/useShowErrorToast"
import useSubmit from "hooks/useSubmit"
import { useState } from "react"
import ERC20_ABI from "static/abis/erc20Abi.json"
import useSWR from "swr"
import { NULL_ADDRESS } from "utils/guildCheckout/constants"
import { useGuildCheckoutContext } from "../components/GuildCheckoutContex"

const fetchAllowance = (
  _: string,
  account: string,
  contract: Contract,
  contractAddress: string
) => contract?.allowance(account, contractAddress)

const useAllowance = (tokenAddress: string, contract: string) => {
  const showErrorToast = useShowErrorToast()
  const [isAllowing, setIsAllowing] = useState(false)

  const { account, chainId } = useWeb3React()
  const erc20Contract = useContract(tokenAddress, ERC20_ABI, true)

  const { requirement } = useGuildCheckoutContext()

  const shouldFetch =
    tokenAddress &&
    erc20Contract &&
    requirement?.chain === Chains[chainId] &&
    tokenAddress !== RPC[requirement?.chain]?.nativeCurrency?.symbol &&
    tokenAddress !== NULL_ADDRESS

  const {
    data: allowance,
    isValidating: isAllowanceLoading,
    error: allowanceError,
    mutate: mutateAllowance,
  } = useSWR(
    shouldFetch ? ["allowance", account, erc20Contract, contract] : null,
    fetchAllowance
  )

  const allowSpendingTokensCall = async () => {
    const approveRes = await erc20Contract?.approve(contract, MaxUint256)
    setIsAllowing(true)
    const approved = await approveRes?.wait()
    setIsAllowing(false)
    return approved
  }

  const useSubmitData = useSubmit(allowSpendingTokensCall, {
    onError: (error) => showErrorToast(error?.code ?? error),
    onSuccess: () => mutateAllowance(),
  })

  return {
    isAllowanceLoading,
    isAllowing,
    allowance,
    allowanceError,
    mutateAllowance,
    ...useSubmitData,
  }
}

export default useAllowance
