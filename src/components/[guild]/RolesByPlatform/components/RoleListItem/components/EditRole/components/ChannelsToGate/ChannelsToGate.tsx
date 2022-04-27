import {
  Button,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react"
import useServerData from "components/create-guild/PickRolePlatform/components/Discord/hooks/useServerData"
import useGuild from "components/[guild]/hooks/useGuild"
import { CaretDown } from "phosphor-react"
import { useEffect, useMemo } from "react"
import { useFormContext, useFormState, useWatch } from "react-hook-form"
import Category, { GatedChannels } from "./components/Category"

type Props = {
  authorization: string
  roleId: string
}

/**
 * Passing authToken here, and pass it again to useServerData won't be necessary once
 * we have the localstorage solution
 */
const ChannelsToGate = ({ authorization, roleId }: Props) => {
  const { platforms } = useGuild()
  const {
    data: { categories },
  } = useServerData(platforms?.[0]?.platformId, {
    authorization,
  })

  const { setValue } = useFormContext()
  const { touchedFields } = useFormState()

  const gatedChannels = useWatch<{ gatedChannels: GatedChannels }>({
    name: "gatedChannels",
    defaultValue: {},
  })

  useEffect(() => {
    if (!categories || categories.length <= 0) return

    setValue(
      "gatedChannels",
      Object.fromEntries(
        categories.map(({ channels, id, name }) => [
          id,
          {
            name,
            channels: Object.fromEntries(
              (channels ?? []).map((channel) => [
                channel.id,
                {
                  name: channel.name,
                  isChecked: touchedFields.gatedChannels?.[id]?.channels?.[
                    channel.id
                  ]
                    ? gatedChannels?.[id]?.channels?.[channel.id]?.isChecked
                    : channel.roles.includes(roleId),
                },
              ])
            ),
          },
        ])
      )
    )
  }, [categories, roleId])

  const numOfGatedChannels = useMemo(
    () =>
      Object.values(gatedChannels)
        .flatMap(
          ({ channels }) =>
            Object.values(channels).map(({ isChecked }) => +isChecked) ?? []
        )
        .reduce((acc, curr) => acc + curr, 0),
    [gatedChannels]
  )

  return (
    <Popover matchWidth>
      <PopoverTrigger>
        <Button
          rightIcon={<CaretDown />}
          h="12"
          justifyContent={"space-between"}
          w="full"
        >
          {numOfGatedChannels} channels gated
        </Button>
      </PopoverTrigger>

      <PopoverContent
        w="auto"
        borderRadius={"lg"}
        shadow="xl"
        maxH="sm"
        overflowY="auto"
      >
        <PopoverBody>
          {Object.keys(gatedChannels).map((categoryId) => (
            <Category key={categoryId} categoryId={categoryId} />
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default ChannelsToGate
