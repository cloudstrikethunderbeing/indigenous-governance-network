import { useState } from "react";

import OsAppPage from "@/components/os/OsAppPage";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import DocumentCategoryFilter from "@/components/os/documents/DocumentCategoryFilter";
import DocumentLibrary from "@/components/os/documents/DocumentLibrary";
import DocumentReader from "@/components/os/documents/DocumentReader";
import StoredFilesPanel from "@/components/os/documents/StoredFilesPanel";
import {
  type DocumentCategoryKey,
  documentCategories,
  libraryDocuments,
} from "@/components/os/documents/documentLibrary";

/**
 * The Documents app: a library of the sample Nation's records, grouped so a
 * reader can tell governance records, community knowledge and administrative
 * documents apart, with a reader that renders the full body text. The Nation's
 * stored files are presented alongside the records so the same stored file is
 * reachable from both places.
 */
export default function DocumentsAppPage() {
  const { nationId, readOnly } = useActiveNation();
  const [activeCategory, setActiveCategory] = useState<
    DocumentCategoryKey | "all"
  >("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const counts: Record<DocumentCategoryKey | "all", number> = {
    all: libraryDocuments.length,
    governance: libraryDocuments.filter((d) => d.category === "governance")
      .length,
    knowledge: libraryDocuments.filter((d) => d.category === "knowledge")
      .length,
    administrative: libraryDocuments.filter(
      (d) => d.category === "administrative",
    ).length,
  };

  const visibleDocuments =
    activeCategory === "all"
      ? libraryDocuments
      : libraryDocuments.filter((d) => d.category === activeCategory);

  const selectedDocument =
    libraryDocuments.find((d) => d.id === selectedId) ?? null;

  return (
    <OsAppPage appKey="documents">
      <div className="space-y-5">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Documents</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Shared records
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The Nation's records, grouped so governance records, community
            knowledge and administrative documents are easy to tell apart.
          </p>
          <div className="rule-accent" />
        </header>

        <p
          data-ocid="os.documents.privacy_note"
          className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground"
        >
          <span className="text-stamp shrink-0 text-accent">Privacy</span>
          <span>
            Community-controlled. Each record is private to Nation members
            unless the community chooses to share it with the SOVEREIGN Network.
          </span>
        </p>

        <StoredFilesPanel nation={nationId} readOnly={readOnly} />

        <DocumentCategoryFilter
          active={activeCategory}
          counts={counts}
          onChange={(next) => {
            setActiveCategory(next);
            setSelectedId(null);
          }}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <DocumentLibrary
            documents={visibleDocuments}
            activeCategory={activeCategory}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <div className="lg:sticky lg:top-4 lg:self-start">
            {selectedDocument ? (
              <DocumentReader
                document={selectedDocument}
                nation={nationId}
                readOnly={readOnly}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <div
                data-ocid="os.documents.reader_placeholder"
                className="shell-panel-alt flex flex-col items-center gap-2 px-6 py-12 text-center"
              >
                <p className="font-display text-base font-medium text-foreground">
                  Select a document to read it
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Choose any record from the library to open its full text here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </OsAppPage>
  );
}
