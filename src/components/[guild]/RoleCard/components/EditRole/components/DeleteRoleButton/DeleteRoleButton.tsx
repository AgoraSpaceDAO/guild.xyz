import {
  Alert,
  AlertIcon,
  Collapse,
  HStack,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import useRemoveGuildPlatform from "components/[guild]/AccessHub/hooks/useRemoveGuildPlatform"
import DeleteButton from "components/[guild]/DeleteButton"
import useGuild from "components/[guild]/hooks/useGuild"
import useRole from "components/[guild]/hooks/useRole"
import ConfirmationAlert from "components/create-guild/Requirements/components/ConfirmationAlert"
import { Role } from "types"
import useDeleteRole from "./hooks/useDeleteRole"

type Props = {
  roleId: number
  onDrawerClose: () => void
}

const DeleteRoleButton = ({ roleId, onDrawerClose }: Props): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const onSuccess = () => {
    onClose()
    onDrawerClose()
  }

  const { onSubmit, isLoading } = useDeleteRole(roleId, onSuccess)

  const handleDelete = async () => {
    if (tokenRolePlatform) {
      await deleteTokenReward()
      return
    }
    onSubmit()
  }

  const { id } = useGuild()

  const roleResponse = useRole(id, roleId)
  const role = roleResponse as unknown as Role
  const tokenRolePlatform = role?.rolePlatforms.find((rp) => rp.dynamicAmount)

  const { onSubmit: deleteTokenReward, isLoading: tokenRewardDeleteLoading } =
    useRemoveGuildPlatform(tokenRolePlatform?.guildPlatformId, {
      onSuccess: onSubmit,
    })

  return (
    <>
      <DeleteButton label="Delete role" onClick={onOpen} />
      <ConfirmationAlert
        isLoading={isLoading || tokenRewardDeleteLoading}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDelete}
        title="Delete role"
        description={
          <>
            <Collapse in={!!tokenRolePlatform}>
              <Alert status="warning">
                <Stack>
                  <HStack gap={0}>
                    <AlertIcon mt={0} />
                    <Text fontWeight={"bold"}>Token reward on role</Text>
                  </HStack>{" "}
                  <Text>
                    You have a token reward set up on this role. If you delete the
                    role, the token reward will also be deleted, and you will not be
                    able to withdraw funds from the reward pool through Guild.{" "}
                  </Text>{" "}
                  <Text fontWeight={"semibold"}>
                    {" "}
                    Make sure to withdraw all funds before deletion if needed!{" "}
                  </Text>
                </Stack>
              </Alert>
              <Text color={"GrayText"} fontSize={"sm"} mt={2}>
                You will be asked for your verifying signature two times, to delete
                both the reward and the role.
              </Text>
            </Collapse>
            <Collapse in={!tokenRolePlatform}>
              Are you sure you want to delete this role?
            </Collapse>
          </>
        }
        confirmationText="Delete"
      />
    </>
  )
}

export default DeleteRoleButton
