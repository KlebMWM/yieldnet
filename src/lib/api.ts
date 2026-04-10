export interface Vault {
  address: string;
  chainId: number;
  protocol: string;
  protocolUrl: string;
  name: string;
  apy: number;
  apy7d: number;
  apy30d: number;
  tvl: number;
  tokenSymbol: string;
  tokenAddress: string;
  tokenDecimals: number;
}

interface EarnApiVault {
  address?: string;
  chainId?: number;
  name?: string;
  protocol?: { name?: string; key?: string; url?: string };
  underlyingTokens?: { symbol?: string; address?: string; decimals?: number }[];
  analytics?: {
    apy?: { base?: number; reward?: number | null; total?: number };
    tvl?: { usd?: string };
    apy7d?: number;
    apy30d?: number;
  };
  [key: string]: unknown;
}

export async function fetchVaults(): Promise<Vault[]> {
  const res = await fetch("/api/earn/vaults");
  if (!res.ok) {
    throw new Error(`Failed to fetch vaults: ${res.status}`);
  }

  const json = await res.json();

  const rawVaults: EarnApiVault[] = Array.isArray(json)
    ? json
    : json.data ?? json.vaults ?? [];

  return rawVaults
    .map((v) => ({
      address: v.address ?? "",
      chainId: v.chainId ?? 0,
      protocol: v.protocol?.name ?? v.protocol?.key ?? "Unknown",
      protocolUrl: (v.protocol?.url as string) ?? "",
      name: v.name ?? "Unknown Vault",
      apy: v.analytics?.apy?.total ?? 0,
      apy7d: v.analytics?.apy7d ?? 0,
      apy30d: v.analytics?.apy30d ?? 0,
      tvl: Number(v.analytics?.tvl?.usd ?? 0),
      tokenSymbol: v.underlyingTokens?.[0]?.symbol ?? "???",
      tokenAddress: v.underlyingTokens?.[0]?.address ?? "",
      tokenDecimals: v.underlyingTokens?.[0]?.decimals ?? 18,
    }))
    .filter((v) => v.address && v.chainId);
}

export interface FrictionCost {
  sourceChain: string;
  destChain: string;
  gasCostUSD: number;
  bridgeFeeUSD: number;
  slippageCostUSD: number;
  totalCostUSD: number;
  bridgeTimeMin: number;
}

export function estimateFrictionCost(
  sourceChainGas: number,
  destChainGas: number,
  sourceBridgeCost: number,
  destBridgeCost: number,
  sourceBridgeTime: number,
  destBridgeTime: number,
  amount: number,
  slippageBps: number = 30
): FrictionCost {
  const gasCostUSD = sourceChainGas + destChainGas;
  const bridgeFeeUSD = (sourceBridgeCost + destBridgeCost) / 2;
  const slippageCostUSD = (amount * slippageBps) / 10000;
  const totalCostUSD = gasCostUSD + bridgeFeeUSD + slippageCostUSD;
  const bridgeTimeMin = Math.max(sourceBridgeTime, destBridgeTime);

  return {
    sourceChain: "",
    destChain: "",
    gasCostUSD,
    bridgeFeeUSD,
    slippageCostUSD,
    totalCostUSD,
    bridgeTimeMin,
  };
}

/**
 * Fetch a real cross-chain cost quote from LI.FI Composer API.
 * Returns gas + bridge fee + estimated slippage in USD.
 * Falls back to null on any error so caller can use static estimates.
 */
export async function fetchRealQuote(
  fromChainId: number,
  toChainId: number,
  fromToken: string,
  toToken: string,
  fromAmountSmallest: string,
): Promise<{ gasCostUSD: number; bridgeFeeUSD: number; slippageCostUSD: number; totalCostUSD: number; bridgeTimeMin: number } | null> {
  try {
    const params = new URLSearchParams({
      fromChain: String(fromChainId),
      toChain: String(toChainId),
      fromToken,
      toToken,
      fromAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      toAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      fromAmount: fromAmountSmallest,
    });
    const res = await fetch(`/api/quote?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();

    // Extract cost info from the quote response
    const estimate = data.estimate;
    if (!estimate) return null;

    const fromAmountUSD = Number(estimate.fromAmountUSD ?? 0);
    const toAmountUSD = Number(estimate.toAmountUSD ?? 0);
    const gasCosts = estimate.gasCosts ?? [];
    const feeCosts = estimate.feeCosts ?? [];

    const gasCostUSD = gasCosts.reduce((sum: number, g: { amountUSD?: string }) => sum + Number(g.amountUSD ?? 0), 0);
    const bridgeFeeUSD = feeCosts.reduce((sum: number, f: { amountUSD?: string }) => sum + Number(f.amountUSD ?? 0), 0);
    const slippageCostUSD = Math.max(0, fromAmountUSD - toAmountUSD - gasCostUSD - bridgeFeeUSD);
    const totalCostUSD = gasCostUSD + bridgeFeeUSD + slippageCostUSD;

    // Estimate bridge time from execution duration
    const executionDuration = data.action?.executionDuration ?? estimate.executionDuration ?? 300;
    const bridgeTimeMin = Math.ceil(executionDuration / 60);

    return { gasCostUSD, bridgeFeeUSD, slippageCostUSD, totalCostUSD, bridgeTimeMin };
  } catch {
    return null;
  }
}

export function calculateNetYield(
  depositAmount: number,
  apyPercent: number,
  frictionCost: number,
  holdingDays: number
): {
  grossYield: number;
  netYield: number;
  breakEvenDays: number;
  netAPY: number;
} {
  const dailyRate = apyPercent / 100 / 365;
  const grossYield = depositAmount * dailyRate * holdingDays;
  const netYield = grossYield - frictionCost;
  const breakEvenDays =
    dailyRate > 0 ? frictionCost / (depositAmount * dailyRate) : Infinity;
  const netAPY =
    holdingDays > 0
      ? ((netYield / depositAmount) * 365 * 100) / holdingDays
      : 0;

  return { grossYield, netYield, breakEvenDays, netAPY };
}
