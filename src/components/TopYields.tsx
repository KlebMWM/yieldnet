"use client";

import { useEffect, useState } from "react";
import { fetchVaults, Vault, YieldType, formatAPY } from "@/lib/api";
import { getChainInfo } from "@/lib/chains";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, Flame, AlertTriangle } from "lucide-react";
import Link from "next/link";
import TokenIcon from "./TokenIcon";

const YIELD_TYPE_COLORS: Record<YieldType, string> = {
  lending: "bg-accent/10 text-accent",
  staking: "bg-cyan/10 text-cyan",
  farming: "bg-green/10 text-green",
  strategy: "bg-gold/10 text-gold",
  lp: "bg-red/10 text-red",
};

const YIELD_TYPE_KEYS = {
  lending: "vault.type.lending",
  staking: "vault.type.staking",
  farming: "vault.type.farming",
  strategy: "vault.type.strategy",
  lp: "vault.type.lp",
} as const;

function formatTVL(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function TopYields() {
  const { t } = useI18n();
  const router = useRouter();
  const [top, setTop] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingVault, setPendingVault] = useState<Vault | null>(null);

  useEffect(() => {
    fetchVaults()
      .then((vaults) => {
        const safe = vaults.filter((v) => v.tvl > 100_000);
        safe.sort((a, b) => b.apy - a.apy);
        setTop(safe.slice(0, 6));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function navigateToDeposit(vault: Vault) {
    const params = new URLSearchParams({
      vault: vault.name,
      chain: String(vault.chainId),
      apy: String(vault.apy.toFixed(2)),
      apy7d: String(vault.apy7d.toFixed(2)),
      apy30d: String(vault.apy30d.toFixed(2)),
      protocol: vault.protocol,
      token: vault.tokenSymbol,
      protocolUrl: vault.protocolUrl,
      address: vault.address,
    });
    router.push(`/deposit?${params.toString()}`);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground md:text-2xl">
          {t("top.title")}
        </h2>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (top.length === 0) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground md:text-2xl">
          <Flame size={22} className="text-red" />
          {t("top.title")}
        </h2>
        <Link
          href="/explore"
          className="flex items-center gap-1 text-sm text-accent hover:underline"
        >
          {t("top.viewAll")} <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((vault, i) => {
          const chain = getChainInfo(vault.chainId);
          return (
            <button
              key={`${vault.chainId}-${vault.address}`}
              onClick={() => setPendingVault(vault)}
              className="tech-card group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-accent/30 hover:bg-card-hover active:scale-[0.98]"
            >
              {/* Header: icon + name + badge */}
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <TokenIcon symbol={vault.tokenSymbol} size={40} />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground truncate">{vault.name}</p>
                    <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] leading-none font-medium ${YIELD_TYPE_COLORS[vault.yieldType]}`} style={{ whiteSpace: "nowrap" }}>
                      {t(YIELD_TYPE_KEYS[vault.yieldType])}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-0.5">
                    <span className="inline-block h-2 w-2 rounded-full mr-1" style={{ backgroundColor: chain.color }} />
                    {chain.shortName} · {vault.protocol}
                  </p>
                </div>
              </div>

              {/* APY + TVL */}
              <div className="flex items-end justify-between border-t border-border pt-3">
                <p className="text-sm text-muted">TVL <span className="data-mono font-medium text-foreground">{formatTVL(vault.tvl)}</span></p>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green">
                    <TrendingUp size={14} />
                    <span className="data-mono text-xl font-bold">{formatAPY(vault.apy)}</span>
                  </div>
                  <span className="text-xs text-muted">APY</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* APY Warning Modal — inline to avoid transform stacking issues */}
      {pendingVault && (() => {
        const wc = getChainInfo(pendingVault.chainId);
        return (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setPendingVault(null); }}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: "1rem" }}
          >
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow/10">
                  <AlertTriangle size={22} className="text-yellow" />
                </div>
                <h2 className="text-lg font-bold text-foreground">{t("warn.title")}</h2>
              </div>
              <div className="rounded-xl bg-background p-4 mb-4">
                <div className="flex items-center gap-3">
                  <TokenIcon symbol={pendingVault.tokenSymbol} size={32} />
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground truncate">{pendingVault.name}</p>
                    <p className="text-sm text-muted">
                      <span className="inline-block h-2 w-2 rounded-full mr-1" style={{ backgroundColor: wc.color }} />
                      {wc.shortName} · {pendingVault.protocol}
                    </p>
                  </div>
                  <span className="ml-auto data-mono text-lg font-bold text-accent shrink-0">{formatAPY(pendingVault.apy)}</span>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-6">{t("warn.body")}</p>
              <div className="flex gap-3">
                <button onClick={() => setPendingVault(null)}
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted transition-colors hover:text-foreground hover:border-foreground/20">
                  {t("warn.cancel")}
                </button>
                <button onClick={() => { const v = pendingVault; setPendingVault(null); navigateToDeposit(v); }}
                  className="flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90">
                  {t("warn.continue")}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
