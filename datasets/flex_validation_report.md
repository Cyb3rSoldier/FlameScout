# FLEX droplet-rate cross-validation (full 276-test set)

Derived quasi-steady burning rates K from raw PSI DropletData telemetry
(plateau-detection + official-burn-time window capping, see
`scripts/parse_droplet_data.py`) compared against the published
burning rates in Table IX of NASA/TP-2015-216046.

- DropletData files processed: **276 / 276**
- Comparable to an official Table IX rate: **259** (11 tests have no published rate; telemetry-only)
- Median absolute difference: **3.9%**
- Mean absolute difference: 7.0%
- Within 7% of the official rate: **180/259 (69%)**
- <= 2%: 68, <= 5%: 149, <= 7%: 180, <= 10%: 208, <= 25%: 245

Method note (honesty): NASA's published rates use an internal
window-selection procedure not documented in PSI; our plateau method
is an independent re-derivation. 14 of {0} tests differ by more than
25% (table below) and are kept visible rather than filtered.

## Outliers (>25% difference)

| test | derived K | official | diff % | window R^2 |
|---|---|---|---|---|
| FLEX-272 | 0.922 | 0.62 | 49% | 0.978 |
| FLEX-206 | 0.633 | 0.43 | 47% | 0.907 |
| FLEX-008 | 0.473 | 0.79 | 40% | 0.619 |
| FLEX-219 | 0.181 | 0.30 | 40% | 0.950 |
| FLEX-032 | 0.947 | 0.68 | 39% | 0.897 |
| FLEX-060 | 0.615 | 0.45 | 37% | 0.986 |
| FLEX-250 | 0.577 | 0.43 | 34% | 0.930 |
| FLEX-135 | 0.788 | 0.59 | 34% | 0.965 |
| FLEX-103 | 0.463 | 0.35 | 32% | 0.906 |
| FLEX-253 | 0.395 | 0.58 | 32% | 0.958 |
| FLEX-158 | 0.389 | 0.30 | 30% | 0.994 |
| FLEX-041 | 0.842 | 0.65 | 30% | 0.971 |
| FLEX-188 | 0.599 | 0.47 | 27% | 0.978 |
| FLEX-048 | 0.338 | 0.27 | 25% | 0.778 |
