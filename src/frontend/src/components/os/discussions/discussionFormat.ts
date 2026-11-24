/**
 * Formatting helpers for the Discussions app. Backend timestamps are
 * nanosecond bigints and authors are Internet Computer principals, so both are
 * converted here before they reach the UI.
 */

/** A principal-like value as returned by the generated backend bindings. */
interface PrincipalLike {
  toText(): string;
}

/** Convert a nanosecond backend timestamp to a Date, or null when invalid. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** A short, readable label for a principal author. */
export function formatAuthor(author: PrincipalLike): string {
  const text = author.toText();
  if (text.length <= 12) return text;
  return `${text.slice(0, 5)}…${text.slice(-4)}`;
}

/** A short absolute date, e.g. "Apr 11, 2026". */
export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** A relative "last activity" label, e.g. "3 days ago". */
export function formatRelativeActivity(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }
  return formatDate(timestamp);
}
