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
import { BGT_TOKENS, BERA_TOKEN } from "@/config/tokens";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

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
    websiteUrl?: string;
  };
  websiteUrl?: string;
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
  const [priceDenomination, setPriceDenomination] = useState<"USDC" | "BERA">(
    "USDC"
  );

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
        websiteUrl: BERA_TOKEN.websiteUrl,
      },
      {
        name: BGT_TOKENS.ibgt.name,
        address: BGT_TOKENS.ibgt.address,
        latestPrice: prices.ibgt,
        premium: calculatePremium(prices.ibgt),
        historicalPrices: historicalPrices.ibgt,
        metadata: metadata?.ibgt,
        websiteUrl: BGT_TOKENS.ibgt.websiteUrl,
      },
      {
        name: BGT_TOKENS.lbgt.name,
        address: BGT_TOKENS.lbgt.address,
        latestPrice: prices.lbgt,
        premium: calculatePremium(prices.lbgt),
        historicalPrices: historicalPrices.lbgt,
        metadata: metadata?.lbgt,
        websiteUrl: BGT_TOKENS.lbgt.websiteUrl,
      },
      {
        name: BGT_TOKENS.stbgt.name,
        address: BGT_TOKENS.stbgt.address,
        latestPrice: prices.stbgt,
        premium: calculatePremium(prices.stbgt),
        historicalPrices: historicalPrices.stbgt,
        metadata: metadata?.stbgt,
        websiteUrl: BGT_TOKENS.stbgt.websiteUrl,
      },
    ] as WrapperInfo[];
  }, [prices, historicalPrices, metadata]);

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

      // Find BERA price at this timestamp
      const beraPrice = historicalPrices.bera.find(
        (p) => p.timestamp === timestamp
      )?.price;

      // Find prices for each token at this timestamp
      wrappers.forEach((wrapper) => {
        const price = wrapper.historicalPrices.find(
          (p) => p.timestamp === timestamp
        );
        if (price) {
          switch (wrapper.name) {
            case "BGT (1:1 BERA)":
              dataPoint.bera = priceDenomination === "USDC" ? price.price : 1; // BGT is always 1 BERA
              break;
            case BGT_TOKENS.ibgt.name:
              dataPoint.ibgt =
                priceDenomination === "USDC"
                  ? price.price
                  : beraPrice
                  ? price.price / beraPrice
                  : 0;
              break;
            case BGT_TOKENS.lbgt.name:
              dataPoint.lbgt =
                priceDenomination === "USDC"
                  ? price.price
                  : beraPrice
                  ? price.price / beraPrice
                  : 0;
              break;
            case BGT_TOKENS.stbgt.name:
              dataPoint.stbgt =
                priceDenomination === "USDC"
                  ? price.price
                  : beraPrice
                  ? price.price / beraPrice
                  : 0;
              break;
          }
        }
      });

      return dataPoint;
    });
  }, [wrappers, timeRange, priceDenomination, historicalPrices.bera]);

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
                  <img
                    src={wrapper.metadata.logoURI}
                    alt={`${wrapper.name} logo`}
                    className="w-4 h-4 rounded-full"
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

  const CustomLegend = ({ payload }: LegendProps) => {
    if (!payload) return null;

    return (
      <div className="flex items-center justify-center gap-6 mt-4">
        {payload.map((entry, index) => {
          const wrapper = wrappers.find((w) => w.name === entry.value);
          return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              {wrapper?.metadata?.logoURI && (
                <img
                  src={wrapper.metadata.logoURI}
                  alt={`${wrapper.name} logo`}
                  className="w-4 h-4 rounded-full"
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
          <Card
            key={wrapper.name}
            className="group relative bg-yellow-950/10 border-yellow-900/20 hover:border-yellow-500/30 transition-all duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                {wrapper.metadata?.logoURI && (
                  <img
                    src={wrapper.metadata.logoURI}
                    alt={`${wrapper.name} logo`}
                    className="w-6 h-6 rounded-full ring-1 ring-yellow-900/20 group-hover:ring-yellow-500/30 transition-all"
                  />
                )}
                <CardTitle className="text-sm font-medium text-yellow-500/90 group-hover:text-yellow-500 transition-colors">
                  {wrapper.name}
                </CardTitle>
              </div>
              {(wrapper.metadata?.websiteUrl || wrapper.websiteUrl) && (
                <a
                  href={wrapper.metadata?.websiteUrl || wrapper.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-500/40 hover:text-yellow-500 transition-colors p-1 hover:bg-yellow-500/10 rounded-full"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">
                    ${wrapper.latestPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-yellow-500/50">USD</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-yellow-500/50">Premium</span>
                  <div className="flex items-center gap-1">
                    {wrapper.premium > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-green-400" />
                    ) : wrapper.premium < 0 ? (
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-yellow-500/50" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        wrapper.premium > 0
                          ? "text-green-400"
                          : wrapper.premium < 0
                          ? "text-red-400"
                          : "text-yellow-500/50"
                      }`}
                    >
                      {wrapper.premium > 0 ? "+" : ""}
                      {wrapper.premium.toFixed(2)}%
                    </span>
                  </div>
                </div>
                {wrapper.metadata?.description && (
                  <div className="relative group/desc">
                    <p className="text-xs text-yellow-500/60 line-clamp-2 leading-relaxed">
                      {wrapper.metadata.description}
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-950/95 to-transparent opacity-0 group-hover/desc:opacity-100 transition-opacity duration-200" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-yellow-950/10 border-yellow-900/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
            <CardTitle className="text-base font-medium text-yellow-500">
              Price History
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-yellow-950/20 rounded-lg p-1">
              <button
                onClick={() => setPriceDenomination("USDC")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  priceDenomination === "USDC"
                    ? "bg-yellow-500 text-black"
                    : "text-yellow-500/70 hover:text-yellow-500"
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setPriceDenomination("BERA")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  priceDenomination === "BERA"
                    ? "bg-yellow-500 text-black"
                    : "text-yellow-500/70 hover:text-yellow-500"
                }`}
              >
                BERA
              </button>
            </div>
            <div className="flex items-center bg-yellow-950/20 rounded-lg p-1">
              <button
                onClick={() => setTimeRange("7d")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === "7d"
                    ? "bg-yellow-500 text-black"
                    : "text-yellow-500/70 hover:text-yellow-500"
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange("30d")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === "30d"
                    ? "bg-yellow-500 text-black"
                    : "text-yellow-500/70 hover:text-yellow-500"
                }`}
              >
                30D
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
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
                    return value.split(",")[0];
                  }}
                  minTickGap={50}
                />
                <YAxis
                  stroke="rgb(234, 179, 8, 0.5)"
                  tick={{ fill: "rgb(234, 179, 8, 0.7)" }}
                  label={{
                    value:
                      priceDenomination === "USDC"
                        ? "Price ($)"
                        : "Price (BERA)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "rgb(234, 179, 8, 0.7)",
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  contentStyle={{
                    backgroundColor: "rgb(39, 25, 8, 0.95)",
                    border: "1px solid rgb(234, 179, 8, 0.2)",
                    borderRadius: "0.5rem",
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
                  activeDot={{ r: 4, fill: "rgb(234, 179, 8)" }}
                />
                <Line
                  type="monotone"
                  dataKey="ibgt"
                  stroke="#ff6b35"
                  name="iBGT"
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 4, fill: "#ff6b35" }}
                />
                <Line
                  type="monotone"
                  dataKey="lbgt"
                  stroke="#60a5fa"
                  name="LBGT"
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 4, fill: "#60a5fa" }}
                />
                <Line
                  type="monotone"
                  dataKey="stbgt"
                  stroke="#e879f9"
                  name="stBGT"
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 4, fill: "#e879f9" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
