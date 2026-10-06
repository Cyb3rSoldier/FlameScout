import type { Figure, Source } from "../types";

/** DEMO sources — placeholder names, NOT real NASA document identifiers. */
export const SOURCES: Source[] = [
  { id: "SRC-01", title: "Demo Experiment Report — Cellulose Spread (Set A)", type: "Experiment Report", page: "pp. 4–9", relevance: 0.94, citation: 1, demo: true },
  { id: "SRC-02", title: "Demo Low-Pressure PMMA Dataset", type: "Experimental Dataset", page: "Table 2", relevance: 0.89, citation: 2, demo: true },
  { id: "SRC-03", title: "Demo Wire Insulation Combustion Study", type: "Journal Article", page: "pp. 12–18", relevance: 0.87, citation: 3, demo: true },
  { id: "SRC-04", title: "Demo Reduced-Gravity Parabola Notes", type: "Technical Memo", page: "p. 3", relevance: 0.71, citation: 4, demo: true },
  { id: "SRC-05", title: "Demo Fabric Spread Figure Set", type: "Figure Set", page: "Figs. 4–6", relevance: 0.78, citation: 5, demo: true },
  { id: "SRC-06", title: "Demo Normal-Gravity Baseline Report", type: "Experiment Report", page: "pp. 2–5", relevance: 0.66, citation: 6, demo: true },
  { id: "SRC-07", title: "Demo Partial-Gravity Centrifuge Summary", type: "Technical Memo", page: "pp. 6–8", relevance: 0.62, citation: 7, demo: true },
  { id: "SRC-08", title: "Demo Gaseous Diffusion Flame Captures", type: "Figure Set", page: "Figs. 1–3", relevance: 0.83, citation: 8, demo: true },
];

export const FIGURES: Figure[] = [
  { id: "FIG-01", title: "Quiescent cellulose flame (demo placeholder)", caption: "Near-spherical flame envelope reported in microgravity. Demo schematic — not a NASA image.", experimentId: "EXP-001", sourceId: "SRC-01", kind: "flame-image", demo: true },
  { id: "FIG-02", title: "PMMA at 60 kPa (demo placeholder)", caption: "Elongated flame under low-pressure forced flow. Demo schematic.", experimentId: "EXP-003", sourceId: "SRC-02", kind: "flame-image", demo: true },
  { id: "FIG-03", title: "Opposed-flow spread schematic (demo)", caption: "Schematic of opposed-flow geometry used in wire insulation runs.", experimentId: "EXP-005", sourceId: "SRC-03", kind: "schematic", demo: true },
  { id: "FIG-04", title: "Ethylene co-flow shape (demo placeholder)", caption: "Rounded-blue envelope typical of microgravity diffusion flames. Demo schematic.", experimentId: "EXP-013", sourceId: "SRC-08", kind: "flame-image", demo: true },
];
