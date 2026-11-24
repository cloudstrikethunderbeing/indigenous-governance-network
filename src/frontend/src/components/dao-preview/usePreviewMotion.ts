import { useEffect, useRef, useState } from "react";

/**
 * Tracks the user's reduced-motion preference so the cinematic sequence can
 * skip its timed reveal and show the finished state immediately.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Runs a one-shot entrance: returns true once the stage has mounted, so the
 * constellation can animate in from a settled starting state.
 */
export function useMounted(delayMs = 60): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return mounted;
}

/**
 * Advances a step counter on an interval until it reaches `total`. Returns the
 * current step and a setter so the user can jump ahead or step back manually.
 */
export function useSequence(
  total: number,
  intervalMs: number,
  enabled: boolean,
) {
  const [step, setStep] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (step >= total - 1) return;
    timer.current = window.setTimeout(() => {
      setStep((current) => Math.min(current + 1, total - 1));
    }, intervalMs);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [step, total, intervalMs, enabled]);

  return { step, setStep };
}
