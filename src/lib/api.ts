export type YieldType = "lending" | "staking" | "farming" | "strategy" | "lp";

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
  yieldType: YieldType;
  hasReward: boolean;
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
  tags?: string[];
  [key: string]: unknown;
}

/** Classify vault into a yield type based on protocol and data */
function classifyYieldType(proto: string, tags: string[], tokenCount: number, hasReward: boolean, tokenSymbol: string): YieldType {
  const p = proto.toLowerCase();
  const sym = tokenSymbol.toLowerCase();
  // Staking protocols or liquid staking tokens
  if (p.includes("ether.fi") || p.includes("etherfi") || p.includes("kelp") || p.includes("kinetiq") || p.includes("lido") || p.includes("stake") || p.includes("rocket") || p.includes("stader")) return "staking";
  if (sym.includes("steth") || sym.includes("reth") || sym.includes("weeth") || sym.includes("cbeth") || sym.includes("sfrx")) return "staking";
  // Strategy / aggregator / synthetic protocols
  if (p.includes("pendle") || p.includes("yearn") || p.includes("beefy") || p.includes("convex") || p.includes("ethena") || p.includes("sommelier") || p.includes("gearbox")) return "strategy";
  // LP / multi-token
  if (tokenCount > 1 || tags.includes("multi") || tags.includes("il-risk")) return "lp";
  // Has extra reward tokens → farming
  if (hasReward) return "farming";
  // Default: lending (aave, morpho, euler, spark, fluid, etc.)
  return "lending";
}

function mapRawVault(v: EarnApiVault): Vault {
  const tags = v.tags ?? [];
  const reward = v.analytics?.apy?.reward;
  const hasReward = typeof reward === "number" && reward > 0;
  const tokenCount = v.underlyingTokens?.length ?? 1;
  const proto = v.protocol?.name ?? v.protocol?.key ?? "Unknown";
  return {
    address: v.address ?? "",
    chainId: v.chainId ?? 0,
    protocol: proto,
    protocolUrl: (v.protocol?.url as string) ?? "",
    name: v.name ?? "Unknown Vault",
    apy: v.analytics?.apy?.total ?? 0,
    apy7d: v.analytics?.apy7d ?? 0,
    apy30d: v.analytics?.apy30d ?? 0,
    tvl: Number(v.analytics?.tvl?.usd ?? 0),
    tokenSymbol: v.underlyingTokens?.[0]?.symbol ?? "???",
    tokenAddress: v.underlyingTokens?.[0]?.address ?? "",
    tokenDecimals: v.underlyingTokens?.[0]?.decimals ?? 18,
    yieldType: classifyYieldType(proto, tags as string[], tokenCount, hasReward, v.underlyingTokens?.[0]?.symbol ?? ""),
    hasReward,
  };
}

export async function fetchVaults(): Promise<Vault[]> {
  const allVaults: Vault[] = [];
  let cursor: string | undefined;

  const MAX_PAGES = 20;
  let page = 0;

  do {
    const url = cursor
      ? `/api/earn/vaults?cursor=${encodeURIComponent(cursor)}`
      : "/api/earn/vaults";

    let res: Response;
    let retries = 0;
    const MAX_RETRIES = 3;

    // Retry with exponential backoff on 429 (rate limit)
    while (true) {
      res = await fetch(url);
      if (res.status === 429 && retries < MAX_RETRIES) {
        retries++;
        await new Promise((r) => setTimeout(r, 1000 * 2 ** retries));
        continue;
      }
      break;
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch vaults (page ${page}): HTTP ${res.status}`);
    }

    const json = await res.json();
    const rawVaults: EarnApiVault[] = Array.isArray(json)
      ? json
      : json.data ?? json.vaults ?? [];

    const mapped = rawVaults.map(mapRawVault).filter((v) => v.address && v.chainId);
    allVaults.push(...mapped);

    cursor = Array.isArray(json) ? undefined : json.nextCursor;
    page++;

    // Small delay between pages to avoid rate limiting
    if (cursor) await new Promise((r) => setTimeout(r, 200));
  } while (cursor && page < MAX_PAGES);

  return allVaults;
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
  slippageBps: number = 30,
  sourceChainName: string = "",
  destChainName: string = "",
): FrictionCost {
  const gasCostUSD = sourceChainGas + destChainGas;
  const bridgeFeeUSD = (sourceBridgeCost + destBridgeCost) / 2;
  const slippageCostUSD = (amount * slippageBps) / 10000;
  const totalCostUSD = gasCostUSD + bridgeFeeUSD + slippageCostUSD;
  const bridgeTimeMin = Math.max(sourceBridgeTime, destBridgeTime);

  return {
    sourceChain: sourceChainName,
    destChain: destChainName,
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
      fromAddress: "0x0000000000000000000000000000000000000001",
      toAddress: "0x0000000000000000000000000000000000000001",
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

// ── APY display helpers (single source of truth) ──────────────────
// The Earn API returns APY values already as percentages (e.g. 3.80 = 3.80%).
// NEVER multiply by 100 — use these helpers everywhere.

/** Format an APY value for display, e.g. 3.7984 → "3.80%" */
export function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`;
}

/** Color class based on APY percentage */
export function getAPYColor(apy: number): string {
  if (apy >= 20) return "text-green";
  if (apy >= 10) return "text-yellow";
  return "text-accent";
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
