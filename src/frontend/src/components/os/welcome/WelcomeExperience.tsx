import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import OsIntroModal from "@/components/os/OsIntroModal";
import {
  hasSeenIntro,
  markIntroSeen,
  resetIntro,
} from "@/components/os/introState";

/**
 * The first-visit welcome experience for the SOVEREIGN OS desktop.
 *
 * It shows the optional introduction once per session on the first visit to
 * the desktop, sends the visitor into the sample Nation from the primary CTA,
 * and can be replayed at any time through Help. Whether it has been seen is a
 * per-session display preference, kept separate from governance and identity
 * settings.
 */
export default function WelcomeExperience({
  replaySignal = 0,
}: {
  /** Increment to replay the introduction from Help. */
  replaySignal?: number;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Show the optional introduction once per session on the first visit.
  useEffect(() => {
    if (!hasSeenIntro()) setOpen(true);
  }, []);

  // Replay the introduction when Help asks for it.
  useEffect(() => {
    if (replaySignal > 0) {
      resetIntro();
      setOpen(true);
    }
  }, [replaySignal]);

  const close = useCallback(() => {
    markIntroSeen();
    setOpen(false);
  }, []);

  const explore = useCallback(() => {
    close();
    void navigate({ to: "/os/sample" });
  }, [close, navigate]);

  return <OsIntroModal open={open} onExplore={explore} onSkip={close} />;
}
