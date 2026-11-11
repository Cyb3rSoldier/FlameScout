import type { Experiment, EnvironmentId, MissionEnvironment, RankedExperiment, RankingFactor } from "../types";
import { EXPERIMENTS } from "../data/experiments";

/**
 * Mission-fit ranking — transparent heuristic scoring, no ML oracle.
 *
 * Score an investigation's relevance to a crewed environment along four
 * published-intent factors (weights sum to 1):
 *   1. Atmosphere overlap    (0.35) — how close test O₂/pressure sit to the
 *      environment's expected atmosphere (Moon Base / suit / cabin).
 *   2. Safety-pillar match   (0.30) — prevention/detection/suppression
 *      relevance of the investigation vs the environment's dominant needs.
 *   3. Materials directness  (0.20) — solid-material evidence (what burns in
 *      a crewed volume) vs droplet/gas proxies.
 *   4. Evidence strength     (0.15) — published-data depth for the record.
 *
 * Factors return 0..1 and are reported in the UI so the ranking is auditable,
 * not a black box. Planned records (LUCI / FM²) are excluded from scoring —
 * they have no data — but exposed on the ranking page as "roadmapOnly".
 */

export const MISSION_ENVIRONMENTS: MissionEnvironment[] = [
  {
    id: "spacecraft",
    name: "Spacecraft / Space Station",
    o2: 21,
    pressure: 101,
    note: "Cabin-like ≈21% O₂ · ≈101 kPa (ISS heritage)",
  },
  {
    id: "lunar-base",
    name: "Moon Base",
    o2: 30,
    pressure: 70,
    note: "≥30% O₂ · ≤10.2 psi (≈70 kPa) — intermediate between suit and Earth",
  },
  {
    id: "pressurized-rover",
    name: "Pressurized Rover",
    o2: 30,
    pressure: 70,
    note: "Same as Moon Base per the challenge statement: ≥30% O₂ · ≤10.2 psi (≈70 kPa)",
  },
  {
    id: "space-suit",
    name: "Spacesuit (EVA)",
    o2: 100,
    pressure: 30,
    note: "100% O₂ at 4.3 psi (≈30 kPa)",
  },
  {
    id: "mars-habitat",
    name: "Mars Habitat (Moon Base stand-in)",
    o2: 30,
    pressure: 70,
    note: "NASA has not defined a Mars atmosphere — scored with the Moon Base atmosphere as a stand-in",
  },
];

/** Environment needs as pillar weights (prevention always nonzero). */
const ENV_PILLARS: Record<EnvironmentId, { prevention: number; detection: number; suppression: number }> = {
  spacecraft: { prevention: 0.6, detection: 0.9, suppression: 0.8 },
  "lunar-base": { prevention: 1.0, detection: 0.7, suppression: 0.7 },
  "pressurized-rover": { prevention: 1.0, detection: 0.6, suppression: 0.7 },
  "space-suit": { prevention: 1.0, detection: 0.4, suppression: 0.9 },
  "mars-habitat": { prevention: 0.9, detection: 0.7, suppression: 0.7 },
};

const STRENGTH_SCORE: Record<NonNullable<Experiment["evidenceStrength"]>, number> = {
  Strong: 1,
  Moderate: 0.66,
  Limited: 0.33,
};

const gapToRange = (v: number, range: [number, number]) => (v < range[0] ? range[0] - v : v > range[1] ? v - range[1] : 0);

function atmosphereFactor(e: Experiment, env: MissionEnvironment): { score: number; note: string } {
  if (e.oxygen === null)
    return {
      score: 0.35,
      note: "No O₂ atmosphere anchor (smoke/dust line) — score capped; pillar/detection still contributes",
    };
  // Prefer the real tested span; fall back to the representative anchor.
  const o2Gap = e.oxygenRange ? gapToRange(env.o2, e.oxygenRange) : Math.abs(e.oxygen - env.o2);
  const pRange = e.pressureRange;
  const pGap = pRange ? gapToRange(env.pressure, pRange) : e.pressure !== null ? Math.abs(e.pressure - env.pressure) : null;
  // O₂ drives flammability hardest above ~23% — penalize large gaps.
  const o2Score = Math.max(0, 1 - o2Gap / 50);
  const pScore = pGap === null ? 0.5 : Math.max(0, 1 - pGap / 60);
  let score = 0.7 * o2Score + 0.3 * pScore;
  const o2Label = e.oxygenNote ?? `${e.oxygen}% O₂ (representative anchor)`;
  let note =
    o2Gap <= 5
      ? `Test O₂ ${o2Label} is close to this environment's atmosphere`
      : o2Gap <= 12
        ? `Test O₂ ${o2Label} sits inside the intermediate regime (nearer than cabin-like data)`
        : `Test O₂ ${o2Label} differs from this environment's atmosphere (≈${env.o2}% O₂)`;
  // Ranges can each cover an atmosphere without any single test matching both values.
  const joint = e.jointTests?.[env.id];
  if (joint === 0) {
    score = Math.min(score, 0.6);
    note = `O₂ and pressure ranges each reach this atmosphere, but 0 real tests have both (≈${env.o2}% O₂ and ≈${env.pressure} kPa)`;
  }
  return { score, note };
}

function pillarFactor(e: Experiment, envId: EnvironmentId): { score: number; note: string; pillar: string } {
  const needs = ENV_PILLARS[envId];
  const focus = e.fireFocus ?? ["combustion-physics"];
  const pillarScores = {
    prevention: focus.includes("prevention") ? 1 : 0.45,
    detection: focus.includes("detection") ? 1 : 0.4,
    suppression: focus.includes("suppression") ? 1 : 0.5,
  };
  const combined =
    (needs.prevention * pillarScores.prevention +
      needs.detection * pillarScores.detection +
      needs.suppression * pillarScores.suppression) /
    (needs.prevention + needs.detection + needs.suppression);
  // Name the dominant matched pillar for the "why it ranks here" line.
  const matched = focus.find((f) => f !== "combustion-physics") ?? "combustion physics";
  const note =
    matched === "prevention"
      ? "Feeds material-selection / atmosphere-control evidence (prevention pillar)"
      : matched === "detection"
        ? "Feeds smoke-particle / detector-design evidence (detection pillar)"
        : matched === "suppression"
          ? "Feeds extinguishing-atmosphere / extinction-limit evidence (suppression pillar)"
          : "Physics-of-flames record — indirect fire-safety value";
  return { score: combined, note, pillar: matched };
}

function materialsFactor(e: Experiment): { score: number; note: string } {
  const fuel = e.fuel.toLowerCase();
  if (fuel.includes("solid") || fuel.includes("fabric") || fuel.includes("(planned)"))
    return { score: 1, note: "Solid-material evidence — what crewed volumes are actually made of" };
  if (fuel.includes("droplet") || fuel.includes("smoke"))
    return { score: 0.65, note: "Liquid-droplet / smoke evidence — strong proxy, not a solid-material result" };
  if (fuel.includes("emulating") || fuel.includes("mixed material"))
    return { score: 0.75, note: "Emulated / multi-material evidence" };
  if (fuel.includes("dust") || fuel.includes("no combustion"))
    return { score: 0.35, note: "Non-combustion ambient measurement — background context only" };
  return { score: 0.5, note: "Gaseous-fuel evidence — controlled proxy, not a solid-material result" };
}

export function rankForEnvironment(envId: EnvironmentId, experiments: Experiment[] = EXPERIMENTS): RankedExperiment[] {
  const env = MISSION_ENVIRONMENTS.find((m) => m.id === envId)!;
  const ranked: RankedExperiment[] = [];

  for (const e of experiments) {
    if (e.demo) continue; // synthetic mock rows never rank

    const atmo = atmosphereFactor(e, env);
    const pillar = pillarFactor(e, envId);
    const materials = materialsFactor(e);
    const strength = STRENGTH_SCORE[e.evidenceStrength] ?? 0.5;

    const total =
      0.35 * atmo.score + 0.3 * pillar.score + 0.2 * materials.score + 0.15 * strength;

    const factors: RankingFactor[] = [
      { name: "Atmosphere overlap", score: atmo.score, note: atmo.note },
      { name: "Safety-pillar match", score: pillar.score, note: pillar.note },
      { name: "Materials directness", score: materials.score, note: materials.note },
      { name: "Evidence strength", score: strength, note: `Published-data depth: ${e.evidenceStrength}` },
    ];

    // "Why it ranks here": dominant factor note.
    const dominant = factors.reduce((a, b) => (b.score > a.score ? b : a), factors[0]);
    const planned = e.title.includes("planned");
    ranked.push({
      experiment: e,
      total: Math.round(total * 100),
      rank: 0,
      factors,
      reason: planned
        ? `Planned record — ${dominant.note.toLowerCase()}, no data yet (roadmap line)`
        : dominant.note,
    });
  }

  ranked.sort((a, b) => b.total - a.total);
  ranked.forEach((r, i) => (r.rank = i + 1));
  return ranked;
}

/** The no-data roadmap records, surfaced separately on the ranking page. */
export function roadmapRecords(experiments: Experiment[] = EXPERIMENTS): Experiment[] {
  return experiments.filter((e) => !e.demo && e.title.includes("planned"));
}
