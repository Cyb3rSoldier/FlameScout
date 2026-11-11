/**
 * Maps experiment conditions to the *look* of the flame illustration.
 * Purely visual: it never says a flame will spread, struggle, or die out.
 * Real microgravity flames get dimmer and bluer as oxygen drops, and
 * brighter and more orange as it rises — the schematic follows that trend.
 */
export type FlameBand = "low" | "moderate" | "high";

export interface FlameLook {
  intensity: number; // 0..1
  scale: number;     // body size multiplier
  glow: number;      // outer halo opacity
  shell: number;     // blue diffusion-shell opacity
  flicker: number;   // seconds per flicker cycle (faster = hotter)
  band: FlameBand;
  label: string;
}

const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));

const LABELS: Record<FlameBand, string> = {
  low: "Dim, blue-edged",
  moderate: "Mid glow",
  high: "Bright, orange-dominant",
};

/** Neutral look used when no conditions are supplied (top bar, loader, hero). */
export const NEUTRAL_LOOK: FlameLook = {
  intensity: 0.6, scale: 1, glow: 1, shell: 0.5, flicker: 2.3, band: "moderate", label: LABELS.moderate,
};

export function flameLook(o2Percent?: number, pressureKpa?: number): FlameLook {
  if (o2Percent === undefined) return NEUTRAL_LOOK;
  const i = clamp((o2Percent - 12) / (34 - 12));
  const p = pressureKpa === undefined ? 1 : clamp(pressureKpa / 101, 0.6, 1.6);
  const band: FlameBand = i < 0.3 ? "low" : i < 0.65 ? "moderate" : "high";
  return {
    intensity: i,
    scale: 0.8 + 0.3 * i + 0.04 * (p - 1),
    glow: 0.35 + 0.65 * i,
    shell: 1 - 0.55 * i,
    flicker: 3.2 - 1.6 * i,
    band,
    label: LABELS[band],
  };
}
