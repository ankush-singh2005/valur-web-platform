import * as React from "react";
import { cn } from "@/app/components/ui/utils";
import { Search, X, ChevronDown } from "lucide-react";

// ── Toolbar: left cluster + right cluster ────────────────────────────────────
export function Toolbar({ left, right, className }: { left?: React.ReactNode; right?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">{left}</div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}

// ── SearchInput ───────────────────────────────────────────────────────────────
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--adm-text-3)] pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="adm-focus h-9 w-full rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] pl-9 pr-8 text-sm text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] focus:border-[var(--adm-neon-line)] transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--adm-text-3)] hover:text-[var(--adm-text)]"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Segmented toggle (period / list-calendar / sub-tabs) ──────────────────────
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-0.5 rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] p-0.5", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "px-3 h-7 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
              active ? "bg-[var(--adm-neon)] text-[var(--adm-neon-ink)]" : "text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Filter chip ───────────────────────────────────────────────────────────────
export function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border transition-colors",
        active
          ? "border-[var(--adm-neon-line)] bg-[var(--adm-neon-soft)] text-[var(--adm-neon)]"
          : "border-[var(--adm-line)] text-[var(--adm-text-2)] hover:text-[var(--adm-text)] hover:border-[var(--adm-line-strong)]"
      )}
    >
      {children}
      {count !== undefined && <span className="adm-num opacity-70">{count}</span>}
    </button>
  );
}

// ── Select (native, styled) ───────────────────────────────────────────────────
export function MiniSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("relative inline-block", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="adm-focus h-9 w-full appearance-none rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] pl-4 pr-10 text-sm text-[var(--adm-text)] cursor-pointer hover:border-[var(--adm-line-strong)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[var(--adm-elevated)]">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[var(--adm-text-3)]" />
    </div>
  );
}
