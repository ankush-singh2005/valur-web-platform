import * as React from "react";
import { cn } from "@/app/components/ui/utils";
import { X, ChevronLeft } from "lucide-react";

/**
 * SaaS-style slide-over tray. Slides in from the right as an overlay (with a
 * scrim), and its body scrolls within the frame - so opening a detail never
 * reflows or shrinks the table behind it.
 */
export function SideTray({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 460,
  onBack,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  width?: number;
  /** When set, shows a back chevron before the title - for trays with a list ↔ detail drill-down. */
  onBack?: () => void;
}) {
  // close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* scrim */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      {/* panel */}
      <aside
        role="dialog"
        aria-modal="true"
        style={{ width }}
        className={cn(
          "fixed top-0 right-0 z-50 h-full max-w-[92vw] bg-[var(--adm-surface)] border-l border-[var(--adm-line-strong)] shadow-2xl flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--adm-line)] shrink-0">
          <div className="min-w-0 flex items-start gap-2">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back"
                className="grid place-items-center size-7 rounded-lg text-[var(--adm-text-3)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-hover)] transition-colors shrink-0 -ml-1"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-sm font-semibold text-[var(--adm-text)] truncate">{title}</h3>}
              {subtitle && <p className="text-xs text-[var(--adm-text-3)] mt-0.5 line-clamp-2">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center size-8 rounded-lg text-[var(--adm-text-3)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-hover)] transition-colors shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{open ? children : null}</div>
      </aside>
    </>
  );
}
