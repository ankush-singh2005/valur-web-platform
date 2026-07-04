import * as React from "react";
import { cn } from "@/app/components/ui/utils";
import { Link } from "react-router";
import { ChevronRight, ArrowLeft } from "lucide-react";

export type Crumb = { label: string; to?: string };

export function PageHeader({
  title,
  description,
  crumbs,
  back,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  back?: { to: string; label: string };
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {crumbs && crumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[var(--adm-text-3)] mb-3">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {c.to ? (
                <Link to={c.to} className="hover:text-[var(--adm-text-2)] transition-colors">{c.label}</Link>
              ) : (
                <span className="text-[var(--adm-text-2)]">{c.label}</span>
              )}
              {i < crumbs.length - 1 && <ChevronRight className="size-3" />}
            </React.Fragment>
          ))}
        </nav>
      )}
      {back && (
        <Link to={back.to} className="inline-flex items-center gap-1.5 text-xs text-[var(--adm-text-3)] hover:text-[var(--adm-text-2)] transition-colors mb-3">
          <ArrowLeft className="size-3.5" /> {back.label}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-[var(--adm-text)] tracking-tight truncate">{title}</h1>
          {description && <p className="text-sm text-[var(--adm-text-3)] mt-1.5 max-w-2xl leading-relaxed">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
