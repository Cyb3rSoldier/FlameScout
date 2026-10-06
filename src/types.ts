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

export interface Experiment {
  id: string;
  title: string;
  fuel: string;
  oxygen: number | null; // % O2
  pressure: number | null; // kPa
  gravity: GravityLevel;
  airflow: string;
  outcome?: string;
  evidenceStrength: Exclude<EvidenceStrength, "Insufficient">;
  sourceId: string;
  /** Demo flag — always true for mock records */
  demo?: boolean;
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
