// Iceland-first formatting helpers (KAD-07: ISK currency, VSK 24% VAT)

const iskFmt = new Intl.NumberFormat("is-IS", {
  style: "currency",
  currency: "ISK",
  maximumFractionDigits: 0,
});

const numFmt = new Intl.NumberFormat("is-IS", { maximumFractionDigits: 0 });

/** Format an ISK amount, e.g. 1234567 -> "1.234.567 kr." */
export function isk(amount: number): string {
  return iskFmt.format(Math.round(amount));
}

/** Compact ISK for chart axes / tiles, e.g. 1_250_000 -> "1,3M kr." */
export function iskCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(".", ",")}M kr.`;
  if (abs >= 1_000) return `${Math.round(amount / 1_000)}K kr.`;
  return `${numFmt.format(amount)} kr.`;
}

export function num(n: number): string {
  return numFmt.format(n);
}

export function pct(n: number, digits = 0): string {
  return `${n.toFixed(digits).replace(".", ",")}%`;
}

/** Platform take rate (KAD: 20% fee) */
export const PLATFORM_FEE = 0.2;
/** Icelandic standard VAT (VSK) */
export const VSK_STANDARD = 0.24;
/** Reduced VSK rate (e.g. certain services) */
export const VSK_REDUCED = 0.11;

export function platformFee(gross: number): number {
  return Math.round(gross * PLATFORM_FEE);
}
export function netPayout(gross: number): number {
  return gross - platformFee(gross);
}
export function vsk(net: number, rate: number = VSK_STANDARD): number {
  return Math.round(net * rate);
}

/** Mask a bank/payout account: "0133-26-001234" -> "••••-••-001234" */
export function maskAccount(acct: string): string {
  const tail = acct.slice(-6);
  return `••••-••-${tail.replace(/\D/g, "").slice(-6)}`;
}

const dtFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function date(d: Date | string): string {
  return dtFmt.format(typeof d === "string" ? new Date(d) : d);
}
export function dateTime(d: Date | string): string {
  const dd = typeof d === "string" ? new Date(d) : d;
  return `${dtFmt.format(dd)} · ${timeFmt.format(dd)}`;
}

/** Relative "time ago" from an ISO string or Date, e.g. "3h ago", "2d ago". */
export function ago(d: Date | string, now: Date = new Date("2026-06-29T10:00:00Z")): string {
  const then = typeof d === "string" ? new Date(d) : d;
  const ms = now.getTime() - then.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/** Hours a queue item has been waiting (for SLA pills). */
export function waitHours(d: Date | string, now: Date = new Date("2026-06-29T10:00:00Z")): number {
  const then = typeof d === "string" ? new Date(d) : d;
  return Math.floor((now.getTime() - then.getTime()) / 3_600_000);
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
