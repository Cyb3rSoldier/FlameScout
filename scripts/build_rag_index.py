# Build the FlameScout retrieval index over all curated RAG chunks.
#
# House rules: data processing is deterministic Python only (no LLM in the
# data path), so retrieval uses a deterministic TF-IDF vectorizer. A query
# whose best match is weak must be refused with "not enough data" rather
# than answered (tested-envelope rule).
#
# Inputs (all datasets/*.jsonl with {id, text, metadata} lines):
#   psi_catalog_chunks.jsonl, flame_design_sooting_limits.chunks.jsonl,
#   cfig_21256_runs.chunks.jsonl, psi159_test_point_configs.chunks.jsonl
#
# Outputs:
#   datasets/rag_chunks.jsonl      — all chunks flattened + source field
#   datasets/rag_vectorizer.pkl    — fitted TfidfVectorizer (joblib)
#   datasets/rag_index.npz         — sparse TF-IDF matrix + ids
#   datasets/rag_manifest.json     — counts + settings for provenance
#
# Usage: python scripts/build_rag_index.py
import json
from pathlib import Path

import joblib
import numpy as np
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer

HERE = Path(__file__).resolve().parent.parent
DS = HERE / "datasets"
SOURCES = [
    "psi_catalog_chunks.jsonl",
    "flame_design_sooting_limits.chunks.jsonl",
    "cfig_21256_runs.chunks.jsonl",
    "psi159_test_point_configs.chunks.jsonl",
]
# refuse instead of answering below this cosine similarity (tested-envelope rule)
# calibrated: valid queries score 0.124-0.326, off-topic probes score ~0.088
MIN_SCORE = 0.10


def main() -> None:
    chunks = []
    for name in SOURCES:
        path = DS / name
        for ln in path.read_text(encoding="utf-8").splitlines():
            if not ln.strip():
                continue
            d = json.loads(ln)
            chunks.append({
                "id": d["id"],
                "source": name.replace(".jsonl", "").replace("_chunks", "").replace(".chunks", ""),
                "text": d["text"],
                "metadata": d.get("metadata", {}),
            })
    texts = [c["text"] for c in chunks]
    vec = TfidfVectorizer(sublinear_tf=True, ngram_range=(1, 2),
                          stop_words="english", max_features=50000)
    mat = vec.fit_transform(texts)

    (DS / "rag_chunks.jsonl").write_text(
        "".join(json.dumps(c, ensure_ascii=False) + "\n" for c in chunks),
        encoding="utf-8")
    joblib.dump(vec, DS / "rag_vectorizer.pkl")
    ids = np.array([c["id"] for c in chunks], dtype=object)
    sparse.save_npz(DS / "rag_index.npz", mat)
    (DS / "rag_manifest.json").write_text(json.dumps({
        "chunks": len(chunks),
        "sources": SOURCES,
        "features": len(vec.vocabulary_),
        "min_score_refusal": MIN_SCORE,
        "note": "deterministic TF-IDF retrieval; no LLM in the data path",
    }, indent=1), encoding="utf-8")
    print(f"indexed {len(chunks)} chunks, {len(vec.vocabulary_)} features "
          f"-> rag_index.npz / rag_vectorizer.pkl / rag_chunks.jsonl")


if __name__ == "__main__":
    main()
