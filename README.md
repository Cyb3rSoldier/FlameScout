# FlameScout

**A flammability explorer for microgravity. Predicts how fire behaves in space, cites the NASA experiments behind every answer, and refuses to guess outside the tested data.**

Built for the NASA Space Apps Challenge 2026 (*Flame in Freefall*).

> **Decision support only.** FlameScout is a research prototype. It does not replace NASA material standards or testing, and it is not endorsed by NASA.

---

## The problem

Without gravity, flames do not rise. They form slow, rounded shapes and can survive in conditions that would put out an Earth fire. NASA has run many microgravity combustion experiments, but the results are scattered across reports and datasets. A mission planner cannot quickly ask: *what do we actually know about fire in this situation?*

## What FlameScout does

1. The user sets **oxygen concentration, pressure, airflow velocity and material**.
2. A trained model predicts the **flame-spread regime**: `no_spread`, `marginal_spread` or `spread`, with class probabilities.
3. The app shows the **nearest real experiments**, with report IDs and links to the source.
4. A **range guard** refuses to predict when inputs fall outside the tested envelope, and warns when evidence is sparse.
5. A **gap map** shows where NASA data is thin and which experiment would reduce uncertainty most.
6. A language model writes a **plain or expert explanation**, using only the prediction object. It never predicts and never states a number that is not in the data.

## Key features

| Feature | Why it matters |
|---|---|
| Trained model with grouped cross-validation | Honest accuracy, no leakage between tests of the same campaign |
| Range guard (refuse + warn) | A fire-safety tool must never guess silently |
| Boundary-crossing explainer | Slide oxygen from 21% to 17%; the app names the experiments on each side of the boundary |
| Cited evidence panel | Every claim links to a report ID |
| Gap map and next-experiment suggestions | Turns "what we don't know" into a research tool |
| Claim verifier | Blocks any number in the explanation that is not in the data |
| Model card and data card | Sources, label rule, accuracy, limits |

## Architecture

```
NASA reports and datasets
        |  (extraction scripts + manual QA)
        v
data/experiments.parquet
        |
        +--> src/compute/model.py   train, grouped CV, calibrate, save training envelope
        +--> evidence index         nearest experiments + report abstracts
                    |
                    v
          FastAPI  /predict   (range guard -> class, probabilities, nearest experiments)
                    |
                    +--> LLM explainer -> claim verifier -> text
                    v
          Slider dashboard: probability bar, regime map, gap map, citations
```

## Data

| Source | Use |
|---|---|
| [NASA NTRS](https://ntrs.nasa.gov) | Primary. Microgravity combustion reports (including the FLEX and SoFIE experiment families) with citable identifiers |
| NASA OSDR | Spaceflight experiment records and metadata |
| NASA Glenn physical sciences resources | Combustion experiment documentation and imagery |
| NASA Physical Sciences Informatics (PSI) | Raw experiment data, *if used* (delete this row if not) |

**Dataset:** `data/experiments.parquet`, one row per published test.

| Column | Description |
|---|---|
| `report_id`, `source_url` | Citation for the row (required) |
| `experiment_family`, `test_id` | Used for grouped cross-validation |
| `oxygen_pct`, `pressure_kpa`, `flow_cm_s` | Test conditions |
| `material`, `thickness_mm`, `geometry`, `flow_direction` | Sample and flow details |
| `outcome_class` | `no_spread`, `marginal_spread` or `spread` |
| `label_basis`, `extraction_method`, `confidence` | How the label and values were obtained |

The label definition and extraction rules are in [`DATA_CARD.md`](DATA_CARD.md).

## Model

- **Features:** oxygen, pressure, flow velocity, material, thickness, oxygen partial pressure.
- **Models compared:** majority baseline, oxygen-threshold rule, logistic regression, gradient boosting.
- **Validation:** grouped stratified cross-validation by experiment family. Reports accuracy, macro-F1, confusion matrix and bootstrap confidence interval.
- **Results:** `<fill in from your own run: n_train, cv_accuracy, baseline_accuracy>`
- Full details in [`MODEL_CARD.md`](MODEL_CARD.md).

## Getting started

```bash
git clone https://github.com/<your-org>/flamescout.git
cd flamescout
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Rebuild the dataset, model and report from raw data
make reproduce

# Run the API
uvicorn src.api.main:app --reload

# Run the web interface
cd web && npm install && npm run dev
```

Set your language-model key in `.env` (see `.env.example`). Without a key, FlameScout falls back to templated explanations.

## API

`POST /predict`

```json
{
  "oxygen_pct": 17.0,
  "pressure_kpa": 101.3,
  "flow_cm_s": 5.0,
  "material": "PMMA"
}
```

Response (shape only; values come from the real model):

```json
{
  "inputs": { "...": "..." },
  "in_training_range": true,
  "evidence": { "density": "sparse", "warnings": ["..."] },
  "prediction": "marginal_spread",
  "probabilities": { "no_spread": 0.28, "marginal_spread": 0.57, "spread": 0.15 },
  "model": { "type": "...", "n_train": 0, "cv_accuracy": 0.0, "cv_method": "grouped" },
  "nearest_experiments": [
    { "report_id": "...", "oxygen_pct": 0.0, "outcome": "...", "source_url": "..." }
  ]
}
```

If `in_training_range` is `false`, the response contains no prediction, only the reason and the tested range.

`GET /gaps` returns the data-density grid and suggested experiments.

## Repository layout

```
flamescout/
  data/raw/                original downloads (unedited)
  data/experiments.parquet cleaned dataset
  src/extract/             extraction scripts, one per source
  src/compute/model.py     training, validation, envelope
  src/compute/guard.py     range and sparsity checks
  src/api/main.py          FastAPI app
  src/explain/             LLM prompt, claim verifier, template fallback
  web/                     slider interface
  models/                  trained model artifact
  tests/                   guard, verifier and API tests
  DATA_CARD.md  MODEL_CARD.md  LICENSE  README.md
```

## Limitations

- Training data is **microgravity only**. Partial gravity (Moon, Mars surface) and Earth gravity are out of range.
- The dataset is small, so the model is a transparent summary of published tests, not a physics simulator.
- Labels are derived from published outcomes using a written rule; some rows are lower confidence (see `confidence` column).
- Predictions never mean a condition is "safe".
- Not a substitute for official NASA flammability testing and standards.

## Team

| Name | Role |
|---|---|
| `<name>` | Data |
| `<name>` | Machine learning |
| `<name>` | Backend |
| `<name>` | Frontend and design |
| `<name>` | Presentation and writing |

Mentor: `<name>`

## License

Apache License 2.0. See [`LICENSE`](LICENSE).

## Acknowledgements

Experiment data and reports are from NASA's public archives (NTRS, OSDR, NASA Glenn Research Center and related resources). Built during the NASA Space Apps Challenge 2026. NASA does not endorse this project.
