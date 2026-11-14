# SAME (PSI-101) TEM particle-size distribution (PSD) analysis.
#
# Every PDF under D:\nasa-space-apps\psi-101 embeds TEM images
# (Veleta camera, 200 kV) with a metadata banner carrying a scale bar
# ("-N um-"). We therefore calibrate each image from its own scale bar
# (verified per magnification group: 340X/1350X -> 10 um, 3400X/4400X
# -> 5 um, 7800X/10,000X -> 2 um) and measure particle equivalent
# diameters in real micrometres.
#
# Detection (deterministic, OpenCV):
#   1. extract embedded rasters (>=300 px) with pymupdf
#   2. find the scale-bar row (two dashes) in the bottom strip
#   3. valid area = bright pixels (excludes black surround + banner bg)
#   4. particles = dark blobs inside the valid area (Otsu threshold on
#      valid pixels), connected components, min area, no border-touching
#   5. equivalent diameter d = 2*sqrt(A/pi), circularity 4*pi*A/P^2
#
# House rule: image-derived sizes carry instrument uncertainty -> the
# dataset is flagged "image-derived, approximate" in the summary.
#
# Outputs:
#   datasets/same_tem_psd.csv          one row per particle
#   datasets/same_tem_psd_summary.md   per-image stats + caveats
#   datasets/same_tem_psd_hist.png     diameter histogram (all particles)
#
# Usage: python scripts/same_tem_psd.py [input_dir]
import re
import sys
from collections import defaultdict
from pathlib import Path

import cv2
import numpy as np
import pandas as pd
import pymupdf

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent.parent
DS = HERE / "datasets"
DEFAULT_INPUT = Path(r"D:\nasa-space-apps\psi-101")

# scale-bar values, verified visually from one crop per signature cluster
# (generated with: python scripts/same_tem_psd.py --dump -> bar_sigs/).
# Signature = (bar span px, dash px, dash px, text width px) at the burned-in
# banner of each raster; identical signature = identical bar text.
# PDF page labels were found to be unreliable on some pages, so the value
# comes from the banner itself, not from the label.
BAR_VALUES: dict[tuple, float] = {
    # (span, dash1, dash2, text_w): bar length in micrometres
    (138, 31, 32, 75): 10.0,
    (137, 31, 31, 75): 10.0,
    (126, 29, 29, 68): 10.0,
    (158, 45, 45, 68): 50.0,
    (206, 75, 76, 55): 5.0,
    (188, 66, 67, 55): 2.0,
    (148, 46, 47, 55): 2.0,
    (206, 72, 73, 61): 2.0,
    (207, 73, 73, 61): 2.0,
    (162, 50, 51, 61): 2.0,
    (152, 47, 47, 58): 2.0,
    (153, 48, 49, 56): 2.0,
    (130, 30, 29, 71): 10.0,
    (130, 30, 30, 70): 10.0,
    (163, 52, 53, 58): 5.0,
    (163, 53, 54, 56): 5.0,
    (164, 54, 54, 56): 5.0,
    (196, 70, 70, 56): 2.0,
    (196, 69, 70, 57): 2.0,
    (196, 69, 69, 58): 2.0,
}
MIN_PARTICLE_PX = 6          # drop 1-5 px noise specks
MIN_RASTER_PX = 300          # banner logos are ~175 px
BG_SIGMA = 8.0               # background-subtraction blur sigma (px)
DETECT_K = 3.0               # detection at -k*sigma below local background
SAMPLE_RE = re.compile(r"(\d{2})-?(\d)?[A-Za-z]?\s*(pre-age\s*\d+K\s*)?", re.A)


def sample_name(pdf: str) -> str:
    stem = Path(pdf).stem
    return stem


def get_gray(doc, pno: int, xref: int) -> np.ndarray:
    pix = pymupdf.Pixmap(doc, xref)
    if pix.n > 3:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
    return cv2.cvtColor(arr[:, :, :3], cv2.COLOR_RGB2GRAY)


def page_magnification(text: str) -> float | None:
    m = re.search(r"(\d[\d,]*)\s*X", text)
    return float(m.group(1).replace(",", "")) if m else None


def find_bar(g: np.ndarray):
    """Return (row, x0, x1, dash_lens, text_w) of the scale bar or None.

    The bar lives in the metadata banner at the very bottom: two dashes
    with the value text between them. PDF page labels are unreliable
    (some pages carry a wrong magnification note), so the bar value is
    resolved per image via signature clusters verified by eye.
    """
    h, w = g.shape
    strip = g[max(0, h - 60):, :]
    bright = strip > 100
    off = h - strip.shape[0]
    for r in range(strip.shape[0]):
        row = bright[r]
        runs, start = [], None
        for c in range(w):
            if row[c] and start is None:
                start = c
            elif not row[c] and start is not None:
                runs.append((start, c))
                start = None
        if start is not None:
            runs.append((start, w))
        dashes = [(s, e) for s, e in runs if 15 <= e - s <= 90]
        if len(dashes) == 2:
            (s1, e1), (s2, e2) = dashes
            if (e2 - s1 < 600 and s2 - e1 < 300
                    and 0.6 <= (e1 - s1) / (e2 - s2) <= 1.6):
                return off + r, s1, e2, (e1 - s1, e2 - s2), s2 - e1
    return None


def detect_particles(g: np.ndarray, bar_row: int) -> list[dict]:
    h, w = g.shape
    top = max(0, bar_row - 25)          # keep clear of the banner text
    area = g[:top, :]
    # surround = dark regions connected to the raster border (black grid
    # surround + vignette gradient). Particles never touch the border.
    thr_bg, _ = cv2.threshold(area, 0, 255,
                              cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    dark_bg = (area < thr_bg).astype(np.uint8)
    n_lab, lab = cv2.connectedComponents(dark_bg, 4)
    border_labels = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
    border_labels.discard(0)
    surround = np.isin(lab, list(border_labels))
    valid = ~surround
    # particle detection on local contrast: subtract a blurred background
    # so faint particles pop out uniformly regardless of illumination;
    # threshold at -3 sigma of the residual inside the valid area
    area_f = area.astype(np.float32)
    bg = cv2.GaussianBlur(area_f, (0, 0), BG_SIGMA)
    res = area_f - bg
    sd = float(res[valid].std())
    dark = (res < -DETECT_K * sd) & valid
    # exclude slivers hugging the surround boundary
    grown = cv2.dilate(surround.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    dark &= ~grown
    n, lab, stats, _ = cv2.connectedComponentsWithStats(dark.astype(np.uint8), 8)
    out = []
    for i in range(1, n):
        x, y, bw, bh, a = stats[i]
        if a < MIN_PARTICLE_PX:
            continue
        comp = lab == i
        perim = cv2.arcLength(np.array(np.argwhere(comp), dtype=np.float32)[:, ::-1], True)
        circ = (4 * np.pi * a / perim**2) if perim > 0 else 0.0
        d_px = 2.0 * np.sqrt(a / np.pi)
        # a component spanning a large fraction of the field is a soot
        # deposit/cloud, not an individual particle -> flag it out of the
        # size distribution but keep it in the dataset
        is_deposit = max(bw, bh) > 0.20 * w
        out.append({
            "area_px": int(a),
            "d_px": round(float(d_px), 2),
            "circularity": round(float(min(circ, 1.0)), 3),
            "type": "deposit" if is_deposit else "particle",
            "bbox": (int(x), int(y), int(bw), int(bh)),
        })
    return out


def signature(bar) -> tuple:
    _, _, _, dashes, text_w = bar
    return (int(bar[2] - bar[1]), int(dashes[0]), int(dashes[1]), int(text_w))


def dump_signatures(input_dir: Path, out_dir: Path) -> None:
    """Write one bar-text crop per unique scale-bar signature for visual
    verification: python scripts/same_tem_psd.py --dump"""
    out_dir.mkdir(parents=True, exist_ok=True)
    seen = {}
    for pdf in sorted(input_dir.glob("*.pdf")):
        doc = pymupdf.open(pdf)
        for pno in range(doc.page_count):
            imgs = [x for x in doc[pno].get_images(full=True)
                    if x[2] >= MIN_RASTER_PX]
            for idx, x in enumerate(imgs, 1):
                g = get_gray(doc, pno, x[0])
                bar = find_bar(g)
                if bar is None:
                    print(f"NO-BAR {pdf.name} p{pno + 1} i{idx}")
                    continue
                sig = signature(bar)
                if sig in seen:
                    continue
                seen[sig] = (pdf.name, pno + 1, idx)
                r, s, e = bar[0], bar[1], bar[2]
                crop = g[max(0, r - 20):min(g.shape[0], r + 8),
                         max(0, s - 10):min(g.shape[1], e + 10)]
                fn = out_dir / (f"sig_{sig[0]}_{sig[1]}_{sig[2]}_{sig[3]}.png")
                cv2.imwrite(str(fn), cv2.resize(
                    crop, None, fx=3, fy=3, interpolation=cv2.INTER_NEAREST))
                print(f"{sig} -> {fn.name}  ({pdf.name} p{pno + 1} i{idx})")
        doc.close()
    print(f"\n{len(seen)} unique scale-bar signatures")


def main() -> None:
    if "--dump" in sys.argv:
        dump_signatures(DEFAULT_INPUT, DS / "tem_bar_sigs")
        return
    input_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_INPUT
    rows = []
    spans_by_bar = defaultdict(list)
    images_meta = []

    for pdf in sorted(input_dir.glob("*.pdf")):
        doc = pymupdf.open(pdf)
        sample = sample_name(pdf.name)
        for pno in range(doc.page_count):
            page = doc[pno]
            label_mag = page_magnification(page.get_text())  # PDF note only
            imgs = [x for x in page.get_images(full=True) if x[2] >= MIN_RASTER_PX]
            for idx, x in enumerate(imgs, 1):
                g = get_gray(doc, pno, x[0])
                bar = find_bar(g)
                if bar is None:
                    images_meta.append({"pdf": pdf.name, "page": pno + 1,
                                        "img": idx, "label": label_mag,
                                        "bar": None, "bar_um": None,
                                        "status": "no-bar"})
                    continue
                sig = signature(bar)
                if sig not in BAR_VALUES:
                    images_meta.append({"pdf": pdf.name, "page": pno + 1,
                                        "img": idx, "label": label_mag,
                                        "bar": round(float(bar[2] - bar[1]), 1),
                                        "bar_um": None,
                                        "status": f"unverified sig {sig}"})
                    continue
                bar_um = BAR_VALUES[sig]
                bar_px = float(bar[2] - bar[1])
                px_per_um = bar_px / bar_um
                parts = detect_particles(g, bar[0])
                n_dep = sum(1 for p in parts if p["type"] == "deposit")
                n_par = len(parts) - n_dep
                spans_by_bar[sig].append(bar_px)
                images_meta.append({"pdf": pdf.name, "page": pno + 1,
                                    "img": idx, "label": label_mag,
                                    "bar": round(bar_px, 1), "bar_um": bar_um,
                                    "status": f"{n_par} particles"
                                              f"{', ' + str(n_dep) + ' deposits' if n_dep else ''}"})
                for pid, p in enumerate(parts, 1):
                    rows.append({
                        "sample": sample,
                        "pdf": pdf.name,
                        "page": pno + 1,
                        "image": idx,
                        "particle": pid,
                        "label_mag": int(label_mag) if label_mag else "",
                        "bar_um": bar_um,
                        "bar_px": round(bar_px, 1),
                        "px_per_um": round(px_per_um, 3),
                        "area_px": p["area_px"],
                        "d_px": p["d_px"],
                        "d_um": round(p["d_px"] / px_per_um, 4),
                        "circularity": p["circularity"],
                        "type": p["type"],
                    })
        doc.close()

    df = pd.DataFrame(rows)
    DS.mkdir(parents=True, exist_ok=True)
    df.to_csv(DS / "same_tem_psd.csv", index=False)

    # per-image meta table
    meta = pd.DataFrame(images_meta)
    n_ok = int(meta["bar_um"].notna().sum())

    parts_df = df[df["type"] == "particle"]
    n_dep = int((df["type"] == "deposit").sum())

    # signature cluster stats (px scale consistency within each cluster)
    lines = [
        "# SAME (PSI-101) TEM particle-size analysis",
        "",
        "Scale-bar values are read from each image's burned-in banner",
        "(signature clusters verified visually; PDF page labels were",
        "found unreliable on some pages and are kept only as reference).",
        "",
        f"- TEM images processed: {len(meta)} ({n_ok} with a verified bar)",
        f"- Individual particles measured: **{len(parts_df)}**",
        f"- Large soot deposits/clouds flagged separately: {n_dep}"
        " (excluded from the size distribution)",
        f"- Particle diameter range: {parts_df['d_um'].min():.3f}-"
        f"{parts_df['d_um'].max():.1f} um",
        f"- Median diameter: {parts_df['d_um'].median():.3f} um (approximate,"
        " image-derived)",
        "",
        "Scale-bar signature clusters:",
        "",
        "| bar um | images | span px (median) | spread |",
        "|---|---|---|---|",
    ]
    lines.insert(len(lines) - 5,
                 "Visual verification crops for every signature cluster:"
                 " `datasets/tem_bar_sigs/`.")
    for sig, bar_um in sorted(BAR_VALUES.items(), key=lambda kv: kv[1]):
        s = np.array(spans_by_bar.get(sig, []))
        if len(s) == 0:
            continue
        lines.append(f"| {bar_um} | {len(s)} | {np.median(s):.0f} | "
                     f"{s.min():.0f}-{s.max():.0f} |")
    lines += [
        "",
        "Caveats (honesty): automated blob detection on local contrast",
        f"(background sigma {BG_SIGMA}, threshold {DETECT_K} sigma);",
        "faint particles are detected at their darker cores, so their",
        "diameters skew small; surround-adjacent and border-touching",
        "blobs are excluded; components spanning >20% of the image",
        "width are classed as soot deposits rather than individual",
        "particles; sizes are image-derived approximations, not lab",
        "measurements.",
        "",
        "## Per-image particle counts",
        "",
        "| pdf | page | img | pdf label | bar um | bar px | particles |",
        "|---|---|---|---|---|---|---|",
    ]
    for _, r in meta.iterrows():
        lines.append(f"| {r['pdf']} | {r['page']} | {r['img']} | "
                     f"{'-' if pd.isna(r['label']) else str(int(r['label'])) + 'X'} | "
                     f"{'-' if r['bar_um'] is None or pd.isna(r['bar_um']) else str(r['bar_um'])} | "
                     f"{'-' if r['bar'] is None else str(r['bar'])} | "
                     f"{r['status']} |")
    (DS / "same_tem_psd_summary.md").write_text("\n".join(lines) + "\n",
                                                encoding="utf-8")

    # histogram (individual particles only; deposits are flagged out)
    fig, ax = plt.subplots(figsize=(7.5, 4.4), dpi=150)
    bins = np.logspace(np.log10(max(parts_df["d_um"].min(), 1e-3)),
                       np.log10(parts_df["d_um"].max()), 40)
    ax.hist(parts_df["d_um"], bins=bins, color="#2a9d8f", edgecolor="white")
    ax.set_xscale("log")
    ax.set_xlabel("particle equivalent diameter (um, image-derived approx.)",
                  fontsize=10)
    ax.set_ylabel("particle count", fontsize=10)
    ax.set_title(f"SAME TEM particle sizes ({len(parts_df)} particles, "
                 f"{len(meta)} images, per-image scale-bar calibration)",
                 fontsize=10)
    fig.tight_layout()
    fig.savefig(DS / "same_tem_psd_hist.png")

    print(f"particles: {len(parts_df)} (+{n_dep} deposits) "
          f"from {n_ok}/{len(meta)} images -> same_tem_psd.csv")
    for sig, bar_um in sorted(BAR_VALUES.items(), key=lambda kv: kv[1]):
        s = spans_by_bar.get(sig, [])
        if s:
            print(f"  bar {bar_um} um: {len(s)} img, span {np.median(s):.0f}px")
    print(f"  d_um median {parts_df['d_um'].median():.3f}, "
          f"range {parts_df['d_um'].min():.3f}-{parts_df['d_um'].max():.1f}")


if __name__ == "__main__":
    main()
