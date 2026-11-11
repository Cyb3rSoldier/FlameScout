import { FLEX_SOURCE, FLEX_TESTS, type FlexTest } from "../data/flexTests";
import type {
  NearestTest,
  PredictionInput,
  PredictionResult,
  PredictionTarget,
  RangeStatus,
  TargetPrediction,
} from "../types";

/**
 * Demo estimator for the prediction page: distance-weighted nearest neighbours
 * over the real FLEX Table IX tests. It runs in the browser only while the app is in
 * mock mode. The FastAPI /api/predict endpoint should return the same PredictionResult
 * shape from the trained model, with its own `model` block.
 */

const K = 6;

const TARGETS: Record<PredictionTarget, { label: string; unit: string; digits: number; pick: (t: FlexTest) => number | null }> = {
  extinctionDiameter: { label: "Extinction diameter", unit: "mm", digits: 2, pick: (t) => t.dExt },
  burnTime: { label: "Burn time", unit: "s", digits: 1, pick: (t) => t.tBurn },
  burningRate: { label: "Burning rate", unit: "mm²/s", digits: 3, pick: (t) => t.rate },
};
export const TARGET_KEYS = Object.keys(TARGETS) as PredictionTarget[];
export const TARGET_META = TARGETS;

/** Held-out scores measured offline (5-fold CV grouped by test date) for this estimator. */
const HELD_OUT: Record<PredictionTarget, { r2: number; mae: number; n: number }> = {
  extinctionDiameter: { r2: 0.67, mae: 0.447, n: 197 },
  burnTime: { r2: 0.58, mae: 3.6, n: 261 },
  burningRate: { r2: 0.63, mae: 0.057, n: 259 },
};

type Vec = [number, number, number, number, number, number];
const WEIGHTS: Vec = [2, 1, 1, 1, 1, 1];

const complete = FLEX_TESTS.filter((t) => t.p !== null && t.d0 !== null);
const vec = (fuel: string, p: number, o2: number, co2: number, he: number, d0: number): Vec => [
  fuel === "methanol" ? 1 : 0, Math.log(p), o2, co2, he, d0,
];
const toVec = (t: FlexTest): Vec => vec(t.fuel, t.p as number, t.o2, t.co2, t.he, t.d0 as number);

const rows = complete.map((t) => ({ t, v: toVec(t) }));
const mu = [0, 1, 2, 3, 4, 5].map((i) => rows.reduce((s, r) => s + r.v[i], 0) / rows.length);
const sd = [0, 1, 2, 3, 4, 5].map((i) => Math.sqrt(rows.reduce((s, r) => s + (r.v[i] - mu[i]) ** 2, 0) / rows.length) || 1);
const dist = (a: Vec, b: Vec) => Math.sqrt(a.reduce((s, x, i) => s + (((x - b[i]) / sd[i]) * WEIGHTS[i]) ** 2, 0));

/** "Sparse" threshold: 95th percentile of each real test's distance to its nearest other test. */
const looNearest = rows.map((r) => Math.min(...rows.filter((o) => o !== r).map((o) => dist(r.v, o.v)))).sort((a, b) => a - b);
const SPARSE_DISTANCE = looNearest[Math.floor(looNearest.length * 0.95)];

const range = (fuel: string, pick: (t: FlexTest) => number | null): [number, number] => {
  const xs = FLEX_TESTS.filter((t) => t.fuel === fuel).map(pick).filter((x): x is number => x !== null);
  return [Math.min(...xs), Math.max(...xs)];
};

export const INPUT_LIMITS = {
  pressureKpa: { min: 70, max: 310 },
  o2: { min: 12, max: 34 },
  co2: { min: 0, max: 70 },
  he: { min: 0, max: 45 },
  dropletMm: { min: 1.1, max: 4.7 },
};

function neighbours(input: PredictionInput, pick: (t: FlexTest) => number | null) {
  const q = vec(input.fuel, input.pressureKpa, input.o2 / 100, input.co2 / 100, input.he / 100, input.dropletMm);
  return rows
    .filter((r) => pick(r.t) !== null)
    .map((r) => ({ t: r.t, d: dist(q, r.v), y: pick(r.t) as number }))
    .sort((a, b) => a.d - b.d)
    .slice(0, K);
}

function estimate(input: PredictionInput, key: PredictionTarget): TargetPrediction {
  const meta = TARGETS[key];
  const nn = neighbours(input, meta.pick);
  const w = nn.map((n) => 1 / (n.d + 0.15));
  const wsum = w.reduce((a, b) => a + b, 0);
  const mean = nn.reduce((s, n, i) => s + n.y * w[i], 0) / wsum;
  const spread = Math.sqrt(nn.reduce((s, n, i) => s + w[i] * (n.y - mean) ** 2, 0) / wsum);
  const all = FLEX_TESTS.map(meta.pick).filter((x): x is number => x !== null);
  return {
    target: key, label: meta.label, unit: meta.unit, digits: meta.digits,
    value: mean, low: Math.max(0, mean - spread), high: mean + spread,
    dataRange: [Math.min(...all), Math.max(...all)],
    heldOut: HELD_OUT[key],
  };
}

function checkRange(input: PredictionInput): string[] {
  const issues: string[] = [];
  const [pLo, pHi] = range(input.fuel, (t) => t.p);
  const [oLo, oHi] = range(input.fuel, (t) => t.o2);
  const [dLo, dHi] = range(input.fuel, (t) => t.d0);
  const n2 = 100 - input.o2 - input.co2 - input.he;
  if (n2 < -0.001) issues.push("O₂ + CO₂ + He is above 100%, so there is no room for N₂.");
  if (input.pressureKpa < pLo - 0.5 || input.pressureKpa > pHi + 0.5) issues.push(`Pressure ${input.pressureKpa} kPa is outside the ${input.fuel} tests (${pLo.toFixed(0)}–${pHi.toFixed(0)} kPa).`);
  if (input.o2 / 100 < oLo - 0.0005 || input.o2 / 100 > oHi + 0.0005) issues.push(`O₂ ${input.o2}% is outside the ${input.fuel} tests (${(oLo * 100).toFixed(0)}–${(oHi * 100).toFixed(0)}%).`);
  if (input.dropletMm < dLo - 0.05 || input.dropletMm > dHi + 0.05) issues.push(`Droplet ${input.dropletMm} mm is outside the ${input.fuel} tests (${dLo.toFixed(1)}–${dHi.toFixed(1)} mm).`);
  if (input.co2 > 70.5 || input.he > 45.5) issues.push("CO₂ or He fraction is above anything tested.");
  return issues;
}

function toNearest(n: { t: FlexTest; d: number }): NearestTest {
  const t = n.t;
  return {
    id: t.id, fuel: t.fuel, pressureKpa: t.p as number, o2: t.o2 * 100, co2: t.co2 * 100, he: t.he * 100,
    dropletMm: t.d0 as number, extinctionDiameter: t.dExt, burningRate: t.rate, burnTime: t.tBurn, end: t.end,
    distance: n.d, citation: { source: FLEX_SOURCE, figure: t.fig, page: t.page },
  };
}

export function predictFlexLocal(input: PredictionInput): PredictionResult {
  const issues = checkRange(input);
  const model = {
    name: "Nearest-neighbour local estimator",
    note: "Averages the 6 closest real FLEX tests. Replaced by the trained model when the backend is connected.",
    trainedOn: `${complete.length} ISS droplet tests · ${FLEX_SOURCE} Table IX`,
  };
  const base = { model, source: FLEX_SOURCE, issues };

  if (issues.length) {
    return { ...base, status: "outside", predictions: [], nearest: [], similarCount: 0, sweep: null };
  }

  const nn = neighbours(input, (t) => t.rate ?? t.tBurn ?? t.dExt);
  const status: RangeStatus = nn[0].d > SPARSE_DISTANCE ? "sparse" : "inside";
  if (status === "sparse") issues.push("No real test is close to this exact setting, so treat the estimate as weak.");

  const similarCount = FLEX_TESTS.filter(
    (t) => t.fuel === input.fuel && t.p !== null && Math.abs(t.p - input.pressureKpa) / input.pressureKpa <= 0.15 && Math.abs(t.o2 * 100 - input.o2) <= 2,
  ).length;

  const sweep = {} as NonNullable<PredictionResult["sweep"]>;
  for (const key of TARGET_KEYS) {
    const curve = [];
    for (let o2 = 12; o2 <= 34; o2 += 1) curve.push({ o2, value: estimate({ ...input, o2 }, key).value as number });
    const observed = FLEX_TESTS.filter(
      (t) => t.fuel === input.fuel && t.p !== null && Math.abs(t.p - input.pressureKpa) / input.pressureKpa <= 0.15 && TARGETS[key].pick(t) !== null,
    ).map((t) => ({ o2: t.o2 * 100, value: TARGETS[key].pick(t) as number, id: t.id }));
    sweep[key] = { curve, observed };
  }

  return {
    ...base, status, similarCount, sweep,
    predictions: TARGET_KEYS.map((k) => estimate(input, k)),
    nearest: neighbours(input, (t) => t.rate ?? t.tBurn ?? t.dExt).map(toNearest),
  };
}
