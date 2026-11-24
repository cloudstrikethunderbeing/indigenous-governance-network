import { sampleDocuments } from "@/data/sampleNation";

/**
 * The Documents app's local library model.
 *
 * The sample Nation's documents carry a title, body and author. The library
 * adds the two things a reader needs to tell records apart — a category and a
 * last-updated date — without changing the shared sample data module. Every
 * value here is illustrative sample data.
 */

/** The three kinds of record a reader can tell apart in the library. */
export type DocumentCategoryKey = "governance" | "knowledge" | "administrative";

export interface DocumentCategory {
  key: DocumentCategoryKey;
  label: string;
  /** One-line explanation of what belongs in this category. */
  description: string;
}

export const documentCategories: DocumentCategory[] = [
  {
    key: "governance",
    label: "Governance records",
    description: "Charters, decisions and the rules the Nation governs by.",
  },
  {
    key: "knowledge",
    label: "Community knowledge",
    description: "Research and cultural material held under community control.",
  },
  {
    key: "administrative",
    label: "Administrative",
    description: "Meeting notes, coordination and day-to-day operations.",
  },
];

/** A document as the library presents it. */
export interface LibraryDocument {
  id: number;
  title: string;
  body: string;
  author: string;
  category: DocumentCategoryKey;
  /** Human-readable last-updated date, illustrative sample data. */
  updated: string;
  /** Whether the record is visible to other Nations, from sample privacy. */
  sharedWithNetwork: boolean;
}

/**
 * Category, date and sharing intent for each sample document, keyed by the
 * sample document id. Kept beside the library so the shared sample data module
 * stays the single source of the title, body and author.
 */
const documentMeta: Record<
  number,
  { category: DocumentCategoryKey; updated: string; sharedWithNetwork: boolean }
> = {
  1: {
    category: "governance",
    updated: "12 Mar 2026",
    sharedWithNetwork: false,
  },
  2: { category: "knowledge", updated: "4 Mar 2026", sharedWithNetwork: false },
  3: {
    category: "administrative",
    updated: "27 Feb 2026",
    sharedWithNetwork: true,
  },
};

/** The full library, in sample order, enriched with category and date. */
export const libraryDocuments: LibraryDocument[] = sampleDocuments.map(
  (document) => {
    const meta = documentMeta[document.id] ?? {
      category: "administrative" as DocumentCategoryKey,
      updated: "—",
      sharedWithNetwork: false,
    };
    return {
      id: document.id,
      title: document.title,
      body: document.body,
      author: document.author,
      category: meta.category,
      updated: meta.updated,
      sharedWithNetwork: meta.sharedWithNetwork,
    };
  },
);

/** The category definition for a key, for labels and descriptions. */
export function categoryFor(key: DocumentCategoryKey): DocumentCategory {
  return (
    documentCategories.find((category) => category.key === key) ??
    documentCategories[0]
  );
}
