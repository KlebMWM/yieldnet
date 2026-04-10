"use client";

import Link from "next/link";
import {
  Activity, Calculator, BarChart3, ArrowRight, Zap,
  Landmark, Droplets, Sprout, Lock, Layers, AlertTriangle, CheckCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import TopYields from "@/components/TopYields";

export default function Home() {
  const { t } = useI18n();

  const FEATURES = [
    { icon: Activity, titleKey: "home.f1.title" as const, descKey: "home.f1.desc" as const, href: "/explore" },
    { icon: Calculator, titleKey: "home.f2.title" as const, descKey: "home.f2.desc" as const, href: "/calculator" },
    { icon: BarChart3, titleKey: "home.f3.title" as const, descKey: "home.f3.desc" as const, href: "/dashboard" },
  ];

  const YIELD_TYPES = [
    { icon: Landmark, titleKey: "home.yield.lending" as const, descKey: "home.yield.lending.desc" as const },
    { icon: Droplets, titleKey: "home.yield.lp" as const, descKey: "home.yield.lp.desc" as const },
    { icon: Sprout, titleKey: "home.yield.farming" as const, descKey: "home.yield.farming.desc" as const },
    { icon: Lock, titleKey: "home.yield.staking" as const, descKey: "home.yield.staking.desc" as const },
    { icon: Layers, titleKey: "home.yield.strategy" as const, descKey: "home.yield.strategy.desc" as const },
  ];

  const STEPS = [
    { step: "01", titleKey: "home.s1.title" as const, descKey: "home.s1.desc" as const },
    { step: "02", titleKey: "home.s2.title" as const, descKey: "home.s2.desc" as const },
    { step: "03", titleKey: "home.s3.title" as const, descKey: "home.s3.desc" as const },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden scan-line">
        {/* Radial gradient orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_var(--gold)_40%,_transparent_70%)] opacity-[0.07]" />
        <div className="absolute top-1/4 -left-1/4 h-96 w-96 rounded-full bg-accent/5 blur-[100px]" />
        <div className="absolute bottom-1/4 -right-1/4 h-96 w-96 rounded-full bg-cyan/5 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-5 py-16 text-center md:py-28">
          <div className="data-mono mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm tracking-wide text-accent">
            <Zap size={14} />
            {t("home.badge")}
          </div>
          <h1 className="glow-text text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl lg:leading-tight">
            {t("home.title.prefix")}
            <span className="bg-gradient-to-r from-gold via-accent to-cyan bg-clip-text text-transparent">
              {t("home.title.highlight")}
            </span>
          </h1>
          <div className="mx-auto mt-5 max-w-2xl space-y-1 text-base leading-relaxed text-muted md:text-lg">
            <p>{t("home.subtitle1")}</p>
            <p>{t("home.subtitle2")}</p>
            <p>{t("home.subtitle3")}</p>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/explore"
              className="animate-glow-pulse flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-7 py-3.5 text-base font-medium text-white transition-all hover:opacity-90 sm:w-auto"
            >
              {t("home.cta.explore")}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/calculator"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border px-7 py-3.5 text-base font-medium text-foreground transition-all hover:border-accent/30 hover:bg-card sm:w-auto"
            >
              {t("home.cta.calc")}
            </Link>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="tech-card rounded-2xl border border-red/20 bg-red/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-red" />
              <h3 className="text-lg font-semibold text-foreground">{t("home.problem.title")}</h3>
            </div>
            <p className="text-base leading-relaxed text-muted">{t("home.problem.desc")}</p>
          </div>
          <div className="tech-card rounded-2xl border border-green/20 bg-green/5 p-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={20} className="text-green" />
              <h3 className="text-lg font-semibold text-foreground">{t("home.solution.title")}</h3>
            </div>
            <p className="text-base leading-relaxed text-muted">{t("home.solution.desc")}</p>
          </div>
        </div>
      </section>

      {/* Top Yields */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <TopYields />
      </section>

      {/* Yield Types */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="text-center text-2xl font-semibold text-foreground mb-8 tracking-tight">
          {t("home.yield.title")}
        </h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
          {YIELD_TYPES.map((yt) => (
            <div
              key={yt.titleKey}
              className="tech-card flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
                <yt.icon size={22} className="text-accent" />
              </div>
              <h4 className="text-base font-semibold text-foreground">{t(yt.titleKey)}</h4>
              <p className="text-sm leading-relaxed text-muted">{t(yt.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="gradient-border group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-accent/30 hover:bg-card-hover md:p-6 tech-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
                <f.icon size={22} className="text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t(f.titleKey)}</h3>
              <p className="text-base leading-relaxed text-muted">{t(f.descKey)}</p>
              <span className="mt-auto flex items-center gap-1 text-base text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                {t("home.go")} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <h2 className="text-center text-2xl font-semibold text-foreground mb-12 tracking-tight">
          {t("home.how")}
        </h2>
        <div className="grid gap-10 sm:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/5 text-sm font-bold text-accent glow-accent">
                {item.step}
              </div>
              <h3 className="font-semibold text-foreground text-base">{t(item.titleKey)}</h3>
              <p className="mt-2 text-base text-muted leading-relaxed">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
