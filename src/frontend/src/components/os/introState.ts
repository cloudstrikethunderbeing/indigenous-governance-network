/**
 * SOVEREIGN OS — first-visit introduction state.
 *
 * The introduction is optional, brief and replayable through Help. Whether it
 * has been seen is a per-session display preference, kept separate from
 * governance and identity settings.
 */

/** The sessionStorage key recording that the introduction has been seen. */
export const INTRO_SEEN_KEY = "sovereign.os.intro.seen";

/** Whether the introduction has already been seen this session. */
export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** Record that the introduction has been seen this session. */
export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // A storage failure never blocks the introduction flow.
  }
}

/** Clear the seen flag so the introduction replays. */
export function resetIntro(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(INTRO_SEEN_KEY);
  } catch {
    // A storage failure never blocks the introduction flow.
  }
}
