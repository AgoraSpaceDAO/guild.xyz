import type { Chain } from "connectors"

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

type GitPoap = {
  gitPoapEventId: number
  poapEventId: number
  poapEventFancyId: string
  name: string
  year: number
  description: string
  imageUrl: string
  repositories: string[]
  mintedCount: number
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
  | "CONTRACT"
  | "POAP"
  | "GITPOAP"
  | "MIRROR"
  | "MIRROR_COLLECT"
  | "UNLOCK"
  | "SNAPSHOT"
  | "JUICEBOX"
  | "GALAXY"
  | "ALLOWLIST"
  | "FREE"
  | "TWITTER"
  | "TWITTER_FOLLOW"
  | "TWITTER_NAME"
  | "TWITTER_BIO"
  | "TWITTER_FOLLOWER_COUNT"
  | "GITHUB"
  | "GITHUB_STARRING"
  | "NOUNS"
  | "DISCORD"
  | "DISCORD_ROLE"
  | "DISCORD_MEMBER_SINCE"
  | "DISCORD_JOIN"
  | "DISCORD_JOIN_FROM_NOW"
  | "NOOX"
  | "DISCO"
  | "LENS"
  | "LENS_PROFILE"
  | "LENS_FOLLOW"
  | "LENS_COLLECT"
  | "LENS_MIRROR"
  | "OTTERSPACE"
  | "ORANGE"
  | "CASK"
  | "101"
  | "RABBITHOLE"
  | "KYC_DAO"
  | "SOUND"
  | "SOUND_ARTIST_BACKED"
  | "SOUND_COLLECTED"
  | "SOUND_ARTIST"
  | "SOUND_TOP_COLLECTOR"
  | "GUILD"
  | "GUILD_ROLE"
  | "GUILD_ADMIN"
  | "GUILD_USER_SINCE"
  | "GUILD_MINGUILDS"

type NftRequirementType = "AMOUNT" | "ATTRIBUTE" | "CUSTOM_ID"

type PlatformName = "TELEGRAM" | "DISCORD" | "GITHUB" | "TWITTER" | "GOOGLE"

type PlatformAccount = {
  platformId: number
  platformName: PlatformName
}
type PlatformAccountDetails = PlatformAccount & {
  platformUserId: string
  username: string
  avatar: string
  platformUserData?: Record<string, any> // TODO: better types once we decide which properties will we store in this object on the backend
}

type User = {
  id: number
  addresses: Array<string>
  platformUsers: PlatformAccountDetails[]
  signingKey?: string
  isSuperAdmin: boolean
}

type GuildBase = {
  id: number
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

type PlatformGuildData = {
  DISCORD: {
    role?: never
    inviteChannel: string
    invite?: string
    joinButton?: boolean
    mimeType?: never
    iconLink?: never
  }
  GOOGLE: {
    role?: "reader" | "commenter" | "writer"
    inviteChannel?: never
    joinButton?: never
    mimeType?: string
    iconLink?: string
  }
}

type PlatformRoleData = {
  DISCORD: {
    isGuarded: boolean
    role?: never
  }
  GOOGLE: {
    isGuarded?: never
    role: "reader" | "commenter" | "writer"
  }
}

type ContractParamType = string[]

type DiscoParamType = {
  credType: string
  credIssuence: "before" | "after"
  credIssuenceDate: string
  credIssuer: string
}

type RabbitholeParamType = {
  trait_type: string
  value: string
}[]

type Requirement = {
  id: number
  data?: {
    hideAllowlist?: boolean
    minAmount?: number
    maxAmount?: number
    addresses?: Array<string> // (ALLOWLIST)
    id?: string // fancy_id (POAP), edition id (MIRROR), id of the project (JUICEBOX)
    name?: string
    provider?: string
    planId?: number
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
    galaxyId?: string
    // Discord
    serverId?: string
    roleId?: string | number
    serverName?: string
    roleName?: string
    memberSince?: number
    fromNow?: boolean
    // CONTRACT
    expected?: string
    resultIndex?: number
    resultMatch?: string
    title?: string
    params?: ContractParamType | DiscoParamType | RabbitholeParamType
    // GUILD
    guildId?: string
    creationDate?: string
  }
  name: string
  type: RequirementType
  chain: Chain
  roleId: number
  symbol: string
  address: string
  decimals?: number

  // Props used inside the forms on the UI
  active?: boolean
  nftRequirementType?: string

  // These props are only used when we fetch requirements from the backend and display them on the UI
  balancyDecimals?: number
}

type RolePlatform = {
  platformRoleId?: string
  guildPlatformId?: number
  guildPlatform?: GuildPlatform
  index?: number
  isNew?: boolean
  roleId?: number
  platformRoleData?: PlatformRoleData[keyof PlatformRoleData]
}

type Role = {
  id: number
  name: string
  logic: Logic
  members: string[]
  imageUrl?: string
  description?: string
  memberCount: number
  requirements: Requirement[]
  rolePlatforms: RolePlatform[]
}

type GuildPlatform = {
  id: number
  platformId: PlatformType
  platformName?: PlatformName
  platformGuildId: string
  platformGuildData?: PlatformGuildData[keyof PlatformGuildData]
  invite?: string
  platformGuildName: string
}

type PoapContract = {
  id: number
  poapId: number
  chainId: number
  vaultId: number
  contract: string
}

type GuildPoap = {
  id: number
  poapIdentifier: number
  fancyId: string
  activated: boolean
  expiryDate: number
  poapContracts?: PoapContract[]
}

type Guild = {
  id: number
  name: string
  urlName: string
  description?: string
  imageUrl: string
  showMembers: boolean
  memberCount: number
  hideFromExplorer: boolean
  createdAt: string
  admins: GuildAdmin[]
  theme: Theme
  guildPlatforms: GuildPlatform[]
  roles: Role[]
  members: Array<string>
  poaps: Array<GuildPoap>
  onboardingComplete: boolean
}
type GuildFormType = Partial<
  Pick<Guild, "id" | "urlName" | "name" | "imageUrl" | "description" | "theme">
> & {
  guildPlatforms?: (Partial<GuildPlatform> & { platformName: string })[]
  roles?: Array<
    Partial<
      Omit<Role, "requirements" | "rolePlatforms"> & {
        requirements: Array<Partial<Requirement>>
        rolePlatforms: Array<Partial<RolePlatform> & { guildPlatformIndex: number }>
      }
    >
  >
  logic?: Logic
  requirements?: Requirement[]
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

type SelectOption<T = string> = {
  label: string
  value: T
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

export enum PlatformType {
  "UNSET" = -1,
  "DISCORD" = 1,
  "TELEGRAM" = 2,
  "GITHUB" = 3,
  "GOOGLE" = 4,
  "TWITTER" = 5,
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

enum ValidationMethod {
  STANDARD = 1,
  KEYPAIR = 2,
  EIP1271 = 3,
}

type GalaxyCampaign = {
  id: string
  numberID: number
  name: string
  thumbnail: string
  chain: Chain
}

type MonetizePoapForm = {
  chainId: number
  token: string
  fee: number
  owner: string
}

type RequestMintLinksForm = {
  event_id: number
  requested_codes: number
  secret_code: string
  redeem_type: string
}

type GoogleFile = {
  name: string
  mimeType: string
  webViewLink: string
  iconLink: string
  platformGuildId: string
}

type VoiceParticipationForm = {
  poapId: number
  voiceChannelId: string
  voiceRequirement: {
    type: "PERCENT" | "MINUTE"
    percentOrMinute: number
  }
}

type VoiceRequirement =
  | {
      percent: number
      minute?: never
    }
  | {
      percent?: never
      minute: number
    }

type PoapEventDetails = {
  id: number
  poapIdentifier: number
  fancyId: string
  guildId: number
  activated: boolean
  createdAt: string
  expiryDate: number
  voiceChannelId?: string
  voiceRequirement?: VoiceRequirement
  voiceEventStartedAt: number
  voiceEventEndedAt: number
  contracts: PoapContract[]
}

type VoiceRequirementParams = {
  poapId: number
  voiceChannelId: string
  voiceRequirement: VoiceRequirement
  voiceEventStartedAt?: number
}

type FormCardProps = {
  baseFieldPath: string
  field?: Requirement
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
  GitPoap,
  PoapContract,
  GuildPoap,
  User,
  NFT,
  Role,
  GuildPlatform,
  GuildBase,
  Guild,
  Requirement,
  RequirementType,
  SnapshotStrategy,
  JuiceboxProject,
  MirrorEdition,
  RolePlatform,
  ThemeMode,
  Logic,
  PlatformAccountDetails,
  SelectOption,
  NftRequirementType,
  GuildFormType,
  CreatePoapForm,
  CreatedPoapData,
  PlatformName,
  GalaxyCampaign,
  MonetizePoapForm,
  RequestMintLinksForm,
  GoogleFile,
  VoiceRequirement,
  VoiceParticipationForm,
  VoiceRequirementParams,
  PoapEventDetails,
  ContractParamType,
  DiscoParamType,
  FormCardProps,
  RabbitholeParamType,
}
export { ValidationMethod }
