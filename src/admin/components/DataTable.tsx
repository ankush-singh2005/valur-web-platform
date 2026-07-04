import * as React from "react";
import { cn } from "@/app/components/ui/utils";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string | number;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  width?: string | number;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectable,
  selected,
  onSelectedChange,
  empty,
  initialSort,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selected?: Set<string>;
  onSelectedChange?: (s: Set<string>) => void;
  empty?: React.ReactNode;
  initialSort?: { key: string; dir: "asc" | "desc" };
  className?: string;
}) {
  const [sort, setSort] = React.useState(initialSort);

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.accessor) return rows;
    const acc = col.accessor;
    return [...rows].sort((a, b) => {
      const av = acc(a), bv = acc(b);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sort, columns]);

  function toggleSort(key: string) {
    setSort((s) =>
      s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  }

  const allKeys = sorted.map(rowKey);
  const allSelected = selectable && selected && allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  function toggleAll() {
    if (!onSelectedChange) return;
    onSelectedChange(allSelected ? new Set() : new Set(allKeys));
  }
  function toggleOne(k: string) {
    if (!onSelectedChange || !selected) return;
    const next = new Set(selected);
    next.has(k) ? next.delete(k) : next.add(k);
    onSelectedChange(next);
  }

  const align = (a?: string) => (a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left");

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-[var(--adm-line)] bg-[var(--adm-card)]", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[var(--adm-line)] bg-[var(--adm-card-2)]">
            {selectable && (
              <th className="w-10 px-4 py-3">
                <Check checked={!!allSelected} onChange={toggleAll} />
              </th>
            )}
            {columns.map((c) => (
              <th
                key={c.key}
                style={{ width: c.width }}
                className={cn("px-4 py-3 text-[14px] uppercase tracking-wide font-semibold text-[var(--adm-text-3)] whitespace-nowrap", align(c.align))}
              >
                {c.sortable ? (
                  <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 uppercase text-[14px] font-semibold hover:text-[var(--adm-text)] transition-colors">
                    {c.header}
                    {sort?.key === c.key ? (
                      sort.dir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                    ) : (
                      <ChevronsUpDown className="size-3 opacity-40" />
                    )}
                  </button>
                ) : (
                  c.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-[var(--adm-text-3)] text-sm">
                {empty ?? "Nothing here."}
              </td>
            </tr>
          )}
          {sorted.map((row) => {
            const k = rowKey(row);
            const isSel = selectable && selected?.has(k);
            return (
              <tr
                key={k}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "adm-table-row border-b border-[var(--adm-line)] last:border-0",
                  onRowClick && "cursor-pointer",
                  isSel && "bg-[var(--adm-neon-soft)]"
                )}
              >
                {selectable && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Check checked={!!isSel} onChange={() => toggleOne(k)} />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 text-[var(--adm-text-2)] align-middle", align(c.align), c.className)}>
                    {c.render ? c.render(row) : (row as Record<string, React.ReactNode>)[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Check({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "size-4 rounded grid place-items-center border transition-colors",
        checked ? "bg-[var(--adm-neon)] border-[var(--adm-neon)]" : "border-[var(--adm-line-strong)] hover:border-[var(--adm-text-3)]"
      )}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="var(--adm-neon-ink)" strokeWidth="2.4">
          <path d="M2.5 6.2l2.2 2.3L9.5 3.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
