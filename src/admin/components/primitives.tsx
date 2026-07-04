import * as React from "react";
import { Link } from "react-router";
import { cn } from "@/app/components/ui/utils";
import { PERSONA, STATUS_TONE, type Persona } from "../lib/constants";
import { isk, initials, waitHours } from "../lib/format";
import {
  ArrowDown, ArrowUp, ChevronDown,
  Sprout, MapPin, BadgeCheck, Crown, Circle, TrendingUp, Star, Users, Shield, GraduationCap,
} from "lucide-react";

// ── tone maps ───────────────────────────────────────────────────────────────
const TONE = {
  success: { fg: "var(--st-success)", bg: "var(--st-success-soft)" },
  warning: { fg: "var(--st-warning)", bg: "var(--st-warning-soft)" },
  danger: { fg: "var(--st-danger)", bg: "var(--st-danger-soft)" },
  info: { fg: "var(--st-info)", bg: "var(--st-info-soft)" },
  neutral: { fg: "var(--st-neutral)", bg: "var(--st-neutral-soft)" },
} as const;
export type Tone = keyof typeof TONE;

// ── Pill ──────────────────────────────────────────────────────────────────
export function Pill({
  tone = "neutral",
  children,
  dot,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", className)}
      style={{ color: t.fg, background: t.bg }}
    >
      {dot && <span className="size-1.5 rounded-full" style={{ background: t.fg }} />}
      {children}
    </span>
  );
}

// ── Row action button (the trailing "actions" column of admin tables/lists) ──
// One shared shape for every inline row action across the console: a bordered,
// h-8, rounded-lg chip - icon+label when `children` is passed, icon-only
// (square) otherwise. `tone` covers the cases that recur everywhere: a neutral
// utility action, a state-promoting one (Publish/Approve/Build), a destructive
// one (Retire/Revoke - stays neutral at rest, reddens on hover/intent), or an
// alert one that's flagging an already-active problem (Dispute - red at rest,
// since the row itself is in a bad state, not just offering a risky action).
export type RowActionTone = "neutral" | "primary" | "danger" | "alert";

const ROW_ACTION_TONE: Record<RowActionTone, string> = {
  neutral: "text-[var(--adm-text-2)] border-[var(--adm-line)] hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)]",
  primary: "text-[var(--adm-neon)] border-[var(--adm-neon-line)] bg-[var(--adm-neon-soft)] hover:brightness-110",
  danger: "text-[var(--adm-text-2)] border-[var(--adm-line)] hover:text-[var(--st-danger)] hover:border-[var(--st-danger)] hover:bg-[var(--st-danger-soft)]",
  alert: "text-[var(--st-danger)] border-[var(--adm-line)] hover:border-[var(--st-danger)]",
};

export function rowActionClass(tone: RowActionTone = "neutral", labelled = true) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium border transition-colors shrink-0 whitespace-nowrap",
    labelled ? "px-2.5" : "w-8",
    ROW_ACTION_TONE[tone],
  );
}

export function RowActionButton({
  icon: Icon,
  children,
  tone = "neutral",
  onClick,
  to,
  disabled,
  title,
  "aria-label": ariaLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  tone?: RowActionTone;
  onClick?: () => void;
  to?: string;
  disabled?: boolean;
  title?: string;
  "aria-label"?: string;
}) {
  const cls = cn(rowActionClass(tone, !!children), disabled && "opacity-40 pointer-events-none");
  const label = ariaLabel ?? title ?? (typeof children === "string" ? children : undefined);
  const content = (
    <>
      <Icon className="size-3.5 shrink-0" />
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} onClick={(e) => e.stopPropagation()} className={cls} title={title} aria-label={label}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cls} title={title} aria-label={label}>
      {content}
    </button>
  );
}

// ── StatusPill (maps a status string → tone) ─────────────────────────────────
export function StatusPill({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return <Pill tone={tone} dot className={className}>{status}</Pill>;
}

// ── PersonaTag ──────────────────────────────────────────────────────────────
export function PersonaTag({ persona, label, className }: { persona: Persona; label?: string; className?: string }) {
  const p = PERSONA[persona];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", className)}
      style={{ color: p.color, background: p.soft, boxShadow: `inset 0 0 0 1px ${p.line}` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: p.color }} />
      {label ?? p.label}
    </span>
  );
}

// ── Tier system ───────────────────────────────────────────────────────────
// Tiers read as an escalating SCALE, not identical chips. Each tier has its own
// icon and colour, the colour "heats up" with rank (slate → blue → amber → neon),
// and the top tier of every ladder is the ONLY filled chip - a deliberate,
// consistent property rather than a random mix of fills.
type TierStyle = { icon: React.ComponentType<{ className?: string }>; color: string; filled?: boolean };
const TIER_META: Record<string, TierStyle> = {
  // Coach ladder - Grassroots → Local → Pro → Marquee
  Grassroots: { icon: Sprout, color: "#9aa4b2" },
  Local: { icon: MapPin, color: "#5b9bff" },
  Pro: { icon: BadgeCheck, color: "#f5a524" },
  Marquee: { icon: Crown, color: "#c8f000", filled: true },
  // Player ladder - Beginner → Intermediate → Advanced
  Beginner: { icon: Circle, color: "#9aa4b2" },
  Intermediate: { icon: TrendingUp, color: "#f5a524" },
  Advanced: { icon: Star, color: "#c8f000", filled: true },
  // Club ladder - Junior → Senior → Academy
  Junior: { icon: Users, color: "#9aa4b2" },
  Senior: { icon: Shield, color: "#f5a524" },
  Academy: { icon: GraduationCap, color: "#c8f000", filled: true },
};

export function TierBadge({ tier, className }: { tier: string; persona?: Persona; className?: string }) {
  const meta = TIER_META[tier];

  // Unknown / placeholder (e.g. "-") - neutral, iconless
  if (!meta) {
    return (
      <span
        className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-[var(--adm-text-3)]", className)}
        style={{ boxShadow: "inset 0 0 0 1px var(--adm-line)" }}
      >
        {tier}
      </span>
    );
  }

  const Icon = meta.icon;

  // Top tier - the single filled treatment (neon, subtle glow)
  if (meta.filled) {
    return (
      <span
        className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold", className)}
        style={{ background: meta.color, color: "#0d0d0d", boxShadow: `0 0 14px -4px ${meta.color}` }}
      >
        <Icon className="size-3" /> {tier}
      </span>
    );
  }

  // Other tiers - tonal (colour text + soft fill + hairline), colour by rank
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", className)}
      style={{
        color: meta.color,
        background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${meta.color} 32%, transparent)`,
      }}
    >
      <Icon className="size-3" /> {tier}
    </span>
  );
}

// ── SlaPill (amber > 48h, red > 5d) ─────────────────────────────────────────
export function SlaPill({ since, className }: { since: string; className?: string }) {
  const h = waitHours(since);
  let tone: Tone = "success";
  let label = `${h}h`;
  if (h >= 120) { tone = "danger"; label = `${Math.floor(h / 24)}d · breach`; }
  else if (h >= 48) { tone = "warning"; label = `${Math.floor(h / 24)}d`; }
  else label = `${h}h`;
  return <Pill tone={tone} className={cn("tabular-nums", className)}>{label}</Pill>;
}

// ── Money ───────────────────────────────────────────────────────────────────
export function Money({ amount, className, sign }: { amount: number; className?: string; sign?: boolean }) {
  const neg = amount < 0;
  return (
    <span className={cn("adm-num", neg && "text-[var(--st-danger)]", className)}>
      {sign && !neg ? "+" : ""}
      {isk(amount)}
    </span>
  );
}

// ── Avatar (initials) ───────────────────────────────────────────────────────
export function Avatar({ name, size = 32, persona, className }: { name: string; size?: number; persona?: Persona; className?: string }) {
  const color = persona ? PERSONA[persona].color : "var(--adm-text-2)";
  const bg = persona ? PERSONA[persona].soft : "rgba(255,255,255,0.06)";
  return (
    <span
      className={cn("inline-flex items-center justify-center rounded-full font-semibold shrink-0", className)}
      style={{ width: size, height: size, fontSize: size * 0.38, color, background: bg, boxShadow: `inset 0 0 0 1px ${persona ? PERSONA[persona].line : "var(--adm-line)"}` }}
    >
      {initials(name)}
    </span>
  );
}

// ── Card / SectionCard ──────────────────────────────────────────────────────
export function Card({ className, children, style }: { className?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("rounded-xl border border-[var(--adm-line)] bg-[var(--adm-card)]", className)}
      style={style}
    >
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
  collapsible,
  defaultOpen = true,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <Card className={className}>
      {(title || actions) && (
        <div
          className={cn(
            "flex items-center justify-between gap-3 px-5 py-3.5",
            (open || !collapsible) && "border-b border-[var(--adm-line)]",
            collapsible && "cursor-pointer select-none",
          )}
          onClick={collapsible ? () => setOpen((v) => !v) : undefined}
        >
          <div>
            {title && <h3 className="text-sm font-semibold text-[var(--adm-text)]">{title}</h3>}
            {subtitle && <p className="text-xs text-[var(--adm-text-3)] mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
            {collapsible && (
              <ChevronDown className={cn("size-4 text-[var(--adm-text-3)] transition-transform", open && "rotate-180")} />
            )}
          </div>
        </div>
      )}
      {(!collapsible || open) && <div className={cn("p-5", bodyClassName)}>{children}</div>}
    </Card>
  );
}

// ── KPI card ────────────────────────────────────────────────────────────────
export function KpiCard({
  label,
  value,
  delta,
  hint,
  accent,
  glow,
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  hint?: string;
  accent?: boolean;
  glow?: boolean;
}) {
  return (
    <Card className={cn("p-4 relative overflow-hidden", glow && "adm-glow")}>
      {accent && <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-[var(--adm-neon)]" />}
      <p className="text-xs text-[var(--adm-text-3)] font-medium">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className={cn("text-2xl font-semibold adm-num tracking-tight", accent ? "text-[var(--adm-neon)]" : "text-[var(--adm-text)]", glow && "adm-glow-text")}>
          {value}
        </span>
        {delta !== undefined && (
          <span
            className="mb-1 inline-flex items-center gap-0.5 text-xs font-medium"
            style={{ color: delta >= 0 ? "var(--st-success)" : "var(--st-danger)" }}
          >
            {delta >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {Math.abs(delta).toFixed(1).replace(".", ",")}%
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-[var(--adm-text-3)] mt-1.5">{hint}</p>}
    </Card>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, hint }: { icon?: React.ComponentType<{ className?: string }>; title: string; hint?: string }) {
  return (
    <div className="adm-grid-bg flex flex-col items-center justify-center text-center py-16 rounded-xl">
      {Icon && (
        <div className="mb-3 grid place-items-center size-12 rounded-full bg-[var(--adm-card-2)] border border-[var(--adm-line)]">
          <Icon className="size-5 text-[var(--adm-text-3)]" />
        </div>
      )}
      <p className="text-sm font-medium text-[var(--adm-text-2)]">{title}</p>
      {hint && <p className="text-xs text-[var(--adm-text-3)] mt-1">{hint}</p>}
    </div>
  );
}

// ── Field (label + value, for detail screens) ────────────────────────────────
export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">{label}</dt>
      <dd className="text-sm text-[var(--adm-text)] mt-1">{children}</dd>
    </div>
  );
}

// ── Stat strip (inline mini metrics) ─────────────────────────────────────────
export function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">{label}</p>
      <p className="text-lg font-semibold adm-num mt-0.5" style={{ color: tone ?? "var(--adm-text)" }}>{value}</p>
    </div>
  );
}
