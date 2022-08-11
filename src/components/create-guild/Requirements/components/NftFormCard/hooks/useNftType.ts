import useSWR from "swr"
import { SupportedChains } from "types"

const nounsAddresses = {
  ETHEREUM: "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03".toLowerCase(),
  RINKEBY: "0x65dA5EbD09f0C6CA1DFc5EaA5639626ccd5DaD06".toLowerCase(),
}

const useNftType = (
  contractAddress: string,
  chain: SupportedChains
): { nftType: "ERC1155" | "SIMPLE" | "NOUNS"; isLoading: boolean } => {
  const isNounsContract =
    !!chain &&
    !!contractAddress &&
    nounsAddresses[chain] === contractAddress?.toLowerCase()

  const { data: nftType, isValidating: isLoading } = useSWR(
    contractAddress && !isNounsContract
      ? `/util/contractType/${contractAddress}/1/${chain}`
      : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  )

  if (isNounsContract) {
    return { nftType: "NOUNS", isLoading: false }
  }

  return { nftType, isLoading }
}

export { nounsAddresses }
export default useNftType
