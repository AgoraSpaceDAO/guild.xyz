import { Contract } from "@ethersproject/contracts"
import { JsonRpcProvider } from "@ethersproject/providers"
import { parseUnits } from "@ethersproject/units"
import { Chain, Chains, RPC } from "connectors"
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next"
import { RequirementType } from "requirements"
import ERC20_ABI from "static/abis/erc20Abi.json"
import capitalize from "utils/capitalize"
import {
  PURCHASABLE_REQUIREMENT_TYPES,
  RESERVOIR_API_URLS,
  ZEROX_API_URLS,
} from "utils/guildCheckout"

export type FetchPriceResponse = {
  buyAmount: number
  price: number
  priceInUSD: number
  gasFee: number
  gasFeeInUSD: number
  totalFee: number
  totalFeeInUSD: number
}

const ADDRESS_REGEX = /^0x[A-F0-9]{40}$/i

const validateBody = (
  obj: Record<string, any>
): { isValid: boolean; error?: string } => {
  if (!obj)
    return {
      isValid: false,
      error: "You must provide a request body.",
    }

  if (
    typeof obj.type !== "string" ||
    !PURCHASABLE_REQUIREMENT_TYPES.includes(obj.type as RequirementType)
  )
    return {
      isValid: false,
      error: `Invalid requirement type: ${obj.type}`,
    }

  if (typeof obj.chain !== "string" || !(obj.chain as Chain))
    return {
      isValid: false,
      error: "Unsupported or invalid chain.",
    }

  if (
    typeof obj.sellAddress !== "string" ||
    !(
      ADDRESS_REGEX.test(obj.sellAddress) ||
      obj.sellAddress === RPC[obj.chain].nativeCurrency.symbol
    )
  )
    return {
      isValid: false,
      error: "Invalid sell token address.",
    }

  if (typeof obj.address !== "string" || !ADDRESS_REGEX.test(obj.address))
    return {
      isValid: false,
      error: "Invalid requirement address.",
    }

  if (
    typeof obj.data?.minAmount !== "undefined" &&
    isNaN(parseFloat(obj.data?.minAmount))
  )
    return {
      isValid: false,
      error: "Invalid requirement amount.",
    }

  return { isValid: true }
}

const fetchNativeCurrencyPrice = async (chain: Chain) =>
  fetch(
    `https://api.coinbase.com/v2/exchange-rates?currency=${RPC[chain].nativeCurrency.symbol}`
  )
    .then((coinbaseRes) => coinbaseRes.json())
    .then((coinbaseData) => coinbaseData.data.rates.USD)
    .catch((_) => undefined)

const GUILD_FEE_PERCENTAGE = 0.01

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: `Method ${req.method} is not allowed` })
  }

  const { isValid, error } = validateBody(req.body)

  if (!isValid) return res.status(400).json({ error })

  const { type: rawType, chain: rawChain, sellAddress, address, data } = req.body
  const type = rawType as RequirementType
  const chain = rawChain as Chain
  const minAmount = parseFloat(data.minAmount ?? 1)

  if (type === "ERC20") {
    if (!ZEROX_API_URLS[chain])
      return res.status(400).json({ error: "Unsupported chain" })

    const provider = new JsonRpcProvider(RPC[chain].rpcUrls[0], Chains[chain])
    const tokenContract = new Contract(address, ERC20_ABI, provider)
    let decimals

    try {
      decimals = await tokenContract.decimals()
    } catch (_) {}

    if (!decimals)
      return res.status(500).json({ error: "Couldn't fetch buyToken decimals." })

    const formattedBuyAmount = parseUnits(minAmount.toString(), decimals).toString()

    const nativeCurrencyPrice = await fetchNativeCurrencyPrice(chain)

    if (typeof nativeCurrencyPrice === "undefined")
      return res.status(500).json({
        error: `Couldn't fetch ${
          RPC[Chains[chain]].nativeCurrency.symbol
        }-USD rate.`,
      })

    const response = await fetch(
      `${ZEROX_API_URLS[chain]}/swap/v1/price?sellToken=${sellAddress}&buyToken=${address}&buyAmount=${formattedBuyAmount}`
    )

    const responseData = await response.json()

    if (response.status !== 200) {
      return res.status(response.status).json({
        error: responseData.validationErrors?.length
          ? responseData.validationErrors[0].description
          : response.statusText,
      })
    }

    const price = parseFloat(responseData.price) * minAmount
    const priceInUSD = parseFloat(
      ((nativeCurrencyPrice / responseData.sellTokenToEthRate) * price).toFixed(0)
    )

    const halfUSDInNativeCurrency = 0.5 / nativeCurrencyPrice

    // const gasFee = parseFloat(
    //   formatUnits(
    //     responseData.estimatedGas * responseData.gasPrice,
    //     RPC[chain].nativeCurrency.decimals
    //   )
    // )

    // TODO: calculate gas fee, maybe using a static call?
    const gasFee = 0

    const totalFee = gasFee + price * GUILD_FEE_PERCENTAGE + halfUSDInNativeCurrency

    return res.json({
      buyAmount: minAmount,
      price,
      priceInUSD,
      gasFee,
      gasFeeInUSD: nativeCurrencyPrice * gasFee,
      totalFee,
      totalFeeInUSD: nativeCurrencyPrice * totalFee,
    })
  } else if (type === "ERC721" || type === "ERC1155") {
    if (!RESERVOIR_API_URLS[chain])
      return res.status(400).json({ error: "Unsupported chain" })

    const queryParams: {
      limit: string
      collection?: string
      attributes?: string
      tokens?: string
      [x: string]: string
    } = {
      collection: address,
      limit: minAmount.toString(),
    }

    // TODO: maybe we should check the DB and migrate all old attribute structures to the new one.
    if (data?.attributes?.length) {
      data.attributes.forEach(
        (attr) =>
          (queryParams[`attributes[${attr.trait_type}]`] = capitalize(attr.value))
      )
    } else if (data?.id?.length) {
      delete queryParams.collection
      queryParams.tokens = `${address}:${data.id}`
    }

    const urlSearchParams = new URLSearchParams(queryParams).toString()

    const response = await fetch(
      `${RESERVOIR_API_URLS[chain]}/tokens/v5?${urlSearchParams}`
    )

    if (response.status !== 200)
      return res.status(response.status).json({ error: response.statusText })

    const responseData = await response.json()

    if (
      !responseData.tokens?.length ||
      responseData.tokens.length < minAmount ||
      !responseData.tokens.every((t) => !!t.market.floorAsk.price)
    )
      return res.status(500).json({ error: "Couldn't find purchasable NFTs." })

    const nativeCurrencyPrice = await fetchNativeCurrencyPrice(chain)

    if (typeof nativeCurrencyPrice === "undefined")
      return res.status(500).json({
        error: `Couldn't fetch ${
          RPC[Chains[chain]].nativeCurrency.symbol
        }-USD rate.`,
      })

    const price = responseData.tokens
      .map((t) => t.market.floorAsk.price.amount.native)
      .reduce((p1, p2) => p1 + p2, 0)

    const priceInUSD = responseData.tokens
      .map((t) => t.market.floorAsk.price.amount.usd)
      .reduce((p1, p2) => p1 + p2, 0)

    const halfUSDInNativeCurrency = 0.5 / nativeCurrencyPrice

    // TODO: calculate gas fee, maybe using a static call?
    const gasFee = 0

    const totalFee = gasFee + price * GUILD_FEE_PERCENTAGE + halfUSDInNativeCurrency

    return res.json({
      buyAmount: minAmount,
      price,
      priceInUSD,
      gasFee,
      gasFeeInUSD: nativeCurrencyPrice * gasFee,
      totalFee,
      totalFeeInUSD: nativeCurrencyPrice * totalFee,
    })
  }

  res.json(undefined)
}

export default handler
