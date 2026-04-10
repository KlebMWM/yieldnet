"use client";

import { useState, useRef, useEffect } from "react";
import { TOKENS, getToken } from "@/lib/tokens";
import { useI18n } from "@/lib/i18n";
import { ChevronDown, Check } from "lucide-react";
import TokenIcon from "./TokenIcon";

interface CurrencySelectorProps {
  value: string;
  onChange: (symbol: string) => void;
  className?: string;
}

const CATEGORIES = ["base", "stable", "major", "alt"] as const;

export default function CurrencySelector({
  value,
  onChange,
  className = "",
}: CurrencySelectorProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = getToken(value);
  const catLabel: Record<string, string> = { base: t("currency.base"), stable: t("currency.stable"), major: t("currency.major"), alt: t("currency.alt") };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground transition-colors hover:border-accent/40 focus:border-accent focus:outline-none"
      >
        <TokenIcon symbol={value} size={24} />
        <span className="flex-1 text-left font-medium">{current.symbol}</span>
        <span className="text-sm text-muted hidden sm:inline">{current.name}</span>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-2xl border border-border bg-card shadow-xl max-h-72 overflow-y-auto animate-fade-in">
          {CATEGORIES.map((cat) => {
            const tokens = TOKENS.filter((tk) => tk.category === cat);
            return (
              <div key={cat}>
                <div className="sticky top-0 bg-card/95 backdrop-blur px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider border-b border-border/50">
                  {catLabel[cat]}
                </div>
                {tokens.map((tk) => (
                  <button
                    key={tk.symbol}
                    type="button"
                    onClick={() => { onChange(tk.symbol); setOpen(false); }}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/5 ${
                      tk.symbol === value ? "bg-accent/10" : ""
                    }`}
                  >
                    <TokenIcon symbol={tk.symbol} size={28} />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">{tk.symbol}</span>
                      <span className="ml-2 text-sm text-muted">{tk.name}</span>
                    </div>
                    {tk.symbol === value && <Check size={16} className="text-accent shrink-0" />}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
