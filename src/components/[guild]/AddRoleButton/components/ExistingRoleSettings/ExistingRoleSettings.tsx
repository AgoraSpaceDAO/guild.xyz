import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Stack,
} from "@chakra-ui/react"
import StyledSelect from "components/common/StyledSelect"
import useGuild from "components/[guild]/hooks/useGuild"
import useServerData from "hooks/useServerData"
import { useMemo } from "react"
import { useController, useFormContext, useFormState } from "react-hook-form"
import { SelectOption } from "types"
import pluralize from "utils/pluralize"
import UnauthenticatedOptions from "../UnauthenticatedOptions"
import useDiscordRoleMemberCounts from "./hooks/useDiscordRoleMemberCount"

const ExistingRoleSettings = () => {
  const { errors, dirtyFields } = useFormState()
  const { setValue } = useFormContext()
  const { guildPlatforms, roles: guildRoles } = useGuild()
  const {
    data: { roles },
  } = useServerData(guildPlatforms?.[0]?.platformGuildId)

  const { memberCounts } = useDiscordRoleMemberCounts(roles?.map((role) => role.id))

  const {
    field: { name, onBlur, onChange, ref, value },
  } = useController({ name: "rolePlatforms.0.platformRoleId" })

  const options = useMemo(() => {
    if (!memberCounts || !roles || !guildRoles) return undefined

    const notGuildifiedRoles = roles.filter(
      (discordRole) =>
        !guildRoles
          .map((role) => role.rolePlatforms?.[0]?.platformRoleId)
          .includes(discordRole.id)
    )

    return notGuildifiedRoles.map((role) => ({
      label: role.name,
      value: role.id,
      details:
        memberCounts[role.id] === null
          ? "Failed to count members"
          : pluralize(memberCounts[role.id], "member"),
    }))
  }, [roles, memberCounts])

  return (
    <Stack direction={{ base: "column", md: "row" }} px="5" py="4" spacing="6">
      <FormControl isDisabled={!roles?.length}>
        <HStack mb={2} alignItems="center">
          <FormLabel m={0}>Select role</FormLabel>
        </HStack>

        <Box maxW="sm">
          <StyledSelect
            name={name}
            ref={ref}
            options={options}
            value={options?.find((option) => option.value === value)}
            onChange={(selectedOption: SelectOption) => {
              if (!dirtyFields.name) {
                setValue("name", selectedOption?.label, { shouldDirty: false })
              }
              onChange(selectedOption?.value)
            }}
            onBlur={onBlur}
            isLoading={!options}
          />
        </Box>
        <FormErrorMessage>
          {errors.rolePlatforms?.[0]?.platformRoleId?.message}
        </FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel whiteSpace="normal">
          Should remove it from unauthenticated users..
        </FormLabel>
        <UnauthenticatedOptions />
      </FormControl>
    </Stack>
  )
}

export default ExistingRoleSettings
