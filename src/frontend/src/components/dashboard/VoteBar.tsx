/**
 * A horizontal Yes/No vote bar with counts. The filled portion represents the
 * share of Yes votes. Simulated data only.
 */
export default function VoteBar({
  yes,
  no,
  ocid,
}: {
  yes: number;
  no: number;
  ocid?: string;
}) {
  const total = yes + no;
  const yesPercent = total > 0 ? Math.round((yes / total) * 100) : 0;

  return (
    <div data-ocid={ocid} className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Yes</span>
        <span className="font-medium text-foreground">No</span>
      </div>
      <div
        className="vote-bar"
        role="img"
        aria-label={`${yes} yes votes, ${no} no votes`}
      >
        <div className="vote-bar-yes" style={{ width: `${yesPercent}%` }} />
      </div>
      <div className="flex items-center justify-between text-tabular text-xs text-muted-foreground">
        <span>{yes}</span>
        <span>{no}</span>
      </div>
    </div>
  );
}
