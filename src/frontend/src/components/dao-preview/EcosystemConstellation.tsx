import { Orbit } from "lucide-react";
import { useCallback, useState } from "react";

import ModuleDetail from "./ModuleDetail";
import { PREVIEW_MODULES, type PreviewModule } from "./previewModules";
import { useMounted } from "./usePreviewMotion";

/**
 * The animated sovereign governance ecosystem: a central DAO symbol with eight
 * connected modules revealed in sequence. Each module is a real button that
 * opens a concise explanation and states whether it is implemented today or a
 * future phase.
 */
export default function EcosystemConstellation() {
  const mounted = useMounted();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = PREVIEW_MODULES.find((item) => item.id === activeId) ?? null;

  const close = useCallback(() => setActiveId(null), []);

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
        {/* Connector lines from the core to each module */}
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="absolute inset-0 size-full"
        >
          {PREVIEW_MODULES.map((module, index) => (
            <line
              key={module.id}
              x1="50"
              y1="50"
              x2={module.x}
              y2={module.y}
              className="cosmos-link-line"
              style={{
                opacity: mounted ? 1 : 0,
                transition: `opacity 600ms ease ${index * 90}ms`,
              }}
            />
          ))}
        </svg>

        {/* Central DAO symbol */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="cosmos-core">
            <span className="cosmos-core-ring" aria-hidden="true" />
            <Orbit className="size-9" aria-hidden="true" />
          </div>
        </div>

        {/* Module nodes */}
        {PREVIEW_MODULES.map((module, index) => (
          <ModuleNode
            key={module.id}
            module={module}
            index={index}
            mounted={mounted}
            onOpen={() => setActiveId(module.id)}
          />
        ))}
      </div>

      {active ? <ModuleDetail module={active} onClose={close} /> : null}
    </div>
  );
}

type ModuleNodeProps = {
  module: PreviewModule;
  index: number;
  mounted: boolean;
  onOpen: () => void;
};

function ModuleNode({ module, index, mounted, onOpen }: ModuleNodeProps) {
  const Icon = module.icon;
  const glyphTone =
    module.tone === "violet"
      ? "cosmos-node-glyph-violet"
      : module.tone === "gold"
        ? "cosmos-node-glyph-gold"
        : "";

  return (
    <button
      type="button"
      onClick={onOpen}
      data-ocid={`dao_preview.module.${index + 1}`}
      aria-label={`${module.name} — ${
        module.status === "live" ? "implemented today" : "future phase"
      }`}
      className="cosmos-node cosmos-focus absolute w-[8.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-start gap-1.5 p-2.5 sm:w-[10.5rem] sm:flex-row sm:items-center sm:gap-2.5 sm:p-3"
      style={{
        left: `${module.x}%`,
        top: `${module.y}%`,
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? "translate(-50%, -50%) scale(1)"
          : "translate(-50%, -50%) scale(0.86)",
        transition: `opacity 520ms cubic-bezier(0.16,1,0.3,1) ${
          index * 110
        }ms, transform 520ms cubic-bezier(0.16,1,0.3,1) ${index * 110}ms`,
      }}
    >
      <span className={`cosmos-node-glyph size-8 sm:size-9 ${glyphTone}`}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.7rem] font-semibold leading-tight text-[oklch(var(--cosmos-foreground))] sm:text-xs">
          {module.name}
        </span>
        <span
          className={`cosmos-chip mt-1 px-1.5 py-0 text-[0.5rem] sm:text-[0.55rem] ${
            module.status === "live" ? "cosmos-chip-live" : "cosmos-chip-future"
          }`}
        >
          {module.status === "live" ? "Live" : "Future"}
        </span>
      </span>
    </button>
  );
}
