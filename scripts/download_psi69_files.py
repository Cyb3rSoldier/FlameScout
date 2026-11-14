# Download FLEX (PSI-69) science text files directly from the PSI data
# repository, using the public presigned-URL endpoint the PSI web portal
# itself uses. This replaces the manual browser workflow: the full file
# inventory comes from POST /geode-py/ws/files/v2 (see psi69_filelist.json),
# and each file is fetched via GET /geode-py/ws/studies/PSI-69/download
# which returns a presigned S3 URL.
#
# Categories kept (small text files only):
#   *_DropletData.txt   droplet diameter time series
#   *_TestSheet.txt/.rtf per-test science sheets
#   *_Mixture.txt       chamber gas measurements
# Large video/image files are intentionally skipped.
#
# Files already present on disk are skipped, so the script is re-runnable.
#
# Usage:
#   python scripts/download_psi69_files.py            # all three categories
#   python scripts/download_psi69_files.py droplet    # just DropletData
#   python scripts/download_psi69_files.py sheets     # just TestSheets
#   python scripts/download_psi69_files.py mixture    # just Mixture
import json
import os
import sys
import time
from pathlib import Path

import requests

OUT_DIR = Path(r"D:\nasa-space-apps\psi-69")
INVENTORY = Path(r"D:\nasa-space-apps\psi-69\psi69_filelist.json")
INVESTIGATION = "PSI-69"
BASE = f"https://psi.nasa.gov/geode-py/ws/studies/{INVESTIGATION}/download"
HEADERS = {
    "Referer": f"https://psi.nasa.gov/physci/repo/data/investigations/{INVESTIGATION}",
    "Origin": "https://psi.nasa.gov",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlameScout/1.0",
}
CATEGORIES = {
    "droplet": lambda n: n.endswith("_DropletData.txt"),
    "sheets": lambda n: "_TestSheet" in n,
    "mixture": lambda n: n.endswith("_Mixture.txt"),
}


def fetch_file(entry: dict, out_dir: Path) -> str:
    """Download one inventory entry. Returns 'ok', 'exists', or an error string."""
    key = entry["key"]
    name = key.rsplit("/", 1)[-1]
    dest = out_dir / name
    if dest.exists() and dest.stat().st_size > 0:
        return "exists"
    url = f"{BASE}?file={name}&version={entry.get('version', 1)}&redirect=false"
    s = requests.Session()
    s.headers.update(HEADERS)
    r = s.get(url, timeout=60)
    presigned = r.text.strip()
    if not presigned.startswith("http"):
        return f"no-url: {presigned[:80]}"
    r2 = s.get(presigned, timeout=120)
    if r2.status_code != 200 or len(r2.content) == 0:
        return f"s3-{r2.status_code}"
    dest.write_bytes(r2.content)
    return "ok"


def main() -> None:
    sel = [a.lower() for a in sys.argv[1:]] or list(CATEGORIES)
    filters = [CATEGORIES[s] for s in sel if s in CATEGORIES]
    if not filters:
        print("unknown category; use: droplet | sheets | mixture")
        return
    keep = lambda n: any(f(n) for f in filters)  # noqa: E731

    files = json.load(open(INVENTORY, encoding="utf-8"))
    todo = [f for f in files if keep(f["key"].rsplit("/", 1)[-1])]
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
        elif res == "ok":
            print(f"  [{i}] {name}: ok ({entry.get('bytes', 0)} B)", flush=True)
        if res == "ok" and counts["ok"] % 25 == 0:
            print(f"... {counts['ok']} downloaded, {time.time()-t0:.0f}s", flush=True)
    print(f"done in {time.time()-t0:.0f}s -> {dict(counts)}", flush=True)


if __name__ == "__main__":
    main()
