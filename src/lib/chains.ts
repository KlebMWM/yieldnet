export interface ChainInfo {
  id: number;
  name: string;
  shortName: string;
  nativeCurrency: string;
  color: string;
  avgGasCostUSD: number;
  avgBridgeCostUSD: number;
  avgBridgeTimeMin: number;
}

export const CHAINS: Record<number, ChainInfo> = {
  1: {
    id: 1,
    name: "Ethereum",
    shortName: "ETH",
    nativeCurrency: "ETH",
    color: "#627EEA",
    avgGasCostUSD: 8.5,
    avgBridgeCostUSD: 12.0,
    avgBridgeTimeMin: 15,
  },
  10: {
    id: 10,
    name: "Optimism",
    shortName: "OP",
    nativeCurrency: "ETH",
    color: "#FF0420",
    avgGasCostUSD: 0.15,
    avgBridgeCostUSD: 2.5,
    avgBridgeTimeMin: 5,
  },
  56: {
    id: 56,
    name: "BNB Chain",
    shortName: "BSC",
    nativeCurrency: "BNB",
    color: "#F0B90B",
    avgGasCostUSD: 0.3,
    avgBridgeCostUSD: 3.0,
    avgBridgeTimeMin: 8,
  },
  100: {
    id: 100,
    name: "Gnosis",
    shortName: "GNO",
    nativeCurrency: "xDAI",
    color: "#04795B",
    avgGasCostUSD: 0.01,
    avgBridgeCostUSD: 2.0,
    avgBridgeTimeMin: 10,
  },
  137: {
    id: 137,
    name: "Polygon",
    shortName: "MATIC",
    nativeCurrency: "POL",
    color: "#8247E5",
    avgGasCostUSD: 0.05,
    avgBridgeCostUSD: 2.0,
    avgBridgeTimeMin: 5,
  },
  250: {
    id: 250,
    name: "Fantom",
    shortName: "FTM",
    nativeCurrency: "FTM",
    color: "#1969FF",
    avgGasCostUSD: 0.02,
    avgBridgeCostUSD: 2.5,
    avgBridgeTimeMin: 8,
  },
  324: {
    id: 324,
    name: "zkSync Era",
    shortName: "zkSync",
    nativeCurrency: "ETH",
    color: "#8C8DFC",
    avgGasCostUSD: 0.25,
    avgBridgeCostUSD: 3.0,
    avgBridgeTimeMin: 10,
  },
  8453: {
    id: 8453,
    name: "Base",
    shortName: "BASE",
    nativeCurrency: "ETH",
    color: "#0052FF",
    avgGasCostUSD: 0.08,
    avgBridgeCostUSD: 2.0,
    avgBridgeTimeMin: 5,
  },
  42161: {
    id: 42161,
    name: "Arbitrum",
    shortName: "ARB",
    nativeCurrency: "ETH",
    color: "#28A0F0",
    avgGasCostUSD: 0.12,
    avgBridgeCostUSD: 2.0,
    avgBridgeTimeMin: 5,
  },
  43114: {
    id: 43114,
    name: "Avalanche",
    shortName: "AVAX",
    nativeCurrency: "AVAX",
    color: "#E84142",
    avgGasCostUSD: 0.15,
    avgBridgeCostUSD: 3.0,
    avgBridgeTimeMin: 5,
  },
  59144: {
    id: 59144,
    name: "Linea",
    shortName: "LINEA",
    nativeCurrency: "ETH",
    color: "#61DFFF",
    avgGasCostUSD: 0.2,
    avgBridgeCostUSD: 2.5,
    avgBridgeTimeMin: 10,
  },
  534352: {
    id: 534352,
    name: "Scroll",
    shortName: "SCROLL",
    nativeCurrency: "ETH",
    color: "#FFEEDA",
    avgGasCostUSD: 0.15,
    avgBridgeCostUSD: 2.5,
    avgBridgeTimeMin: 10,
  },
};

export function getChainInfo(chainId: number): ChainInfo {
  return (
    CHAINS[chainId] ?? {
      id: chainId,
      name: `Chain ${chainId}`,
      shortName: `${chainId}`,
      nativeCurrency: "ETH",
      color: "#888888",
      avgGasCostUSD: 0.5,
      avgBridgeCostUSD: 3.0,
      avgBridgeTimeMin: 10,
    }
  );
}

export function getChainList(): ChainInfo[] {
  return Object.values(CHAINS);
}
