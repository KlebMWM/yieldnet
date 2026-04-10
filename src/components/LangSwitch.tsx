"use client";

import { useI18n, Locale, LOCALE_LABELS } from "@/lib/i18n";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LOCALES: Locale[] = ["en", "zh-TW", "zh-CN"];

export default function LangSwitch() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-border px-2.5 text-xs text-muted transition-colors hover:bg-card hover:text-foreground"
      >
        <Globe size={14} />
        {LOCALE_LABELS[locale]}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-28 rounded-xl border border-border bg-card py-1 shadow-lg z-50">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                l === locale
                  ? "text-accent font-medium bg-accent/5"
                  : "text-foreground hover:bg-card-hover"
              }`}
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
