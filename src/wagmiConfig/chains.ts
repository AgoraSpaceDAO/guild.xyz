import {
  beraTestnet,
  bitfinityTestnet,
  bobaAvax,
  exosama,
  form,
  ink,
  inkSepolia,
  metisSepolia,
  mint,
  neonEVM,
  oasisSapphire,
  ontology,
  palm,
  scrollAlpha,
  taikoKatlaTestnet,
  x1,
  zero,
} from "static/customChains"
import {
  type Chain as ViemChain,
  arbitrum,
  arbitrumNova,
  astarZkEVM,
  avalanche,
  base,
  baseGoerli,
  baseSepolia,
  blast,
  blastSepolia,
  boba,
  bsc,
  celo,
  coreDao,
  cronos,
  cronoszkEVM,
  cyber,
  evmos,
  fantom,
  filecoin,
  gnosis,
  goerli,
  harmonyOne,
  iota,
  iotex,
  kava,
  klaytn,
  linea,
  lisk,
  liskSepolia,
  lukso,
  mainnet,
  manta,
  mantle,
  metis,
  mode,
  moonbeam,
  moonriver,
  opBNB,
  optimism,
  pgn,
  polygon,
  polygonZkEvm,
  ronin,
  rootstock,
  scroll,
  scrollSepolia,
  sei,
  sepolia,
  shimmer,
  sonic,
  sophon,
  taiko,
  worldchain,
  x1Testnet,
  xdc,
  zetachain,
  zetachainAthensTestnet,
  zkSync,
  zora,
} from "wagmi/chains"
type GuildChain = {
  id: number
  name: string
  iconUrl: string
  nativeCurrency: ViemChain["nativeCurrency"] & { iconUrl: string }
  blockExplorerUrl: string
  blockExplorerIconUrl: {
    light: string
    dark: string
  }
  etherscanApiUrl?: string
  deprecated?: boolean
}

const generateChainConfig = (
  chain: ViemChain,
  nativeCurrencyIconUrl: string
): Omit<GuildChain, "iconUrl" | "blockExplorerIconUrl" | "etherscanApiUrl"> => ({
  id: chain.id,
  name: chain.name,
  nativeCurrency: {
    ...chain.nativeCurrency,
    iconUrl: nativeCurrencyIconUrl,
  },
  blockExplorerUrl: chain.blockExplorers?.default.url ?? "",
})

const ETH_ICON =
  "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880"
const MATIC_ICON =
  "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png"
const BNB_ICON =
  "https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png"

const CHAIN_CONFIG: Record<Chain, GuildChain> = {
  ETHEREUM: {
    ...generateChainConfig(mainnet, ETH_ICON),
    iconUrl: "/networkLogos/ethereum.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/etherscan-light.svg",
      dark: "/explorerLogos/etherscan-dark.svg",
    },
    etherscanApiUrl: "https://api.etherscan.io",
  },
  SEPOLIA: {
    ...generateChainConfig(sepolia, ETH_ICON),
    iconUrl: "/networkLogos/ethereum.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/etherscan-light.svg",
      dark: "/explorerLogos/etherscan-dark.svg",
    },
    etherscanApiUrl: "https://api-sepolia.etherscan.io",
  },
  GOERLI: {
    deprecated: true,
    ...generateChainConfig(goerli, ETH_ICON),
    iconUrl: "/networkLogos/ethereum.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/etherscan-light.svg",
      dark: "/explorerLogos/etherscan-dark.svg",
    },
    etherscanApiUrl: "https://api-goerli.etherscan.io",
  },
  BSC: {
    ...generateChainConfig(bsc, BNB_ICON),
    iconUrl: "/networkLogos/bsc.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/bscscan-light.svg",
      dark: "/explorerLogos/bscscan-dark.svg",
    },
    etherscanApiUrl: "https://api.bscscan.com",
  },
  POLYGON: {
    ...generateChainConfig(polygon, MATIC_ICON),
    iconUrl: "/networkLogos/polygon.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/polygon.svg",
      dark: "/networkLogos/polygon.svg",
    },
    etherscanApiUrl: "https://api.polygonscan.com",
  },
  POLYGON_ZKEVM: {
    ...generateChainConfig(polygonZkEvm, MATIC_ICON),
    iconUrl: "/networkLogos/polygon.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/polygon.svg",
      dark: "/networkLogos/polygon.svg",
    },
  },
  AVALANCHE: {
    ...generateChainConfig(
      avalanche,
      "https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png"
    ),
    iconUrl: "/networkLogos/avalanche.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/snowtrace.svg",
      dark: "/explorerLogos/snowtrace.svg",
    },
    etherscanApiUrl: "https://api.snowtrace.io",
  },
  GNOSIS: {
    ...generateChainConfig(
      gnosis,
      "https://assets.coingecko.com/coins/images/11062/small/xdai.png"
    ),
    iconUrl: "/networkLogos/gnosis.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/gnosis.svg",
      dark: "/networkLogos/gnosis.svg",
    },
    etherscanApiUrl: "https://api.gnosisscan.io",
  },
  FANTOM: {
    ...generateChainConfig(
      fantom,
      "https://assets.coingecko.com/coins/images/4001/small/Fantom.png"
    ),
    iconUrl: "/networkLogos/fantom.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/ftmscan.svg",
      dark: "/networkLogos/fantom.svg",
    },
    etherscanApiUrl: "https://api.ftmscan.com",
  },
  ARBITRUM: {
    ...generateChainConfig(arbitrum, ETH_ICON),
    iconUrl: "/networkLogos/arbitrum.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/arbitrum.svg",
      dark: "/networkLogos/arbitrum.svg",
    },
    etherscanApiUrl: "https://api.arbiscan.io",
  },
  NOVA: {
    ...generateChainConfig(arbitrumNova, ETH_ICON),
    iconUrl: "/networkLogos/nova.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/nova.svg",
      dark: "/networkLogos/nova.svg",
    },
    etherscanApiUrl: "https://api-nova.arbiscan.io",
  },
  CELO: {
    ...generateChainConfig(
      celo as ViemChain,
      "https://assets.coingecko.com/coins/images/11090/small/icon-celo-CELO-color-500.png"
    ),
    iconUrl: "/networkLogos/celo.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/celo.svg",
      dark: "/networkLogos/celo.svg",
    },
    etherscanApiUrl: "https://explorer.celo.org",
  },
  HARMONY: {
    ...generateChainConfig(
      harmonyOne,
      "https://assets.coingecko.com/coins/images/4344/small/Y88JAze.png"
    ),
    iconUrl: "/networkLogos/harmony.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/harmony.svg",
      dark: "/networkLogos/harmony.svg",
    },
  },
  OPTIMISM: {
    ...generateChainConfig(optimism as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/optimism.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/optimism.svg",
      dark: "/networkLogos/optimism.svg",
    },
    etherscanApiUrl: "https://api-optimistic.etherscan.io",
  },
  MOONBEAM: {
    ...generateChainConfig(
      moonbeam,
      "https://assets.coingecko.com/coins/images/22459/small/glmr.png"
    ),
    iconUrl: "/networkLogos/moonbeam.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/moonbeam.svg",
      dark: "/networkLogos/moonbeam.svg",
    },
    etherscanApiUrl: "https://api-moonbeam.moonscan.io",
  },
  MOONRIVER: {
    ...generateChainConfig(
      moonriver,
      "https://assets.coingecko.com/coins/images/17984/small/9285.png"
    ),
    iconUrl: "/networkLogos/moonriver.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/moonriver.svg",
      dark: "/networkLogos/moonriver.svg",
    },
    etherscanApiUrl: "https://api-moonriver.moonscan.io",
  },
  METIS: {
    ...generateChainConfig(
      metis,
      "https://assets.coingecko.com/coins/images/15595/small/metis.PNG"
    ),
    iconUrl: "/networkLogos/metis.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/metis.svg",
      dark: "/explorerLogos/metis-dark.svg",
    },
    etherscanApiUrl: "https://andromeda-explorer.metis.io",
  },
  METIS_SEPOLIA: {
    ...generateChainConfig(
      metisSepolia,
      "https://assets.coingecko.com/coins/images/15595/small/metis.PNG"
    ),
    iconUrl: "/networkLogos/metis.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/metis.svg",
      dark: "/explorerLogos/metis-dark.svg",
    },
  },
  CRONOS: {
    ...generateChainConfig(
      cronos,
      "https://assets.coingecko.com/coins/images/7310/small/oCw2s3GI_400x400.jpeg"
    ),
    iconUrl: "/networkLogos/cronos.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/cronos.svg",
      dark: "/explorerLogos/cronos.svg",
    },
    etherscanApiUrl: "https://cronos.org/explorer",
  },
  BOBA: {
    ...generateChainConfig(boba, ETH_ICON),
    iconUrl: "/networkLogos/boba.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/boba-light.svg",
      dark: "/networkLogos/boba.svg",
    },
    etherscanApiUrl: "https://api.bobascan.com",
  },
  BOBA_AVAX: {
    deprecated: true,
    ...generateChainConfig(
      bobaAvax,
      "https://assets.coingecko.com/coins/images/20285/small/BOBA.png"
    ),
    iconUrl: "/networkLogos/boba.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/boba-light.svg",
      dark: "/networkLogos/boba.svg",
    },
    etherscanApiUrl: "https://blockexplorer.avax.boba.network",
  },
  PALM: {
    ...generateChainConfig(palm, "/networkLogos/palm.png"),
    iconUrl: "/networkLogos/palm.png",
    blockExplorerIconUrl: {
      light: "/networkLogos/palm.png",
      dark: "/networkLogos/palm.png",
    },
    etherscanApiUrl: "https://explorer.palm.io",
  },
  BASE_MAINNET: {
    ...generateChainConfig(base as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/base.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/base.svg",
      dark: "/networkLogos/base.svg",
    },
    etherscanApiUrl: "https://api.basescan.org",
  },
  BASE_GOERLI: {
    deprecated: true,
    ...generateChainConfig(baseGoerli as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/base.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/base.svg",
      dark: "/networkLogos/base.svg",
    },
    etherscanApiUrl: "https://api-goerli.basescan.org",
  },
  BASE_SEPOLIA: {
    ...generateChainConfig(baseSepolia as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/base.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/base.svg",
      dark: "/networkLogos/base.svg",
    },
    etherscanApiUrl: "https://api-sepolia.basescan.org",
  },
  EXOSAMA: {
    ...generateChainConfig(
      exosama,
      "https://raw.githubusercontent.com/nico-ma1/Exosama-Network-Brand/main/sama-token%403x.png"
    ),
    iconUrl: "/networkLogos/exosama.png",
    blockExplorerIconUrl: {
      light: "/networkLogos/exosama.png",
      dark: "/networkLogos/exosama.png",
    },
    etherscanApiUrl: "https://explorer.exosama.com",
  },
  EVMOS: {
    ...generateChainConfig(evmos, "/networkLogos/evmos.svg"),
    iconUrl: "/networkLogos/evmos.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/evmos.svg",
      dark: "/networkLogos/evmos.svg",
    },
  },
  ZETACHAIN: {
    ...generateChainConfig(
      zetachain,
      "https://explorer.zetachain.com/img/logos/zeta-logo.svg"
    ),
    iconUrl: "/networkLogos/zetachain.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/zetachain.svg",
      dark: "/networkLogos/zetachain.svg",
    },
  },
  ZETACHAIN_ATHENS: {
    ...generateChainConfig(
      zetachainAthensTestnet,
      "https://explorer.zetachain.com/img/logos/zeta-logo.svg"
    ),
    iconUrl: "/networkLogos/zetachain.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/zetachain.svg",
      dark: "/networkLogos/zetachain.svg",
    },
  },
  SCROLL_ALPHA: {
    deprecated: true,
    ...generateChainConfig(scrollAlpha, ETH_ICON),
    iconUrl: "/networkLogos/scroll.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/scroll.svg",
      dark: "/networkLogos/scroll.svg",
    },
  },
  SCROLL_SEPOLIA: {
    ...generateChainConfig(scrollSepolia, ETH_ICON),
    iconUrl: "/networkLogos/scroll.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/scroll.svg",
      dark: "/networkLogos/scroll.svg",
    },
  },
  SCROLL: {
    ...generateChainConfig(scroll, ETH_ICON),
    iconUrl: "/networkLogos/scroll.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/scroll.svg",
      dark: "/networkLogos/scroll.svg",
    },
  },
  ZKSYNC_ERA: {
    ...generateChainConfig(zkSync as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/zksync-era.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/zksync-era.svg",
      dark: "/networkLogos/zksync-era.svg",
    },
  },
  ZORA: {
    ...generateChainConfig(zora as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/zora.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/zora.svg",
      dark: "/networkLogos/zora.svg",
    },
  },
  PGN: {
    ...generateChainConfig(pgn, ETH_ICON),
    iconUrl: "/networkLogos/pgn.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/pgn-light.svg",
      dark: "/networkLogos/pgn.svg",
    },
  },
  NEON_EVM: {
    ...generateChainConfig(neonEVM, ETH_ICON),
    iconUrl: "/networkLogos/neon.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/neonscan.svg",
      dark: "/explorerLogos/neonscan.svg",
    },
  },
  LINEA: {
    ...generateChainConfig(linea, ETH_ICON),
    iconUrl: "/networkLogos/linea.png",
    blockExplorerIconUrl: {
      light: "/networkLogos/linea.png",
      dark: "/networkLogos/linea.png",
    },
  },
  LUKSO: {
    ...generateChainConfig(lukso, ETH_ICON),
    iconUrl: "/networkLogos/lukso.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/lukso.svg",
      dark: "/networkLogos/lukso.svg",
    },
  },
  MANTLE: {
    ...generateChainConfig(mantle, "/networkLogos/mantle.svg"),
    iconUrl: "/networkLogos/mantle.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/mantle-light.svg",
      dark: "/networkLogos/mantle.svg",
    },
  },
  RONIN: {
    ...generateChainConfig(ronin, "/networkLogos/ronin.svg"),
    iconUrl: "/networkLogos/ronin.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/ronin.svg",
      dark: "/networkLogos/ronin.svg",
    },
  },
  SHIMMER: {
    ...generateChainConfig(shimmer, "/networkLogos/shimmer.svg"),
    iconUrl: "/networkLogos/shimmer.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/shimmer.svg",
      dark: "/networkLogos/shimmer.svg",
    },
  },
  KAVA: {
    ...generateChainConfig(kava, "/networkLogos/kava.svg"),
    iconUrl: "/networkLogos/kava.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/kava.svg",
      dark: "/networkLogos/kava.svg",
    },
  },
  BITFINITY_TESTNET: {
    ...generateChainConfig(bitfinityTestnet, "/networkLogos/bitfinity.svg"),
    iconUrl: "/networkLogos/bitfinity.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/bitfinity-light.svg",
      dark: "/explorerLogos/bitfinity.svg",
    },
  },
  X1: {
    ...generateChainConfig(x1, "/walletLogos/okx.png"),
    name: "X Layer mainnet",
    iconUrl: "/walletLogos/okx.png",
    blockExplorerIconUrl: {
      light: "/walletLogos/okx.png",
      dark: "/walletLogos/okx.png",
    },
  },
  X1_TESTNET: {
    ...generateChainConfig(x1Testnet, "/walletLogos/okx.png"),
    name: "X Layer testnet",
    iconUrl: "/walletLogos/okx.png",
    blockExplorerIconUrl: {
      light: "/walletLogos/okx.png",
      dark: "/walletLogos/okx.png",
    },
  },
  ONTOLOGY: {
    ...generateChainConfig(ontology, "/networkLogos/ontology.svg"),
    iconUrl: "/networkLogos/ontology.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/ontology.svg",
      dark: "/networkLogos/ontology.svg",
    },
  },
  BERA_TESTNET: {
    ...generateChainConfig(beraTestnet, "/networkLogos/berachain.png"),
    iconUrl: "/networkLogos/berachain.png",
    blockExplorerIconUrl: {
      light: "/networkLogos/berachain.png",
      dark: "/networkLogos/berachain.png",
    },
  },
  MANTA: {
    ...generateChainConfig(manta, ETH_ICON),
    iconUrl: "/networkLogos/manta.png",
    blockExplorerIconUrl: {
      light: "/networkLogos/manta.png",
      dark: "/networkLogos/manta.png",
    },
  },
  TAIKO_KATLA: {
    ...generateChainConfig(taikoKatlaTestnet, ETH_ICON),
    iconUrl: "/networkLogos/taiko-katla.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/taiko-katla.svg",
      dark: "/networkLogos/taiko-katla.svg",
    },
  },
  BLAST_SEPOLIA: {
    ...generateChainConfig(blastSepolia, ETH_ICON),
    iconUrl: "/networkLogos/blast.png",
    blockExplorerIconUrl: {
      light: "/networkLogos/blast.png",
      dark: "/networkLogos/blast.png",
    },
  },
  BLAST_MAINNET: {
    ...generateChainConfig(blast, ETH_ICON),
    iconUrl: "/networkLogos/blast.png",
    blockExplorerIconUrl: {
      light: "/networkLogos/blast.png",
      dark: "/networkLogos/blast.png",
    },
  },
  OASIS_SAPPHIRE: {
    ...generateChainConfig(oasisSapphire, "/networkLogos/oasis-sapphire.svg"),
    iconUrl: "/networkLogos/oasis-sapphire.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/oasis-sapphire.svg",
      dark: "/networkLogos/oasis-sapphire.svg",
    },
  },
  ASTAR_ZKEVM: {
    ...generateChainConfig(astarZkEVM, ETH_ICON),
    iconUrl: "/networkLogos/astar-zkevm.png",
    blockExplorerIconUrl: {
      light: "/networkLogos/astar-zkevm.png",
      dark: "/networkLogos/astar-zkevm.png",
    },
  },
  CORE_DAO: {
    ...generateChainConfig(coreDao, "/networkLogos/coredao.png"),
    iconUrl: "/networkLogos/coredao.png",
    blockExplorerIconUrl: {
      light: "/networkLogos/coredao.png",
      dark: "/networkLogos/coredao.png",
    },
  },
  LISK_SEPOLIA: {
    ...generateChainConfig(liskSepolia as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/lisk.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/lisk.svg",
      dark: "/networkLogos/lisk.svg",
    },
  },
  OP_BNB: {
    ...generateChainConfig(opBNB, BNB_ICON),
    iconUrl: "/networkLogos/bsc.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/opbnb.png",
      dark: "/explorerLogos/opbnb.png",
    },
  },
  FORM: {
    ...generateChainConfig(form, ETH_ICON),
    iconUrl: "/networkLogos/form.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/form.svg",
      dark: "/networkLogos/form.svg",
    },
  },
  CYBER: {
    ...generateChainConfig(cyber as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/cyber.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/cyber.svg",
      dark: "/networkLogos/cyber.svg",
    },
  },
  TAIKO: {
    ...generateChainConfig(taiko as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/taiko-katla.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/taiko-katla.svg",
      dark: "/networkLogos/taiko-katla.svg",
    },
  },
  KLAYTN: {
    ...generateChainConfig(klaytn as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/klaytn.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/klaytn.svg",
      dark: "/networkLogos/klaytn.svg",
    },
  },
  MINT: {
    ...generateChainConfig(mint as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/mint.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/mint.svg",
      dark: "/networkLogos/mint.svg",
    },
  },
  SEI: {
    ...generateChainConfig(sei, "/networkLogos/sei.svg"),
    iconUrl: "/networkLogos/sei.svg",
    blockExplorerIconUrl: {
      light: "/explorerLogos/seitrace.svg",
      dark: "/explorerLogos/seitrace.svg",
    },
  },
  FILECOIN: {
    ...generateChainConfig(filecoin, "/networkLogos/filecoin.svg"),
    iconUrl: "/networkLogos/filecoin.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/filecoin.svg",
      dark: "/networkLogos/filecoin.svg",
    },
  },
  ROOTSTOCK: {
    ...generateChainConfig(
      rootstock,
      "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png"
    ),
    iconUrl: "/networkLogos/rootstock.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/rootstock.svg",
      dark: "/networkLogos/rootstock.svg",
    },
  },
  MODE: {
    ...generateChainConfig(mode, ETH_ICON),
    iconUrl: "/networkLogos/mode.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/mode.svg",
      dark: "/networkLogos/mode.svg",
    },
  },
  LISK: {
    ...generateChainConfig(lisk as ViemChain, ETH_ICON),
    iconUrl: "/networkLogos/lisk.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/lisk.svg",
      dark: "/networkLogos/lisk.svg",
    },
  },
  CRONOS_ZKEVM: {
    ...generateChainConfig(cronoszkEVM, "/networkLogos/cronos.svg"),
    iconUrl: "/networkLogos/cronos.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/cronos.svg",
      dark: "/explorerLogos/cronos.svg",
    },
  },
  WORLD_CHAIN: {
    ...generateChainConfig(worldchain, ETH_ICON),
    iconUrl: "/networkLogos/world.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/world.svg",
      dark: "/networkLogos/world.svg",
    },
  },
  INK_SEPOLIA: {
    ...generateChainConfig(inkSepolia, ETH_ICON),
    iconUrl: "/networkLogos/inkSepolia.png",
    blockExplorerIconUrl: {
      light: "/networkLogos/inkSepolia.png",
      dark: "/networkLogos/inkSepolia.png",
    },
  },
  INK: {
    ...generateChainConfig(ink, ETH_ICON),
    iconUrl: "/networkLogos/ink.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/ink.svg",
      dark: "/networkLogos/ink.svg",
    },
  },
  IOTA: {
    ...generateChainConfig(iota, "/networkLogos/iota.svg"),
    iconUrl: "/networkLogos/iota.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/iota.svg",
      dark: "/networkLogos/iota.svg",
    },
  },
  IOTEX: {
    ...generateChainConfig(iotex, "/networkLogos/iotex.svg"),
    iconUrl: "/networkLogos/iotex.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/iotex.svg",
      dark: "/networkLogos/iotex.svg",
    },
  },
  SONIC: {
    ...generateChainConfig(sonic, "/networkLogos/sonic.svg"),
    iconUrl: "/networkLogos/sonic.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/sonic.svg",
      dark: "/networkLogos/sonic.svg",
    },
  },
  SOPHON: {
    ...generateChainConfig(sophon, "/networkLogos/sophon.svg"),
    iconUrl: "/networkLogos/sophon.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/sophon.svg",
      dark: "/networkLogos/sophon.svg",
    },
  },
  ZERO: {
    ...generateChainConfig(zero, ETH_ICON),
    iconUrl: "/networkLogos/zero.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/zero.svg",
      dark: "/networkLogos/zero.svg",
    },
  },
  XDC: {
    ...generateChainConfig(xdc, "/networkLogos/xdc.svg"),
    iconUrl: "/networkLogos/xdc.svg",
    blockExplorerIconUrl: {
      light: "/networkLogos/xdc.svg",
      dark: "/networkLogos/xdc.svg",
    },
  },
}

enum Chains {
  ETHEREUM = mainnet.id,
  BSC = bsc.id,
  POLYGON = polygon.id,
  AVALANCHE = avalanche.id,
  GNOSIS = gnosis.id,
  FANTOM = fantom.id,
  ARBITRUM = arbitrum.id,
  NOVA = arbitrumNova.id,
  CELO = celo.id,
  HARMONY = harmonyOne.id,
  OPTIMISM = optimism.id,
  MOONBEAM = moonbeam.id,
  MOONRIVER = moonriver.id,
  METIS = metis.id,
  METIS_SEPOLIA = metisSepolia.id,
  CRONOS = cronos.id,
  BOBA = boba.id,
  BOBA_AVAX = bobaAvax.id,
  PALM = palm.id,
  BASE_GOERLI = baseGoerli.id,
  BASE_SEPOLIA = baseSepolia.id,
  EXOSAMA = exosama.id,
  EVMOS = evmos.id,
  ZETACHAIN = zetachain.id,
  ZETACHAIN_ATHENS = zetachainAthensTestnet.id,
  SCROLL_ALPHA = scrollAlpha.id,
  SCROLL_SEPOLIA = scrollSepolia.id,
  SCROLL = scroll.id,
  ZKSYNC_ERA = zkSync.id,
  SEPOLIA = sepolia.id,
  GOERLI = goerli.id,
  BASE_MAINNET = base.id,
  ZORA = zora.id,
  POLYGON_ZKEVM = polygonZkEvm.id,
  PGN = pgn.id,
  NEON_EVM = neonEVM.id,
  LINEA = linea.id,
  LUKSO = lukso.id,
  MANTLE = mantle.id,
  RONIN = ronin.id,
  SHIMMER = shimmer.id,
  KAVA = kava.id,
  BITFINITY_TESTNET = bitfinityTestnet.id,
  X1 = x1.id,
  X1_TESTNET = x1Testnet.id,
  ONTOLOGY = ontology.id,
  BERA_TESTNET = beraTestnet.id,
  MANTA = manta.id,
  TAIKO_KATLA = taikoKatlaTestnet.id,
  BLAST_SEPOLIA = blastSepolia.id,
  BLAST_MAINNET = blast.id,
  OASIS_SAPPHIRE = oasisSapphire.id,
  ASTAR_ZKEVM = astarZkEVM.id,
  CORE_DAO = coreDao.id,
  LISK_SEPOLIA = liskSepolia.id,
  OP_BNB = opBNB.id,
  FORM = form.id,
  CYBER = cyber.id,
  TAIKO = taiko.id,
  KLAYTN = klaytn.id,
  MINT = mint.id,
  SEI = sei.id,
  FILECOIN = filecoin.id,
  ROOTSTOCK = rootstock.id,
  MODE = mode.id,
  LISK = lisk.id,
  CRONOS_ZKEVM = cronoszkEVM.id,
  WORLD_CHAIN = worldchain.id,
  INK_SEPOLIA = inkSepolia.id,
  INK = ink.id,
  IOTA = iota.id,
  IOTEX = iotex.id,
  SONIC = sonic.id,
  SOPHON = sophon.id,
  ZERO = zero.id,
  XDC = xdc.id,
}

export type Chain = keyof typeof Chains

const supportedChains = Object.keys(CHAIN_CONFIG) as Chain[]

export { CHAIN_CONFIG, Chains, supportedChains }
