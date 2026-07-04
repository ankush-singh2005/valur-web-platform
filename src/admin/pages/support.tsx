import * as React from "react";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";
import {
  Inbox, Search as SearchIcon, Lock, ExternalLink, Link2, AlertTriangle,
  UserPlus, CheckCircle2, RotateCcw, CornerUpLeft, Send, ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { DataTable, type Column } from "../components/DataTable";
import {
  SectionCard, Card, StatusPill, PersonaTag, SlaPill, Avatar,
  EmptyState, Pill, Field,
} from "../components/primitives";
import { Toolbar, SearchInput, FilterChip, MiniSelect } from "../components/controls";
import { tickets, findTicket, type Ticket, type TicketMsg } from "../data/mock";
import { ago, dateTime } from "../lib/format";
import type { Persona } from "../lib/constants";

const STATUSES = ["New", "Open", "Waiting", "Resolved"] as const;
type TicketStatus = (typeof STATUSES)[number];

const PRIORITY_TONE: Record<Ticket["priority"], "danger" | "warning" | "neutral"> = {
  Urgent: "danger",
  High: "warning",
  Normal: "neutral",
  Low: "neutral",
};

const userRecordPath = (persona: Persona) =>
  persona === "coach" ? "/admin/users/coaches"
    : persona === "player" ? "/admin/users/players"
    : persona === "club" ? "/admin/users/clubs"
    : "/admin/users";

// ── AD·25 Tickets List - /admin/support ──────────────────────────────────────
export function TicketsList() {
  const nav = useNavigate();
  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | TicketStatus | "unassigned">("all");
  const [persona, setPersona] = React.useState("all");

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { New: 0, Open: 0, Waiting: 0, Resolved: 0 };
    tickets.forEach((t) => (c[t.status] = (c[t.status] ?? 0) + 1));
    return c;
  }, []);

  const rows = React.useMemo(() => {
    return tickets
      .filter((t) =>
        statusFilter === "all" ? true
          : statusFilter === "unassigned" ? !t.assignee
          : t.status === statusFilter
      )
      .filter((t) => persona === "all" || t.persona === persona)
      .filter((t) =>
        q.trim() === "" ||
        t.subject.toLowerCase().includes(q.toLowerCase()) ||
        t.requester.toLowerCase().includes(q.toLowerCase()) ||
        t.id.toLowerCase().includes(q.toLowerCase())
      );
  }, [q, statusFilter, persona]);

  const cols: Column<Ticket>[] = [
    {
      key: "requester", header: "Requester",
      render: (t) => (
        <div className="flex items-center gap-3">
          <Avatar name={t.requester} persona={t.persona} size={32} />
          <div className="min-w-0">
            <p className="text-[var(--adm-text)] font-medium truncate max-w-[160px]">{t.requester}</p>
            <p className="text-xs text-[var(--adm-text-3)] adm-num">{t.id}</p>
          </div>
        </div>
      ),
    },
    { key: "persona", header: "Type", render: (t) => <PersonaTag persona={t.persona} /> },
    {
      key: "subject", header: "Subject",
      render: (t) => <span className="text-[var(--adm-text)] truncate block max-w-[280px]">{t.subject}</span>,
    },
    { key: "opened", header: "Opened", sortable: true, accessor: (t) => t.openedAt, render: (t) => <span className="text-[var(--adm-text-2)]">{ago(t.openedAt)}</span> },
    {
      key: "assignee", header: "Assignee",
      render: (t) => t.assignee
        ? <span className="text-[var(--adm-text-2)]">{t.assignee}</span>
        : <span className="text-[var(--adm-text-3)] italic">Unassigned</span>,
    },
    { key: "priority", header: "Priority", render: (t) => <Pill tone={PRIORITY_TONE[t.priority]} dot={t.priority === "Urgent" || t.priority === "High"}>{t.priority}</Pill> },
    { key: "status", header: "Status", render: (t) => <StatusPill status={t.status} /> },
    { key: "sla", header: "SLA", align: "right", sortable: true, accessor: (t) => t.openedAt, render: (t) => <SlaPill since={t.openedAt} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Tickets"
        description="The native support queue - every customer message in one lightweight, triageable list."
        crumbs={[{ label: "Dashboard", to: "/admin" }, { label: "Tickets" }]}
      />


      <Toolbar
        className="mb-4"
        left={
          <>
            <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All</FilterChip>
            {STATUSES.map((s) => (
              <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} count={counts[s] ?? 0}>{s}</FilterChip>
            ))}
            <FilterChip active={statusFilter === "unassigned"} onClick={() => setStatusFilter("unassigned")} count={tickets.filter((t) => !t.assignee).length}>Unassigned</FilterChip>
          </>
        }
        right={
          <>
            <MiniSelect
              value={persona}
              onChange={setPersona}
              options={[
                { value: "all", label: "All personas" },
                { value: "coach", label: "Coaches" },
                { value: "player", label: "Players" },
                { value: "club", label: "Clubs" },
                { value: "system", label: "System" },
              ]}
            />
            <SearchInput value={q} onChange={setQ} placeholder="Search subject or requester…" className="w-64" />
          </>
        }
      />

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(t) => t.id}
        onRowClick={(t) => nav(`/admin/support/${t.id}`)}
        initialSort={{ key: "sla", dir: "desc" }}
        empty={<div className="py-6"><EmptyState icon={Inbox} title="No tickets match these filters" hint="The queue is clear for this view." /></div>}
      />
    </div>
  );
}

// ── AD·26 Ticket Detail - /admin/support/:id ─────────────────────────────────
export function TicketDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const t = id ? findTicket(id) : undefined;

  const [reply, setReply] = React.useState("");
  const [internalMode, setInternalMode] = React.useState(false);
  const [priority, setPriority] = React.useState(t?.priority ?? "Normal");
  const [status, setStatus] = React.useState<TicketStatus>((t?.status as TicketStatus) ?? "Open");

  if (!t) {
    return (
      <div>
        <PageHeader title="Ticket not found" back={{ to: "/admin/support", label: "Back to Tickets" }} />
        <EmptyState icon={SearchIcon} title="This ticket could not be found" hint="It may have been resolved or the ID is incorrect." />
      </div>
    );
  }

  function sendReply() {
    if (!reply.trim()) {
      toast.error("Nothing to send", { description: internalMode ? "Write an internal note first." : "Write a reply first." });
      return;
    }
    if (internalMode) toast.success("Internal note added", { description: "Visible to the team only - not sent to the requester." });
    else toast.success("Reply sent", { description: `Reply delivered to ${t!.requester}.` });
    setReply("");
  }

  return (
    <div>
      <PageHeader
        title={t.subject}
        back={{ to: "/admin/support", label: "Back to Tickets" }}
        crumbs={[{ label: "Support", to: "/admin/support" }, { label: t.id }]}
        actions={
          <div className="flex items-center gap-2">
            <Pill tone={PRIORITY_TONE[t.priority]} dot={t.priority === "Urgent" || t.priority === "High"}>{t.priority}</Pill>
            <StatusPill status={t.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
        {/* Conversation */}
        <SectionCard title="Conversation" subtitle={`${t.messages.length} message${t.messages.length === 1 ? "" : "s"} · opened ${ago(t.openedAt)}`} bodyClassName="p-0">
          <div className="px-5 py-5 space-y-4">
            {t.messages.map((m, i) => (
              <MessageBubble key={i} msg={m} requester={t.requester} />
            ))}
          </div>

          {/* Composer */}
          <div className="border-t border-[var(--adm-line)] p-4 bg-[var(--adm-card-2)]">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder={internalMode ? "Write an internal note (not shown to the requester)…" : `Reply to ${t.requester}…`}
              className="adm-focus w-full rounded-lg bg-[var(--adm-card)] border text-sm text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] p-3 resize-y transition-colors"
              style={{ borderColor: internalMode ? "var(--st-warning)" : "var(--adm-line)" }}
            />
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <button
                onClick={() => setInternalMode((v) => !v)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors"
                style={internalMode
                  ? { color: "var(--st-warning)", background: "var(--st-warning-soft)", borderColor: "var(--st-warning)" }
                  : { color: "var(--adm-text-2)", borderColor: "var(--adm-line)" }}
              >
                <Lock className="size-3.5" /> Internal note
              </button>
              <button
                onClick={sendReply}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold transition"
                style={internalMode
                  ? { color: "var(--st-warning)", background: "var(--st-warning-soft)", boxShadow: "inset 0 0 0 1px var(--st-warning)" }
                  : { color: "var(--adm-neon-ink)", background: "var(--adm-neon)" }}
              >
                <Send className="size-4" /> {internalMode ? "Add note" : "Reply"}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Right sticky */}
        <div className="lg:sticky lg:top-4 space-y-4">
          {/* Requester */}
          <SectionCard title="Requester">
            <div className="flex items-center gap-3">
              <Avatar name={t.requester} persona={t.persona} size={44} />
              <div className="min-w-0">
                <p className="text-sm text-[var(--adm-text)] font-medium truncate">{t.requester}</p>
                <div className="mt-1"><PersonaTag persona={t.persona} /></div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 mt-4">
              <Field label="Assignee">{t.assignee ?? <span className="italic text-[var(--adm-text-3)]">Unassigned</span>}</Field>
              <Field label="Opened"><span className="adm-num text-xs">{dateTime(t.openedAt)}</span></Field>
            </dl>
            <Link
              to={userRecordPath(t.persona)}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-[var(--adm-line)] text-[var(--adm-text-2)] text-sm hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)] transition-colors"
            >
              View user record <ExternalLink className="size-3.5" />
            </Link>
          </SectionCard>

          {/* Link & act */}
          <SectionCard title="Link & act" subtitle="Connect this ticket to the operation">
            <div className="space-y-2">
              <SideAction icon={Link2} onClick={() => nav("/admin/bookings")}>Link to booking</SideAction>
              <SideAction icon={AlertTriangle} onClick={() => nav("/admin/finance/disputes")} danger>Escalate to dispute</SideAction>
              <SideAction icon={UserPlus} onClick={() => toast.success("Ticket reassigned", { description: "Owner updated · the new assignee has been notified." })}>Reassign</SideAction>
            </div>
            <div className="grid grid-cols-1 gap-3 mt-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-1.5">Priority</p>
                <MiniSelect
                  value={priority}
                  onChange={(v) => { setPriority(v as Ticket["priority"]); toast(`Priority set to ${v}`); }}
                  options={[
                    { value: "Low", label: "Low" },
                    { value: "Normal", label: "Normal" },
                    { value: "High", label: "High" },
                    { value: "Urgent", label: "Urgent" },
                  ]}
                  className="w-full"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-1.5">Status</p>
                <MiniSelect
                  value={status}
                  onChange={(v) => { setStatus(v as TicketStatus); toast(`Status set to ${v}`); }}
                  options={STATUSES.map((s) => ({ value: s, label: s }))}
                  className="w-full"
                />
              </div>
            </div>
          </SectionCard>

          {/* Resolve */}
          <SectionCard title="Resolve">
            <div className="space-y-2">
              <button
                onClick={() => { setStatus("Resolved"); toast.success("Ticket resolved", { description: "Marked resolved with the latest reply as the resolution note." }); }}
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] text-sm font-semibold hover:brightness-110 transition"
              >
                <CheckCircle2 className="size-4" /> Resolve with note
              </button>
              <button
                onClick={() => toast("Replied - awaiting requester", { description: "Status moved to Waiting." })}
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-[var(--adm-line-strong)] text-[var(--adm-text)] text-sm font-medium hover:bg-[var(--adm-hover)] transition"
              >
                <CornerUpLeft className="size-4" /> Reply & set waiting
              </button>
              <button
                onClick={() => { setStatus("Open"); toast("Ticket reopened"); }}
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg text-[var(--adm-text-2)] text-sm font-medium hover:bg-[var(--adm-hover)] hover:text-[var(--adm-text)] transition"
              >
                <RotateCcw className="size-4" /> Reopen
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// A single message in the thread: requester (left card), internal note (amber), agent reply (neon-tinted right).
function MessageBubble({ msg, requester }: { msg: TicketMsg; requester: string }) {
  const isRequester = msg.from === requester;
  const isInternal = !!msg.internal;

  if (isInternal) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg border px-3.5 py-2.5" style={{ background: "var(--st-warning-soft)", borderColor: "var(--st-warning)" }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Lock className="size-3 text-[var(--st-warning)]" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--st-warning)]">Internal note · not shown to requester</span>
          </div>
          <p className="text-sm text-[var(--adm-text)] leading-relaxed">{msg.body}</p>
          <p className="text-[11px] text-[var(--adm-text-3)] mt-1.5">{msg.from} · {dateTime(msg.at)}</p>
        </div>
      </div>
    );
  }

  if (isRequester) {
    return (
      <div className="flex items-start gap-2.5">
        <Avatar name={msg.from} size={28} />
        <div className="max-w-[85%]">
          <div className="rounded-lg rounded-tl-sm border border-[var(--adm-line)] bg-[var(--adm-card-2)] px-3.5 py-2.5">
            <p className="text-sm text-[var(--adm-text)] leading-relaxed">{msg.body}</p>
          </div>
          <p className="text-[11px] text-[var(--adm-text-3)] mt-1 ml-0.5">{msg.from} · {ago(msg.at)}</p>
        </div>
      </div>
    );
  }

  // Agent reply
  return (
    <div className="flex items-start gap-2.5 justify-end">
      <div className="max-w-[85%]">
        <div className="rounded-lg rounded-tr-sm border px-3.5 py-2.5" style={{ background: "var(--adm-neon-soft)", borderColor: "var(--adm-neon-line)" }}>
          <p className="text-sm text-[var(--adm-text)] leading-relaxed">{msg.body}</p>
        </div>
        <p className="text-[11px] text-[var(--adm-text-3)] mt-1 mr-0.5 text-right">{msg.from} · agent · {ago(msg.at)}</p>
      </div>
      <Avatar name={msg.from} size={28} />
    </div>
  );
}

function SideAction({ icon: Icon, onClick, children, danger }: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full inline-flex items-center gap-2 h-10 px-3 rounded-lg border border-[var(--adm-line)] text-sm font-medium hover:border-[var(--adm-line-strong)] transition-colors"
      style={{ color: danger ? "var(--st-danger)" : "var(--adm-text)" }}
    >
      <Icon className="size-4" style={{ color: danger ? "var(--st-danger)" : "var(--adm-text-3)" }} />
      <span className="flex-1 text-left">{children}</span>
      <ChevronRight className="size-4 text-[var(--adm-text-3)]" />
    </button>
  );
}
