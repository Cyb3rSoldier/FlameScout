# Parse FLEX-2 (PSI-68) Comments / Chamber_Readings / Radiometer_Readings
# into compact summary CSVs.
#
# Raw files (one per test point/run, e.g. A109D03_*) live outside the repo;
# we commit deterministic summaries:
#   - Comments: free-text crew/downlink notes, split per "Test Point:" block,
#     long image-delta diagnostic runs collapsed to one note line.
#   - Chamber_Readings: ~1 Hz CSV time series (129 cols). Summary = sample
#     count, time span, min/mean/max of the 4 absolute pressure channels
#     (PT16/PT17/PT28/PT29, PSIA) and mean temperature (TM1-TM4, Deg C).
#   - Radiometer_Readings: 100 Hz narrow-band radiometer CSV (208 cols).
#     Summary = sample count, span, igniter-On fraction, and VDC stats of the
#     NARROW_BAND_RADIOMETER_SAMPLE_* channels (flame-radiation signal).
#
# Deterministic parsing only. Usage:
#   python scripts/parse_flex2_readings.py [input_dir]
# Default input: D:\nasa-space-apps\psi-68
import csv
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd

DEFAULT_INPUT = Path(r"D:\nasa-space-apps\psi-68")
HERE = Path(__file__).resolve().parent.parent
DS = HERE / "datasets"

PT_CHANNELS = ["PT16", "PT17", "PT28", "PT29"]
TM_CHANNELS = ["TM1", "TM2", "TM3", "TM4"]


def tp_from_name(name: str) -> str:
    m = re.match(r"^(.+?)_(?:Comments|Chamber_Readings|Radiometer_Readings)\.txt$", name)
    return m.group(1) if m else Path(name).stem


def num(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce")


# ─────────────────────────── comments ───────────────────────────

DELTA_LINE = re.compile(r"^Image #\d+ has a delta of \d+$")


def parse_comments_file(path: Path) -> list[dict]:
    lines = [l.rstrip() for l in path.read_text(encoding="utf-8", errors="replace").splitlines()]
    blocks: list[dict] = []
    cur: dict | None = None
    buf: list[str] = []
    date = ""
    # leading date line like "4/20/2016 dld IPSU1, ..."
    if lines and re.match(r"^\d{1,2}/\d{1,2}/\d{4}\b", lines[0].strip()):
        date = lines[0].strip()
    for ln in lines:
        m = re.match(r"^Test Point:\s*(\S+)", ln.strip())
        if m:
            if cur:
                cur["note"] = " ".join(buf).strip()
                blocks.append(cur)
            cur = {"test_point": m.group(1), "date": date}
            buf = []
            continue
        if cur is not None and ln.strip():
            buf.append(ln.strip())
    if cur:
        cur["note"] = " ".join(buf).strip()
        blocks.append(cur)
    # collapse image-delta diagnostic runs inside each note
    out = []
    for b in blocks:
        parts: list[str] = []
        n_delta = 0
        for ln in b["note"].split(" "):
            pass
        # rebuild from raw lines is cleaner: re-split the file text instead
        out.append(b)
    return blocks


def collapse_deltas(text: str) -> str:
    kept: list[str] = []
    n = 0
    for ln in text.splitlines():
        if DELTA_LINE.match(ln.strip()):
            n += 1
            continue
        kept.append(ln.strip())
    if n:
        kept.append(f"[{n} image-delta diagnostic lines omitted]")
    return " | ".join(k for k in kept if k)


def build_comments(input_dir: Path) -> pd.DataFrame:
    rows = []
    for path in sorted(input_dir.rglob("*_Comments.txt")):
        lines = [l for l in path.read_text(encoding="utf-8", errors="replace").splitlines()]
        # keep raw lines for delta collapsing
        date = ""
        if lines and re.match(r"^\d{1,2}/\d{1,2}/\d{4}\b", lines[0].strip()):
            date = lines[0].strip()
        cur_tp = tp_from_name(path.name)  # fallback before first marker
        buf: list[str] = []
        started = False
        for ln in lines:
            m = re.match(r"^Test Point:\s*(\S+)", ln.strip())
            if m:
                if started:
                    rows.append({
                        "file": path.name,
                        "test_point": cur_tp,
                        "date": date,
                        "note": collapse_deltas("\n".join(buf)),
                    })
                cur_tp = m.group(1)
                buf = []
                started = True
                continue
            if started and ln.strip():
                buf.append(ln.strip())
        if started:
            rows.append({
                "file": path.name,
                "test_point": cur_tp,
                "date": date,
                "note": collapse_deltas("\n".join(buf)),
            })
    return pd.DataFrame(rows)


# ─────────────────────────── chamber ───────────────────────────

def build_chamber(input_dir: Path) -> pd.DataFrame:
    rows = []
    for path in sorted(input_dir.rglob("*_Chamber_Readings.txt")):
        try:
            df = pd.read_csv(path, encoding="utf-8", encoding_errors="replace", on_bad_lines="skip")
        except Exception:
            continue
        if df.empty or "FCU TimeStamp" not in df.columns:
            continue
        row: dict = {
            "file": path.name,
            "test_point": tp_from_name(path.name),
            "n_samples": len(df),
            "t_start": str(df["FCU TimeStamp"].iloc[0]),
            "t_end": str(df["FCU TimeStamp"].iloc[-1]),
        }
        for ch in PT_CHANNELS:
            s = num(df.get(f"FCU_MP_{ch}(PSIA)", pd.Series(dtype="float64")))
            row[f"{ch.lower()}_psia_min"] = round(float(s.min()), 4) if s.notna().any() else ""
            row[f"{ch.lower()}_psia_mean"] = round(float(s.mean()), 4) if s.notna().any() else ""
            row[f"{ch.lower()}_psia_max"] = round(float(s.max()), 4) if s.notna().any() else ""
        for ch in TM_CHANNELS:
            s = num(df.get(f"FCU_MP_{ch}(Deg C)", pd.Series(dtype="float64")))
            row[f"{ch.lower()}_c_mean"] = round(float(s.mean()), 3) if s.notna().any() else ""
        rows.append(row)
    return pd.DataFrame(rows)


# ─────────────────────────── radiometer ───────────────────────────

def build_radiometer(input_dir: Path) -> pd.DataFrame:
    rows = []
    for path in sorted(input_dir.rglob("*_Radiometer_Readings.txt")):
        try:
            df = pd.read_csv(path, encoding="utf-8", encoding_errors="replace", on_bad_lines="skip")
        except Exception:
            continue
        if df.empty or "PIP TimeStamp" not in df.columns:
            continue
        sample_cols = [c for c in df.columns if c.startswith("NARROW_BAND_RADIOMETER_SAMPLE_")]
        row: dict = {
            "file": path.name,
            "test_point": tp_from_name(path.name),
            "n_samples": len(df),
            "t_start": str(df["PIP TimeStamp"].iloc[0]),
            "t_end": str(df["PIP TimeStamp"].iloc[-1]),
            "n_rad_channels": len(sample_cols),
        }
        if "IGNITER_POWER_STATUS(N/A)" in df.columns:
            st = df["IGNITER_POWER_STATUS(N/A)"].astype(str).str.strip()
            row["igniter_on_fraction"] = round(float((st == "On").mean()), 4)
        if sample_cols:
            vals = df[sample_cols].apply(num, axis=1)
            row["vdc_mean"] = round(float(vals.to_numpy(dtype="float64").mean()), 6)
            row["vdc_min"] = round(float(np.nanmin(vals.to_numpy(dtype="float64"))), 6)
            row["vdc_max"] = round(float(np.nanmax(vals.to_numpy(dtype="float64"))), 6)
            # per-row channel-mean peak = strongest average flame signal
            row["vdc_row_mean_max"] = round(float(vals.mean(axis=1).max()), 6)
        rows.append(row)
    return pd.DataFrame(rows)


def main() -> None:
    input_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT

    comments = build_comments(input_dir)
    if not comments.empty:
        out = DS / "flex2_comments.csv"
        comments.to_csv(out, index=False)
        print(f"comments: {len(comments)} note block(s) from {comments['file'].nunique()} files -> {out}")

    chamber = build_chamber(input_dir)
    if not chamber.empty:
        out = DS / "flex2_chamber_summary.csv"
        chamber.to_csv(out, index=False)
        p = chamber[[f"{c.lower()}_psia_mean" for c in PT_CHANNELS]].apply(pd.to_numeric, errors="coerce")
        print(f"chamber: {len(chamber)} file summary from {chamber['file'].nunique()} files; "
              f"mean chamber pressure range {p.min().min():.2f}-{p.max().max():.2f} PSIA -> {out}")

    radiometer = build_radiometer(input_dir)
    if not radiometer.empty:
        out = DS / "flex2_radiometer_summary.csv"
        radiometer.to_csv(out, index=False)
        print(f"radiometer: {len(radiometer)} file summary from {radiometer['file'].nunique()} files -> {out}")


if __name__ == "__main__":
    main()
