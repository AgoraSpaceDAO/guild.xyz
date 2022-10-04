import {
  Collapse,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
} from "@chakra-ui/react"
import StyledSelect from "components/common/StyledSelect"
import useGateables from "hooks/useGateables"
import useServerData from "hooks/useServerData"
import {
  useController,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form"
import shortenHex from "utils/shortenHex"

type Props = {
  index: number
}

const DiscordRole = ({ index }: Props) => {
  const { errors } = useFormState()
  const { register, setValue } = useFormContext()

  const { field: serverField } = useController({
    name: `requirements.${index}.data.discord.serverId`,
    rules: {
      required: "Please select a server",
      pattern: {
        value: /^[0-9]*$/i,
        message: "Please input a valid Discord server id",
      },
    },
  })

  const { field: roleField } = useController({
    name: `requirements.${index}.data.discord.roleId`,
    rules: {
      required: "Please select a role",
    },
  })

  const { gateables, isLoading } = useGateables("DISCORD")

  const serverOptions = (gateables ?? []).map(({ img, name, id }) => ({
    value: id,
    img,
    label: name,
  }))

  const selectedServer = serverOptions.find(
    (reqType) => reqType.value === serverField.value
  )

  const isUnknownServer = !!serverField.value && !selectedServer

  const serverName = useWatch({
    name: `requirements.${index}.data.discord.serverName`,
  })

  const {
    data: { roles },
    isLoading: isServerDataLoading,
  } = useServerData(selectedServer?.value)

  const roleOptions = (roles ?? []).map(({ id, name }) => ({
    label: name,
    value: id,
    details: shortenHex(id),
  }))

  const selectedRole = roleOptions.find(
    (reqType) => reqType.value === roleField.value
  )

  const isUnknownRole = !!roleField.value && !selectedRole

  return (
    <>
      <FormControl
        isRequired
        isInvalid={!!errors?.requirements?.[index]?.data?.discord?.serverId?.message}
      >
        <FormLabel>Server</FormLabel>
        <StyledSelect
          isCreatable
          isLoading={isLoading}
          options={serverOptions}
          name={serverField.name}
          onBlur={serverField.onBlur}
          onChange={(newValue: {
            label: string
            value: string
            __isNew__?: boolean
          }) => {
            if (!newValue?.__isNew__) {
              setValue(
                `requirements.${index}.data.discord.serverName`,
                newValue?.label
              )
            } else {
              setValue(`requirements.${index}.data.discord.serverName`, undefined)
            }
            serverField.onChange(newValue?.value)
          }}
          ref={serverField.ref}
          value={selectedServer}
        />

        <FormHelperText>Select a server or paste a server id</FormHelperText>

        <FormErrorMessage>
          {errors?.requirements?.[index]?.data?.discord?.serverId?.message}
        </FormErrorMessage>
      </FormControl>

      <Collapse in={isUnknownServer}>
        <FormControl
          isRequired
          isInvalid={
            !!errors?.requirements?.[index]?.data?.discord?.serverName?.message
          }
        >
          <FormLabel>Server name</FormLabel>
          <Input
            {...register(`requirements.${index}.data.discord.serverName`, {
              required: isUnknownServer && "Please provide a server name",
            })}
          />

          <FormErrorMessage>
            {errors?.requirements?.[index]?.data?.discord?.serverName?.message}
          </FormErrorMessage>

          <FormHelperText>
            Future members will see this name in the requirement
          </FormHelperText>
        </FormControl>
      </Collapse>

      <FormControl
        isRequired
        isDisabled={
          !selectedServer &&
          (!serverField.value ||
            typeof serverName !== "string" ||
            serverName?.length <= 0 ||
            !!errors?.requirements?.[index]?.data?.discord?.serverName?.message ||
            !!errors?.requirements?.[index]?.data?.discord?.serverId?.message)
        }
        isInvalid={!!errors?.requirements?.[index]?.data?.discord?.roleId?.message}
      >
        <FormLabel>Role</FormLabel>
        <StyledSelect
          noOptionsMessage={() => null}
          isCreatable
          isLoading={isServerDataLoading}
          options={roleOptions}
          name={roleField.name}
          onBlur={roleField.onBlur}
          onChange={(newValue: {
            label: string
            value: string
            __isNew__?: boolean
          }) => {
            if (!newValue?.__isNew__) {
              setValue(
                `requirements.${index}.data.discord.roleName`,
                newValue?.label
              )
            } else {
              setValue(`requirements.${index}.data.discord.roleName`, undefined)
            }
            roleField.onChange(newValue?.value)
          }}
          ref={roleField.ref}
          value={selectedRole}
        />

        <FormErrorMessage>
          {errors?.requirements?.[index]?.data?.discord?.roleId?.message}
        </FormErrorMessage>

        <FormHelperText>Select a role or paste a role id</FormHelperText>
      </FormControl>

      <Collapse in={isUnknownRole}>
        <FormControl
          isRequired
          isInvalid={
            !!errors?.requirements?.[index]?.data?.discord?.roleName?.message
          }
        >
          <FormLabel>Role name</FormLabel>
          <Input
            {...register(`requirements.${index}.data.discord.roleName`, {
              required: isUnknownRole && "Please provide a role name",
            })}
          />

          <FormErrorMessage>
            {errors?.requirements?.[index]?.data?.discord?.roleName?.message}
          </FormErrorMessage>

          <FormHelperText>
            Future members will see this name as the requirement
          </FormHelperText>
        </FormControl>
      </Collapse>
    </>
  )
}

export default DiscordRole
