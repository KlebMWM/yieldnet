"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Activity, Calculator, BarChart3, Home } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LangSwitch from "./LangSwitch";
import { useI18n } from "@/lib/i18n";

const NAV_KEYS = [
  { href: "/", key: "nav.home" as const, icon: Home },
  { href: "/explore", key: "nav.explore" as const, icon: Activity },
  { href: "/calculator", key: "nav.calculator" as const, icon: Calculator },
  { href: "/dashboard", key: "nav.dashboard" as const, icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="nav-glass sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white font-bold text-sm glow-accent">
            YN
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground hidden sm:inline">
            YieldNet
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_KEYS.map(({ href, key, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-base transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted hover:bg-card hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {t(key)}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <LangSwitch />
          <ThemeToggle />
          <div className="hidden sm:block">
            <ConnectButton chainStatus="icon" showBalance={false} accountStatus="avatar" />
          </div>
          <div className="sm:hidden">
            <ConnectButton chainStatus="none" showBalance={false} accountStatus="avatar" />
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="flex items-center justify-around border-t border-border px-1 py-2 lg:hidden">
        {NAV_KEYS.map(({ href, key, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs min-w-[60px] transition-colors ${
                isActive ? "text-accent font-medium" : "text-muted"
              }`}
            >
              <Icon size={20} />
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
