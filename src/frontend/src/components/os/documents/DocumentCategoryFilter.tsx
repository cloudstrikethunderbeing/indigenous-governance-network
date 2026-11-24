import {
  type DocumentCategoryKey,
  documentCategories,
} from "@/components/os/documents/documentLibrary";

/**
 * The category filter for the document library: an "All records" chip plus one
 * chip per category. Chips are at least 44px tall for comfortable tapping.
 */
export default function DocumentCategoryFilter({
  active,
  counts,
  onChange,
}: {
  active: DocumentCategoryKey | "all";
  counts: Record<DocumentCategoryKey | "all", number>;
  onChange: (next: DocumentCategoryKey | "all") => void;
}) {
  const options: { key: DocumentCategoryKey | "all"; label: string }[] = [
    { key: "all", label: "All records" },
    ...documentCategories.map((category) => ({
      key: category.key,
      label: category.label,
    })),
  ];

  return (
    <fieldset
      data-ocid="os.documents.filter"
      aria-label="Filter documents by category"
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const selected = option.key === active;
        return (
          <button
            key={option.key}
            type="button"
            data-ocid={`os.documents.filter.${option.key}`}
            aria-pressed={selected}
            onClick={() => onChange(option.key)}
            className={`os-focus-ring inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-smooth ${
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {option.label}
            <span
              className={`text-tabular text-xs ${
                selected
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              }`}
            >
              {counts[option.key]}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
