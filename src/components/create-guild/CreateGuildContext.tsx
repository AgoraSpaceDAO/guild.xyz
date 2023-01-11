import { useSteps } from "chakra-ui-steps"
import { useRouter } from "next/router"
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { GuildFormType, PlatformName, PlatformType } from "types"
import capitalize from "utils/capitalize"
import getRandomInt from "utils/getRandomInt"
import BasicInfo from "./BasicInfo"
import ChooseLayout from "./ChooseLayout"
import CreateGuildIndex from "./CreateGuildIndex"

type Step = {
  label: string
  description?: string
  content: JSX.Element
}

const CreateGuildContext = createContext<{
  layout: string | undefined
  setLayout: Dispatch<SetStateAction<string>>
  steps: Step[]
  prevStep: () => void
  nextStep: () => void
  setStep: (step: number) => void
  activeStep: number
  platform?: PlatformName
  createDiscordRoles: boolean
  setCreateDiscordRoles: Dispatch<SetStateAction<boolean>>
} | null>(null)

const getPlatformFromQueryParam = (queryParam: string): PlatformName | null => {
  if (!queryParam) return null

  const uppercasePlatform = queryParam.toUpperCase()
  if (PlatformType[uppercasePlatform]) return uppercasePlatform as PlatformName

  return null
}

const defaultIcon = `/guildLogos/${getRandomInt(286)}.svg`
const basicDefaultValues: GuildFormType = {
  name: "",
  description: "",
  imageUrl: defaultIcon,
}
export const defaultValues: Partial<
  Record<PlatformName | "DEFAULT", GuildFormType>
> = {
  DISCORD: {
    ...basicDefaultValues,
    guildPlatforms: [
      {
        platformName: "DISCORD",
        platformGuildId: "",
      },
    ],
  },
  TELEGRAM: {
    ...basicDefaultValues,
    guildPlatforms: [
      {
        platformName: "TELEGRAM",
        platformGuildId: "",
      },
    ],
  },
  GITHUB: {
    ...basicDefaultValues,
    guildPlatforms: [
      {
        platformName: "GITHUB",
        platformGuildId: "",
      },
    ],
  },
  GOOGLE: {
    ...basicDefaultValues,
    guildPlatforms: [
      {
        platformName: "GOOGLE",
        platformGuildId: "",
      },
    ],
  },
  DEFAULT: basicDefaultValues,
}

const CreateGuildProvider = ({
  children,
}: PropsWithChildren<unknown>): JSX.Element => {
  const router = useRouter()
  const platform = getPlatformFromQueryParam(router.query.platform?.toString())

  const { prevStep, nextStep, setStep, activeStep } = useSteps({
    initialStep: 0,
  })

  const methods = useForm<GuildFormType>({ mode: "all" })
  const guildName = useWatch({ control: methods.control, name: "name" })

  const [createDiscordRoles, setCreateDiscordRoles] = useState(false)
  const [layout, setLayout] = useState<string>()

  const steps: Step[] = [
    {
      label: "Choose platform",
      description: `${capitalize(platform?.toLowerCase() ?? "Without platform")}${
        guildName ? ` - ${guildName}` : ""
      }`,
      content: <CreateGuildIndex />,
    },
    {
      label: "Choose layout",
      description: capitalize(layout?.toLowerCase() ?? ""),
      content: <ChooseLayout />,
    },
    {
      label: "Basic information",
      content: <BasicInfo />,
    },
  ]

  useEffect(() => {
    if (activeStep > 0) return
    methods.reset(defaultValues[platform])
    setLayout(null)
  }, [platform])

  useEffect(() => {
    if (activeStep === 0 && !platform) methods.reset(defaultValues.DEFAULT)
  }, [activeStep])

  return (
    <CreateGuildContext.Provider
      value={{
        steps,
        prevStep,
        nextStep,
        setStep,
        activeStep,
        platform,
        layout,
        setLayout,
        createDiscordRoles,
        setCreateDiscordRoles,
      }}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </CreateGuildContext.Provider>
  )
}

const useCreateGuildContext = () => useContext(CreateGuildContext)

export { CreateGuildProvider, useCreateGuildContext }
