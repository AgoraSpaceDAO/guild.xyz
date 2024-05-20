import {
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Text,
} from "@chakra-ui/react"
import { PlatformName } from "@guildxyz/types"
import { useAddRewardContext } from "components/[guild]/AddRewardContext"
import PlatformsGrid from "components/create-guild/PlatformsGrid"
import { PropsWithChildren } from "react"

type Props = {
  disabledRewards?: Partial<Record<PlatformName, string>>
}

const SelectRewardPanel = ({
  disabledRewards = {},
  children,
}: PropsWithChildren<Props>) => {
  const { modalRef, setSelection, setStep } = useAddRewardContext()

  return (
    <ModalContent>
      <ModalCloseButton />
      <ModalHeader>
        <Text>Add reward</Text>
      </ModalHeader>

      <ModalBody ref={modalRef} className="custom-scrollbar">
        {children}
        <PlatformsGrid
          onSelection={(platform) => {
            setSelection(platform)
            setStep("REWARD_SETUP")
          }}
          disabledRewards={disabledRewards}
        />
      </ModalBody>
    </ModalContent>
  )
}

export default SelectRewardPanel
