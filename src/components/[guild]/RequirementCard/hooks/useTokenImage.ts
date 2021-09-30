import useTokensList from "hooks/useTokensList"

const useTokenImage = (address: string): string => {
  if (!address.length) return null

  const tokens = useTokensList()
  const foundToken = tokens?.find((token) => token.address === address)

  if (foundToken && foundToken.logoURI) return foundToken.logoURI

  return null
}

export default useTokenImage
