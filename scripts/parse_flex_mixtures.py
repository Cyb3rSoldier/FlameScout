# Parse FLEX Mixture files (chamber gas measurements) into one CSV.
#
# Each *_Mixture.txt is a small CSV: Date/Time plus measured volume
# percentages of O2, He, CO2, N2, Xe, H2O, and fuel species. Files are named
# by CIR test point (e.g. C021R01, X177R01), not by FLEX test id, so the
# test-point name is kept as-is. Values are stripped of the '%' sign.
#
# Output: datasets/flex_mixtures.csv  (one row per timestamped measurement)
#
# Deterministic parsing only. Usage:
#   python scripts/parse_flex_mixtures.py [input_dir]
# Default input: D:\nasa-space-apps\psi-69
import re
import sys
from pathlib import Path

import pandas as pd

DEFAULT_INPUT = Path(r"D:\nasa-space-apps\psi-69")
HERE = Path(__file__).resolve().parent.parent
OUT_CSV = HERE / "datasets" / "flex_mixtures.csv"
POINT_RE = re.compile(r"([A-Z]\d{3}[RF]\d{2})_Mixture", re.IGNORECASE)


def parse_file(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8", errors="replace")
    lines = [ln for ln in text.splitlines() if ln.strip()]
    if len(lines) < 2:
        return []
    header = [h.strip() for h in lines[0].split(",")]
    pm = POINT_RE.search(path.name)
    point = pm.group(1).upper() if pm else path.name.replace("_Mixture.txt", "")
    rows = []
    for ln in lines[1:]:
        parts = [p.strip() for p in ln.split(",")]
        if len(parts) != len(header):
            continue
        row = {"test_point": point, "file": path.name, "datetime": parts[0]}
        for name, val in zip(header[1:], parts[1:]):
            try:
                row[name] = float(val.rstrip("%"))
            except ValueError:
                row[name] = ""
        rows.append(row)
    return rows


def main() -> None:
    args = sys.argv[1:]
    input_dir = Path(args[0]) if args else DEFAULT_INPUT
    out_csv = Path(args[1]) if len(args) > 1 else OUT_CSV
    rows = []
    for path in sorted(input_dir.glob("*Mixture*.txt")):
        rows.extend(parse_file(path))
    if not rows:
        print(f"No *Mixture*.txt files found in {input_dir}")
        return
    df = pd.DataFrame(rows)
    out_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_csv, index=False)
    gases = ["O2", "CO2", "N2", "He", "Xe"]
    have = [g for g in gases if g in df.columns and (df[g] != "").astype(bool).any()]
    print(f"Parsed {len(df)} measurement(s) from {len(df['test_point'].unique())} "
          f"test point(s) -> {out_csv}")
    print("diluents seen across files:", have)


if __name__ == "__main__":
    main()
