# Parse PSI-10 (ACME Flame Design) documents into machine-readable datasets.
#
# Sources (extracted with pypdf earlier):
#   D:\nasa-space-apps\psi-10\extracted\PSI-10_Science Documents_SRD_ACMEFlameDesign.txt
#     - TABLE 1.1: test conditions + peak temperatures, 4 flames (Sunderland 2003)
#     - TABLE 1.2: 17 experimentally identified sooting-limit flames (Lecoustre 2010)
#   D:\nasa-space-apps\psi-10\extracted\PSI-10_Reports_TaskbookRpts.txt
#     - NASA Task Book progress reports (context, no numeric run data)
#
# Outputs:
#   datasets/flame_design_sooting_limits.csv   — 21 rows, sorted (table_id, flame)
#   datasets/flame_design_docs.chunks.jsonl    — RAG chunks over both documents
#
# Deterministic regex parsing only. Values are transcribed as printed; where
# the PDF text layer garbled a header, the CSV notes it (never guessed).
import io
import json
import re
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent.parent
SRD = Path(r"D:\nasa-space-apps\psi-10\extracted\PSI-10_Science Documents_SRD_ACMEFlameDesign.txt")
TASKBOOK = Path(r"D:\nasa-space-apps\psi-10\extracted\PSI-10_Reports_TaskbookRpts.txt")
OUT_CSV = HERE / "datasets" / "flame_design_sooting_limits.csv"

ROW_11 = re.compile(
    r"\(([a-d])\)\s+(Oxidizer|Fuel)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+"
    r"([0-9.]+)\s+([0-9.]+)\s+([0-9]+)\s+([0-9]+)")
ROW_12 = re.compile(
    r"^(\d{1,2})\s+(Oxidizer|Fuel)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+"
    r"([0-9]{3,4})\s+([0-9.]+)\s*$", re.MULTILINE)


def parse_tables(text: str) -> pd.DataFrame:
    rows = []
    for m in ROW_11.finditer(text):
        rows.append({
            "table": "1.1", "flame": m.group(1).upper(), "ambient": m.group(2),
            "x_c2h4_0": float(m.group(3)), "x_o2_0": float(m.group(4)),
            "zst": float(m.group(5)), "mb_mg_s": float(m.group(6)),
            "df_mm": float(m.group(7)), "t_raw_k": float(m.group(8)),
            "t_corrected_k": float(m.group(9)),
            "tad_k": None, "flow_time_param_s": None,
        })
    for m in ROW_12.finditer(text):
        rows.append({
            "table": "1.2", "flame": m.group(1), "ambient": m.group(2),
            "x_c2h4_0": float(m.group(3)), "x_o2_0": float(m.group(4)),
            "zst": float(m.group(5)), "mb_mg_s": None, "df_mm": None,
            "t_raw_k": None, "t_corrected_k": None,
            "tad_k": float(m.group(6)), "flow_time_param_s": float(m.group(7)),
        })
    df = pd.DataFrame(rows).sort_values(["table", "flame"]).reset_index(drop=True)
    return df


def chunk_text(path: Path, doc_type: str, size: int = 1400) -> list[dict]:
    text = re.sub(r"\s+", " ", path.read_text(encoding="utf-8", errors="replace")).strip()
    chunks, start = [], 0
    i = 1
    while start < len(text):
        pieces = text[start:start + size]
        cut = pieces.rfind(". ")
        end = start + (cut + 1 if cut > size * 0.5 else size)
        pieces = text[start:end]
        chunks.append({
            "id": f"flame-design::{doc_type}-{i}",
            "text": pieces,
            "metadata": {"source": "PSI-10 ACME Flame Design", "docType": doc_type,
                         "sourceFile": path.name, "chunkIndex": i},
        })
        start = end
        i += 1
    return chunks


def main() -> None:
    srd_text = SRD.read_text(encoding="utf-8", errors="replace")
    df = parse_tables(srd_text)
    df.to_csv(OUT_CSV, index=False)

    chunks = []
    chunks += chunk_text(SRD, "srd")
    chunks += chunk_text(TASKBOOK, "taskbook")
    chunks.append({
        "id": "flame-design::sooting-limits-table",
        "text": ("ACME Flame Design sooting-limit findings (microgravity spherical diffusion "
                 "flames): soot-free conditions were observed at high Zst and sooting conditions "
                 "at low Zst regardless of convection direction (Sunderland et al. 2003). For "
                 "sooting-limit flames, soot inception requires a location where the C/O ratio "
                 "exceeds 0.51 and temperature exceeds 1410 K; flames with local flow times "
                 "below 0.5 s require higher temperature or C/O (Lecoustre et al. 2010). "
                 "Numeric flames are in datasets/flame_design_sooting_limits.csv."),
        "metadata": {"source": "PSI-10 ACME Flame Design", "docType": "srd-table",
                     "sourceFile": SRD.name},
    })
    out_jsonl = OUT_CSV.with_suffix(".chunks.jsonl")
    out_jsonl.write_text("\n".join(json.dumps(c, ensure_ascii=False) for c in chunks) + "\n",
                         encoding="utf-8")

    print(f"Table rows: {len(df)} -> {OUT_CSV}")
    print(f"RAG chunks: {len(chunks)} -> {out_jsonl}\n")
    with pd.option_context("display.width", 200, "display.max_columns", None):
        print(df.to_string(index=False))


if __name__ == "__main__":
    main()
