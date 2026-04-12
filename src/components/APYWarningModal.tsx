"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Vault, formatAPY } from "@/lib/api";
import { getChainInfo } from "@/lib/chains";
import { useI18n } from "@/lib/i18n";
import { AlertTriangle } from "lucide-react";
import TokenIcon from "./TokenIcon";

interface Props {
  vault: Vault | null;
  onConfirm: (vault: Vault) => void;
  onCancel: () => void;
}

export default function APYWarningModal({ vault, onConfirm, onCancel }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close on Escape
  useEffect(() => {
    if (!vault) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [vault, onCancel]);

  if (!vault || !mounted) return null;

  const chain = getChainInfo(vault.chainId);

  return createPortal(
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onCancel(); }}
      style={{ position: "fixed", inset: 0, zIndex: 9999 }}
      className="flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow/10">
            <AlertTriangle size={22} className="text-yellow" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{t("warn.title")}</h2>
        </div>

        {/* Vault info */}
        <div className="rounded-xl bg-background p-4 mb-4">
          <div className="flex items-center gap-3">
            <TokenIcon symbol={vault.tokenSymbol} size={32} />
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground truncate">{vault.name}</p>
              <p className="text-sm text-muted">
                <span className="inline-block h-2 w-2 rounded-full mr-1" style={{ backgroundColor: chain.color }} />
                {chain.shortName} · {vault.protocol}
              </p>
            </div>
            <span className="ml-auto data-mono text-lg font-bold text-accent shrink-0">{formatAPY(vault.apy)}</span>
          </div>
        </div>

        {/* Warning message */}
        <p className="text-sm text-muted leading-relaxed mb-6">
          {t("warn.body")}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted transition-colors hover:text-foreground hover:border-foreground/20"
          >
            {t("warn.cancel")}
          </button>
          <button
            onClick={() => onConfirm(vault)}
            className="flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {t("warn.continue")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
