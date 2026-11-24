import type { CopilotSource } from "@/backend";

/** One turn in the Copilot conversation: a visitor question and its answer. */
export interface CopilotTurn {
  /** Stable identity for the turn, used as the React list key. */
  id: string;
  question: string;
  /** The answer text once it has arrived. */
  answer?: string;
  /** The workspace sources the answer drew on. */
  sources?: CopilotSource[];
  /** Whether the answer is still being prepared. */
  pending: boolean;
  /** A human-readable failure message when the request failed. */
  error?: string;
}
