import type { LucideIcon } from "lucide-react";

/** Tone of a treasury metric, driving its accent colour. */
export type TreasuryMetricTone = "income" | "expense" | "balance";

const toneClasses: Record<TreasuryMetricTone, string> = {
  income: "text-success",
  expense: "text-foreground",
  balance: "text-primary",
};

/**
 * One headline treasury figure — total income, total expense or the balance —
 * with its label, value and a short plain-language note.
 */
export default function TreasuryMetricCard({
  id,
  label,
  value,
  note,
  icon: Icon,
  tone,
}: {
  id: string;
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
  tone: TreasuryMetricTone;
}) {
  return (
    <div
      data-ocid={`os.treasury.metric.${id}`}
      className="shell-panel flex flex-col gap-2 p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-stamp text-muted-foreground">{label}</span>
        <span
          className={`flex size-8 items-center justify-center rounded-lg bg-muted ${toneClasses[tone]}`}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className={`text-tabular text-2xl font-semibold ${toneClasses[tone]}`}>
        ${value.toLocaleString()}
      </p>
      <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
    </div>
  );
}
