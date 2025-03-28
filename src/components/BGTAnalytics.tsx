import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  type BGTWrapperPrices,
  type HistoricalPrice,
  type BGTWrapperMetadata,
} from "@/lib/utils";
import { BGT_TOKENS } from "@/config/tokens";
import { Globe } from "lucide-react";
import Image from "next/image";

interface HistoricalPrices {
  bera: HistoricalPrice[];
  ibgt: HistoricalPrice[];
  lbgt: HistoricalPrice[];
  stbgt: HistoricalPrice[];
}

interface WrapperInfo {
  name: string;
  address: string;
  latestPrice: number;
  premium: number;
  historicalPrices: HistoricalPrice[];
  metadata?: {
    logoURI: string;
    decimals: number;
    description: string;
    name: string;
    symbol: string;
    websiteUrl: string;
  };
}

interface ChartDataPoint {
  timestamp: string;
  bera: number;
  ibgt: number;
  lbgt: number;
  stbgt: number;
}

interface LegendPayload {
  value: string;
  color: string;
}

interface LegendProps {
  payload?: LegendPayload[];
}

type TimeRange = "7d" | "30d";

interface TooltipPayload {
  value: number;
  name: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

export function BGTAnalytics({
  prices,
  historicalPrices,
  metadata,
}: {
  prices: BGTWrapperPrices;
  historicalPrices: HistoricalPrices;
  metadata: BGTWrapperMetadata | null;
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const wrappers = useMemo(() => {
    const calculatePremium = (price: number) =>
      ((price - prices.bera) / prices.bera) * 100;

    return [
      {
        name: "BGT (1:1 BERA)",
        address: "-",
        latestPrice: prices.bera,
        premium: 0,
        historicalPrices: historicalPrices.bera,
        metadata: metadata?.bera,
      },
      {
        name: BGT_TOKENS.ibgt.name,
        address: BGT_TOKENS.ibgt.address,
        latestPrice: prices.ibgt,
        premium: calculatePremium(prices.ibgt),
        historicalPrices: historicalPrices.ibgt,
        metadata: metadata?.ibgt,
      },
      {
        name: BGT_TOKENS.lbgt.name,
        address: BGT_TOKENS.lbgt.address,
        latestPrice: prices.lbgt,
        premium: calculatePremium(prices.lbgt),
        historicalPrices: historicalPrices.lbgt,
        metadata: metadata?.lbgt,
      },
      {
        name: BGT_TOKENS.stbgt.name,
        address: BGT_TOKENS.stbgt.address,
        latestPrice: prices.stbgt,
        premium: calculatePremium(prices.stbgt),
        historicalPrices: historicalPrices.stbgt,
        metadata: metadata?.stbgt,
      },
    ] as WrapperInfo[];
  }, [prices, historicalPrices, metadata]);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload) return null;

    return (
      <div className="p-3 rounded-lg border border-yellow-900/20 bg-yellow-950/95 backdrop-blur-sm">
        <div className="text-sm text-yellow-500/70 mb-2">{label}</div>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            const wrapper = wrappers.find((w) => w.name === entry.name);
            return (
              <div key={`item-${index}`} className="flex items-center gap-2">
                {wrapper?.metadata?.logoURI && (
                  <Image
                    src={wrapper.metadata.logoURI}
                    alt={`${wrapper.name} logo`}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                )}
                <span style={{ color: entry.color }} className="text-sm">
                  {entry.name}: ${entry.value.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const chartData = useMemo(() => {
    // Get all unique timestamps
    const timestamps = new Set<string>();
    wrappers.forEach((wrapper) => {
      wrapper.historicalPrices.forEach((price) => {
        timestamps.add(price.timestamp);
      });
    });

    // Convert timestamps to array and sort
    const sortedTimestamps = Array.from(timestamps).sort();

    // Filter timestamps based on time range
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    const daysToShow = timeRange === "7d" ? 7 : 30;
    const cutoffTime = now - daysToShow * msInDay;

    const filteredTimestamps = sortedTimestamps.filter(
      (timestamp) => parseInt(timestamp) * 1000 >= cutoffTime
    );

    // Create data points for each timestamp
    return filteredTimestamps.map((timestamp) => {
      const dataPoint: ChartDataPoint = {
        timestamp: new Date(parseInt(timestamp) * 1000).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        bera: 0,
        ibgt: 0,
        lbgt: 0,
        stbgt: 0,
      };

      // Find prices for each token at this timestamp
      wrappers.forEach((wrapper) => {
        const price = wrapper.historicalPrices.find(
          (p) => p.timestamp === timestamp
        );
        if (price) {
          switch (wrapper.name) {
            case "BGT (1:1 BERA)":
              dataPoint.bera = price.price;
              break;
            case BGT_TOKENS.ibgt.name:
              dataPoint.ibgt = price.price;
              break;
            case BGT_TOKENS.lbgt.name:
              dataPoint.lbgt = price.price;
              break;
            case BGT_TOKENS.stbgt.name:
              dataPoint.stbgt = price.price;
              break;
          }
        }
      });

      return dataPoint;
    });
  }, [wrappers, timeRange]);

  const CustomLegend = ({ payload }: LegendProps) => {
    if (!payload) return null;

    return (
      <div className="flex items-center justify-center gap-6 mt-4">
        {payload.map((entry, index) => {
          const wrapper = wrappers.find((w) => w.name === entry.value);
          return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              {wrapper?.metadata?.logoURI && (
                <Image
                  src={wrapper.metadata.logoURI}
                  alt={`${wrapper.name} logo`}
                  width={16}
                  height={16}
                  className="rounded-full"
                />
              )}
              <span style={{ color: entry.color }}>{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {wrappers.map((wrapper) => (
          <div
            key={wrapper.name}
            className="p-4 rounded-lg border border-yellow-900/20 bg-yellow-950/10"
          >
            <div className="flex items-start gap-3">
              {wrapper.metadata?.logoURI && (
                <Image
                  src={wrapper.metadata.logoURI}
                  alt={`${wrapper.name} logo`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-yellow-500 truncate">
                    {wrapper.metadata?.name || wrapper.name}
                  </h3>
                  {wrapper.metadata?.websiteUrl && (
                    <a
                      href={wrapper.metadata.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-500/70 hover:text-yellow-500 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-yellow-500/70 font-mono">
                  ${wrapper.latestPrice.toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-yellow-500/50">Premium:</span>
                  <span
                    className={`text-xs font-medium ${
                      wrapper.premium > 0
                        ? "text-green-500"
                        : wrapper.premium < 0
                        ? "text-red-500"
                        : "text-yellow-500/50"
                    }`}
                  >
                    {wrapper.premium > 0 ? "+" : ""}
                    {wrapper.premium.toFixed(2)}%
                  </span>
                </div>
                {wrapper.metadata?.description && (
                  <p className="text-xs text-yellow-500/50 mt-2 line-clamp-2">
                    {wrapper.metadata.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg border border-yellow-900/20 bg-yellow-950/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-yellow-500">Price History</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === "7d"
                  ? "bg-yellow-500 text-black"
                  : "text-yellow-500/70 hover:text-yellow-500"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === "30d"
                  ? "bg-yellow-500 text-black"
                  : "text-yellow-500/70 hover:text-yellow-500"
              }`}
            >
              30D
            </button>
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(234, 179, 8, 0.1)"
              />
              <XAxis
                dataKey="timestamp"
                stroke="rgb(234, 179, 8, 0.5)"
                tick={{ fill: "rgb(234, 179, 8, 0.7)" }}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  // Only show the date part (first part before the comma)
                  return value.split(",")[0];
                }}
                minTickGap={50}
              />
              <YAxis
                stroke="rgb(234, 179, 8, 0.5)"
                tick={{ fill: "rgb(234, 179, 8, 0.7)" }}
                label={{
                  value: "Price ($)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "rgb(234, 179, 8, 0.7)",
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                contentStyle={{
                  backgroundColor: "transparent",
                  border: "none",
                  boxShadow: "none",
                }}
              />
              <Legend content={<CustomLegend />} />
              <Line
                type="monotone"
                dataKey="bera"
                stroke="rgb(234, 179, 8)"
                name="BGT"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="ibgt"
                stroke="#ff6b35"
                name="iBGT"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="lbgt"
                stroke="#60a5fa"
                name="LBGT"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="stbgt"
                stroke="#e879f9"
                name="stBGT"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
