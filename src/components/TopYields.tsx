"use client";

import { useEffect, useState } from "react";
import { fetchVaults, Vault, YieldType } from "@/lib/api";
import { getChainInfo } from "@/lib/chains";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, Flame } from "lucide-react";
import Link from "next/link";
import TokenIcon from "./TokenIcon";

function formatAPY(apy: number): string {
  const pct = apy > 1 ? apy : apy * 100;
  return `${pct.toFixed(2)}%`;
}

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

  useEffect(() => {
    fetchVaults()
      .then((vaults) => {
        const safe = vaults.filter((v) => v.tvl > 100_000);
        safe.sort((a, b) => {
          const apyA = a.apy > 1 ? a.apy : a.apy * 100;
          const apyB = b.apy > 1 ? b.apy : b.apy * 100;
          return apyB - apyA;
        });
        setTop(safe.slice(0, 6));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleClick(vault: Vault) {
    const apy = vault.apy > 1 ? vault.apy : vault.apy * 100;
    const apy7d = vault.apy7d > 1 ? vault.apy7d : vault.apy7d * 100;
    const apy30d = vault.apy30d > 1 ? vault.apy30d : vault.apy30d * 100;
    const params = new URLSearchParams({
      vault: vault.name,
      chain: String(vault.chainId),
      apy: String(apy.toFixed(2)),
      apy7d: String(apy7d.toFixed(2)),
      apy30d: String(apy30d.toFixed(2)),
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
              onClick={() => handleClick(vault)}
              className="tech-card group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-accent/30 hover:bg-card-hover active:scale-[0.98] md:p-5"
            >
              {/* Token Icon as Rank Badge */}
              <div className="relative shrink-0">
                <TokenIcon symbol={vault.tokenSymbol} size={44} />
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: chain.color }}
                  />
                  <span className="text-sm text-muted truncate">
                    {chain.shortName} · {vault.protocol}
                  </span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${YIELD_TYPE_COLORS[vault.yieldType]}`}>
                    {t(YIELD_TYPE_KEYS[vault.yieldType])}
                  </span>
                </div>
                <p className="text-base font-semibold text-foreground truncate">
                  {vault.name}
                </p>
                <p className="text-sm text-muted mt-0.5">
                  TVL <span className="data-mono">{formatTVL(vault.tvl)}</span>
                </p>
              </div>

              {/* APY */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-green">
                  <TrendingUp size={14} />
                  <span className="data-mono text-xl font-bold md:text-2xl">
                    {formatAPY(vault.apy)}
                  </span>
                </div>
                <span className="text-xs text-muted">APY</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
