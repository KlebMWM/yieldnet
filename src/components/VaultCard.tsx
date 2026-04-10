"use client";

import { Vault, YieldType } from "@/lib/api";
import { getChainInfo } from "@/lib/chains";
import { useI18n } from "@/lib/i18n";
import TokenIcon from "./TokenIcon";

const YIELD_TYPE_COLORS: Record<YieldType, string> = {
  lending: "bg-accent/10 text-accent border-accent/20",
  staking: "bg-cyan/10 text-cyan border-cyan/20",
  farming: "bg-green/10 text-green border-green/20",
  strategy: "bg-gold/10 text-gold border-gold/20",
  lp: "bg-red/10 text-red border-red/20",
};

const YIELD_TYPE_KEYS = {
  lending: "vault.type.lending",
  staking: "vault.type.staking",
  farming: "vault.type.farming",
  strategy: "vault.type.strategy",
  lp: "vault.type.lp",
} as const;

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtAPY(apy: number): string {
  const pct = apy > 1 ? apy : apy * 100;
  return `${pct.toFixed(2)}%`;
}

function getAPYColor(apy: number): string {
  const pct = apy > 1 ? apy : apy * 100;
  if (pct >= 20) return "text-green";
  if (pct >= 10) return "text-yellow";
  return "text-accent";
}

interface VaultCardProps {
  vault: Vault;
  onSelect?: (vault: Vault) => void;
}

export default function VaultCard({ vault, onSelect }: VaultCardProps) {
  const chain = getChainInfo(vault.chainId);
  const { t } = useI18n();

  return (
    <button
      onClick={() => onSelect?.(vault)}
      className="tech-card group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-accent/30 hover:bg-card-hover active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: chain.color }} />
          <span className="text-sm text-muted">{chain.shortName}</span>
          <span className="rounded-lg bg-accent/8 px-2 py-0.5 text-xs text-accent">{vault.protocol}</span>
          <span className={`rounded-lg border px-2 py-0.5 text-xs ${YIELD_TYPE_COLORS[vault.yieldType]}`}>
            {t(YIELD_TYPE_KEYS[vault.yieldType])}
          </span>
        </div>
        <span className={`data-mono text-xl font-bold ${getAPYColor(vault.apy)}`}>{fmtAPY(vault.apy)}</span>
      </div>

      <div className="flex items-center gap-3">
        <TokenIcon symbol={vault.tokenSymbol} size={32} />
        <div className="min-w-0">
          <h3 className="text-base font-medium text-foreground truncate">{vault.name}</h3>
          <p className="text-sm text-muted mt-0.5">{vault.tokenSymbol}</p>
        </div>
      </div>

      {/* Historical APY */}
      {(vault.apy7d > 0 || vault.apy30d > 0) && (
        <div className="flex gap-3 text-xs">
          {vault.apy7d > 0 && (
            <span className="rounded-lg bg-background px-2 py-1 text-muted">
              {t("apy.7d")} <strong className="text-foreground">{fmtAPY(vault.apy7d)}</strong>
            </span>
          )}
          {vault.apy30d > 0 && (
            <span className="rounded-lg bg-background px-2 py-1 text-muted">
              {t("apy.30d")} <strong className="text-foreground">{fmtAPY(vault.apy30d)}</strong>
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div>
          <p className="text-xs text-muted">TVL</p>
          <p className="data-mono text-base font-medium text-foreground mt-0.5">{formatNumber(vault.tvl)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">{t("vault.chain")}</p>
          <p className="text-base font-medium text-foreground mt-0.5">{chain.name}</p>
        </div>
      </div>
    </button>
  );
}
