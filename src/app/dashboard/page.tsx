"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { calculateNetYield } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend, ReferenceLine,
} from "recharts";
import { ArrowLeft, TrendingUp, Target, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-5 py-20 text-center text-base text-muted">…</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const amount = Number(searchParams.get("amount") || 1000);
  const apy = Number(searchParams.get("apy") || 8);
  const cost = Number(searchParams.get("cost") || 10);
  const days = Number(searchParams.get("days") || 90);
  const source = searchParams.get("source") || "Ethereum";
  const dest = searchParams.get("dest") || "Arbitrum";
  const vault = searchParams.get("vault") || "";
  const protocol = searchParams.get("protocol") || "";
  const token = searchParams.get("token") || "";

  const yieldCalc = useMemo(() => calculateNetYield(amount, apy, cost, days), [amount, apy, cost, days]);

  const grossLabel = t("chart.grossYield");
  const netLabel = t("chart.netYield");
  const beLabel = t("chart.breakevenDays");
  const netApyLabel = t("chart.netApy");

  const timeSeriesData = useMemo(() => {
    const pts = [];
    const max = Math.max(days, 365);
    const step = max <= 90 ? 1 : max <= 180 ? 2 : 5;
    for (let d = 0; d <= max; d += step) {
      const c = calculateNetYield(amount, apy, cost, d);
      pts.push({ day: d, [grossLabel]: +c.grossYield.toFixed(2), [netLabel]: +c.netYield.toFixed(2) });
    }
    return pts;
  }, [amount, apy, cost, days, grossLabel, netLabel]);

  const beDays = yieldCalc.breakEvenDays === Infinity ? null : Math.ceil(yieldCalc.breakEvenDays);

  const accLabel = t("chart.accumulated");
  const feesLabel = t("chart.totalFees");

  const breakevenData = useMemo(() => {
    const pts = [];
    const maxD = beDays ? Math.min(Math.ceil(beDays * 2.5), 365) : Math.min(days * 2, 365);
    const step = maxD <= 60 ? 1 : maxD <= 180 ? 2 : 5;
    for (let d = 0; d <= maxD; d += step) {
      const c = calculateNetYield(amount, apy, cost, d);
      pts.push({ day: d, [accLabel]: +c.grossYield.toFixed(2), [feesLabel]: +cost.toFixed(2) });
    }
    return pts;
  }, [amount, apy, cost, days, beDays, accLabel, feesLabel]);

  const amtData = useMemo(() => [100, 500, 1000, 5000, 10000, 50000].map((a) => {
    const c = calculateNetYield(a, apy, cost, days);
    return { amt: a >= 1000 ? `$${a / 1000}K` : `$${a}`, [beLabel]: c.breakEvenDays === Infinity ? 999 : Math.ceil(c.breakEvenDays), [netApyLabel]: +c.netAPY.toFixed(2) };
  }), [apy, cost, days, beLabel, netApyLabel]);

  const axDays = t("axis.days");
  const axAmount = t("axis.amount");
  const axDeposit = t("axis.depositAmount");
  const axBeDays = t("axis.breakevenDays");
  const axNetApy = t("axis.netApyPercent");

  const tip = { backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "13px", color: "var(--foreground)" };
  const axisLabelStyle = { fill: "var(--muted)", fontSize: 12 };

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 animate-fade-in md:py-8">
      <Link href="/calculator" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> {t("dash.back")}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{t("dash.title")}</h1>
        <p className="mt-2 text-base text-muted">
          {vault ? `${vault}（${protocol}）— ${dest}` : `${source} → ${dest}`} | ${amount.toLocaleString()} {t("dash.deposit")} | {apy}% APY{token ? ` | ${token}` : ""}
        </p>
      </div>

      {/* Summary Cards — 2 cols on mobile, 4 on desktop */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
        <Card label={t("dash.gross")} value={`$${yieldCalc.grossYield.toFixed(2)}`} sub={`${days} ${t("calc.daysUnit")}`} color="text-green" icon={<TrendingUp size={18} />} />
        <Card label={t("dash.friction")} value={`$${cost.toFixed(2)}`} sub={t("dash.roundTrip")} color="text-red" icon={<AlertTriangle size={18} />} />
        <Card label={t("dash.net")} value={`$${yieldCalc.netYield.toFixed(2)}`} sub={`${t("chart.netApy")} ${yieldCalc.netAPY.toFixed(2)}%`} color={yieldCalc.netYield >= 0 ? "text-green" : "text-red"} icon={<TrendingUp size={18} />} />
        <Card label={t("dash.breakeven")} value={beDays ? `${beDays} ${t("calc.daysUnit")}` : t("calc.never")} sub={beDays && beDays <= days ? t("dash.withinPeriod") : t("dash.beyondPeriod")} color={beDays && beDays <= days ? "text-green" : "text-yellow"} icon={<Target size={18} />} />
      </div>

      {/* Charts — single col on mobile, 2 cols on desktop */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
        <Panel title={t("dash.chart1")}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} tickFormatter={(v) => `${v}`} label={{ value: axDays, position: "insideBottomRight", offset: -5, style: axisLabelStyle }} />
              <YAxis stroke="var(--muted)" fontSize={12} tickFormatter={(v) => `$${v}`} width={55} label={{ value: axAmount, angle: -90, position: "insideLeft", offset: 10, style: axisLabelStyle }} />
              <Tooltip contentStyle={tip} labelFormatter={(v) => t("chart.day", { d: v })} formatter={(value) => [`$${Number(value).toFixed(2)}`]} />
              <Area type="monotone" dataKey={grossLabel} stroke="var(--green)" fill="var(--green)" fillOpacity={0.08} strokeWidth={2} />
              <Area type="monotone" dataKey={netLabel} stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.08} strokeWidth={2} />
              <ReferenceLine y={0} stroke="var(--red)" strokeDasharray="3 3" />
              {beDays && <ReferenceLine x={beDays} stroke="var(--yellow)" strokeDasharray="3 3" />}
              <Legend wrapperStyle={{ fontSize: "13px" }} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title={t("dash.chart2")}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={breakevenData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} tickFormatter={(v) => `${v}`} label={{ value: axDays, position: "insideBottomRight", offset: -5, style: axisLabelStyle }} />
              <YAxis stroke="var(--muted)" fontSize={12} tickFormatter={(v) => `$${v}`} width={55} label={{ value: axAmount, angle: -90, position: "insideLeft", offset: 10, style: axisLabelStyle }} />
              <Tooltip contentStyle={tip} labelFormatter={(v) => t("chart.day", { d: v })} formatter={(value) => [`$${Number(value).toFixed(2)}`]} />
              <Area type="monotone" dataKey={accLabel} stroke="var(--green)" fill="var(--green)" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey={feesLabel} stroke="var(--red)" fill="var(--red)" fillOpacity={0.05} strokeWidth={2} strokeDasharray="6 3" />
              {beDays && <ReferenceLine x={beDays} stroke="var(--yellow)" strokeWidth={2} strokeDasharray="3 3" label={{ value: `${beDays}d`, position: "top", fill: "var(--yellow)", fontSize: 12 }} />}
              <Legend wrapperStyle={{ fontSize: "13px" }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1 text-sm text-muted">
            <p>{t("chart.breakeven.note1")}</p>
            <p>{t("chart.breakeven.note2")}</p>
          </div>
        </Panel>

        <Panel title={`${t("dash.chart3")}（${apy}% APY）`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={amtData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="amt" stroke="var(--muted)" fontSize={12} label={{ value: axDeposit, position: "insideBottomRight", offset: -5, style: axisLabelStyle }} />
              <YAxis stroke="var(--muted)" fontSize={12} width={45} label={{ value: axBeDays, angle: -90, position: "insideLeft", offset: 5, style: axisLabelStyle }} />
              <Tooltip contentStyle={tip} formatter={(value) => [`${value}`]} />
              <Bar dataKey={beLabel} fill="var(--yellow)" radius={[4, 4, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: "13px" }} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-sm text-muted">{t("dash.chart3.note")}</p>
        </Panel>

        <Panel title={`${t("dash.chart4")}（${t("dash.grossLabel")} APY ${apy}%）`}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={amtData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="amt" stroke="var(--muted)" fontSize={12} label={{ value: axDeposit, position: "insideBottomRight", offset: -5, style: axisLabelStyle }} />
              <YAxis stroke="var(--muted)" fontSize={12} tickFormatter={(v) => `${v}%`} width={45} label={{ value: axNetApy, angle: -90, position: "insideLeft", offset: 5, style: axisLabelStyle }} />
              <Tooltip contentStyle={tip} formatter={(value) => [`${Number(value).toFixed(2)}%`]} />
              <Line type="monotone" dataKey={netApyLabel} stroke="var(--accent-light)" strokeWidth={2} dot={{ fill: "var(--accent-light)", r: 3 }} />
              <ReferenceLine y={apy} stroke="var(--green)" strokeDasharray="3 3" />
              <ReferenceLine y={0} stroke="var(--red)" strokeDasharray="3 3" />
              <Legend wrapperStyle={{ fontSize: "13px" }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-3 text-sm text-muted">{t("dash.chart4.note")}</p>
        </Panel>
      </div>

      {/* Key Insight */}
      <div className="mt-8 rounded-2xl border border-accent/20 bg-accent/5 p-5 md:p-6">
        <h3 className="text-base font-semibold text-accent mb-3">{t("dash.insight")}</h3>
        <ul className="list-disc pl-5 space-y-2 text-muted text-base leading-relaxed">
          <li>{t("dash.friction")} <span className="text-red font-medium">${cost.toFixed(2)}</span></li>
          <li>{t("dash.breakeven")} <span className="text-yellow font-medium">{beDays ? `${beDays} ${t("calc.daysUnit")}` : t("calc.never")}</span></li>
          <li>{t("dash.net")} <span className={yieldCalc.netYield >= 0 ? "text-green font-medium" : "text-red font-medium"}>${yieldCalc.netYield.toFixed(2)}</span> ({t("chart.netApy")} {yieldCalc.netAPY.toFixed(2)}%)</li>
        </ul>
      </div>
    </div>
  );
}

function Card({ label, value, sub, color, icon }: { label: string; value: string; sub: string; color: string; icon: React.ReactNode }) {
  return (
    <div className="tech-card rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-center gap-2 mb-2"><span className={color}>{icon}</span><span className="text-sm text-muted">{label}</span></div>
      <p className={`data-mono text-xl font-bold md:text-2xl ${color}`}>{value}</p>
      <p className="text-sm text-muted mt-1">{sub}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="tech-card rounded-2xl border border-border bg-card p-4 md:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}
