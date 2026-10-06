/**
 * API service layer — single seam between UI and data.
 *
 * TODAY: mock implementations (simulated latency) so the frontend works standalone.
 * LATER (FastAPI): set VITE_API_BASE_URL and implement the same function
 * signatures with fetch() against the backend. UI code must only import
 * from this module, never from ../data/* directly.
 *
 * Suggested FastAPI routes:
 *   GET  /api/experiments
 *   GET  /api/sources
 *   POST /api/ask            { question, mode, filters }
 *   GET  /api/coverage
 *   POST /api/compare        { experimentIds }
 *   GET  /api/trace/:id
 */

import { COVERAGE_CELLS, KNOWLEDGE_GAPS } from "../data/coverage";
import { EXPERIMENTS } from "../data/experiments";
import { FIGURES, SOURCES } from "../data/sources";
import type {
  ChatMessage,
  Citation,
  CoverageCell,
  EvidenceStrength,
  EvidenceTrace,
  Experiment,
  Figure,
  Filters,
  KnowledgeGap,
  QueryMode,
  Source,
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const isMockMode = !API_BASE;
export const DEMO_NOTICE =
  "Demo data — mock records for UI development. Not real NASA findings.";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function classify(question: string): QueryMode {
  const q = question.toLowerCase();
  if (q.includes("compar") || q.includes(" vs ") || q.includes("versus")) return "compare";
  if (q.includes("figure") || q.includes("image") || q.includes("shape") || q.includes("show flame")) return "figure";
  if (q.includes("not been") || q.includes("not covered") || q.includes("missing") || q.includes("gap") || q.includes("untested")) return "gap";
  if (q.includes("if ") || q.includes("scenario") || q.includes("conditions") || q.includes("habitat")) return "scenario";
  return "ask";
}

function matchExperiments(question: string, filters: Filters): Experiment[] {
  const q = question.toLowerCase();
  let list = [...EXPERIMENTS];
  if (filters.fuel !== "All") list = list.filter((e) => e.fuel.toLowerCase().includes(filters.fuel.toLowerCase().split(" ")[0]));
  if (filters.gravity !== "All") list = list.filter((e) => e.gravity === filters.gravity);
  if (q.includes("oxygen")) list = [...EXPERIMENTS].filter((e) => [18, 16, 30, 21].includes(e.oxygen ?? -1)).slice(0, 5);
  else if (q.includes("low pressure") || q.includes("pressure")) list = EXPERIMENTS.filter((e) => (e.pressure ?? 101) < 95);
  else if (q.includes("reduced gravity") || q.includes("partial") || q.includes("lunar") || q.includes("mars")) list = EXPERIMENTS.filter((e) => e.gravity !== "Microgravity" && e.gravity !== "Normal gravity");
  else if (q.includes("not been") || q.includes("not studied") || q.includes("not covered")) list = EXPERIMENTS.filter((e) => e.evidenceStrength === "Limited").slice(0, 4);
  if (list.length === 0) list = EXPERIMENTS.slice(0, 4);
  return list.slice(0, 5);
}

const ANSWER_BANK: Array<{ keys: string[]; answer: string; strength: EvidenceStrength; findings: string[]; limitations: string; followUps: string[] }> = [
  {
    keys: ["oxygen"],
    answer:
      "Available evidence describes oxygen concentration as a key test variable: runs at ~21% O₂ provide the densest coverage, with sparser runs near 16–18% and a single elevated-oxygen run near 30%.",
    strength: "Moderate",
    findings: [
      "Densest coverage sits at ~21% O₂ across cellulose, wire insulation and gaseous flame runs [1][3].",
      "Sparser runs near 16–18% O₂ describe slower spread and near-limit behaviour [1][2].",
      "One elevated-oxygen run near 30% O₂ is paired with faster spread descriptions [3].",
    ],
    limitations: "Low-oxygen extinction boundaries have limited evidence and should not be extrapolated; no claim about any condition being safe or unsafe.",
    followUps: ["Which experiments used lower oxygen?", "Show the original figures.", "What evidence is missing?"],
  },
  {
    keys: ["pressure", "low pressure"],
    answer:
      "Available evidence includes low-pressure runs near 40–60 kPa plus mid-pressure runs near 70–80 kPa, mostly with PMMA, cellulose, and cotton fuels.",
    strength: "Moderate",
    findings: [
      "PMMA runs near 60 kPa describe sustained burning with altered flame shape [2].",
      "A very-low-pressure run near 40 kPa exists but carries limited evidence [2].",
      "Mid-pressure runs near 70–80 kPa cover cotton and partial-gravity cases [5][7].",
    ],
    limitations: "Coverage below 70 kPa combined with off-nominal oxygen is limited, so combined low-pressure / low-oxygen behaviour is not supported by the available evidence.",
    followUps: ["Compare low vs ambient pressure runs.", "What is missing below 60 kPa?", "Show the original figures."],
  },
  {
    keys: ["reduced gravity", "partial", "lunar", "mars"],
    answer:
      "Available evidence for reduced and partial gravity is limited: a small number of parabola and centrifuge runs are present in the demo set, concentrated near 21% O₂.",
    strength: "Limited",
    findings: [
      "Reduced-gravity parabola runs cover silicone samples near 21% O₂ [4].",
      "Centrifuge runs cover Mars-g and lunar-g pairings at 55–70 kPa [7].",
      "Normal-gravity reference runs exist for gravity comparison [6].",
    ],
    limitations: "Partial-g data are sparse, so gravity-dependent trends are described only qualitatively; extrapolation to Moon or Mars gravity is an open research question.",
    followUps: ["What partial-g conditions are missing?", "Compare microgravity vs partial-g.", "View coverage map."],
  },
];

function buildAnswer(question: string, exps: Experiment[]): { answer: string; strength: EvidenceStrength; findings: string[]; limitations: string; followUps: string[] } {
  const q = question.toLowerCase();
  for (const b of ANSWER_BANK) {
    if (b.keys.some((k) => q.includes(k))) return { answer: b.answer, strength: b.strength, findings: b.findings, limitations: b.limitations, followUps: b.followUps };
  }
  if (q.includes("not been") || q.includes("not studied") || q.includes("gap") || q.includes("untested") || q.includes("not covered")) {
    return {
      answer:
        "Evidence coverage analysis shows the sparsest regions are: (1) combined low pressure with low oxygen, (2) partial-gravity conditions, and (3) elevated oxygen at reduced pressure.",
      strength: "Limited",
      findings: [
        "The 35–70 kPa × 13–17% O₂ corner holds zero or single-demo runs.",
        "Partial-gravity (Lunar-g / Mars-g) coverage rests on two demo runs.",
        "Elevated oxygen (25–30%) below 95 kPa has no demo runs at all.",
      ],
      limitations: "These cells have zero or single-demo runs, so no conclusions are drawn about them — see the Knowledge Coverage map for the ranked gap list.",
      followUps: ["View coverage map.", "Which gap is highest priority?", "Find matching experiments."],
    };
  }
  return {
    answer:
      "Based on the available evidence in the demo set, the matching experiments are ranked below with citations. Where evidence is thin the response is marked Limited and missing variables are listed rather than inferred.",
    strength: exps.some((e) => e.evidenceStrength === "Strong") ? "Moderate" : "Limited",
    findings: exps.slice(0, 3).map((e) => `${e.id} · ${e.fuel}, ${e.oxygen ?? "—"}% O₂, ${e.pressure ?? "—"} kPa, ${e.gravity} — ${e.evidenceStrength} evidence.`),
    limitations: "Findings describe only the retrieved demo runs; gaps in fuel, oxygen, pressure, gravity or airflow pairings are not filled by inference.",
    followUps: ["Which experiments used lower oxygen?", "Show the original figures.", "What evidence is missing?"],
  };
}

export async function getExperiments(): Promise<Experiment[]> {
  if (API_BASE) {
    const r = await fetch(`${API_BASE}/api/experiments`);
    if (!r.ok) throw new Error("Failed to load experiments");
    return r.json();
  }
  await delay(250);
  return EXPERIMENTS;
}

export async function getSources(): Promise<Source[]> {
  if (API_BASE) {
    const r = await fetch(`${API_BASE}/api/sources`);
    if (!r.ok) throw new Error("Failed to load sources");
    return r.json();
  }
  await delay(200);
  return SOURCES;
}

export async function getFigures(): Promise<Figure[]> {
  await delay(150);
  return FIGURES;
}

export interface AskResult {
  message: ChatMessage;
  trace: EvidenceTrace;
}

/**
 * Backend contract for GET /api/coverage.
 * cells: pressure × oxygen grid; gaps: ranked coverage analysis (not predictions).
 */
export interface CoverageResponse {
  cells: CoverageCell[];
  gaps: KnowledgeGap[];
}

export async function askQuestion(question: string, mode: QueryMode, filters: Filters, historyLength = 0): Promise<AskResult> {
  void historyLength;
  if (API_BASE) {
    const r = await fetch(`${API_BASE}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, mode, filters }),
    });
    if (!r.ok) throw new Error("Assistant request failed");
    return r.json();
  }
  const detected = mode === "ask" ? classify(question) : mode;
  await delay(900);
  const exps = matchExperiments(question, filters);
  const { answer, strength, findings, limitations, followUps } = buildAnswer(question, exps);
  const citations: Citation[] = exps.slice(0, 3).map((e, i) => {
    const s = SOURCES.find((x) => x.id === e.sourceId);
    return { n: i + 1, sourceId: e.sourceId, page: s?.page ?? "", label: s?.title ?? e.sourceId };
  });
  // Insufficient when nothing matched or when a gap query finds only thin (Limited) support.
  const insufficient = exps.length === 0 || (detected === "gap" && !exps.some((e) => e.evidenceStrength !== "Limited"));
  const traceId = `trace-${Date.now()}`;
  const message: ChatMessage = {
    id: `m-${Date.now()}`,
    role: "assistant",
    text: question,
    mode: detected,
    answer,
    findings,
    limitations,
    strength,
    citations,
    experimentIds: exps.map((e) => e.id),
    figureIds: detected === "figure" ? ["FIG-01", "FIG-04"] : ["FIG-01"],
    followUps,
    traceId,
    insufficient,
    createdAt: Date.now(),
  };
  const trace: EvidenceTrace = {
    id: traceId,
    question,
    classification: `${detected} → ${detected === "ask" ? "hybrid retrieval + rerank" : detected === "compare" ? "SQL on structured table" : detected === "figure" ? "figure retrieval" : detected === "scenario" ? "condition-matched retrieval" : "coverage analysis"}`,
    steps: [
      { title: "Question", detail: question },
      { title: "Query classification", detail: `Router selected the "${detected}" path.` },
      { title: "Retrieval", detail: `Ranked ${exps.length} demo experiments by filter + keyword overlap (mock).` },
      { title: "Retrieved evidence", detail: exps.map((e) => e.id).join(", ") || "none" },
      { title: "Verification", detail: `${citations.length} claims traced to demo sources; wording restricted to "supported by available evidence".` },
      { title: "Final answer", detail: `Evidence strength: ${strength}. Rendered with citations and follow-ups.` },
    ],
    verifiedClaims: citations.length,
    totalClaims: citations.length,
  };
  traceCache.set(traceId, trace);
  return { message, trace };
}

const traceCache = new Map<string, EvidenceTrace>();

export async function getEvidenceTrace(id: string): Promise<EvidenceTrace> {
  if (API_BASE) {
    const r = await fetch(`${API_BASE}/api/trace/${id}`);
    if (!r.ok) throw new Error("Trace not found");
    return r.json();
  }
  await delay(300);
  const t = traceCache.get(id);
  if (t) return t;
  return {
    id,
    question: "Selected answer",
    classification: "explain → hybrid retrieval + rerank",
    steps: [
      { title: "Question", detail: "Selected answer" },
      { title: "Query classification", detail: "Router path: explain." },
      { title: "Retrieval", detail: "Demo-ranked experiments." },
      { title: "Retrieved evidence", detail: "EXP-001, EXP-002" },
      { title: "Verification", detail: "Claims traced to demo sources." },
      { title: "Final answer", detail: "Rendered with evidence-strength label." },
    ],
    verifiedClaims: 2,
    totalClaims: 2,
  };
}

export async function getCoverage(): Promise<CoverageResponse> {
  if (API_BASE) {
    const r = await fetch(`${API_BASE}/api/coverage`);
    if (!r.ok) throw new Error("Coverage request failed");
    return r.json();
  }
  await delay(300);
  return { cells: COVERAGE_CELLS, gaps: KNOWLEDGE_GAPS };
}

export async function compareExperiments(ids: string[]): Promise<Experiment[]> {
  if (API_BASE) {
    const r = await fetch(`${API_BASE}/api/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experimentIds: ids }),
    });
    if (!r.ok) throw new Error("Compare request failed");
    return r.json();
  }
  await delay(250);
  return EXPERIMENTS.filter((e) => ids.includes(e.id));
}

export function experimentById(id: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.id === id);
}

export function sourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}

export function figureById(id: string): Figure | undefined {
  return FIGURES.find((f) => f.id === id);
}

/** Demo figures attached to an experiment (mock figure retrieval). */
export function figuresForExperiment(experimentId: string): Figure[] {
  return FIGURES.filter((f) => f.experimentId === experimentId);
}
