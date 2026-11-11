# FlameScout — Flame in Freefall (NASA Space Apps)

Evidence-grounded assistant for NASA microgravity combustion research — summarizes, ranks, and interprets PSI experiments to deliver fire-safety insights for human space exploration (Artemis-era: spacecraft, Moon Base, rovers, spacesuits).

React + TypeScript + Vite + Tailwind + Recharts + React Router. The data catalog (`src/data/experiments.ts`) summarizes real NASA PSI investigations (BASS/BASS-II, Saffire-I/II/III, FLEX, FLEX-2, CFI, CFI-G, BRE, CLD Flame, E-FIELD, Flame Design, SPICE, SLICE, SAME/SAME-R, DAFT/DAFT-2, planned LUCI & FM²); representative values are flagged (≈) and no safe/unsafe claims are made. Run-level data: FLEX Table IX (NASA/TP-2015-216046) in `src/data/flexTests.ts`.

## Run
```bash
cd flamescout
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build → dist/
npm run preview  # serve dist/
```

## Mock API seam
UI imports only from `src/services/api.ts`:
`getExperiments, getSources, getFigures, askQuestion, getCoverage, compareExperiments, getEvidenceTrace, predictFlex`.
Set `VITE_API_BASE_URL=http://localhost:8000` (see `.env.example`) and implement those functions with `fetch()` against FastAPI:
`GET /api/experiments · GET /api/sources · POST /api/ask · GET /api/coverage · POST /api/compare · GET /api/trace/:id · POST /api/predict`.
`isMockMode` / `DEMO_NOTICE` flag the in-browser build.

## Routes
`/assistant` (default) · `/rank` (Mission Fit — ranked relevance per crewed environment) · `/coverage` · `/compare` · `/predict` · `/lab` (Experiment Lab — what-if element sliders, nearest evidence) · `/controls` (Safety Controls — research grouped by fire-safety pillar) · `/methodology` · `/earth` (Earth Applications — NASA spin-off transfer pointers)

## Highlights
- **Mission Fit (`/rank`)** — transparent heuristic ranking (atmosphere overlap 0.35 · safety pillar 0.30 · materials directness 0.20 · evidence depth 0.15) of investigations per crewed environment; planned records listed as roadmap lines, unranked.
- **Coverage Map (`/coverage`)** — pressure × oxygen heatmap derived from the catalog at call time, with ranked knowledge gaps (top gap: Moon-regime solid flammability at ≥30% O₂ / ≤10.2 psi).
- **Evidence Assistant (`/assistant`)** — field-weighted keyword retrieval (title ×3, keywords ×2, body ×1) + filter application, five query modes, citations, evidence traces, honest "insufficient evidence" answers.
- **Prediction (`/predict`)** — exploratory kNN estimator over the 280 real FLEX Table IX tests; refuses to extrapolate outside the tested envelope.

## Notes
- Figures in the UI are clearly-labelled illustrative schematics — never claimed NASA imagery.
- Copy avoids safe/unsafe claims; scenario mode is retrieval-only.
- Flame visuals: `src/components/flame/*` (transform/opacity only, reduced-motion safe).
