import type { Figure, Source } from "../types";

/**
 * Real reference records for the experiment catalog. These point to the NASA
 * Physical Science Informatics (PSI) database records / NASA technical reports
 * behind each investigation. They are *pointers to public documents*, not
 * re-typed page numbers — queries against PSI itself live in the future
 * FastAPI backend. Everything marked `illustrative` is UI art, not a NASA image.
 */
export const SOURCES: Source[] = [
  {
    id: "SRC-PSI",
    title: "NASA Physical Science Informatics (PSI) — public ISS combustion data",
    type: "Database",
    page: "psi.nasa.gov",
    relevance: 0.97,
    citation: 11,
  },
  {
    id: "SRC-BASS",
    title: "Burning and Suppression of Solids (BASS / BASS-II) — PSI experiment record & datasets",
    type: "PSI record",
    page: "PSI: BASS, BASS-II",
    relevance: 0.95,
    citation: 1,
  },
  {
    id: "SRC-FLEX",
    title: "NASA/TP-2015-216046 — Detailed results from ten years of droplet combustion research aboard the ISS (FLEX report, incl. Table IX)",
    type: "Technical report",
    page: "ntrs.nasa.gov (TP-2015-216046)",
    relevance: 0.97,
    citation: 3,
  },
  {
    id: "SRC-FLEX2",
    title: "Flame Extinguishment Experiment–2 (FLEX-2) — PSI experiment record & datasets",
    type: "PSI record",
    page: "PSI: FLEX-2",
    relevance: 0.93,
    citation: 4,
  },
  {
    id: "SRC-CFI",
    title: "Cool Flames Investigation (CFI / CFI-G) — PSI experiment records & datasets",
    type: "PSI record",
    page: "PSI: CFI, CFI-G",
    relevance: 0.9,
    citation: 7,
  },
  {
    id: "SRC-ACME",
    title: "ACME investigations (BRE, CLD Flame, E-FIELD, Flame Design) — PSI experiment records & datasets",
    type: "PSI record",
    page: "PSI: ACME project",
    relevance: 0.88,
    citation: 5,
  },
  {
    id: "SRC-SAME",
    title: "Smoke and Aerosol Measurement Experiment (SAME / SAME-R) — PSI experiment records & datasets",
    type: "PSI record",
    page: "PSI: SAME, SAME-R",
    relevance: 0.9,
    citation: 6,
  },
  {
    id: "SRC-SPICE",
    title: "SPICE / SLICE — PSI experiment records & datasets (MSG flow duct line)",
    type: "PSI record",
    page: "PSI: SPICE, SLICE",
    relevance: 0.82,
    citation: 9,
  },
  {
    id: "SRC-DAFT",
    title: "DAFT / DAFT-2 — PSI experiment records & datasets (dust/aerosol line)",
    type: "PSI record",
    page: "PSI: DAFT, DAFT-2",
    relevance: 0.7,
    citation: 10,
  },
  {
    id: "SRC-SAFFIRE",
    title: "Spacecraft Fire Safety Demonstration (Saffire-I, -II, -III) — mission reports & datasets via PSI overview",
    type: "Report + datasets",
    page: "ntrs.nasa.gov via PSI",
    relevance: 0.96,
    citation: 2,
  },
];

/**
 * Illustrative UI artifacts only — clearly labelled schematics/placeholders,
 * not NASA imagery. Real figure retrieval lands with the FastAPI backend.
 */
export const FIGURES: Figure[] = [
  {
    id: "FIG-01",
    title: "Microgravity flame spread schematic (illustrative)",
    caption: "Illustrative schematic of opposed-flow flame spread over a thin fabric in freefall — not a NASA image.",
    experimentId: "BASS",
    sourceId: "SRC-BASS",
    kind: "schematic",
  },
  {
    id: "FIG-02",
    title: "Droplet extinguishment schematic (illustrative)",
    caption: "Illustrative schematic of a burning droplet with N₂/CO₂/He diluent variables from the FLEX line — not a NASA image.",
    experimentId: "FLEX",
    sourceId: "SRC-FLEX",
    kind: "schematic",
  },
  {
    id: "FIG-03",
    title: "Smoke particle-size concept (illustrative)",
    caption: "Illustrative particle-size-distribution concept from the SAME detection line — not a NASA image.",
    experimentId: "SAME",
    sourceId: "SRC-SAME",
    kind: "chart",
  },
  {
    id: "FIG-04",
    title: "Spherical-burner flame concept (illustrative)",
    caption: "Illustrative schematic of an O₂-enriched spherical-burner flame in the CFI-G line — not a NASA image.",
    experimentId: "CFI-G",
    sourceId: "SRC-CFI",
    kind: "schematic",
  },
];
