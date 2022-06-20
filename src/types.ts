type Token = {
  address: string
  name: string
  symbol: string
  decimals: number
}

type DiscordError = { error: string; errorDescription: string }

type WalletError = { code: number; message: string }

type Rest = {
  [x: string]: any
}

type Logic = "AND" | "OR" | "NOR" | "NAND"

type ThemeMode = "LIGHT" | "DARK"

type Theme = {
  color?: string
  mode?: ThemeMode
  backgroundImage?: string
  backgroundCss?: string
}

type CoingeckoToken = {
  chainId: number
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: string
}

type Poap = {
  id: number
  fancy_id: string
  name: string
  event_url?: string
  image_url: string
  country?: string
  city?: string
  description?: string
  year: number
  start_date: string
  end_date: string
  expiry_date: string
  from_admin: boolean
  virtual_event: boolean
  event_template_id: number
  event_host_id: number
}

type NFT = {
  name: string
  type: string
  address: string
  logoUri: string
  slug: string
}

type RequirementType =
  | "COIN"
  | "ERC20"
  | "ERC721"
  | "ERC1155"
  | "POAP"
  | "MIRROR"
  | "UNLOCK"
  | "SNAPSHOT"
  | "JUICEBOX"
  | "ALLOWLIST"
  | "FREE"

type SupportedChains =
  | "ETHEREUM"
  | "POLYGON"
  | "GNOSIS"
  | "BSC"
  | "AVALANCHE"
  | "FANTOM"
  | "BSC"
  | "OPTIMISM"
  | "MOONRIVER"
  | "RINKEBY"
  | "METIS"
  | "CRONOS"
  | "BOBA"

type Requirement = {
  // Basic props
  type: RequirementType
  chain: SupportedChains
  address?: string
  data?: {
    hideAllowlist?: boolean
    minAmount?: number
    maxAmount?: number
    addresses?: Array<string> // (ALLOWLIST)
    id?: string // fancy_id (POAP), edition id (MIRROR), id of the project (JUICEBOX)
    strategy?: {
      name: string
      params: Record<string, any>
    } // SNAPSHOT
    attribute?: {
      trait_type?: string
      value?: string
      interval?: {
        min: number
        max: number
      }
    }
  }
  // Props used inside the forms on the UI
  id?: string
  active?: boolean
  nftRequirementType?: string
  // These props are only used when we fetch requirements from the backend and display them on the UI
  roleId?: number
  symbol?: string
  name?: string
  decimals?: number
}

type NftRequirementType = "AMOUNT" | "ATTRIBUTE" | "CUSTOM_ID"

type GuildFormType = {
  discordRoleId?: string
  chainName?: SupportedChains
  name?: string
  urlName?: string
  imageUrl?: string
  customImage?: string
  description?: string
  logic: Logic
  requirements: Array<Requirement>
  platform?: PlatformName
  discord_invite?: string
  channelId?: string
  isGuarded?: boolean
  DISCORD?: { platformId?: string }
  TELEGRAM?: { platformId?: string }
}

type PlatformName = "TELEGRAM" | "DISCORD" | ""

type Platform = {
  id: number
  type: PlatformName
  platformName: string
  platformId: string
  isGuarded: boolean
}

type User =
  | {
      id: number
      addresses: number
      telegramId?: boolean
      discordId?: boolean
      discord?: null
      telegram?: null
    }
  | {
      id: number
      addresses: Array<string>
      telegramId?: string
      discordId?: string
      discord?: {
        username: string
        avatar: string
      }
      telegram?: {
        username: string
        avatar: string
      }
    }

type Role = {
  id: number
  name: string
  description?: string
  imageUrl?: string
  owner?: User
  requirements: Array<Requirement>
  members?: Array<string>
  memberCount: number
  logic?: Logic
  platforms: Array<{
    discordRoleId: string
    inviteChannel: string
    platformId: number
    roleId: number
  }>
}

type GuildBase = {
  name: string
  urlName: string
  imageUrl: string
  roles: Array<string>
  platforms: Array<PlatformName>
  memberCount: number
}

type GuildAdmin = {
  id: number
  address: string
  isOwner: boolean
}

type GuildPoap = {
  id: number
  poapIdentifier: number
  fancyId: string
  activated: boolean
}

type Guild = {
  id: number
  name: string
  urlName: string
  imageUrl: string
  description?: string
  platforms: Platform[]
  theme?: Theme
  members: Array<string>
  showMembers?: boolean
  admins?: GuildAdmin[]
  roles: Array<Role>
  hideFromExplorer?: boolean
  poaps: Array<GuildPoap>
}

enum RequirementTypeColors {
  ERC721 = "var(--chakra-colors-green-400)",
  ERC1155 = "var(--chakra-colors-green-400)",
  POAP = "var(--chakra-colors-blue-400)",
  MIRROR = "var(--chakra-colors-gray-300)",
  ERC20 = "var(--chakra-colors-indigo-400)",
  COIN = "var(--chakra-colors-indigo-400)",
  SNAPSHOT = "var(--chakra-colors-orange-400)",
  ALLOWLIST = "var(--chakra-colors-gray-200)",
  UNLOCK = "var(--chakra-colors-salmon-400)",
  JUICEBOX = "var(--chakra-colors-yellow-500)",
  FREE = "var(--chakra-colors-cyan-400)",
}

type SnapshotStrategy = {
  name: string
  params: Record<string, Record<string, string>>
}

type JuiceboxProject = {
  id: string
  uri: string
  name: string
  logoUri: string
}

type MirrorEdition = {
  editionContractAddress: string
  editionId: number
  title: string
  image: string
}

type SelectOption = {
  label: string
  value: string
  img?: string
} & Rest

// Requested with Discord OAuth token
type DiscordServerData = {
  id: string
  name: string
  icon: string
  owner: boolean
  permissions: number
  features: string[]
  permissions_new: string
}

type CreatePoapForm = {
  name: string
  description: string
  city: string
  country: string
  start_date: string
  end_date: string
  expiry_date: string
  year: number
  event_url: string
  virtual_event: boolean
  image: File
  secret_code: number
  event_template_id: number
  email: string
  requested_codes: number
  private_event: boolean
}

type CreatedPoapData = {
  id?: number
  fancy_id?: string
  name: string
  description: string
  city: string
  country: string
  start_date: string
  end_date: string
  expiry_date: string
  year: number
  event_url: string
  virtual_event: boolean
  image_url?: string
  event_template_id: number
  private_event: boolean
  event_host_id?: number
}

type WalletConnectConnectionData = {
  connected: boolean
  accounts: string[]
  chainId: number
  bridge: string
  key: string
  clientId: string
  clientMeta: {
    description: string
    url: string
    icons: string[]
    name: string
  }
  peerId: string
  peerMeta: {
    description: string
    url: string
    icons: string[]
    name: string
  }
  handshakeId: number
  handshakeTopic: string
}

type WindowTelegram = {
  Login: {
    auth: (
      options: {
        bot_id: string
        request_access?: string
        lang?: string
      },
      callback: (
        dataOrFalse:
          | {
              auth_date: number
              first_name: string
              hash: string
              id: number
              last_name: string
              username: string
            }
          | false
      ) => void
    ) => void
  }
}

export type {
  WalletConnectConnectionData,
  DiscordServerData,
  GuildAdmin,
  Token,
  DiscordError,
  WalletError,
  Rest,
  CoingeckoToken,
  Poap,
  User,
  NFT,
  PlatformName,
  Role,
  Platform,
  GuildBase,
  Guild,
  Requirement,
  RequirementType,
  SupportedChains,
  SnapshotStrategy,
  JuiceboxProject,
  MirrorEdition,
  ThemeMode,
  Logic,
  SelectOption,
  NftRequirementType,
  GuildFormType,
  CreatePoapForm,
  CreatedPoapData,
  WindowTelegram,
}
export { RequirementTypeColors }
