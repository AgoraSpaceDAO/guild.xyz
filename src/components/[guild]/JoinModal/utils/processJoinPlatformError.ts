import { ErrorInfo } from "components/common/Error"
import { DiscordError, WalletError } from "types"
import processWalletError from "utils/processWalletError"
import processConnectorError from "./processConnectorError"
import processDiscordError from "./processDiscordError"

type JoinError = WalletError | Response | Error | DiscordError | string

const EMAIL_RESTRICTION = "You will be able to perform this action at: "

const HUMAN_READABLE_MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const processJoinPlatformError = (error: JoinError): ErrorInfo => {
  if (typeof error === "string" && error.includes(EMAIL_RESTRICTION)) {
    const [, isoString] = error.split(EMAIL_RESTRICTION)
    const date = new Date(isoString)
    return {
      title: "Timed out",
      description: `You are timed out from email verification until ${
        HUMAN_READABLE_MONTH[date.getMonth()]
      }  ${date.getDate()}. ${date.getHours()}:${date.getMinutes()}`,
    }
  }

  // if it's a network error from fetching
  if (error instanceof Error) {
    if (
      [
        "MetaMask Message Signature: User denied message signature.",
        "Math Wallet User Cancelled",
        "Sign request rejected",
      ].includes(error.message)
    )
      // With WalletConnect these errors also come as Error objects, not object literals
      return processWalletError({ code: 4001, message: "" })

    return {
      title: error.name,
      description: error.message,
    }
  }
  // if it's a HTTP error from fetching
  if (error instanceof Response) {
    return {
      title: "Backend error",
      description: "The backend couldn't handle the request",
    }
  }
  if (typeof error === "string") {
    const connectorError = processConnectorError(error)

    return {
      title: "Error",
      description: connectorError ?? error,
    }
  }

  // If it's an error from Discord auth
  if ("error" in error && "errorDescription" in error)
    return processDiscordError(error)

  // if it's an error from signing
  return processWalletError(error)
}

export default processJoinPlatformError
