import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Ambience = the whole UI "burns" at an intensity (0..1).
 * Pages publish a value with useFlameIntensity(); the shell turns it into
 * the --amb-i CSS variable, which CSS transitions smoothly (see index.css).
 */
interface AmbienceState { intensity: number; label: string }
interface AmbienceCtx extends AmbienceState {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  publish: (s: AmbienceState) => void;
}

const IDLE: AmbienceState = { intensity: 0.32, label: "Idle" };
const KEY = "flamescout-ambience";
const Ctx = createContext<AmbienceCtx | null>(null);

export function AmbienceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AmbienceState>(IDLE);
  const [enabled, setEnabledState] = useState<boolean>(() => {
    try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
  });
  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
    try { localStorage.setItem(KEY, v ? "on" : "off"); } catch { /* private mode */ }
  }, []);
  const publish = useCallback((s: AmbienceState) => setState(s), []);
  const value = useMemo(() => ({ ...state, enabled, setEnabled, publish }), [state, enabled, setEnabled, publish]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAmbience() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAmbience must be used inside <AmbienceProvider>");
  return c;
}

/** Call from any page: the UI's flame follows `intensity`, and resets to idle on unmount. */
export function useFlameIntensity(intensity: number, label: string) {
  const { publish } = useAmbience();
  const i = Math.min(1, Math.max(0, intensity));
  useEffect(() => { publish({ intensity: i, label }); }, [i, label, publish]);
  useEffect(() => () => publish(IDLE), [publish]);
}
