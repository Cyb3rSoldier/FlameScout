# FlameScout — Flame in Freefall (frontend)

Evidence-grounded assistant for NASA microgravity combustion research. React + TypeScript + Vite + Tailwind + Recharts + React Router. Mock data now; FastAPI later.

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
`getExperiments, getSources, getFigures, askQuestion, getCoverage, compareExperiments, getEvidenceTrace`.
Set `VITE_API_BASE_URL=http://localhost:8000` (see `.env.example`) and implement those functions with `fetch()` against FastAPI:
`GET /api/experiments · GET /api/sources · POST /api/ask · GET /api/coverage · POST /api/compare · GET /api/trace/:id`.
`isMockMode` / `DEMO_NOTICE` flag demo UI.

## Routes
`/assistant` (default) · `/coverage` · `/compare` · `/methodology`

## Notes
- All records in `src/data/*` are marked demo placeholders — not real NASA findings.
- Copy avoids safe/unsafe claims; scenario mode is retrieval-only.
- Flame visuals: `src/components/flame/*` (transform/opacity only, reduced-motion safe).
