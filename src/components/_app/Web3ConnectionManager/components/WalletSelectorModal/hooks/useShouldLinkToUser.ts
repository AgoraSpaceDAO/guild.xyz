import { useUserPublic } from "components/[guild]/hooks/useUser"
import { useAddressLinkContext } from "components/_app/AddressLinkProvider"
import {
  deleteKeyPairFromIdb,
  getKeyPairFromIdb,
} from "components/_app/KeyPairProvider"
import useSWR, { mutate, unstable_serialize } from "swr"

const fetchShouldLinkToUser = async ([_, userId, connectParams]) => {
  const { userId: userIdToConnectTo } = connectParams ?? {}
  if (!userIdToConnectTo) return false

  if (
    typeof userId === "number" &&
    typeof userIdToConnectTo === "number" &&
    userIdToConnectTo !== userId
  ) {
    try {
      await deleteKeyPairFromIdb(userId).then(() =>
        mutate(unstable_serialize(["keyPair", userId]))
      )
    } catch {}
  }

  const keypair = await getKeyPairFromIdb(+userIdToConnectTo)

  return !!keypair
}

const useShouldLinkToUser = () => {
  const { id } = useUserPublic()
  const { setAddressLinkParams, addressLinkParams } = useAddressLinkContext()

  const { data: shouldLinkToUser } = useSWR(
    addressLinkParams?.userId ? ["shouldLinkToUser", id, addressLinkParams] : null,
    fetchShouldLinkToUser,
    {
      shouldRetryOnError: false,
      onError: () => {
        setAddressLinkParams({ userId: null, address: null })
      },
    }
  )

  return shouldLinkToUser
}

export default useShouldLinkToUser
