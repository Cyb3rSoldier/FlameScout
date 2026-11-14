# Parse FLEX TestSheet files (*.txt and *.rtf) into one CSV and cross-validate
# against the Table IX dataset (datasets/flex_table_ix.csv).
#
# TestSheets carry: ambient environment (pressure, O2/N2/CO2/He, temperature),
# test conditions (fuel, D0, kavg, Dext, fiber), and free-text behavior
# comments (incl. cool-flame indications).
#
# Deterministic parsing only:
#   *.txt — plain text, tab-separated key:value
#   *.rtf — strip RTF control words and embedded {\pict ...} hex blobs first
#
# Outputs:
#   datasets/flex_test_sheets.csv            — one row per test sheet
#   (printed) side-by-side check vs Table IX for every numeric field
#
# Usage:  python scripts/parse_flex_test_sheets.py [input_dir]
# Default input: D:\nasa-space-apps\psi-69
import io
import re
import sys
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent.parent
DEFAULT_INPUT = Path(r"D:\nasa-space-apps\psi-69")
OUT_CSV = HERE / "datasets" / "flex_test_sheets.csv"

ID_RE = re.compile(r"FLEX-\d+", re.IGNORECASE)
KV = {
    "pressure_atm": r"Pressure \(atm\)\s*=\s*([0-9.]+)",
    "o2": r"O2 Mole Fraction\s*=\s*([0-9.]+)",
    "n2": r"N2 Mole Fraction\s*=\s*([0-9.]+)",
    "co2": r"CO2 Mole Fraction\s*=\s*([0-9.]+)",
    "he": r"He Mole Fraction\s*=\s*([0-9.]+)",
    "temperature_k": r"Temperature \(K\)\s*=\s*([0-9.]+)",
    "d0_mm": r"D\s*0\s*\(mm\)\s*=\s*([0-9.]+)",
    "kavg_mm2_s": r"k\s*avg\s*\(mm.?2.?/s\)\s*=\s*([0-9.]+)",
    "dext_mm": r"D\s*ext\s*\(mm\)\s*=\s*([0-9.]+)",
}
FUEL_RE = re.compile(r"Fuel:?\s*\t*\s*(\w+)", re.IGNORECASE)
CIR_RE = re.compile(r"CIR Test Number:\s*\t*\s*(\S+)", re.IGNORECASE)
DATE_RE = re.compile(r"Test Date:\s*\t*\s*([A-Za-z]+,\s*[A-Za-z]+ \d+, \d{4}|[A-Za-z]+ \d+, \d{4})")
COOL_RE = re.compile(r"cool[- ]flame", re.IGNORECASE)

RTF_PICT = re.compile(r"\{\\pict.*?\}", re.DOTALL | re.IGNORECASE)
RTF_CONTROL = re.compile(r"\\[a-z]+-?\d* ?|\\'x?[0-9a-fA-F]{2}|\\[{}]|\\|\{|\}")
RTF_HEADER = re.compile(r"^\\\*?[\w-]+|^\\mac|^\\deff\d+")


def strip_rtf(raw: str) -> str:
    raw = RTF_PICT.sub(" ", raw)          # drop embedded image hex blobs
    raw = raw.replace("\\:", ":").replace("\\par", "\n").replace("\\tab", "\t")
    raw = RTF_CONTROL.sub(" ", raw)
    return re.sub(r"[ \t]+", lambda m: "\t" if "\t" in m.group(0) else " ", raw)


def parse_sheet(path: Path) -> dict | None:
    raw = path.read_text(encoding="utf-8", errors="replace")
    text = strip_rtf(raw) if path.suffix.lower() == ".rtf" else raw
    m = ID_RE.search(text)
    if not m:
        return None
    row = {"id": m.group(0).upper(), "file": path.name,
           "format": path.suffix.lower().lstrip(".")}

    def val(key: str):
        mm = re.search(KV[key], text, re.IGNORECASE)
        return float(mm.group(1)) if mm else None

    for key in KV:
        row[key] = val(key)
    fm = FUEL_RE.search(text)
    row["fuel"] = fm.group(1).capitalize() if fm else ""
    cm = CIR_RE.search(text)
    row["cir_test"] = cm.group(1) if cm else ""
    dm = DATE_RE.search(text)
    row["test_date"] = dm.group(1).replace(",", "") if dm else ""
    row["cool_flame_mentioned"] = bool(COOL_RE.search(text))
    com = re.search(r"COMMENTS?:?(.*?)(?:\\pict|$)", text, re.IGNORECASE | re.DOTALL)
    if com:
        row["comments"] = re.sub(r"\s+", " ", com.group(1)).strip()[:600]
    return row


def main() -> None:
    input_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
    official = pd.read_csv(OUT_CSV.parent / "flex_table_ix.csv")

    rows = []
    for path in sorted(input_dir.glob("*TestSheet*")):
        r = parse_sheet(path)
        if r:
            rows.append(r)
    if not rows:
        print(f"No *TestSheet* files found in {input_dir}")
        return

    df = pd.DataFrame(rows).sort_values("id").reset_index(drop=True)
    df.to_csv(OUT_CSV, index=False)

    ix = official.set_index("id")
    print(f"Parsed {len(df)} TestSheet(s) -> {OUT_CSV}\n")
    for _, r in df.iterrows():
        if r["id"] not in ix.index:
            print(f"{r['id']}: NOT in Table IX — sheet-only record")
            continue
        o = ix.loc[r["id"]]
        checks = [
            ("fuel", str(r["fuel"]).lower(), str(o["fuel"]).lower()),
            ("p_atm_kPa", round(r["pressure_atm"] * 101.325, 2) if r["pressure_atm"] else None, o["pressureKpa"]),
            ("o2", r["o2"], o["o2"]), ("n2", r["n2"], o["n2"]),
            ("co2", r["co2"], o["co2"]), ("he", r["he"], o["he"]),
            ("d0", r["d0_mm"], o["d0mm"]), ("dExt", r["dext_mm"], o["dExtmm"]),
            ("kavg", r["kavg_mm2_s"], o["burningRateMm2s"]),
        ]
        ok = lambda a, b: (a is not None and b is not None and
                           (str(a) == str(b) or (isinstance(a, (int, float)) and isinstance(b, (int, float))
                                                 and abs(a - b) <= max(0.02 * abs(b), 0.01))))
        marks = "".join("Y" if ok(a, b) else "~" if (a is not None and b is not None) else "-" for _, a, b in checks)
        print(f"{r['id']} [{marks}] cool-flame={r['cool_flame_mentioned']}: "
              + " ".join(f"{n}:{a}{'=' + str(b) if not ok(a, b) else ''}" for n, a, b in checks))


if __name__ == "__main__":
    main()
