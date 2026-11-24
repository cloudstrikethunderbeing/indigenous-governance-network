import { Check, ShieldCheck, UserCheck } from "lucide-react";

import { foundingAuthority } from "@/components/os/constitution-demo/demoScenarios";

/**
 * Step 1 — Founding authority setup and three-member approval.
 *
 * A fictional founding council sets the first rules; three members must approve
 * before the constitution takes effect. The visitor can approve the outstanding
 * member to see the founding window close. Nothing is saved.
 */
export default function FoundingAuthorityStep({
  approvedCount,
  onApprove,
}: {
  approvedCount: number;
  onApprove: () => void;
}) {
  const total = foundingAuthority.approvals.length;
  const complete = approvedCount >= total;
  const percent = Math.round((approvedCount / total) * 100);

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-stamp text-accent">Step 1 · Founding authority</p>
        <h3 className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">
          Who sets up the organization
        </h3>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {foundingAuthority.windowNote}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section
          data-ocid="constitution_demo.founding.authority"
          aria-label="Founding authority"
          className="gov-constitution space-y-3 p-5"
        >
          <span className="gov-seal flex size-12 items-center justify-center rounded-full">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-stamp text-muted-foreground">
              {foundingAuthority.authorityLabel}
            </p>
            <p className="font-display text-lg font-medium text-foreground">
              {foundingAuthority.authorityName}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sets the first rules, then hands authority to the community.
            </p>
          </div>
        </section>

        <section
          data-ocid="constitution_demo.founding.approvals"
          aria-label="Member approvals"
          className="shell-panel space-y-3 p-5"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-stamp text-accent">Member approvals</p>
            <span className="text-tabular text-sm font-semibold text-foreground">
              {approvedCount} of {total}
            </span>
          </div>
          <div className="gov-progress-track" aria-hidden="true">
            <div
              className="gov-progress-fill"
              style={{ width: `${percent}%` }}
            />
          </div>
          <ul className="space-y-2">
            {foundingAuthority.approvals.map((approval, index) => {
              const approved = index < approvedCount;
              return (
                <li
                  key={approval.member}
                  data-ocid={`constitution_demo.founding.member.${index + 1}`}
                  className="flex items-center gap-3"
                >
                  <span
                    aria-hidden="true"
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
                      approved
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {approved ? (
                      <Check className="size-4" />
                    ) : (
                      <UserCheck className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {approval.member}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {approval.role}
                    </span>
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      approved
                        ? "gov-permission-granted"
                        : "text-muted-foreground"
                    }`}
                  >
                    {approved ? "Approved" : "Waiting"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="space-y-3">
        {complete ? (
          <output
            data-ocid="constitution_demo.founding.complete"
            className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-foreground"
          >
            <Check className="size-4 text-primary" aria-hidden="true" />
            All three members approved. The founding window is closed and the
            constitution is in effect. This is a demonstration — nothing was
            saved.
          </output>
        ) : (
          <button
            type="button"
            data-ocid="constitution_demo.founding.approve_button"
            onClick={onApprove}
            className="os-focus-ring inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 sm:w-auto"
          >
            <UserCheck className="size-4" aria-hidden="true" />
            Approve as the next member
          </button>
        )}
      </div>
    </div>
  );
}
