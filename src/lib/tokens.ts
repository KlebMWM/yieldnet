export interface TokenInfo {
  symbol: string;
  name: string;
  priceUSD: number;
  iconUrl: string;
  category: "base" | "stable" | "major" | "alt";
}

const CI = "https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color";

// Common tokens on LI.FI supported chains
// Prices are approximate references; in production you'd fetch from an API
export const TOKENS: TokenInfo[] = [
  { symbol: "USD",  name: "US Dollar",    priceUSD: 1,     iconUrl: `${CI}/usd.svg`,  category: "base" },
  { symbol: "USDC", name: "USD Coin",     priceUSD: 1,     iconUrl: `${CI}/usdc.svg`, category: "stable" },
  { symbol: "USDT", name: "Tether",       priceUSD: 1,     iconUrl: `${CI}/usdt.svg`, category: "stable" },
  { symbol: "DAI",  name: "Dai",          priceUSD: 1,     iconUrl: `${CI}/dai.svg`,  category: "stable" },
  { symbol: "ETH",  name: "Ethereum",     priceUSD: 1800,  iconUrl: `${CI}/eth.svg`,  category: "major" },
  { symbol: "WETH", name: "Wrapped ETH",  priceUSD: 1800,  iconUrl: `${CI}/eth.svg`,  category: "major" },
  { symbol: "WBTC", name: "Wrapped BTC",  priceUSD: 63000, iconUrl: `${CI}/btc.svg`,  category: "major" },
  { symbol: "BNB",  name: "BNB",          priceUSD: 580,   iconUrl: `${CI}/bnb.svg`,  category: "major" },
  { symbol: "MATIC",name: "Polygon",      priceUSD: 0.55,  iconUrl: `${CI}/matic.svg`,category: "alt" },
  { symbol: "ARB",  name: "Arbitrum",     priceUSD: 0.8,   iconUrl: `${CI}/eth.svg`,  category: "alt" },
  { symbol: "OP",   name: "Optimism",     priceUSD: 1.7,   iconUrl: `${CI}/eth.svg`,  category: "alt" },
  { symbol: "AVAX", name: "Avalanche",    priceUSD: 28,    iconUrl: `${CI}/avax.svg`, category: "alt" },
  { symbol: "LINK", name: "Chainlink",    priceUSD: 13,    iconUrl: `${CI}/link.svg`, category: "alt" },
  { symbol: "UNI",  name: "Uniswap",      priceUSD: 7.5,   iconUrl: `${CI}/uni.svg`,  category: "alt" },
  { symbol: "AAVE", name: "Aave",         priceUSD: 85,    iconUrl: `${CI}/aave.svg`, category: "alt" },
];

/** Get icon URL for any token symbol — checks known list, falls back to CDN guess */
export function getTokenIconUrl(symbol: string): string {
  const known = TOKENS.find((t) => t.symbol.toLowerCase() === symbol.toLowerCase());
  if (known) return known.iconUrl;
  // fallback: try cryptocurrency-icons CDN by lowercase symbol
  return `${CI}/${symbol.toLowerCase()}.svg`;
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
  if (symbol === "USD") return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (amount >= 1000) return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${symbol}`;
  if (amount >= 1) return `${amount.toFixed(4)} ${symbol}`;
  if (amount >= 0.0001) return `${amount.toFixed(6)} ${symbol}`;
  return `${amount.toExponential(2)} ${symbol}`;
}
