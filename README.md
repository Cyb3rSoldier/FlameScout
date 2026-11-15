FlameScout — Flame in Freefall (NASA Space Apps 2026)

Live demo: https://shaninx48.github.io/FlameScout/

Demo video (240 s): https://www.youtube.com/watch?v=8db2P04rIfI

Pitch video (30 s): https://www.youtube.com/watch?v=nvMl6VpEzuc

FlameScout is a web dashboard that turns NASA's microgravity combustion research into cited, checkable fire-safety evidence for crewed missions (Artemis-era: spacecraft, Moon base, pressurized rover, spacesuit), and shows where evidence is missing.

Team MindStormers, Dhaka: Omar Faruk Rakib (lead, full-stack), MD Tanveer Mahmood Shanin (full-stack), Sawda Akter (frontend, researcher), Joydev Datta (UI/UX), Antara Mazumder (backend), Md Junaeid Ali (AI engineer). Local mentor: SK Tajbir.

This repository is a fork of Cyb3rSoldier/FlameScout.

Status

The app runs in mock mode in the browser. The FastAPI backend is not built. FlameScout supports research and makes no safe or unsafe claims.

Data sources
Investigation catalog: summaries of NASA PSI records and NASA technical reports (src/data/experiments.ts). Representative values are flagged (≈).
Run-level data: FLEX Table IX, NASA/TP-2015-216046 (NTRS 20150023456), 276 tests (157 methanol, 119 heptane), in src/data/flexTests.ts. Pressure 70 to 309 kPa, O2 12 to 34 mol%.
SAME (PSI-101) TEM soot particle sizes (datasets/): image-derived approximations from automated blob detection, not lab measurements.
FLEX droplet time series (PSI-69): all 276 tests parsed. 259 are comparable with Table IX; median difference in burning rate is about 3.9%, and 180 of 259 (70%) are within 7%. See datasets/flex_validation_report.md.
FLEX test sheets: 505+ files, 240 unique tests; 63% match all 9 fields exactly, 90% match at least 8 of 9; 53 tests record a cool flame.
FLEX gas mixtures: chamber gas (O2, CO2, N2, He, Xe) for 28 test points.
FLEX-2 (PSI-68): 749 test points, 124 gas mixtures (including SF6, He and CO2 suppressant gases), 871 crew/downlink note blocks, chamber and radiometer summaries. Droplet diameter images (.zip archives) were not processed.
CFI-G (PSI-159): test point configurations and 17 labelled runs from day 9 (13 sustained, 4 unsustained).
Flame Design (PSI-10): SRD Table 1.1 (4 flames) and Table 1.2 (17 sooting-limit flames).
PSI catalog and RAG: 21 investigations; 338 retrieval chunks.
Catalog summaries only (no run-level data): SPICE, DAFT, BRE, CLD Flame, BASS-II.

All data processing is deterministic Python/pandas; no LLM is in the data path. Image-derived and catalog values are approximations (≈).

Key finding

None of the 276 FLEX tests combine 30% O2 or more with 70.5 kPa or less, the atmosphere expected in Moon bases (challenge text: 30% O2 or more, 10.2 psi or less). NASA also notes that PSI holds no partial-gravity combustion data yet. This claim is scoped to FLEX and to this catalog, not to all of NASA's data.

Run locally
git clone https://github.com/ShaninX48/FlameScout.git
cd FlameScout
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build → dist/
npm run preview  # serve dist/

Deployed to GitHub Pages by .github/workflows (base path /FlameScout/).

Stack

React 19, TypeScript, Vite, Tailwind, Recharts, React Router.

Mock API seam

The UI imports only from src/services/api.ts: getExperiments, getSources, getFigures, askQuestion, getCoverage, compareExperiments, getEvidenceTrace, predictFlex. To use a real backend, set VITE_API_BASE_URL=http://localhost:8000 (see .env.example) and implement those functions with fetch(): GET /api/experiments · GET /api/sources · POST /api/ask · GET /api/coverage · POST /api/compare · GET /api/trace/:id · POST /api/predict. isMockMode / DEMO_NOTICE flag the in-browser build.

Routes

/assistant (default) · /rank (Mission Fit) · /coverage · /compare · /predict · /lab (Experiment Lab) · /controls (Safety Controls, research grouped by fire-safety pillar) · /methodology · /earth (Earth Applications)

Highlights
Mission Fit (/rank): transparent heuristic ranking (atmosphere overlap 0.35 · safety pillar 0.30 · materials directness 0.20 · evidence depth 0.15) of investigations per crewed environment. Planned records are listed as roadmap lines, unranked.
Coverage Map (/coverage): pressure × oxygen heatmap derived from the catalog, with ranked knowledge gaps (top gap: Moon-regime solid flammability at 30% O2 or more and 10.2 psi or less).
Evidence Assistant (/assistant): a retrieval assistant. A deterministic TF-IDF index (scikit-learn, 338 chunks) built from the catalog, FLEX report, PSI records and documents is queried in the browser (src/lib/ragSearch.ts, score-identical to the Python reference scripts/rag_retrieve.py). Answers come only from retrieved chunks, each citation links to its NASA source, and queries scoring below the refusal threshold (0.112) get a clear "not enough data" answer with no citations. No LLM is used in the answer path.
Prediction (/predict): exploratory distance-weighted nearest-neighbour estimator (k=6) over the 276 real FLEX tests. 5-fold cross-validation grouped by test date: R² 0.67 for extinction diameter (error 0.45 mm), 0.58 for burn time (3.6 s), 0.63 for burning rate (0.057 mm²/s). It refuses to extrapolate outside the tested envelope, and it does not predict extinction (the outcome label is weak, 67% Extinction).
Living flame UI: the flame illustration and the interface react to the conditions you set and to how strong the evidence is.
Flame visuals

All flame work lives in src/components/flame/*, src/lib/flameState.ts, src/context/AmbienceContext.tsx and the flame section at the bottom of src/index.css. Everything animates transform and opacity only (plus one registered CSS number), and every animation is disabled under prefers-reduced-motion.

Flame illustration (FreefallFlame)

A near-spherical microgravity flame with a faint blue diffusion shell, an orange body and a flickering white-hot core.

Prop	Effect
o2, pressureKpa	Brightness, size, blue-shell strength and flicker speed follow oxygen (12 to 34%)
untested	The flame goes grey and still: "no data, no flame"
sparks	A few rising embers

src/lib/flameState.ts maps conditions to look. It is purely visual and never says a flame will spread or die out. Every reactive flame is labelled a schematic.

Flame ambience (whole-UI intensity)

The interface burns at one shared intensity from 0 (cold) to 1 (blazing). Pages publish a value with useFlameIntensity(intensity, label); the shell exposes it as the --amb-i CSS variable, registered with @property so CSS eases between values over about 1.8 s. The top bar HeatMeter shows the level and an on/off switch (saved in localStorage under flamescout-ambience).

Page	Intensity source
/assistant	Near full while retrieving, then by evidence strength: Strong 0.78 · Moderate 0.55 · Limited 0.30 · Insufficient 0.06
/predict, /lab	Follows the oxygen slider live; outside the tested range on /predict it drops to about 0.04
everything else	Calm idle level, 0.32

To tune: STRENGTH_I in src/pages/AssistantPage.tsx, oxygen mapping in src/lib/flameState.ts, colors and glow sizes at the bottom of src/index.css.

Browser note: the smooth transition needs @property (Chrome, Edge, Safari, Firefox 128+). In older browsers the change snaps instead of easing.

Notes
Figures in the UI are clearly labelled illustrative schematics, never claimed NASA imagery.
Copy avoids safe/unsafe claims; scenario mode is retrieval-only.
Flame visuals are schematic echoes of your settings, not predictions or simulations.
AI tools used in building this project: Claude, ChatGPT, OpenCode (GLM). Keep this list identical to the submission form's AI-use section.
