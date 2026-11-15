# Export the trained RAG TF-IDF model to a JSON bundle the web app can load.
#
# The web app has no Python runtime, so we ship the exact vectorizer state
# (vocabulary, IDF weights, sklearn's English stop-word list) plus the chunk
# texts. The browser recomputes TF-IDF vectors with the identical math
# (sublinear_tf, ngram 1-2, l2 norm) in src/lib/ragSearch.ts — same corpus,
# same scores, same 0.10 refusal threshold. Still deterministic, still
# no LLM anywhere in the data path.
#
# Output: src/data/ragIndex.json
# Usage:  python scripts/export_rag_ts.py
import json
import sys
from pathlib import Path

import joblib

HERE = Path(__file__).resolve().parent.parent
DS = HERE / "datasets"
OUT = HERE / "src" / "data" / "ragIndex.json"


def main() -> None:
    from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

    vec = joblib.load(DS / "rag_vectorizer.pkl")
    chunks = [
        json.loads(ln)
        for ln in (DS / "rag_chunks.jsonl").read_text(encoding="utf-8").splitlines()
        if ln.strip()
    ]
    manifest = json.loads((DS / "rag_manifest.json").read_text(encoding="utf-8"))

    vocab = list(vec.vocabulary_)  # unordered; we re-sort by feature index
    order = [0] * len(vocab)
    for term, idx in vec.vocabulary_.items():
        order[idx] = term

    idf = [float(x) for x in vec.idf_]  # full precision — JSON repr round-trips exactly

    rows = []
    for c in chunks:
        m = c.get("metadata", {})
        rows.append({
            "id": c["id"],
            "source": c["source"],
            "text": c["text"],
            "m": {
                "experimentId": m.get("experimentId", ""),
                "sourceId": m.get("sourceId", ""),
                "title": m.get("title", ""),
                "evidenceStrength": m.get("evidenceStrength", "Limited"),
                "chunkType": m.get("chunkType", ""),
                "fuel": m.get("fuel", ""),
                "oxygen": m.get("oxygen"),
                "pressure": m.get("pressure"),
                "gravity": m.get("gravity", ""),
            },
        })

    bundle = {
        "format": "flamescout-rag-1",
        "note": manifest.get("note", ""),
        "built": manifest.get("built", ""),
        "minScore": manifest["min_score_refusal"],
        "nFeatures": len(order),
        "vocab": order,
        "idf": idf,
        "stopWords": sorted(ENGLISH_STOP_WORDS),
        "chunks": rows,
    }
    OUT.write_text(json.dumps(bundle, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("chunks: %d | features: %d | bytes: %d -> %s" % (
        len(rows), len(order), OUT.stat().st_size, OUT.relative_to(HERE)))
    # sanity: features must agree with the manifest
    if len(order) != manifest["features"]:
        print("WARNING: feature count mismatch vs manifest", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
