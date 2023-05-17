import { BigNumber } from "@ethersproject/bignumber"
import { Contract } from "@ethersproject/contracts"
import { JsonRpcProvider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import useUser from "components/[guild]/hooks/useUser"
import { Chain, Chains, RPC } from "connectors"
import useSWRImmutable from "swr/immutable"
import { GuildPinMetadata } from "types"
import { GUILD_PIN_CONTRACT } from "utils/guildCheckout/constants"

const fetchGuildPinsOnChain = async (address: string, chain: Chain) => {
  const provider = new JsonRpcProvider(RPC[chain].rpcUrls[0])
  const contract = new Contract(
    GUILD_PIN_CONTRACT[chain].address,
    GUILD_PIN_CONTRACT[chain].abi,
    provider
  )

  const usersGuildPinIdsOnChain: BigNumber[] = []

  const balance = await contract.balanceOf(address)

  for (let i = 0; i < balance; i++) {
    const newTokenId = await contract.tokenOfOwnerByIndex(address, i)
    if (newTokenId) usersGuildPinIdsOnChain.push(newTokenId)
  }

  const usersGuildPinTokenURIsOnChain = await Promise.all<{
    chainId: number
    tokenId: number
    tokenURI: string
  }>(
    usersGuildPinIdsOnChain.map(async (tokenId) => {
      const tokenURI: string = await contract.tokenURI(tokenId)
      return {
        chainId: Chains[chain],
        tokenId: tokenId.toNumber(),
        tokenURI,
      }
    })
  )

  const usersPinsMetadataJSONs = await Promise.all(
    usersGuildPinTokenURIsOnChain.map(async ({ chainId, tokenId, tokenURI }) => {
      const metadata: GuildPinMetadata = JSON.parse(
        Buffer.from(
          tokenURI.replace("data:application/json;base64,", ""),
          "base64"
        ).toString("utf-8")
      )

      // Temporary solution, until we can't migrate all NFT metadata
      const isOldFormat =
        metadata?.attributes.find((attr) => attr.trait_type === "guildId")?.value ===
        "0"

      if (isOldFormat) {
        metadata.attributes.find((attr) => attr.trait_type === "guildId").value =
          "1985"
      }

      return {
        ...metadata,
        chainId,
        tokenId,
        // Temporary solution, until we can't migrate all NFT metadata
        image:
          tokenId < 4654
            ? "https://guild-xyz.mypinata.cloud/ipfs/QmRCvyptFaohLnAixp6XxiqMBBKT4CbrJq6qqr4ZxGgHKM"
            : metadata.image.replace(
                "ipfs://",
                process.env.NEXT_PUBLIC_IPFS_GATEWAY
              ),
      }
    })
  )

  return usersPinsMetadataJSONs
}

const fetchGuildPins = async ([_, addresses]) => {
  const guildPinChains = Object.keys(GUILD_PIN_CONTRACT) as Chain[]
  const responseArray = await Promise.all(
    guildPinChains.flatMap((chain) =>
      addresses.flatMap((address) => fetchGuildPinsOnChain(address, chain))
    )
  )

  return responseArray.flat()
}

const useUsersGuildPins = (disabled = false) => {
  const { isActive } = useWeb3React()
  const { addresses } = useUser()

  const shouldFetch = Boolean(!disabled && isActive && addresses?.length)

  return useSWRImmutable<
    ({ chainId: number; tokenId: number } & GuildPinMetadata)[]
  >(shouldFetch ? ["guildPins", addresses] : null, fetchGuildPins)
}

export default useUsersGuildPins
