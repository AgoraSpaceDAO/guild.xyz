import { Center, Spinner, ThemingProps } from "@chakra-ui/react"
import { RewardProps } from "components/[guild]/RoleCard/components/Reward"
import dynamic from "next/dynamic"
import {
  Buildings,
  DiscordLogo,
  EnvelopeSimple,
  GithubLogo,
  GoogleLogo,
  IconProps,
  PencilSimpleLine,
  TelegramLogo,
} from "phosphor-react"
import React, {
  ComponentType,
  ForwardRefExoticComponent,
  PropsWithChildren,
} from "react"
import Box from "static/icons/box.svg"
import Key from "static/icons/key.svg"
import Photo from "static/icons/photo.svg"
import Star from "static/icons/star.svg"
import XLogo from "static/icons/x.svg"
import { GuildPlatform, OneOf, PlatformName } from "types"
import fetcher from "utils/fetcher"
import ContractCallCardMenu from "./ContractCall/ContractCallCardMenu"
import ContractCallRewardCardButton from "./ContractCall/ContractCallRewardCardButton"
import useContractCallCardProps from "./ContractCall/useContractCallCardProps"
import DiscordCardMenu from "./Discord/DiscordCardMenu"
import DiscordCardSettings from "./Discord/DiscordCardSettings"
import useDiscordCardProps from "./Discord/useDiscordCardProps"
import FormCardLinkButton from "./Forms/FormCardLinkButton"
import FormCardMenu from "./Forms/FormCardMenu"
import useFormCardProps from "./Forms/useFormCardProps"
import GatherCardButton from "./Gather/GatherCardButton"
import GatherCardMenu from "./Gather/GatherCardMenu"
import useGatherCardProps from "./Gather/useGatherCardProps"
import GithubCardMenu from "./Github/GithubCardMenu"
import useGithubCardProps from "./Github/useGithubCardProps"
import GoogleCardMenu from "./Google/GoogleCardMenu"
import GoogleCardSettings from "./Google/GoogleCardSettings"
import GoogleCardWarning from "./Google/GoogleCardWarning"
import useGoogleCardProps from "./Google/useGoogleCardProps"
import PoapCardButton from "./Poap/PoapCardButton"
import PoapCardMenu from "./Poap/PoapCardMenu"
import usePoapCardProps from "./Poap/usePoapCardProps"
import usePointsCardProps from "./Points/usePointsCardProps"
import PolygonIDCardButton from "./PolygonID/PolygonIDCardButton"
import PolygonIDCardMenu from "./PolygonID/PolygonIDCardMenu"
import usePolygonIDCardProps from "./PolygonID/usePolygonIDCardProps"
import SecretTextCardMenu from "./SecretText/SecretTextCardMenu"
import TextCardButton from "./SecretText/TextCardButton"
import useSecretTextCardProps from "./SecretText/useSecretTextCardProps"
import TelegramCardMenu from "./Telegram/TelegramCardMenu"
import useTelegramCardProps from "./Telegram/useTelegramCardProps"
import UniqueTextCardMenu from "./UniqueText/UniqueTextCardMenu"
import useUniqueTextCardProps from "./UniqueText/useUniqueTextCardProps"
import PlatformPreview from "./components/PlatformPreview"

export enum PlatformAsRewardRestrictions {
  NOT_APPLICABLE, // e.g. Twitter
  SINGLE_ROLE, // e.g. Telegram
  MULTIPLE_ROLES, // e.g. Discord
}

export const CAPACITY_TIME_PLATFORMS: PlatformName[] = [
  "CONTRACT_CALL",
  "TEXT",
  "UNIQUE_TEXT",
  "POAP",
]

type PlatformData<
  OAuthParams extends {
    client_id?: string
    scope?: string | { membership: string; creation: string }
  } = {
    client_id?: string
    scope?: string | { membership: string; creation: string }
  } & Record<string, any>
> = {
  icon: ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>
  imageUrl?: string
  name: string
  colorScheme: ThemingProps["colorScheme"]
  gatedEntity: string
  cardPropsHook?: (guildPlatform: GuildPlatform) => {
    type: PlatformName
    name: string
    image?: string | JSX.Element
    info?: string | JSX.Element
    link?: string
  }
  // true when the AddPlatformPanel just automatically adds the platform without any user input
  autoPlatformSetup?: boolean
  cardSettingsComponent?: () => JSX.Element
  cardMenuComponent?: (props) => JSX.Element
  cardWarningComponent?: (props) => JSX.Element
  cardButton?: (props) => JSX.Element
  AddPlatformPanel?: ComponentType<{
    onSuccess: () => void
    skipSettings?: boolean
  }>
  PlatformPreview?: ComponentType<PropsWithChildren<unknown>>
  RoleCardComponent?: ComponentType<RewardProps>

  oauth?: {
    url: string
    params: OAuthParams

    // Probably only will be needed for Twitter v1. Once Twitter shuts it down, we will remove it, and this field can be removed as well
    oauthOptionsInitializer?: (redirectUri: string) => Promise<OAuthParams>
  }
} & OneOf<
  {
    asRewardRestriction: PlatformAsRewardRestrictions.NOT_APPLICABLE
  },
  {
    asRewardRestriction: Exclude<
      PlatformAsRewardRestrictions,
      PlatformAsRewardRestrictions.NOT_APPLICABLE
    >
    shouldShowKeepAccessesModal: boolean
  }
>

const AddPlatformPanelLoadingSpinner = () => (
  <Center w="full" h="51vh">
    <Spinner size="xl" thickness="4px" />
  </Center>
)

const platforms: Record<PlatformName, PlatformData> = {
  EMAIL: {
    icon: EnvelopeSimple,
    name: "Email",
    colorScheme: "gray",
    gatedEntity: "email",
    asRewardRestriction: PlatformAsRewardRestrictions.NOT_APPLICABLE,
  },
  TELEGRAM: {
    icon: TelegramLogo,
    imageUrl: "/platforms/telegram.png",
    name: "Telegram",
    colorScheme: "TELEGRAM",
    gatedEntity: "group",
    cardPropsHook: useTelegramCardProps,
    cardMenuComponent: TelegramCardMenu,
    asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
    shouldShowKeepAccessesModal: true,
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddTelegramPanel"
        ),
      {
        ssr: false,
        loading: AddPlatformPanelLoadingSpinner,
      }
    ),
    PlatformPreview: dynamic(() => import("platforms/components/TelegramPreview"), {
      ssr: false,
      loading: () => <PlatformPreview isLoading />,
    }),

    oauth: {
      url: process.env.NEXT_PUBLIC_TELEGRAM_POPUP_URL,
      params: {
        bot_id: process.env.NEXT_PUBLIC_TG_BOT_ID,
        origin: typeof window === "undefined" ? "https://guild.xyz" : window.origin,
        request_access: "write", // TODO
        lang: "en",

        // Used on our /tgAuth route to know where to postMessage the result (window.opener.origin is unavailable due to opener and the popup having different origins)
        openerOrigin:
          typeof window !== "undefined"
            ? window.location.origin
            : "https://guild.xyz",
      },
    },
  },
  DISCORD: {
    icon: DiscordLogo,
    imageUrl: "/platforms/discord.png",
    name: "Discord",
    colorScheme: "DISCORD",
    gatedEntity: "server",
    cardPropsHook: useDiscordCardProps,
    cardSettingsComponent: DiscordCardSettings,
    cardMenuComponent: DiscordCardMenu,
    asRewardRestriction: PlatformAsRewardRestrictions.MULTIPLE_ROLES,
    shouldShowKeepAccessesModal: true,
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddDiscordPanel"
        ),
      {
        ssr: false,
        loading: AddPlatformPanelLoadingSpinner,
      }
    ),
    PlatformPreview: dynamic(() => import("platforms/components/DiscordPreview"), {
      ssr: false,
      loading: () => <PlatformPreview isLoading />,
    }),

    oauth: {
      url: "https://discord.com/api/oauth2/authorize",
      params: {
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
        scope: "guilds identify guilds.members.read",
      },
    },
  },
  GITHUB: {
    icon: GithubLogo,
    imageUrl: "/platforms/github.png",
    name: "GitHub",
    colorScheme: "GITHUB",
    gatedEntity: "repo",
    cardPropsHook: useGithubCardProps,
    cardMenuComponent: GithubCardMenu,
    asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
    shouldShowKeepAccessesModal: true,
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddGithubPanel"
        ),
      {
        ssr: false,
        loading: AddPlatformPanelLoadingSpinner,
      }
    ),
    PlatformPreview: dynamic(() => import("platforms/components/GitHubPreview"), {
      ssr: false,
      loading: () => <PlatformPreview isLoading />,
    }),

    oauth: {
      url: "https://github.com/login/oauth/authorize",
      params: {
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        scope: {
          creation: "repo,read:user",
          membership: "repo:invite,read:user",
        },
      },
    },
  },
  TWITTER: {
    icon: XLogo,
    imageUrl: "/platforms/x.svg",
    name: "X",
    colorScheme: "TWITTER",
    gatedEntity: "account",
    asRewardRestriction: PlatformAsRewardRestrictions.NOT_APPLICABLE,

    oauth: {
      url: "https://twitter.com/i/oauth2/authorize",
      params: {
        client_id: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID,
        scope:
          "tweet.read users.read follows.read like.read list.read offline.access",
        code_challenge: "challenge",
        code_challenge_method: "plain",
      },
    },
  },
  TWITTER_V1: {
    icon: XLogo,
    name: "X",
    colorScheme: "TWITTER",
    gatedEntity: "account",
    asRewardRestriction: PlatformAsRewardRestrictions.NOT_APPLICABLE,

    oauth: {
      url: "https://api.twitter.com/oauth/authorize",
      params: {
        oauth_callback:
          typeof window === "undefined"
            ? "https://guild.xyz/oauth"
            : `${window.origin}/oauth`,
        x_auth_access_type: "read",
      },
      oauthOptionsInitializer: (callbackUrl) =>
        fetcher(
          `/api/twitter-request-token?callbackUrl=${encodeURIComponent(callbackUrl)}`
        ).then((oauth_token) => ({ oauth_token } as any)),
    },
  },
  GOOGLE: {
    icon: GoogleLogo,
    imageUrl: "/platforms/google.png",
    name: "Google Workspace",
    colorScheme: "blue",
    gatedEntity: "document",
    cardPropsHook: useGoogleCardProps,
    cardSettingsComponent: GoogleCardSettings,
    cardMenuComponent: GoogleCardMenu,
    cardWarningComponent: GoogleCardWarning,
    asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
    shouldShowKeepAccessesModal: true,
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddGooglePanel"
        ),
      {
        ssr: false,
        loading: AddPlatformPanelLoadingSpinner,
      }
    ),
    PlatformPreview: dynamic(() => import("platforms/components/GooglePreview"), {
      ssr: false,
      loading: () => <PlatformPreview isLoading />,
    }),

    oauth: {
      url: "https://accounts.google.com/o/oauth2/v2/auth",
      params: {
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: "openid email profile",
      },
    },
  },
  POAP: {
    icon: null,
    imageUrl: "/platforms/poap.png",
    name: "POAP",
    colorScheme: "purple",
    gatedEntity: "POAP",
    cardPropsHook: usePoapCardProps,
    cardButton: PoapCardButton,
    cardMenuComponent: PoapCardMenu,
    asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
    shouldShowKeepAccessesModal: false,
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddPoapPanel"
        ),
      {
        ssr: false,
      }
    ),
    PlatformPreview: dynamic(() => import("platforms/components/PoapPreview"), {
      ssr: false,
      loading: () => <PlatformPreview isLoading />,
    }),
    RoleCardComponent: dynamic(() => import("platforms/components/PoapReward"), {
      ssr: false,
    }),
  },
  CONTRACT_CALL: {
    icon: Photo,
    name: "NFT",
    colorScheme: "cyan",
    gatedEntity: "",
    cardPropsHook: useContractCallCardProps,
    cardButton: ContractCallRewardCardButton,
    cardMenuComponent: ContractCallCardMenu,
    asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
    shouldShowKeepAccessesModal: false,
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddContractCallPanel"
        ),
      {
        ssr: false,
        loading: AddPlatformPanelLoadingSpinner,
      }
    ),
    PlatformPreview: dynamic(
      () => import("platforms/components/ContractCallPreview"),
      {
        ssr: false,
        loading: () => <PlatformPreview isLoading />,
      }
    ),
    RoleCardComponent: dynamic(
      () => import("platforms/ContractCall/ContractCallReward"),
      {
        ssr: false,
      }
    ),
  },
  TEXT: {
    icon: Box,
    name: "Secret",
    colorScheme: "gray",
    gatedEntity: "",
    cardPropsHook: useSecretTextCardProps,
    cardButton: TextCardButton,
    cardMenuComponent: SecretTextCardMenu,
    asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
    shouldShowKeepAccessesModal: false,
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddSecretTextPanel"
        ),
      {
        ssr: false,
        loading: AddPlatformPanelLoadingSpinner,
      }
    ),
    PlatformPreview: dynamic(
      () => import("platforms/components/SecretTextPreview"),
      {
        ssr: false,
        loading: () => <PlatformPreview isLoading />,
      }
    ),
    RoleCardComponent: dynamic(() => import("platforms/components/TextReward"), {
      ssr: false,
    }),
  },
  UNIQUE_TEXT: {
    icon: Key,
    name: "Unique secret",
    colorScheme: "gray",
    gatedEntity: "",
    cardPropsHook: useUniqueTextCardProps,
    cardButton: TextCardButton,
    cardMenuComponent: UniqueTextCardMenu,
    asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
    shouldShowKeepAccessesModal: false,
    PlatformPreview: dynamic(
      () => import("platforms/components/UniqueTextPreview"),
      {
        ssr: false,
        loading: () => <PlatformPreview isLoading />,
      }
    ),
    RoleCardComponent: dynamic(() => import("platforms/components/TextReward"), {
      ssr: false,
    }),
  },
  POLYGON_ID: {
    icon: Key,
    imageUrl: "/requirementLogos/polygonId.svg",
    name: "PolygonID",
    colorScheme: "purple",
    gatedEntity: "",
    cardPropsHook: usePolygonIDCardProps,
    cardButton: PolygonIDCardButton,
    cardMenuComponent: PolygonIDCardMenu,
    asRewardRestriction: PlatformAsRewardRestrictions.MULTIPLE_ROLES,
    shouldShowKeepAccessesModal: false,
    autoPlatformSetup: true,
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddPolygonIDPanel"
        ),
      {
        ssr: false,
        loading: AddPlatformPanelLoadingSpinner,
      }
    ),
    PlatformPreview: dynamic(() => import("platforms/components/PolygonIDPreview"), {
      ssr: false,
      loading: () => <PlatformPreview isLoading />,
    }),
    RoleCardComponent: dynamic(
      () => import("platforms/components/PolygonIDReward"),
      {
        ssr: false,
      }
    ),
  },
  POINTS: {
    icon: Star,
    name: "Points",
    colorScheme: "gray",
    gatedEntity: "",
    asRewardRestriction: PlatformAsRewardRestrictions.MULTIPLE_ROLES,
    shouldShowKeepAccessesModal: false,
    cardPropsHook: usePointsCardProps,
    PlatformPreview: dynamic(() => import("platforms/components/PointsPreview"), {
      ssr: false,
      loading: () => <PlatformPreview isLoading />,
    }),
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddPointsPanel"
        ),
      {
        ssr: false,
        loading: AddPlatformPanelLoadingSpinner,
      }
    ),
    RoleCardComponent: dynamic(() => import("platforms/components/PointsReward"), {
      ssr: false,
    }),
  },
  FORM: {
    icon: PencilSimpleLine,
    name: "Form",
    colorScheme: "primary",
    gatedEntity: "",
    asRewardRestriction: PlatformAsRewardRestrictions.SINGLE_ROLE,
    shouldShowKeepAccessesModal: false,
    cardPropsHook: useFormCardProps,
    cardButton: FormCardLinkButton,
    cardMenuComponent: FormCardMenu,
    PlatformPreview: dynamic(() => import("platforms/components/FormPreview"), {
      ssr: false,
      loading: () => <PlatformPreview isLoading />,
    }),
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddFormPanel"
        ),
      {
        ssr: false,
        loading: AddPlatformPanelLoadingSpinner,
      }
    ),
    RoleCardComponent: dynamic(() => import("platforms/components/FormReward"), {
      ssr: false,
    }),
  },
  GATHER_TOWN: {
    icon: Buildings,
    imageUrl: "/platforms/gather.png",
    name: "Gather",
    colorScheme: "GATHER_TOWN",
    gatedEntity: "space",
    asRewardRestriction: PlatformAsRewardRestrictions.MULTIPLE_ROLES,
    shouldShowKeepAccessesModal: false,
    cardPropsHook: useGatherCardProps,
    cardButton: GatherCardButton,
    cardMenuComponent: GatherCardMenu,
    PlatformPreview: dynamic(() => import("platforms/components/GatherPreview"), {
      ssr: false,
      loading: () => <PlatformPreview isLoading />,
    }),
    AddPlatformPanel: dynamic(
      () =>
        import(
          "components/[guild]/RolePlatforms/components/AddRoleRewardModal/components/AddGatherPanel"
        ),
      {
        ssr: false,
        loading: AddPlatformPanelLoadingSpinner,
      }
    ),
    RoleCardComponent: dynamic(() => import("platforms/components/GatherReward"), {
      ssr: false,
    }),
  },
}

export default platforms
