import type { Experiment } from "../types";

/**
 * DEMO DATA — clearly-marked mock records for frontend development.
 * Replace with FastAPI responses later. Do not treat as real NASA findings.
 */
export const EXPERIMENTS: Experiment[] = [
  { id: "EXP-001", title: "Thin cellulose flame spread, quiescent microgravity", fuel: "Cellulose", oxygen: 21, pressure: 101, gravity: "Microgravity", airflow: "Quiescent", outcome: "Steady spread observed; available evidence describes spread rate trend with oxygen.", evidenceStrength: "Strong", sourceId: "SRC-01", demo: true },
  { id: "EXP-002", title: "Cellulose at reduced oxygen (18% O2)", fuel: "Cellulose", oxygen: 18, pressure: 101, gravity: "Microgravity", airflow: "Quiescent", outcome: "Slower spread reported in available evidence; near-limit behaviour noted.", evidenceStrength: "Moderate", sourceId: "SRC-01", demo: true },
  { id: "EXP-003", title: "PMMA rod, low pressure 60 kPa", fuel: "PMMA", oxygen: 21, pressure: 60, gravity: "Microgravity", airflow: "Low flow 5 cm/s", outcome: "Available evidence describes sustained burning with altered flame shape.", evidenceStrength: "Moderate", sourceId: "SRC-02", demo: true },
  { id: "EXP-004", title: "PMMA rod, very low pressure 40 kPa", fuel: "PMMA", oxygen: 21, pressure: 40, gravity: "Microgravity", airflow: "Quiescent", outcome: "Limited evidence available for this regime.", evidenceStrength: "Limited", sourceId: "SRC-02", demo: true },
  { id: "EXP-005", title: "Polyethylene wire insulation, opposed flow", fuel: "Polyethylene", oxygen: 21, pressure: 101, gravity: "Microgravity", airflow: "Opposed 10 cm/s", outcome: "Available evidence describes spread dependence on flow rate.", evidenceStrength: "Strong", sourceId: "SRC-03", demo: true },
  { id: "EXP-006", title: "Polyethylene, elevated oxygen 30%", fuel: "Polyethylene", oxygen: 30, pressure: 101, gravity: "Microgravity", airflow: "Opposed 10 cm/s", outcome: "Available evidence describes faster spread vs. 21% baseline.", evidenceStrength: "Moderate", sourceId: "SRC-03", demo: true },
  { id: "EXP-007", title: "Silicone sample, reduced gravity parabola", fuel: "Silicone", oxygen: 21, pressure: 101, gravity: "Reduced gravity", airflow: "Quiescent", outcome: "Available evidence describes self-extinguishment in some runs.", evidenceStrength: "Limited", sourceId: "SRC-04", demo: true },
  { id: "EXP-008", title: "Cotton fabric, concurrent flow", fuel: "Cotton", oxygen: 21, pressure: 101, gravity: "Microgravity", airflow: "Concurrent 15 cm/s", outcome: "Available evidence describes concurrent-flow spread characteristics.", evidenceStrength: "Moderate", sourceId: "SRC-05", demo: true },
  { id: "EXP-009", title: "Cotton fabric, low oxygen 16%", fuel: "Cotton", oxygen: 16, pressure: 80, gravity: "Microgravity", airflow: "Concurrent 5 cm/s", outcome: "Limited evidence near extinction limit.", evidenceStrength: "Limited", sourceId: "SRC-05", demo: true },
  { id: "EXP-010", title: "Nomex blend, normal-gravity reference", fuel: "Nomex blend", oxygen: 21, pressure: 101, gravity: "Normal gravity", airflow: "Quiescent", outcome: "Reference baseline for gravity comparison.", evidenceStrength: "Moderate", sourceId: "SRC-06", demo: true },
  { id: "EXP-011", title: "PMMA slab, partial-g centrifuge (Mars-g)", fuel: "PMMA", oxygen: 21, pressure: 70, gravity: "Mars-g", airflow: "Low flow 5 cm/s", outcome: "Limited evidence; partial-g data are sparse.", evidenceStrength: "Limited", sourceId: "SRC-07", demo: true },
  { id: "EXP-012", title: "Cellulose, lunar-g simulation", fuel: "Cellulose", oxygen: 21, pressure: 55, gravity: "Lunar-g", airflow: "Quiescent", outcome: "Limited evidence; few partial-g runs available.", evidenceStrength: "Limited", sourceId: "SRC-07", demo: true },
  { id: "EXP-013", title: "Ethylene co-flow diffusion flame, microgravity", fuel: "Ethylene (gas)", oxygen: 21, pressure: 101, gravity: "Microgravity", airflow: "Co-flow 20 cm/s", outcome: "Available evidence describes near-spherical flame shape.", evidenceStrength: "Strong", sourceId: "SRC-08", demo: true },
  { id: "EXP-014", title: "Methane diffusion flame, low pressure", fuel: "Methane (gas)", oxygen: 18, pressure: 50, gravity: "Microgravity", airflow: "Co-flow 10 cm/s", outcome: "Limited evidence at combined low-O2 / low-pressure.", evidenceStrength: "Limited", sourceId: "SRC-08", demo: true },
];
