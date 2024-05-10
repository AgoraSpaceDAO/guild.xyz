import { useDisclosure } from "@chakra-ui/react"
import useJsConfetti from "components/create-guild/hooks/useJsConfetti"
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react"

const TransactionStatusContext = createContext<{
  isTxModalOpen: boolean
  onTxModalOpen: () => void
  onTxModalClose: () => void
  txHash: string
  setTxHash: Dispatch<SetStateAction<string>>
  txError: boolean
  setTxError: Dispatch<SetStateAction<boolean>>
  txSuccess: boolean
  setTxSuccess: Dispatch<SetStateAction<boolean>>
  assetAmount: number
  setAssetAmount: Dispatch<SetStateAction<number>>
}>(undefined)

const TransactionStatusProvider = ({
  children,
}: PropsWithChildren<unknown>): JSX.Element => {
  const {
    isOpen: isTxModalOpen,
    onOpen: onTxModalOpen,
    onClose: onTxModalClose,
  } = useDisclosure()

  const [txHash, setTxHash] = useState("")
  const [txError, setTxError] = useState(false)
  const [txSuccess, setTxSuccess] = useState(false)
  const [assetAmount, setAssetAmount] = useState(1)

  const triggerConfetti = useJsConfetti()

  useEffect(() => {
    if (!txSuccess) return
    triggerConfetti()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txSuccess])

  return (
    <TransactionStatusContext.Provider
      value={{
        isTxModalOpen,
        onTxModalOpen,
        onTxModalClose,
        txHash,
        setTxHash,
        txError,
        setTxError,
        txSuccess,
        setTxSuccess,
        assetAmount,
        setAssetAmount,
      }}
    >
      {children}
    </TransactionStatusContext.Provider>
  )
}

const useTransactionStatusContext = () => useContext(TransactionStatusContext)

export { TransactionStatusProvider, useTransactionStatusContext }
