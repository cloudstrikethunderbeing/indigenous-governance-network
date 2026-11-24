import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SovereignError } from "@/backend";
import OsAppPage from "@/components/os/OsAppPage";
import CopilotComposer from "@/components/os/copilot/CopilotComposer";
import CopilotConversation from "@/components/os/copilot/CopilotConversation";
import CopilotStarterQuestions from "@/components/os/copilot/CopilotStarterQuestions";
import type { CopilotTurn } from "@/components/os/copilot/types";
import { useAskCopilot, useEnsureSampleWorkspace } from "@/hooks/useSovereign";

/** Human-readable messages for the backend's Copilot errors. */
const ERROR_MESSAGE: Partial<Record<SovereignError, string>> = {
  [SovereignError.missingBody]: "Type a question before asking the Copilot.",
  [SovereignError.unknownNation]:
    "The sample workspace is not available yet. Please try again.",
};

/** Example questions a visitor can tap to get started. */
const STARTER_QUESTIONS = [
  "What proposals are open right now?",
  "What is our treasury balance?",
  "Which documents guide our data policy?",
  "Who are the Nation's members and their roles?",
];

/**
 * The AI Copilot app (Preview): an advisory, read-only question-and-answer
 * surface over the sample Nation workspace. It answers from the workspace data,
 * cites its sources, and never approves a proposal, casts a vote, changes
 * membership or moves treasury funds.
 */
export default function CopilotAppPage() {
  const [nationId, setNationId] = useState<bigint | null>(null);
  const [turns, setTurns] = useState<CopilotTurn[]>([]);
  const [draft, setDraft] = useState("");
  const turnCounter = useRef(0);

  const { mutate: ensureWorkspace } = useEnsureSampleWorkspace();
  const askCopilot = useAskCopilot();

  // Seed the sample workspace once so a visitor always has a Nation to ask
  // about, then remember its id for every question. React Query's mutate is
  // stable across renders, so this effect runs once on mount.
  useEffect(() => {
    ensureWorkspace(undefined, {
      onSuccess: (id) => setNationId(id),
    });
  }, [ensureWorkspace]);

  function nextTurnId() {
    turnCounter.current += 1;
    return `turn-${turnCounter.current}`;
  }

  function ask(question: string, existingTurnId?: string) {
    if (nationId === null) return;
    const id = existingTurnId ?? nextTurnId();

    setTurns((current) => {
      const pendingTurn: CopilotTurn = { id, question, pending: true };
      if (existingTurnId) {
        return current.map((turn) => (turn.id === id ? pendingTurn : turn));
      }
      return [...current, pendingTurn];
    });

    askCopilot.mutate(
      { nation: nationId, question },
      {
        onSuccess: (result) => {
          setTurns((current) =>
            current.map((turn) => {
              if (turn.id !== id) return turn;
              if (result.__kind__ === "ok") {
                return {
                  id,
                  question,
                  answer: result.ok.answer,
                  sources: result.ok.sources,
                  pending: false,
                };
              }
              return {
                id,
                question,
                pending: false,
                error:
                  ERROR_MESSAGE[result.err] ??
                  "The Copilot could not answer that question. Please try again.",
              };
            }),
          );
        },
        onError: () => {
          setTurns((current) =>
            current.map((turn) =>
              turn.id === id
                ? {
                    id,
                    question,
                    pending: false,
                    error:
                      "The Copilot could not answer that question. Please try again.",
                  }
                : turn,
            ),
          );
        },
      },
    );
  }

  function handleSubmit(question: string) {
    setDraft("");
    ask(question);
  }

  function handleRetry(turn: CopilotTurn) {
    ask(turn.question, turn.id);
  }

  const workspaceReady = nationId !== null;
  const pending = askCopilot.isPending;

  return (
    <OsAppPage appKey="copilot">
      <div className="space-y-5">
        <header className="space-y-2">
          <p className="text-stamp text-accent">AI Copilot · Preview</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Ask about the workspace
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The Copilot answers questions about the Nation's proposals,
            governance, documents, membership and treasury, and shows the
            workspace sources each answer drew on.
          </p>
          <div className="rule-accent" />
        </header>

        <div
          data-ocid="os.copilot.advisory_notice"
          role="note"
          className="flex items-start gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2.5"
        >
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-accent-foreground">
            Every answer is advisory, not authoritative. The Copilot cannot
            approve proposals, cast votes or execute transactions — those
            decisions stay with the Nation's members and governance.
          </p>
        </div>

        <CopilotStarterQuestions
          questions={STARTER_QUESTIONS}
          onSelect={setDraft}
          disabled={!workspaceReady || pending}
        />

        {turns.length > 0 ? (
          <CopilotConversation turns={turns} onRetry={handleRetry} />
        ) : (
          <div
            data-ocid="os.copilot.empty_state"
            className="shell-panel flex flex-col items-center gap-2 p-6 text-center"
          >
            <p className="font-display text-base font-medium text-foreground">
              No questions yet
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              Tap an example question above or type your own to see how the
              Copilot answers from the workspace.
            </p>
          </div>
        )}

        <CopilotComposer
          onSubmit={handleSubmit}
          pending={pending || !workspaceReady}
          draft={draft}
          onDraftChange={setDraft}
        />
      </div>
    </OsAppPage>
  );
}
