# Deterministic retrieval over the FlameScout RAG index.
#
# Refuses queries whose best match is weak ("not enough data") per the
# house rule: never answer outside the tested envelope. This is a CLI demo;
# the web app can import the same helpers.
#
# Usage:
#   python scripts/rag_retrieve.py "how does CO2 diluent affect droplet extinction" [-k 5]
import argparse
import json
import sys
from pathlib import Path

import joblib
import numpy as np
from scipy import sparse
from sklearn.metrics.pairwise import cosine_similarity

HERE = Path(__file__).resolve().parent.parent
DS = HERE / "datasets"
MIN_SCORE = json.load(open(DS / "rag_manifest.json", encoding="utf-8"))["min_score_refusal"]


def load():
    vec = joblib.load(DS / "rag_vectorizer.pkl")
    mat = sparse.load_npz(DS / "rag_index.npz")
    chunks = [json.loads(ln) for ln in
              (DS / "rag_chunks.jsonl").read_text(encoding="utf-8").splitlines() if ln.strip()]
    return vec, mat, chunks


def retrieve(query: str, k: int = 5):
    vec, mat, chunks = load()
    q = vec.transform([query])
    scores = cosine_similarity(q, mat).ravel()
    order = np.argsort(-scores)[:k]
    hits = [{"rank": i + 1, "score": round(float(scores[idx]), 4),
             "id": chunks[idx]["id"], "source": chunks[idx]["source"],
             "snippet": chunks[idx]["text"][:400]}
            for i, idx in enumerate(order)]
    refused = bool(len(scores) == 0 or scores[order[0]] < MIN_SCORE)
    return {"refused": refused, "hits": hits}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("query")
    ap.add_argument("-k", type=int, default=5)
    args = ap.parse_args()
    res = retrieve(args.query, args.k)
    if res["refused"]:
        print("not enough data in the indexed sources to answer this "
              "(best match below refusal threshold %.2f)" % MIN_SCORE)
        sys.exit(0)
    for h in res["hits"]:
        print(f"[{h['rank']}] {h['score']:.3f}  {h['id']}  ({h['source']})")
        snippet = h["snippet"].replace("\n", " ")[:220]
        print("    " + snippet.encode("ascii", "replace").decode("ascii"))
        print()


if __name__ == "__main__":
    main()
