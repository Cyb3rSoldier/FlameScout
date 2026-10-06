import type { CoverageCell, KnowledgeGap } from "../types";

export const OXYGEN_BANDS = ["13–15%", "15–17%", "18–20%", "21%", "25–30%"];
export const PRESSURE_BANDS = ["35–50 kPa", "50–70 kPa", "70–90 kPa", "95–101 kPa"];

/**
 * Demo coverage grid: rows = pressure, cols = oxygen.
 * Statuses derived from mock experiment density.
 */
export const COVERAGE_CELLS: CoverageCell[] = [
  { pressureBand: "35–50 kPa", oxygenBand: "13–15%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["oxygen", "pressure", "airflow"] },
  { pressureBand: "35–50 kPa", oxygenBand: "15–17%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["oxygen sweep", "gravity variation"] },
  { pressureBand: "35–50 kPa", oxygenBand: "18–20%", status: "limited", experimentCount: 1, experimentIds: ["EXP-014"], missingVariables: ["fuel variation"] },
  { pressureBand: "35–50 kPa", oxygenBand: "21%", status: "limited", experimentCount: 1, experimentIds: ["EXP-004"], missingVariables: ["oxygen variation", "airflow sweep"] },
  { pressureBand: "35–50 kPa", oxygenBand: "25–30%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["all variables"] },
  { pressureBand: "50–70 kPa", oxygenBand: "13–15%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["oxygen", "fuel"] },
  { pressureBand: "50–70 kPa", oxygenBand: "15–17%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["oxygen", "pressure pairing"] },
  { pressureBand: "50–70 kPa", oxygenBand: "18–20%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["experiments"] },
  { pressureBand: "50–70 kPa", oxygenBand: "21%", status: "limited", experimentCount: 2, experimentIds: ["EXP-003", "EXP-012"], missingVariables: ["oxygen sweep"] },
  { pressureBand: "50–70 kPa", oxygenBand: "25–30%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["all variables"] },
  { pressureBand: "70–90 kPa", oxygenBand: "13–15%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["oxygen floor"] },
  { pressureBand: "70–90 kPa", oxygenBand: "15–17%", status: "limited", experimentCount: 1, experimentIds: ["EXP-009"], missingVariables: ["fuel variation", "gravity"] },
  { pressureBand: "70–90 kPa", oxygenBand: "18–20%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["experiments"] },
  { pressureBand: "70–90 kPa", oxygenBand: "21%", status: "limited", experimentCount: 1, experimentIds: ["EXP-011"], missingVariables: ["oxygen sweep"] },
  { pressureBand: "70–90 kPa", oxygenBand: "25–30%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["elevated-O2 at mid pressure"] },
  { pressureBand: "95–101 kPa", oxygenBand: "13–15%", status: "not-covered", experimentCount: 0, experimentIds: [], missingVariables: ["low-oxygen extinction limit"] },
  { pressureBand: "95–101 kPa", oxygenBand: "15–17%", status: "limited", experimentCount: 1, experimentIds: ["EXP-002"], missingVariables: ["fuel variation"] },
  { pressureBand: "95–101 kPa", oxygenBand: "18–20%", status: "tested", experimentCount: 2, experimentIds: ["EXP-002", "EXP-008"], missingVariables: [] },
  { pressureBand: "95–101 kPa", oxygenBand: "21%", status: "tested", experimentCount: 6, experimentIds: ["EXP-001", "EXP-005", "EXP-007", "EXP-008", "EXP-010", "EXP-013"], missingVariables: [] },
  { pressureBand: "95–101 kPa", oxygenBand: "25–30%", status: "limited", experimentCount: 1, experimentIds: ["EXP-006"], missingVariables: ["pressure variation"] },
];

export const KNOWLEDGE_GAPS: KnowledgeGap[] = [
  { id: "GAP-01", name: "Low pressure × low oxygen corner", priority: 92, availableExperiments: 1, missingEvidence: ["O2 below 17% under 70 kPa", "fuel variation", "airflow sweeps"], conditions: "35–70 kPa · 13–17% O₂", experimentIds: ["EXP-014"] },
  { id: "GAP-02", name: "Partial-gravity coverage (Lunar / Mars-g)", priority: 88, availableExperiments: 2, missingEvidence: ["repeated partial-g runs", "oxygen sweeps at partial-g"], conditions: "Lunar-g · Mars-g · any fuel", experimentIds: ["EXP-011", "EXP-012"] },
  { id: "GAP-03", name: "Elevated oxygen at reduced pressure", priority: 81, availableExperiments: 0, missingEvidence: ["25–30% O₂ below 95 kPa", "pressure pairing"], conditions: "<95 kPa · 25–30% O₂", experimentIds: [] },
  { id: "GAP-04", name: "Extinction-limit boundary near 13–15% O₂", priority: 77, availableExperiments: 0, missingEvidence: ["extinction onset data", "fuel-specific limits"], conditions: "~101 kPa · 13–15% O₂", experimentIds: [] },
  { id: "GAP-05", name: "Mid-pressure band (70–90 kPa) oxygen sweep", priority: 69, availableExperiments: 2, missingEvidence: ["18–20% O₂ runs", "elevated-O₂ runs"], conditions: "70–90 kPa · full O₂ sweep", experimentIds: ["EXP-009", "EXP-011"] },
];

export const OXYGEN_CHART = [
  { band: "13–15%", experiments: 0 },
  { band: "15–17%", experiments: 2 },
  { band: "18–20%", experiments: 3 },
  { band: "21%", experiments: 9 },
  { band: "25–30%", experiments: 1 },
];

export const PRESSURE_CHART = [
  { band: "35–50", experiments: 2 },
  { band: "50–70", experiments: 3 },
  { band: "70–90", experiments: 2 },
  { band: "95–101", experiments: 9 },
];
