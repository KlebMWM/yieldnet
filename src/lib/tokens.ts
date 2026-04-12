export interface TokenInfo {
  symbol: string;
  name: string;
  priceUSD: number;
  iconUrl: string;
  category: "base" | "stable" | "major" | "alt";
}

// Use multiple CDN sources for reliability
const CI = "https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color";
const CG = "https://assets.coingecko.com/coins/images";

// Common tokens on LI.FI supported chains
// Prices are approximate references; in production you'd fetch from an API
export const TOKENS: TokenInfo[] = [
  { symbol: "USDC", name: "USD Coin",     priceUSD: 1,     iconUrl: `${CG}/6319/small/usdc.png`, category: "stable" },
  { symbol: "USDT", name: "Tether",       priceUSD: 1,     iconUrl: `${CG}/325/small/Tether.png`, category: "stable" },
  { symbol: "DAI",  name: "Dai",          priceUSD: 1,     iconUrl: `${CG}/9956/small/Badge_Dai.png`, category: "stable" },
  { symbol: "ETH",  name: "Ethereum",     priceUSD: 1800,  iconUrl: `${CG}/279/small/ethereum.png`, category: "major" },
  { symbol: "WETH", name: "Wrapped ETH",  priceUSD: 1800,  iconUrl: `${CG}/2518/small/weth.png`, category: "major" },
  { symbol: "WBTC", name: "Wrapped BTC",  priceUSD: 63000, iconUrl: `${CG}/7598/small/wrapped_bitcoin_wbtc.png`, category: "major" },
  { symbol: "BNB",  name: "BNB",          priceUSD: 580,   iconUrl: `${CG}/825/small/bnb-icon2_2x.png`, category: "major" },
  { symbol: "MATIC",name: "Polygon",      priceUSD: 0.55,  iconUrl: `${CG}/4713/small/polygon.png`, category: "alt" },
  { symbol: "ARB",  name: "Arbitrum",     priceUSD: 0.8,   iconUrl: `${CG}/16547/small/arb.png`, category: "alt" },
  { symbol: "OP",   name: "Optimism",     priceUSD: 1.7,   iconUrl: `${CG}/25244/small/Optimism.png`, category: "alt" },
  { symbol: "AVAX", name: "Avalanche",    priceUSD: 28,    iconUrl: `${CG}/12559/small/Avalanche_Circle_RedWhite_Trans.png`, category: "alt" },
  { symbol: "LINK", name: "Chainlink",    priceUSD: 13,    iconUrl: `${CG}/877/small/chainlink-new-logo.png`, category: "alt" },
  { symbol: "UNI",  name: "Uniswap",      priceUSD: 7.5,   iconUrl: `${CG}/12504/small/uniswap-logo.png`, category: "alt" },
  { symbol: "AAVE", name: "Aave",         priceUSD: 85,    iconUrl: `${CG}/12645/small/aave-token.png`, category: "alt" },
];

/** Extra icon mappings for tokens from LI.FI Earn API that aren't in TOKENS list */
const EXTRA_ICONS: Record<string, string> = {
  "wsteth":  `${CG}/18834/small/wstETH.png`,
  "steth":   `${CG}/13442/small/steth_logo.png`,
  "weeth":   `${CG}/33033/small/weETH.png`,
  "rseth":   `${CG}/33800/small/Icon___Dark.png`,
  "wrseth":  `${CG}/33800/small/Icon___Dark.png`,
  "cbeth":   `${CG}/27008/small/cbeth.png`,
  "reth":    `${CG}/20764/small/reth.png`,
  "usde":    `${CG}/33613/small/usde.png`,
  "susde":   `${CG}/33669/small/sUSDe.png`,
  "usdtb":   `${CG}/325/small/Tether.png`,
  "usds":    `${CG}/38965/small/usds.png`,
  "usdai":   `${CG}/9956/small/Badge_Dai.png`,
  "pyusd":   `${CG}/31212/small/PYUSD_Logo_%282%29.png`,
  "rlusd":   `${CG}/53882/small/rlusd.png`,
  "eurc":    `${CG}/26045/small/euro-coin.png`,
  "eurcv":   `${CG}/26045/small/euro-coin.png`,
  "frxusd":  `${CG}/13423/small/Frax_Shares_icon.png`,
  "usdt0":   `${CG}/325/small/Tether.png`,
};

/** Get icon URL for any token symbol — checks known list, extra map, then CDN fallback */
export function getTokenIconUrl(symbol: string): string {
  const lower = symbol.toLowerCase();
  const known = TOKENS.find((t) => t.symbol.toLowerCase() === lower);
  if (known) return known.iconUrl;
  const extra = EXTRA_ICONS[lower];
  if (extra) return extra;
  // fallback: try cryptocurrency-icons CDN by lowercase symbol
  return `${CI}/${lower}.svg`;
}

export function getToken(symbol: string): TokenInfo {
  return TOKENS.find((t) => t.symbol === symbol) ?? TOKENS[0];
}

export function toUSD(amount: number, symbol: string): number {
  return amount * getToken(symbol).priceUSD;
}

export function fromUSD(usd: number, symbol: string): number {
  const price = getToken(symbol).priceUSD;
  return price > 0 ? usd / price : 0;
}

export function formatTokenAmount(amount: number, symbol: string): string {
  if (amount >= 1000) return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}`;
  if (amount >= 1) return `${amount.toFixed(4)} ${symbol}`;
  if (amount >= 0.0001) return `${amount.toFixed(6)} ${symbol}`;
  return `${amount.toExponential(2)} ${symbol}`;
}
