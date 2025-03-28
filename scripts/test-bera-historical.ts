import axios from "axios";

const BERACHAIN_API = "https://api.berachain.com/";

// Known token addresses from tokens.ts
const TOKENS = [
  { name: "BERA", address: "0x0000000000000000000000000000000000000000" },
  { name: "iBGT", address: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b" },
  { name: "LBGT", address: "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe" },
  { name: "stBGT", address: "0x2CeC7f1ac87F5345ced3D6c74BBB61bfAE231Ffb" },
];

interface HistoricalPrice {
  price: number;
  timestamp: string;
  updatedAt: number;
}

interface TokenHistoricalPrices {
  address: string;
  prices: HistoricalPrice[];
}

async function fetchHistoricalPrices() {
  try {
    console.log("\nFetching historical prices for BGT tokens and BERA...");

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

    const response = await axios.post(
      BERACHAIN_API,
      {
        query,
        variables: {
          addresses: TOKENS.map((token) => token.address.toLowerCase()),
        },
      },
      {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.8",
          "content-type": "application/json",
          priority: "u=1, i",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
        },
      }
    );

    if (response.data.errors) {
      console.error(
        "GraphQL Errors:",
        JSON.stringify(response.data.errors, null, 2)
      );
      return;
    }

    const historicalPrices = response.data.data
      .tokenGetHistoricalPrices as TokenHistoricalPrices[];

    console.log("\nHistorical Prices (Last 30 Days):");
    console.log("=================================");

    TOKENS.forEach((token) => {
      const tokenPrices =
        historicalPrices.find(
          (p) => p.address.toLowerCase() === token.address.toLowerCase()
        )?.prices || [];
      console.log(`\nToken: ${token.name}`);
      console.log(`Address: ${token.address}`);
      console.log(`Number of price points: ${tokenPrices.length}`);

      if (tokenPrices.length > 0) {
        const latestPrice = tokenPrices[tokenPrices.length - 1];
        const oldestPrice = tokenPrices[0];
        console.log(`Latest Price: $${latestPrice.price}`);
        console.log(
          `Latest Price Time: ${new Date(
            parseInt(latestPrice.timestamp) * 1000
          ).toLocaleString()}`
        );
        console.log(`Oldest Price: $${oldestPrice.price}`);
        console.log(
          `Oldest Price Time: ${new Date(
            parseInt(oldestPrice.timestamp) * 1000
          ).toLocaleString()}`
        );
        console.log(
          `Price Change: ${(
            ((latestPrice.price - oldestPrice.price) / oldestPrice.price) *
            100
          ).toFixed(2)}%`
        );
      } else {
        console.log("No price data available");
      }
      console.log("-------------------");
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers,
        },
      });
    } else if (error instanceof Error) {
      console.error("Error fetching token data:", error.message);
    } else {
      console.error("Unknown error occurred:", error);
    }
  }
}

// Run the test
fetchHistoricalPrices();
