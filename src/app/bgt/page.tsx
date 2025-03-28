"use client";

import { useEffect, useState } from "react";
import { BGTAnalytics } from "@/components/BGTAnalytics";
import {
  getBGTWrapperPrices,
  getBGTWrapperHistoricalPrices,
  type BGTWrapperPrices,
  type HistoricalPrice,
  type BGTWrapperMetadata,
} from "@/lib/utils";

interface HistoricalPrices {
  bera: HistoricalPrice[];
  ibgt: HistoricalPrice[];
  lbgt: HistoricalPrice[];
  stbgt: HistoricalPrice[];
}

export default function BGTPage() {
  const [prices, setPrices] = useState<BGTWrapperPrices>({
    bera: 0,
    ibgt: 0,
    lbgt: 0,
    stbgt: 0,
  });
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrices>({
    bera: [],
    ibgt: [],
    lbgt: [],
    stbgt: [],
  });
  const [metadata, setMetadata] = useState<BGTWrapperMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { prices: currentPrices, metadata: currentMetadata },
          historical,
        ] = await Promise.all([
          getBGTWrapperPrices(),
          getBGTWrapperHistoricalPrices(),
        ]);
        setPrices(currentPrices);
        setMetadata(currentMetadata);
        setHistoricalPrices(historical);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh data every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[hsl(var(--background))] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-16 text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold">
              <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                BGT Analytics
              </span>
            </h1>
            <h2 className="text-4xl font-bold text-[hsl(var(--foreground))]">
              Wrapper Premiums
            </h2>
          </div>

          <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-2xl mx-auto leading-relaxed">
            Track the premiums of various BGT wrappers compared to the base BGT
            price.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-[hsl(var(--muted-foreground))] p-12 bg-[hsl(var(--muted))] rounded-lg">
            Loading price data...
          </div>
        ) : (
          <BGTAnalytics
            prices={prices}
            historicalPrices={historicalPrices}
            metadata={metadata}
          />
        )}

        <footer className="mt-16 pt-8 border-t border-[hsl(var(--muted))] text-center">
          <div className="text-sm text-[hsl(var(--muted-foreground))]">
            Price data updates every minute.
          </div>
        </footer>
      </div>
    </main>
  );
}
