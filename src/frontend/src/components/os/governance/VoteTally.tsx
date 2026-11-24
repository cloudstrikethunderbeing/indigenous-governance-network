/**
 * A proposal vote tally: a proportional bar plus the three counts. The bar is
 * decorative (the counts carry the meaning), so it is hidden from assistive
 * technology and the numbers are always rendered as text.
 */
export default function VoteTally({
  votesInFavor,
  votesAgainst,
  votesAbstain,
  size = "compact",
}: {
  votesInFavor: bigint;
  votesAgainst: bigint;
  votesAbstain: bigint;
  size?: "compact" | "large";
}) {
  const total = votesInFavor + votesAgainst + votesAbstain;
  const yesPercent = total > 0n ? Number((votesInFavor * 100n) / total) : 0;
  const noPercent = total > 0n ? Number((votesAgainst * 100n) / total) : 0;

  return (
    <div className="space-y-2">
      <div
        aria-hidden="true"
        className={`flex w-full overflow-hidden rounded-sm bg-muted ${
          size === "large" ? "h-2.5" : "h-1.5"
        }`}
      >
        <span
          className="h-full bg-[oklch(var(--vote-yes))]"
          style={{ width: `${yesPercent}%` }}
        />
        <span
          className="h-full bg-[oklch(var(--vote-no))]"
          style={{ width: `${noPercent}%` }}
        />
      </div>
      <dl
        className={`grid grid-cols-3 gap-2 ${
          size === "large" ? "text-sm" : "text-xs"
        }`}
      >
        <div className="min-w-0">
          <dt className="text-stamp text-muted-foreground">In favour</dt>
          <dd className="text-tabular font-semibold text-foreground">
            {votesInFavor.toString()}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-stamp text-muted-foreground">Against</dt>
          <dd className="text-tabular font-semibold text-foreground">
            {votesAgainst.toString()}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-stamp text-muted-foreground">Abstain</dt>
          <dd className="text-tabular font-semibold text-foreground">
            {votesAbstain.toString()}
          </dd>
        </div>
      </dl>
    </div>
  );
}
