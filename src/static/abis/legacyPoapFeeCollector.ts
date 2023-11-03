const legacyPoapFeeCollectorAbi = [
  {
    inputs: [
      {
        internalType: "address payable",
        name: "guildFeeCollector_",
        type: "address",
      },
      { internalType: "uint96", name: "guildSharex100_", type: "uint96" },
      {
        internalType: "address payable",
        name: "poapFeeCollector_",
        type: "address",
      },
      { internalType: "uint96", name: "poapSharex100_", type: "uint96" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "AccessDenied",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "recipient", type: "address" }],
    name: "FailedToSendEther",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "vaultId", type: "uint256" },
      { internalType: "uint256", name: "paid", type: "uint256" },
      { internalType: "uint256", name: "requiredAmount", type: "uint256" },
    ],
    name: "IncorrectFee",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "TransferFailed",
    type: "error",
  },
  {
    inputs: [{ internalType: "uint256", name: "vaultId", type: "uint256" }],
    name: "VaultDoesNotExist",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "vaultId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "FeeReceived",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newFeeCollector",
        type: "address",
      },
    ],
    name: "GuildFeeCollectorChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint96",
        name: "newShare",
        type: "uint96",
      },
    ],
    name: "GuildSharex100Changed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newFeeCollector",
        type: "address",
      },
    ],
    name: "PoapFeeCollectorChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint96",
        name: "newShare",
        type: "uint96",
      },
    ],
    name: "PoapSharex100Changed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "vaultId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "eventId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "VaultRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "vaultId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "guildAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "poapAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "ownerAmount",
        type: "uint256",
      },
    ],
    name: "Withdrawn",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "vaultId", type: "uint256" }],
    name: "getVault",
    outputs: [
      { internalType: "uint256", name: "eventId", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint128", name: "fee", type: "uint128" },
      { internalType: "uint128", name: "collected", type: "uint128" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "guildFeeCollector",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "guildSharex100",
    outputs: [{ internalType: "uint96", name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "vaultId", type: "uint256" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "hasPaid",
    outputs: [{ internalType: "bool", name: "paid", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "vaultId", type: "uint256" }],
    name: "payFee",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "poapFeeCollector",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poapSharex100",
    outputs: [{ internalType: "uint96", name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "eventId", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint128", name: "fee", type: "uint128" },
    ],
    name: "registerVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "newFeeCollector",
        type: "address",
      },
    ],
    name: "setGuildFeeCollector",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint96", name: "newShare", type: "uint96" }],
    name: "setGuildSharex100",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "newFeeCollector",
        type: "address",
      },
    ],
    name: "setPoapFeeCollector",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint96", name: "newShare", type: "uint96" }],
    name: "setPoapSharex100",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "vaultId", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const

export default legacyPoapFeeCollectorAbi
