import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { toast } from "sonner";
import {
  Wallet, Receipt, Scale, ArrowRight, AlertTriangle, FileDown,
  ShieldCheck, CheckCircle2, Ban, PauseCircle, Lock, FileText, Download,
  RefreshCw, Send, Eye, History, MessageSquare, CircleDot, ExternalLink,
  ArrowLeftRight, Banknote,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { DataTable, type Column } from "../components/DataTable";
import {
  Card, SectionCard, KpiCard, Stat, StatusPill, Pill, SlaPill, Field,
  EmptyState, Money, PersonaTag, RowActionButton,
} from "../components/primitives";
import { Toolbar, SearchInput, FilterChip, MiniSelect } from "../components/controls";
import { SideTray } from "../components/SideTray";
import { Tooltip as HoverTip, TooltipTrigger, TooltipContent } from "@/app/components/ui/tooltip";
import { cn } from "@/app/components/ui/utils";
import {
  payouts, transactions, invoices, disputes, dashboard,
  findPayout, findBooking, type Payout, type Txn, type Invoice, type Dispute,
} from "../data/mock";
import {
  isk, iskCompact, pct, date, dateTime, ago, maskAccount,
  netPayout, platformFee, PLATFORM_FEE,
} from "../lib/format";

// ── shared dark chart tooltip (pattern copied from dashboard.tsx) ─────────────
function ChartTip({ active, payload, label, unit = "", money = false }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--adm-line-strong)] bg-[var(--adm-elevated)] px-3 py-2 shadow-xl">
      {label && <p className="text-[11px] text-[var(--adm-text-3)] mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs text-[var(--adm-text)] flex items-center gap-2 adm-num">
          <span className="size-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          {p.name}: <span className="font-medium">{money ? iskCompact((p.value as number) * 1000) : `${p.value}${unit}`}</span>
        </p>
      ))}
    </div>
  );
}

// series colours
const C = { neon: "#c8f000", blue: "#5b9bff", rose: "#e0567a", grey: "#3a3d38" } as const;

// ── AD·19 Finance Overview ────────────────────────────────────────────────────
export function FinanceOverview() {
  const k = dashboard.kpis;

  // Net position = revenue collected − held balance still owed to coaches.
  const netPosition = k.revenue + k.vsk;

  // refunds issued this period (sum of Refund-type ledger lines, magnitude)
  const refundsIssued = transactions
    .filter((t) => t.type === "Refund")
    .reduce((s, t) => s + Math.abs(t.net), 0);

  // revenue mix by who paid (player-paid vs club-paid) - from completed/charged bookings
  const personaMix = React.useMemo(() => {
    let player = 0, club = 0;
    transactions
      .filter((t) => t.type === "Charge")
      .forEach((t) => {
        // club counterparties are the registered institutional buyers
        const isClub = /félag|UBK|Hafnar|Reykjavíkur|Akraness|Stjarnan|Víkingur|Breiðablik|Valur$/i.test(t.counterparty);
        const fee = platformFee(t.gross);
        if (isClub) club += fee; else player += fee;
      });
    return [
      { name: "Club-paid", value: club, fill: C.blue },
      { name: "Player-paid", value: player, fill: C.neon },
    ];
  }, []);

  // revenue mix by session type - platform fee grouped by payout session type
  const typeMix = React.useMemo(() => {
    const acc: Record<string, number> = { F2F: 0, Online: 0, Hybrid: 0 };
    payouts.forEach((p) => { acc[p.sessionType] = (acc[p.sessionType] ?? 0) + platformFee(p.gross); });
    return [
      { name: "F2F", value: acc.F2F, fill: C.neon },
      { name: "Online", value: acc.Online, fill: C.blue },
      { name: "Hybrid", value: acc.Hybrid, fill: C.rose },
    ];
  }, []);

  return (
    <div>
      <PageHeader
        title="Finance Overview"
        description="Held versus released is the headline. Platform revenue, VAT owed, and the funds still parked before an admin releases them - at a glance."
        actions={
          <button
            onClick={() => toast.success("VAT (VSK) report queued", { description: "A VSK summary for the current period will be prepared for download." })}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm text-[var(--adm-text-2)] border border-[var(--adm-line)] hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)] transition-colors"
          >
            <FileDown className="size-4" /> Generate VAT report
          </button>
        }
      />

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
        <KpiCard label="Held balance · awaiting release" value={iskCompact(k.payoutsPending)} accent glow hint="Parked until an admin releases (KAD-05)" />
        <KpiCard label="Platform revenue · 20% take" value={iskCompact(k.revenue)} delta={k.deltas.revenue} hint="Net of payouts to coaches" />
        <KpiCard label="VAT (VSK) collected" value={iskCompact(k.vsk)} delta={k.deltas.vsk} hint="24% standard · owed to Skatturinn" />
        <KpiCard label="Net position" value={iskCompact(netPosition)} hint="Revenue + VSK held on platform" />
      </div>

      {/* Secondary strip */}
      <Card className="px-5 py-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <Stat label="Released this period" value={iskCompact(k.payoutsReleased)} tone="var(--st-success)" />
          <Stat label="Pending release" value={iskCompact(k.payoutsPending)} tone="var(--st-warning)" />
          <Stat label="Refunds issued" value={iskCompact(refundsIssued)} tone="var(--st-danger)" />
          <Stat label="GMV this period" value={iskCompact(k.gmv)} />
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <SectionCard title="Revenue & GMV over time" subtitle="Last 14 days · thousands ISK" className="xl:col-span-2" bodyClassName="pt-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="finRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.neon} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.neon} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="finGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.blue} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="d" tick={{ fill: "#6b6e69", fontSize: 11 }} axisLine={false} tickLine={false} interval={1} />
                <YAxis tick={{ fill: "#6b6e69", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip money />} cursor={{ stroke: "rgba(200,240,0,0.3)" }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={C.neon} strokeWidth={2} fill="url(#finRev)" />
                <Area type="monotone" dataKey="bookings" name="GMV (indexed)" stroke={C.blue} strokeWidth={2} fill="url(#finGmv)" />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 12, color: "#a6a8a3" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Revenue mix" subtitle="Platform fee · who paid">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={personaMix} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
                  {personaMix.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip content={<ChartTip unit="" money={false} />} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12, color: "#a6a8a3" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-[var(--adm-text-3)] text-center -mt-1">Player-paid vs club-paid · by 20% fee earned</p>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
        <SectionCard title="Revenue by session type" subtitle="Platform fee earned · ISK" className="xl:col-span-2" bodyClassName="pt-2">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeMix} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#6b6e69", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b6e69", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => iskCompact(v)} width={64} />
                <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="value" name="Platform fee" radius={[4, 4, 0, 0]} barSize={44}>
                  {typeMix.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Jump to" subtitle="Where the money needs a decision" bodyClassName="p-3">
          <div className="flex flex-col gap-2">
            <ShortcutLink to="/admin/finance/payouts" icon={Wallet} color="var(--adm-neon)" label="Payouts awaiting release" hint="5 in the queue" />
            <ShortcutLink to="/admin/finance/disputes" icon={AlertTriangle} color="var(--st-danger)" label="Open disputes" hint="2 holding funds" />
            <ShortcutLink to="/admin/finance/transactions" icon={Receipt} color="var(--st-info)" label="Transactions ledger" hint="VSK reporting source" />
            <ShortcutLink to="/admin/finance/invoicing" icon={FileText} color="var(--adm-text-2)" label="Invoicing" hint="Tax invoices + statements" />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function ShortcutLink({ to, icon: Icon, color, label, hint }: { to: string; icon: React.ComponentType<{ className?: string }>; color: string; label: string; hint: string }) {
  return (
    <Link to={to} className="group flex items-center gap-3 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card)] px-3.5 py-3 transition-all hover:border-[var(--adm-line-strong)] hover:-translate-y-0.5">
      <span className="grid place-items-center size-9 rounded-lg shrink-0" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--adm-text)] font-medium leading-tight">{label}</p>
        <p className="text-xs text-[var(--adm-text-3)] mt-0.5">{hint}</p>
      </div>
      <ArrowRight className="size-4 text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors shrink-0" />
    </Link>
  );
}

// ── AD·20 Payouts Queue ───────────────────────────────────────────────────────
const PAYOUT_STATES = ["All", "Awaiting release", "Held", "Blocked", "Released"] as const;
type PayoutFilter = (typeof PAYOUT_STATES)[number];

export function PayoutsQueue() {
  const nav = useNavigate();
  const [filter, setFilter] = React.useState<PayoutFilter>("All");
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const counts = React.useMemo(() => {
    const c: Record<string, number> = {};
    payouts.forEach((p) => (c[p.state] = (c[p.state] ?? 0) + 1));
    return c;
  }, []);

  const rows = payouts
    .filter((p) => filter === "All" || p.state === filter)
    .filter((p) => p.payee.toLowerCase().includes(q.toLowerCase()) || p.bookingId.toLowerCase().includes(q.toLowerCase()));

  function bulk(action: "release" | "hold" | "block") {
    const n = selected.size;
    if (n === 0) return;
    const verb = action === "release" ? "released" : action === "hold" ? "held" : "blocked";
    const title = `${n} payout${n === 1 ? "" : "s"} ${verb}`;
    const opts = { description: "Written to the Audit Log · role-gated to Finance / Super Admin." };
    if (action === "release") toast.success(title, opts);
    else if (action === "block") toast.error(title, opts);
    else toast(title, opts);
    setSelected(new Set());
  }

  const cols: Column<Payout>[] = [
    {
      key: "payee", header: "Payee", sortable: true, accessor: (p) => p.payee,
      render: (p) => (
        <div>
          <p className="text-[var(--adm-text)] font-medium">{p.payee}</p>
          <p className="text-xs text-[var(--adm-text-3)] adm-num">{p.id}</p>
        </div>
      ),
    },
    {
      key: "booking", header: "Booking",
      render: (p) => (
        <Link to={`/admin/finance/payouts/${p.id}`} onClick={(e) => e.stopPropagation()} className="text-[var(--adm-neon)] hover:underline adm-num text-sm">
          {p.bookingId}
        </Link>
      ),
    },
    {
      key: "amount", header: "Net payable", align: "right", sortable: true, accessor: (p) => netPayout(p.gross),
      render: (p) => (
        <div className="text-right">
          <HoverTip>
            <TooltipTrigger asChild>
              <span className="inline-block">
                <Money amount={netPayout(p.gross)} className="font-medium text-[var(--adm-text)]" />
              </span>
            </TooltipTrigger>
            <TooltipContent
              className="bg-[var(--adm-elevated)] border border-[var(--adm-line-strong)] text-[var(--adm-text)] rounded-lg px-3 py-2 shadow-xl"
              arrowClassName="bg-[var(--adm-elevated)] fill-[var(--adm-elevated)]"
            >
              <div className="space-y-1 min-w-[160px]">
                <p className="flex items-center justify-between gap-4 text-xs adm-num whitespace-nowrap">
                  <span className="text-[var(--adm-text-3)]">Net payable</span>
                  <span className="font-medium">{isk(netPayout(p.gross))}</span>
                </p>
                <p className="flex items-center justify-between gap-4 text-xs adm-num whitespace-nowrap">
                  <span className="text-[var(--adm-text-3)]">Platform fee</span>
                  <span className="font-medium">{isk(platformFee(p.gross))}</span>
                </p>
              </div>
            </TooltipContent>
          </HoverTip>
        </div>
      ),
    },
    { key: "sessionType", header: "Session", render: (p) => <span className="text-[var(--adm-text-2)] text-sm">{p.sessionType}</span> },
    {
      key: "leg", header: "Leg",
      render: (p) => p.leg
        ? <Pill tone={p.leg === "Remote" ? "info" : "neutral"}>{p.leg}</Pill>
        : <span className="text-[var(--adm-text-3)]">-</span>,
    },
    { key: "completed", header: "Completed", sortable: true, accessor: (p) => p.completedAt, render: (p) => <span className="text-[var(--adm-text-2)] text-sm">{ago(p.completedAt)}</span> },
    { key: "state", header: "State", render: (p) => <StatusPill status={p.state} /> },
    { key: "sla", header: "Waiting", sortable: true, accessor: (p) => p.completedAt, render: (p) => <SlaPill since={p.completedAt} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Payouts Queue"
        description="Every completed session that owes a coach money. Nothing leaves the platform until released here."
        crumbs={[{ label: "Finance", to: "/admin/finance" }, { label: "Payouts" }]}
        actions={<span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--adm-text-3)] border border-[var(--adm-line)] rounded-full px-2.5 py-1"><Lock className="size-3" /> Finance / Super Admin</span>}
      />

      <Toolbar
        className="mb-4"
        left={PAYOUT_STATES.map((s) => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)} count={s === "All" ? payouts.length : counts[s] ?? 0}>
            {s === "All" ? "All" : s}
          </FilterChip>
        ))}
        right={<SearchInput value={q} onChange={setQ} placeholder="Search payee or booking…" className="w-72" />}
      />

      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--adm-neon-line)] bg-[var(--adm-neon-soft)] px-4 py-2.5">
          <span className="text-sm text-[var(--adm-text)]">
            <span className="adm-num font-semibold text-[var(--adm-neon)]">{selected.size}</span> selected
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => bulk("release")} className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] text-xs font-semibold hover:brightness-110 transition">
              <CheckCircle2 className="size-3.5" /> Approve & release ({selected.size})
            </button>
            <button onClick={() => bulk("hold")} className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-[var(--adm-line-strong)] text-[var(--adm-text)] text-xs font-medium hover:bg-[var(--adm-hover)] transition">
              <PauseCircle className="size-3.5" /> Hold
            </button>
            <button onClick={() => bulk("block")} className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[var(--st-danger)] text-xs font-medium hover:bg-[var(--st-danger-soft)] transition">
              <Ban className="size-3.5" /> Block
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(p) => p.id}
        onRowClick={(p) => nav(`/admin/finance/payouts/${p.id}`)}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        initialSort={{ key: "sla", dir: "desc" }}
        empty={<div className="py-6"><EmptyState icon={Wallet} title="No payouts match this filter." hint="The release queue is clear." /></div>}
      />
    </div>
  );
}

// ── AD·21 Payout Detail ─────────────────────────────────────────────────────
export function PayoutDetail() {
  const { id } = useParams();
  const payout = findPayout(id!);

  if (!payout) {
    return (
      <div>
        <PageHeader title="Payout not found" back={{ to: "/admin/finance/payouts", label: "Back to Payouts Queue" }} />
        <EmptyState icon={Wallet} title="This payout could not be found" hint="It may have been released, blocked, or removed." />
      </div>
    );
  }

  const booking = findBooking(payout.bookingId);
  const fee = platformFee(payout.gross);
  const net = netPayout(payout.gross);
  const history = payouts.filter((p) => p.payee === payout.payee && p.id !== payout.id);

  // matching opposite leg of the same hybrid booking
  const matchingLeg = payout.leg
    ? payouts.find((p) => p.bookingId === payout.bookingId && p.id !== payout.id)
    : undefined;

  const linkedDispute = disputes.find((d) => d.bookingId === payout.bookingId);

  return (
    <div>
      <PageHeader
        title={`Payout ${payout.id}`}
        back={{ to: "/admin/finance/payouts", label: "Back to Payouts Queue" }}
        crumbs={[{ label: "Finance", to: "/admin/finance" }, { label: "Payouts", to: "/admin/finance/payouts" }, { label: payout.id }]}
        actions={<StatusPill status={payout.state} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="space-y-5">
          {/* Breakdown */}
          <SectionCard title="Payout breakdown" subtitle={`Payee · ${payout.payee}`}>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              <Field label="Payee">{payout.payee}</Field>
              <Field label="Payout account"><span className="adm-num">{maskAccount(payout.account)}</span></Field>
              <Field label="Source booking">
                <Link to="/admin/bookings" className="text-[var(--adm-neon)] hover:underline adm-num">{payout.bookingId}</Link>
              </Field>
              <Field label="Session type">{payout.sessionType}</Field>
              <Field label="Completed">{dateTime(payout.completedAt)}</Field>
              {payout.leg && (
                <Field label="Hybrid leg">
                  <Pill tone={payout.leg === "Remote" ? "info" : "neutral"}>{payout.leg} party</Pill>
                </Field>
              )}
            </dl>

            <div className="rounded-lg border border-[var(--adm-line)] overflow-hidden">
              <BreakdownRow label="Gross (this leg)" value={payout.gross} sub={payout.leg ? `${payout.leg} share of the booking charge` : "Full session charge"} />
              <BreakdownRow label={`Platform fee · ${pct(PLATFORM_FEE * 100)}`} value={-fee} sub="Valur take rate (KAD-07)" muted />
              <BreakdownRow label="Net payable to payee" value={net} emphasis />
            </div>

            {payout.leg && matchingLeg && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card-2)] px-4 py-3">
                <ArrowLeftRight className="size-4 text-[var(--adm-text-3)] shrink-0" />
                <div className="flex-1 text-sm text-[var(--adm-text-2)]">
                  Matching <span className="text-[var(--adm-text)]">{matchingLeg.leg}</span> leg · {matchingLeg.payee} · net <span className="adm-num text-[var(--adm-text)]">{isk(netPayout(matchingLeg.gross))}</span>
                </div>
                <StatusPill status={matchingLeg.state} />
              </div>
            )}
          </SectionCard>

          {/* Checks */}
          <SectionCard title="Checks" subtitle="What backs this release decision">
            <CheckRow
              icon={ShieldCheck}
              label="Session completion evidence"
              ok={booking?.status === "Completed"}
              detail={booking ? `${booking.id} · ${booking.status} · ${booking.type}` : "Booking record not linked"}
            />
            <CheckRow
              icon={AlertTriangle}
              label="Linked ticket / dispute"
              ok={!linkedDispute}
              detail={linkedDispute ? `${linkedDispute.id} · ${linkedDispute.status} · ${linkedDispute.reason}` : "No open dispute on this booking"}
              warn={!!linkedDispute}
            />
            <CheckRow
              icon={History}
              label="Payee payout history"
              ok
              detail={history.length ? `${history.length} prior payout${history.length === 1 ? "" : "s"} on record` : "First payout for this payee"}
            />

            {payout.flags && payout.flags.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2">Flags on this payout</p>
                <div className="flex flex-wrap gap-2">
                  {payout.flags.map((f, i) => (
                    <Pill key={i} tone="warning" dot>{f}</Pill>
                  ))}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2">Recent payouts · {payout.payee}</p>
                <ul className="divide-y divide-[var(--adm-line)]">
                  {history.slice(0, 4).map((h) => (
                    <li key={h.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="adm-num text-[var(--adm-text-3)]">{h.id}</span>
                      <span className="text-[var(--adm-text-2)] adm-num">{ago(h.completedAt)}</span>
                      <Money amount={netPayout(h.gross)} className="text-[var(--adm-text)]" />
                      <StatusPill status={h.state} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Sticky decision panel */}
        <div className="lg:sticky lg:top-4 space-y-4">
          <PayoutDecision payout={payout} net={net} />
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value, sub, muted, emphasis }: { label: string; value: number; sub?: string; muted?: boolean; emphasis?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--adm-line)] last:border-0 ${emphasis ? "bg-[var(--adm-card-2)]" : ""}`}>
      <div>
        <p className={`text-sm ${emphasis ? "text-[var(--adm-text)] font-semibold" : muted ? "text-[var(--adm-text-3)]" : "text-[var(--adm-text-2)]"}`}>{label}</p>
        {sub && <p className="text-[11px] text-[var(--adm-text-3)] mt-0.5">{sub}</p>}
      </div>
      <Money amount={value} sign className={emphasis ? "text-base font-semibold text-[var(--adm-neon)]" : muted ? "text-[var(--adm-text-3)]" : "text-[var(--adm-text)]"} />
    </div>
  );
}

function CheckRow({ icon: Icon, label, detail, ok, warn }: { icon: React.ComponentType<{ className?: string }>; label: string; detail: string; ok: boolean; warn?: boolean }) {
  const color = warn ? "var(--st-danger)" : ok ? "var(--st-success)" : "var(--st-warning)";
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--adm-line)] last:border-0">
      <span className="grid place-items-center size-8 rounded-lg shrink-0 mt-0.5" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>
        <Icon className="size-4" />
      </span>
      <div className="flex-1">
        <p className="text-sm text-[var(--adm-text)]">{label}</p>
        <p className="text-xs text-[var(--adm-text-3)] mt-0.5">{detail}</p>
      </div>
      {ok && !warn && <CheckCircle2 className="size-4 text-[var(--st-success)] shrink-0 mt-1" />}
    </div>
  );
}

function PayoutDecision({ payout, net }: { payout: Payout; net: number }) {
  const nav = useNavigate();
  const [mode, setMode] = React.useState<"hold" | null>(null);
  const [reason, setReason] = React.useState("");
  const settled = payout.state === "Released" || payout.state === "Blocked";

  function release() {
    toast.success(`Released ${isk(net)} to ${payout.payee}`, { description: `${payout.id} · written to the Audit Log.` });
  }
  function hold() {
    if (reason.trim().length < 4) {
      toast.error("A reason is required", { description: "Held payouts must be reason-stamped." });
      return;
    }
    toast(`${payout.id} held`, { description: "Reason recorded · written to the Audit Log." });
    setMode(null); setReason("");
  }
  const linkedDispute = disputes.find((d) => d.bookingId === payout.bookingId);

  return (
    <SectionCard title="Decision" subtitle="Release · Hold · Block (KAD-05)">
      {settled ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card-2)] px-3.5 py-3">
          <CircleDot className="size-4 text-[var(--adm-text-3)]" />
          <p className="text-sm text-[var(--adm-text-2)]">This payout is <span className="text-[var(--adm-text)]">{payout.state.toLowerCase()}</span> - no further action.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <button onClick={release} className="w-full h-11 rounded-lg bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] text-sm font-semibold hover:brightness-110 transition inline-flex items-center justify-center gap-2">
            <CheckCircle2 className="size-4" /> Approve & release · {isk(net)}
          </button>
          <button onClick={() => setMode(mode === "hold" ? null : "hold")} className="w-full h-10 rounded-lg border border-[var(--adm-line-strong)] text-[var(--adm-text)] text-sm font-medium hover:bg-[var(--adm-hover)] transition inline-flex items-center justify-center gap-2">
            <PauseCircle className="size-4" /> Hold {payout.state === "Held" ? "· re-hold" : ""}
          </button>
          <button onClick={() => nav("/admin/finance/disputes")} className="w-full h-10 rounded-lg text-[var(--st-danger)] text-sm font-medium hover:bg-[var(--st-danger-soft)] transition inline-flex items-center justify-center gap-2">
            <Ban className="size-4" /> Block → open dispute
          </button>
        </div>
      )}

      {mode === "hold" && !settled && (
        <div className="mt-4">
          <label className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">Reason for hold (required)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Why is this payout being held…"
            className="adm-focus mt-2 w-full rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] px-3 py-2 text-sm text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] focus:border-[var(--adm-neon-line)] resize-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => { setMode(null); setReason(""); }} className="h-9 px-4 rounded-lg text-sm text-[var(--adm-text-2)] hover:text-[var(--adm-text)] transition">Cancel</button>
            <button onClick={hold} className="h-9 px-5 rounded-lg text-sm font-semibold bg-[var(--adm-card-2)] text-[var(--adm-text)] border border-[var(--adm-line-strong)] hover:bg-[var(--adm-elevated)] transition">Confirm hold</button>
          </div>
        </div>
      )}

      {linkedDispute && (
        <Link to="/admin/finance/disputes" className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--st-danger)]/30 bg-[var(--st-danger-soft)] px-3 py-2 text-xs text-[var(--adm-text-2)] hover:border-[var(--st-danger)]/50 transition">
          <AlertTriangle className="size-3.5 text-[var(--st-danger)] shrink-0" />
          Linked to dispute {linkedDispute.id} ({linkedDispute.status})
          <ExternalLink className="size-3 ml-auto text-[var(--adm-text-3)]" />
        </Link>
      )}

      <p className="text-[11px] text-[var(--adm-text-3)] mt-4 leading-relaxed">Role-gated to Finance / Super Admin. Every decision and reason is written to the Audit Log.</p>
    </SectionCard>
  );
}

// ── AD·22 Transactions Ledger ─────────────────────────────────────────────────
const TXN_TONE: Record<Txn["type"], React.ComponentProps<typeof Pill>["tone"]> = {
  Charge: "success",
  "Platform fee": "neutral",
  "VAT (VSK)": "info",
  Payout: "warning",
  Refund: "danger",
};
const TXN_TYPES = ["All", "Charge", "Payout", "Refund", "VAT (VSK)"] as const;
type TxnFilter = (typeof TXN_TYPES)[number];

export function TransactionsLedger() {
  const [filter, setFilter] = React.useState<TxnFilter>("All");
  const [method, setMethod] = React.useState("all");
  const [q, setQ] = React.useState("");

  const rows = transactions
    .filter((t) => filter === "All" || t.type === filter)
    .filter((t) => method === "all" || t.method === method)
    .filter((t) => t.linked.toLowerCase().includes(q.toLowerCase()) || t.id.toLowerCase().includes(q.toLowerCase()) || t.counterparty.toLowerCase().includes(q.toLowerCase()));

  const totals = React.useMemo(() => {
    const revenue = transactions.filter((t) => t.type === "Charge").reduce((s, t) => s + t.fee, 0);
    const fees = transactions.reduce((s, t) => s + (t.type === "Payout" || t.type === "Charge" ? Math.max(t.fee, 0) : 0), 0);
    const vatCollected = transactions.filter((t) => t.type === "Charge").reduce((s, t) => s + t.vatAmt, 0);
    return { revenue, fees, vatCollected };
  }, []);

  const cols: Column<Txn>[] = [
    { key: "date", header: "Date", sortable: true, accessor: (t) => t.date, render: (t) => <span className="text-[var(--adm-text-2)] adm-num text-xs">{dateTime(t.date)}</span> },
    { key: "type", header: "Type", render: (t) => <Pill tone={TXN_TONE[t.type]} dot>{t.type}</Pill> },
    { key: "counterparty", header: "Counterparty", render: (t) => <span className="text-[var(--adm-text)]">{t.counterparty}</span> },
    { key: "gross", header: "Gross", align: "right", sortable: true, accessor: (t) => t.gross, render: (t) => t.gross ? <Money amount={t.gross} className="text-[var(--adm-text-2)]" /> : <span className="text-[var(--adm-text-3)]">-</span> },
    { key: "fee", header: "Fee", align: "right", render: (t) => t.fee ? <Money amount={t.fee} sign className="text-[var(--adm-text-2)]" /> : <span className="text-[var(--adm-text-3)]">-</span> },
    { key: "vatAmt", header: "VAT (VSK)", align: "right", render: (t) => t.vatAmt ? <Money amount={t.vatAmt} sign className="text-[var(--adm-text-2)]" /> : <span className="text-[var(--adm-text-3)]">-</span> },
    { key: "net", header: "Net", align: "right", sortable: true, accessor: (t) => t.net, render: (t) => <Money amount={t.net} sign className="font-medium text-[var(--adm-text)]" /> },
    {
      key: "linked", header: "Linked",
      render: (t) => <span className="adm-num text-xs text-[var(--adm-text-3)]">{t.linked}</span>,
    },
    {
      key: "method", header: "Method",
      render: (t) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--adm-text-2)]">
          <Banknote className="size-3.5 text-[var(--adm-text-3)]" />{t.method}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Transactions Ledger"
        description="The full money trail - charges in, fees taken, VAT recorded, payouts and refunds out. Read-only."
        crumbs={[{ label: "Finance", to: "/admin/finance" }, { label: "Transactions" }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success("VAT (VSK) summary prepared")} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm text-[var(--adm-text-2)] border border-[var(--adm-line)] hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)] transition-colors"><Receipt className="size-4" /> VAT (VSK) summary</button>
            <button onClick={() => toast.success("Ledger exported to CSV")} className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm text-[var(--adm-text-2)] border border-[var(--adm-line)] hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)] transition-colors"><Download className="size-4" /> Export CSV</button>
          </div>
        }
      />


      {/* Period totals - broken out into individual cards, like Finance Overview */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Platform revenue" value={isk(totals.revenue)} accent hint="20% take on charges this period" />
        <KpiCard label="Fees charged" value={isk(totals.fees)} hint="Total platform fees across lines" />
        <KpiCard label="VAT (VSK) collected" value={isk(totals.vatCollected)} hint="24% standard · owed to Skatturinn" />
        <KpiCard label="Ledger entries" value={String(transactions.length)} hint="Money movements recorded" />
      </div>

      <Toolbar
        className="mb-4"
        left={TXN_TYPES.map((t) => (
          <FilterChip key={t} active={filter === t} onClick={() => setFilter(t)}>{t}</FilterChip>
        ))}
        right={
          <>
            <MiniSelect
              value={method}
              onChange={setMethod}
              options={[
                { value: "all", label: "All methods" },
                { value: "Card", label: "Card" },
                { value: "Bank transfer", label: "Bank transfer" },
              ]}
            />
            <SearchInput value={q} onChange={setQ} placeholder="Search reference…" className="w-60" />
          </>
        }
      />

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(t) => t.id}
        initialSort={{ key: "date", dir: "desc" }}
        empty={<div className="py-6"><EmptyState icon={Receipt} title="No transactions match these filters." /></div>}
      />

      <p className="text-xs text-[var(--adm-text-3)] mt-3 flex items-center gap-1.5"><Lock className="size-3" /> Read-only - the ledger is append-only and cannot be edited from the console.</p>
    </div>
  );
}

// ── AD·23 Invoicing ───────────────────────────────────────────────────────────
const INVOICE_KINDS = ["All", "Tax invoice", "Payout statement"] as const;
const INVOICE_STATUSES = ["All", "Draft", "Issued", "Paid"] as const;

export function Invoicing() {
  const [kind, setKind] = React.useState<(typeof INVOICE_KINDS)[number]>("All");
  const [status, setStatus] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const rows = invoices
    .filter((i) => kind === "All" || i.kind === kind)
    .filter((i) => status === "All" || i.status === status)
    .filter((i) => i.number.toLowerCase().includes(q.toLowerCase()) || i.recipient.toLowerCase().includes(q.toLowerCase()));

  const active = openId ? invoices.find((i) => i.id === openId) ?? null : null;

  function act(label: string, inv: Invoice) {
    toast(`${label} · ${inv.number}`, { description: inv.recipient });
  }

  const cols: Column<Invoice>[] = [
    { key: "number", header: "Number", sortable: true, accessor: (i) => i.number, render: (i) => <span className="adm-num text-[var(--adm-text)] font-medium">{i.number}</span> },
    {
      key: "kind", header: "Kind",
      render: (i) => <Pill tone={i.kind === "Tax invoice" ? "info" : "neutral"}>{i.kind}</Pill>,
    },
    { key: "recipient", header: "Recipient", render: (i) => <span className="text-[var(--adm-text-2)]">{i.recipient}</span> },
    { key: "date", header: "Date", sortable: true, accessor: (i) => i.date, render: (i) => <span className="text-[var(--adm-text-2)] adm-num text-xs">{date(i.date)}</span> },
    { key: "amount", header: "Amount", align: "right", sortable: true, accessor: (i) => i.amount, render: (i) => <Money amount={i.amount} className="text-[var(--adm-text)]" /> },
    { key: "vatAmt", header: "VAT (VSK)", align: "right", render: (i) => i.vatAmt ? <Money amount={i.vatAmt} className="text-[var(--adm-text-2)]" /> : <span className="text-[var(--adm-text-3)]">-</span> },
    { key: "status", header: "Status", render: (i) => <StatusPill status={i.status} /> },
    {
      key: "actions", header: "", align: "right",
      render: (i) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <RowActionButton icon={Eye} title="PDF preview" onClick={() => setOpenId(i.id)} />
          <RowActionButton icon={Download} title="Download" onClick={() => act("Downloaded", i)} />
          <RowActionButton icon={RefreshCw} title="Reissue" onClick={() => act("Reissued", i)} />
          <RowActionButton icon={Send} title="Resend" onClick={() => act("Resent", i)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Invoicing"
        description="Two Iceland-shaped documents - tax invoices issued to buyers and payout statements issued to coaches."
        crumbs={[{ label: "Finance", to: "/admin/finance" }, { label: "Invoicing" }]}
      />

      <Toolbar
        className="mb-4"
        left={
          <>
            {INVOICE_KINDS.map((kd) => (
              <FilterChip key={kd} active={kind === kd} onClick={() => setKind(kd)}>{kd}</FilterChip>
            ))}
            <span className="w-px h-5 bg-[var(--adm-line)] mx-1" />
            <MiniSelect
              value={status}
              onChange={setStatus}
              options={INVOICE_STATUSES.map((s) => ({ value: s, label: s === "All" ? "All statuses" : s }))}
            />
          </>
        }
        right={<SearchInput value={q} onChange={setQ} placeholder="Search number or recipient…" className="w-72" />}
      />

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(i) => i.id}
        onRowClick={(i) => setOpenId(i.id)}
        initialSort={{ key: "date", dir: "desc" }}
        empty={<div className="py-6"><EmptyState icon={FileText} title="No invoices match these filters." /></div>}
      />

      <p className="text-xs text-[var(--adm-text-3)] mt-3 leading-relaxed">
        Tax invoices carry sequential VSK numbering; payout statements run on their own PS series. Clubs may settle tax invoices via pay-by-invoice (bank transfer), reconciled back to the ledger.
      </p>

      <SideTray
        open={!!active}
        onClose={() => setOpenId(null)}
        title={active ? active.number : ""}
        subtitle={active?.recipient}
        width={440}
      >
        {active && <InvoiceDocument invoice={active} onAction={act} />}
      </SideTray>
    </div>
  );
}

function InvoiceDocument({ invoice, onAction }: { invoice: Invoice; onAction: (label: string, inv: Invoice) => void }) {
  const isTax = invoice.kind === "Tax invoice";
  const subtotal = invoice.amount - invoice.vatAmt;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--adm-line)] bg-[var(--adm-card-2)] overflow-hidden">
        <div className="flex items-start justify-between px-5 pt-5 pb-4">
          <div>
            <p className="text-base font-bold tracking-wide text-[var(--adm-text)]">VALUR</p>
            <p className="text-xs text-[var(--adm-text-3)]">Reykjavík, Iceland · kt. 000000-0000</p>
          </div>
          <StatusPill status={invoice.status} />
        </div>

        <dl className="grid grid-cols-2 gap-4 px-5 pb-5">
          <Field label={isTax ? "Tax invoice no." : "Statement no."}><span className="adm-num font-medium text-[var(--adm-text)]">{invoice.number}</span></Field>
          <Field label="Date issued"><span className="adm-num text-[var(--adm-text)]">{date(invoice.date)}</span></Field>
          <Field label={isTax ? "Billed to" : "Paid to"}><span className="text-[var(--adm-text)]">{invoice.recipient}</span></Field>
          <Field label="Document kind"><Pill tone={isTax ? "info" : "neutral"}>{invoice.kind}</Pill></Field>
        </dl>

        <div className="border-t border-[var(--adm-line)]">
          {isTax ? (
            <>
              <DocRow label="Subtotal" value={<Money amount={subtotal} />} />
              <DocRow label="VAT (VSK · 24%)" value={<Money amount={invoice.vatAmt} />} />
              <DocRow label="Total due" value={<Money amount={invoice.amount} />} strong />
            </>
          ) : (
            <DocRow label="Net payout" sub="Not VAT-applicable - coach payout statement" value={<Money amount={invoice.amount} />} strong />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ActionButton icon={Download} onClick={() => onAction("Downloaded", invoice)}>Download PDF</ActionButton>
        <ActionButton icon={Send} onClick={() => onAction("Resent", invoice)}>Resend</ActionButton>
        <ActionButton icon={RefreshCw} onClick={() => onAction("Reissued", invoice)}>Reissue</ActionButton>
      </div>

      <p className="text-[11px] text-[var(--adm-text-3)] leading-relaxed">
        {isTax
          ? "Sequential VSK numbering per series · settleable via card or pay-by-invoice bank transfer."
          : "Net-of-fee statement for the coach's own records · not a VAT document."}
      </p>
    </div>
  );
}

function DocRow({ label, sub, value, strong }: { label: string; sub?: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[var(--adm-line)] last:border-0" style={strong ? { background: "var(--adm-card)" } : undefined}>
      <div className="min-w-0">
        <p className={cn("text-sm truncate", strong ? "text-[var(--adm-text)] font-semibold" : "text-[var(--adm-text-2)]")}>{label}</p>
        {sub && <p className="text-[11px] text-[var(--adm-text-3)]">{sub}</p>}
      </div>
      <span className="text-sm shrink-0 adm-num">{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, onClick, children }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--adm-line)] text-[var(--adm-text)] text-xs font-medium hover:bg-[var(--adm-hover)] hover:border-[var(--adm-line-strong)] transition-colors"
    >
      <Icon className="size-3.5 text-[var(--adm-text-3)]" />
      {children}
    </button>
  );
}

// ── AD·24 Refunds & Disputes ──────────────────────────────────────────────────
const DISPUTE_STATUSES = ["All", "Open", "Holding", "Resolved"] as const;

export function RefundsDisputes() {
  const [status, setStatus] = React.useState<(typeof DISPUTE_STATUSES)[number]>("All");
  const [q, setQ] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const rows = disputes
    .filter((d) => status === "All" || d.status === status)
    .filter((d) => d.bookingId.toLowerCase().includes(q.toLowerCase()) || d.id.toLowerCase().includes(q.toLowerCase()));

  const active = openId ? disputes.find((d) => d.id === openId) ?? null : null;

  const cols: Column<Dispute>[] = [
    {
      key: "booking", header: "Booking",
      render: (d) => (
        <div>
          <Link to="/admin/bookings" onClick={(e) => e.stopPropagation()} className="text-[var(--adm-neon)] hover:underline adm-num text-sm">{d.bookingId}</Link>
          <p className="text-xs text-[var(--adm-text-3)] adm-num">{d.id}</p>
        </div>
      ),
    },
    { key: "raisedBy", header: "Raised by", render: (d) => <span className="text-[var(--adm-text-2)]">{d.raisedBy}</span> },
    { key: "raisedByPersona", header: "Buyer", render: (d) => <PersonaTag persona={d.raisedByPersona} /> },
    { key: "reason", header: "Reason", render: (d) => <span className="text-[var(--adm-text-2)] text-sm">{d.reason}</span> },
    { key: "amount", header: "Amount", align: "right", sortable: true, accessor: (d) => d.amount, render: (d) => <Money amount={d.amount} className="text-[var(--adm-text)]" /> },
    { key: "payoutState", header: "Linked payout", render: (d) => d.payoutState === "-" ? <span className="text-[var(--adm-text-3)]">-</span> : <StatusPill status={d.payoutState} /> },
    { key: "status", header: "Status", render: (d) => <StatusPill status={d.status} /> },
    { key: "opened", header: "Opened", sortable: true, accessor: (d) => d.openedAt, render: (d) => <span className="text-[var(--adm-text-2)] text-sm">{ago(d.openedAt)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Refunds & Disputes"
        description="The safety valve. When a session goes wrong, this is where funds are held and the money is unwound."
        crumbs={[{ label: "Finance", to: "/admin/finance" }, { label: "Disputes" }]}
      />

      <Toolbar
        className="mb-4"
        left={DISPUTE_STATUSES.map((s) => (
          <FilterChip key={s} active={status === s} onClick={() => setStatus(s)}>{s}</FilterChip>
        ))}
        right={<SearchInput value={q} onChange={setQ} placeholder="Search booking ID…" className="w-64" />}
      />

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(d) => d.id}
        onRowClick={(d) => setOpenId(d.id)}
        initialSort={{ key: "opened", dir: "desc" }}
        empty={<div className="py-6"><EmptyState icon={Scale} title="No disputes match this filter." hint="No money is in question right now." /></div>}
      />

      {/* Case detail opens as a slide-over tray (SaaS pattern) - the list never reflows */}
      <SideTray
        open={!!active}
        onClose={() => setOpenId(null)}
        title={active ? `Case ${active.id}` : ""}
        subtitle={active?.reason}
        width={480}
      >
        {active && <CaseDetail dispute={active} />}
      </SideTray>
    </div>
  );
}

function CaseDetail({ dispute }: { dispute: Dispute }) {
  const [mode, setMode] = React.useState<"full" | "partial" | "decline" | null>(null);
  const [amount, setAmount] = React.useState<string>(String(dispute.amount));
  const [reason, setReason] = React.useState("");

  const booking = findBooking(dispute.bookingId);
  const linkedPayouts = payouts.filter((p) => p.bookingId === dispute.bookingId);

  function submit() {
    if (mode === "decline" && reason.trim().length < 4) {
      toast.error("A reason is required", { description: "Declining a dispute must be reason-stamped." });
      return;
    }
    if (mode === "partial") {
      const amt = Number(amount);
      if (!amt || amt <= 0 || amt > dispute.amount) {
        toast.error("Enter a valid partial amount", { description: `Must be between 1 and ${isk(dispute.amount)}.` });
        return;
      }
    }
    const msg =
      mode === "full" ? `Full refund of ${isk(dispute.amount)} issued`
        : mode === "partial" ? `Partial refund of ${isk(Number(amount))} issued`
          : `Dispute ${dispute.id} declined`;
    toast.success(msg, { description: linkedPayouts.length ? `Linked payout(s) reversed proportionally · written to the Audit Log.` : "Written to the Audit Log." });
    setMode(null); setReason("");
  }

  return (
    <>
      {/* Context */}
      <dl className="grid grid-cols-2 gap-4 mb-4">
        <Field label="Booking">
          <Link to="/admin/bookings" className="text-[var(--adm-neon)] hover:underline adm-num">{dispute.bookingId}</Link>
        </Field>
        <Field label="Status"><StatusPill status={dispute.status} /></Field>
        <Field label="Raised by">
          <span className="inline-flex items-center gap-2">
            {dispute.raisedBy} <PersonaTag persona={dispute.raisedByPersona} />
          </span>
        </Field>
        <Field label="Opened">{ago(dispute.openedAt)}</Field>
        <Field label="Amount in question"><Money amount={dispute.amount} className="text-[var(--adm-text)] font-medium" /></Field>
        {booking && <Field label="Session"><span className="text-sm">{booking.type} · {isk(booking.amount)}</span></Field>}
      </dl>

      {/* Linked payouts */}
      {linkedPayouts.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2">Linked payout{linkedPayouts.length === 1 ? "" : "s"}</p>
          <ul className="rounded-lg border border-[var(--adm-line)] overflow-hidden">
            {linkedPayouts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 border-b border-[var(--adm-line)] last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="adm-num text-xs text-[var(--adm-text-3)]">{p.id}</span>
                  {p.leg && <Pill tone={p.leg === "Remote" ? "info" : "neutral"}>{p.leg}</Pill>}
                </div>
                <Money amount={netPayout(p.gross)} className="text-[var(--adm-text-2)] text-sm" />
                <StatusPill status={p.state} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes thread */}
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2">Notes</p>
        <div className="space-y-2.5">
          <ThreadNote author={dispute.raisedBy} at={dispute.openedAt} body={dispute.reason} />
          <ThreadNote author="Sigrún H." internal at="2026-06-27T18:20:00Z" body="Holding the linked payout while we confirm the session record." />
        </div>
      </div>

      {/* Resolution actions */}
      {dispute.status === "Resolved" ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card-2)] px-3.5 py-3">
          <CheckCircle2 className="size-4 text-[var(--st-success)]" />
          <p className="text-sm text-[var(--adm-text-2)]">This case is resolved - no further action.</p>
        </div>
      ) : (
        <>
          <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2">Resolution</p>
          <div className="grid grid-cols-3 gap-2">
            <ResBtn active={mode === "full"} onClick={() => setMode("full")} icon={RefreshCw} label="Full refund" tone="var(--st-danger)" />
            <ResBtn active={mode === "partial"} onClick={() => setMode("partial")} icon={Scale} label="Partial" tone="var(--st-warning)" />
            <ResBtn active={mode === "decline"} onClick={() => setMode("decline")} icon={Ban} label="Decline" tone="var(--adm-text-2)" />
          </div>

          {mode === "partial" && (
            <div className="mt-3">
              <label className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">Partial refund amount (ISK)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={dispute.amount}
                min={0}
                className="adm-focus adm-num mt-2 w-full h-10 rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] px-3 text-sm text-[var(--adm-text)] focus:border-[var(--adm-neon-line)]"
              />
              <p className="text-[11px] text-[var(--adm-text-3)] mt-1">Max {isk(dispute.amount)} (amount in question).</p>
            </div>
          )}

          {mode === "decline" && (
            <div className="mt-3">
              <label className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">Reason for decline (required)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Explain why this dispute is declined…"
                className="adm-focus mt-2 w-full rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] px-3 py-2 text-sm text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] focus:border-[var(--adm-neon-line)] resize-none"
              />
            </div>
          )}

          {mode && (
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => { setMode(null); setReason(""); }} className="h-9 px-4 rounded-lg text-sm text-[var(--adm-text-2)] hover:text-[var(--adm-text)] transition">Cancel</button>
              <button
                onClick={submit}
                className={`h-9 px-5 rounded-lg text-sm font-semibold transition ${mode === "decline" ? "bg-[var(--adm-card-2)] text-[var(--adm-text)] border border-[var(--adm-line-strong)] hover:bg-[var(--adm-elevated)]" : "bg-[var(--st-danger)] text-white hover:brightness-110"}`}
              >
                Confirm {mode === "full" ? "full refund" : mode === "partial" ? "partial refund" : "decline"}
              </button>
            </div>
          )}

          <p className="text-[11px] text-[var(--adm-text-3)] mt-4 leading-relaxed flex items-start gap-1.5">
            <AlertTriangle className="size-3 mt-0.5 shrink-0 text-[var(--st-warning)]" />
            A refund reverses the linked payout(s) proportionally per policy - for hybrid bookings, both legs are unwound.
          </p>
        </>
      )}
    </>
  );
}

function ThreadNote({ author, at, body, internal }: { author: string; at: string; body: string; internal?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card-2)] px-3.5 py-2.5">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="size-3.5 text-[var(--adm-text-3)]" />
        <span className="text-xs font-medium text-[var(--adm-text-2)]">{author}</span>
        {internal && <Pill tone="neutral" className="text-[10px] px-1.5 py-0">Internal</Pill>}
        <span className="text-[11px] text-[var(--adm-text-3)] ml-auto adm-num">{ago(at)}</span>
      </div>
      <p className="text-sm text-[var(--adm-text-2)] leading-snug">{body}</p>
    </div>
  );
}

function ResBtn({ active, onClick, icon: Icon, label, tone }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string; tone: string }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-lg border py-2.5 transition-all"
      style={active ? { borderColor: tone, boxShadow: `inset 0 0 0 1px ${tone}`, background: "var(--adm-card-2)" } : { borderColor: "var(--adm-line)" }}
    >
      <Icon className="size-4" style={{ color: active ? tone : "var(--adm-text-3)" }} />
      <span className="text-[11px] font-medium text-[var(--adm-text)]">{label}</span>
    </button>
  );
}
