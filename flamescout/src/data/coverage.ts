import type { CoverageCell, CoverageStatus, Experiment, KnowledgeGap } from "../types";
import { EXPERIMENTS } from "./experiments";

/** Pressure rows (kPa) × oxygen columns (%) for the coverage heatmap. */
export const PRESSURE_BANDS = ["30–60 kPa", "60–100 kPa", "≈101 kPa"];
export const OXYGEN_BANDS = ["13–16%", "17–19%", "20–22%", "23–33%", "50–85%"];

/** Map a representative O₂ anchor onto the grid columns. */
export function oxygenBand(o2: number | null): string | null {
  if (o2 === null) return null;
  if (o2 < 16.5) return "13–16%";
  if (o2 < 19.5) return "17–19%";
  if (o2 < 22.5) return "20–22%";
  if (o2 < 34) return "23–33%";
  return "50–85%"; // spherical-burner enriched stream
}

/** Map a representative pressure anchor onto the grid rows. */
export function pressureBand(p: number | null): string | null {
  if (p === null) return null;
  if (p < 60) return "30–60 kPa";
  if (p < 100) return "60–100 kPa";
  return "≈101 kPa";
}

/**
 * Derive the coverage grid from the experiment catalog at call time — the grid
 * can never drift out of sync with the data (the old static version could).
 * Combustion records only: records without an O₂ anchor (smoke/dust lines,
 * SAME / DAFT) do not describe a combustible environment and appear in the
 * dedicated detection rows below the grid instead.
 */
function bandAssignment(experiments: Experiment[]): Record<string, { ids: string[] }> {
  const cells: Record<string, { ids: string[] }> = {};
  for (const p of PRESSURE_BANDS)
    for (const o of OXYGEN_BANDS) cells[`${p}|${o}`] = { ids: [] };
  for (const e of experiments) {
    const pb = pressureBand(e.pressure);
    const ob = oxygenBand(e.oxygen);
    if (!pb || !ob) continue;
    cells[`${pb}|${ob}`].ids.push(e.id);
  }
  return cells;
}

function missingVariablesFor(experiments: Experiment[], ob: string, pb: string): string[] {
  if (experiments.length === 0) {
    // Distinguish "nobody ever filled this corner" from "nobody could".
    if (ob === "50–85%") return ["most gas-flame studies stop before enriched burners — CFI-G is the only line here"];
    if (ob === "23–33%") return ["the planned Moon-regime band — see the FM² / LUCI planned records and Knowledge Gaps"];
    if (pb === "30–60 kPa") return ["very low pressure; closest evidence is the FLEX pressure sweep"];
    return ["no recorded microgravity run in this band"];
  }
  const variables = new Set<string>();
  for (const e of experiments) (e.variables ?? []).forEach((v) => variables.add(v.toLowerCase()));
  const missing: string[] = [];
  if (![...variables].some((v) => v.includes("fuel") || v.includes("material"))) missing.push("fuel variation");
  if (![...variables].some((v) => v.includes("flow"))) missing.push("airflow sweep at this condition");
  if (![...variables].some((v) => v.includes("gravity"))) missing.push("gravity variation");
  return missing.length ? missing : ["single-investigation coverage only"];
}

export interface CoverageDerivation {
  cells: CoverageCell[];
  gaps: KnowledgeGap[];
  oxygenChart: { band: string; experiments: number }[];
  pressureChart: { band: string; experiments: number }[];
  detectionLine: { id: string; title: string; count: number }[];
}

function deriveCells(experiments: Experiment[]): CoverageCell[] {
  const assign = bandAssignment(experiments);
  const cells: CoverageCell[] = [];
  for (const p of PRESSURE_BANDS) {
    for (const o of OXYGEN_BANDS) {
      const key = `${p}|${o}`;
      const ids = assign[key].ids;
      const status: CoverageStatus = ids.length >= 2 ? "tested" : ids.length === 1 ? "limited" : "not-covered";
      const matched = experiments.filter((e) => ids.includes(e.id));
      cells.push({
        pressureBand: p,
        oxygenBand: o,
        status,
        experimentCount: ids.length,
        experimentIds: ids,
        missingVariables: missingVariablesFor(matched, o, p),
      });
    }
  }
  return cells;
}

/**
 * Ranked knowledge gaps — the honest difference between "studied" and "what
 * crewed missions actually need". Priorities given through a Artemis-era lens.
 */
function deriveGaps(experiments: Experiment[]): KnowledgeGap[] {
  const byId = new Map(experiments.map((e) => [e.id, e]));
  const gaps: KnowledgeGap[] = [
    {
      id: "GAP-MOON",
      name: "Moon-regime solid flammability (≥30% O₂ at ≤10.2 psi)",
      priority: 94,
      availableExperiments: 0,
      missingEvidence: [
        "no solid-material flammability data at ≥30% O₂ in PSI",
        "no combined reduced-pressure + elevated-O₂ solid studies",
        "planned FM² / LUCI records are placeholders, not data",
      ],
      conditions: "≈70 kPa · 30–40% O₂ · solids",
      experimentIds: [],
    },
    {
      id: "GAP-PG",
      name: "Partial-gravity combustion data (Lunar-g / Mars-g)",
      priority: 88,
      availableExperiments: 0,
      missingEvidence: ["zero recorded partial-g runs", "E-FIELD only mimics partial-g via electric-field forcing"],
      conditions: "1/6 g · 3/8 g · any fuel",
      experimentIds: ["E-FIELD"],
    },
    {
      id: "GAP-EVA",
      name: "Spacesuit regime (100% O₂ at 4.3 psi)",
      priority: 85,
      availableExperiments: 0,
      missingEvidence: [
        "no test at 100% O₂ / ≈30 kPa",
        "the suit-oxygen story (100% O₂ label) is pressure-limited, not O₂-limited — different failure physics",
      ],
      conditions: "≈30 kPa · 100% O₂",
      experimentIds: [],
    },
    {
      id: "GAP-COOL",
      name: "Cool-flame invisibility in detection design",
      priority: 78,
      availableExperiments: byId.has("CFI") || byId.has("FLEX") ? 2 : 0,
      missingEvidence: [
        "no linked SAME-type detector response to cool-flame products",
        "cool-flame emissions may not alarm standard detectors",
      ],
      conditions: "droplets/gases · invisible post-burnout combustion",
      experimentIds: ["FLEX", "CFI"],
    },
    {
      id: "GAP-VENT",
      name: "Low-flow long-duration burning vs ventilation (crew-interaction regime)",
      priority: 72,
      availableExperiments: byId.has("BASS-II") ? 1 : 0,
      missingEvidence: ["airflow sweeps at crew-relevant very low flow", "large-scale (Saffire) × low-flow combination"],
      conditions: "< ~5 cm/s · long burns · solids",
      experimentIds: ["BASS-II", "SAFFIRE-I"],
    },
  ];
  // Fill availableExperiments honestly: count catalog records the gap's evidence touches.
  for (const g of gaps) {
    if (g.availableExperiments === 0)
      g.availableExperiments = g.experimentIds.filter((id) => byId.has(id)).length;
  }
  return gaps;
}

function detectionLine(experiments: Experiment[]): CoverageDerivation["detectionLine"] {
  const noAnchor = experiments.filter((e) => e.oxygen === null);
  return [
    {
      id: "no-o2",
      title: "Records without an O₂-atmosphere anchor (smoke/dust generation & detection lines)",
      count: noAnchor.length,
    },
  ];
}

export function deriveCoverage(experiments: Experiment[] = EXPERIMENTS): CoverageDerivation {
  const cells = deriveCells(experiments);
  const gaps = deriveGaps(experiments);
  const oxygenChart = OXYGEN_BANDS.map((band) => ({
    band,
    experiments: cells.filter((c) => c.oxygenBand === band).reduce((acc, c) => acc + c.experimentCount, 0),
  }));
  const pressureChart = PRESSURE_BANDS.map((band) => ({
    band,
    experiments: cells.filter((c) => c.pressureBand === band).reduce((acc, c) => acc + c.experimentCount, 0),
  }));
  return { cells, gaps, oxygenChart, pressureChart, detectionLine: detectionLine(experiments) };
}

/* Backwards-compatible named exports used elsewhere in the codebase. */
const derived = deriveCoverage(EXPERIMENTS);
export const COVERAGE_CELLS = derived.cells;
export const KNOWLEDGE_GAPS = derived.gaps;
export const OXYGEN_CHART = derived.oxygenChart;
export const PRESSURE_CHART = derived.pressureChart;
