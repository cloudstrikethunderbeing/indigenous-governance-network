import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import type { PreviewModule } from "./previewModules";

type ModuleDetailProps = {
  module: PreviewModule;
  onClose: () => void;
};

/**
 * A concise explanation of one ecosystem module, shown in a bottom sheet on
 * mobile and a centred card on larger screens. Escape and backdrop close it,
 * and focus moves to the close control on open.
 */
export default function ModuleDetail({ module, onClose }: ModuleDetailProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const Icon = module.icon;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const glyphTone =
    module.tone === "violet"
      ? "cosmos-node-glyph-violet"
      : module.tone === "gold"
        ? "cosmos-node-glyph-gold"
        : "";

  return (
    <div
      data-ocid="dao_preview.module_dialog"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Close module details"
        data-ocid="dao_preview.module_dialog.backdrop"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[oklch(var(--cosmos-ground-deep)/0.72)] backdrop-blur-sm"
      />
      <dialog
        open
        aria-modal="true"
        aria-labelledby="dao-preview-module-title"
        className="cosmos-panel cosmos-reveal relative m-0 w-full max-w-md rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:rounded-3xl sm:pb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`cosmos-node-glyph ${glyphTone}`}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2
                id="dao-preview-module-title"
                className="font-display text-xl leading-tight text-[oklch(var(--cosmos-foreground))]"
              >
                {module.name}
              </h2>
              <span
                className={`cosmos-chip mt-1 ${
                  module.status === "live"
                    ? "cosmos-chip-live"
                    : "cosmos-chip-future"
                }`}
              >
                {module.status === "live"
                  ? "Implemented today"
                  : "Future phase"}
              </span>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-ocid="dao_preview.module_dialog.close_button"
            className="cosmos-focus -mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-full text-[oklch(var(--cosmos-muted))] transition-colors hover:text-[oklch(var(--cosmos-foreground))]"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-sm font-medium text-[oklch(var(--cosmos-foreground))]">
          {module.summary}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[oklch(var(--cosmos-muted))]">
          {module.detail}
        </p>
      </dialog>
    </div>
  );
}
