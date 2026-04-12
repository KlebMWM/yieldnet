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
  // Stablecoins
  { symbol: "USDC",  name: "USD Coin",       priceUSD: 1,     iconUrl: `${CG}/6319/small/usdc.png`, category: "stable" },
  { symbol: "USDT",  name: "Tether",         priceUSD: 1,     iconUrl: `${CG}/325/small/Tether.png`, category: "stable" },
  { symbol: "DAI",   name: "Dai",            priceUSD: 1,     iconUrl: `${CG}/9956/small/Badge_Dai.png`, category: "stable" },
  { symbol: "USDe",  name: "Ethena USDe",    priceUSD: 1,     iconUrl: `${CG}/33613/small/usde.png`, category: "stable" },
  { symbol: "sUSDe", name: "Staked USDe",    priceUSD: 1,     iconUrl: `${CG}/33669/small/sUSDe.png`, category: "stable" },
  { symbol: "PYUSD", name: "PayPal USD",     priceUSD: 1,     iconUrl: `${CG}/31212/small/PYUSD_Logo_%282%29.png`, category: "stable" },
  { symbol: "RLUSD", name: "Ripple USD",     priceUSD: 1,     iconUrl: `${CG}/53882/small/rlusd.png`, category: "stable" },
  { symbol: "USDS",  name: "Sky USD",        priceUSD: 1,     iconUrl: `${CG}/38965/small/usds.png`, category: "stable" },
  { symbol: "USDtb", name: "USD Tab",        priceUSD: 1,     iconUrl: `${CG}/325/small/Tether.png`, category: "stable" },
  { symbol: "USDai", name: "USD AI",         priceUSD: 1,     iconUrl: `${CG}/9956/small/Badge_Dai.png`, category: "stable" },
  { symbol: "USDT0", name: "USDT0",          priceUSD: 1,     iconUrl: `${CG}/325/small/Tether.png`, category: "stable" },
  { symbol: "EURC",  name: "Euro Coin",      priceUSD: 1.08,  iconUrl: `${CG}/26045/small/euro-coin.png`, category: "stable" },
  // Major
  { symbol: "ETH",   name: "Ethereum",       priceUSD: 1800,  iconUrl: `${CG}/279/small/ethereum.png`, category: "major" },
  { symbol: "WETH",  name: "Wrapped ETH",    priceUSD: 1800,  iconUrl: `${CG}/2518/small/weth.png`, category: "major" },
  { symbol: "WBTC",  name: "Wrapped BTC",    priceUSD: 63000, iconUrl: `${CG}/7598/small/wrapped_bitcoin_wbtc.png`, category: "major" },
  { symbol: "BNB",   name: "BNB",            priceUSD: 580,   iconUrl: `${CG}/825/small/bnb-icon2_2x.png`, category: "major" },
  { symbol: "wstETH",name: "Wrapped stETH",  priceUSD: 2050,  iconUrl: `${CG}/18834/small/wstETH.png`, category: "major" },
  { symbol: "weETH", name: "Wrapped eETH",   priceUSD: 1850,  iconUrl: `${CG}/33033/small/weETH.png`, category: "major" },
  { symbol: "rsETH", name: "Kelp rsETH",     priceUSD: 1830,  iconUrl: `${CG}/33800/small/Icon___Dark.png`, category: "major" },
  // Alt
  { symbol: "MATIC", name: "Polygon",        priceUSD: 0.55,  iconUrl: `${CG}/4713/small/polygon.png`, category: "alt" },
  { symbol: "ARB",   name: "Arbitrum",        priceUSD: 0.8,   iconUrl: `${CG}/16547/small/arb.png`, category: "alt" },
  { symbol: "OP",    name: "Optimism",        priceUSD: 1.7,   iconUrl: `${CG}/25244/small/Optimism.png`, category: "alt" },
  { symbol: "AVAX",  name: "Avalanche",       priceUSD: 28,    iconUrl: `${CG}/12559/small/Avalanche_Circle_RedWhite_Trans.png`, category: "alt" },
  { symbol: "LINK",  name: "Chainlink",       priceUSD: 13,    iconUrl: `${CG}/877/small/chainlink-new-logo.png`, category: "alt" },
  { symbol: "UNI",   name: "Uniswap",         priceUSD: 7.5,   iconUrl: `${CG}/12504/small/uniswap-logo.png`, category: "alt" },
  { symbol: "AAVE",  name: "Aave",            priceUSD: 85,    iconUrl: `${CG}/12645/small/aave-token.png`, category: "alt" },
];

/** Get icon URL for any token symbol — checks known list, then CDN fallback */
export function getTokenIconUrl(symbol: string): string {
  const lower = symbol.toLowerCase();
  const known = TOKENS.find((t) => t.symbol.toLowerCase() === lower);
  if (known) return known.iconUrl;
  // fallback: try cryptocurrency-icons CDN by lowercase symbol
  return `${CI}/${lower}.svg`;
}

export function getToken(symbol: string): TokenInfo {
  const lower = symbol.toLowerCase();
  return TOKENS.find((t) => t.symbol.toLowerCase() === lower) ?? TOKENS[0];
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
