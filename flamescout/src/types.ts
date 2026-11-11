/**
 * FlameScout shared domain types.
 * These mirror the future FastAPI response schemas so mock data
 * can be swapped for real API responses without UI changes.
 */

export type EvidenceStrength = "Strong" | "Moderate" | "Limited" | "Insufficient";

export type GravityLevel =
  | "Microgravity"
  | "Reduced gravity"
  | "Lunar-g"
  | "Mars-g"
  | "Normal gravity";

export type CoverageStatus = "tested" | "limited" | "not-covered";

export type FireFocus = "prevention" | "detection" | "suppression" | "combustion-physics";

/**
 * A NASA microgravity combustion investigation (PSI record level — one entry
 * per investigation, not per run). `oxygen`/`pressure` are representative
 * test-condition anchors; `oxygenNote`/`pressureNote` carry the honest range
 * wording when values are approximate ("≈"/null when not applicable).
 */
export interface Experiment {
  id: string;
  /** Name of the investigation as used by NASA / PSI. */
  title: string;
  fuel: string;
  oxygen: number | null; // % O2 (representative anchor)
  pressure: number | null; // kPa (representative anchor)
  gravity: GravityLevel;
  airflow: string;
  outcome?: string;
  evidenceStrength: Exclude<EvidenceStrength, "Insufficient">;
  sourceId: string;
  /** Demo flag — true only for synthetic mock records */
  demo?: boolean;

  /* ── Extended catalog fields (all optional for UI compatibility) ── */
  /** One-sentence paraphrase of the experiment objective. */
  objective?: string;
  /** Project grouping, e.g. "ACME", "FLEX", "Spacecraft Fire Safety". */
  project?: string;
  /** Hardware/platform, e.g. "CIR · MDCA", "MSG · SPICE flow duct", "Cygnus spacecraft". */
  hardware?: string;
  /** Approximate years of space operation, e.g. "2010–2012". */
  years?: string;
  /** Materials and sample forms tested (beyond a single fuel name). */
  materials?: string[];
  /** Where the representative anchor sits: "≈" prefix or descriptive range. */
  oxygenNote?: string;
  pressureNote?: string;
  /** Conditions variable knobs swept across runs (the "variables" of the same investigation). */
  variables?: string[];
  /** Measurement types / instruments. */
  measurements?: string[];
  /** Concise, hedged statements supported by published NASA summaries. */
  keyFindings?: string[];
  /** Fire-safety pillars this investigation feeds. */
  fireFocus?: FireFocus[];
  /** PSI database dataset identifier hint, if known. */
  psi?: string;
  /** Real tested span, when known from run-level data: [min, max]. */
  oxygenRange?: [number, number]; // % O2
  pressureRange?: [number, number]; // kPa
  /** Number of real tests that satisfy BOTH the O2 and pressure of an environment (0 = a joint gap). */
  jointTests?: Partial<Record<EnvironmentId, number>>;
  /** True when representative numbers are approximate/derived. */
  approx?: boolean;
  /** Short retrieval keywords for the assistant ranking pass. */
  keywords?: string[];
}

/* ───────── Mission-fit ranking (crewed-environment relevance) ───────── */

export type EnvironmentId = "spacecraft" | "lunar-base" | "pressurized-rover" | "space-suit" | "mars-habitat";

export interface MissionEnvironment {
  id: EnvironmentId;
  name: string;
  /** Nominal atmosphere used for scoring (estimates, clearly labelled). */
  o2: number; // % O2
  pressure: number; // kPa
  note: string;
}

export interface RankingFactor {
  name: string;
  /** 0..1 normalized contribution */
  score: number;
  note: string;
}

export interface RankedExperiment {
  experiment: Experiment;
  /** 0..100 composite mission-fit score (transparent, heuristic). */
  total: number;
  rank: number;
  factors: RankingFactor[];
  /** One-line "why it ranks here" derived from the dominant factors. */
  reason: string;
}

export interface Source {
  id: string;
  title: string;
  /** e.g. "Experiment Report" | "Dataset" | "Figure Set" | "Journal Article" */
  type: string;
  page: string;
  relevance: number; // 0..1
  citation: number;
  demo?: boolean;
}

export interface Citation {
  n: number;
  sourceId: string;
  page: string;
  label: string;
}

export interface EvidenceItem {
  experimentIds: string[];
  sourceIds: string[];
  strength: EvidenceStrength;
  experimentCount: number;
}

export interface Figure {
  id: string;
  title: string;
  caption: string;
  experimentId: string;
  sourceId: string;
  kind: "flame-image" | "chart" | "schematic";
  demo?: boolean;
}

export interface CoverageCell {
  pressureBand: string; // row, e.g. "50–70 kPa"
  oxygenBand: string; // col, e.g. "15–17%"
  status: CoverageStatus;
  experimentCount: number;
  experimentIds: string[];
  missingVariables: string[];
}

export interface KnowledgeGap {
  id: string;
  name: string;
  priority: number; // 0..100
  availableExperiments: number;
  missingEvidence: string[];
  conditions: string;
  experimentIds: string[];
}

export type QueryMode = "ask" | "compare" | "figure" | "scenario" | "gap";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  mode?: QueryMode;
  answer?: string;
  /** Scannable key findings derived from retrieved evidence (mock). */
  findings?: string[];
  /** What the evidence does not establish (mock). Never safe/unsafe claims. */
  limitations?: string;
  strength?: EvidenceStrength;
  citations?: Citation[];
  experimentIds?: string[];
  figureIds?: string[];
  followUps?: string[];
  traceId?: string;
  insufficient?: boolean;
  missingEvidence?: string[];
  createdAt: number;
}

export interface EvidenceTraceStep {
  title: string;
  detail: string;
}

export interface EvidenceTrace {
  id: string;
  question: string;
  classification: string;
  steps: EvidenceTraceStep[];
  verifiedClaims: number;
  totalClaims: number;
}

export interface Comparison {
  experimentIds: string[];
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
}

export interface ScenarioInput {
  fuel: string;
  oxygen: string;
  pressure: string;
  gravity: string;
  airflow: string;
}

export interface Filters {
  fuel: string;
  oxygen: string;
  pressure: string;
  gravity: string;
  airflow: string;
}

export const EMPTY_FILTERS: Filters = {
  fuel: "All",
  oxygen: "All",
  pressure: "All",
  gravity: "All",
  airflow: "All",
};

/* ───────── Prediction (exploratory, FLEX droplet tests only) ───────── */

export type PredictionTarget = "extinctionDiameter" | "burnTime" | "burningRate";

/** Where the requested setting sits relative to the real tests. */
export type RangeStatus = "inside" | "sparse" | "outside";

export interface PredictionInput {
  fuel: "methanol" | "heptane";
  pressureKpa: number;
  /** Mole percent. N₂ is the balance (100 − O₂ − CO₂ − He). */
  o2: number;
  co2: number;
  he: number;
  dropletMm: number;
}

export interface TargetPrediction {
  target: PredictionTarget;
  label: string;
  unit: string;
  digits: number;
  value: number | null;
  /** Spread of the nearest tests, not a statistical confidence interval. */
  low: number;
  high: number;
  dataRange: [number, number];
  heldOut: { r2: number; mae: number; n: number };
}

export interface NearestTest {
  id: string;
  fuel: string;
  pressureKpa: number;
  o2: number;
  co2: number;
  he: number;
  dropletMm: number;
  extinctionDiameter: number | null;
  burningRate: number | null;
  burnTime: number | null;
  end: string;
  distance: number;
  citation: { source: string; figure: number | null; page: string | null };
}

export interface PredictionSweep {
  curve: { o2: number; value: number }[];
  observed: { o2: number; value: number; id: string }[];
}

export interface PredictionResult {
  status: RangeStatus;
  /** Plain-language reasons the setting is outside or sparse. */
  issues: string[];
  predictions: TargetPrediction[];
  nearest: NearestTest[];
  /** Real tests within ±15% pressure and ±2 points O₂ of the setting. */
  similarCount: number;
  sweep: Record<PredictionTarget, PredictionSweep> | null;
  model: { name: string; note: string; trainedOn: string };
  source: string;
}
