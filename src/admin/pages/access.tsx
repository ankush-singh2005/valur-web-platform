import * as React from "react";
import { toast } from "sonner";
import {
  ShieldCheck, ShieldAlert, UserPlus, MoreHorizontal, Ban, KeyRound,
  Check, Minus, Download, Lock, ScrollText, X, CircleSlash, RotateCcw, Info, ChevronRight,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { DataTable, type Column } from "../components/DataTable";
import {
  Card, StatusPill, Pill, Avatar, EmptyState, rowActionClass,
} from "../components/primitives";
import { Toolbar, SearchInput, MiniSelect } from "../components/controls";
import { SideTray } from "../components/SideTray";
import { adminUsers, auditLog, type AdminUser, type AuditEntry } from "../data/mock";
import { ROLES, CURRENT_ADMIN } from "../lib/constants";
import { dateTime } from "../lib/format";

// Role label → pill tone (Super Admin highlighted as the privileged role)
const ROLE_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  "Super Admin": "danger",
  Operations: "info",
  Finance: "warning",
  Support: "success",
  "Content Moderator": "neutral",
  "Read-only Analyst": "neutral",
};

// ── AD·32 Admin Users & Roles ─────────────────────────────────────────────────
export function AdminUsersRoles() {
  const [q, setQ] = React.useState("");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteFirstName, setInviteFirstName] = React.useState("");
  const [inviteLastName, setInviteLastName] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState(ROLES[1].label);
  const [rolesOpen, setRolesOpen] = React.useState(false);
  // null = the six-roles list; a role key = drilled into that role's permission detail
  const [roleDetail, setRoleDetail] = React.useState<string | null>(null);

  const isSuper = CURRENT_ADMIN.role === "super";

  const rows = adminUsers.filter(
    (u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()),
  );

  function sendInvite() {
    const firstName = inviteFirstName.trim();
    const lastName = inviteLastName.trim();
    const email = inviteEmail.trim();
    if (!firstName || !lastName) {
      toast.error("Enter the admin's first and last name.");
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Enter a valid work email.");
      return;
    }
    toast.success(`Invite sent to ${firstName} ${lastName} as ${inviteRole}.`, {
      description: "Logged to the Audit Log · two-factor required at first sign-in.",
    });
    setInviteFirstName("");
    setInviteLastName("");
    setInviteEmail("");
    setInviteOpen(false);
  }

  const cols: Column<AdminUser>[] = [
    {
      key: "name", header: "Admin", sortable: true, accessor: (u) => u.name,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} size={32} />
          <div>
            <p className="text-[var(--adm-text)] font-medium">{u.name}</p>
            <p className="text-xs text-[var(--adm-text-3)]">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", header: "Role", sortable: true, accessor: (u) => u.role,
      render: (u) => <Pill tone={ROLE_TONE[u.role] ?? "neutral"} dot>{u.role}</Pill>,
    },
    { key: "status", header: "Status", render: (u) => <StatusPill status={u.status} /> },
    {
      key: "lastSignIn", header: "Last sign-in", sortable: true, accessor: (u) => u.lastSignIn,
      render: (u) => <span className="text-[var(--adm-text-2)] adm-num">{dateTime(u.lastSignIn)}</span>,
    },
    {
      key: "actions", header: "", align: "right",
      render: (u) => <RowActions user={u} disabled={!isSuper} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Users & Roles"
        description="Who can act inside the console, and as what. Least-privilege by default - the riskiest powers are narrowly held."
        actions={
          <button
            onClick={() => setInviteOpen((v) => !v)}
            disabled={!isSuper}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-semibold bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserPlus className="size-4" /> Invite admin
          </button>
        }
      />


      {/* Invite admin - inline form */}
      {inviteOpen && (
        <Card className="mb-5 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--adm-text)]">
              <UserPlus className="size-4 text-[var(--adm-neon)]" /> Invite a new admin
            </div>
            <button onClick={() => setInviteOpen(false)} className="text-[var(--adm-text-3)] hover:text-[var(--adm-text)]" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-1.5">First name</label>
              <input
                value={inviteFirstName}
                onChange={(e) => setInviteFirstName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                type="text"
                placeholder="Sigrún"
                className="adm-focus h-9 w-full rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] px-3 text-sm text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] focus:border-[var(--adm-neon-line)] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-1.5">Last name</label>
              <input
                value={inviteLastName}
                onChange={(e) => setInviteLastName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                type="text"
                placeholder="Halldórsdóttir"
                className="adm-focus h-9 w-full rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] px-3 text-sm text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] focus:border-[var(--adm-neon-line)] transition-colors"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <label className="block text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-1.5">Work email</label>
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                type="email"
                placeholder="name@valur.is"
                className="adm-focus h-9 w-full rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] px-3 text-sm text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] focus:border-[var(--adm-neon-line)] transition-colors"
              />
            </div>
            <div className="w-full sm:w-56">
              <label className="block text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-1.5">Role</label>
              <MiniSelect
                value={inviteRole}
                onChange={setInviteRole}
                options={ROLES.map((r) => ({ value: r.label, label: r.label }))}
                className="w-full"
              />
            </div>
            <button
              onClick={sendInvite}
              className="h-9 px-4 rounded-lg text-sm font-semibold bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] hover:brightness-110 transition shrink-0"
            >
              Send invite
            </button>
          </div>
          <p className="text-[11px] text-[var(--adm-text-3)] mt-3">
            The invitee sets their own password and enrols two-factor at first sign-in. No public sign-up exists.
          </p>
        </Card>
      )}

      <Toolbar
        className="mb-4"
        left={
          <span className="flex items-center gap-3 text-xs text-[var(--adm-text-3)]">
            <span className="adm-num">{rows.length} of {adminUsers.length} admins</span>
            <button
              onClick={() => { setRolesOpen(true); setRoleDetail(null); }}
              className="inline-flex items-center gap-1 text-[var(--adm-neon)] hover:underline"
            >
              <Info className="size-3.5" /> View the six roles
            </button>
          </span>
        }
        right={<SearchInput value={q} onChange={setQ} placeholder="Search name or email…" className="w-64" />}
      />
      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(u) => u.id}
        initialSort={{ key: "name", dir: "asc" }}
        empty={<div className="py-6"><EmptyState title="No admins match that search." /></div>}
      />
      <p className="text-[11px] text-[var(--adm-text-3)] mt-3 leading-relaxed">
        Two-factor is mandatory on every account · there is no self-signup · only a Super Admin can invite, change roles, or revoke - and each of those is written to the Audit Log (AD·34).
      </p>

      {/* Roles reference - on-demand tray, not permanent real estate.
          List view = the six roles; clicking one drills into its full
          permission breakdown in place (the old standalone Permissions
          Matrix page, AD·33, now lives here instead of its own screen). */}
      <SideTray
        open={rolesOpen}
        onClose={() => setRolesOpen(false)}
        onBack={roleDetail ? () => setRoleDetail(null) : undefined}
        title={roleDetail ? ROLES.find((r) => r.key === roleDetail)?.label : "The six roles"}
        subtitle={roleDetail ? "What this role can see and do (KAD-09)" : "Least-privilege reference (KAD-09)"}
        width={roleDetail ? 440 : 420}
      >
        {roleDetail ? (
          <RolePermissionDetail roleKey={roleDetail} />
        ) : (
          <ul>
            {ROLES.map((r) => {
              const privileged = r.key === "super";
              return (
                <li key={r.key} className="border-b border-[var(--adm-line)] last:border-0">
                  <button
                    onClick={() => setRoleDetail(r.key)}
                    className="w-full flex items-start gap-3 py-3.5 text-left hover:bg-[var(--adm-hover)] transition-colors -mx-1 px-1 rounded-lg"
                  >
                    <span
                      className="grid place-items-center size-7 rounded-lg shrink-0 mt-0.5"
                      style={{
                        background: privileged ? "var(--st-danger-soft)" : "var(--adm-card-2)",
                        color: privileged ? "var(--st-danger)" : "var(--adm-text-3)",
                      }}
                    >
                      {privileged ? <ShieldAlert className="size-4" /> : <ShieldCheck className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--adm-text)]">{r.label}</p>
                      <p className="text-xs text-[var(--adm-text-3)] mt-0.5 leading-relaxed">{r.desc}</p>
                    </div>
                    <ChevronRight className="size-4 text-[var(--adm-text-3)] mt-1 shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SideTray>
    </div>
  );
}

/** Per-role capability breakdown - the drill-down shown inside the six-roles tray. */
function RolePermissionDetail({ roleKey }: { roleKey: string }) {
  const groups = React.useMemo(() => {
    const order: string[] = [];
    const byMod: Record<string, Cap[]> = {};
    CAPS.forEach((c) => {
      if (!byMod[c.module]) { byMod[c.module] = []; order.push(c.module); }
      byMod[c.module].push(c);
    });
    return order.map((m) => ({ module: m, caps: byMod[m] }));
  }, []);

  return (
    <div>
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.module}>
            <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--adm-text-3)] mb-2">{g.module}</p>
            <ul className="space-y-1.5">
              {g.caps.map((c, i) => {
                const on = c.allow[roleKey];
                return (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--adm-line)] px-3 py-2"
                    style={c.sensitive ? { background: "color-mix(in srgb, var(--st-danger) 5%, transparent)" } : undefined}
                  >
                    <span className="flex items-center gap-2 text-sm text-[var(--adm-text)] min-w-0">
                      {c.sensitive && <Lock className="size-3 text-[var(--st-danger)] shrink-0" />}
                      <span className="truncate">{c.label}</span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      {c.sensitive && <Pill tone="danger">Sensitive</Pill>}
                      {on ? (
                        <Check
                          className="size-4 shrink-0"
                          style={{ color: c.sensitive ? "var(--st-danger)" : "var(--adm-neon)" } as React.CSSProperties}
                        />
                      ) : (
                        <Minus className="size-3.5 text-[var(--adm-text-3)] opacity-40 shrink-0" />
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-[var(--adm-line)] flex flex-col gap-1.5 text-[11px] text-[var(--adm-text-3)]">
        <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-[var(--adm-neon)]" /> Allowed</span>
        <span className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-[var(--st-danger)]" /> Allowed · sensitive</span>
        <span className="inline-flex items-center gap-1.5"><Minus className="size-3 opacity-40" /> Not permitted</span>
      </div>
    </div>
  );
}

function RowActions({ user, disabled }: { user: AdminUser; disabled: boolean }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const suspended = user.status === "Suspended";

  function act(label: string) {
    toast.success(`${label} - ${user.name}.`, { description: "Recorded in the Audit Log." });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`${rowActionClass("neutral", false)} disabled:opacity-30 disabled:cursor-not-allowed`}
        aria-label="Row actions"
      >
        <MoreHorizontal className="size-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-[var(--adm-line-strong)] bg-[var(--adm-elevated)] py-1 shadow-xl">
          {suspended ? (
            <MenuItem icon={RotateCcw} onClick={() => act("Reinstated")}>Reinstate access</MenuItem>
          ) : (
            <MenuItem icon={Ban} onClick={() => act("Suspended")}>Suspend</MenuItem>
          )}
          <MenuItem icon={KeyRound} onClick={() => act("Two-factor reset for")}>Reset two-factor</MenuItem>
          <div className="my-1 h-px bg-[var(--adm-line)]" />
          <MenuItem icon={CircleSlash} danger onClick={() => act("Access revoked for")}>Revoke access</MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon, children, onClick, danger,
}: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
        danger ? "text-[var(--st-danger)] hover:bg-[var(--st-danger-soft)]" : "text-[var(--adm-text-2)] hover:bg-[var(--adm-hover)] hover:text-[var(--adm-text)]"
      }`}
    >
      <Icon className="size-4 shrink-0" /> {children}
    </button>
  );
}

// ── Capability matrix (KAD-09) - feeds the role drill-down in the AD·32 tray ──
type Cap = { module: string; label: string; sensitive?: boolean; allow: Record<string, boolean> };
// roles in column order: super · ops · finance · support · content · analyst
const COL_KEYS = ["super", "ops", "finance", "support", "content", "analyst"] as const;

// least-privilege mapping (Super Admin = all; analyst = view-only everywhere + audit)
function cap(module: string, label: string, allow: Partial<Record<typeof COL_KEYS[number], boolean>>, sensitive?: boolean): Cap {
  const full: Record<string, boolean> = { super: true, ops: false, finance: false, support: false, content: false, analyst: false };
  return { module, label, sensitive, allow: { ...full, ...allow } };
}

const CAPS: Cap[] = [
  cap("Approvals", "View queue", { ops: true, support: true, content: true, analyst: true }),
  cap("Approvals", "Approve / reject", { ops: true }, true),
  cap("Bookings", "View sessions", { ops: true, finance: true, support: true, analyst: true }),
  cap("Finance", "View payouts & ledger", { ops: true, finance: true, analyst: true }),
  cap("Finance", "Release payout", { finance: true }, true),
  cap("Finance", "Issue refund", { finance: true }, true),
  cap("Users", "View profiles", { ops: true, finance: true, support: true, analyst: true }),
  cap("Users", "Suspend user", { ops: true }, true),
  cap("Users", "Change tier", { ops: true }, true),
  cap("Config", "View configuration", { ops: true, content: true, analyst: true }),
  cap("Config", "Edit tiers & settings", {}, true),
  cap("Config", "Taxonomy & lectures", { content: true }),
  cap("Content", "Player video review", { content: true }),
  cap("Support", "View tickets", { ops: true, support: true, analyst: true }),
  cap("Support", "Reply to tickets", { support: true }),
  cap("Access", "Manage admins & roles", {}, true),
  cap("Audit", "Read audit log", { analyst: true }),
];

// ── AD·34 Audit Log ───────────────────────────────────────────────────────────
const MODULE_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  Auth: "info",
  Finance: "warning",
  Approvals: "success",
  Users: "danger",
  Config: "neutral",
};

export function AuditLog() {
  const [q, setQ] = React.useState("");
  const [module, setModule] = React.useState("all");
  const [actor, setActor] = React.useState("all");

  const modules = React.useMemo(() => Array.from(new Set(auditLog.map((e) => e.module))).sort(), []);
  const actors = React.useMemo(() => Array.from(new Set(auditLog.map((e) => e.actor))).sort(), []);

  const rows = auditLog
    .filter((e) => module === "all" || e.module === module)
    .filter((e) => actor === "all" || e.actor === actor)
    .filter((e) => {
      const t = q.toLowerCase();
      return e.action.toLowerCase().includes(t) || e.target.toLowerCase().includes(t) || e.reason.toLowerCase().includes(t);
    });

  function exportRange() {
    toast.success("Export queued.", { description: `${rows.length} entries · CSV will download shortly.` });
  }

  const cols: Column<AuditEntry>[] = [
    {
      key: "when", header: "When", sortable: true, accessor: (e) => e.when,
      render: (e) => <span className="text-[var(--adm-text-2)] adm-num whitespace-nowrap">{dateTime(e.when)}</span>,
    },
    { key: "actor", header: "Actor", render: (e) => <span className="text-[var(--adm-text)]">{e.actor}</span> },
    { key: "action", header: "Action", render: (e) => <span className="text-[var(--adm-text)] font-medium">{e.action}</span> },
    { key: "target", header: "Target", render: (e) => <span className="text-[var(--adm-text-2)] text-xs">{e.target}</span> },
    {
      key: "change", header: "Change",
      render: (e) => (
        <span className="inline-flex items-center gap-2 text-xs whitespace-nowrap">
          <span className="text-[var(--adm-text-3)] line-through decoration-[var(--adm-text-3)]/50">{e.before}</span>
          <span className="text-[var(--adm-neon)]">→</span>
          <span className="text-[var(--adm-text)]">{e.after}</span>
        </span>
      ),
    },
    { key: "reason", header: "Reason", render: (e) => <span className="text-[var(--adm-text-2)] text-xs">{e.reason}</span> },
    { key: "module", header: "Module", render: (e) => <Pill tone={MODULE_TONE[e.module] ?? "neutral"}>{e.module}</Pill> },
  ];

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Append-only and immutable. Every privileged action - who did it, when, and why - lands here and stays."
        actions={
          <button
            onClick={exportRange}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm text-[var(--adm-text-2)] border border-[var(--adm-line)] hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)] transition-colors"
          >
            <Download className="size-4" /> Export range
          </button>
        }
      />


      <Toolbar
        className="mb-4"
        left={
          <>
            <MiniSelect
              value={module}
              onChange={setModule}
              options={[{ value: "all", label: "All modules" }, ...modules.map((m) => ({ value: m, label: m }))]}
            />
            <MiniSelect
              value={actor}
              onChange={setActor}
              options={[{ value: "all", label: "All actors" }, ...actors.map((a) => ({ value: a, label: a }))]}
            />
          </>
        }
        right={<SearchInput value={q} onChange={setQ} placeholder="Search action, target, reason…" className="w-72" />}
      />

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(e) => e.id}
        initialSort={{ key: "when", dir: "desc" }}
        empty={<div className="py-6"><EmptyState icon={ScrollText} title="No entries match those filters." /></div>}
      />

      <p className="text-[11px] text-[var(--adm-text-3)] mt-3 leading-relaxed">
        This log is append-only and never editable. Read access is gated to Super Admin and Read-only Analyst. The Decision Log (AD·10) is the business-readable approvals slice of this record.
      </p>
    </div>
  );
}
