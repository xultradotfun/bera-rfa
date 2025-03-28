export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  websiteUrl?: string;
}

export const BERA_TOKEN: TokenInfo = {
  address: "0x0000000000000000000000000000000000000000",
  name: "BERA",
  symbol: "BERA",
  decimals: 18,
  websiteUrl: "https://hub.berachain.com/vaults/",
};

export const BGT_TOKENS: Record<string, TokenInfo> = {
  ibgt: {
    address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b",
    name: "iBGT",
    symbol: "iBGT",
    decimals: 18,
    websiteUrl: "https://infrared.finance/vaults",
  },
  lbgt: {
    address: "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe",
    name: "LBGT",
    symbol: "LBGT",
    decimals: 18,
    websiteUrl: "https://www.berapaw.com/vaults",
  },
  stbgt: {
    address: "0x2CeC7f1ac87F5345ced3D6c74BBB61bfAE231Ffb",
    name: "stBGT",
    symbol: "stBGT",
    decimals: 18,
    websiteUrl: "https://bera.stride.zone/",
  },
} as const;

export type BGTTokenType = keyof typeof BGT_TOKENS;
