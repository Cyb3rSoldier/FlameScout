# Parse FLEX-2 (PSI-68) MDCA test point settings into one CSV.
#
# PSI-68 ships these as CSV files (A109D03_MDCA_Testpoint_Settings.txt):
# quoted header of ~62-77 columns, then one data row per executed test
# point/run. Key columns (base names, suffixes vary by file):
#   TEST_POINT_DESIGNATOR, PIP TimeStamp, MAIN_COMPUTER_TIME(GMT),
#   TP_PARAMETER_IGNITER_ON_TIME, TP_PARAMETER_IGNITER_WATTAGE,
#   TP_PARAMETER_BURN_TO_COMPLETION_TIME, igniter/dispenser/needle positions.
#
# Output: datasets/flex2_testpoints.csv (one row per executed run)
#
# Deterministic parsing only. Usage:
#   python scripts/parse_flex2_testpoints.py [input_dir]
# Default input: D:\nasa-space-apps\psi-68
import csv
import sys
from pathlib import Path

import pandas as pd

DEFAULT_INPUT = Path(r"D:\nasa-space-apps\psi-68")
HERE = Path(__file__).resolve().parent.parent
OUT_CSV = HERE / "datasets" / "flex2_testpoints.csv"

# output column -> source header base name (matched by prefix before "(")
WANT = {
    "test_point": "TEST_POINT_DESIGNATOR",
    "pip_timestamp": "PIP TimeStamp",
    "main_computer_time_gmt": "MAIN_COMPUTER_TIME",
    "igniter_1_profile": "IGNITER_1_PROFILE",
    "igniter_2_profile": "IGNITER_2_PROFILE",
    "igniter_on_time_ms": "TP_PARAMETER_IGNITER_ON_TIME",
    "igniter_wattage_w": "TP_PARAMETER_IGNITER_WATTAGE",
    "burn_to_completion_ms": "TP_PARAMETER_BURN_TO_COMPLETION_TIME",
    "igniter_ignition_position_1": "TP_PARAMETER_IGNITER_IGNITION_POSITION_1",
    "igniter_ignition_position_2": "TP_PARAMETER_IGNITER_IGNITION_POSITION_2",
    "igniter_retract_position_1": "TP_PARAMETER_IGNITER_RETRACT_POSITION_1",
    "igniter_retract_position_2": "TP_PARAMETER_IGNITER_RETRACT_POSITION_2",
    "needle_dispense_position_1": "TP_PARAMETER_NEEDLE_DISPENSE_POSITION_1",
    "needle_dispense_position_2": "TP_PARAMETER_NEEDLE_DISPENSE_POSITION_2",
    "dispenser_velocity_1": "TP_PARAMETER_DISPENSER_VELOCITY_1",
    "dispenser_velocity_2": "TP_PARAMETER_DISPENSER_VELOCITY_2",
    "dispenser_acceleration_1": "TP_PARAMETER_DISPENSER_ACCELERATION_1",
    "dispenser_acceleration_2": "TP_PARAMETER_DISPENSER_ACCELERATION_2",
    "fiber_rotate_position": "TP_PARAMETER_FIBER_ROTATE_POSITION",
    "camera_zoom": "COLOR_CAMERA_PARAMETER_CAMERA_ZOOM",
}


def base(col: str) -> str:
    return col.split("(")[0].strip()


def parse_file(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8", errors="replace")
    reader = csv.reader(text.splitlines())
    rows = [r for r in reader if any(cell.strip() for cell in r)]
    if len(rows) < 2:
        return []
    header = rows[0]
    # map each wanted output column to a header index
    idx: dict[str, int] = {}
    for out_col, want in WANT.items():
        for i, col in enumerate(header):
            if base(col) == want and out_col not in idx:
                idx[out_col] = i
    out = []
    for r in rows[1:]:
        row = {c: (r[i].strip() if i < len(r) and c in idx else "") for c, i in idx.items()}
        tp = row.get("test_point", "")
        if not tp:
            # fallback: designator pattern from filename, e.g. A109D03
            import re
            m = re.search(r"([A-Z]\d{3}[RD]\d{2})", path.name, re.IGNORECASE)
            tp = m.group(1).upper() if m else path.stem
        row["test_point"] = tp.upper()
        row["file"] = path.name
        out.append(row)
    return out


def main() -> None:
    input_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
    rows: list[dict] = []
    files = sorted(input_dir.rglob("*_MDCA_Testpoint_Settings.txt"))
    seen: set[tuple[str, str]] = set()  # (test_point, pip_timestamp)
    for path in files:
        for r in parse_file(path):
            key = (r["test_point"], r.get("pip_timestamp", ""))
            if key in seen:
                continue
            seen.add(key)
            rows.append(r)
    if not rows:
        print(f"No MDCA test point setting files found in {input_dir}")
        return
    df = pd.DataFrame(rows)
    cols = ["test_point", "file"] + [c for c in df.columns if c not in ("test_point", "file")]
    df = df[cols]
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_CSV, index=False)
    burned = df["burn_to_completion_ms"].notna().sum()
    print(f"Parsed {len(df)} run row(s) from {len(files)} files "
          f"({df['test_point'].nunique()} unique test points, {burned} with burn-to-completion) "
          f"-> {OUT_CSV}")


if __name__ == "__main__":
    main()
