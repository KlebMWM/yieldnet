"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Locale = "en" | "zh-TW" | "zh-CN";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  "zh-TW": "繁中",
  "zh-CN": "简中",
};

export { LOCALE_LABELS };

// ---------- dictionary ----------

const dict = {
  // nav
  "nav.home": { en: "Home", "zh-TW": "首頁", "zh-CN": "首页" },
  "nav.explore": { en: "Explore", "zh-TW": "收益探索", "zh-CN": "收益探索" },
  "nav.calculator": { en: "Calculator", "zh-TW": "成本計算", "zh-CN": "成本计算" },
  "nav.dashboard": { en: "Dashboard", "zh-TW": "淨值分析", "zh-CN": "净值分析" },

  // home hero
  "home.badge": { en: "DeFi Mullet Hackathon #1", "zh-TW": "DeFi Mullet Hackathon #1", "zh-CN": "DeFi Mullet Hackathon #1" },
  "home.title.prefix": { en: "Know Your", "zh-TW": "看見你的", "zh-CN": "看见你的" },
  "home.title.highlight": { en: "True Yield", "zh-TW": "真實收益", "zh-CN": "真实收益" },
  "home.subtitle1": {
    en: "DeFi offers lending, liquidity pools, yield farming, staking, and more — spread across dozens of chains",
    "zh-TW": "DeFi 世界有借貸、流動性池、收益耕作、質押等各種收益機會，分佈在數十條鏈上",
    "zh-CN": "DeFi 世界有借贷、流动性池、收益耕作、质押等各种收益机会，分布在数十条链上",
  },
  "home.subtitle2": {
    en: "But transferring assets cross-chain costs gas, fees, and slippage",
    "zh-TW": "但將資產轉移到其他鏈上，需要支付 Gas、手續費和滑點",
    "zh-CN": "但将资产转移到其他链上，需要支付 Gas、手续费和滑点",
  },
  "home.subtitle3": {
    en: "YieldNet shows you the real return after all those hidden costs",
    "zh-TW": "YieldNet 幫你算出扣除這些隱藏成本後的實際收益",
    "zh-CN": "YieldNet 帮你算出扣除这些隐藏成本后的实际收益",
  },
  "home.cta.explore": { en: "Start Exploring", "zh-TW": "開始探索", "zh-CN": "开始探索" },
  "home.cta.calc": { en: "Calculate Costs", "zh-TW": "計算成本", "zh-CN": "计算成本" },

  // home explainer — yield types
  "home.yield.title": { en: "Yield Types YieldNet Covers", "zh-TW": "YieldNet 涵蓋的收益類型", "zh-CN": "YieldNet 涵盖的收益类型" },
  "home.yield.lending": { en: "Lending", "zh-TW": "借貸", "zh-CN": "借贷" },
  "home.yield.lending.desc": { en: "Earn interest by supplying assets to protocols like Aave and Morpho", "zh-TW": "將資產存入 Aave、Morpho 等協議賺取利息", "zh-CN": "将资产存入 Aave、Morpho 等协议赚取利息" },
  "home.yield.lp": { en: "Liquidity Pools", "zh-TW": "流動性池", "zh-CN": "流动性池" },
  "home.yield.lp.desc": { en: "Provide liquidity on Uniswap, Curve, etc. and earn trading fees", "zh-TW": "在 Uniswap、Curve 等提供流動性，賺取交易手續費", "zh-CN": "在 Uniswap、Curve 等提供流动性，赚取交易手续费" },
  "home.yield.farming": { en: "Yield Farming", "zh-TW": "收益耕作", "zh-CN": "收益耕作" },
  "home.yield.farming.desc": { en: "Stake LP tokens for bonus token rewards from protocols", "zh-TW": "質押 LP 代幣，獲取協議額外發放的獎勵代幣", "zh-CN": "质押 LP 代币，获取协议额外发放的奖励代币" },
  "home.yield.staking": { en: "Staking", "zh-TW": "質押", "zh-CN": "质押" },
  "home.yield.staking.desc": { en: "Lock tokens to secure the network and earn staking rewards", "zh-TW": "鎖定代幣支持網路安全運作，獲取質押獎勵", "zh-CN": "锁定代币支持网络安全运作，获取质押奖励" },
  "home.yield.strategy": { en: "Strategies", "zh-TW": "組合策略", "zh-CN": "组合策略" },
  "home.yield.strategy.desc": { en: "Auto-compounding, leveraged farming, and multi-step strategies", "zh-TW": "自動複利、槓桿耕作、多步驟組合等進階策略", "zh-CN": "自动复利、杠杆耕作、多步骤组合等进阶策略" },

  // home problem/solution
  "home.problem.title": { en: "The Hidden Cost Problem", "zh-TW": "隱藏成本的陷阱", "zh-CN": "隐藏成本的陷阱" },
  "home.problem.desc": {
    en: "You see a pool offering 15% APY on another chain. Looks great! But to get there, you pay gas + cross-chain fees + slippage. And when you want to leave, you pay again. After all that, your real return might only be 3% — or even negative.",
    "zh-TW": "你看到另一條鏈上有個 15% APY 的收益池，看起來很棒！但把資產轉過去要付 Gas + 跨鏈手續費 + 滑點，想離開時又要再付一次。扣完這些，你的實際報酬可能只剩 3%——甚至是虧損。",
    "zh-CN": "你看到另一条链上有个 15% APY 的收益池，看起来很棒！但把资产转过去要付 Gas + 跨链手续费 + 滑点，想离开时又要再付一次。扣完这些，你的实际报酬可能只剩 3%——甚至是亏损。",
  },
  "home.solution.title": { en: "YieldNet Shows the Real Numbers", "zh-TW": "YieldNet 算給你看", "zh-CN": "YieldNet 算给你看" },
  "home.solution.desc": {
    en: "We calculate the true yield after ALL cross-chain costs. See your break-even point, net APY, and whether that yield is actually worth chasing.",
    "zh-TW": "我們幫你算出扣除所有跨鏈成本後的真實收益。看到損益兩平天數、實得 APY，判斷這個收益到底值不值得投入",
    "zh-CN": "我们帮你算出扣除所有跨链成本后的真实收益。看到损益平衡天数、实得 APY，判断这个收益到底值不值得投入",
  },

  // home features
  "home.f1.title": { en: "Explore Yields", "zh-TW": "收益探索", "zh-CN": "收益探索" },
  "home.f1.desc": {
    en: "Browse 600+ DeFi yield pools across 20+ chains. Filter by APY, TVL, and protocol.",
    "zh-TW": "瀏覽超過 600 個 DeFi 收益池，橫跨 20+ 條鏈。依 APY、TVL、協議自由篩選",
    "zh-CN": "浏览超过 600 个 DeFi 收益池，横跨 20+ 条链。按 APY、TVL、协议自由筛选",
  },
  "home.f2.title": { en: "Cost Calculator", "zh-TW": "成本計算", "zh-CN": "成本计算" },
  "home.f2.desc": {
    en: "Estimate cross-chain friction costs: gas fees, transfer fees, and slippage at a glance.",
    "zh-TW": "估算跨鏈摩擦成本：Gas 費用、跨鏈手續費、滑點損耗，一目瞭然",
    "zh-CN": "估算跨链摩擦成本：Gas 费用、跨链手续费、滑点损耗，一目了然",
  },
  "home.f3.title": { en: "Net Yield Analysis", "zh-TW": "淨值分析", "zh-CN": "净值分析" },
  "home.f3.desc": {
    en: "See the true yield after deducting all cross-chain costs. Find your break-even point.",
    "zh-TW": "扣除所有跨鏈成本後的真實收益，找到你的損益兩平點",
    "zh-CN": "扣除所有跨链成本后的真实收益，找到你的损益平衡点",
  },
  "home.go": { en: "Go", "zh-TW": "前往", "zh-CN": "前往" },

  // home how-it-works
  "home.how": { en: "How YieldNet Works", "zh-TW": "YieldNet 如何運作", "zh-CN": "YieldNet 如何运作" },
  "home.s1.title": { en: "Find High-Yield Pools", "zh-TW": "發現高收益池", "zh-CN": "发现高收益池" },
  "home.s1.desc": {
    en: "Browse cross-chain DeFi yield pools via the LI.FI Earn API. Filter by APY, TVL, and protocol.",
    "zh-TW": "透過 LI.FI Earn API 即時瀏覽跨鏈 DeFi 收益池，按 APY、TVL、協議篩選",
    "zh-CN": "通过 LI.FI Earn API 实时浏览跨链 DeFi 收益池，按 APY、TVL、协议筛选",
  },
  "home.s2.title": { en: "Estimate Friction Costs", "zh-TW": "估算摩擦成本", "zh-CN": "估算摩擦成本" },
  "home.s2.desc": {
    en: "Calculate the gas fees, cross-chain transfer fees, and slippage for moving assets.",
    "zh-TW": "計算從你目前所在鏈移動資產所需的 Gas 費、跨鏈手續費和滑點",
    "zh-CN": "计算从你目前所在链移动资产所需的 Gas 费、跨链手续费和滑点",
  },
  "home.s3.title": { en: "See Net Yield", "zh-TW": "看見淨收益", "zh-CN": "看见净收益" },
  "home.s3.desc": {
    en: "Compare gross vs net yield, find your break-even point, and make informed decisions.",
    "zh-TW": "比較帳面收益與實得收益，找到損益兩平天數，做出明智的投資決策",
    "zh-CN": "比较账面收益与实得收益，找到损益平衡天数，做出明智的投资决策",
  },

  // explore
  "explore.title": { en: "Explore DeFi Yields", "zh-TW": "收益探索", "zh-CN": "收益探索" },
  "explore.sub": {
    en: "{count} yield pools across {chains} chains. Click to deposit or calculate costs.",
    "zh-TW": "共 {count} 個收益池，橫跨 {chains} 條鏈。點擊可直接存款或計算成本。",
    "zh-CN": "共 {count} 个收益池，横跨 {chains} 条链。点击可直接存款或计算成本。",
  },
  "explore.search": { en: "Search pools, protocols, tokens…", "zh-TW": "搜尋收益池、協議、代幣⋯", "zh-CN": "搜索收益池、协议、代币…" },
  "explore.allChains": { en: "All Chains", "zh-TW": "所有鏈", "zh-CN": "所有链" },
  "explore.allProtocols": { en: "All Protocols", "zh-TW": "所有協議", "zh-CN": "所有协议" },
  "explore.sortApy": { en: "Sort by APY", "zh-TW": "依 APY 排序", "zh-CN": "按 APY 排序" },
  "explore.sortTvl": { en: "Sort by TVL", "zh-TW": "依 TVL 排序", "zh-CN": "按 TVL 排序" },
  "explore.sortName": { en: "Sort by Name", "zh-TW": "依名稱排序", "zh-CN": "按名称排序" },
  "explore.loading": { en: "Loading yield pools from LI.FI Earn API…", "zh-TW": "正在從 LI.FI Earn API 載入收益池⋯", "zh-CN": "正在从 LI.FI Earn API 载入收益池…" },
  "explore.error": { en: "Failed to load", "zh-TW": "載入失敗", "zh-CN": "加载失败" },
  "explore.retry": { en: "Retry", "zh-TW": "重試", "zh-CN": "重试" },
  "explore.empty": { en: "No yield pools found matching your filters.", "zh-TW": "找不到符合條件的收益池。", "zh-CN": "找不到符合条件的收益池。" },
  "explore.showing": {
    en: "Showing 60 of {total} pools. Use filters to narrow results.",
    "zh-TW": "顯示 60 / {total} 個收益池，請使用篩選縮小範圍。",
    "zh-CN": "显示 60 / {total} 个收益池，请使用筛选缩小范围。",
  },

  // vault card
  "vault.chain": { en: "Chain", "zh-TW": "鏈", "zh-CN": "链" },

  // calculator
  "calc.title": { en: "Cross-Chain Cost Calculator", "zh-TW": "跨鏈成本計算器", "zh-CN": "跨链成本计算器" },
  "calc.sub": { en: "Estimate the friction costs of moving assets across chains and see your net yield.", "zh-TW": "估算跨鏈轉移資產的摩擦成本，並計算淨收益。", "zh-CN": "估算跨链转移资产的摩擦成本，并计算净收益。" },
  "calc.target": { en: "Calculating for", "zh-TW": "計算目標", "zh-CN": "计算目标" },
  "calc.route": { en: "Route Configuration", "zh-TW": "路由設定", "zh-CN": "路由设定" },
  "calc.from": { en: "From Chain", "zh-TW": "來源鏈", "zh-CN": "来源链" },
  "calc.to": { en: "To Chain", "zh-TW": "目標鏈", "zh-CN": "目标链" },
  "calc.currency": { en: "Currency", "zh-TW": "計價幣種", "zh-CN": "计价币种" },
  "calc.amount": { en: "Deposit Amount", "zh-TW": "存入金額", "zh-CN": "存入金额" },
  "calc.apy": { en: "Pool APY (%)", "zh-TW": "收益池 APY (%)", "zh-CN": "收益池 APY (%)" },
  "calc.days": { en: "Holding Period", "zh-TW": "持有天數", "zh-CN": "持有天数" },
  "calc.daysUnit": { en: "days", "zh-TW": "天", "zh-CN": "天" },
  "calc.day": { en: "day", "zh-TW": "天", "zh-CN": "天" },
  "calc.slippage": { en: "Estimated Slippage", "zh-TW": "預估滑點", "zh-CN": "预估滑点" },
  "calc.quoting": { en: "Fetching live quote…", "zh-TW": "正在取得即時報價⋯", "zh-CN": "正在获取实时报价…" },
  "calc.liveQuote": { en: "Live Quote", "zh-TW": "即時報價", "zh-CN": "实时报价" },
  "calc.estimated": { en: "Estimated", "zh-TW": "預估值", "zh-CN": "预估值" },
  "calc.oneWay": { en: "Cross-Chain Fees (one-way)", "zh-TW": "跨鏈費用（單次）", "zh-CN": "跨链费用（单次）" },
  "calc.gas": { en: "Gas Fees", "zh-TW": "Gas 費用", "zh-CN": "Gas 费用" },
  "calc.bridge": { en: "Cross-Chain Fee", "zh-TW": "跨鏈手續費", "zh-CN": "跨链手续费" },
  "calc.slippageCost": { en: "Slippage", "zh-TW": "滑點損耗", "zh-CN": "滑点损耗" },
  "calc.totalOneWay": { en: "Total (one-way)", "zh-TW": "合計（單次）", "zh-CN": "合计（单次）" },
  "calc.bridgeTime": { en: "Est. Transfer Time", "zh-TW": "預估跨鏈時間", "zh-CN": "预估跨链时间" },
  "calc.min": { en: "min", "zh-TW": "分鐘", "zh-CN": "分钟" },
  "calc.netAnalysis": { en: "Net Yield Analysis", "zh-TW": "淨收益分析", "zh-CN": "净收益分析" },
  "calc.roundTrip": { en: "Round-trip Cost (in + out)", "zh-TW": "來回總費用（進 + 出）", "zh-CN": "来回总费用（进 + 出）" },
  "calc.gross": { en: "Gross Yield", "zh-TW": "帳面收益", "zh-CN": "账面收益" },
  "calc.net": { en: "Net Yield", "zh-TW": "淨收益", "zh-CN": "净收益" },
  "calc.netApy": { en: "Net APY (annualized)", "zh-TW": "淨 APY（年化）", "zh-CN": "净 APY（年化）" },
  "calc.breakeven": { en: "Break-even", "zh-TW": "損益兩平", "zh-CN": "损益平衡" },
  "calc.never": { en: "Never", "zh-TW": "永不", "zh-CN": "永不" },
  "calc.viewDashboard": { en: "View Detailed Charts", "zh-TW": "查看詳細圖表分析", "zh-CN": "查看详细图表分析" },
  "calc.profitable": {
    en: "Profitable after {days} days. Over {holding} days you'd earn {amount} after all fees.",
    "zh-TW": "約 {days} 天後開始獲利。持有 {holding} 天，扣除所有費用後可賺 {amount}。",
    "zh-CN": "约 {days} 天后开始获利。持有 {holding} 天，扣除所有费用后可赚 {amount}。",
  },
  "calc.unprofitable": {
    en: "Would lose {amount} over {days} days. Consider holding longer or choosing a same-chain pool.",
    "zh-TW": "持有 {days} 天會虧損 {amount}。建議延長持有天數，或選擇同鏈上的收益池。",
    "zh-CN": "持有 {days} 天会亏损 {amount}。建议延长持有天数，或选择同链上的收益池。",
  },

  // dashboard
  "dash.back": { en: "Back to Calculator", "zh-TW": "返回計算器", "zh-CN": "返回计算器" },
  "dash.title": { en: "Net Yield Dashboard", "zh-TW": "淨值分析儀表板", "zh-CN": "净值分析仪表板" },
  "dash.gross": { en: "Gross Yield", "zh-TW": "帳面收益", "zh-CN": "账面收益" },
  "dash.friction": { en: "Friction Cost", "zh-TW": "摩擦成本", "zh-CN": "摩擦成本" },
  "dash.roundTrip": { en: "Round-trip", "zh-TW": "來回合計", "zh-CN": "来回合计" },
  "dash.net": { en: "Net Yield", "zh-TW": "淨收益", "zh-CN": "净收益" },
  "dash.breakeven": { en: "Break-even", "zh-TW": "損益兩平", "zh-CN": "损益平衡" },
  "dash.withinPeriod": { en: "Within holding period", "zh-TW": "在持有期內", "zh-CN": "在持有期内" },
  "dash.beyondPeriod": { en: "Beyond holding period", "zh-TW": "超出持有期", "zh-CN": "超出持有期" },
  "dash.chart1": { en: "Yield Over Time (Gross vs Net)", "zh-TW": "收益隨時間變化（帳面 vs 實得）", "zh-CN": "收益随时间变化（账面 vs 实得）" },
  "dash.chart2": { en: "Break-Even Crossover", "zh-TW": "損益兩平交叉點", "zh-CN": "损益平衡交叉点" },
  "dash.chart3": { en: "Break-even by Deposit Size", "zh-TW": "不同存入金額的損益兩平所需天數", "zh-CN": "不同存入金额的损益平衡所需天数" },
  "dash.chart3.note": {
    en: "Larger deposits recover friction costs faster because transfer fees are fixed while yield scales with deposit size.",
    "zh-TW": "存入金額越大，固定的跨鏈手續費和 Gas 費用佔比越低，回本越快。",
    "zh-CN": "存入金额越大，固定的跨链手续费和 Gas 费用占比越低，回本越快。",
  },
  "dash.chart4": { en: "Effective Net APY by Deposit Size", "zh-TW": "不同金額的有效淨 APY", "zh-CN": "不同金额的有效净 APY" },
  "dash.chart4.note": {
    en: "Small deposits lose a higher percentage to friction, making cross-chain DeFi less efficient for smaller amounts.",
    "zh-TW": "小額存款因摩擦成本佔比過高，跨鏈 DeFi 效率大幅降低。",
    "zh-CN": "小额存款因摩擦成本占比过高，跨链 DeFi 效率大幅降低。",
  },
  "dash.insight": { en: "Key Insight", "zh-TW": "重點分析", "zh-CN": "重点分析" },
  "dash.deposit": { en: "deposit", "zh-TW": "存入", "zh-CN": "存入" },
  "dash.grossLabel": { en: "Gross", "zh-TW": "帳面", "zh-CN": "账面" },
  "dash.netLabel": { en: "Net", "zh-TW": "淨", "zh-CN": "净" },

  // chart data keys
  "chart.grossYield": { en: "Gross Yield", "zh-TW": "帳面收益", "zh-CN": "账面收益" },
  "chart.netYield": { en: "Net Yield", "zh-TW": "實得收益", "zh-CN": "实得收益" },
  "chart.accumulated": { en: "Accumulated Yield", "zh-TW": "累計收益", "zh-CN": "累计收益" },
  "chart.totalFees": { en: "Total Fees", "zh-TW": "跨鏈總費用", "zh-CN": "跨链总费用" },
  "chart.breakeven.note1": {
    en: "The crossover point is where your accumulated yield covers all cross-chain fees.",
    "zh-TW": "交叉點就是你的累計收益剛好覆蓋所有跨鏈費用的時刻",
    "zh-CN": "交叉点就是你的累计收益刚好覆盖所有跨链费用的时刻",
  },
  "chart.breakeven.note2": {
    en: "After that point, you're in profit.",
    "zh-TW": "過了這個點就開始獲利",
    "zh-CN": "过了这个点就开始获利",
  },
  "chart.breakevenDays": { en: "Break-even Days", "zh-TW": "損益兩平天數", "zh-CN": "损益平衡天数" },
  "chart.netApy": { en: "Net APY", "zh-TW": "淨 APY", "zh-CN": "净 APY" },
  "chart.day": { en: "Day {d}", "zh-TW": "第 {d} 天", "zh-CN": "第 {d} 天" },

  // top yields
  "top.title": { en: "Top Yields Right Now", "zh-TW": "當前最佳收益", "zh-CN": "当前最佳收益" },
  "top.loading": { en: "Loading recommendations…", "zh-TW": "正在載入推薦⋯", "zh-CN": "正在加载推荐…" },
  "top.viewAll": { en: "View All Pools", "zh-TW": "查看所有收益池", "zh-CN": "查看所有收益池" },
  "top.calcCost": { en: "Calculate Cost", "zh-TW": "計算成本", "zh-CN": "计算成本" },

  // currency selector
  "currency.base": { en: "Fiat", "zh-TW": "法幣", "zh-CN": "法币" },
  "currency.stable": { en: "Stablecoins", "zh-TW": "穩定幣", "zh-CN": "稳定币" },
  "currency.major": { en: "Major Tokens", "zh-TW": "主流幣", "zh-CN": "主流币" },
  "currency.alt": { en: "Other Tokens", "zh-TW": "其他代幣", "zh-CN": "其他代币" },

  // deposit page
  "dep.title": { en: "Deposit to Pool", "zh-TW": "存入收益池", "zh-CN": "存入收益池" },
  "dep.back": { en: "Back to Home", "zh-TW": "返回首頁", "zh-CN": "返回首页" },
  "dep.vaultInfo": { en: "Pool Info", "zh-TW": "收益池資訊", "zh-CN": "收益池信息" },
  "dep.protocol": { en: "Protocol", "zh-TW": "協議", "zh-CN": "协议" },
  "dep.chain": { en: "Chain", "zh-TW": "所在鏈", "zh-CN": "所在链" },
  "dep.token": { en: "Token", "zh-TW": "代幣", "zh-CN": "代币" },
  "dep.apy": { en: "Current APY", "zh-TW": "當前 APY", "zh-CN": "当前 APY" },
  "dep.apy7d": { en: "7-Day Avg APY", "zh-TW": "7 日平均 APY", "zh-CN": "7 日平均 APY" },
  "dep.apy30d": { en: "30-Day Avg APY", "zh-TW": "30 日平均 APY", "zh-CN": "30 日平均 APY" },
  "dep.step1": { en: "Step 1 — Transfer Assets Cross-Chain", "zh-TW": "步驟一 — 跨鏈轉入資產", "zh-CN": "步骤一 — 跨链转入资产" },
  "dep.step1.desc": {
    en: "Use LI.FI to transfer your tokens to the target chain. Click below to open Jumper Exchange with the right chain pre-selected.",
    "zh-TW": "使用 LI.FI 將你的代幣跨鏈轉到目標鏈。點擊下方按鈕打開 Jumper Exchange，已預設正確的鏈。",
    "zh-CN": "使用 LI.FI 将你的代币跨链转到目标链。点击下方按钮打开 Jumper Exchange，已预设正确的链。",
  },
  "dep.bridge": { en: "Transfer via Jumper Exchange", "zh-TW": "透過 Jumper Exchange 跨鏈轉帳", "zh-CN": "通过 Jumper Exchange 跨链转账" },
  "dep.step2": { en: "Step 2 — Deposit to Pool", "zh-TW": "步驟二 — 存入收益池", "zh-CN": "步骤二 — 存入收益池" },
  "dep.step2.desc": {
    en: "Once your funds are on the target chain, deposit directly into the pool via the protocol's interface.",
    "zh-TW": "資金到達目標鏈後，透過協議的介面直接存入收益池。",
    "zh-CN": "资金到达目标链后，通过协议的界面直接存入收益池。",
  },
  "dep.openProtocol": { en: "Open {protocol} to Deposit", "zh-TW": "前往 {protocol} 存款", "zh-CN": "前往 {protocol} 存款" },
  "dep.calcCost": { en: "Calculate Costs First", "zh-TW": "先計算跨鏈成本", "zh-CN": "先计算跨链成本" },
  "dep.noUrl": {
    en: "No direct deposit link available. Search for this pool on the protocol's website.",
    "zh-TW": "暫無直接存款連結，請至協議官網搜尋此收益池。",
    "zh-CN": "暂无直接存款链接，请到协议官网搜索此收益池。",
  },
  "dep.poweredBy": { en: "Powered by LI.FI", "zh-TW": "由 LI.FI 提供支持", "zh-CN": "由 LI.FI 提供支持" },

  // historical APY
  "apy.current": { en: "Current", "zh-TW": "當前", "zh-CN": "当前" },
  "apy.7d": { en: "7D Avg", "zh-TW": "7 日均", "zh-CN": "7 日均" },
  "apy.30d": { en: "30D Avg", "zh-TW": "30 日均", "zh-CN": "30 日均" },
} as const;

type DictKey = keyof typeof dict;

// ---------- context ----------

const I18nContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
}>({
  locale: "zh-TW",
  setLocale: () => {},
  t: (key) => key,
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh-TW");

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale | null;
    if (saved && dict["nav.home"][saved]) {
      setLocaleState(saved);
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    document.documentElement.lang =
      l === "en" ? "en" : l === "zh-TW" ? "zh-Hant" : "zh-Hans";
  }

  function t(key: DictKey, vars?: Record<string, string | number>): string {
    const entry = dict[key];
    if (!entry) return key;
    let text: string = entry[locale] ?? entry["en"] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}
