import * as React from "react";
import { toast } from "sonner";
import {
  Save, Pencil, Plus, X, ShieldCheck, GraduationCap,
  Eye, Award, Users, Building2, Wallet, Sparkles, Trash2, Tag, MessageSquare,
  Package, Layers, AlertTriangle, Coins, Globe, Languages, Clock, RotateCcw,
  PlayCircle, EyeOff, MapPin, Video, Copy, ExternalLink,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { DataTable, type Column } from "../components/DataTable";
import {
  Card, SectionCard, StatusPill, TierBadge, Money,
  EmptyState, Stat, Pill, RowActionButton,
} from "../components/primitives";
import { Toolbar, SearchInput, Segmented, FilterChip } from "../components/controls";
import { taxonomy, packageTemplates, lectures, platformSettings, type PackageTemplate, type Lecture } from "../data/mock";
import { TIERS, type Persona } from "../lib/constants";
import { isk, num, dateTime, pct } from "../lib/format";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/app/components/ui/tooltip";
import { cn } from "@/app/components/ui/utils";

// ── shared bits ───────────────────────────────────────────────────────────────

/** Read-only footer note describing the governance posture of a config surface. */
function ControlNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card-2)] px-3.5 py-2.5">
      <ShieldCheck className="size-3.5 mt-0.5 shrink-0 text-[var(--adm-text-3)]" />
      <p className="text-[11px] text-[var(--adm-text-3)] leading-relaxed">{children}</p>
    </div>
  );
}

/** A labelled, token-styled text input that reads like a real rubric/setting field. */
function LabeledInput({
  label, value, suffix, prefix, hint, className, readOnly,
}: {
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
  hint?: string;
  className?: string;
  readOnly?: boolean;
}) {
  const [v, setV] = React.useState(value);
  return (
    <div className={className}>
      <label className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">{label}</label>
      <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] px-3 h-9 focus-within:border-[var(--adm-neon-line)] transition-colors">
        {prefix && <span className="text-xs text-[var(--adm-text-3)] shrink-0">{prefix}</span>}
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          readOnly={readOnly}
          className="adm-num flex-1 min-w-0 bg-transparent text-sm text-[var(--adm-text)] outline-none placeholder:text-[var(--adm-text-3)]"
        />
        {suffix && <span className="text-xs text-[var(--adm-text-3)] shrink-0">{suffix}</span>}
      </div>
      {hint && <p className="text-[11px] text-[var(--adm-text-3)] mt-1">{hint}</p>}
    </div>
  );
}

/** Neon primary save button - fires a toast (no real persistence). */
function SaveButton({ label = "Save changes", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] text-sm font-semibold hover:brightness-110 transition"
    >
      <Save className="size-4" /> {label}
    </button>
  );
}

/** Token-styled on/off toggle switch. */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50"
      style={{
        background: on ? "var(--adm-neon)" : "var(--adm-line-strong)",
        boxShadow: on ? "inset 0 0 0 1px var(--adm-neon-line)" : "inset 0 0 0 1px var(--adm-line)",
      }}
    >
      <span
        className="absolute top-0.5 size-4 rounded-full transition-all"
        style={{
          left: on ? "calc(100% - 1.125rem)" : "0.125rem",
          background: on ? "var(--adm-neon-ink)" : "var(--adm-text-2)",
        }}
      />
    </button>
  );
}

/** Removable chip used for taxonomy terms / settings lists. */
function TermChip({ label, deprecated, onRemove }: { label: string; deprecated?: boolean; onRemove?: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full pl-3 pr-1.5 py-1 text-xs border transition-colors"
      style={{
        borderColor: deprecated ? "var(--st-warning-soft)" : "var(--adm-line)",
        background: deprecated ? "var(--st-warning-soft)" : "var(--adm-card-2)",
        color: deprecated ? "var(--st-warning)" : "var(--adm-text-2)",
      }}
    >
      {deprecated && <Clock className="size-3" />}
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="grid place-items-center size-4 rounded-full text-[var(--adm-text-3)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-hover)] transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

// ── AD·27  Tier Criteria ───────────────────────────────────────────────────────

const TIER_DESC: Record<string, string> = {
  Grassroots: "Entry coaches - community & youth level. Lowest-friction onboarding.",
  Local: "Established local coaches with a verifiable track record in their area.",
  Pro: "Full-time professionals with credentials and a sustained performance record.",
  Marquee: "Marquee names - national-level reputation, premium visibility on the platform.",
  Beginner: "New players building fundamentals - self-declared, video optional.",
  Intermediate: "Players with a verified clip set and consistent session history.",
  Advanced: "Advanced players - strong verified video and coach endorsements.",
  Junior: "Junior squads - youth academies and feeder programmes.",
  Senior: "Senior squads - first-team and competitive adult programmes.",
  Academy: "Academy partners - multi-squad institutions with dedicated support.",
};

const TIER_CRITERIA: Record<string, { label: string; rule: string }[]> = {
  Grassroots: [
    { label: "Credentials", rule: "Any coaching qualification or club affiliation" },
    { label: "Experience", rule: "0–2 years coaching" },
  ],
  Local: [
    { label: "Credentials", rule: "Recognised national-body badge (e.g. KSÍ B)" },
    { label: "Experience", rule: "2+ years, verifiable references" },
    { label: "Performance", rule: "4.3+ average rating once active" },
  ],
  Pro: [
    { label: "Credentials", rule: "Advanced badge (UEFA B / A) verified" },
    { label: "Experience", rule: "5+ years at competitive level" },
    { label: "Performance", rule: "4.6+ rating · 100+ sessions delivered" },
  ],
  Marquee: [
    { label: "Credentials", rule: "Elite badge + national-level playing/coaching record" },
    { label: "Performance", rule: "4.8+ rating · 250+ sessions · zero open disputes" },
    { label: "Review", rule: "Manual Super-Admin endorsement required" },
  ],
  Beginner: [
    { label: "Experience", rule: "Self-declared starting level" },
    { label: "Performance", rule: "Video verification optional (non-blocking)" },
  ],
  Intermediate: [
    { label: "Experience", rule: "Active session history on platform" },
    { label: "Performance", rule: "Verified clip set (ball control + passing)" },
  ],
  Advanced: [
    { label: "Performance", rule: "Full verified video set + coach endorsement" },
    { label: "Review", rule: "Player-video review pass (AD·09)" },
  ],
  Junior: [
    { label: "Credentials", rule: "Registered youth/feeder programme" },
    { label: "Spend volume", rule: "No minimum" },
  ],
  Senior: [
    { label: "Credentials", rule: "Registered competitive adult squad" },
    { label: "Spend volume", rule: "1M+ ISK lifetime unlocks bulk pricing" },
  ],
  Academy: [
    { label: "Credentials", rule: "Multi-squad institution, league-registered" },
    { label: "Spend volume", rule: "3M+ ISK lifetime · dedicated account manager" },
  ],
};

const TIER_UNLOCKS: Record<Persona, Record<string, string>> = {
  coach: {
    Grassroots: "Listed in search · standard placement · standard badge.",
    Local: "Boosted local search visibility · “Local” badge on profile.",
    Pro: "Featured placement in category results · “Pro” badge emphasis.",
    Marquee: "Homepage & curated-lecture eligibility · prominent Marquee badge.",
  },
  player: {
    Beginner: "Can book any open session · basic profile.",
    Intermediate: "Verified-clip badge · surfaced to coaches in discovery.",
    Advanced: "Advanced badge · eligible for elite/invite-only programmes.",
  },
  club: {
    Junior: "Squad booking · standard package catalogue.",
    Senior: "Bulk-session discounts · priority scheduling.",
    Academy: "Maximum bulk discounts · dedicated account manager · invoice terms.",
  },
};

export function TierCriteria() {
  const [persona, setPersona] = React.useState<Persona>("coach");
  const ladder = TIERS[persona === "system" ? "coach" : persona] as readonly string[];

  return (
    <div>
      <PageHeader
        title="Tier Criteria"
        description="The rubric the platform owns. Each persona's tier ladder is a configurable set of criteria and unlocks - the single source of truth that L2 tier-upgrade reviews (AD·08) are measured against."
        actions={<SaveButton onClick={() => toast.success("Tier criteria saved", { description: "Versioned, effective-dated, and written to the Audit Log." })} />}
      />


      <div className="mb-5">
        <Segmented
          value={persona}
          onChange={(v) => setPersona(v as Persona)}
          options={[
            { value: "coach", label: "Coach" },
            { value: "player", label: "Player" },
            { value: "club", label: "Club" },
          ]}
        />
      </div>

      <div className="space-y-4">
        {ladder.map((tier, i) => (
          <SectionCard
            key={`${persona}-${tier}`}
            collapsible
            defaultOpen={false}
            title={
              <span className="flex items-center gap-2.5">
                <span className="adm-num text-xs text-[var(--adm-text-3)]">{String(i + 1).padStart(2, "0")}</span>
                <TierBadge tier={tier} persona={persona} />
              </span>
            }
            subtitle={TIER_DESC[tier]}
            bodyClassName="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5"
          >
            <div>
              <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2.5">Criteria to qualify</p>
              <ul className="space-y-2">
                {TIER_CRITERIA[tier]?.map((c, ci) => (
                  <li
                    key={ci}
                    onClick={() => toast(`Editing "${c.label}" for ${tier}`, { description: "Changes are versioned and effective-dated." })}
                    className="group flex items-start gap-2.5 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card-2)] px-3 py-2 hover:border-[var(--adm-line-strong)] transition-colors cursor-pointer"
                  >
                    <span className="size-1.5 rounded-full bg-[var(--adm-neon)] mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">{c.label}</span>
                      <p className="text-sm text-[var(--adm-text)] leading-snug">{c.rule}</p>
                    </div>
                    <Pencil className="size-3 text-[var(--adm-text-3)] opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--adm-neon-line)] bg-[var(--adm-neon-soft)] p-4">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--adm-neon)] font-medium mb-2">
                {persona === "coach" ? <Eye className="size-3.5" /> : persona === "club" ? <Building2 className="size-3.5" /> : <Award className="size-3.5" />}
                What this tier unlocks
              </p>
              <p className="text-sm text-[var(--adm-text-2)] leading-relaxed">{TIER_UNLOCKS[persona]?.[tier]}</p>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

// ── AD·28  Taxonomy ─────────────────────────────────────────────────────────────

const DEPRECATED_TERMS = new Set(["Hold-up play"]);

export function Taxonomy() {
  const [active, setActive] = React.useState<string>("all");
  const groups = active === "all" ? taxonomy : taxonomy.filter((g) => g.group === active);

  return (
    <div>
      <PageHeader
        title="Taxonomy"
        description="The controlled vocabularies every persona selects from - specialties, age groups, audiences, positions, resource topics. Curate them here so search, filtering, and tagging stay consistent across the platform."
        actions={<SaveButton onClick={() => toast.success("Taxonomy saved", { description: "Rename is safe - tagged content is preserved and re-pointed." })} />}
      />

      <Toolbar
        className="mb-4"
        left={
          <>
            <FilterChip active={active === "all"} onClick={() => setActive("all")}>All groups</FilterChip>
            {taxonomy.map((g) => (
              <FilterChip key={g.group} active={active === g.group} onClick={() => setActive(g.group)} count={g.terms.length}>
                {g.group}
              </FilterChip>
            ))}
          </>
        }
      />

      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <SectionCard
            key={g.group}
            title={<span className="flex items-center gap-2"><Tag className="size-4 text-[var(--adm-text-3)]" /> {g.group}</span>}
            subtitle={`${g.terms.length} terms · controlled vocabulary`}
            collapsible
            defaultOpen={false}
          >
            <div className="flex flex-wrap gap-2">
              {g.terms.map((t) => (
                <TermChip
                  key={t}
                  label={t}
                  deprecated={DEPRECATED_TERMS.has(t)}
                  onRemove={() => toast(`Removed “${t}” from ${g.group}`, { description: "Existing tagged records keep the term; it is hidden from new selections." })}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-[var(--adm-line-strong)] bg-[var(--adm-card-2)] px-3 h-9 focus-within:border-[var(--adm-neon-line)] transition-colors">
              <Plus className="size-3.5 text-[var(--adm-text-3)] shrink-0" />
              <input
                placeholder={`Add a term to ${g.group}…`}
                className="flex-1 min-w-0 bg-transparent text-sm text-[var(--adm-text)] outline-none placeholder:text-[var(--adm-text-3)]"
              />
            </div>
          </SectionCard>
        ))}
      </div>

      <ControlNote>
        Role-gated to <span className="text-[var(--adm-text-2)]">Super Admin · Content Moderator</span>. All edits are logged. A safe rename re-points every
        tagged record to the new label rather than orphaning it - nothing tagged is ever lost.
      </ControlNote>
    </div>
  );
}

// ── AD·29  Package Templates ─────────────────────────────────────────────────────

const PLAYER_TONE: Record<number, "info" | "success" | "warning"> = { 4: "info", 6: "success", 10: "warning" };
const DELIVERY_TONE: Record<string, "info" | "success" | "neutral"> = { F2F: "success", Online: "info", Hybrid: "neutral" };

const enquiries = [
  { id: "cpe-1", club: "Fjölnir Akademían", note: "10-player keeper + finishing hybrid, 8 weeks, on-site.", tier: "Academy", persona: "club" as Persona },
  { id: "cpe-2", club: "Þróttur Senior", note: "6-player strength block, online-only, flexible dates.", tier: "Senior", persona: "club" as Persona },
];

export function PackageTemplates() {
  const cols: Column<PackageTemplate>[] = [
    {
      key: "name", header: "Template", sortable: true, accessor: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <span className="grid place-items-center size-8 rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] text-[var(--adm-text-3)] shrink-0"><Package className="size-4" /></span>
          <div>
            <p className="text-[var(--adm-text)] font-medium">{p.name}</p>
            <p className="text-xs text-[var(--adm-text-3)]">{p.id}</p>
          </div>
        </div>
      ),
    },
    { key: "players", header: "Players", sortable: true, accessor: (p) => p.players, render: (p) => <Pill tone={PLAYER_TONE[p.players] ?? "neutral"}>{p.players} players</Pill> },
    {
      key: "services", header: "Services",
      render: (p) => {
        const [first, ...rest] = p.services;
        return (
          <div className="flex items-center gap-1.5">
            <span className="rounded-md px-2 py-0.5 text-[11px] bg-[var(--adm-card-2)] border border-[var(--adm-line)] text-[var(--adm-text-2)] whitespace-nowrap">{first}</span>
            {rest.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="rounded-md px-2 py-0.5 text-[11px] bg-[var(--adm-card-2)] border border-[var(--adm-line)] text-[var(--adm-text-3)] whitespace-nowrap cursor-default">
                    +{rest.length} more
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  className="bg-[var(--adm-elevated)] border border-[var(--adm-line-strong)] text-[var(--adm-text)] rounded-lg px-3 py-2 shadow-xl"
                  arrowClassName="bg-[var(--adm-elevated)] fill-[var(--adm-elevated)]"
                >
                  <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                    {p.services.map((s) => (
                      <span key={s} className="rounded-md px-2 py-0.5 text-[11px] bg-[var(--adm-card)] border border-[var(--adm-line)] text-[var(--adm-text-2)] whitespace-nowrap">{s}</span>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    { key: "sessions", header: "Sessions", sortable: true, accessor: (p) => p.sessions, render: (p) => <span className="adm-num text-[var(--adm-text-2)]">{p.sessions}</span>, align: "right" },
    { key: "duration", header: "Duration", render: (p) => <span className="text-[var(--adm-text-2)]">{p.duration}</span> },
    { key: "price", header: "Price", sortable: true, accessor: (p) => p.price, render: (p) => <Money amount={p.price} />, align: "right" },
    { key: "delivery", header: "Delivery", render: (p) => <Pill tone={DELIVERY_TONE[p.delivery] ?? "neutral"}>{p.delivery}</Pill> },
    {
      key: "actions", header: "", align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <RowActionButton
            icon={Pencil}
            onClick={() => toast(`Editing “${p.name}”`, { description: "Price changes are versioned - existing purchases keep their agreed price." })}
          >Edit</RowActionButton>
          <RowActionButton
            icon={MessageSquare}
            onClick={() => toast(`“${p.name}” marked as consult-type`, { description: "Shown as an enquiry-first template in the club Packages tab." })}
          >Consult</RowActionButton>
          <RowActionButton
            icon={Trash2}
            tone="danger"
            onClick={() => toast.error(`“${p.name}” retired`, { description: "Hidden from new purchases; existing bookings are unaffected." })}
          >Retire</RowActionButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Club Package Templates"
        description="The catalogue of pre-built squad packages clubs buy from. Define the services, session count, duration, and price once here - these are the supply the club Packages tab draws from."
        actions={
          <button
            onClick={() => toast.success("New template started", { description: "Configure services, sessions, and pricing before publishing to the catalogue." })}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] text-sm font-semibold hover:brightness-110 transition"
          ><Plus className="size-4" /> Create template</button>
        }
      />


      <DataTable
        columns={cols}
        rows={packageTemplates}
        rowKey={(p) => p.id}
        initialSort={{ key: "price", dir: "desc" }}
        empty={<EmptyState icon={Package} title="No templates yet" hint="Create your first squad package." />}
      />

      <div className="mt-4">
        <SectionCard
          title={<span className="flex items-center gap-2"><Layers className="size-4 text-[var(--adm-text-3)]" /> Custom package enquiries</span>}
          subtitle="Bespoke requests to triage"
          bodyClassName="p-0"
        >
          <ul className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-[var(--adm-line)]">
            {enquiries.map((e, i) => (
              <li
                key={e.id}
                className={cn(
                  "px-4 py-3.5",
                  i % 2 === 0 ? "md:border-r md:border-[var(--adm-line)]" : "",
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium text-[var(--adm-text)]">{e.club}</span>
                  <TierBadge tier={e.tier} persona={e.persona} />
                </div>
                <p className="text-xs text-[var(--adm-text-2)] leading-relaxed mb-2.5">{e.note}</p>
                <div className="flex items-center gap-2">
                  <RowActionButton
                    icon={Plus}
                    tone="primary"
                    onClick={() => toast.success(`Drafting a custom template for ${e.club}`, { description: "Pre-filled from the enquiry - set pricing before sending a quote." })}
                  >Build template</RowActionButton>
                  <RowActionButton
                    icon={MessageSquare}
                    onClick={() => toast(`Replied to ${e.club}`, { description: "Enquiry kept open until a quote is agreed." })}
                  >Reply</RowActionButton>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <ControlNote>
        Role-gated to <span className="text-[var(--adm-text-2)]">Super Admin · Operations</span>. Price changes are versioned - existing purchases always keep
        the price agreed at checkout. Retiring a template removes it from new purchases only.
      </ControlNote>
    </div>
  );
}

// ── AD·30  Group Lectures ────────────────────────────────────────────────────────

const ORIGIN_TONE: Record<string, "neutral" | "info" | "success"> = { Platform: "success", Coach: "info", Club: "neutral" };

function CapacityBar({ registered, capacity }: { registered: number; capacity: number }) {
  const ratio = capacity > 0 ? Math.min(1, registered / capacity) : 0;
  const full = ratio >= 0.95;
  return (
    <div className="w-[120px]">
      <div className="flex items-center justify-between text-[11px] mb-1">
        <span className="adm-num text-[var(--adm-text-2)]">{registered} / {capacity}</span>
        <span className="adm-num text-[var(--adm-text-3)]">{pct(ratio * 100)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--adm-card-2)] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${ratio * 100}%`, background: full ? "var(--st-warning)" : "var(--adm-neon)" }} />
      </div>
    </div>
  );
}

export function GroupLectures() {
  const [status, setStatus] = React.useState<"all" | Lecture["status"]>("all");
  const [origin, setOrigin] = React.useState<"all" | Lecture["origin"]>("all");
  const [q, setQ] = React.useState("");

  const rows = lectures
    .filter((l) => status === "all" || l.status === status)
    .filter((l) => origin === "all" || l.origin === origin)
    .filter((l) => l.title.toLowerCase().includes(q.toLowerCase()) || l.speaker.toLowerCase().includes(q.toLowerCase()));

  const cols: Column<Lecture>[] = [
    {
      key: "title", header: "Lecture", sortable: true, accessor: (l) => l.title,
      render: (l) => (
        <div className="flex items-center gap-3">
          <span className="grid place-items-center size-8 rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] text-[var(--adm-text-3)] shrink-0"><GraduationCap className="size-4" /></span>
          <span className="text-[var(--adm-text)] font-medium">{l.title}</span>
        </div>
      ),
    },
    {
      key: "speaker", header: "Speaker",
      render: (l) => (
        <div className="flex items-center gap-2">
          <span className="text-[var(--adm-text-2)]">{l.speaker}</span>
          {l.speakerTier !== "-" && <TierBadge tier={l.speakerTier} />}
        </div>
      ),
    },
    { key: "when", header: "When", sortable: true, accessor: (l) => l.when, render: (l) => <span className="adm-num text-[var(--adm-text-2)] whitespace-nowrap">{dateTime(l.when)}</span> },
    { key: "format", header: "Format", render: (l) => <Pill tone={l.format === "Online" ? "info" : "neutral"}>{l.format}</Pill> },
    {
      key: "where", header: "Location / Link",
      render: (l) =>
        l.format === "Online" ? (
          <div className="flex items-center gap-1.5 min-w-0" onClick={(e) => e.stopPropagation()}>
            <Video className="size-3.5 text-[var(--adm-text-3)] shrink-0" />
            <a
              href={l.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--adm-neon)] hover:underline truncate max-w-[160px]"
              title={l.joinUrl}
            >
              {l.joinUrl?.replace(/^https?:\/\//, "")}
            </a>
            <button
              onClick={() => {
                if (l.joinUrl) navigator.clipboard.writeText(l.joinUrl);
                toast.success("Join link copied");
              }}
              className="text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors shrink-0"
              aria-label="Copy join link"
            >
              <Copy className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[var(--adm-text-2)]">
            <MapPin className="size-3.5 text-[var(--adm-text-3)] shrink-0" />
            <span className="truncate max-w-[200px]" title={l.location}>{l.location}</span>
          </div>
        ),
    },
    { key: "capacity", header: "Seats", sortable: true, accessor: (l) => l.registered, render: (l) => <CapacityBar registered={l.registered} capacity={l.capacity} /> },
    { key: "price", header: "Price", sortable: true, accessor: (l) => l.price, render: (l) => (l.price > 0 ? <Money amount={l.price} /> : <span className="text-xs text-[var(--st-success)]">Free</span>), align: "right" },
    { key: "origin", header: "Origin", render: (l) => <Pill tone={ORIGIN_TONE[l.origin] ?? "neutral"}>{l.origin}</Pill> },
    { key: "status", header: "Status", render: (l) => <StatusPill status={l.status} /> },
    {
      key: "actions", header: "", align: "right",
      render: (l) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {l.status !== "Live" ? (
            <RowActionButton
              icon={PlayCircle}
              tone="primary"
              onClick={() => toast.success(`“${l.title}” published`, { description: "Now live to clubs · written to the Audit Log." })}
            >{l.status === "Draft" ? "Approve" : "Publish"}</RowActionButton>
          ) : (
            <RowActionButton
              icon={EyeOff}
              onClick={() => toast(`“${l.title}” unpublished`, { description: "Hidden from clubs · existing registrations are preserved." })}
            >Unpublish</RowActionButton>
          )}
          <RowActionButton icon={Pencil} onClick={() => toast(`Editing “${l.title}”`)}>Edit</RowActionButton>
          <RowActionButton
            icon={Users}
            title="Manage seats"
            onClick={() => toast(`Managing seats for “${l.title}”`, { description: `${l.registered} of ${l.capacity} registered.` })}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Group Lectures & Seminars"
        description="The curated lecture catalogue. Talks from the platform, coaches, and clubs are moderated here - reviewed, seat-managed, and published before they go live to clubs."
        actions={
          <button
            onClick={() => toast.success("New lecture started", { description: "Set speaker, format, capacity, and price before submitting for review." })}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] text-sm font-semibold hover:brightness-110 transition"
          ><Plus className="size-4" /> Add lecture</button>
        }
      />


      <Toolbar
        className="mb-4"
        left={
          <>
            {(["all", "Live", "Draft", "Unpublished"] as const).map((s) => (
              <FilterChip key={s} active={status === s} onClick={() => setStatus(s)}>{s === "all" ? "All statuses" : s}</FilterChip>
            ))}
            <span className="w-px h-5 bg-[var(--adm-line)] mx-1" />
            {(["all", "Platform", "Coach", "Club"] as const).map((o) => (
              <FilterChip key={o} active={origin === o} onClick={() => setOrigin(o)}>{o === "all" ? "All origins" : o}</FilterChip>
            ))}
          </>
        }
        right={<SearchInput value={q} onChange={setQ} placeholder="Search title or speaker…" className="w-64" />}
      />

      <DataTable
        columns={cols}
        rows={rows}
        rowKey={(l) => l.id}
        initialSort={{ key: "when", dir: "asc" }}
        empty={<EmptyState icon={GraduationCap} title="No lectures match" hint="Adjust the filters above." />}
      />

      <ControlNote>
        Role-gated to <span className="text-[var(--adm-text-2)]">Operations · Content Moderator</span>. Nothing reaches clubs until it is published here.
        Publish / unpublish actions are written to the Audit Log (AD·34).
      </ControlNote>
    </div>
  );
}

// ── AD·31  Platform Settings ─────────────────────────────────────────────────────

export function PlatformSettings() {
  const s = platformSettings;
  const [flags, setFlags] = React.useState(s.featureFlags.map((f) => f.on));

  return (
    <div>
      <PageHeader
        title="Platform Settings"
        description="The single place the Iceland-first posture is set. Commerce rules, tax, currency, language, and feature flags - the platform-wide defaults every app obeys."
        actions={<SaveButton onClick={() => toast.success("Settings saved", { description: "Impact preview confirmed · versioned, effective-dated, and logged." })} />}
      />


      <div className="flex flex-col gap-4">
        {/* COMMERCE */}
        <SectionCard
          title={<span className="flex items-center gap-2"><Coins className="size-4 text-[var(--adm-text-3)]" /> Commerce & tax</span>}
          subtitle="Fees, currency, and VAT (VSK)"
          collapsible
          defaultOpen={false}
        >
          <div className="rounded-lg border border-[var(--st-warning-soft)] bg-[var(--st-warning-soft)] px-3.5 py-2.5 mb-4 flex items-start gap-2">
            <AlertTriangle className="size-3.5 mt-0.5 shrink-0 text-[var(--st-warning)]" />
            <p className="text-[11px] text-[var(--adm-text-2)] leading-relaxed">
              <span className="font-semibold text-[var(--st-warning)]">Guardrail.</span> Fee and VAT changes show a full impact preview - projected effect on
              GMV, revenue, and payouts - and must be confirmed before they take effect. They never apply silently.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <LabeledInput label="Platform fee" value={num(s.feePct)} suffix="%" hint="Take rate on every transaction." />
            <LabeledInput label="Currency" value={s.currency} hint="Iceland-first - ISK only at launch." readOnly />
            <LabeledInput label="VSK · standard" value={num(s.vskStandard)} suffix="%" hint="Standard Icelandic VAT rate." />
            <LabeledInput label="VSK · reduced" value={num(s.vskReduced)} suffix="%" hint="Reduced rate for qualifying services." />
            <LabeledInput label="Payout cycle" value={s.payoutCycle} className="col-span-2" hint="When released payouts are batched to coaches & clubs." />
          </div>

          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2">Payment rails</p>
            <div className="flex flex-wrap gap-2">
              {s.rails.map((r) => (
                <span key={r} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-[var(--adm-card-2)] border border-[var(--adm-line)] text-[var(--adm-text-2)]">
                  <Wallet className="size-3 text-[var(--adm-text-3)]" /> {r}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card-2)] px-3.5 py-2.5">
            <Stat label="On a 100.000 kr. booking" value={isk(20_000)} tone="var(--adm-neon)" />
            <span className="text-[11px] text-[var(--adm-text-3)] leading-snug">platform fee at the current 20% take · the coach nets {isk(80_000)} before VSK.</span>
          </div>

          <ControlNote>
            <span className="text-[var(--adm-text-2)]">Super-Admin only.</span> Versioned and effective-dated. Saving triggers the impact preview before anything changes.
          </ControlNote>
        </SectionCard>

        {/* PLATFORM */}
        <SectionCard
          title={<span className="flex items-center gap-2"><Globe className="size-4 text-[var(--adm-text-3)]" /> Platform</span>}
          subtitle="Sessions, language, and policy windows"
          collapsible
          defaultOpen={false}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2">Session types</p>
              <div className="flex flex-wrap gap-2">
                {s.sessionTypes.map((t) => <TermChip key={t} label={t} onRemove={() => toast(`Removed “${t}”`)} />)}
              </div>
            </div>
            <div className="col-span-2">
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-2"><Languages className="size-3.5" /> Languages</p>
              <div className="flex flex-wrap gap-2">
                {s.languages.map((l) => (
                  <span key={l} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs bg-[var(--adm-neon-soft)] border border-[var(--adm-neon-line)] text-[var(--adm-neon)]">
                    <Globe className="size-3" /> {l}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <LabeledInput label="Cancellation window" value={num(s.cancellationWindowHrs)} suffix="hrs" className="flex-1" prefix={undefined} />
            </div>
            <div className="flex items-end gap-2">
              <LabeledInput label="Refund window" value={num(s.refundWindowHrs)} suffix="hrs" className="flex-1" />
            </div>
            <p className="col-span-2 text-[11px] text-[var(--adm-text-3)] -mt-1 flex items-center gap-1.5">
              <Clock className="size-3" /> Cancellation
              <RotateCcw className="size-3 ml-2" /> Refund - measured from session start; both feed the booking & disputes flows.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--adm-line)]">
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium mb-3"><Sparkles className="size-3.5" /> Feature flags</p>
            <div className="space-y-2">
              {s.featureFlags.map((f, i) => (
                <div key={f.key} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-card-2)] px-3.5 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--adm-text)]">{f.label}</p>
                    <p className="text-[11px] text-[var(--adm-text-3)] mt-0.5">{f.note}</p>
                  </div>
                  <Toggle
                    on={flags[i]}
                    onClick={() => {
                      setFlags((prev) => prev.map((v, vi) => (vi === i ? !v : v)));
                      toast(`${f.label} ${flags[i] ? "disabled" : "enabled"}`, { description: "Effective-dated · written to the Audit Log." });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <ControlNote>
            <span className="text-[var(--adm-text-2)]">Super-Admin only.</span> Every flag flip is versioned, effective-dated, and logged. P2 flags stay off
            until their preconditions are proven in production.
          </ControlNote>
        </SectionCard>
      </div>
    </div>
  );
}
