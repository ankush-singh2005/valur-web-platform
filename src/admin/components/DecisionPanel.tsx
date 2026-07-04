import * as React from "react";
import { Check, X, MessageSquare, ShieldQuestion } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";
import { SectionCard } from "./primitives";

type Mode = "approve" | "reject" | "info" | null;

export function DecisionPanel({
  subject,
  tierOptions,
  currentTier,
  approveLabel = "Approve",
  note = "Decision + reason is written to the Decision Log and Audit Log.",
}: {
  subject: string;
  tierOptions?: string[];
  currentTier?: string;
  approveLabel?: string;
  note?: string;
}) {
  const [mode, setMode] = React.useState<Mode>(null);
  const [reason, setReason] = React.useState("");
  const [internal, setInternal] = React.useState("");
  const [tier, setTier] = React.useState(currentTier ?? tierOptions?.[0] ?? "");

  function submit() {
    if (!mode) return;
    if ((mode === "reject" || mode === "info") && reason.trim().length < 4) {
      toast.error("A reason is required", { description: "Rejections and info requests must be reason-stamped." });
      return;
    }
    const verb = mode === "approve" ? "Approved" : mode === "reject" ? "Rejected" : "Info requested for";
    toast.success(`${verb} ${subject}`, {
      description:
        mode === "approve"
          ? `${tierOptions ? `Tier set to ${tier}. ` : ""}Written to Decision Log + Audit Log.`
          : `Reason recorded. Written to Decision Log + Audit Log.`,
    });
    setMode(null);
    setReason("");
    setInternal("");
  }

  return (
    <SectionCard title="Decision" subtitle="One decision set · Approve · Reject · Request info">
      <div className="grid grid-cols-3 gap-2">
        <DecisionButton tone="approve" active={mode === "approve"} onClick={() => setMode("approve")} icon={Check} label={approveLabel} />
        <DecisionButton tone="info" active={mode === "info"} onClick={() => setMode("info")} icon={MessageSquare} label="Request info" />
        <DecisionButton tone="reject" active={mode === "reject"} onClick={() => setMode("reject")} icon={X} label="Reject" />
      </div>

      {mode === "approve" && tierOptions && (
        <div className="mt-4">
          <label className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium flex items-center gap-1.5">
            <ShieldQuestion className="size-3.5" /> Confirm / adjust tier against criteria
          </label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tierOptions.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-medium border transition-colors",
                  t === tier ? "border-[var(--adm-neon-line)] bg-[var(--adm-neon-soft)] text-[var(--adm-neon)]" : "border-[var(--adm-line)] text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {(mode === "reject" || mode === "info") && (
        <div className="mt-4">
          <label className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">
            {mode === "reject" ? "Reason for rejection (required, shown to applicant)" : "Message to applicant (required)"}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={mode === "reject" ? "Explain why this application is rejected…" : "Tell the applicant what else you need…"}
            className="adm-focus mt-2 w-full rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] px-3 py-2 text-sm text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] focus:border-[var(--adm-neon-line)] resize-none"
          />
        </div>
      )}

      {mode && (
        <div className="mt-4">
          <label className="text-[11px] uppercase tracking-wide text-[var(--adm-text-3)] font-medium">Internal note (not shown to applicant)</label>
          <textarea
            value={internal}
            onChange={(e) => setInternal(e.target.value)}
            rows={2}
            placeholder="Optional internal context…"
            className="adm-focus mt-2 w-full rounded-lg bg-[var(--adm-card-2)] border border-[var(--adm-line)] px-3 py-2 text-sm text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] focus:border-[var(--adm-neon-line)] resize-none"
          />
        </div>
      )}

      {mode && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={() => setMode(null)} className="h-9 px-4 rounded-lg text-sm text-[var(--adm-text-2)] hover:text-[var(--adm-text)] transition-colors">
            Cancel
          </button>
          <button
            onClick={submit}
            className={cn(
              "h-9 px-5 rounded-lg text-sm font-semibold transition-colors",
              mode === "approve" && "bg-[var(--adm-neon)] text-[var(--adm-neon-ink)] hover:brightness-110",
              mode === "reject" && "bg-[var(--st-danger)] text-white hover:brightness-110",
              mode === "info" && "bg-[var(--adm-card-2)] text-[var(--adm-text)] border border-[var(--adm-line-strong)] hover:bg-[var(--adm-elevated)]"
            )}
          >
            Confirm {mode === "approve" ? approveLabel.toLowerCase() : mode === "reject" ? "rejection" : "request"}
          </button>
        </div>
      )}

      <p className="text-[11px] text-[var(--adm-text-3)] mt-4 leading-relaxed">{note}</p>
    </SectionCard>
  );
}

function DecisionButton({
  tone,
  active,
  onClick,
  icon: Icon,
  label,
}: {
  tone: "approve" | "reject" | "info";
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  const color = tone === "approve" ? "var(--st-success)" : tone === "reject" ? "var(--st-danger)" : "var(--st-info)";
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-lg border py-3 transition-all",
        active ? "bg-[var(--adm-card-2)]" : "border-[var(--adm-line)] hover:bg-[var(--adm-hover)]"
      )}
      style={active ? { borderColor: color, boxShadow: `inset 0 0 0 1px ${color}` } : undefined}
    >
      <Icon className="size-4" />
      <span className="text-xs font-medium text-[var(--adm-text)]">{label}</span>
    </button>
  );
}
