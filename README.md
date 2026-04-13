# YieldNet — Cross-Chain Yield Net Value Calculator

> **Is that 15% APY actually worth chasing across chains?**
>
> YieldNet answers this by calculating your real net profit after gas fees, bridge costs, and slippage — using live data from LI.FI APIs.

**Live Demo:** [yieldnet.vercel.app](https://yieldnet.vercel.app)

Built for the [DeFi Mullet Hackathon #1](https://jumper.exchange/defi-mullet-hackathon) by LI.FI.

---

## The Problem

DeFi users see high APY numbers on different chains and protocols, but cross-chain friction costs are invisible:

- Gas fees on source and destination chains
- Bridge fees
- Slippage during token swaps

A vault showing 10% APY might actually yield **negative returns** after round-trip costs — especially for smaller deposits. No existing tool calculates this.

## The Solution

YieldNet pulls real vault data and real-time bridge quotes from LI.FI, then shows you:

- **Net yield** after all cross-chain costs
- **Break-even days** — how long you need to stay deposited to profit
- **Net APY** — the actual effective rate after friction

## Features

| Feature | Description |
|---------|-------------|
| **Yield Explorer** | Browse 600+ vaults across 20+ chains, filtered by yield type (lending, staking, farming, strategy), chain, and protocol |
| **Cost Calculator** | Real-time cross-chain cost breakdown with live quotes from LI.FI Composer API |
| **Net Value Dashboard** | 4 interactive charts: yield over time, break-even crossover, break-even by deposit size, net APY by deposit size |
| **Deposit Flow** | Guided steps to bridge via Jumper Exchange and deposit into the protocol |
| **Multi-language** | English, Traditional Chinese, Simplified Chinese |
| **Dark/Light Theme** | System-aware with manual toggle |

## LI.FI API Integration

### Earn API — Vault Discovery

```
GET /api/earn/vaults → proxied to earn.li.fi/v1/earn/vaults
```

- Fetches all available yield vaults across supported chains
- Extracts APY (current, 7-day, 30-day), TVL, protocol info, underlying tokens
- Classifies each vault into yield types based on protocol name, token symbol, tags, and reward data

### Composer API — Real-Time Bridge Quotes

```
GET /api/quote → proxied to li.quest/v1/quote (server-side, API key protected)
```

- Fetches live cross-chain cost quotes for any chain pair
- Returns gas costs, bridge fees, estimated slippage, and execution time
- Uses debounced requests (800ms) to avoid excessive API calls
- Falls back to static estimates when quotes are unavailable or same-chain

### Why Server-Side Proxy?

The Composer API requires an API key (`x-lifi-api-key` header). We use a Next.js API route to proxy requests server-side, keeping the key out of client-side code.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Next.js App (React 19, Tailwind v4)            │
│                                                 │
│  /explore ──→ Earn API ──→ Vault list + filters │
│  /calculator ──→ Composer API ──→ Live quotes   │
│  /dashboard ──→ recharts ──→ Net yield analysis │
│  /deposit ──→ Jumper Exchange ──→ Bridge + Dep  │
└─────────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
   earn.li.fi/v1            li.quest/v1
   (no auth)               (API key via proxy)
```

## Tech Stack

- **Framework:** Next.js 16.2 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 with CSS custom properties
- **Charts:** Recharts
- **Wallet:** RainbowKit v2 + wagmi v2 + viem
- **APIs:** LI.FI Earn API, LI.FI Composer API
- **Deployment:** Vercel

## Getting Started

```bash
# Clone
git clone https://github.com/KlebMWM/yieldnet.git
cd yieldnet

# Install
npm install

# Set up environment
cp .env.local.example .env.local
# Add your LI.FI API key:
# LIFI_API_KEY=your-key-here

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Screenshots

### Yield Explorer
Filter vaults by chain, protocol, and yield type (lending, staking, farming, strategy).

### Cost Calculator
Real-time cross-chain cost breakdown with live quotes from LI.FI Composer API.

### Net Value Dashboard
Interactive charts showing break-even analysis and net APY by deposit size.

## Known Limitations

YieldNet is a hackathon prototype. A few things to be aware of when reading the numbers:

- **Cost model is round-trip and partly heuristic.** The calculator assumes you bridge in *and* out (`one-way cost × 2`). When LI.FI Composer returns a live quote we use the real gas + bridge fee + observed slippage; otherwise we fall back to per-chain static averages from `src/lib/chains.ts`. Same-chain routes skip the bridge fee entirely.
- **Non-stablecoin token prices are static reference values.** USD conversion for ETH, WBTC, BNB, and other non-stables uses hardcoded prices in `src/lib/tokens.ts`. Stablecoins (USDC/USDT/DAI/USDe/etc.) are pinned to $1. If you input a non-stable amount, the underlying friction calculation (`amount × slippage_bps`) will be off by however much the static price drifts from spot. Stablecoin and USD-denominated inputs are accurate.
- **APY values come straight from the LI.FI Earn API.** Some vaults occasionally show stale or divergent APYs vs. the protocol's own page — the explorer surfaces a warning modal before navigating to deposit. We don't second-guess the API.
- **`yieldType` is client-side classified** from protocol name, token symbol, and tags — not an official Earn API field.
- **Wallet is connected via RainbowKit but not yet used in the calculation.** Source chain is selected manually.

## What's Next

- Wallet-aware source chain detection
- Live token price feed (replace static `tokens.ts` references)
- Historical APY trend charts
- Portfolio tracking across multiple positions
- Direct deposit execution via LI.FI SDK

## API Feedback for LI.FI

The Earn API is simple and effective — no auth needed, clean response format. Suggestions:

- **Add a `yieldType` field** to vault responses (lending/staking/farming/lp/strategy) — currently we classify on the client side using heuristics
- **Add `tags` variety** — currently only `single` and `stablecoin` exist, more granular tags would help filtering
- **Expose historical APY data points** — `apy7d` and `apy30d` are great, daily granularity would enable trend charts

## Author

Built by **Megan Feng** — [X @klebsiellamegan](https://x.com/klebsiellamegan) · [GitHub](https://github.com/KlebMWM)

## License

MIT
