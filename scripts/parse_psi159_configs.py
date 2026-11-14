# Parse PSI per-test-point configuration files (key:value TXT) into one
# machine-readable CSV, sorted by test point name.
#
# PSI hosts raw configs like "testpointName21256A1,.txt" and
# "setCameraAttributestrue,.txt": one "key:value," pair per line.
# This script is deliberately deterministic (no LLM in the data path):
#   1. read every *.txt in the input folder
#   2. regex-extract key:value pairs
#   3. pivot to one row per file (test point)
#   4. write a sorted CSV + a compact RAG-chunk JSONL describing each
#      test point's run conditions in plain text
#
# Usage:  python scripts/parse_psi159_configs.py [input_dir] [output_csv]
# Defaults: input  D:\nasa-space-apps\psi-159
#           output datasets/psi159_test_point_configs.csv
import io
import json
import re
import sys
from pathlib import Path

import pandas as pd

DEFAULT_INPUT = r"D:\nasa-space-apps\psi-159"
HERE = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT = HERE / "datasets" / "psi159_test_point_configs.csv"

PAIR_RE = re.compile(r"([A-Za-z][A-Za-z0-9_]*)\s*:\s*([^,\n]+)")

# The fields that describe actual combustion run conditions (vs camera ops).
RUN_KEYS = [
    "testpointName", "dataCameraPreIgnitionExposureUs", "dataCameraTestExposureUs",
    "intensifierIgnitionGain", "intensifierTestGain", "preIgnitionImageTimeSec",
    "postFlameImagingTimeSec", "igniterStartPosition", "igniterEndPosition",
    "igniterVelocityCountsPerSec", "igniterPreheatPowerV", "igniterIgnitionPowerV",
    "pmt1Gain", "pmt2Gain", "pmt3Gain", "useFoma", "flowTimeoutSec",
    "oxidizerIgnitionFlowSlpm", "nitrogenIgnitionFlowSlpm",
    "oxidizerTestFlow1Slpm", "nitrogenTestFlow1Slpm",
    "oxidizerTestFlow2Slpm", "nitrogenTestFlow2Slpm",
    "constantFlowTime1Sec", "stabilizationTime1Sec", "stabilizationTime2Sec",
    "postExtinctionDelaySec",
]


def parse_pairs(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8", errors="replace")
    pairs = dict(PAIR_RE.findall(text))
    return {k: v.strip() for k, v in pairs.items() if v}


def main() -> None:
    input_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(DEFAULT_INPUT)
    out_csv = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUTPUT

    rows, chunks = [], []
    for path in sorted(input_dir.glob("*.txt")):
        pairs = parse_pairs(path)
        if not pairs:
            print(f"skip (no key:value pairs): {path.name}")
            continue
        name = pairs.get("testpointName") or path.stem
        pairs.setdefault("testpointName", name)
        pairs["sourceFile"] = path.name
        rows.append(pairs)
        run = {k: pairs[k] for k in RUN_KEYS if k in pairs}
        chunks.append({
            "id": f"psi159::{name}",
            "text": (f"PSI-159 test point {name} run configuration: "
                     + "; ".join(f"{k} = {v}" for k, v in run.items())
                     + f". Source file: {path.name}."),
            "metadata": {"source": "PSI-159", "testPoint": name, "type": "runConfig",
                         "sourceFile": path.name},
        })

    if not rows:
        print(f"No parseable *.txt configs found in {input_dir}")
        return

    df = pd.DataFrame(rows)
    cols = ["testpointName"] + [c for c in df.columns if c not in ("testpointName", "sourceFile")] + ["sourceFile"]
    df = df[cols].sort_values("testpointName").reset_index(drop=True)

    out_csv.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_csv, index=False)

    jsonl = out_csv.with_suffix(".chunks.jsonl")
    jsonl.write_text("\n".join(json.dumps(c, ensure_ascii=False) for c in chunks) + "\n", encoding="utf-8")

    print(f"Parsed {len(df)} config file(s) -> {out_csv}")
    print(f"RAG chunks -> {jsonl}  ({len(chunks)} lines)\n")
    with pd.option_context("display.width", 200, "display.max_columns", None):
        run_df = df[[c for c in RUN_KEYS if c in df.columns] + (["sourceFile"] if "sourceFile" in df.columns else [])]
        print(run_df.to_string(index=False))


if __name__ == "__main__":
    main()
