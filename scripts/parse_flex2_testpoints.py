# Parse FLEX-2 (PSI-68) test point setting files (D#D#.txt) into one CSV.
#
# Each file is a key:<TAB>value listing of a droplet test point's run
# parameters: igniter timing/wattage/position, "Burn to Completion", and
# AS/CC (astronaut setup) timestamps. The test point id comes from the
# "Test Point:" line (fallback: filename).
#
# Output: datasets/flex2_testpoints.csv (one row per test point)
#
# Deterministic parsing only. Usage:
#   python scripts/parse_flex2_testpoints.py [input_dir]
# Default input: D:\nasa-space-apps\psi-68
import re
import sys
from pathlib import Path

import pandas as pd

DEFAULT_INPUT = Path(r"D:\nasa-space-apps\psi-68")
HERE = Path(__file__).resolve().parent.parent
OUT_CSV = HERE / "datasets" / "flex2_testpoints.csv"
POINT_RE = re.compile(r"([A-Z]\d{3}D\d{2})", re.IGNORECASE)
KV_RE = re.compile(r"^([A-Za-z0-9 /()\-]+?)\s{2,}(.*)$")
KEYS = ["Igniter On Time (milliseconds)", "Igniter Wattage",
        "Igniter 1 Position", "Igniter 2 Position",
        "Burn to Completion (milliseconds)",
        "AS Burn to Completion/Igniter On", "AS Igniter Off/Retract Start",
        "CC Setup Started"]


def parse_file(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8", errors="replace")
    pm = POINT_RE.search(path.name)
    if not pm:
        return None
    point = pm.group(1).upper()
    row = {"test_point": point, "file": path.name}
    for ln in text.splitlines():
        m = KV_RE.match(ln.strip())
        if not m:
            continue
        key, val = m.group(1).strip(), m.group(2).strip()
        if key in KEYS and key not in row:
            row[key] = val
    return row if len(row) > 2 else None


def main() -> None:
    input_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
    rows = []
    for path in sorted(input_dir.glob("D*D*.txt")):
        r = parse_file(path)
        if r:
            rows.append(r)
    if not rows:
        print(f"No D*D*.txt test point files found in {input_dir}")
        return
    df = pd.DataFrame(rows)
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_CSV, index=False)
    burned = df["Burn to Completion (milliseconds)"].notna().sum()
    print(f"Parsed {len(df)} test point(s) ({burned} with burn-to-completion) "
          f"-> {OUT_CSV}")


if __name__ == "__main__":
    main()
