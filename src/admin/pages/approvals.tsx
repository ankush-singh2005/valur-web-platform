import * as React from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  Inbox, Search as SearchIcon, FileCheck2, CheckCircle2, Flag, PlayCircle,
  Download, History, ShieldCheck, FileText, Star, Clock, TrendingUp,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { DataTable, type Column } from "../components/DataTable";
import { DecisionPanel } from "../components/DecisionPanel";
import {
  Card, SectionCard, StatusPill, PersonaTag, TierBadge, SlaPill, Avatar,
  EmptyState, Field, Stat,
} from "../components/primitives";
import { SearchInput, Segmented, FilterChip, Toolbar } from "../components/controls";
import { approvalQueue, findCoach, findClub, findPlayer, decisions, type ApprovalItem } from "../data/mock";
import { TIERS } from "../lib/constants";
import { ago, date, dateTime } from "../lib/format";

// ── AD·05 Approvals Hub ───────────────────────────────────────────────────────
const KINDS = [
  { key: "Coach L1", label: "Coach onboarding", persona: "coach" as const },
  { key: "Club L1", label: "Club onboarding", persona: "club" as const },
  { key: "Tier L2", label: "Tier upgrades", persona: "system" as const },
  { key: "Player Video", label: "Player video", persona: "player" as const },
];

export function ApprovalsHub() {
  const nav = useNavigate();
  const [tab, setTab] = React.useState("Coach L1");
  const [q, setQ] = React.useState("");
  const [scope, setScope] = React.useState<"all" | "mine" | "unassigned">("all");

  const counts = React.useMemo(() => {
    const c: Record<string, number> = {};
    approvalQueue.forEach((a) => (c[a.kind] = (c[a.kind] ?? 0) + 1));
    return c;
  }, []);

  const rows = approvalQueue
    .filter((a) => a.kind === tab)
    .filter((a) => (scope === "mine" ? a.reviewer : scope === "unassigned" ? !a.reviewer : true))
    .filter((a) => a.applicant.toLowerCase().includes(q.toLowerCase()));

  function openReview(a: ApprovalItem) {
    if (a.kind === "Coach L1") nav(`/admin/approvals/coach/${a.refId}`);
    else if (a.kind === "Club L1") nav(`/admin/approvals/club/${a.refId}`);
    else if (a.kind === "Tier L2") nav(`/admin/approvals/tier/${a.id}`);
    else nav(`/admin/approvals/video/${a.refId}`);
  }

  const cols: Column<ApprovalItem>[] = [
    {
      key: "applicant", header: "Applicant", sortable: true, accessor: (a) => a.applicant,
      render: (a) => (
        <div className="flex items-center gap-3">
          <Avatar name={a.applicant} persona={a.persona} size={32} />
          <div>
            <p className="text-[var(--adm-text)] font-medium">{a.applicant}</p>
            <p className="text-xs text-[var(--adm-text-3)]">{a.refId}</p>
          </div>
        </div>
      ),
    },
    { key: "persona", header: "Type", render: (a) => <PersonaTag persona={a.persona} /> },
    {
      key: "tier", header: "Tier",
      render: (a) => a.requestedTier
        ? <span className="text-xs text-[var(--adm-text-2)]">{a.selfTier} <span className="text-[var(--adm-neon)]">→ {a.requestedTier}</span></span>
        : <TierBadge tier={a.selfTier} persona={a.persona} />,
    },
    { key: "submitted", header: "Submitted", sortable: true, accessor: (a) => a.submittedAt, render: (a) => <span className="text-[var(--adm-text-2)]">{ago(a.submittedAt)}</span> },
    { key: "sla", header: "Waiting", sortable: true, accessor: (a) => a.submittedAt, render: (a) => <SlaPill since={a.submittedAt} /> },
    { key: "reviewer", header: "Reviewer", render: (a) => a.reviewer ? <span className="text-[var(--adm-text-2)]">{a.reviewer}</span> : <span className="text-[var(--adm-text-3)] italic">Unassigned</span> },
    { key: "status", header: "Status", render: (a) => <StatusPill status={a.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Approvals Hub"
        description="The gate. Every coach and club is human-reviewed before they can act. Two levels, one hub, separate queues."
        actions={<Link to="/admin/approvals/decisions" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm text-[var(--adm-text-2)] border border-[var(--adm-line)] hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)] transition-colors"><History className="size-4" /> Decision Log</Link>}
      />


      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-[var(--adm-line)] pb-px">
        {KINDS.map((kdef) => {
          const active = tab === kdef.key;
          return (
            <button
              key={kdef.key}
              onClick={() => setTab(kdef.key)}
              className={`relative flex items-center gap-2 px-4 h-10 text-sm font-medium transition-colors ${active ? "text-[var(--adm-neon)]" : "text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"}`}
            >
              {kdef.label}
              <span className={`adm-num text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-[var(--adm-neon-soft)] text-[var(--adm-neon)]" : "bg-[var(--adm-card-2)] text-[var(--adm-text-3)]"}`}>{counts[kdef.key] ?? 0}</span>
              {active && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[var(--adm-neon)] rounded-full" />}
            </button>
          );
        })}
      </div>

      <Toolbar
        className="mb-4"
        left={
          <>
            <FilterChip active={scope === "all"} onClick={() => setScope("all")}>All</FilterChip>
            <FilterChip active={scope === "mine"} onClick={() => setScope("mine")}>My reviews</FilterChip>
            <FilterChip active={scope === "unassigned"} onClick={() => setScope("unassigned")}>Unassigned</FilterChip>
          </>
        }
        right={<SearchInput value={q} onChange={setQ} placeholder="Search name…" className="w-64" />}
      />

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(a) => a.id}
        onRowClick={openReview}
        initialSort={{ key: "sla", dir: "desc" }}
        empty={<div className="py-6"><EmptyState icon={Inbox} title="Nothing waiting - the queue is clear." hint="Last cleared 29 Jun · 09:40" /></div>}
      />
    </div>
  );
}

// ── shared review scaffold ────────────────────────────────────────────────────
function ReviewLayout({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
      <div className="space-y-5">{left}</div>
      <div className="lg:sticky lg:top-4 space-y-4">{right}</div>
    </div>
  );
}

function VerifyRow({ label, sub, verified }: { label: string; sub: string; verified: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-[var(--adm-line)] last:border-0">
      <div className="flex items-center gap-3">
        <FileText className="size-4 text-[var(--adm-text-3)]" />
        <div>
          <p className="text-sm text-[var(--adm-text)]">{label}</p>
          <p className="text-xs text-[var(--adm-text-3)]">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-xs text-[var(--adm-text-2)] hover:text-[var(--adm-neon)] transition-colors">Open proof</button>
        {verified
          ? <StatusPill status="Verified" />
          : <button className="inline-flex items-center gap-1 text-xs text-[var(--adm-text-3)] border border-[var(--adm-line)] rounded-full px-2 py-0.5 hover:border-[var(--st-success)] hover:text-[var(--st-success)] transition-colors"><CheckCircle2 className="size-3" /> Mark verified</button>}
      </div>
    </div>
  );
}

// ── AD·06 Coach Onboarding Review ─────────────────────────────────────────────
export function CoachReview() {
  const { id } = useParams();
  const c = findCoach(id!);
  if (!c) return <NotFound label="coach" />;
  return (
    <div>
      <PageHeader
        title={c.name}
        back={{ to: "/admin/approvals", label: "Back to Approvals Hub" }}
        crumbs={[{ label: "Approvals", to: "/admin/approvals" }, { label: "Coach L1" }, { label: c.name }]}
        actions={<PersonaTag persona="coach" />}
      />

      <ReviewLayout
        left={
          <>
            <SectionCard title="Applicant summary">
              <div className="flex items-start gap-4">
                <Avatar name={c.name} persona="coach" size={56} />
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
                  <Field label="Location">{c.location}</Field>
                  <Field label="Date applied">{c.appliedAt ? date(c.appliedAt) : "-"}</Field>
                  <Field label="Self-selected tier"><TierBadge tier={c.tier} persona="coach" /></Field>
                  <Field label="Experience">{c.experience} years</Field>
                  <Field label="Languages">{c.languages.join(", ")}</Field>
                  <Field label="Session types">{c.sessionTypes.join(" · ")}</Field>
                  <Field label="Specialties" className="col-span-2 sm:col-span-3">{c.specialties.join(", ")}</Field>
                  <Field label="Contact" className="col-span-2 sm:col-span-3">{c.email}</Field>
                </dl>
              </div>
            </SectionCard>

            <SectionCard title="Credentials & proof" subtitle="Verify each item against tier criteria">
              {c.credentials.map((cr, i) => (
                <VerifyRow key={i} label={cr.title} sub={`${cr.institution} · ${cr.year}`} verified={cr.verified} />
              ))}
            </SectionCard>

            {c.hybridEnabled && (
              <SectionCard title="Hybrid / expert sub-track" subtitle="Qualifying-question answers (EN·06 Step 4)">
                <p className="text-sm text-[var(--adm-text-2)] leading-relaxed">
                  This coach enabled <span className="text-[var(--adm-neon)]">Hybrid</span> as the remote/expert party. Their expert
                  answers are reviewed in this same pass. The coach may operate F2F / Online while this sub-track is pending.
                </p>
              </SectionCard>
            )}
          </>
        }
        right={
          <>
            <Card className="p-4">
              <div className="flex items-center gap-2 text-sm text-[var(--adm-text-2)]"><ShieldCheck className="size-4 text-[var(--adm-neon)]" /> Applied {c.appliedAt ? ago(c.appliedAt) : "-"}</div>
            </Card>
            <DecisionPanel subject={c.name} tierOptions={[...TIERS.coach]} currentTier={c.tier} approveLabel="Approve · can list" />
          </>
        }
      />
    </div>
  );
}

// ── AD·07 Club Onboarding Review ──────────────────────────────────────────────
export function ClubReview() {
  const { id } = useParams();
  const c = findClub(id!);
  if (!c) return <NotFound label="club" />;
  return (
    <div>
      <PageHeader
        title={c.name}
        back={{ to: "/admin/approvals", label: "Back to Approvals Hub" }}
        crumbs={[{ label: "Approvals", to: "/admin/approvals" }, { label: "Club L1" }, { label: c.name }]}
        actions={<PersonaTag persona="club" />}
      />
      <ReviewLayout
        left={
          <>
            <SectionCard title="Club summary">
              <div className="flex items-start gap-4">
                <Avatar name={c.name} persona="club" size={56} />
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
                  <Field label="Region">{c.region}</Field>
                  <Field label="Established">{c.established}</Field>
                  <Field label="Self-selected tier"><TierBadge tier={c.tier} persona="club" /></Field>
                  <Field label="Squads declared">{c.squads}</Field>
                  <Field label="Date applied">{c.appliedAt ? date(c.appliedAt) : "-"}</Field>
                  <Field label="Admin contact">{c.billingEmail}</Field>
                </dl>
              </div>
            </SectionCard>
            <SectionCard title="Billing identity & verification">
              <dl className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Legal name">{c.name}</Field>
                <Field label="VAT (VSK) number">{c.vskNumber}</Field>
                <Field label="Invoice email">{c.billingEmail}</Field>
              </dl>
              <VerifyRow label="Registration proof" sub="Institutional affiliation / league registration" verified={c.status !== "Pending"} />
              <VerifyRow label="Squad ↔ billing match" sub="Declared squads vs billing identity" verified={c.status !== "Pending"} />
            </SectionCard>
          </>
        }
        right={<DecisionPanel subject={c.name} tierOptions={[...TIERS.club]} currentTier={c.tier} approveLabel="Approve · activate" />}
      />
    </div>
  );
}

// ── AD·08 Tier-Upgrade Review (L2) ────────────────────────────────────────────
export function TierUpgrade() {
  const { id } = useParams();
  const item = approvalQueue.find((a) => a.id === id);
  if (!item) return <NotFound label="request" />;
  const isCoach = item.persona === "coach";
  const tierLadder = isCoach ? TIERS.coach : TIERS.club;
  return (
    <div>
      <PageHeader
        title={`${item.applicant} · tier upgrade`}
        back={{ to: "/admin/approvals", label: "Back to Approvals Hub" }}
        crumbs={[{ label: "Approvals", to: "/admin/approvals" }, { label: "Tier L2" }, { label: item.applicant }]}
        actions={<PersonaTag persona={item.persona} />}
      />
      <ReviewLayout
        left={
          <>
            <SectionCard title="Request context">
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Current tier"><TierBadge tier={item.selfTier} persona={item.persona} /></Field>
                <Field label="Requested"><TierBadge tier={item.requestedTier ?? "-"} persona={item.persona} /></Field>
                <Field label="Requested">{ago(item.submittedAt)}</Field>
                <Field label="Persona"><PersonaTag persona={item.persona} /></Field>
              </dl>
            </SectionCard>
            <SectionCard title="Evidence vs. criteria" subtitle={`Target tier criteria (AD·27) against this member's record`}>
              <div className="grid grid-cols-2 gap-px bg-[var(--adm-line)] rounded-lg overflow-hidden">
                <div className="bg-[var(--adm-card)] p-4">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] mb-3 font-medium">{item.requestedTier} criteria</p>
                  <ul className="space-y-2 text-sm text-[var(--adm-text-2)]">
                    <li>· 12+ months active on platform</li>
                    <li>· 250+ sessions delivered{!isCoach && " (or 1M+ ISK spend)"}</li>
                    <li>· 4.7+ average rating</li>
                    <li>· Verified credentials</li>
                  </ul>
                </div>
                <div className="bg-[var(--adm-card)] p-4">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] mb-3 font-medium">This member</p>
                  <div className="space-y-3">
                    <Stat label="Time on platform" value="9 months" />
                    <Stat label={isCoach ? "Sessions delivered" : "Lifetime spend"} value={isCoach ? "268" : "2.0M kr."} />
                    <Stat label="Average rating" value="4.7 ★" tone="var(--st-success)" />
                  </div>
                </div>
              </div>
            </SectionCard>
          </>
        }
        right={
          <DecisionPanel subject={`${item.applicant} → ${item.requestedTier}`} tierOptions={[...tierLadder]} currentTier={item.requestedTier} approveLabel="Approve · raise tier" note="Reversible: tier can move down as well as up · no downgrade penalty. Decision + reason → Decision Log + Audit Log." />
        }
      />
    </div>
  );
}

// ── AD·09 Player Video Verification ───────────────────────────────────────────
const CLIPS = ["Ball control", "Passing", "Shooting", "Short match clip"];
export function PlayerVideo() {
  const { id } = useParams();
  const p = findPlayer(id!);
  if (!p) return <NotFound label="player" />;
  return (
    <div>
      <PageHeader
        title={`${p.name} · video verification`}
        back={{ to: "/admin/approvals", label: "Back to Approvals Hub" }}
        crumbs={[{ label: "Approvals", to: "/admin/approvals" }, { label: "Player Video" }, { label: p.name }]}
        actions={<PersonaTag persona="player" />}
      />
      <ReviewLayout
        left={
          <>
            <SectionCard title="Submission" subtitle="Reviewed by Valur + the player's coaches only">
              <div className="grid grid-cols-2 gap-3">
                {CLIPS.map((clip) => (
                  <div key={clip} className="adm-grid-bg group relative aspect-video rounded-lg border border-[var(--adm-line)] grid place-items-center cursor-pointer overflow-hidden hover:border-[var(--persona-player-line)]">
                    <PlayCircle className="size-9 text-[var(--adm-text-3)] group-hover:text-[var(--persona-player)] transition-colors" />
                    <span className="absolute bottom-2 left-2 text-xs text-[var(--adm-text-2)] bg-[var(--adm-canvas)]/70 px-2 py-0.5 rounded">{clip}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Player">
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field label="Current tier"><TierBadge tier={p.tier} persona="player" /></Field>
                <Field label="Position">{p.position}</Field>
                <Field label="Submitted">{ago(p.joined)}</Field>
                <Field label="Status"><StatusPill status={p.videoStatus} /></Field>
              </dl>
            </SectionCard>
          </>
        }
        right={
          <SectionCard title="Review actions" subtitle="Non-blocking - players book with or without it (KAD-03)">
            <div className="space-y-2">
              <button className="w-full h-10 rounded-lg bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] text-sm font-semibold hover:brightness-110 transition">Verify · set badge</button>
              <button className="w-full h-10 rounded-lg border border-[var(--adm-line-strong)] text-[var(--adm-text)] text-sm font-medium hover:bg-[var(--adm-hover)] transition">Request re-submission</button>
              <button className="w-full h-10 rounded-lg text-[var(--st-danger)] text-sm font-medium hover:bg-[var(--st-danger-soft)] transition">Reject (reason)</button>
            </div>
            <p className="text-[11px] text-[var(--adm-text-3)] mt-4 leading-relaxed">Optional reviewer note can feed a tier suggestion. Verified result surfaces in the player record.</p>
          </SectionCard>
        }
      />
    </div>
  );
}

// ── AD·10 Decision Log ────────────────────────────────────────────────────────
const DECISION_KIND_LABEL: Record<string, string> = {
  "Coach L1": "Coach onboarding",
  "Club L1": "Club onboarding",
  "Tier L2": "Tier upgrade",
  "Player Video": "Player video",
};

export function DecisionLog() {
  const [q, setQ] = React.useState("");
  const [decision, setDecision] = React.useState<"all" | "Approved" | "Rejected" | "Info requested">("all");
  const rows = decisions
    .filter((d) => decision === "all" || d.decision === decision)
    .filter((d) => d.subject.toLowerCase().includes(q.toLowerCase()));

  const cols: Column<typeof decisions[number]>[] = [
    { key: "when", header: "When", sortable: true, accessor: (d) => d.when, render: (d) => <span className="text-[var(--adm-text-2)] adm-num">{dateTime(d.when)}</span> },
    { key: "by", header: "Decided by", render: (d) => <span className="text-[var(--adm-text-2)]">{d.decidedBy}</span> },
    { key: "subject", header: "Subject", render: (d) => <div className="flex items-center gap-2"><PersonaTag persona={d.persona} /><span className="text-[var(--adm-text)]">{d.subject}</span></div> },
    { key: "kind", header: "Type", render: (d) => <span className="text-xs text-[var(--adm-text-3)]">{DECISION_KIND_LABEL[d.kind] ?? d.kind}</span> },
    { key: "decision", header: "Decision", render: (d) => <StatusPill status={d.decision === "Info requested" ? "Awaiting info" : d.decision} /> },
    { key: "reason", header: "Reason", render: (d) => <span className="text-[var(--adm-text-2)] text-xs">{d.reason}</span> },
    { key: "tier", header: "Change log", render: (d) => d.tierChange ? <span className="text-xs text-[var(--adm-neon)]">{d.tierChange}</span> : <span className="text-[var(--adm-text-3)]">-</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Decision Log"
        description="The paper trail behind 'full control' - a reason-stamped record of every gate decision, defensible if a coach or club ever asks why."
        crumbs={[{ label: "Approvals", to: "/admin/approvals" }, { label: "Decision Log" }]}
        actions={<button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm text-[var(--adm-text-2)] border border-[var(--adm-line)] hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)] transition-colors"><Download className="size-4" /> Export CSV</button>}
      />
      <Toolbar
        className="mb-4"
        left={(["all", "Approved", "Rejected", "Info requested"] as const).map((d) => (
          <FilterChip key={d} active={decision === d} onClick={() => setDecision(d)}>{d === "all" ? "All decisions" : d}</FilterChip>
        ))}
        right={<SearchInput value={q} onChange={setQ} placeholder="Search subject…" className="w-64" />}
      />
      <DataTable columns={cols} rows={rows} rowKey={(d) => d.id} initialSort={{ key: "when", dir: "desc" }} />
    </div>
  );
}

function NotFound({ label }: { label: string }) {
  return (
    <div>
      <PageHeader title="Not found" back={{ to: "/admin/approvals", label: "Back to Approvals Hub" }} />
      <EmptyState icon={SearchIcon} title={`This ${label} could not be found`} hint="It may have been actioned or removed." />
    </div>
  );
}
