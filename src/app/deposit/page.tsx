"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getChainInfo } from "@/lib/chains";
import { useI18n } from "@/lib/i18n";
import TokenIcon from "@/components/TokenIcon";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  ArrowRightLeft,
  Landmark,
  TrendingUp,
  Calculator,
  Zap,
} from "lucide-react";

export default function DepositPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-5 py-20 text-center text-base text-muted">
          …
        </div>
      }
    >
      <DepositContent />
    </Suspense>
  );
}

function DepositContent() {
  const { t } = useI18n();
  const sp = useSearchParams();

  const vault = sp.get("vault") || "";
  const protocol = sp.get("protocol") || "";
  const chainId = Number(sp.get("chain") || 1);
  const apy = sp.get("apy") || "0";
  const apy7d = sp.get("apy7d") || "";
  const apy30d = sp.get("apy30d") || "";
  const token = sp.get("token") || "";
  const protocolUrl = sp.get("protocolUrl") || "";
  const address = sp.get("address") || "";

  const chain = getChainInfo(chainId);

  // Jumper Exchange URL for bridging to the target chain
  const jumperUrl = `https://jumper.exchange/?toChain=${chainId}`;

  // Calculator URL
  const calcParams = new URLSearchParams({
    vault,
    chain: String(chainId),
    apy,
    protocol,
    token,
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 animate-fade-in md:py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> {t("dep.back")}
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-6 md:text-3xl">
        {t("dep.title")}
      </h1>

      {/* Vault Info Card */}
      <div className="tech-card rounded-2xl border border-border bg-card p-5 mb-6 md:p-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
          {t("dep.vaultInfo")}
        </h2>

        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
            <TokenIcon symbol={token} size={36} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-foreground truncate">
              {vault}
            </h3>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-base text-muted">
              <span className="flex items-center gap-1.5">
                <Landmark size={15} /> {t("dep.protocol")}:{" "}
                <strong className="text-foreground">{protocol}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: chain.color }}
                />
                {t("dep.chain")}:{" "}
                <strong className="text-foreground">{chain.name}</strong>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-base text-muted">
              <span className="flex items-center gap-1.5">
                <TokenIcon symbol={token} size={16} /> {t("dep.token")}:{" "}
                <strong className="text-foreground">{token}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp size={15} className="text-green" /> {t("dep.apy")}:{" "}
                <strong className="data-mono text-green">{apy}%</strong>
              </span>
            </div>

            {/* Historical APY */}
            {(apy7d || apy30d) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {apy7d && Number(apy7d) > 0 && (
                  <span className="rounded-xl bg-background px-3 py-1.5 text-sm text-muted">
                    {t("apy.7d")} <strong className="text-foreground">{apy7d}%</strong>
                  </span>
                )}
                {apy30d && Number(apy30d) > 0 && (
                  <span className="rounded-xl bg-background px-3 py-1.5 text-sm text-muted">
                    {t("apy.30d")} <strong className="text-foreground">{apy30d}%</strong>
                  </span>
                )}
                <span className="rounded-xl bg-accent/8 px-3 py-1.5 text-sm text-accent">
                  {t("apy.current")} <strong>{apy}%</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 1 — Bridge */}
      <div className="tech-card rounded-2xl border border-border bg-card p-5 mb-4 md:p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent font-bold text-sm">
            1
          </span>
          <h2 className="text-base font-semibold text-foreground">
            {t("dep.step1")}
          </h2>
        </div>
        <p className="text-base text-muted mb-4 leading-relaxed">
          {t("dep.step1.desc")}
        </p>
        <a
          href={jumperUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl bg-accent/10 border border-accent/20 px-4 py-3.5 text-base font-medium text-accent transition-all hover:bg-accent/20 w-full"
        >
          <ArrowRightLeft size={18} />
          {t("dep.bridge")}
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Step 2 — Deposit */}
      <div className="tech-card rounded-2xl border border-border bg-card p-5 mb-6 md:p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green/10 text-green font-bold text-sm">
            2
          </span>
          <h2 className="text-base font-semibold text-foreground">
            {t("dep.step2")}
          </h2>
        </div>
        <p className="text-base text-muted mb-4 leading-relaxed">
          {t("dep.step2.desc")}
        </p>
        {protocolUrl ? (
          <a
            href={protocolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl bg-green px-4 py-3.5 text-base font-medium text-white transition-all hover:opacity-90 w-full"
          >
            <Zap size={18} />
            {t("dep.openProtocol", { protocol })}
            <ExternalLink size={14} />
          </a>
        ) : (
          <p className="text-base text-muted italic">{t("dep.noUrl")}</p>
        )}
      </div>

      {/* Calculator Link */}
      <Link
        href={`/calculator?${calcParams.toString()}`}
        className="flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3.5 text-base font-medium text-muted transition-all hover:border-accent/30 hover:text-foreground w-full"
      >
        <Calculator size={18} />
        {t("dep.calcCost")}
      </Link>

      <p className="mt-6 text-center text-xs text-muted">
        {t("dep.poweredBy")}
      </p>
    </div>
  );
}
