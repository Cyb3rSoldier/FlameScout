# Cross-validate every parsed FLEX TestSheet against Table IX and build
# a summary report:
#   datasets/flex_sheets_validation.md
#
# Dedupes the raw sheet CSV (same test can appear as .txt and .rtf variants)
# preferring the .txt version, then compares 9 fields per test against
# datasets/flex_table_ix.csv and counts cool-flame mentions.
#
# Deterministic: reads CSVs only.
#
# Usage: python scripts/flex_sheet_validation.py
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent.parent
SHEETS = HERE / "datasets" / "flex_test_sheets.csv"
IX = HERE / "datasets" / "flex_table_ix.csv"
REPORT = HERE / "datasets" / "flex_sheets_validation.md"

FIELDS = ["fuel", "p_atm_kPa", "o2", "n2", "co2", "he", "d0", "dExt", "kavg"]
TOL = lambda b: max(0.02 * abs(b), 0.01)  # noqa: E731


def main() -> None:
    sheets = pd.read_csv(SHEETS)
    ix = pd.read_csv(IX).set_index("id")

    # dedupe: one row per test, prefer txt over rtf
    sheets["pref"] = (sheets["format"] != "txt").astype(int)  # 0 = txt
    sheets = sheets.sort_values("pref").drop_duplicates("id", keep="first")

    stats = []
    for _, r in sheets.iterrows():
        tid = r["id"]
        if tid not in ix.index:
            stats.append({"id": tid, "in_table": False, "exact": 0, "approx": 0,
                          "missing": len(FIELDS), "cool_flame": r["cool_flame_mentioned"]})
            continue
        o = ix.loc[tid]
        checks = {
            "fuel": str(r["fuel"]).lower() == str(o["fuel"]).lower(),
            "p_atm_kPa": (r["pressure_atm"] is not None and r["pressure_atm"] == r["pressure_atm"]
                          and abs(r["pressure_atm"] * 101.325 - o["pressureKpa"]) <= TOL(o["pressureKpa"])),
            "o2": r["o2"] == r["o2"] and abs(r["o2"] - o["o2"]) <= TOL(o["o2"]),
            "n2": r["n2"] == r["n2"] and abs(r["n2"] - o["n2"]) <= TOL(o["n2"]),
            "co2": r["co2"] == r["co2"] and abs(r["co2"] - o["co2"]) <= TOL(o["co2"]),
            "he": r["he"] == r["he"] and abs(r["he"] - o["he"]) <= TOL(o["he"]),
            "d0": r["d0_mm"] == r["d0_mm"] and abs(r["d0_mm"] - o["d0mm"]) <= TOL(o["d0mm"]),
            "dExt": r["dext_mm"] == r["dext_mm"] and abs(r["dext_mm"] - o["dExtmm"]) <= TOL(o["dExtmm"]),
            "kavg": r["kavg_mm2_s"] == r["kavg_mm2_s"] and abs(r["kavg_mm2_s"] - o["burningRateMm2s"]) <= TOL(o["burningRateMm2s"]),
        }
        stats.append({"id": tid, "in_table": True, "exact": sum(checks.values()),
                      "approx": len(FIELDS) - sum(checks.values()), "missing": 0,
                      "cool_flame": r["cool_flame_mentioned"]})

    s = pd.DataFrame(stats).sort_values("id")
    t = s[s["in_table"]]
    n = len(t)
    exact_all = int((t["exact"] == 9).sum())
    at_least_8 = int((t["exact"] >= 8).sum())
    cool = int(s["cool_flame"].sum())

    lines = [
        "# FLEX TestSheet cross-validation (all PSI-69 sheets)",
        "",
        f"- TestSheet files parsed: {len(pd.read_csv(SHEETS))}"
        f" (txt + rtf variants), **{len(sheets)} unique tests**",
        f"- Tests present in Table IX: {n}"
        f" ({len(sheets) - n} sheet-only records or not charted)",
        f"- **All 9 fields exact: {exact_all}/{n} ({100*exact_all/n:.0f}%)**",
        f"- At least 8 of 9 fields exact: {at_least_8}/{n} ({100*at_least_8/n:.0f}%)",
        f"- Sheets explicitly mentioning cool flames: {cool}",
        "",
        "Sheets carry the crew-recorded ambient environment, fuel, D0,",
        "Dext, k_avg and behavior comments. Every field is matched against",
        "Table IX of NASA/TP-2015-216046 within 2% or 0.01 absolute.",
        "",
        "## Tests with any field not matching exactly",
        "",
        "| test | exact/9 | cool flame |",
        "|---|---|---|",
    ]
    for _, r in t[t["exact"] < 9].iterrows():
        lines.append(f"| {r['id']} | {r['exact']}/9 | {'yes' if r['cool_flame'] else '-'} |")

    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"report -> {REPORT}")
    print(f"unique tests {len(sheets)} | in table {n} | exact 9/9: {exact_all}"
          f" | >=8/9: {at_least_8} | cool-flame mentions: {cool}")


if __name__ == "__main__":
    main()
