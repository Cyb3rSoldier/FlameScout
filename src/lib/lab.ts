/**
 * Experiment Lab helpers — a what-ifni sandbox over the catalog.
 *
 * House rules: the Lab NEVER predicts. It retrieves the nearest catalog
 * records for a user-chosen atmosphere and labels which corners of the
 * pressure × O₂ plane are tested, thinly covered, or empty. Distance is a
 * display aid, not physics.
 */

import type { Experiment, GravityLevel } from "../types";
import { EXPERIMENTS } from "../data/experiments";
import { oxygenBand, pressureBand, PRESSURE_BANDS, OXYGEN_BANDS } from "../data/coverage";
import { MISSION_ENVIRONMENTS } from "./ranking";

/** Catalog records with both O₂ and pressure anchors — the mappable set. */
export const MAPPABLE: Experiment[] = EXPERIMENTS.filter((e) => e.oxygen !== null && e.pressure !== null);

/** Slider ranges: generous beyond the data — the honest "gap" corners matter too. */
export const LAB_O2 = { min: 10, max: 100, step: 0.5 };
export const LAB_PRESSURE = { min: 20, max: 350, step: 1 };

export interface NearestCatalogRecord {
  experiment: Experiment;
  /** Normalized display distance — (ΔO₂/30)² + (ΔP/100)² sqrt, retrieval aid only. */
  distance: number;
}

export function nearestCatalog(o2: number, pressureKpa: number, count = 4): NearestCatalogRecord[] {
  return MAPPABLE.map((experiment) => {
    const do2 = ((o2 - (experiment.oxygen as number)) / 30) ** 2;
    const dp = ((pressureKpa - (experiment.pressure as number)) / 100) ** 2;
    return { experiment, distance: Math.sqrt(do2 + dp) };
  })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

/** Coverage of the grid cell the chosen atmosphere falls into, derived live. */
export function cellStatusFor(o2: number, pressureKpa: number):
  | { status: "tested" | "limited" | "not-covered"; cell: string; ids: string[]; missing: string[] }
  | null {
  const ob = oxygenBand(o2);
  const pb = pressureBand(pressureKpa);
  if (!ob || !pb) return null;
  const ids = MAPPABLE.filter((e) => oxygenBand(e.oxygen) === ob && pressureBand(e.pressure) === pb).map((e) => e.id);
  const status = ids.length >= 2 ? "tested" : ids.length === 1 ? "limited" : "not-covered";
  const cell = `${pb} × ${ob}`;
  let missing: string[];
  if (ids.length === 0) {
    if (ob === "50–85%") missing = ["most gas-flame studies stop before enriched burners — CFI-G is the only line here"];
    else if (ob === "23–33%") missing = ["planned Moon-regime band — FM² / LUCI are roadmap records, not data"];
    else if (pb === "30–60 kPa") missing = ["very low pressure; closest evidence is the FLEX pressure sweep"];
    else missing = ["no recorded microgravity run in this band"];
  } else {
    missing = [];
    for (const e of MAPPABLE.filter((x) => ids.includes(x.id))) (e.variables ?? []).forEach((v) => missing.push(v));
    const anyFuel = missing.some((v) => /fuel|material/i.test(v));
    const anyFlow = missing.some((v) => /flow/i.test(v));
    missing = [!anyFuel && "no fuel variation at this condition", !anyFlow && "no airflow sweep at this condition"].filter(Boolean) as string[];
    if (missing.length === 0) missing = ["single-investigation coverage only"];
  }
  return { status, cell, ids, missing };
}

/** Closest nominal crewed atmosphere for the chosen setting. */
export function closestEnvironment(o2: number, pressureKpa: number) {
  let best = MISSION_ENVIRONMENTS[0];
  let bestD = Infinity;
  for (const env of MISSION_ENVIRONMENTS) {
    const d = Math.hypot((o2 - env.o2) / 30, (pressureKpa - env.pressure) / 100);
    if (d < bestD) { bestD = d; best = env; }
  }
  return { env: best, distance: bestD };
}

export interface LabInsight {
  tone: "info" | "match" | "gap";
  text: string;
}

/**
 * Hedged observations derived from the chosen setting. Every string
 * describes what the catalog does or does not contain — never what would
 * happen in an untested scenario.
 */
export function atmosphereInsights(o2: number, pressureKpa: number, gravity: GravityLevel): LabInsight[] {
  const out: LabInsight[] = [];

  const { env } = closestEnvironment(o2, pressureKpa);
  if (Math.abs(o2 - env.o2) <= 4 && Math.abs(pressureKpa - env.pressure) <= 15) {
    out.push({ tone: "match", text: `This setting sits close to the ${env.name} nominal atmosphere (${env.o2}% O₂ · ${env.pressure} kPa). Mission Fit ranks investigations for it — env note: ${env.note}` });
  }

  if (o2 >= 30 && pressureKpa <= 70 && gravity !== "Lunar-g" && gravity !== "Mars-g") {
    out.push({ tone: "gap", text: "Moon-regime corner: ≥30% O₂ at ≤10.2 psi (≈70 kPa). The Catalog Coverage Map's top-ranked knowledge gap — no solid-material flammability study in PSI reaches this setting; FM² / LUCI are planned records." });
  }
  if (pressureKpa <= 32 && o2 >= 90) {
    out.push({ tone: "gap", text: "Suit corner: ≈30 kPa with ≈100% O₂ has no flammability test in the catalog. Published notes stress that high-O₂ mixtures at suit pressure are pressure-limited — different physics from the same O₂% at 1 atm." });
  }
  if (pressureKpa <= 60 && o2 < 90) {
    out.push({ tone: "gap", text: "Very low pressure with ordinary O₂: closest published anchor is the FLEX pressure sweep on droplets — no solid-material record reaches this band." });
  }
  if (gravity === "Lunar-g" || gravity === "Mars-g") {
    out.push({ tone: "gap", text: "Zero partial-gravity runs exist in the catalog (Lunar-g / Mars-g). E-FIELD only mimics partial-g via electric-field forcing; the planned LUCI record is the expected future bridge." });
  }

  const cell = cellStatusFor(o2, pressureKpa);
  if (cell) {
    if (cell.status === "tested") {
      out.push({ tone: "info", text: `Coverage: ${cell.cell} — ${cell.ids.length} investigations touch this band (${cell.ids.join(", ")}). ${cell.missing[0]}.` });
    } else if (cell.status === "limited") {
      out.push({ tone: "info", text: `Coverage: ${cell.cell} — only ${cell.ids[0]} reaches this band. ${cell.missing[0]}.` });
    } else {
      out.push({ tone: "gap", text: `Coverage: ${cell.cell} — no catalog record covers this combination. ${cell.missing[0]}.` });
    }
  }
  return out;
}

/** Scatter data — real catalog anchors plus the user's what-if point. */
export function envelopeData(o2: number, pressureKpa: number) {
  return {
    observed: MAPPABLE.map((e) => ({ o2: e.oxygen as number, pressureKpa: e.pressure as number, id: e.id, strength: e.evidenceStrength })),
    point: { o2, pressureKpa },
  };
}

/** Grid axes in the order coverage.ts lists them (chart helpers). */
export { PRESSURE_BANDS as LAB_PRESSURE_BANDS, OXYGEN_BANDS as LAB_O2_BANDS };
