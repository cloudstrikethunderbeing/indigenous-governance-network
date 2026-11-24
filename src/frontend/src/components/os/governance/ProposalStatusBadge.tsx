import { NationProposalStatus } from "@/backend";

/** Human-readable label for a proposal status. */
const STATUS_LABELS: Record<NationProposalStatus, string> = {
  [NationProposalStatus.open]: "Open for voting",
  [NationProposalStatus.passed]: "Passed",
  [NationProposalStatus.rejected]: "Rejected",
  [NationProposalStatus.draft]: "Draft",
  [NationProposalStatus.withdrawn]: "Withdrawn",
};

/** Per-status badge styling, using the Term Sheet status tokens. */
const STATUS_CLASSES: Record<NationProposalStatus, string> = {
  [NationProposalStatus.open]:
    "border-accent bg-accent/10 text-accent-foreground",
  [NationProposalStatus.passed]: "border-primary bg-primary/10 text-primary",
  [NationProposalStatus.rejected]:
    "border-border bg-muted text-muted-foreground",
  [NationProposalStatus.draft]: "border-border bg-muted text-muted-foreground",
  [NationProposalStatus.withdrawn]:
    "border-border bg-muted text-muted-foreground",
};

/**
 * A compact status chip for a Nation proposal. The status is carried by the
 * visible label, so the chip is readable without relying on colour alone.
 */
export default function ProposalStatusBadge({
  status,
  className,
}: {
  status: NationProposalStatus;
  className?: string;
}) {
  return (
    <span
      data-ocid={`os.governance.status.${status}`}
      className={`text-stamp inline-flex shrink-0 items-center rounded-sm border px-2 py-1 ${STATUS_CLASSES[status]} ${className ?? ""}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
