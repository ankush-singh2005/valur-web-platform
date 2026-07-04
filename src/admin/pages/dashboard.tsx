import * as React from "react";
import { Link, useNavigate } from "react-router";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  UserCheck, Building2, TrendingUp, Wallet, AlertTriangle, LifeBuoy, ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Card, SectionCard, KpiCard, Stat } from "../components/primitives";
import { Segmented } from "../components/controls";
import { dashboard, approvalQueue } from "../data/mock";
import { iskCompact } from "../lib/format";

const QUEUE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  coaches: UserCheck, clubs: Building2, tiers: TrendingUp, payouts: Wallet, held: AlertTriangle, tickets: LifeBuoy,
};
const QUEUE_COLOR: Record<string, string> = {
  coaches: "var(--persona-coach)", clubs: "var(--persona-club)", tiers: "var(--persona-player)",
  payouts: "var(--adm-neon)", held: "var(--st-danger)", tickets: "var(--st-info)",
};

// approval queue grouped by kind - for the dashboard "What's waiting" panel
const WAITING = [
  { label: "Coach onboarding", kind: "Coach L1", color: "var(--persona-coach)" },
  { label: "Club onboarding", kind: "Club L1", color: "var(--persona-club)" },
  { label: "Tier upgrades", kind: "Tier L2", color: "var(--persona-player)" },
  { label: "Player video", kind: "Player Video", color: "var(--adm-text-2)" },
].map((x) => ({ ...x, count: approvalQueue.filter((a) => a.kind === x.kind).length }));

export function OverviewDashboard() {
  const nav = useNavigate();
  const [period, setPeriod] = React.useState<"today" | "week" | "month" | "year">("month");
  const k = dashboard.kpis;

  return (
    <div>
      <PageHeader
        title="Operations Dashboard"
        description="Your queue first, the numbers second. Everything that needs a decision is one click away."
        actions={
          <Segmented
            value={period}
            onChange={setPeriod}
            options={[
              { value: "today", label: "Today" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
          />
        }
      />

      {/* Action queue */}
      <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--adm-text-3)] mb-3">
        Action queue · needs you
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {dashboard.actionQueue.map((q) => {
          const Icon = QUEUE_ICON[q.key];
          const color = QUEUE_COLOR[q.key];
          return (
            <button
              key={q.key}
              onClick={() => nav(q.to)}
              className="group text-left rounded-xl border border-[var(--adm-line)] bg-[var(--adm-card)] p-4 transition-all hover:border-[var(--adm-line-strong)] hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="grid place-items-center size-8 rounded-lg" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
                  <Icon className="size-4" />
                </span>
                <ChevronRight className="size-4 text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors" />
              </div>
              <p className="text-3xl font-semibold adm-num mt-3 tracking-tight" style={{ color }}>{q.count}</p>
              <p className="text-xs text-[var(--adm-text-2)] mt-1 leading-snug">{q.label}</p>
            </button>
          );
        })}
      </div>

      {/* Business KPIs */}
      <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--adm-text-3)] mb-3">
        Business KPIs · this {period === "today" ? "day" : period}
      </h2>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <KpiCard label="GMV (gross merchandise value)" value={iskCompact(k.gmv)} delta={k.deltas.gmv} accent glow hint="Total transacted on platform" />
        <KpiCard label="Platform revenue · 20% take" value={iskCompact(k.revenue)} delta={k.deltas.revenue} hint="Net of payouts" />
        <KpiCard label="VAT collected (VSK)" value={iskCompact(k.vsk)} delta={k.deltas.vsk} hint="24% standard rate · owed to Skatturinn" />
        <KpiCard label="Payouts pending release" value={iskCompact(k.payoutsPending)} hint={`${iskCompact(k.payoutsReleased)} released this period`} />
      </div>
      <Card className="px-5 py-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          <Stat label="Active coaches" value={k.activeCoaches} tone="var(--persona-coach)" />
          <Stat label="Active players" value={k.activePlayers} tone="var(--persona-player)" />
          <Stat label="Active clubs" value={k.activeClubs} tone="var(--persona-club)" />
          <Stat label="Sessions booked" value={k.sessionsBooked} />
          <Stat label="Sessions completed" value={`${k.sessionsCompleted} / ${k.sessionsBooked}`} tone="var(--st-success)" />
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <SectionCard title="Bookings & revenue" subtitle="Last 14 days" className="xl:col-span-2" bodyClassName="pt-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c8f000" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#c8f000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: "#6b6e69", fontSize: 11 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fill: "#6b6e69", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip unit="K kr." />} cursor={{ stroke: "rgba(200,240,0,0.3)" }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#c8f000" strokeWidth={2} fill="url(#gRev)" />
                <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#5b9bff" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Session mix" subtitle="By delivery type">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboard.sessionMix} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none">
                  {dashboard.sessionMix.map((_, i) => (
                    <Cell key={i} fill={["#c8f000", "#5b9bff", "#e0567a"][i]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTip unit=" sessions" />} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12, color: "#a6a8a3" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Throughput + queue snapshot */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard title="Approvals throughput" subtitle="Processed vs backlog" className="xl:col-span-2" bodyClassName="pt-2">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.approvalBacklog} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: "#6b6e69", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b6e69", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="processed" name="Processed" fill="#c8f000" radius={[3, 3, 0, 0]} barSize={10} />
                <Bar dataKey="backlog" name="Backlog" fill="#3a3d38" radius={[3, 3, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="What's waiting"
          subtitle="Live approval queue"
          actions={<Link to="/admin/approvals" className="text-xs text-[var(--adm-neon)] hover:underline">Open hub</Link>}
          bodyClassName="p-0"
        >
          <ul>
            {WAITING.map((q) => (
              <li key={q.kind} className="flex items-center gap-3 px-5 py-[13px] border-b border-[var(--adm-line)] last:border-0">
                <span className="size-2 rounded-full shrink-0" style={{ background: q.color }} />
                <span className="text-sm text-[var(--adm-text-2)] flex-1">{q.label}</span>
                <span className="adm-num text-sm font-semibold text-[var(--adm-text)]">{q.count}</span>
              </li>
            ))}
          </ul>
          <div className="px-5 py-3 border-t border-[var(--adm-line)]">
            <p className="text-[11px] text-[var(--adm-text-3)]">Recent activity now lives in the <span className="text-[var(--adm-text-2)]">🔔 bell</span>, top-right.</p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function ChartTip({ active, payload, label, unit = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--adm-line-strong)] bg-[var(--adm-elevated)] px-3 py-2 shadow-xl">
      {label && <p className="text-[11px] text-[var(--adm-text-3)] mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs text-[var(--adm-text)] flex items-center gap-2 adm-num">
          <span className="size-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          {p.name}: <span className="font-medium">{p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
}
