import * as React from "react";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";
import {
  CalendarRange, Search as SearchIcon, Users, ArrowUpRight, Wallet,
  AlertTriangle, LifeBuoy, Ban, Video, MapPin, Check, CircleDot,
  Plane, Home, Receipt, ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { DataTable, type Column } from "../components/DataTable";
import {
  SectionCard, Card, StatusPill, PersonaTag, Money, Avatar,
  EmptyState, Field, Pill, RowActionButton,
} from "../components/primitives";
import { Toolbar, SearchInput, Segmented, FilterChip, MiniSelect } from "../components/controls";
import { bookings, findBooking, disputes, payouts, type Booking } from "../data/mock";
import { dateTime, date, isk, platformFee, netPayout } from "../lib/format";

const disputeFor = (bookingId: string) => disputes.find((d) => d.bookingId === bookingId);
const payoutsFor = (bookingId: string) => payouts.filter((p) => p.bookingId === bookingId);

// Money tone for booking type pills
const TYPE_TONE: Record<Booking["type"], "info" | "neutral" | "success"> = {
  F2F: "info",
  Online: "neutral",
  Hybrid: "success",
};

// ── AD·17 Sessions Monitor - /admin/bookings ─────────────────────────────────
export function SessionsMonitor() {
  const nav = useNavigate();
  const [view, setView] = React.useState<"list" | "calendar">("list");
  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [quick, setQuick] = React.useState<"all" | "disputed" | "hybrid" | "awaiting">("all");

  const filtered = React.useMemo(() => {
    return bookings
      .filter((b) =>
        quick === "disputed" ? b.status === "Disputed"
          : quick === "hybrid" ? b.type === "Hybrid"
          : quick === "awaiting" ? b.payoutState === "Awaiting release"
          : true
      )
      .filter((b) => statusFilter === "all" || b.status === statusFilter)
      .filter((b) =>
        q.trim() === "" ||
        b.id.toLowerCase().includes(q.toLowerCase()) ||
        b.buyer.toLowerCase().includes(q.toLowerCase()) ||
        b.coaches.some((c) => c.toLowerCase().includes(q.toLowerCase()))
      );
  }, [q, statusFilter, quick]);

  const cols: Column<Booking>[] = [
    {
      key: "id", header: "Booking", sortable: true, accessor: (b) => b.id,
      render: (b) => <span className="text-[var(--adm-neon)] adm-num text-sm font-medium">{b.id}</span>,
    },
    {
      key: "when", header: "When", sortable: true, accessor: (b) => b.when,
      render: (b) => <span className="text-[var(--adm-text-2)] adm-num whitespace-nowrap">{dateTime(b.when)}</span>,
    },
    {
      key: "coaches", header: "Coach(es)",
      render: (b) => (
        <div className="flex items-center gap-2.5">
          <div className="flex -space-x-2">
            {b.coaches.slice(0, 2).map((c) => (
              <Avatar key={c} name={c} persona="coach" size={26} className="ring-1 ring-[var(--adm-card)]" />
            ))}
          </div>
          <div className="min-w-0">
            <p className="text-[var(--adm-text)] truncate">{b.coaches.join(" · ")}</p>
            {b.type === "Hybrid" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--persona-coach)]">
                <Users className="size-3" /> Hybrid · 2 coaches
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "buyer", header: "Buyer",
      render: (b) => (
        <div className="flex items-center gap-2">
          <PersonaTag persona={b.buyerType} />
        </div>
      ),
    },
    { key: "type", header: "Type", render: (b) => <Pill tone={TYPE_TONE[b.type]}>{b.type}</Pill> },
    { key: "status", header: "Status", render: (b) => <StatusPill status={b.status} /> },
    { key: "amount", header: "Amount", align: "right", sortable: true, accessor: (b) => b.amount, render: (b) => <Money amount={b.amount} /> },
    {
      key: "payout", header: "Payout state", align: "right",
      render: (b) => b.payoutState === "-"
        ? <span className="text-[var(--adm-text-3)]">-</span>
        : <StatusPill status={b.payoutState} />,
    },
    {
      key: "actions", header: "", align: "right",
      render: (b) => {
        const d = b.status === "Disputed" ? disputeFor(b.id) : undefined;
        const linkedPayouts = payoutsFor(b.id);
        if (!d && linkedPayouts.length === 0) {
          return <span className="text-[var(--adm-text-3)]">-</span>;
        }
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {d && (
              <RowActionButton icon={AlertTriangle} tone="alert" to="/admin/finance/disputes" title={`Open dispute ${d.id}`}>
                Dispute
              </RowActionButton>
            )}
            {linkedPayouts.length === 1 && (
              <RowActionButton icon={Wallet} to={`/admin/finance/payouts/${linkedPayouts[0].id}`} title={`Open payout ${linkedPayouts[0].id}`}>
                Payout
              </RowActionButton>
            )}
            {linkedPayouts.length > 1 && (
              <RowActionButton icon={Wallet} to="/admin/finance/payouts" title={`${linkedPayouts.length} linked payouts`}>
                Payouts · {linkedPayouts.length}
              </RowActionButton>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sessions Monitor"
        description="Every booking across every persona, in one place - list it flat or lay it out by day."
        actions={
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { value: "list", label: "List" },
              { value: "calendar", label: "Calendar" },
            ]}
          />
        }
      />

      <Toolbar
        className="mb-4"
        left={
          <>
            <FilterChip active={quick === "all"} onClick={() => setQuick("all")}>All</FilterChip>
            <FilterChip active={quick === "disputed"} onClick={() => setQuick("disputed")} count={bookings.filter((b) => b.status === "Disputed").length}>Disputed</FilterChip>
            <FilterChip active={quick === "hybrid"} onClick={() => setQuick("hybrid")} count={bookings.filter((b) => b.type === "Hybrid").length}>Hybrid</FilterChip>
            <FilterChip active={quick === "awaiting"} onClick={() => setQuick("awaiting")} count={bookings.filter((b) => b.payoutState === "Awaiting release").length}>Awaiting payout release</FilterChip>
          </>
        }
        right={
          <>
            <MiniSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All statuses" },
                { value: "Upcoming", label: "Upcoming" },
                { value: "Completed", label: "Completed" },
                { value: "Cancelled", label: "Cancelled" },
                { value: "Disputed", label: "Disputed" },
              ]}
            />
            <SearchInput value={q} onChange={setQ} placeholder="Search booking ID…" className="w-60" />
          </>
        }
      />

      {view === "list" ? (
        <DataTable
          columns={cols}
          rows={filtered}
          rowKey={(b) => b.id}
          onRowClick={(b) => nav(`/admin/bookings/${b.id}`)}
          initialSort={{ key: "when", dir: "desc" }}
          empty={<div className="py-6"><EmptyState icon={CalendarRange} title="No sessions match these filters" hint="Clear a filter or widen your search." /></div>}
        />
      ) : (
        <CalendarView rows={filtered} onOpen={(id) => nav(`/admin/bookings/${id}`)} />
      )}
    </div>
  );
}

// Grouped-by-day calendar list, neon accent on today.
function CalendarView({ rows, onOpen }: { rows: Booking[]; onOpen: (id: string) => void }) {
  const TODAY = "2026-06-29";

  const groups = React.useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of rows) {
      const day = b.when.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(b);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([day, list]) => ({
        day,
        list: [...list].sort((x, y) => (x.when < y.when ? -1 : 1)),
      }));
  }, [rows]);

  if (groups.length === 0) {
    return <EmptyState icon={CalendarRange} title="No sessions match these filters" hint="Clear a filter or widen your search." />;
  }

  return (
    <div className="space-y-4">
      {groups.map(({ day, list }) => {
        const isToday = day === TODAY;
        return (
          <div key={day} className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-3">
            <div className="lg:sticky lg:top-4 self-start">
              <div className={`flex items-center gap-2 ${isToday ? "text-[var(--adm-neon)]" : "text-[var(--adm-text-2)]"}`}>
                {isToday && <CircleDot className="size-3.5 adm-live-dot" />}
                <span className="text-sm font-semibold">{date(day)}</span>
              </div>
              <p className="text-[11px] text-[var(--adm-text-3)] mt-0.5 adm-num">
                {list.length} session{list.length === 1 ? "" : "s"}{isToday && " · today"}
              </p>
            </div>
            <div
              className="rounded-xl border bg-[var(--adm-card)] overflow-hidden"
              style={{ borderColor: isToday ? "var(--adm-neon-line)" : "var(--adm-line)" }}
            >
              {list.map((b) => {
                const isDisputed = b.status === "Disputed";
                return (
                  <button
                    key={b.id}
                    onClick={() => onOpen(b.id)}
                    className="group w-full text-left flex items-center gap-3 px-4 py-3 border-b border-[var(--adm-line)] last:border-0 adm-table-row"
                    style={isDisputed ? { background: "var(--st-danger-soft)" } : undefined}
                  >
                    <span className="text-xs adm-num text-[var(--adm-text-3)] w-12 shrink-0">{dateTime(b.when).split("· ")[1]}</span>
                    <div className="flex -space-x-2 shrink-0">
                      {b.coaches.slice(0, 2).map((c) => (
                        <Avatar key={c} name={c} persona="coach" size={24} className="ring-1 ring-[var(--adm-card)]" />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--adm-text)] truncate">
                        {b.coaches.join(" · ")}
                        {b.type === "Hybrid" && <span className="text-[var(--persona-coach)]"> · Hybrid</span>}
                      </p>
                      <p className="text-xs text-[var(--adm-text-3)] truncate">{b.buyer}</p>
                    </div>
                    <Pill tone={TYPE_TONE[b.type]} className="shrink-0">{b.type}</Pill>
                    {isDisputed ? <StatusPill status="Disputed" className="shrink-0" /> : <StatusPill status={b.status} className="shrink-0" />}
                    <span className="adm-num text-sm shrink-0 w-24 text-right"><Money amount={b.amount} /></span>
                    <ChevronRight className="size-4 text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── AD·18 Booking Detail - /admin/bookings/:id ───────────────────────────────
export function BookingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const b = id ? findBooking(id) : undefined;

  if (!b) {
    return (
      <div>
        <PageHeader title="Booking not found" back={{ to: "/admin/bookings", label: "Back to Sessions Monitor" }} />
        <EmptyState icon={SearchIcon} title="This booking could not be found" hint="It may have been cancelled or the ID is incorrect." />
      </div>
    );
  }

  const isHybrid = b.type === "Hybrid";
  const dispute = b.status === "Disputed" ? disputeFor(b.id) : undefined;
  const linkedPayouts = payouts.filter((p) => p.bookingId === b.id);

  // VSK is included in the gross charge (Iceland-first, KAD-07): net of VSK = gross / 1.24
  const vskIncluded = Math.round(b.amount - b.amount / 1.24);
  const fee = platformFee(b.amount);

  // Hybrid split: larger leg to the remote/expert coach (~58% of net), local gets the rest.
  const totalNet = netPayout(b.amount);
  const remoteNet = Math.round(totalNet * 0.58);
  const localNet = totalNet - remoteNet;

  function action(label: string, to?: string) {
    if (to) { nav(to); return; }
    toast(label);
  }

  return (
    <div>
      <PageHeader
        title={b.id}
        back={{ to: "/admin/bookings", label: "Back to Sessions Monitor" }}
        crumbs={[{ label: "Bookings", to: "/admin/bookings" }, { label: b.id }]}
        actions={
          <div className="flex items-center gap-2">
            <Pill tone={TYPE_TONE[b.type]}>{b.type}</Pill>
            <StatusPill status={b.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        <div className="space-y-5">
          {/* Booking summary + status timeline */}
          <SectionCard title="Booking summary">
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <Field label="Booking ID"><span className="adm-num">{b.id}</span></Field>
              <Field label="Date & time"><span className="adm-num">{dateTime(b.when)}</span></Field>
              <Field label="Delivery type"><Pill tone={TYPE_TONE[b.type]}>{b.type}</Pill></Field>
              <Field label="Price paid"><Money amount={b.amount} /></Field>
              <Field label="Buyer">
                <span className="inline-flex items-center gap-2">
                  <PersonaTag persona={b.buyerType} /> {b.buyer}
                </span>
              </Field>
              <Field label="Payout state">
                {b.payoutState === "-" ? <span className="text-[var(--adm-text-3)]">Not yet due</span> : <StatusPill status={b.payoutState} />}
              </Field>
            </dl>
            <StatusTimeline status={b.status} type={b.type} />
          </SectionCard>

          {/* Coach(es) & delivery */}
          <SectionCard title="Coach(es) & delivery" subtitle={isHybrid ? "Two coaches, two delivery modes - one session" : "Single coach delivery"}>
            {isHybrid && b.hybrid ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CoachCard
                  name={b.hybrid.remote}
                  roleLabel="Remote / Expert"
                  roleSub="Joins in-app over video"
                  icon={Plane}
                  delivery="In-app join (VC)"
                />
                <CoachCard
                  name={b.hybrid.local}
                  roleLabel="Local / Domestic"
                  roleSub="On-site at the venue"
                  icon={Home}
                  delivery="Venue · in-person"
                />
              </div>
            ) : (
              <CoachCard
                name={b.coaches[0]}
                roleLabel="Lead coach"
                roleSub={b.type === "Online" ? "Delivered over video" : "Delivered in person"}
                icon={b.type === "Online" ? Video : MapPin}
                delivery={b.type === "Online" ? "In-app join (VC)" : "Venue · in-person"}
              />
            )}
          </SectionCard>

          {/* Payment & settlement */}
          <SectionCard title="Payment & settlement" subtitle="One charge to the buyer · 20% platform fee · VAT (VSK 24%)">
            <div className="rounded-lg border border-[var(--adm-line)] overflow-hidden mb-4">
              <SettleRow label="Amount paid by buyer" sub="Single charge · VSK-inclusive" value={<Money amount={b.amount} />} strong />
              <SettleRow label="Platform fee (20% take)" sub="Valur revenue" value={<span className="text-[var(--adm-text-2)] adm-num">− {isk(fee)}</span>} />
              <SettleRow label="VAT (VSK 24%) within charge" sub="Owed to Skatturinn · already inside the gross" value={<span className="text-[var(--adm-text-2)] adm-num">{isk(vskIncluded)}</span>} />
            </div>

            {isHybrid && b.hybrid ? (
              <>
                <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2">Two settlement legs</p>
                <div className="rounded-lg border border-[var(--adm-line)] overflow-hidden">
                  <SettleRow
                    label={`Remote payout · ${b.hybrid.remote}`}
                    sub="Expert leg · net of 20% fee"
                    value={<Money amount={remoteNet} className="text-[var(--st-success)]" sign />}
                  />
                  <SettleRow
                    label={`Local payout · ${b.hybrid.local}`}
                    sub="Domestic leg · net of 20% fee"
                    value={<Money amount={localNet} className="text-[var(--st-success)]" sign />}
                  />
                </div>
                <p className="text-[11px] text-[var(--adm-text-3)] mt-3 leading-relaxed">
                  One charge in, two payouts out - each leg settles net of the 20% platform fee. The remote/expert leg carries the larger share.
                </p>
              </>
            ) : (
              <div className="rounded-lg border border-[var(--adm-line)] overflow-hidden">
                <SettleRow
                  label={`Coach payout · ${b.coaches[0]}`}
                  sub="Net of 20% fee"
                  value={<Money amount={totalNet} className="text-[var(--st-success)]" sign />}
                />
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right sticky - operator actions */}
        <div className="lg:sticky lg:top-4 space-y-4">
          {dispute && (
            <Card className="p-4" style={{ borderColor: "var(--st-danger)" }}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="size-4 mt-0.5 shrink-0 text-[var(--st-danger)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--adm-text)]">Open dispute · {dispute.id}</p>
                  <p className="text-xs text-[var(--adm-text-3)] mt-0.5 leading-relaxed">{dispute.reason}</p>
                  <Link to="/admin/finance/disputes" className="inline-flex items-center gap-1 text-xs text-[var(--st-danger)] mt-2 hover:underline">
                    Review dispute <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </div>
            </Card>
          )}

          <SectionCard title="Operator actions" subtitle="Settlement controls start here">
            <div className="space-y-2">
              <ActionButton icon={Wallet} onClick={() => action("Open linked payout(s)", "/admin/finance/payouts")}>
                Open linked payout{linkedPayouts.length === 1 ? "" : "s"}
                {linkedPayouts.length > 0 && <span className="adm-num text-[var(--adm-text-3)]">· {linkedPayouts.length}</span>}
              </ActionButton>
              <ActionButton icon={Receipt} onClick={() => action("Raise dispute / refund", "/admin/finance/disputes")}>
                Raise dispute / refund
              </ActionButton>
              <ActionButton icon={LifeBuoy} onClick={() => action("Open ticket", "/admin/support")}>
                Open ticket
              </ActionButton>
              <button
                onClick={() => toast.error("Cancel per policy", { description: `${b.id} flagged for policy cancellation · written to the Audit Log.` })}
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg text-[var(--st-danger)] text-sm font-medium hover:bg-[var(--st-danger-soft)] transition-colors"
              >
                <Ban className="size-4" /> Cancel per policy
              </button>
            </div>
            <p className="text-[11px] text-[var(--adm-text-3)] mt-4 leading-relaxed">
              Blocking a payout here keeps funds from entering the release queue. Every action is reason-stamped to the Audit Log.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// Horizontal stepper: booked → joined → completed / cancelled
function StatusTimeline({ status, type }: { status: Booking["status"]; type: Booking["type"] }) {
  const cancelled = status === "Cancelled";
  const disputed = status === "Disputed";
  const completed = status === "Completed" || disputed;
  const upcoming = status === "Upcoming";

  const isHybrid = type === "Hybrid";
  const joinLabel = type === "F2F" ? "Checked in" : "Joined (VC)";
  const finalStep = cancelled
    ? { label: "Cancelled", done: true, danger: true }
    : { label: "Completed", done: completed, current: upcoming ? false : false };

  const steps = (
    isHybrid
      ? [
          { label: "Booked", done: true },
          { label: "Joined (VC)", done: completed || disputed, current: false },
          { label: "On-site check-in", done: completed || disputed, current: false },
          finalStep,
        ]
      : [
          { label: "Booked", done: true },
          { label: joinLabel, done: completed || disputed, current: false },
          finalStep,
        ]
  ) as { label: string; done: boolean; danger?: boolean }[];

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-3">Session lifecycle</p>
      <div className="flex items-center">
        {steps.map((s, i) => {
          const isLast = i === steps.length - 1;
          const color = s.danger
            ? "var(--st-danger)"
            : s.done
              ? "var(--adm-neon)"
              : "var(--adm-text-3)";
          const ringBg = s.danger
            ? "var(--st-danger-soft)"
            : s.done
              ? "var(--adm-neon-soft)"
              : "var(--adm-card-2)";
          return (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <span
                  className="grid place-items-center size-7 rounded-full border"
                  style={{ color, background: ringBg, borderColor: s.done ? color : "var(--adm-line)" }}
                >
                  {s.danger ? <Ban className="size-3.5" /> : s.done ? <Check className="size-3.5" /> : <CircleDot className="size-3" />}
                </span>
                <span className="text-[11px] whitespace-nowrap" style={{ color: s.done ? "var(--adm-text)" : "var(--adm-text-3)" }}>{s.label}</span>
              </div>
              {!isLast && (
                <span
                  className="h-px flex-1 mx-2 mb-5 rounded-full"
                  style={{ background: steps[i + 1].done && !steps[i + 1].danger ? "var(--adm-neon)" : "var(--adm-line)" }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function CoachCard({
  name, roleLabel, roleSub, icon: Icon, delivery,
}: {
  name: string;
  roleLabel: string;
  roleSub: string;
  icon: React.ComponentType<{ className?: string }>;
  delivery: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card-2)] p-4">
      <div className="flex items-center gap-3">
        <Avatar name={name} persona="coach" size={40} />
        <div className="min-w-0">
          <p className="text-sm text-[var(--adm-text)] font-medium truncate">{name}</p>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--persona-coach)] font-semibold uppercase tracking-wide">
            <Icon className="size-3" /> {roleLabel}
          </span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--adm-line)] flex items-center justify-between gap-2">
        <span className="text-xs text-[var(--adm-text-3)]">{roleSub}</span>
        <span className="text-xs text-[var(--adm-text-2)]">{delivery}</span>
      </div>
    </div>
  );
}

function SettleRow({ label, sub, value, strong }: { label: string; sub: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--adm-line)] last:border-0" style={strong ? { background: "var(--adm-card-2)" } : undefined}>
      <div className="min-w-0">
        <p className={`text-sm ${strong ? "text-[var(--adm-text)] font-medium" : "text-[var(--adm-text-2)]"} truncate`}>{label}</p>
        <p className="text-[11px] text-[var(--adm-text-3)]">{sub}</p>
      </div>
      <span className="text-sm shrink-0">{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, onClick, children }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-[var(--adm-line)] text-[var(--adm-text)] text-sm font-medium hover:bg-[var(--adm-hover)] hover:border-[var(--adm-line-strong)] transition-colors"
    >
      <Icon className="size-4 text-[var(--adm-text-3)]" />
      <span className="flex-1 text-left flex items-center gap-1.5">{children}</span>
    </button>
  );
}
