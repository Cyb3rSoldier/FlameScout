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
- **Living flame UI** — the flame illustration and the whole interface react to the conditions you set and to how strong the evidence is (see below).

## Flame visuals

All flame work lives in `src/components/flame/*`, `src/lib/flameState.ts`, `src/context/AmbienceContext.tsx` and the flame section at the bottom of `src/index.css`. Everything animates `transform` and `opacity` only (plus one registered CSS number, see Ambience), and every animation is disabled under `prefers-reduced-motion`.

### Flame illustration (`FreefallFlame`)
A near-spherical microgravity flame with a faint blue diffusion shell, an orange body and a flickering white-hot core. Optional props:

| Prop | Effect |
| --- | --- |
| `o2`, `pressureKpa` | Brightness, size, blue-shell strength and flicker speed follow oxygen (12–34 %): low O₂ is dim and blue-edged, high O₂ is bright and orange |
| `untested` | The flame goes grey and still — "no data, no flame" |
| `sparks` | A few rising embers |

`src/lib/flameState.ts` holds the mapping from conditions to look. It is purely visual: it never says a flame will spread, struggle or die out, and every reactive flame is labelled a schematic.

Where it appears: top bar logo, hero orb (with embers and a one-time headline shimmer), loader, Prediction "Flame echo" panel, and the Experiment Lab "Flame echo".

### Flame ambience (whole-UI intensity)
The interface itself burns at one shared intensity from 0 (cold) to 1 (blazing). Pages publish a value with `useFlameIntensity(intensity, label)`; the shell exposes it as the `--amb-i` CSS variable, registered with `@property` so CSS eases between values over about 1.8 s.

What changes as intensity rises:
- **Background (`FlameAmbience`)** — cold teal light fades out, warm ember light fades in, a fire-floor glow grows from the bottom edge, and embers rise.
- **Top bar** — a heat line shifts from teal to orange, and `HeatMeter` shows a five-bar readout, the current label, and an on/off switch (saved in `localStorage` under `flamescout-ambience`).
- **Panels** — side panels become frosted glass on desktop; cards gain a warm border rim.

What drives it:

| Page | Intensity source |
| --- | --- |
| `/assistant` | Near full while retrieving, then by evidence strength: Strong 0.78 · Moderate 0.55 · Limited 0.30 · Insufficient 0.06 |
| `/predict`, `/lab` | Follows the oxygen slider live; outside the tested range on `/predict` it drops to about 0.04 |
| everything else | Calm idle level, 0.32 |

To tune: strength table in `src/pages/AssistantPage.tsx` (`STRENGTH_I`), oxygen mapping in `src/lib/flameState.ts`, colors and glow sizes at the bottom of `src/index.css`.

Browser note: the smooth color transition needs `@property` (Chrome, Edge, Safari, Firefox 128+). In older browsers the intensity change snaps instead of easing; nothing breaks.

## Notes
- Figures in the UI are clearly-labelled illustrative schematics — never claimed NASA imagery.
- Copy avoids safe/unsafe claims; scenario mode is retrieval-only.
- Flame visuals are schematic echoes of your settings, not predictions or simulations.