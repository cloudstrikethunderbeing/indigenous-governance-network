import { Paperclip } from "lucide-react";
import { useMemo } from "react";

import type { NationProposal } from "@/backend";
import RecordAttachments from "@/components/os/attachments/RecordAttachments";
import { proposalTarget } from "@/components/os/attachments/attachmentTargets";
import { sampleAttachmentsFor } from "@/components/os/attachments/sampleAttachments";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import { useNationProposals } from "@/hooks/useSovereign";

/**
 * The proposal file-attachment surface shown inside the Our Rules section.
 *
 * The Governance area opens on Our Rules, so the proposal view — and with it
 * the attach control — must be reachable from here without first switching to
 * the Decisions section. This panel resolves the organization's active
 * proposal and renders the shared attachments surface for it, so a stored file
 * can be attached to a governance proposal from the proposal view.
 *
 * It is the same shared `RecordAttachments` surface the Decisions section uses,
 * so both views reference the same stored files and the same attach control.
 */
export default function ProposalAttachmentsPanel() {
  const { nationId, readOnly } = useActiveNation();
  const proposalsQuery = useNationProposals(nationId);

  const activeProposal = useMemo<NationProposal | null>(() => {
    const proposals = proposalsQuery.data ?? [];
    return proposals[0] ?? null;
  }, [proposalsQuery.data]);

  if (proposalsQuery.isLoading) {
    return (
      <div
        data-ocid="os.governance.rules.proposal_attachments_loading"
        aria-busy="true"
        className="shell-panel h-24 animate-pulse bg-muted/40"
      />
    );
  }

  if (!activeProposal) {
    return (
      <section
        data-ocid="os.governance.rules.proposal_attachments_empty_state"
        aria-label="Proposal attachments"
        className="shell-panel space-y-2 p-5"
      >
        <p className="font-display text-base font-medium text-foreground">
          No proposal to attach files to yet
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Once your organization has a proposal, you can attach a stored file to
          it from here.
        </p>
      </section>
    );
  }

  const target = proposalTarget(activeProposal.id);

  return (
    <section
      data-ocid="os.governance.rules.proposal_attachments"
      aria-label="Proposal attachments"
      className="shell-panel space-y-3 p-5"
    >
      <header className="space-y-1">
        <p className="text-stamp text-accent">Proposal files</p>
        <h3 className="flex items-center gap-2 font-display text-lg font-medium tracking-tight text-foreground">
          <Paperclip
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          Files attached to a proposal
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Attach an existing stored file to the proposal your community is
          deciding on. The same file stays reachable from the Decisions section.
        </p>
      </header>

      <RecordAttachments
        nation={nationId}
        target={target}
        readOnly={readOnly}
        sampleAttachments={sampleAttachmentsFor(target)}
      />
    </section>
  );
}
