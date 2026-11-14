# Parse the CFI-G (PSI-159) "flow traces etc" run log into one CSV.
#
# The text layer of "PSI-159_Raw Data_21256 flow traces etc.pdf" carries,
# per test point: the test number, the variant type, the ignition/test
# flow rates, the chamber condition, the ignition outcome, and post-test
# readings. This script extracts those fields with regex (deterministic —
# no LLM in the data path), sorts by test name, and writes:
#   datasets/cfig_21256_runs.csv            — one row per test
#   datasets/cfig_21256_runs.chunks.jsonl   — RAG chunks
#
# Usage:  python scripts/parse_cfig_runs.py
import io
import json
import re
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent.parent
SRC = Path(r"D:\nasa-space-apps\psi-159\extracted\PSI-159_Raw Data_21256 flow traces etc.txt")
OUT_CSV = HERE / "datasets" / "cfig_21256_runs.csv"

CHAMBER_RE = re.compile(r"Chamber (filled|diluted) to 2 atm with ~(\d+)% n-butane")


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def parse_block(block: str) -> dict:
    b = norm(block)
    row: dict = {}

    m = re.search(r"Test (\d{5}\w+)", b)
    if not m:
        return {}
    row["test"] = m.group(1)

    m = re.search(r"test (\d+) of 17", b)
    row["day_test_num"] = m.group(1) if m else ""
    m = re.search(r"hot flame (?:of|(\d+) of) 17", b)
    row["hot_flame_num"] = m.group(1) or "" if m else ""

    row["outcome"] = ("unsustained ignition" if "unsustained ignition" in b
                      else "sustained ignition" if "sustained ignition" in b else "")
    row["variant"] = next((v for tag, v in [
        ("diluted-atmosphere variant of", "diluted-atmosphere"),
        ("dilution variant of", "dilution"),
        ("flow variant of", "flow"),
        ("TFP variant of", "TFP"),
    ] if tag in b), "")
    m = re.search(r"(?:variant of)\s+([A-Z0-9+\-]+(?:\s*-\s*[A-Z0-9]+)*)", b)
    row["variant_of"] = norm(m.group(1)) if m else ""

    for col, key in [("ox_ignition_slpm", "oxidizerIgnitionFlowSlpm"),
                     ("n2_ignition_slpm", "nitrogenIgnitionFlowSlpm"),
                     ("ox_test1_slpm", "oxidizerTestFlow1Slpm"),
                     ("n2_test1_slpm", "nitrogenTestFlow1Slpm")]:
        m = re.search(key + r"=([0-9.]+)", b)
        row[col] = float(m.group(1)) if m else None

    m = re.search(r"(\d+) on lowest valve safety timer", b)
    row["valve_safety_timer_s"] = int(m.group(1)) if m else None
    m = re.search(r"~?(\d+) psia in oxidizer bottle", b)
    row["ox_bottle_psia"] = int(m.group(1)) if m else None

    # chained assignment "oxidizerIgnitionFlowSlpm=oxidizerTestFlow1Slpm=0.197"
    for miss, chained in [("ox_ignition_slpm", r"oxidizerIgnitionFlowSlpm=oxidizerTestFlow1Slpm=([0-9.]+)"),
                          ("n2_ignition_slpm", r"nitrogenIgnitionFlowSlpm=nitrogenTestFlow1Slpm=([0-9.]+)"),
                          ("ox_test1_slpm", r"oxidizerTestFlow1Slpm=([0-9.]+)"),
                          ("n2_test1_slpm", r"nitrogenTestFlow1Slpm=([0-9.]+)"),
                          ("ox_ignition_slpm", r"oxidizerIgnitionFlowSlpm=([0-9.]+)"),
                          ("n2_ignition_slpm", r"nitrogenIgnitionFlowSlpm=([0-9.]+)")]:
        if row.get(miss) is None:
            m = re.search(chained, b)
            if m:
                row[miss] = float(m.group(1))

    m = CHAMBER_RE.search(b)
    row["chamber"] = (f"{m.group(1)}: ~{m.group(2)}% n-butane" if m else "")

    notes = []
    if "nitrogen didn't flow" in b:
        notes.append("nitrogen did not flow; effectively a repeat of A3")
    if "accidentally not saved" in b:
        notes.append("console flow-trace data not saved")
    if "almost as planned" in b:
        notes.append("run almost as planned (stabilizationTime2Sec=1)")
    row["notes"] = "; ".join(notes)
    return row


def main() -> None:
    text = SRC.read_text(encoding="utf-8", errors="replace")
    text = "\n".join(text.split("\n\n"))          # PDF page breaks -> flat text

    # Walk blocks in order, merging the "continued"/"After test" blocks of the
    # same test into one row; track the running chamber condition (filled 9%
    # butane -> diluted 7%) as it changes between tests.
    chamber_state = "filled: ~9% n-butane"
    merged: dict[str, dict] = {}
    order: list[str] = []
    for block in re.split(r"(?=Test \d{5}\w+)", text):
        parsed = parse_block(block)
        if not parsed or not parsed.get("test"):
            continue
        test = parsed["test"]
        if test not in merged:
            merged[test] = {"chamber": chamber_state}
            order.append(test)
        for k, v in parsed.items():
            cur = merged[test].get(k)
            if cur is None or cur == "":
                merged[test][k] = v
        chamber_line = CHAMBER_RE.search(norm(block))
        if chamber_line:                      # state changes after this block
            chamber_state = f"{chamber_line.group(1)}: ~{chamber_line.group(2)}% n-butane"

    df = pd.DataFrame([merged[t] for t in order])
    # RAD2 is a radiometer check, not a flame test — keep provenance, drop from runs
    df = df[~df["test"].str.contains("RAD")].sort_values("test").reset_index(drop=True)

    # join the 21256A1 run configuration (flows, igniter, camera) from the
    # separately downloaded config TXT, where the log text omits them
    cfg_path = OUT_CSV.parent / "psi159_test_point_configs.csv"
    if cfg_path.exists():
        cfg = pd.read_csv(cfg_path)
        cfg = cfg[cfg["testpointName"].isin(df["test"])]
        flow_cols = ["ox_ignition_slpm", "n2_ignition_slpm", "ox_test1_slpm", "n2_test1_slpm"]
        col_map = {"oxidizerIgnitionFlowSlpm": "ox_ignition_slpm",
                   "nitrogenIgnitionFlowSlpm": "n2_ignition_slpm",
                   "oxidizerTestFlow1Slpm": "ox_test1_slpm",
                   "nitrogenTestFlow1Slpm": "n2_test1_slpm"}
        cfg = cfg.rename(columns=col_map)[["testpointName"] + flow_cols]
        df = df.merge(cfg, left_on="test", right_on="testpointName", how="left", suffixes=("", "_cfg"))
        df = df.drop(columns=["testpointName"])
        for c in flow_cols:                     # config values never overwrite log values
            df[c] = df[c].combine_first(df[c + "_cfg"])
            df = df.drop(columns=[c + "_cfg"])

    df.to_csv(OUT_CSV, index=False)

    chunks = []
    for _, r in df.iterrows():
        flows = (f"oxidizer ignition {r.ox_ignition_slpm or '—'} slpm, N2 ignition {r.n2_ignition_slpm or '—'} slpm, "
                 f"oxidizer test {r.ox_test1_slpm or '—'} slpm, N2 test {r.n2_test1_slpm or '—'} slpm")
        chunks.append({
            "id": f"cfig::{r.test}",
            "text": (f"CFI-G (PSI-159) test {r.test}: {r.outcome or 'outcome not recorded in log'}. "
                     f"Variant: {r.variant or 'baseline'} ({r.variant_of or '—'}). {flows}. "
                     f"{('Chamber: ' + r.chamber + '.') if r.chamber else ''}"
                     f"{(' Notes: ' + r.notes + '.') if r.notes else ''} "
                     "Chamber baseline: 2 atm with ~9% n-butane (balance N2); burner O2 85% volume."),
            "metadata": {"source": "PSI-159 CFI-G", "testPoint": r.test,
                         "outcome": r.outcome, "type": "runResult",
                         "sourceFile": SRC.name},
        })
    OUT_CSV.with_suffix(".chunks.jsonl").write_text(
        "\n".join(json.dumps(c, ensure_ascii=False) for c in chunks) + "\n", encoding="utf-8")

    print(f"Parsed {len(df)} CFI-G runs -> {OUT_CSV}\n")
    with pd.option_context("display.width", 200, "display.max_columns", None):
        print(df.to_string(index=False))


if __name__ == "__main__":
    main()
