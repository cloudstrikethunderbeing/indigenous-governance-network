/**
 * A small circular avatar chip showing a person's initials. Used across the
 * dashboard's member, application and activity lists. Purely presentational.
 */
export default function AvatarChip({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");

  return (
    <span
      aria-hidden="true"
      className={`avatar-chip shrink-0 ${className ?? ""}`.trim()}
    >
      {initials}
    </span>
  );
}
