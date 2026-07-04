// Shared domain constants for the Valur Admin Console (from the IA + KADs)

export type Persona = "coach" | "player" | "club" | "system";

export const PERSONA: Record<
  Persona,
  { label: string; color: string; soft: string; line: string }
> = {
  coach: { label: "Coach", color: "var(--persona-coach)", soft: "var(--persona-coach-soft)", line: "var(--persona-coach-line)" },
  player: { label: "Player", color: "var(--persona-player)", soft: "var(--persona-player-soft)", line: "var(--persona-player-line)" },
  club: { label: "Club", color: "var(--persona-club)", soft: "var(--persona-club-soft)", line: "var(--persona-club-line)" },
  system: { label: "System", color: "var(--persona-system)", soft: "var(--persona-system-soft)", line: "var(--persona-system-line)" },
};

// KAD-09: six least-privilege roles
export const ROLES = [
  { key: "super", label: "Super Admin", desc: "Full control; only role that can invite admins, change roles, edit config." },
  { key: "ops", label: "Operations", desc: "Approvals + bookings. The day-to-day gatekeeper." },
  { key: "finance", label: "Finance", desc: "Payout release + invoicing + disputes." },
  { key: "support", label: "Support", desc: "Tickets queue; read access to users + bookings." },
  { key: "content", label: "Content Moderator", desc: "Lectures, taxonomy, player video review." },
  { key: "analyst", label: "Read-only Analyst", desc: "Read everything; change nothing. Audit-log read." },
] as const;
export type RoleKey = (typeof ROLES)[number]["key"];

// KAD-08: configurable tier ladders per persona
export const TIERS = {
  coach: ["Grassroots", "Local", "Pro", "Marquee"],
  player: ["Beginner", "Intermediate", "Advanced"],
  club: ["Junior", "Senior", "Academy"],
} as const;

export const SESSION_TYPES = ["F2F", "Online", "Hybrid"] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

// status -> visual token mapping used by <StatusPill>
export const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  // generic lifecycle
  Active: "success",
  Approved: "success",
  Released: "success",
  Paid: "success",
  Verified: "success",
  Resolved: "success",
  Completed: "success",
  Live: "success",

  Issued: "info",

  Pending: "warning",
  Applied: "warning",
  "In Review": "warning",
  "Awaiting info": "warning",
  "Awaiting release": "warning",
  Holding: "warning",
  Held: "info",
  Upcoming: "warning",
  Draft: "warning",
  Open: "warning",
  New: "warning",
  Waiting: "warning",
  "Re-submission requested": "warning",

  Rejected: "danger",
  Blocked: "danger",
  Disputed: "danger",
  Suspended: "danger",
  Cancelled: "danger",
  Breach: "danger",

  Escalated: "info",
  "Not started": "neutral",
  Closed: "neutral",
  Inactive: "neutral",
  Superseded: "neutral",
  Declined: "neutral",
};

// 11 Key Admin Decisions - referenced as chips on the relevant screens
export const KAD: Record<string, string> = {
  "KAD-01": "Manual approval gate - every coach & club human-approved before they act.",
  "KAD-02": "Two approval levels - L1 onboarding, L2 tier-upgrade, separate queues.",
  "KAD-03": "One decision set - Approve / Reject (reason) / Request info, all logged.",
  "KAD-04": "Downstream coverage - approval covers content + packages; trust decided once.",
  "KAD-05": "Approval-gated payouts - funds held, released only on admin approval.",
  "KAD-06": "Hybrid dual-payout - one charge in, two payouts out, each net of 20% fee.",
  "KAD-07": "Iceland-first finance - ISK, VAT (VSK 24%), card + bank rails.",
  "KAD-08": "Configurable tier criteria - editable rubric the platform owns.",
  "KAD-09": "Role-based access - six least-privilege roles + permissions matrix + audit.",
  "KAD-10": "Native ticketing - lightweight in-console queue, integration-ready.",
  "KAD-11": "Desktop-web console - dense tables, side-by-side review, keyboard-driven.",
};

export const ENVIRONMENT: "Production" | "Staging" = "Staging";

// The signed-in operator (mock session) - drives role-scoped UI
export const CURRENT_ADMIN = {
  name: "Sigrún Halldórsdóttir",
  email: "sigrun@valur.is",
  role: "super" as RoleKey,
  roleLabel: "Super Admin",
};
