import * as React from "react";
import { useNavigate, Link } from "react-router";
import {
  Bell, Search, ChevronDown, LogOut, UserCog,
  LogIn, Wallet, BadgeCheck, AlertTriangle, TrendingUp, RotateCcw, CircleDot, Pin, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "../components/primitives";
import { ENVIRONMENT } from "../lib/constants";
import { useAuth } from "../lib/auth";
import { dashboard } from "../data/mock";
import { ago } from "../lib/format";

const ACT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  signin: LogIn, payout: Wallet, approval: BadgeCheck, dispute: AlertTriangle, tier: TrendingUp, refund: RotateCcw,
};

export function Topbar() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState<"notif" | "user" | null>(null);
  const bellRef = React.useRef<HTMLDivElement>(null);
  const userRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (bellRef.current?.contains(t) || userRef.current?.contains(t)) return;
      setOpen(null);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function signOut() {
    logout();
    nav("/admin/login", { replace: true });
  }

  const first = user.name.split(" ")[0];
  const lastInitial = user.name.split(" ")[1]?.[0];
  const notifCount = dashboard.pinned.length + dashboard.recent.length;

  return (
    <header className="h-14 shrink-0 border-b border-[var(--adm-line)] bg-[var(--adm-canvas)]/80 backdrop-blur flex items-center gap-4 px-6 sticky top-0 z-20">
      {/* Global search */}
      <button className="adm-focus group flex items-center gap-2.5 h-9 w-[360px] max-w-[40vw] rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] px-3 text-sm text-[var(--adm-text-3)] hover:border-[var(--adm-line-strong)] transition-colors">
        <Search className="size-4 shrink-0" />
        <span className="flex-1 min-w-0 truncate text-left">Search coaches, clubs, bookings, payouts…</span>
        <kbd className="hidden sm:inline text-[10px] font-medium text-[var(--adm-text-3)] border border-[var(--adm-line)] rounded px-1.5 py-0.5">⌘K</kbd>
      </button>

      <div className="flex-1" />

      {/* Environment chip */}
      <span
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-semibold"
        style={{
          color: ENVIRONMENT === "Production" ? "var(--st-danger)" : "var(--st-warning)",
          background: ENVIRONMENT === "Production" ? "var(--st-danger-soft)" : "var(--st-warning-soft)",
        }}
        title="You are acting in this environment"
      >
        <span className="size-1.5 rounded-full adm-live-dot" style={{ background: "currentColor" }} />
        {ENVIRONMENT}
      </span>

      {/* Notifications */}
      <div className="relative" ref={bellRef}>
        <button
          onClick={() => setOpen((o) => (o === "notif" ? null : "notif"))}
          className="adm-focus relative grid place-items-center size-9 rounded-lg text-[var(--adm-text-2)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-hover)] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="size-[18px]" />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 grid place-items-center rounded-full bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] text-[10px] font-bold adm-num">
              {notifCount}
            </span>
          )}
        </button>

        {open === "notif" && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-[360px] rounded-xl border border-[var(--adm-line-strong)] bg-[var(--adm-elevated)] shadow-2xl overflow-hidden z-30">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--adm-line)]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--adm-text)]">Notifications</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[var(--st-success)]"><CircleDot className="size-3 adm-live-dot" /> Live</span>
              </div>
              <button
                onClick={() => { toast.success("All caught up"); setOpen(null); }}
                className="text-[11px] text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors"
              >
                Mark all read
              </button>
            </div>

            {/* scrollable feed within the frame */}
            <ul className="max-h-[360px] overflow-y-auto">
              {dashboard.pinned.map((p, i) => (
                <li key={`pinned-${i}`} className="border-b border-[var(--adm-line)] last:border-0">
                  <Link
                    to={p.to}
                    onClick={() => setOpen(null)}
                    className="group flex items-start gap-3 px-4 py-3 bg-[var(--st-danger-soft)] hover:brightness-110 transition"
                  >
                    <span className="grid place-items-center size-7 rounded-lg shrink-0 mt-0.5 bg-[var(--st-danger-soft)] text-[var(--st-danger)]">
                      <Pin className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 text-[13px] text-[var(--adm-text)] leading-snug">{p.text}</span>
                    <ArrowRight className="size-3.5 text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors shrink-0 mt-1" />
                  </Link>
                </li>
              ))}
              {dashboard.recent.map((r, i) => {
                const Icon = ACT_ICON[r.icon] ?? CircleDot;
                const color = r.tone === "coach" ? "var(--persona-coach)" : r.tone === "club" ? "var(--persona-club)" : "var(--adm-text-2)";
                return (
                  <li key={i} className="flex items-start gap-3 px-4 py-3 border-b border-[var(--adm-line)] last:border-0 hover:bg-[var(--adm-hover)] transition-colors">
                    <span className="grid place-items-center size-7 rounded-lg shrink-0 mt-0.5" style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] text-[var(--adm-text-2)] leading-snug">{r.text}</p>
                      <p className="text-[11px] text-[var(--adm-text-3)] mt-0.5 adm-num">{ago(r.at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              to="/admin/access/audit"
              onClick={() => setOpen(null)}
              className="block px-4 py-2.5 text-center text-xs font-medium text-[var(--adm-neon)] border-t border-[var(--adm-line)] hover:bg-[var(--adm-hover)] transition-colors"
            >
              View full audit log
            </Link>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-[var(--adm-line)]" />

      {/* User menu */}
      <div className="relative" ref={userRef}>
        <button
          onClick={() => setOpen((o) => (o === "user" ? null : "user"))}
          className="adm-focus flex items-center gap-2.5 h-9 pl-1 pr-2 rounded-lg hover:bg-[var(--adm-hover)] transition-colors"
        >
          <Avatar name={user.name} size={28} />
          <div className="hidden md:block text-left leading-tight">
            <p className="text-[13px] font-medium text-[var(--adm-text)]">{first} {lastInitial}.</p>
            <p className="text-[10px] text-[var(--adm-neon)]">{user.roleLabel}</p>
          </div>
          <ChevronDown className="size-3.5 text-[var(--adm-text-3)]" />
        </button>

        {open === "user" && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-xl border border-[var(--adm-line-strong)] bg-[var(--adm-elevated)] shadow-2xl overflow-hidden z-30">
            <div className="px-4 py-3 border-b border-[var(--adm-line)]">
              <p className="text-sm font-medium text-[var(--adm-text)]">{user.name}</p>
              <p className="text-xs text-[var(--adm-text-3)]">{user.email}</p>
              <p className="text-[11px] text-[var(--adm-neon)] mt-1">{user.roleLabel}</p>
            </div>
            <button
              onClick={() => { setOpen(null); nav("/admin/access/admins"); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--adm-text-2)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-hover)] transition-colors"
            >
              <UserCog className="size-4" /> Admin users & roles
            </button>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--st-danger)] hover:bg-[var(--st-danger-soft)] transition-colors border-t border-[var(--adm-line)]"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
