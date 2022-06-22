import { keccak256 } from "@ethersproject/keccak256"
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers"
import { toUtf8Bytes } from "@ethersproject/strings"
import { useWeb3React } from "@web3-react/core"
import { WalletConnect } from "@web3-react/walletconnect"
import { RPC } from "connectors"
import { randomBytes } from "crypto"
import stringify from "fast-json-stable-stringify"
import { useState } from "react"
import { WalletConnectConnectionData } from "types"
import useLocalStorage from "./useLocalStorage"

type Options<ResponseType> = {
  onSuccess?: (response: ResponseType) => void
  onError?: (error: any) => void
}

const useSubmit = <DataType, ResponseType>(
  fetch: (data?: DataType) => Promise<ResponseType>,
  { onSuccess, onError }: Options<ResponseType> = {}
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>(undefined)
  const [response, setResponse] = useState<ResponseType>(undefined)

  return {
    onSubmit: (data?: DataType) => {
      setIsLoading(true)
      setError(undefined)
      fetch(data)
        .then((d) => {
          onSuccess?.(d)
          setResponse(d)
        })
        .catch((e) => {
          onError?.(e)
          setError(e)
        })
        .finally(() => setIsLoading(false))
    },
    response,
    isLoading,
    error,
  }
}

export type ValidationData = {
  address: string
  library: Web3Provider
}

export type WithValidation<D> = { data: D; validation: ValidationData }

enum ValidationMethod {
  STANDARD = 1,
  AMBIRE = 3,
}

export type Validation = {
  /*
  params: {
    method: ValidationMethod
    addr: string
    nonce: string
    hash?: string
    msg: string
    chainId: string
    ts: string
  }
  sig: string*/
  validation: {
    address: string
    addressSignedMessage: string
    nonce: string
    random: string
    hash?: string
    timestamp: string
  }
}

const DEFAULT_MESSAGE = "Please sign this message"

const useSubmitWithSign = <DataType, ResponseType>(
  fetch: ({ data: DataType, validation: Validation }) => Promise<ResponseType>,
  {
    message = DEFAULT_MESSAGE,
    ...options
  }: Options<ResponseType> & { message?: string } = { message: DEFAULT_MESSAGE }
) => {
  const { account, provider, chainId, connector } = useWeb3React()
  const [
    {
      peerMeta: { name, url },
    },
  ] = useLocalStorage<Partial<WalletConnectConnectionData>>("walletconnect", {
    peerMeta: { name: "", url: "", description: "", icons: [] },
  })

  const isWalletConnect = connector instanceof WalletConnect
  const isAmbireWallet = [name, url].every((str) => /ambire/i.test(str))
  const isAmbireMethod = isWalletConnect && isAmbireWallet

  const method =
    (isAmbireMethod && ValidationMethod.AMBIRE) || ValidationMethod.STANDARD

  const [isSigning, setIsSigning] = useState<boolean>(false)

  const useSubmitResponse = useSubmit<DataType, ResponseType>(
    async (data: DataType | Record<string, unknown> = {}) => {
      setIsSigning(true)
      const validation = await sign({
        provider,
        address: account,
        payload: data ?? {},
        chainId: chainId.toString(),
        method,
        msg: message,
      }).finally(() => setIsSigning(false))

      return fetch({ data: data as DataType, validation })
    },
    options
  )

  return { ...useSubmitResponse, isSigning }
}

type SignProps = {
  provider: Web3Provider
  address: string
  payload: any
  chainId: string
  method: ValidationMethod
  msg: string
}

const sign = async ({
  provider,
  address,
  payload,
  chainId,
  method,
  msg,
}: SignProps): Promise<Validation> => {
  const addr = address.toLowerCase()
  const nonce = randomBytes(32).toString("base64")

  const hash =
    Object.keys(payload).length > 0
      ? keccak256(toUtf8Bytes(stringify(payload)))
      : undefined
  const ts = await getFixedTimestamp(provider).catch(() => Date.now.toString())

  const sig = await provider
    .getSigner(addr)
    .signMessage(
      `Please sign this message to verify your request!\nNonce: ${keccak256(
        toUtf8Bytes(`${addr}${nonce}`)
      )}\nRandom: ${nonce}\n${hash ? `Hash: ${hash}\n` : ""}Timestamp: ${ts}`
    )
  return {
    validation: {
      address: addr,
      addressSignedMessage: sig,
      nonce: keccak256(toUtf8Bytes(`${addr}${nonce}`)),
      random: nonce,
      timestamp: ts,
      hash,
    },
    /* params: {
      chainId,
      msg,
      method,
      addr: address.toLowerCase(),
      nonce,
      ...(hash.length > 0 ? { hash } : {}),
      ts,
    },
    sig, */
  }
}

const TIMESTAMP_CHECK_INTERVAL_MIN = 10

const getFixedTimestamp = async (provider: Web3Provider) => {
  const systemTimestamp = Date.now()
  const fallbackProvider = new JsonRpcProvider(RPC.POLYGON.rpcUrls[0])
  const [providerToUse, blockNumber]: [Web3Provider, number] = await provider
    .getBlockNumber()
    .then((blockNum) => [provider, blockNum])
    .catch(() =>
      fallbackProvider
        .getBlockNumber()
        .then((fallbackBlockNum) => [fallbackProvider, fallbackBlockNum])
        .catch(() => null)
    )
  const blockTimestamp =
    blockNumber === null
      ? null
      : await providerToUse
          .getBlock(blockNumber)
          .then((block) => block.timestamp * 1000)

  if (
    blockTimestamp > systemTimestamp + 1000 * 60 * TIMESTAMP_CHECK_INTERVAL_MIN ||
    blockTimestamp < systemTimestamp - 1000 * 60 * TIMESTAMP_CHECK_INTERVAL_MIN
  ) {
    return blockTimestamp.toString()
  }

  return systemTimestamp.toString()
}

export default useSubmit
export { useSubmitWithSign }
