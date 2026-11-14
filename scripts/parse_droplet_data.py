# Batch parser for NASA FLEX droplet time-series files (*_DropletData.txt).
#
# For each file:
#   1. Parse tab-separated columns (time, diameter, x, y) — the header is
#      glued to the first data row in the raw PSI files, so it is stripped
#      by regex before pandas reads the table.
#   2. Select the steady-burning window: NASA computes the burning rate
#      (K = -d(D^2)/dt) only while the droplet burns quasi-steadily. We
#      slide a fixed-duration window over t > ignition transient, fit
#      D^2 vs t, and keep the window with the most negative slope
#      weighted by fit quality (R^2). The naive full-timeline slope is
#      also reported — it is NOT a valid burning rate.
#   3. Join the official Table IX rate (datasets/flex_table_ix.csv) and
#      report the % difference, so every derived number is cross-checked.
#
# Usage:  python scripts/parse_droplet_data.py [input_dir] [output_csv]
# Defaults: input  D:\nasa-space-apps\psi-69
#           output datasets/flex_droplet_rates.csv   (sorted by test id)
#
# Honesty rules: derived values are marked "derived" in the output and are
# never presented as NASA numbers. Empty official cells stay empty.
import re
import sys
import io
from pathlib import Path

import pandas as pd

DEFAULT_INPUT = r"D:\nasa-space-apps\psi-69"
DEFAULT_OUTPUT = Path(__file__).resolve().parent.parent / "datasets" / "flex_droplet_rates.csv"

HEADER_RE = re.compile(
    r"DropletTime_sec\D*?DropletDiameter_mm\D*?ZeroedDropletXpos_mm\D*?ZeroedDropletYpos_mm"
)
ID_RE = re.compile(r"FLEX-\d+", re.IGNORECASE)
WINDOW_S = 1.0          # sliding window length, seconds
IGNITION_S = 0.5        # ignore everything before this after t=0 (transient)


def parse_file(path: Path) -> pd.DataFrame | None:
    text = path.read_text(encoding="utf-8", errors="replace")
    text = HEADER_RE.sub("", text, count=1)
    df = pd.read_csv(io.StringIO(text), sep="\t", header=None,
                     names=["t", "d", "x", "y"], usecols=["t", "d"])
    df = df.apply(pd.to_numeric, errors="coerce").dropna().sort_values("t")
    df["d2"] = df["d"] ** 2
    return df if len(df) > 10 else None


def fit_window(df: pd.DataFrame, t0: float, t1: float) -> tuple[float, float] | None:
    """OLS slope (mm^2/s) and R^2 of D^2 vs t inside [t0, t1]."""
    w = df[(df["t"] >= t0) & (df["t"] <= t1)]
    if len(w) < 8:
        return None
    n = len(w)
    sx, sy = w["t"].sum(), w["d2"].sum()
    sxx = (w["t"] * w["t"]).sum()
    sxy = (w["t"] * w["d2"]).sum()
    denom = n * sxx - sx * sx
    if denom == 0:
        return None
    slope = (n * sxy - sx * sy) / denom
    intercept = (sy - slope * sx) / n
    ss_tot = ((w["d2"] - w["d2"].mean()) ** 2).sum()
    ss_res = ((w["d2"] - (slope * w["t"] + intercept)) ** 2).sum()
    r2 = 1 - ss_res / ss_tot if ss_tot > 0 else 0.0
    return slope, r2


MAX_GLITCH_MM = 0.05   # reject windows containing a tracking glitch: a single
                       # upward step in measured diameter larger than this


def steady_burn(df: pd.DataFrame, burn_time_s: float | None = None) -> dict:
    burn = df[df["t"] > IGNITION_S]
    full = fit_window(df, burn["t"].min(), df["t"].max())
    t_min, t_max = df["t"].min(), df["t"].max()
    if burn.empty or t_max - t_min <= WINDOW_S:
        slope, r2 = full if full else (float("nan"), float("nan"))
        return {"K": -slope, "r2": r2, "win_t0": t_min, "win_t1": t_max,
                "full_K": -slope, "n_win": len(df)}
    # cap the end of the search at the official burn duration: after flame
    # extinction the droplet keeps vaporizing with a different slope, which
    # is not the quasi-steady burning rate NASA reports
    t_end = min(t_max, IGNITION_S + burn_time_s) if burn_time_s else t_max
    cands = []                       # (t0, t1, slope, r2)
    t0 = IGNITION_S
    while t0 + WINDOW_S <= t_end:
        w = df[(df["t"] >= t0) & (df["t"] <= t0 + WINDOW_S)]
        glitch = (w["d"].diff().clip(lower=0).max() or 0)
        res = fit_window(df, t0, t0 + WINDOW_S)
        if res and res[0] < 0 and glitch <= MAX_GLITCH_MM:
            cands.append((t0, t0 + WINDOW_S, res[0], res[1]))
        t0 += WINDOW_S / 4
    if not cands:
        return {"K": float("nan"), "r2": float("nan"), "win_t0": "", "win_t1": "",
                "full_K": -full[0], "n_win": 0}
    # plateau detection: the quasi-steady period is the longest run of
    # consecutive windows whose slopes agree (within tolerance); the ignition
    # transient is short and steep, so a long plateau beats it
    tol = 0.20
    runs: list[list[int]] = []
    cur: list[int] = []
    for i, c in enumerate(cands):
        if cur:
            run_slopes = [cands[j][2] for j in cur]
            med = sorted(run_slopes)[len(run_slopes) // 2]
            if abs(c[2] - med) <= abs(med) * tol:
                cur.append(i)
                runs.append(cur[:])
                continue
            cur = []
        cur = [i]
    if not runs:
        runs = [[i] for i in range(len(cands))]
    best_run = max(runs, key=lambda r: (len(r), -sorted(cands[j][2] for j in r)[len(r) // 2]))
    idx = best_run[len(best_run) // 2]
    target = cands[idx]
    wt0, wt1, slope, r2 = target
    w = df[(df["t"] >= wt0) & (df["t"] <= wt1)]
    return {"K": -slope, "r2": r2, "win_t0": wt0, "win_t1": wt1,
            "full_K": -full[0], "n_win": len(w)}


def main() -> None:
    input_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(DEFAULT_INPUT)
    out_csv = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT

    official = pd.read_csv(out_csv.parent / "flex_table_ix.csv")[["id", "burningRateMm2s", "burnTimeS"]]
    official.columns = ["id", "officialRate", "officialBurnTime"]

    rows = []
    for path in sorted(input_dir.glob("*DropletData*.txt")):
        m = ID_RE.search(path.stem)
        if not m:
            print(f"skip (no test id in name): {path.name}")
            continue
        df = parse_file(path)
        if df is None:
            print(f"skip (unparseable): {path.name}")
            continue
        bt = official.loc[official["id"] == m.group(0).upper(), "officialBurnTime"]
        sb = steady_burn(df, float(bt.iloc[0]) if len(bt) and pd.notna(bt.iloc[0]) else None)
        rows.append({
            "id": m.group(0).upper(),
            "file": path.name,
            "n_points": len(df),
            "t_min_s": round(df["t"].min(), 3),
            "t_max_s": round(df["t"].max(), 3),
            "d_max_mm": round(df["d"].max(), 4),
            "d_min_mm": round(df["d"].min(), 4),
            "window_t0_s": sb["win_t0"], "window_t1_s": sb["win_t1"],
            "n_window_points": sb["n_win"],
            "derivedK_mm2_s": round(sb["K"], 4),        # steady-burn rate (derived)
            "window_r2": round(sb["r2"], 4),
            "naiveFullSlope_mm2_s": round(sb["full_K"], 4),  # NOT a valid rate
        })

    if not rows:
        print(f"No *_DropletData*.txt files found in {input_dir}")
        return

    out = pd.DataFrame(rows).sort_values("id").reset_index(drop=True)
    out = out.merge(official, on="id", how="left")
    out["officialRate"] = out["officialRate"].map(
        lambda v: "" if pd.isna(v) else round(v, 4))
    out["pct_diff_vs_official"] = out.apply(
        lambda r: round(100 * abs(r["derivedK_mm2_s"] - r["officialRate"]) / r["officialRate"], 1)
        if r["officialRate"] != "" and pd.notna(r["officialRate"]) else "",
        axis=1)

    out_csv.parent.mkdir(parents=True, exist_ok=True)
    out.to_csv(out_csv, index=False)
    print(f"Processed {len(out)} test(s) -> {out_csv}\n")
    with pd.option_context("display.width", 160, "display.max_columns", None):
        print(out.to_string(index=False))


if __name__ == "__main__":
    main()
