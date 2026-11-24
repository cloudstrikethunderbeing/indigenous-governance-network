import { Lock, Share2 } from "lucide-react";

import {
  type DocumentCategoryKey,
  type LibraryDocument,
  documentCategories,
} from "@/components/os/documents/documentLibrary";

/**
 * The document library: records grouped under their category heading, each row
 * showing title, author and last-updated date. Selecting a row opens the
 * reader. Rows are at least 44px tall and never scroll horizontally.
 */
export default function DocumentLibrary({
  documents,
  activeCategory,
  selectedId,
  onSelect,
}: {
  documents: LibraryDocument[];
  activeCategory: DocumentCategoryKey | "all";
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  const groups = documentCategories
    .filter(
      (category) => activeCategory === "all" || category.key === activeCategory,
    )
    .map((category) => ({
      category,
      items: documents.filter((document) => document.category === category.key),
    }))
    .filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return (
      <div
        data-ocid="os.documents.empty_state"
        className="shell-panel flex flex-col items-center gap-2 px-6 py-12 text-center"
      >
        <p className="font-display text-base font-medium text-foreground">
          No documents in this category
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Choose another category to see the Nation's records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section
          key={group.category.key}
          data-ocid={`os.documents.group.${group.category.key}`}
          aria-labelledby={`documents-group-${group.category.key}`}
          className="space-y-3"
        >
          <div className="space-y-1">
            <h3
              id={`documents-group-${group.category.key}`}
              className="font-display text-base font-medium tracking-tight text-foreground"
            >
              {group.category.label}
            </h3>
            <p className="text-xs text-muted-foreground">
              {group.category.description}
            </p>
          </div>

          <ul data-ocid="os.documents.list" className="space-y-2">
            {group.items.map((document) => {
              const selected = document.id === selectedId;
              return (
                <li key={document.id}>
                  <button
                    type="button"
                    data-ocid={`os.documents.item.${document.id}`}
                    aria-current={selected ? "true" : undefined}
                    onClick={() => onSelect(document.id)}
                    className={`os-focus-ring flex w-full min-h-11 items-start gap-3 rounded-lg border p-4 text-left transition-smooth ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-display text-sm font-medium text-foreground">
                        {document.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {document.author} · Updated {document.updated}
                      </p>
                    </div>
                    <span
                      className="mt-0.5 shrink-0 text-muted-foreground"
                      title={
                        document.sharedWithNetwork
                          ? "Shared with the SOVEREIGN Network"
                          : "Private to Nation members"
                      }
                    >
                      {document.sharedWithNetwork ? (
                        <Share2 className="size-4" aria-hidden="true" />
                      ) : (
                        <Lock className="size-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {document.sharedWithNetwork
                          ? "Shared with the SOVEREIGN Network"
                          : "Private to Nation members"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
