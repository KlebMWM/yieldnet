"use client";

import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { getChainInfo, getChainList, USDC_ADDRESSES } from "@/lib/chains";
import { estimateFrictionCost, calculateNetYield, fetchRealQuote, FrictionCost } from "@/lib/api";
import { toUSD, fromUSD, formatTokenAmount, getToken } from "@/lib/tokens";
import CurrencySelector from "@/components/CurrencySelector";
import { useI18n } from "@/lib/i18n";
import { ArrowRight, Clock, Fuel, ArrowLeftRight, TrendingDown, BarChart3, Info, Zap } from "lucide-react";
import Link from "next/link";

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-5 py-20 text-center text-base text-muted">…</div>}>
      <CalculatorContent />
    </Suspense>
  );
}

function CalculatorContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const chains = getChainList();

  const presetVault = searchParams.get("vault");
  const presetChain = searchParams.get("chain");
  const presetApy = searchParams.get("apy");
  const presetProtocol = searchParams.get("protocol");
  const presetToken = searchParams.get("token");

  const [sourceChainId, setSourceChainId] = useState(1);
  const [destChainId, setDestChainId] = useState(presetChain ? Number(presetChain) : 42161);
  const [currency, setCurrency] = useState(presetToken || "USDC");
  const [amount, setAmount] = useState(() => presetToken && presetToken !== "USD" ? fromUSD(1000, presetToken) : 1000);
  const [apy, setApy] = useState(presetApy ? Number(presetApy) : 8);
  const [holdingDays, setHoldingDays] = useState(90);
  const [slippageBps, setSlippageBps] = useState(30);
  const [liveQuote, setLiveQuote] = useState<{ gasCostUSD: number; bridgeFeeUSD: number; slippageCostUSD: number; totalCostUSD: number; bridgeTimeMin: number } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [isLiveData, setIsLiveData] = useState(false);

  const amountUSD = toUSD(amount, currency);
  const sourceChain = getChainInfo(sourceChainId);
  const destChain = getChainInfo(destChainId);

  // Fetch real quote from LI.FI Composer when chains differ
  const fetchQuote = useCallback(async () => {
    if (sourceChainId === destChainId || amountUSD < 1) {
      setLiveQuote(null);
      setIsLiveData(false);
      return;
    }
    const fromToken = USDC_ADDRESSES[sourceChainId];
    const toToken = USDC_ADDRESSES[destChainId];
    if (!fromToken || !toToken) {
      setLiveQuote(null);
      setIsLiveData(false);
      return;
    }
    // USDC has 6 decimals
    const fromAmount = String(Math.round(Math.min(amountUSD, 100000) * 1e6));
    setQuoteLoading(true);
    const result = await fetchRealQuote(sourceChainId, destChainId, fromToken, toToken, fromAmount);
    setQuoteLoading(false);
    if (result) {
      // Scale slippage proportionally if actual amount differs from quote amount
      const quotedAmountUSD = Math.min(amountUSD, 100000);
      const scale = amountUSD / quotedAmountUSD;
      setLiveQuote({
        ...result,
        slippageCostUSD: result.slippageCostUSD * scale,
        totalCostUSD: result.gasCostUSD + result.bridgeFeeUSD + result.slippageCostUSD * scale,
      });
      setIsLiveData(true);
    } else {
      setLiveQuote(null);
      setIsLiveData(false);
    }
  }, [sourceChainId, destChainId, amountUSD]);

  // Debounce quote fetching
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 800);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  const friction: FrictionCost = useMemo(() => {
    if (liveQuote && sourceChainId !== destChainId) {
      return {
        sourceChain: sourceChain.name, destChain: destChain.name,
        gasCostUSD: liveQuote.gasCostUSD,
        bridgeFeeUSD: liveQuote.bridgeFeeUSD,
        slippageCostUSD: liveQuote.slippageCostUSD,
        totalCostUSD: liveQuote.totalCostUSD,
        bridgeTimeMin: liveQuote.bridgeTimeMin,
      };
    }
    if (sourceChainId === destChainId) {
      return {
        sourceChain: sourceChain.name, destChain: destChain.name,
        gasCostUSD: destChain.avgGasCostUSD, bridgeFeeUSD: 0,
        slippageCostUSD: (amountUSD * slippageBps) / 10000,
        totalCostUSD: destChain.avgGasCostUSD + (amountUSD * slippageBps) / 10000,
        bridgeTimeMin: 0,
      };
    }
    return estimateFrictionCost(sourceChain.avgGasCostUSD, destChain.avgGasCostUSD, sourceChain.avgBridgeCostUSD, destChain.avgBridgeCostUSD, sourceChain.avgBridgeTimeMin, destChain.avgBridgeTimeMin, amountUSD, slippageBps, sourceChain.name, destChain.name);
  }, [sourceChainId, destChainId, amountUSD, slippageBps, sourceChain, destChain, liveQuote]);

  const roundTripCost = friction.totalCostUSD * 2;
  const yieldCalc = useMemo(() => calculateNetYield(amountUSD, apy, roundTripCost, holdingDays), [amountUSD, apy, roundTripCost, holdingDays]);

  const slippageLocked = !!liveQuote && sourceChainId !== destChainId;
  const displaySlippageBps = slippageLocked && amountUSD > 0
    ? (friction.slippageCostUSD / amountUSD) * 10000
    : slippageBps;

  function fmt(usd: number) { return formatTokenAmount(fromUSD(Math.abs(usd), currency), currency); }
  function fmtS(usd: number) { return (usd < 0 ? "-" : "") + fmt(usd); }

  const dashboardParams = new URLSearchParams({
    amount: String(amountUSD.toFixed(2)), apy: String(apy), cost: String(roundTripCost.toFixed(2)),
    days: String(holdingDays), source: sourceChain.name, dest: destChain.name,
    vault: presetVault || "", protocol: presetProtocol || "", token: presetToken || currency,
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 animate-fade-in md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("calc.title")}</h1>
        <p className="mt-2 text-base text-muted">{t("calc.sub")}</p>
      </div>

      {presetVault && (
        <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4">
          <p className="text-base text-accent">
            <Info size={16} className="inline mr-1.5 -mt-0.5" />
            {t("calc.target")}：<strong>{presetVault} ({presetProtocol})</strong> — {destChain.name} | {presetToken} | APY {presetApy}%
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <div className="tech-card rounded-2xl border border-border bg-card p-5 space-y-5 md:p-6">
          <h2 className="text-base font-semibold text-foreground">{t("calc.route")}</h2>

          {/* Chains — stack on small mobile */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Field label={t("calc.from")}>
              <select value={sourceChainId} onChange={(e) => setSourceChainId(Number(e.target.value))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground focus:border-accent focus:outline-none">
                {chains.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <ArrowRight size={20} className="text-muted self-center mt-3 hidden sm:block sm:mt-6 shrink-0" />
            <Field label={t("calc.to")}>
              <select value={destChainId} onChange={(e) => setDestChainId(Number(e.target.value))} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground focus:border-accent focus:outline-none">
                {chains.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>

          <Field label={t("calc.currency")}>
            <CurrencySelector value={currency} onChange={setCurrency} className="w-full !rounded-2xl !py-3 !px-4 !text-base" />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-muted">{t("calc.amount")}</label>
              {currency !== "USD" && <span className="text-sm text-muted">≈ ${amountUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</span>}
            </div>
            <div className="relative">
              <input type="number" value={amount || ""} onChange={(e) => { const v = e.target.value; e.target.value = String(Number(v)); setAmount(Number(v)); }} min={0}
                step={currency === "USD" || getToken(currency).category === "stable" ? 100 : 0.01}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-20 text-base text-foreground focus:border-accent focus:outline-none" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted">{currency}</span>
            </div>
          </div>

          <Field label={t("calc.apy")}>
            <input type="number" value={apy} onChange={(e) => setApy(Number(e.target.value))} step={0.1} min={0}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground focus:border-accent focus:outline-none" />
          </Field>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-muted">{t("calc.days")}</label>
              <span className="text-base font-medium text-foreground">{holdingDays} {t("calc.daysUnit")}</span>
            </div>
            <input type="range" value={holdingDays} onChange={(e) => setHoldingDays(Number(e.target.value))} min={1} max={365} className="w-full accent-accent h-2" />
            <div className="flex justify-between text-sm text-muted mt-1"><span>1</span><span>365</span></div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm text-muted">{t("calc.slippage")}</label>
              <span className="text-base font-medium text-foreground">{(displaySlippageBps / 100).toFixed(2)}%</span>
            </div>
            {slippageLocked ? (
              <p className="text-xs text-muted flex items-center gap-1.5">
                <Zap size={12} className="text-green" /> {t("calc.slippageLocked")}
              </p>
            ) : (
              <>
                <input
                  type="range"
                  value={slippageBps}
                  onChange={(e) => setSlippageBps(Number(e.target.value))}
                  min={1}
                  max={200}
                  className="w-full accent-accent h-2"
                />
                <div className="flex justify-between text-sm text-muted mt-1">
                  <span>0.01%</span><span>2%</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-5">
          <div className="tech-card rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">{t("calc.oneWay")}</h2>
              {quoteLoading && <span className="text-xs text-muted animate-pulse">{t("calc.quoting")}</span>}
              {!quoteLoading && isLiveData && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2.5 py-0.5 text-xs font-medium text-green">
                  <Zap size={10} /> {t("calc.liveQuote")}
                </span>
              )}
              {!quoteLoading && !isLiveData && sourceChainId !== destChainId && (
                <span className="text-xs text-muted">{t("calc.estimated")}</span>
              )}
            </div>
            <div className="space-y-4">
              <CostRow icon={<Fuel size={18} />} label={t("calc.gas")} value={fmt(friction.gasCostUSD)} />
              <CostRow icon={<ArrowLeftRight size={18} />} label={t("calc.bridge")} value={fmt(friction.bridgeFeeUSD)} />
              <CostRow icon={<TrendingDown size={18} />} label={t("calc.slippageCost")} value={fmt(friction.slippageCostUSD)} />
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="text-base font-semibold text-foreground">{t("calc.totalOneWay")}</span>
                <span className="data-mono text-xl font-bold text-red">{fmt(friction.totalCostUSD)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted flex items-center gap-1.5"><Clock size={16} /> {t("calc.bridgeTime")}</span>
                <span className="text-base text-foreground">~{friction.bridgeTimeMin} {t("calc.min")}</span>
              </div>
            </div>
          </div>

          <div className="tech-card rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">{t("calc.netAnalysis")}</h2>
            <div className="space-y-3 text-base">
              <Row label={t("calc.roundTrip")} value={fmt(roundTripCost)} color="text-red" />
              <Row label={`${t("calc.gross")}（${holdingDays} ${t("calc.daysUnit")}）`} value={fmt(yieldCalc.grossYield)} color="text-green" />
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-semibold text-foreground">{t("calc.net")}</span>
                <span className={`data-mono text-xl font-bold ${yieldCalc.netYield >= 0 ? "text-green" : "text-red"}`}>{fmtS(yieldCalc.netYield)}</span>
              </div>
              <Row label={t("calc.netApy")} value={`${yieldCalc.netAPY.toFixed(2)}%`} color={yieldCalc.netAPY >= 0 ? "text-green" : "text-red"} />
              <Row label={t("calc.breakeven")} value={yieldCalc.breakEvenDays === Infinity ? t("calc.never") : `~${Math.ceil(yieldCalc.breakEvenDays)} ${t("calc.daysUnit")}`} color="text-yellow" />
            </div>
            <Link href={`/dashboard?${dashboardParams.toString()}`}
              className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3.5 text-base font-medium text-white transition-all hover:opacity-90 w-full">
              <BarChart3 size={18} /> {t("calc.viewDashboard")}
            </Link>
            <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted">
              <Info size={12} className="mt-0.5 shrink-0" />
              <span>{t("calc.modelNote")}</span>
            </p>
          </div>

          <div className={`rounded-2xl border px-5 py-4 text-base leading-relaxed ${yieldCalc.netYield >= 0 ? "border-green/20 bg-green/5 text-green" : "border-red/20 bg-red/5 text-red"}`}>
            {yieldCalc.netYield >= 0
              ? t("calc.profitable", { days: String(Math.ceil(yieldCalc.breakEvenDays)), holding: String(holdingDays), amount: fmt(yieldCalc.netYield) })
              : t("calc.unprofitable", { days: String(holdingDays), amount: fmt(Math.abs(yieldCalc.netYield)) })
            }
          </div>

          {/* One-click execute — Coming Soon */}
          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">{t("calc.oneClick")}</h2>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{t("calc.comingSoon")}</span>
            </div>
            <p className="text-sm text-muted mb-4">{t("calc.oneClick.desc")}</p>
            <button disabled className="flex items-center justify-center gap-2 rounded-2xl bg-muted/20 px-4 py-3.5 text-base font-medium text-muted w-full cursor-not-allowed">
              <Zap size={18} /> {t("calc.oneClick.btn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex-1"><label className="text-sm text-muted mb-2 block">{label}</label>{children}</div>;
}

function CostRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-base text-muted">{icon} {label}</span><span className="data-mono text-base text-foreground font-medium">{value}</span></div>;
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return <div className="flex justify-between"><span className="text-muted">{label}</span><span className={`data-mono font-medium ${color}`}>{value}</span></div>;
}
