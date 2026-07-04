import { NavLink } from "react-router";
import { cn } from "@/app/components/ui/utils";
import { NAV } from "../lib/nav";
import { badgeCounts } from "../data/mock";

export function Sidebar() {
  return (
    <aside className="w-[244px] shrink-0 h-full bg-[var(--adm-sidebar)] border-r border-[var(--adm-line)] flex flex-col">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center size-9 rounded-xl bg-[var(--adm-neon)] shrink-0">
            <span className="adm-wordmark text-[var(--adm-neon-ink)] text-xl leading-none mt-0.5">V</span>
          </div>
          <div className="leading-tight">
            <p className="adm-wordmark text-[var(--adm-neon)] text-xl leading-none">VALUR</p>
            <p className="text-[var(--adm-text-3)] text-[10px] font-medium uppercase tracking-[0.14em] mt-1">
              Operations Console
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {NAV.map((group) => {
          const Icon = group.icon;
          const single = group.items.length === 1;

          if (single) {
            const item = group.items[0];
            return (
              <NavLink key={group.id} to={item.to} end={item.end} className="block">
                {({ isActive }) => <Row icon={Icon} label={group.label} active={isActive} badge={item.badge} />}
              </NavLink>
            );
          }

          return (
            <div key={group.id}>
              <div className="flex items-center gap-2.5 px-3 mb-1.5">
                <Icon className="size-4 text-[var(--adm-text-3)]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--adm-text-3)]">
                  {group.label}
                </span>
              </div>
              <div className="space-y-0.5 pl-3.5 ml-2 border-l border-[var(--adm-line)]">
                {group.items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className="block">
                    {({ isActive }) => <SubRow label={item.label} active={isActive} badge={item.badge} />}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function Row({ icon: Icon, label, active, badge }: { icon: React.ComponentType<{ className?: string }>; label: string; active: boolean; badge?: keyof typeof badgeCounts }) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-2.5 h-9 px-3 rounded-lg text-sm font-medium transition-colors",
        active ? "bg-[var(--adm-neon-soft)] text-[var(--adm-neon)]" : "text-[var(--adm-text-2)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-hover)]"
      )}
    >
      {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--adm-neon)]" />}
      <Icon className="size-4" />
      <span className="flex-1">{label}</span>
      {badge && <Badge n={badgeCounts[badge]} active={active} />}
    </div>
  );
}

function SubRow({ label, active, badge }: { label: string; active: boolean; badge?: keyof typeof badgeCounts }) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 h-8 px-3 rounded-lg text-[13px] transition-colors",
        active ? "text-[var(--adm-neon)] font-medium" : "text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
      )}
    >
      {active && <span className="absolute -left-[15px] top-1.5 bottom-1.5 w-[2px] rounded-full bg-[var(--adm-neon)]" />}
      <span className="flex-1">{label}</span>
      {badge && <Badge n={badgeCounts[badge]} active={active} />}
    </div>
  );
}

function Badge({ n, active }: { n: number; active: boolean }) {
  if (!n) return null;
  return (
    <span
      className={cn(
        "adm-num min-w-5 h-5 px-1.5 grid place-items-center rounded-full text-[11px] font-semibold",
        active ? "bg-[var(--adm-neon)] text-[var(--adm-neon-ink)]" : "bg-[var(--adm-card-2)] text-[var(--adm-text-2)]"
      )}
    >
      {n}
    </span>
  );
}
