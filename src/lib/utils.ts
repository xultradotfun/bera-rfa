import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BERA_TOKEN, BGT_TOKENS } from "@/config/tokens";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBera(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount);
}

export interface HistoricalPrice {
  price: number;
  timestamp: string;
  updatedAt: number;
}

interface TokenHistoricalPrices {
  address: string;
  prices: HistoricalPrice[];
}

interface TokenMetadata {
  logoURI: string;
  decimals: number;
  description: string;
  name: string;
  symbol: string;
  websiteUrl: string;
}

interface TokenData {
  price: number;
  metadata: TokenMetadata;
}

const BERACHAIN_API = "https://api.berachain.com/";

async function getTokenCurrentPrice(address: string): Promise<TokenData> {
  try {
    const query = `
      query GetTokenData($address: String!) {
        tokenGetCurrentPrice(
          address: $address
          chain: BERACHAIN
        ) {
          price
        }
        tokenGetToken(
          address: $address
          chain: BERACHAIN
        ) {
          logoURI
          decimals
          description
          name
          symbol
          websiteUrl
        }
      }
    `;

    const response = await fetch(BERACHAIN_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          address: address.toLowerCase(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
    }

    return {
      price: data.data.tokenGetCurrentPrice.price,
      metadata: data.data.tokenGetToken,
    };
  } catch (error) {
    console.error(`Error fetching token data for ${address}:`, error);
    return {
      price: 0,
      metadata: {
        logoURI: "",
        decimals: 18,
        description: "",
        name: "",
        symbol: "",
        websiteUrl: "",
      },
    };
  }
}

export interface BGTWrapperPrices {
  bera: number;
  ibgt: number;
  lbgt: number;
  stbgt: number;
}

export interface BGTWrapperMetadata {
  bera: TokenMetadata;
  ibgt: TokenMetadata;
  lbgt: TokenMetadata;
  stbgt: TokenMetadata;
}

export async function getBGTWrapperPrices(): Promise<{
  prices: BGTWrapperPrices;
  metadata: BGTWrapperMetadata;
}> {
  try {
    // Fetch prices and metadata for all tokens in parallel
    const [beraData, ibgtData, lbgtData, stbgtData] = await Promise.all([
      getTokenCurrentPrice(BERA_TOKEN.address),
      getTokenCurrentPrice(BGT_TOKENS.ibgt.address),
      getTokenCurrentPrice(BGT_TOKENS.lbgt.address),
      getTokenCurrentPrice(BGT_TOKENS.stbgt.address),
    ]);

    return {
      prices: {
        bera: beraData.price,
        ibgt: ibgtData.price,
        lbgt: lbgtData.price,
        stbgt: stbgtData.price,
      },
      metadata: {
        bera: beraData.metadata,
        ibgt: ibgtData.metadata,
        lbgt: lbgtData.metadata,
        stbgt: stbgtData.metadata,
      },
    };
  } catch (error) {
    console.error("Error fetching BGT wrapper data:", error);
    return {
      prices: {
        bera: 0,
        ibgt: 0,
        lbgt: 0,
        stbgt: 0,
      },
      metadata: {
        bera: {
          logoURI: "",
          decimals: 18,
          description: "",
          name: "",
          symbol: "",
          websiteUrl: "",
        },
        ibgt: {
          logoURI: "",
          decimals: 18,
          description: "",
          name: "",
          symbol: "",
          websiteUrl: "",
        },
        lbgt: {
          logoURI: "",
          decimals: 18,
          description: "",
          name: "",
          symbol: "",
          websiteUrl: "",
        },
        stbgt: {
          logoURI: "",
          decimals: 18,
          description: "",
          name: "",
          symbol: "",
          websiteUrl: "",
        },
      },
    };
  }
}

export async function getBGTWrapperHistoricalPrices(): Promise<{
  bera: HistoricalPrice[];
  ibgt: HistoricalPrice[];
  lbgt: HistoricalPrice[];
  stbgt: HistoricalPrice[];
}> {
  const TOKENS = [
    { name: "BERA", address: BERA_TOKEN.address },
    { name: "iBGT", address: BGT_TOKENS.ibgt.address },
    { name: "LBGT", address: BGT_TOKENS.lbgt.address },
    { name: "stBGT", address: BGT_TOKENS.stbgt.address },
  ];

  try {
    const query = `
      query GetHistoricalPrices($addresses: [String!]!) {
        tokenGetHistoricalPrices(
          addresses: $addresses
          chain: BERACHAIN
          range: THIRTY_DAY
        ) {
          address
          prices {
            price
            timestamp
            updatedAt
          }
        }
      }
    `;

    const response = await fetch(BERACHAIN_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          addresses: TOKENS.map((token) => token.address.toLowerCase()),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
    }

    const historicalPrices = data.data
      .tokenGetHistoricalPrices as TokenHistoricalPrices[];

    // Map the historical prices to their respective tokens
    const prices = {
      bera:
        historicalPrices.find(
          (p) => p.address.toLowerCase() === BERA_TOKEN.address.toLowerCase()
        )?.prices || [],
      ibgt:
        historicalPrices.find(
          (p) =>
            p.address.toLowerCase() === BGT_TOKENS.ibgt.address.toLowerCase()
        )?.prices || [],
      lbgt:
        historicalPrices.find(
          (p) =>
            p.address.toLowerCase() === BGT_TOKENS.lbgt.address.toLowerCase()
        )?.prices || [],
      stbgt:
        historicalPrices.find(
          (p) =>
            p.address.toLowerCase() === BGT_TOKENS.stbgt.address.toLowerCase()
        )?.prices || [],
    };

    return prices;
  } catch (error) {
    console.error("Error fetching historical prices:", error);
    return {
      bera: [],
      ibgt: [],
      lbgt: [],
      stbgt: [],
    };
  }
}
