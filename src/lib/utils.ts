import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBera(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export async function getBeraPrice(): Promise<number> {
  try {
    const response = await fetch(
      "https://api.dexscreener.com/latest/dex/pairs/berachain/0x2c4a603a2aa5596287a06886862dc29d56dbc354"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch BERA price");
    }

    const data = await response.json();
    const priceUsd = data.pair?.priceUsd;

    if (!priceUsd) {
      throw new Error("No price data available");
    }

    return parseFloat(priceUsd);
  } catch (error) {
    console.error("Error fetching BERA price:", error);
    return 0; // Return 0 as fallback
  }
}
