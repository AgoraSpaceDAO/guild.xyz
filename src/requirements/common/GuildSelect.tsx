import {
  FormControl,
  FormHelperText,
  FormLabel,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react"
import useGuild from "components/[guild]/hooks/useGuild"
import ControlledSelect from "components/common/ControlledSelect"
import FormErrorMessage from "components/common/FormErrorMessage"
import OptionImage from "components/common/StyledSelect/components/CustomSelectOption/components/OptionImage"
import useDebouncedState from "hooks/useDebouncedState"
import { useMemo, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Guild } from "types"
import parseFromObject from "utils/parseFromObject"
import useGuilds from "../Guild/hooks/useGuilds"

const customFilterOption = (candidate, input) =>
  candidate.label.toLowerCase().includes(input?.toLowerCase()) ||
  candidate.data?.details?.includes(input?.replace("https://guild.xyz/", ""))

const convertGuildToOption = (guild: Guild) => ({
  img: guild.imageUrl,
  label: guild.name,
  value: guild.id,
  details: guild.urlName,
})

const GUILD_URL_REGEX = /^[a-z0-9\-]*$/i

const GuildSelect = ({ baseFieldPath }) => {
  const {
    resetField,
    formState: { errors },
  } = useFormContext()

  const [searchValue, setSearchValue] = useState("")
  const debouncedSearchValue = useDebouncedState(searchValue)

  const { data: guildOptions, isValidating: isGuildsLoading } =
    useGuilds(debouncedSearchValue)
  const { isLoading, ...currentGuild } = useGuild()

  const selectedGuildId = useWatch({ name: `${baseFieldPath}.data.guildId` })
  const { isLoading: isSelectedGuildLoading, ...selectedGuild } =
    useGuild(selectedGuildId)

  const mergedGuildOptions = useMemo(() => {
    let options = []

    if (currentGuild) {
      options = [convertGuildToOption(currentGuild)]
    }
    if (selectedGuildId && selectedGuild && currentGuild.id !== selectedGuildId) {
      options = [convertGuildToOption(selectedGuild), ...options]
    }
    if (guildOptions) {
      options = options.concat(
        guildOptions.filter(
          (option) =>
            option.value !== currentGuild?.id && option.value !== selectedGuildId
        )
      )
    }

    return options
  }, [guildOptions, currentGuild])

  return (
    <FormControl
      isRequired
      isInvalid={!!parseFromObject(errors, baseFieldPath)?.data?.guildId?.message}
    >
      <FormLabel>Guild</FormLabel>

      <InputGroup>
        {selectedGuildId && selectedGuild?.imageUrl && (
          <InputLeftElement>
            <OptionImage img={selectedGuild?.imageUrl} alt={selectedGuild?.name} />
          </InputLeftElement>
        )}
        <ControlledSelect
          name={`${baseFieldPath}.data.guildId`}
          rules={{
            required: "Please select a guild",
            pattern: {
              value: GUILD_URL_REGEX,
              message: "Please input a valid Guild URL",
            },
          }}
          isLoading={isGuildsLoading || isLoading}
          options={mergedGuildOptions}
          beforeOnChange={() => resetField(`${baseFieldPath}.data.roleId`)}
          onInputChange={(newValue) => setSearchValue(newValue)}
          filterOption={customFilterOption}
        />
      </InputGroup>

      <FormHelperText>Select a guild or paste guild URL name</FormHelperText>

      <FormErrorMessage>
        {parseFromObject(errors, baseFieldPath)?.data?.guildId?.message}
      </FormErrorMessage>
    </FormControl>
  )
}

export default GuildSelect
