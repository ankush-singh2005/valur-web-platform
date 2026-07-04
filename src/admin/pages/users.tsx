import * as React from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  Download, ArrowRight, Star, ShieldCheck, ShieldOff, BadgeCheck,
  TrendingUp, LifeBuoy, Wallet, CalendarClock, Lock, Building2,
  Users as UsersIcon, FileText, AlertTriangle, ChevronRight,
  CreditCard, PlayCircle, SlidersHorizontal, UserSearch,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { DataTable, type Column } from "../components/DataTable";
import {
  SectionCard, StatusPill, PersonaTag, TierBadge, Money, Avatar,
  EmptyState, Field, Stat, RowActionButton,
} from "../components/primitives";
import { SearchInput, FilterChip, Toolbar } from "../components/controls";
import {
  coaches, players, clubs, bookings, payouts, approvalQueue, disputes,
  findCoach, findPlayer, findClub,
  type Coach, type Player, type Club, type Booking,
} from "../data/mock";
import { TIERS, type Persona } from "../lib/constants";
import { date, num, maskAccount, netPayout } from "../lib/format";

// ── small shared bits ─────────────────────────────────────────────────────────

/** Find the live Tier-L2 request for a member so "Change tier" deep-links into a
 *  real review; falls back to the Approvals Hub when none is open. */
function tierUpgradeHref(refId: string): string {
  const item = approvalQueue.find((a) => a.kind === "Tier L2" && a.refId === refId);
  return item ? `/admin/approvals/tier/${item.id}` : "/admin/approvals";
}

function GhostBtn({
  children,
  onClick,
  to,
  icon: Icon,
  tone = "neutral",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "danger" | "success" | "neon";
}) {
  const toneCls =
    tone === "danger"
      ? "text-[var(--st-danger)] border-[var(--adm-line)] hover:bg-[var(--st-danger-soft)] hover:border-[var(--st-danger)]"
      : tone === "success"
        ? "text-[var(--st-success)] border-[var(--adm-line)] hover:bg-[var(--st-success-soft)] hover:border-[var(--st-success)]"
        : tone === "neon"
          ? "text-[var(--adm-neon)] border-[var(--adm-neon-line)] hover:bg-[var(--adm-neon-soft)]"
          : "text-[var(--adm-text-2)] border-[var(--adm-line)] hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)]";
  const cls = `w-full inline-flex items-center justify-center gap-2 h-10 px-3.5 rounded-lg text-sm font-medium border transition-colors ${toneCls}`;
  const inner = (
    <>
      {Icon && <Icon className="size-4" />}
      {children}
    </>
  );
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button onClick={onClick} className={cls}>{inner}</button>;
}

function ExportCsvButton() {
  return (
    <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm text-[var(--adm-text-2)] border border-[var(--adm-line)] hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)] transition-colors">
      <Download className="size-4" /> Export CSV
    </button>
  );
}

/** Sticky right-rail action panel used across all detail screens. */
function ActionPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <div className="space-y-2">{children}</div>
    </SectionCard>
  );
}

/** Compact booking/activity row reused on coach/player/club detail screens. */
function ActivityRow({ b, who }: { b: Booking; who: string }) {
  return (
    <li className="flex items-center gap-3 px-5 py-3 border-b border-[var(--adm-line)] last:border-0">
      <span className="grid place-items-center size-9 rounded-lg shrink-0 bg-[var(--adm-card-2)] border border-[var(--adm-line)]">
        <CalendarClock className="size-4 text-[var(--adm-text-3)]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--adm-text)] truncate">
          {who} <span className="text-[var(--adm-text-3)]">·</span>{" "}
          <span className="text-[var(--adm-text-2)]">{b.type}</span>
        </p>
        <p className="text-xs text-[var(--adm-text-3)] adm-num">{date(b.when)} · {b.id}</p>
      </div>
      <Money amount={b.amount} className="text-sm" />
      <StatusPill status={b.status} />
    </li>
  );
}

function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">{children}</div>;
}

// ════════════════════════════════════════════════════════════════════════════
// AD·11 - Coaches Directory
// ════════════════════════════════════════════════════════════════════════════
type CoachFilter = "all" | "pending" | "suspended" | "hybrid";

export function CoachesDirectory() {
  const nav = useNavigate();
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<CoachFilter>("all");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const counts = React.useMemo(
    () => ({
      pending: coaches.filter((c) => c.status === "Pending").length,
      suspended: coaches.filter((c) => c.status === "Suspended").length,
      hybrid: coaches.filter((c) => c.hybridEnabled).length,
    }),
    []
  );

  const rows = coaches
    .filter((c) =>
      filter === "pending" ? c.status === "Pending"
      : filter === "suspended" ? c.status === "Suspended"
      : filter === "hybrid" ? c.hybridEnabled
      : true
    )
    .filter((c) => {
      const t = q.toLowerCase();
      return c.name.toLowerCase().includes(t) || c.email.toLowerCase().includes(t);
    });

  // bulk action only sensible for non-pending coaches (active ⇄ suspended)
  const selectedCoaches = coaches.filter((c) => selected.has(c.id));
  const anySuspended = selectedCoaches.some((c) => c.status === "Suspended");

  const cols: Column<Coach>[] = [
    {
      key: "coach", header: "Coach", sortable: true, accessor: (c) => c.name,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.name} persona="coach" size={34} />
          <div className="min-w-0">
            <p className="text-[var(--adm-text)] font-medium truncate">{c.name}</p>
            <p className="text-xs text-[var(--adm-text-3)] truncate">{c.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "tier", header: "Tier", sortable: true, accessor: (c) => TIERS.coach.indexOf(c.tier as never),
      render: (c) => <TierBadge tier={c.tier} persona="coach" />,
    },
    {
      key: "types", header: "Session types",
      render: (c) => <span className="text-xs text-[var(--adm-text-2)]">{c.sessionTypes.join(" · ")}</span>,
    },
    { key: "status", header: "Status", render: (c) => <StatusPill status={c.status} /> },
    {
      key: "rating", header: "Rating", align: "right", sortable: true, accessor: (c) => c.rating,
      render: (c) =>
        c.rating > 0 ? (
          <span className="inline-flex items-center gap-1 adm-num text-[var(--adm-text)]">
            <Star className="size-3.5 fill-[var(--adm-neon)] text-[var(--adm-neon)]" />
            {c.rating.toFixed(1).replace(".", ",")}
          </span>
        ) : (
          <span className="text-[var(--adm-text-3)]">-</span>
        ),
    },
    {
      key: "sessions", header: "Sessions", align: "right", sortable: true, accessor: (c) => c.sessionsDelivered,
      render: (c) => <span className="adm-num text-[var(--adm-text-2)]">{num(c.sessionsDelivered)}</span>,
    },
    {
      key: "earned", header: "Total earned", align: "right", sortable: true, accessor: (c) => c.totalEarned,
      render: (c) => <Money amount={c.totalEarned} />,
    },
    {
      key: "joined", header: "Joined", align: "right", sortable: true, accessor: (c) => c.joined,
      render: (c) => <span className="adm-num text-[var(--adm-text-3)] text-xs">{date(c.joined)}</span>,
    },
    {
      key: "actions", header: "", align: "right",
      render: (c) =>
        c.status === "Pending"
          ? <RowActionButton icon={ArrowRight} tone="primary" to={`/admin/approvals/coach/${c.id}`}>Review</RowActionButton>
          : <span className="text-[var(--adm-text-3)]">-</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Coaches"
        crumbs={[{ label: "Users" }, { label: "Coaches" }]}
        description="Every approved, pending and suspended coach on the platform. The directory is for lookup and admin action - the trust gate lives in Approvals."
        actions={<ExportCsvButton />}
      />

      <Toolbar
        className="mb-4"
        left={
          <>
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All <span className="adm-num opacity-70">{coaches.length}</span></FilterChip>
            <FilterChip active={filter === "pending"} onClick={() => setFilter("pending")} count={counts.pending}>Pending approval</FilterChip>
            <FilterChip active={filter === "suspended"} onClick={() => setFilter("suspended")} count={counts.suspended}>Suspended</FilterChip>
            <FilterChip active={filter === "hybrid"} onClick={() => setFilter("hybrid")} count={counts.hybrid}>Hybrid-enabled</FilterChip>
          </>
        }
        right={<SearchInput value={q} onChange={setQ} placeholder="Search name or email…" className="w-72" />}
      />

      {selected.size > 0 && (
        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-[var(--adm-neon-line)] bg-[var(--adm-neon-soft)] px-4 py-2.5">
          <span className="text-sm text-[var(--adm-text)]">
            <span className="adm-num font-semibold text-[var(--adm-neon)]">{selected.size}</span> coach{selected.size > 1 ? "es" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            {anySuspended ? (
              <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-[var(--st-success)] border border-[var(--st-success)]/40 hover:bg-[var(--st-success-soft)] transition-colors">
                <ShieldCheck className="size-3.5" /> Reactivate
              </button>
            ) : (
              <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-[var(--st-danger)] border border-[var(--st-danger)]/40 hover:bg-[var(--st-danger-soft)] transition-colors">
                <ShieldOff className="size-3.5" /> Suspend
              </button>
            )}
            <button onClick={() => setSelected(new Set())} className="h-8 px-3 rounded-lg text-xs text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors">Clear</button>
          </div>
        </div>
      )}

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(c) => c.id}
        onRowClick={(c) => nav(`/admin/users/coaches/${c.id}`)}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        initialSort={{ key: "earned", dir: "desc" }}
        empty={<EmptyState icon={UserSearch} title="No coaches match this view" hint="Try a different filter or clear the search." />}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AD·12 - Coach Detail
// ════════════════════════════════════════════════════════════════════════════
export function CoachDetail() {
  const { id } = useParams();
  const c = findCoach(id!);
  if (!c) return <NotFound persona="coach" label="coach" backTo="/admin/users/coaches" backLabel="Back to Coaches" />;

  const coachBookings = bookings.filter((b) => b.coaches.includes(c.name));
  const upcoming = coachBookings.filter((b) => b.status === "Upcoming");
  const past = coachBookings.filter((b) => b.status !== "Upcoming");
  const pendingPayouts = payouts.filter((p) => p.payee === c.name && p.state === "Awaiting release");
  const pendingTotal = pendingPayouts.reduce((s, p) => s + netPayout(p.gross), 0);
  const suspended = c.status === "Suspended";

  return (
    <div>
      <PageHeader
        title={c.name}
        back={{ to: "/admin/users/coaches", label: "Back to Coaches" }}
        crumbs={[{ label: "Users", to: "/admin/users/coaches" }, { label: "Coaches", to: "/admin/users/coaches" }, { label: c.name }]}
        actions={<div className="flex items-center gap-2"><PersonaTag persona="coach" /><StatusPill status={c.status} /></div>}
      />


      <DetailLayout
        left={
          <>
            <SectionCard title="Profile & status">
              <div className="flex items-start gap-4">
                <Avatar name={c.name} persona="coach" size={56} />
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 flex-1">
                  <Field label="Location">{c.location}</Field>
                  <Field label="Tier"><TierBadge tier={c.tier} persona="coach" /></Field>
                  <Field label="Status">
                    <div className="flex items-center gap-2">
                      <StatusPill status={c.status} />
                      <span className="text-xs text-[var(--adm-text-3)]">· change in Admin actions</span>
                    </div>
                  </Field>
                  <Field label="Experience">{c.experience} years</Field>
                  <Field label="Languages">{c.languages.join(", ")}</Field>
                  <Field label="Session types">{c.sessionTypes.join(" · ")}</Field>
                  <Field label="Hybrid / expert">
                    {c.hybridEnabled
                      ? <span className="text-[var(--adm-neon)]">Enabled</span>
                      : <span className="text-[var(--adm-text-3)]">Off</span>}
                  </Field>
                  <Field label="Specialties" className="col-span-2 sm:col-span-2">{c.specialties.join(", ")}</Field>
                  <Field label="Email" className="col-span-2 sm:col-span-3">{c.email}</Field>
                  <Field label="Bio" className="col-span-2 sm:col-span-3">
                    <span className="text-[var(--adm-text-2)] leading-relaxed">{c.bio}</span>
                  </Field>
                </dl>
              </div>
            </SectionCard>

            <SectionCard title="Credentials" subtitle="Verification carried over from onboarding" bodyClassName="p-0">
              <ul>
                {c.credentials.map((cr, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--adm-line)] last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="size-4 text-[var(--adm-text-3)] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-[var(--adm-text)] truncate">{cr.title}</p>
                        <p className="text-xs text-[var(--adm-text-3)] truncate">{cr.institution} · {cr.year}</p>
                      </div>
                    </div>
                    <StatusPill status={cr.verified ? "Verified" : "Pending"} />
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Activity" subtitle="Delivery record & recent sessions">
              <StatGrid>
                <Stat label="Sessions delivered" value={num(c.sessionsDelivered)} />
                <Stat label="Average rating" value={c.rating > 0 ? `${c.rating.toFixed(1).replace(".", ",")} ★` : "-"} tone={c.rating >= 4.7 ? "var(--st-success)" : undefined} />
                <Stat label="Response time" value="< 4h" />
              </StatGrid>
              {coachBookings.length > 0 ? (
                <div className="mt-5 -mx-5 -mb-5 border-t border-[var(--adm-line)]">
                  <p className="px-5 pt-4 pb-2 text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">
                    {upcoming.length > 0 ? "Upcoming & recent" : "Recent sessions"}
                  </p>
                  <ul>
                    {[...upcoming, ...past].slice(0, 5).map((b) => (
                      <ActivityRow key={b.id} b={b} who={b.buyer} />
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--adm-text-3)]">No sessions delivered yet.</p>
              )}
            </SectionCard>

            <SectionCard title="Money" subtitle="Earnings net of the 20% platform fee">
              <StatGrid>
                <Stat label="Lifetime earned · net" value={<Money amount={netPayout(c.totalEarned)} />} tone="var(--adm-neon)" />
                <Stat label="Pending payouts" value={<Money amount={pendingTotal} />} tone={pendingTotal > 0 ? "var(--st-warning)" : undefined} />
                <Stat label="Gross transacted" value={<Money amount={c.totalEarned} />} />
              </StatGrid>
              <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card-2)] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Wallet className="size-4 text-[var(--adm-text-3)]" />
                  <span className="text-sm text-[var(--adm-text-2)]">Payout account</span>
                </div>
                <span className="adm-num text-sm text-[var(--adm-text)]">{maskAccount(c.payoutAccount)}</span>
              </div>
              {pendingPayouts.length > 0 && (
                <p className="mt-3 text-xs text-[var(--adm-text-3)]">
                  {pendingPayouts.length} payout{pendingPayouts.length > 1 ? "s" : ""} awaiting release ·{" "}
                  <Link to="/admin/finance/payouts" className="text-[var(--adm-neon)] hover:underline">open Payouts queue</Link>
                </p>
              )}
            </SectionCard>
          </>
        }
        right={
          <ActionPanel title="Admin actions" subtitle="Reason is logged to the Audit Log">
            {suspended ? (
              <GhostBtn icon={ShieldCheck} tone="success">Reactivate (reason)</GhostBtn>
            ) : (
              <GhostBtn icon={ShieldOff} tone="danger">Suspend (reason)</GhostBtn>
            )}
            <GhostBtn icon={TrendingUp} to={tierUpgradeHref(c.id)}>Change tier</GhostBtn>
            <GhostBtn icon={LifeBuoy} to="/admin/support">Open ticket on their behalf</GhostBtn>
            <p className="text-[11px] text-[var(--adm-text-3)] leading-relaxed pt-1">
              Suspension takes effect immediately - listings are pulled and new bookings blocked. In-flight sessions and pending payouts follow policy.
            </p>
          </ActionPanel>
        }
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AD·13 - Players Directory
// ════════════════════════════════════════════════════════════════════════════
type PlayerFilter = "all" | "pendingVideo" | "verified";

export function PlayersDirectory() {
  const nav = useNavigate();
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<PlayerFilter>("all");

  const pendingVideo = (p: Player) => p.videoStatus === "Pending" || p.videoStatus === "Re-submission requested";
  const counts = React.useMemo(
    () => ({
      pendingVideo: players.filter(pendingVideo).length,
      verified: players.filter((p) => p.videoStatus === "Verified").length,
    }),
    []
  );

  const rows = players
    .filter((p) =>
      filter === "pendingVideo" ? pendingVideo(p)
      : filter === "verified" ? p.videoStatus === "Verified"
      : true
    )
    .filter((p) => {
      const t = q.toLowerCase();
      return p.name.toLowerCase().includes(t) || p.email.toLowerCase().includes(t);
    });

  const cols: Column<Player>[] = [
    {
      key: "player", header: "Player", sortable: true, accessor: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={p.name} persona="player" size={34} />
          <div className="min-w-0">
            <p className="text-[var(--adm-text)] font-medium truncate">
              {p.name}
              {p.minor && <span className="ml-2 text-[10px] uppercase tracking-wide text-[var(--st-warning)]">Minor</span>}
            </p>
            <p className="text-xs text-[var(--adm-text-3)] truncate">{p.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "tier", header: "Tier", sortable: true, accessor: (p) => TIERS.player.indexOf(p.tier as never),
      render: (p) => <TierBadge tier={p.tier} persona="player" />,
    },
    { key: "variant", header: "Variant", render: (p) => <span className="text-xs text-[var(--adm-text-2)]">{p.variant}</span> },
    { key: "position", header: "Position", render: (p) => <span className="text-[var(--adm-text-2)]">{p.position}</span> },
    {
      key: "sessions", header: "Sessions", align: "right", sortable: true, accessor: (p) => p.sessionsBooked,
      render: (p) => <span className="adm-num text-[var(--adm-text-2)]">{num(p.sessionsBooked)}</span>,
    },
    {
      key: "spend", header: "Lifetime spend", align: "right", sortable: true, accessor: (p) => p.lifetimeSpend,
      render: (p) => <Money amount={p.lifetimeSpend} />,
    },
    { key: "video", header: "Video verification", render: (p) => <StatusPill status={p.videoStatus} /> },
    {
      key: "joined", header: "Joined", align: "right", sortable: true, accessor: (p) => p.joined,
      render: (p) => <span className="adm-num text-[var(--adm-text-3)] text-xs">{date(p.joined)}</span>,
    },
    {
      key: "actions", header: "", align: "right",
      render: (p) =>
        pendingVideo(p)
          ? <RowActionButton icon={ArrowRight} tone="primary" to={`/admin/approvals/video/${p.id}`}>Verify</RowActionButton>
          : <span className="text-[var(--adm-text-3)]">-</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Players"
        crumbs={[{ label: "Users" }, { label: "Players" }]}
        description="Players self-serve and book without an approval gate - this directory is for support lookup and account action, not onboarding review."
        actions={<ExportCsvButton />}
      />

      <Toolbar
        className="mb-4"
        left={
          <>
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All <span className="adm-num opacity-70">{players.length}</span></FilterChip>
            <FilterChip active={filter === "pendingVideo"} onClick={() => setFilter("pendingVideo")} count={counts.pendingVideo}>Pending video verification</FilterChip>
            <FilterChip active={filter === "verified"} onClick={() => setFilter("verified")} count={counts.verified}>Verified</FilterChip>
          </>
        }
        right={<SearchInput value={q} onChange={setQ} placeholder="Search name or email…" className="w-72" />}
      />

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(p) => p.id}
        onRowClick={(p) => nav(`/admin/users/players/${p.id}`)}
        initialSort={{ key: "spend", dir: "desc" }}
        empty={<EmptyState icon={UserSearch} title="No players match this view" hint="Try a different filter or clear the search." />}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AD·14 - Player Detail
// ════════════════════════════════════════════════════════════════════════════
export function PlayerDetail() {
  const { id } = useParams();
  const p = findPlayer(id!);
  if (!p) return <NotFound persona="player" label="player" backTo="/admin/users/players" backLabel="Back to Players" />;

  const playerBookings = bookings.filter((b) => b.buyer === p.name);
  const upcoming = playerBookings.filter((b) => b.status === "Upcoming");
  const past = playerBookings.filter((b) => b.status !== "Upcoming");
  const paid = playerBookings
    .filter((b) => b.status === "Completed" || b.status === "Upcoming")
    .reduce((s, b) => s + b.amount, 0);
  const playerDisputes = disputes.filter((d) => d.raisedBy.startsWith(p.name));
  const pendingVideo = p.videoStatus === "Pending" || p.videoStatus === "Re-submission requested";

  return (
    <div>
      <PageHeader
        title={p.name}
        back={{ to: "/admin/users/players", label: "Back to Players" }}
        crumbs={[{ label: "Users", to: "/admin/users/players" }, { label: "Players", to: "/admin/users/players" }, { label: p.name }]}
        actions={<PersonaTag persona="player" />}
      />


      <DetailLayout
        left={
          <>
            <SectionCard title="Profile">
              <div className="flex items-start gap-4">
                <Avatar name={p.name} persona="player" size={56} />
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 flex-1">
                  <Field label="Position">{p.position}</Field>
                  <Field label="Tier"><TierBadge tier={p.tier} persona="player" /></Field>
                  <Field label="Variant">{p.variant}</Field>
                  <Field label="Club">{p.club ?? <span className="text-[var(--adm-text-3)]">Independent</span>}</Field>
                  <Field label="Joined">{date(p.joined)}</Field>
                  <Field label="Email" className="col-span-2 sm:col-span-1">{p.email}</Field>
                </dl>
              </div>
              {p.minor && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[var(--st-warning)]/30 bg-[var(--st-warning-soft)] px-3.5 py-2.5">
                  <Lock className="size-3.5 mt-0.5 shrink-0 text-[var(--st-warning)]" />
                  <p className="text-xs text-[var(--adm-text-2)] leading-relaxed">
                    <span className="font-semibold text-[var(--st-warning)]">Minor.</span> Date of birth is role-gated and hidden by default; revealing it is logged. Guardian consent governs communications.
                  </p>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Video verification" subtitle="Non-blocking - players book with or without it">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center size-10 rounded-lg bg-[var(--persona-player-soft)]" style={{ boxShadow: "inset 0 0 0 1px var(--persona-player-line)" }}>
                    <PlayCircle className="size-5 text-[var(--persona-player)]" />
                  </span>
                  <div>
                    <StatusPill status={p.videoStatus} />
                    <p className="text-xs text-[var(--adm-text-3)] mt-1">Reviewed by Valur + the player's coaches only.</p>
                  </div>
                </div>
                <Link
                  to={`/admin/approvals/video/${p.id}`}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium border border-[var(--persona-player-line)] text-[var(--persona-player)] hover:bg-[var(--persona-player-soft)] transition-colors"
                >
                  <BadgeCheck className="size-4" /> {pendingVideo ? "Review video" : "Open verification"}
                </Link>
              </div>
            </SectionCard>

            <SectionCard title="Activity & money" subtitle="Bookings, payments and any disputes for this player">
              <StatGrid>
                <Stat label="Sessions booked" value={num(p.sessionsBooked)} />
                <Stat label="Payments made" value={<Money amount={paid} />} tone="var(--adm-neon)" />
                <Stat label="Open disputes" value={num(playerDisputes.filter((d) => d.status !== "Resolved").length)} tone={playerDisputes.some((d) => d.status !== "Resolved") ? "var(--st-danger)" : undefined} />
              </StatGrid>

              {playerBookings.length > 0 ? (
                <div className="mt-5 -mx-5 border-t border-[var(--adm-line)]">
                  <p className="px-5 pt-4 pb-2 text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">
                    {upcoming.length > 0 ? "Upcoming & past sessions" : "Past sessions"}
                  </p>
                  <ul>
                    {[...upcoming, ...past].slice(0, 5).map((b) => (
                      <ActivityRow key={b.id} b={b} who={b.coaches.join(" + ")} />
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--adm-text-3)]">No bookings on record.</p>
              )}

              {playerDisputes.length > 0 && (
                <div className="mt-5 -mx-5 -mb-5 border-t border-[var(--adm-line)] px-5 py-4">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2">Refunds & disputes</p>
                  <ul className="space-y-2">
                    {playerDisputes.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 text-sm">
                        <AlertTriangle className="size-4 text-[var(--st-danger)] shrink-0" />
                        <span className="text-[var(--adm-text-2)] flex-1 min-w-0 truncate">{d.id} · {d.reason}</span>
                        <Money amount={d.amount} className="text-xs" />
                        <StatusPill status={d.status} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </SectionCard>
          </>
        }
        right={
          <ActionPanel title="Admin actions" subtitle="Reason is logged to the Audit Log">
            <GhostBtn icon={ShieldOff} tone="danger">Suspend (reason)</GhostBtn>
            <GhostBtn icon={SlidersHorizontal}>Adjust tier directly</GhostBtn>
            <GhostBtn icon={LifeBuoy} to="/admin/support">Open ticket on their behalf</GhostBtn>
            <p className="text-[11px] text-[var(--adm-text-3)] leading-relaxed pt-1">
              Players self-serve - there is no onboarding gate. Tier can be adjusted directly here without an L2 review.
            </p>
          </ActionPanel>
        }
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AD·15 - Clubs Directory
// ════════════════════════════════════════════════════════════════════════════
type ClubFilter = "all" | "pending" | "academy" | "suspended";

export function ClubsDirectory() {
  const nav = useNavigate();
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState<ClubFilter>("all");

  const counts = React.useMemo(
    () => ({
      pending: clubs.filter((c) => c.status === "Pending").length,
      academy: clubs.filter((c) => c.tier === "Academy").length,
      suspended: clubs.filter((c) => c.status === "Suspended").length,
    }),
    []
  );

  const rows = clubs
    .filter((c) =>
      filter === "pending" ? c.status === "Pending"
      : filter === "academy" ? c.tier === "Academy"
      : filter === "suspended" ? c.status === "Suspended"
      : true
    )
    .filter((c) => {
      const t = q.toLowerCase();
      return c.name.toLowerCase().includes(t) || c.region.toLowerCase().includes(t) || c.vskNumber.toLowerCase().includes(t);
    });

  const cols: Column<Club>[] = [
    {
      key: "club", header: "Club", sortable: true, accessor: (c) => c.name,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.name} persona="club" size={34} />
          <div className="min-w-0">
            <p className="text-[var(--adm-text)] font-medium truncate">{c.name}</p>
            <p className="text-xs text-[var(--adm-text-3)] truncate">{c.region}</p>
          </div>
        </div>
      ),
    },
    {
      key: "tier", header: "Tier", sortable: true, accessor: (c) => TIERS.club.indexOf(c.tier as never),
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <TierBadge tier={c.tier} persona="club" />
          {c.tier === "Academy" && (
            <span
              className="inline-flex items-center rounded px-1 py-0.5 text-[10px] font-bold tracking-wide text-[var(--persona-club)]"
              style={{ background: "var(--persona-club-soft)" }}
              title="Dedicated account manager"
            >
              AM
            </span>
          )}
        </div>
      ),
    },
    {
      key: "squads", header: "Squads", align: "right", sortable: true, accessor: (c) => c.squads,
      render: (c) => <span className="adm-num text-[var(--adm-text-2)]">{c.squads}</span>,
    },
    {
      key: "active", header: "Active bookings", align: "right", sortable: true, accessor: (c) => c.activeBookings,
      render: (c) => <span className="adm-num text-[var(--adm-text-2)]">{c.activeBookings}</span>,
    },
    {
      key: "monthly", header: "Monthly spend", align: "right", sortable: true, accessor: (c) => c.monthlySpend,
      render: (c) => <Money amount={c.monthlySpend} />,
    },
    {
      key: "lifetime", header: "Lifetime spend", align: "right", sortable: true, accessor: (c) => c.lifetimeSpend,
      render: (c) => <Money amount={c.lifetimeSpend} />,
    },
    { key: "status", header: "Status", render: (c) => <StatusPill status={c.status} /> },
    {
      key: "joined", header: "Joined", align: "right", sortable: true, accessor: (c) => c.joined,
      render: (c) => <span className="adm-num text-[var(--adm-text-3)] text-xs">{date(c.joined)}</span>,
    },
    {
      key: "actions", header: "", align: "right",
      render: (c) =>
        c.status === "Pending"
          ? <RowActionButton icon={ArrowRight} tone="primary" to={`/admin/approvals/club/${c.id}`}>Review</RowActionButton>
          : <span className="text-[var(--adm-text-3)]">-</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clubs"
        crumbs={[{ label: "Users" }, { label: "Clubs" }]}
        description="Institutional buyers - gated like coaches before any squad booking. Academy clubs carry a dedicated account manager (AM)."
        actions={<ExportCsvButton />}
      />

      <Toolbar
        className="mb-4"
        left={
          <>
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All <span className="adm-num opacity-70">{clubs.length}</span></FilterChip>
            <FilterChip active={filter === "pending"} onClick={() => setFilter("pending")} count={counts.pending}>Pending approval</FilterChip>
            <FilterChip active={filter === "academy"} onClick={() => setFilter("academy")} count={counts.academy}>Academy</FilterChip>
            <FilterChip active={filter === "suspended"} onClick={() => setFilter("suspended")} count={counts.suspended}>Suspended</FilterChip>
          </>
        }
        right={<SearchInput value={q} onChange={setQ} placeholder="Search name, region or VSK…" className="w-72" />}
      />

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(c) => c.id}
        onRowClick={(c) => nav(`/admin/users/clubs/${c.id}`)}
        initialSort={{ key: "lifetime", dir: "desc" }}
        empty={<EmptyState icon={Building2} title="No clubs match this view" hint="Try a different filter or clear the search." />}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AD·16 - Club Detail
// ════════════════════════════════════════════════════════════════════════════
export function ClubDetail() {
  const { id } = useParams();
  const c = findClub(id!);
  if (!c) return <NotFound persona="club" label="club" backTo="/admin/users/clubs" backLabel="Back to Clubs" />;

  const clubBookings = bookings.filter((b) => b.buyer === c.name);
  const clubDisputes = disputes.filter((d) => clubBookings.some((b) => b.id === d.bookingId));
  const openDisputes = clubDisputes.filter((d) => d.status !== "Resolved");
  const suspended = c.status === "Suspended";

  return (
    <div>
      <PageHeader
        title={c.name}
        back={{ to: "/admin/users/clubs", label: "Back to Clubs" }}
        crumbs={[{ label: "Users", to: "/admin/users/clubs" }, { label: "Clubs", to: "/admin/users/clubs" }, { label: c.name }]}
        actions={<div className="flex items-center gap-2"><PersonaTag persona="club" /><StatusPill status={c.status} /></div>}
      />

      <DetailLayout
        left={
          <>
            <SectionCard title="Profile & squads">
              <div className="flex items-start gap-4">
                <Avatar name={c.name} persona="club" size={56} />
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4 flex-1">
                  <Field label="Tier">
                    <div className="flex items-center gap-1.5">
                      <TierBadge tier={c.tier} persona="club" />
                      {c.tier === "Academy" && <span className="text-[10px] font-bold text-[var(--persona-club)]">· AM assigned</span>}
                    </div>
                  </Field>
                  <Field label="Region">{c.region}</Field>
                  <Field label="Established">{c.established}</Field>
                  <Field label="Squads (read-only)">{c.squads}</Field>
                  <Field label="Active bookings">{c.activeBookings}</Field>
                  <Field label="Status"><StatusPill status={c.status} /></Field>
                </dl>
              </div>
              <p className="mt-4 text-xs text-[var(--adm-text-3)] leading-relaxed">
                Tier history: any change runs through an L2 review and is reason-stamped in the Decision &amp; Audit logs. Squad count is managed by the club and read-only here.
              </p>
            </SectionCard>

            <SectionCard title="Billing identity" subtitle="VAT (VSK) registration & admin accounts">
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-4">
                <Field label="Legal name" className="col-span-2 sm:col-span-2">{c.name}</Field>
                <Field label="VAT (VSK) number"><span className="adm-num">{c.vskNumber}</span></Field>
                <Field label="Admin / billing account" className="col-span-2 sm:col-span-2">{c.billingEmail}</Field>
                <Field label="Payment method">
                  <span className="inline-flex items-center gap-1.5">
                    <CreditCard className="size-3.5 text-[var(--adm-text-3)]" />
                    <span className="adm-num">Bank •••• 4182</span>
                  </span>
                </Field>
              </dl>
            </SectionCard>

            <SectionCard title="Activity & money" subtitle="Spend, package & coach bookings, invoices and disputes">
              <StatGrid>
                <Stat label="Monthly spend" value={<Money amount={c.monthlySpend} />} />
                <Stat label="Lifetime spend" value={<Money amount={c.lifetimeSpend} />} tone="var(--adm-neon)" />
                <Stat label="Open disputes" value={num(openDisputes.length)} tone={openDisputes.length > 0 ? "var(--st-danger)" : undefined} />
              </StatGrid>

              {clubBookings.length > 0 ? (
                <div className="mt-5 -mx-5 border-t border-[var(--adm-line)]">
                  <p className="px-5 pt-4 pb-2 text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">Package purchases & coach bookings</p>
                  <ul>
                    {clubBookings.slice(0, 5).map((b) => (
                      <ActivityRow key={b.id} b={b} who={b.coaches.join(" + ")} />
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--adm-text-3)]">No bookings on record yet.</p>
              )}

              <div className="mt-5 -mx-5 -mb-5 border-t border-[var(--adm-line)] px-5 py-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-[var(--adm-text-2)]">
                  <FileText className="size-4 text-[var(--adm-text-3)]" /> Invoices issued
                </span>
                <Link to="/admin/finance/invoicing" className="text-xs font-medium text-[var(--adm-neon)] hover:underline inline-flex items-center gap-1">
                  View invoicing <ChevronRight className="size-3" />
                </Link>
              </div>
            </SectionCard>
          </>
        }
        right={
          <ActionPanel title="Admin actions" subtitle="Reason is logged to the Audit Log">
            {suspended ? (
              <GhostBtn icon={ShieldCheck} tone="success">Reactivate (reason)</GhostBtn>
            ) : (
              <GhostBtn icon={ShieldOff} tone="danger">Suspend (reason)</GhostBtn>
            )}
            <GhostBtn icon={TrendingUp} to={tierUpgradeHref(c.id)}>Change tier</GhostBtn>
            <GhostBtn icon={FileText}>Reissue invoice</GhostBtn>
            <GhostBtn icon={LifeBuoy} to="/admin/support">Open ticket on their behalf</GhostBtn>
            <p className="text-[11px] text-[var(--adm-text-3)] leading-relaxed pt-1">
              Suspending a club blocks new squad bookings immediately. Reissuing an invoice supersedes the original - both versions stay on the ledger.
            </p>
          </ActionPanel>
        }
      />
    </div>
  );
}

// ── shared detail scaffold + not-found ─────────────────────────────────────────
function DetailLayout({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
      <div className="space-y-5">{left}</div>
      <div className="lg:sticky lg:top-4 space-y-4">{right}</div>
    </div>
  );
}

function NotFound({
  persona,
  label,
  backTo,
  backLabel,
}: {
  persona: Persona;
  label: string;
  backTo: string;
  backLabel: string;
}) {
  return (
    <div>
      <PageHeader
        title="Not found"
        back={{ to: backTo, label: backLabel }}
        actions={<PersonaTag persona={persona} />}
      />
      <EmptyState icon={UsersIcon} title={`This ${label} could not be found`} hint="The record may have been removed, or the link is out of date." />
    </div>
  );
}
