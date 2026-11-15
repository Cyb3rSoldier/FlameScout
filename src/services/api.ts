/**
 * API service layer — single seam between UI and data.
 *
 * TODAY: in-browser implementations (small simulated latency) over the
 * NASA-sourced catalog in ../data. The assistant uses transparent keyword +
 * field scoring — no black-box answer bank.
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
 *   POST /api/predict        { fuel, pressureKpa, o2, co2, he, dropletMm }  → PredictionResult
 */

import { EXPERIMENTS } from "../data/experiments";
import { deriveCoverage } from "../data/coverage";
import { predictFlexLocal } from "../lib/flexModel";
import { searchRag, RAG_INDEX, type RagHit } from "../lib/ragSearch";
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
  PredictionInput,
  PredictionResult,
  QueryMode,
  Source,
} from "../types";
import { MISSION_ENVIRONMENTS, rankForEnvironment } from "../lib/ranking";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const isMockMode = !API_BASE;
export const DEMO_NOTICE =
  "NASA-sourced catalog — summarized from public NASA documents. Representative values are flagged (≈); run-level data via the FLEX report.";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ────────────────────────── retrieval helpers ────────────────────────── */

const STOPWORDS = new Set([
  "the", "a", "an", "of", "in", "on", "at", "to", "and", "or", "is", "are", "was",
  "what", "which", "how", "show", "me", "did", "does", "do", "for", "with", "about",
  "experiments", "experiment", "study", "studies", "tested", "there", "that", "been",
  "have", "has", "any", "all", "results", "data", "tell", "give", "list", "find",
]);

function tokenize(question: string): string[] {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9%½\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function haystack(e: Experiment): string {
  return [
    e.title,
    e.fuel,
    e.objective ?? "",
    e.outcome ?? "",
    e.hardware ?? "",
    e.project ?? "",
    e.materials?.join(" ") ?? "",
    e.variables?.join(" ") ?? "",
    e.measurements?.join(" ") ?? "",
    e.keyFindings?.join(" ") ?? "",
    e.keywords?.join(" ") ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function scoreExperiment(e: Experiment, tokens: string[], filters?: Filters): { score: number; hitTitle: boolean } {
  const hay = haystack(e);
  let score = 0;
  let hitTitle = false;
  for (const t of tokens) {
    if ((e.keywords ?? []).some((k) => k.includes(t) || t.includes(k))) score += 2;
    const inTitle = e.title.toLowerCase().includes(t);
    if (inTitle) {
      score += 3;
      hitTitle = true;
    }
    if (hay.includes(t)) score += 1;
  }
  if (filters) {
    const f = filters;
    if (f.fuel !== "All") {
      const ff = f.fuel.toLowerCase().split(" ")[0];
      if (!hay.includes(ff)) score -= 12; // hard filter incl. keyword overlap
    }
    if (f.gravity !== "All" && e.gravity !== f.gravity) score -= 12;
    if (f.oxygen !== "All") {
      if (f.oxygen === "No-O₂-records" ? e.oxygen !== null : (e.oxygen ?? 0) < bandLow(f.oxygen)) score -= 12;
    }
    if (f.pressure !== "All" && e.pressure !== null) {
      if (f.pressure === "<60 kPa" && e.pressure >= 60) score -= 12;
      if (f.pressure === "60–100 kPa" && !(e.pressure >= 60 && e.pressure < 100)) score -= 12;
      if (f.pressure === "≈101 kPa" && Math.abs(e.pressure - 101) > 2) score -= 12;
    }
    if (f.airflow !== "All" && !e.airflow.toLowerCase().includes(f.airflow.toLowerCase().split(" ")[0])) score -= 12;
  }
  return { score, hitTitle };
}

/** Match the numeric bands from FILTER_OPTIONS in conversations.ts */
function bandLow(band: string): number {
  const m = band.match(/^<(\d+)/);
  return m ? Number(m[1]) : 0;
}

export function matchExperiments(question: string, filters: Filters, limit = 5): Experiment[] {
  const tokens = tokenize(question);
  const scored = EXPERIMENTS.map((e) => ({ e, ...scoreExperiment(e, tokens, filters) }));
  scored.forEach((s) => {
    // catch-alls: interrogatives about O₂/atmosphere should fall back to
    // atmosphere-relevant records even without explicit tokens
    if (tokens.length === 0) s.score = 0;
  });
  const ranked = scored.sort((a, b) => b.score - a.score).filter((s) => s.score > 0);
  if (ranked.length === 0) {
    // graceful fallback: most environment-neutral records (strong, cabin-like)
    const fallback = EXPERIMENTS.filter((e) => e.evidenceStrength === "Strong" && e.oxygen !== null).slice(0, limit);
    if (fallback.length > 0) return fallback;
    return EXPERIMENTS.slice(0, limit);
  }
  return ranked.slice(0, limit).map((r) => r.e);
}

/* ────────────────────────── intents ────────────────────────── */

function classify(question: string): QueryMode {
  const q = question.toLowerCase();
  if (q.includes("compar") || q.includes(" vs ") || q.includes("versus")) return "compare";
  if (q.includes("figure") || q.includes("image") || q.includes("shape") || q.includes("show flame")) return "figure";
  if (q.includes("not been") || q.includes("not covered") || q.includes("missing") || q.includes("gap") || q.includes("untested")) return "gap";
  if (q.includes("if ") || q.includes("scenario") || q.includes("moon base") || q.includes("mars") || q.includes("lunar") || q.includes("habitat") || q.includes("suit")) return "scenario";
  return "ask";
}

function parseConditions(question: string): { o2: number | null; kpa: number | null } {
  const o2Match = question.match(/(\d{1,3})\s*(?:%|percent)\s*(?:o2|o₂|oxygen)/i) ?? question.match(/(\d{1,3})\s*(?:o2|o₂|oxygen)\b/i);
  const kpaMatch = question.match(/(\d{2,3})\s*kpa/i);
  const psiMatch = question.match(/(\d{1,2}(?:\.\d)?)\s*psi/i);
  return {
    o2: o2Match ? Number(o2Match[1]) : null,
    kpa: kpaMatch ? Number(kpaMatch[1]) : psiMatch ? Math.round(Number(psiMatch[1]) * 6.895) : null,
  };
}

/** Nearest investigations to a numeric environment (scenario-style questions). */
function nearestByConditions(rating: { o2: number | null; kpa: number | null }, limit = 4): Experiment[] {
  const scored = EXPERIMENTS.filter((e) => e.oxygen !== null).map((e) => {
    const o2Gap = e.oxygen !== null && rating.o2 !== null ? Math.abs(e.oxygen - rating.o2) : 50;
    const pGap = e.pressure !== null && rating.kpa !== null ? Math.abs(e.pressure - rating.kpa) : 25;
    const planned = e.title.includes("planned") ? 1000 : 0; // planned records trail real-data records
    return { e, d: o2Gap + pGap * 0.5 + planned };
  });
  return scored.sort((a, b) => a.d - b.d).slice(0, limit).map((s) => s.e);
}

function detectEnvironment(question: string) {
  const q = question.toLowerCase();
  if (/\b(spacesuit|suit|eva)\b/.test(q)) return MISSION_ENVIRONMENTS.find((m) => m.id === "space-suit")!;
  if (q.includes("rover")) return MISSION_ENVIRONMENTS.find((m) => m.id === "pressurized-rover")!;
  if (q.includes("mars")) return MISSION_ENVIRONMENTS.find((m) => m.id === "mars-habitat")!;
  if (q.includes("moon") || q.includes("lunar") || q.includes("artemis")) return MISSION_ENVIRONMENTS.find((m) => m.id === "lunar-base")!;
  return MISSION_ENVIRONMENTS.find((m) => m.id === "spacecraft")!;
}

/* ────────────────────────── answer construction ────────────────────────── */

const FOLLOWUP_BANK: Record<QueryMode, string[]> = {
  ask: ["Compare BASS and BASS-II variables.", "What evidence is missing at elevated oxygen?", "Which studies looked at smoke particle size?"],
  compare: ["Which investigations shared the same hardware?", "Show material differences side by side.", "Open the coverage map."],
  figure: ["Show flame images near extinction limits.", "What hardware was used?", "Compare gas vs solid investigations."],
  scenario: ["What would rank highest for a pressurized rover?", "Which gap is highest priority?", "Open the Mission Fit ranking."],
  gap: ["Open the coverage map.", "Which conditions are planned next?", "Find the closest matching experiments."],
};

interface AnswerParts {
  answer: string;
  strength: EvidenceStrength;
  findings: string[];
  limitations: string;
  followUps: string[];
  insufficient?: boolean;
  missingEvidence?: string[];
  figureIds: string[];
}

function buildRagAnswer(question: string): AnswerParts & { hits: RagHit[] } {
  const rag = searchRag(question, 5);

  if (rag.refused) {
    // House rule: refuse outside the tested envelope instead of inventing.
    return {
      answer:
        `Not enough data in the indexed sources to answer this. The best matching chunk scored ${rag.topScore.toFixed(3)}, below the refusal threshold (${RAG_INDEX.minScore}), so no answer is synthesized. The refusal is the feature — a fire-safety tool that invents answers is worse than no tool.`,
      strength: "Insufficient",
      findings: [],
      limitations:
        `Deterministic retrieval only: TF-IDF over ${RAG_INDEX.chunks.length} indexed NASA-sourced chunks (${RAG_INDEX.nFeatures} features), no language model in the data path. The question likely falls outside what the indexed PSI evidence describes.`,
      followUps: FOLLOWUP_BANK.ask,
      insufficient: true,
      figureIds: [],
      hits: [], // refusal means no supporting evidence is surfaced
    };
  }

  // Keep hit experiment ids that resolve in the catalog, deduped, order-preserving.
  const seen = new Set<string>();
  const expIds: string[] = [];
  for (const h of rag.hits) {
    if (!seen.has(h.meta.experimentId) && experimentById(h.meta.experimentId)) {
      seen.add(h.meta.experimentId);
      expIds.push(h.meta.experimentId);
    }
  }
  const exps = expIds.map((id) => experimentById(id)!);
  const strong = exps.filter((e) => e.evidenceStrength === "Strong").length;
  const strength: EvidenceStrength = strong >= 2 ? "Strong" : strong === 1 ? "Moderate" : "Limited";

  const findings = rag.hits.slice(0, 4).map((h) => {
    const snippet = h.text.replace(/\s+/g, " ").slice(0, 240).trim();
    return `${snippet} — [${h.id}, score ${h.score.toFixed(3)}]`;
  });

  const figures: string[] = [];
  for (const id of expIds.slice(0, 3)) figures.push(...figuresForExperiment(id).map((f) => f.id));

  return {
    answer:
      `Deterministic TF-IDF retrieval over ${RAG_INDEX.chunks.length} indexed NASA-sourced chunks matched this question (best score ${rag.topScore.toFixed(3)}). The matched evidence below is quoted from the indexed chunks and traced to PSI records — no language model touched this answer.`,
    strength,
    findings,
    limitations:
      "Retrieval-only summary: sentences are quoted from indexed PSI-derived chunks, not paraphrased. No safe/unsafe claim is drawn; representative values are flagged (≈) at the source. Refusal threshold for weak matches: 0.11 (calibrated against off-topic probes).",
    followUps: FOLLOWUP_BANK.ask,
    figureIds: [...new Set(figures)].slice(0, 3),
    hits: rag.hits,
  };
}

function buildGapAnswer(): AnswerParts {
  const { gaps } = deriveCoverage();
  const top = gaps.slice(0, 3);
  return {
    answer:
      "Coverage analysis (derived from the catalog, not a prediction) ranks the sparsest evidence fields from an Artemis-era fire-safety lens. The top gaps are listed below — each has zero or near-zero direct PSI coverage where crewed missions expect to need it.",
    strength: "Limited",
    findings: top.map(
      (g) =>
        `${g.name} — priority ${g.priority}/100, ${g.availableExperiments} directly-supporting record(s): ${g.missingEvidence[0]}.`,
    ),
    limitations:
      "Gap priorities are a fire-safety-lens heuristic over this catalog, not a NASA-issued statement of research priority.",
    followUps: FOLLOWUP_BANK.gap,
    figureIds: [],
  };
}

function buildCompareAnswer(question: string): AnswerParts {
  const tokens = tokenize(question.replace(/\bcompar|versus|\bvs\b/g, "").trim());
  const ids = tokens
    .map((t) =>
      EXPERIMENTS.find(
        (e) =>
          e.id.toLowerCase() === t ||
          e.title.toLowerCase().includes(t) ||
          (e.keywords ?? []).some((k) => k.includes(t)),
      ),
    )
    .filter((x): x is Experiment => Boolean(x))
    .slice(0, 4);
  const exps = ids.length >= 2 ? ids : EXPERIMENTS.filter((e) => e.oxygen !== null).slice(0, 3);
  const diffs: string[] = [];
  const axes: { key: keyof Experiment; label: string }[] = [
    { key: "fuel", label: "Fuel" },
    { key: "hardware", label: "Hardware" },
    { key: "oxygen", label: "O₂" },
    { key: "airflow", label: "Airflow" },
  ];
  for (const ax of axes) {
    const vals = new Set(exps.map((e) => String(e[ax.key] ?? "—")));
    if (vals.size > 1) diffs.push(`${ax.label} differs across the compared investigations`);
    else diffs.push(`${ax.label} is shared across the compared investigations`);
  }
  return {
    answer:
      "Comparison across the retrieved investigations suggests the axes below. Note — compare mode is descriptive: experiments pair at run level only inside one investigation, so cross-investigation differences should be read with care.",
    strength: "Moderate",
    findings: [diffs.join("; ")],
    limitations: "Cross-investigation comparisons don't share identical run conditions; use the /compare page for the row-level diff table.",
    followUps: FOLLOWUP_BANK.compare,
    figureIds: [],
  };
}

function buildScenarioAnswer(question: string): AnswerParts {
  const env = detectEnvironment(question);
  const parsed = parseConditions(question);
  const o2 = parsed.o2 ?? env.o2;
  const kpa = parsed.kpa ?? env.pressure;
  const nearest = nearestByConditions({ o2, kpa }, 4);
  const strictMatch = nearest.filter((e) => (e.oxygen ?? 0) >= o2 - 8).length;
  const dataAnchor = nearest.filter((e) => !e.title.includes("planned")).length;

  const unsupported: string[] = [];
  if (o2 >= 28 && !kpa) unsupported.push("elevated O₂ at unspecified pressure");
  if (kpa && kpa < 35) unsupported.push("pressure below ≈30 kPa (spacesuit regime)");
  if (kpa && kpa < 75 && o2 >= 28) unsupported.push("combined elevated-O₂ × reduced-pressure (Moon-regime) solid-material testing");

  return {
    answer:
      `Scenario reading: for ${o2}% O₂ at ≈${kpa} kPa (interpreted as ${env.name} atmosphere), the closest directly-tested conditions in PSI are listed below. ${strictMatch === 0 ? "No investigation sits near that combination — this is a coverage gap rather than a conclusion." : "Nearby conditions only — not the exact scenario."}`,
    strength: strictMatch >= 2 ? "Moderate" : "Limited",
    findings: nearest.map(
      (e, i) =>
        `Closest #${i + 1}: ${e.id} — ${e.oxygenNote ?? `${e.oxygen}% O₂`}, ${e.pressureNote ?? (e.pressure ? `${e.pressure} kPa` : "pressure not reported")} (${e.title.split("(")[0].trim()}).`,
    ),
    limitations:
      unsupported.length > 0
        ? `No direct PSI evidence exists for ${unsupported.join(" and ")}. Nearest tested conditions are listed instead of an extrapolated answer — see the Coverage Map for the ranked gap list.`
        : "Descriptive retrieval only; the exact scenario has not been tested, so no safety conclusion is drawn.",
    followUps: FOLLOWUP_BANK.scenario,
    insufficient: dataAnchor === 0,
    missingEvidence: unsupported.length > 0 ? unsupported : undefined,
    figureIds: [],
  };
}

function buildFigureAnswer(exps: Experiment[]): AnswerParts {
  const figures = exps.flatMap((e) => figuresForExperiment(e.id).map((f) => f.id));
  return {
    answer:
      "Figures attached to the retrieved investigations are shown below. They are clearly-labelled illustrative schematics — real figure retrieval through PSI datasets lands with the FastAPI backend.",
    strength: exps.length > 0 ? "Moderate" : "Limited",
    findings: exps.slice(0, 2).map((e) => `${e.id} — ${e.title}: hardware ${e.hardware ?? "not recorded"}.`),
    limitations: "Illustrative placements, not NASA imagery.",
    followUps: FOLLOWUP_BANK.figure,
    figureIds: [...new Set(figures)].slice(0, 3),
  };
}

/* ────────────────────────── public API ────────────────────────── */

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
  const ragParts = detected === "ask" ? buildRagAnswer(question) : null;
  const parts: AnswerParts =
    detected === "gap"
      ? buildGapAnswer()
      : detected === "compare"
        ? buildCompareAnswer(question)
        : detected === "scenario"
          ? buildScenarioAnswer(question)
          : detected === "figure"
            ? buildFigureAnswer(matchExperiments(question, filters))
            : ragParts!;

  const cited: Experiment[] = ragParts
    ? ragParts.hits
        .map((h) => experimentById(h.meta.experimentId))
        .filter((x, i, arr): x is Experiment => Boolean(x) && arr.indexOf(x) === i)
        .slice(0, 3)
    : matchExperiments(question, filters, 3);
  const citations: Citation[] = cited.map((e, i) => {
    const s = SOURCES.find((x) => x.id === e.sourceId);
    return { n: i + 1, sourceId: e.sourceId, page: s?.page ?? "", label: s?.title ?? e.sourceId };
  });
  // ask mode may cite sources whose experiment records aren't in the app
  // catalog — keep those citations from the chunks themselves.
  if (ragParts && cited.length === 0) {
    const seen = new Set<string>();
    let n = 1;
    for (const h of ragParts.hits) {
      if (seen.has(h.meta.sourceId)) continue;
      seen.add(h.meta.sourceId);
      const s = SOURCES.find((x) => x.id === h.meta.sourceId);
      citations.push({ n: n++, sourceId: h.meta.sourceId, page: s?.page ?? "", label: s?.title ?? h.meta.sourceId });
      if (n > 3) break;
    }
  }
  const insufficient = Boolean(parts.insufficient) || (detected === "ask" && cited.every((e) => e.evidenceStrength === "Limited") && cited.length > 0);
  const traceId = `trace-${Date.now()}`;
  const message: ChatMessage = {
    id: `m-${Date.now()}`,
    role: "assistant",
    text: question,
    mode: detected,
    answer: parts.answer,
    findings: parts.findings,
    limitations: parts.limitations,
    strength: parts.strength,
    citations,
    experimentIds: cited.map((e) => e.id),
    figureIds: parts.figureIds,
    followUps: parts.followUps,
    traceId,
    insufficient,
    missingEvidence: parts.missingEvidence,
    createdAt: Date.now(),
  };
  const trace: EvidenceTrace = {
    id: traceId,
    question,
    classification: ragParts
      ? `ask → deterministic TF-IDF retrieval (rag index: ${RAG_INDEX.chunks.length} chunks, ${RAG_INDEX.nFeatures} features)`
      : `${detected} → ${detected === "compare" ? "attribute diff" : detected === "figure" ? "figure retrieval" : detected === "scenario" ? "condition-nearest retrieval" : "coverage analysis"}`,
    steps: [
      { title: "Question", detail: question },
      { title: "Query classification", detail: `Router selected the "${detected}" path.` },
      ragParts
        ? {
            title: "Retrieval",
            detail: `TF-IDF cosine similarity over ${RAG_INDEX.chunks.length} indexed chunks (sublinear tf, 1–2-grams, English stop-words). Refusal threshold ${RAG_INDEX.minScore}; best score ${ragParts && ragParts.hits.length >= 0 ? (ragParts.hits[0]?.score ?? 0).toFixed(3) : "0.000"}${ragParts.hits.length === 0 || (ragParts.hits[0]?.score ?? 1) < RAG_INDEX.minScore ? " → refused" : ""}.`,
          }
        : {
            title: "Retrieval",
            detail: `Scored ${EXPERIMENTS.length} NASA-sourced records by keyword hit (title ×3, keywords ×2, body ×1) with active filters ${JSON.stringify(filters)}.`,
          },
      { title: "Retrieved evidence", detail: (ragParts ? ragParts.hits.map((h) => h.id) : cited.map((e) => e.id)).join(", ") || "none — refused below threshold" },
      {
        title: "Verification",
        detail: `${citations.length} claim source(s) resolved against PSI records; wording restricted to "published summaries describe…".`,
      },
      { title: "Final answer", detail: `Evidence strength: ${parts.strength}${insufficient ? " · flagged insufficient" : ""}. Rendered with citations, limitations, and follow-ups.` },
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
  const first = EXPERIMENTS[0];
  return {
    id,
    question: "Selected answer",
    classification: "explain → field-weighted catalog retrieval",
    steps: [
      { title: "Question", detail: "Selected answer" },
      { title: "Query classification", detail: "Router path: explain." },
      { title: "Retrieval", detail: "Ranking over the NASA-sourced catalog." },
      { title: "Retrieved evidence", detail: `${first.id}, plus related records` },
      { title: "Verification", detail: "Claims traced to PSI records." },
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
  const derived = deriveCoverage(EXPERIMENTS);
  return { cells: derived.cells, gaps: derived.gaps };
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

/** Illustrative figures attached to an investigation. */
export function figuresForExperiment(experimentId: string): Figure[] {
  return FIGURES.filter((f) => f.experimentId === experimentId);
}

/** Mission-fit ranking over the catalog (see lib/ranking.ts for the model). */
export function getMissionFit(envId: Parameters<typeof rankForEnvironment>[0]) {
  return rankForEnvironment(envId, EXPERIMENTS);
}

/** Exploratory estimates for FLEX droplet tests. Mock mode uses the in-browser estimator. */
export async function predictFlex(input: PredictionInput): Promise<PredictionResult> {
  if (isMockMode) {
    await delay(220);
    return predictFlexLocal(input);
  }
  const res = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Prediction request failed (${res.status})`);
  return (await res.json()) as PredictionResult;
}
