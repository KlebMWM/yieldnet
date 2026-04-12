"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchVaults, Vault, YieldType } from "@/lib/api";
import { getChainInfo } from "@/lib/chains";
import VaultCard from "@/components/VaultCard";
import { Search, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import APYWarningModal from "@/components/APYWarningModal";

type SortKey = "apy" | "tvl" | "name";

const YIELD_TYPE_KEYS = {
  lending: "vault.type.lending",
  staking: "vault.type.staking",
  farming: "vault.type.farming",
  strategy: "vault.type.strategy",
  lp: "vault.type.lp",
} as const;

export default function ExplorePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [chainFilter, setChainFilter] = useState<number | null>(null);
  const [protocolFilter, setProtocolFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("apy");
  const [sortDesc, setSortDesc] = useState(true);
  const [typeFilter, setTypeFilter] = useState<YieldType | null>(null);
  const [pendingVault, setPendingVault] = useState<Vault | null>(null);
  const [visibleCount, setVisibleCount] = useState(60);

  useEffect(() => {
    fetchVaults()
      .then((data) => { setVaults(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const protocols = useMemo(() => Array.from(new Set(vaults.map((v) => v.protocol))).sort(), [vaults]);
  const chainIds = useMemo(() => Array.from(new Set(vaults.map((v) => v.chainId))).sort((a, b) => a - b), [vaults]);
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of vaults) counts[v.yieldType] = (counts[v.yieldType] || 0) + 1;
    return counts;
  }, [vaults]);

  const filtered = useMemo(() => {
    let result = vaults;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((v) => v.name.toLowerCase().includes(q) || v.protocol.toLowerCase().includes(q) || v.tokenSymbol.toLowerCase().includes(q));
    }
    if (chainFilter !== null) result = result.filter((v) => v.chainId === chainFilter);
    if (protocolFilter) result = result.filter((v) => v.protocol === protocolFilter);
    if (typeFilter) result = result.filter((v) => v.yieldType === typeFilter);
    result.sort((a, b) => {
      const mul = sortDesc ? -1 : 1;
      if (sortKey === "apy") return mul * (a.apy - b.apy);
      if (sortKey === "tvl") return mul * (a.tvl - b.tvl);
      return mul * a.name.localeCompare(b.name);
    });
    return result;
  }, [vaults, search, chainFilter, protocolFilter, typeFilter, sortKey, sortDesc]);

  function navigateToDeposit(vault: Vault) {
    const params = new URLSearchParams({
      vault: vault.name, chain: String(vault.chainId), apy: String(vault.apy.toFixed(2)),
      apy7d: String(vault.apy7d.toFixed(2)), apy30d: String(vault.apy30d.toFixed(2)),
      protocol: vault.protocol, token: vault.tokenSymbol,
      protocolUrl: vault.protocolUrl, address: vault.address,
    });
    router.push(`/deposit?${params.toString()}`);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="animate-pulse-slow text-center">
          <p className="text-muted text-base">{t("explore.loading")}</p>
        </div>
        <div className="mt-10 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <p className="text-red text-base mb-4">{t("explore.error")}：{error}</p>
        <button onClick={() => window.location.reload()} className="rounded-2xl bg-accent px-6 py-3 text-base text-white hover:opacity-90">
          {t("explore.retry")}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 py-6 animate-fade-in md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("explore.title")}</h1>
          <p className="mt-2 text-base text-muted">
            {t("explore.sub", { count: String(vaults.length), chains: String(chainIds.length) })}
          </p>
        </div>

        {/* Filters — stack on mobile */}
        <div className="mb-6 space-y-3 md:space-y-0 md:flex md:flex-wrap md:items-center md:gap-3">
          <div className="relative flex-1 min-w-0">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder={t("explore.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-4 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:gap-3">
            <select value={chainFilter ?? ""} onChange={(e) => setChainFilter(e.target.value ? Number(e.target.value) : null)}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-base text-foreground focus:border-accent focus:outline-none">
              <option value="">{t("explore.allChains")}</option>
              {chainIds.map((id) => <option key={id} value={id}>{getChainInfo(id).name}</option>)}
            </select>

            <select value={protocolFilter ?? ""} onChange={(e) => setProtocolFilter(e.target.value || null)}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-base text-foreground focus:border-accent focus:outline-none">
              <option value="">{t("explore.allProtocols")}</option>
              {protocols.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <select value={typeFilter ?? ""} onChange={(e) => setTypeFilter((e.target.value || null) as YieldType | null)}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-base text-foreground focus:border-accent focus:outline-none">
              <option value="">{t("explore.allTypes")}</option>
              {(["lending", "farming", "staking", "strategy", "lp"] as YieldType[])
                .filter((ty) => (typeCounts[ty] || 0) > 0)
                .map((ty) => (
                  <option key={ty} value={ty}>{t(YIELD_TYPE_KEYS[ty])} ({typeCounts[ty]})</option>
                ))}
            </select>

            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-base text-foreground focus:border-accent focus:outline-none">
              <option value="apy">{t("explore.sortApy")}</option>
              <option value="tvl">{t("explore.sortTvl")}</option>
              <option value="name">{t("explore.sortName")}</option>
            </select>

            <button onClick={() => setSortDesc(!sortDesc)}
              className="rounded-2xl border border-border bg-card p-3 text-muted hover:text-foreground transition-colors flex items-center justify-center">
              <ArrowUpDown size={18} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-base text-muted">{t("explore.empty")}</div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, visibleCount).map((vault) => (
              <VaultCard key={`${vault.chainId}-${vault.address}`} vault={vault} onSelect={setPendingVault} />
            ))}
          </div>
        )}

        {filtered.length > visibleCount && (
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted">
              {t("explore.showing", { shown: String(visibleCount), total: String(filtered.length) })}
            </p>
            <button
              onClick={() => setVisibleCount((c) => c + 60)}
              className="rounded-2xl border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {t("explore.loadMore")} — {t("explore.remaining", { count: String(filtered.length - visibleCount) })}
            </button>
          </div>
        )}
      </div>

      <APYWarningModal
        vault={pendingVault}
        onConfirm={(v) => { setPendingVault(null); navigateToDeposit(v); }}
        onCancel={() => setPendingVault(null)}
      />
    </>
  );
}
