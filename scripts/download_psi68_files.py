# Download FLEX-2 (PSI-68) small science text files from the PSI data
# repository, using the same public presigned-URL endpoint as the PSI-69
# downloader (scripts/download_psi69_files.py).
#
# FLEX-2 stores droplet-diameter traces inside image .zip archives (skipped
# here); the small text files carry the science metadata that matters for
# suppression atmospheres:
#   *_Mixture.txt                 chamber gas incl. SF6/He/CO2 diluents
#   D#D#.txt                      test point settings (igniter, burn time...)
#   *_MDCA_Testpoint_Settings.txt droplet deployment settings
#   *_Comments.txt                crew/scientist comments
#   *_Chamber_Readings.txt        pressure/temperature series
#   *_Radiometer_Readings.txt     flame radiometer series
#
# Files already on disk are skipped (re-runnable).
#
# Usage: python scripts/download_psi68_files.py [category ...]
#   mixture | settings | comments | chamber | radiometer   (default: all)
import json
import re
import sys
import time
from pathlib import Path

import requests

OUT_DIR = Path(r"D:\nasa-space-apps\psi-68")
INVENTORY = OUT_DIR / "psi68_filelist.json"
INVESTIGATION = "PSI-68"
BASE = f"https://psi.nasa.gov/geode-py/ws/studies/{INVESTIGATION}/download"
HEADERS = {
    "Referer": f"https://psi.nasa.gov/physci/repo/data/investigations/{INVESTIGATION}",
    "Origin": "https://psi.nasa.gov",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlameScout/1.0",
}
CATEGORIES = {
    "mixture": re.compile(r"_Mixture\.txt$", re.IGNORECASE),
    "settings": re.compile(r"(^D\d+D\d+\.txt$|_MDCA_Testpoint_Settings\.txt$)",
                           re.IGNORECASE),
    "comments": re.compile(r"_Comments\.txt$", re.IGNORECASE),
    "chamber": re.compile(r"_Chamber_Readings\.txt$", re.IGNORECASE),
    "radiometer": re.compile(r"_Radiometer_Readings\.txt$", re.IGNORECASE),
}


def fetch_file(entry: dict, out_dir: Path) -> str:
    key = entry["key"]
    name = key.rsplit("/", 1)[-1]
    import urllib.parse
    dest = out_dir / name
    if dest.exists() and dest.stat().st_size > 0:
        return "exists"
    url = (f"{BASE}?file={urllib.parse.quote(name)}&"
           f"version={entry.get('version', 1)}&redirect=false")
    s = requests.Session()
    s.headers.update(HEADERS)
    r = s.get(url, timeout=60)
    presigned = r.text.strip()
    if not presigned.startswith("http"):
        return f"no-url: {presigned[:60]}"
    r2 = s.get(presigned, timeout=120)
    if r2.status_code != 200 or len(r2.content) == 0:
        return f"s3-{r2.status_code}"
    dest.write_bytes(r2.content)
    return "ok"


def main() -> None:
    sel = [a.lower() for a in sys.argv[1:]] or list(CATEGORIES)
    filters = [CATEGORIES[s] for s in sel if s in CATEGORIES]
    if not filters:
        print("unknown category; use: " + " | ".join(CATEGORIES))
        return

    files = json.load(open(INVENTORY, encoding="utf-8"))
    todo = [f for f in files
            if any(p.search(f["key"].rsplit("/", 1)[-1]) for p in filters)]
    print(f"inventory: {len(files)} files | selected: {len(todo)}", flush=True)

    counts = {"ok": 0, "exists": 0, "err": 0}
    t0 = time.time()
    for i, entry in enumerate(todo, 1):
        name = entry["key"].rsplit("/", 1)[-1]
        try:
            res = fetch_file(entry, OUT_DIR)
        except Exception as e:
            res = type(e).__name__ + ": " + str(e)[:80]
        counts["ok" if res == "ok" else "exists" if res == "exists" else "err"] += 1
        if res not in ("ok", "exists"):
            print(f"  [{i}] {name}: {res}", flush=True)
        elif res == "ok" and counts["ok"] % 25 == 0:
            print(f"... {counts['ok']} downloaded, {time.time()-t0:.0f}s",
                  flush=True)
    print(f"done in {time.time()-t0:.0f}s -> {dict(counts)}", flush=True)


if __name__ == "__main__":
    main()
