/**
 * Deterministic TF-IDF retrieval over the FlameScout RAG index — in-browser port.
 *
 * Mirrors scripts/build_rag_index.py + scripts/rag_retrieve.py exactly:
 *   TfidfVectorizer(sublinear_tf=True, ngram_range=(1,2), stop_words="english")
 *   → tf' = 1 + ln(tf) · idf (smooth), L2-normalized rows, cosine similarity,
 *   refusal when best score < minScore (0.11, calibrated: valid queries
 *   0.124+, off-topic ≈0.088).
 *
 * The model state (vocabulary, IDF, stop-words, chunk texts) lives in
 * ../data/ragIndex.json, exported by scripts/export_rag_ts.py. No generative
 * model anywhere in the data path — same corpus, same scores as the Python CLI.
 */
import bundle from "../data/ragIndex.json" with { type: "json" };

export interface RagChunkMeta {
  experimentId: string;
  sourceId: string;
  title: string;
  evidenceStrength: string;
  chunkType: string;
  fuel: string;
  oxygen: number | null;
  pressure: number | null;
  gravity: string;
}

export interface RagChunk {
  id: string;
  source: string;
  text: string;
  m: RagChunkMeta;
}

export interface RagIndex {
  format: string;
  note: string;
  built: string;
  minScore: number;
  nFeatures: number;
  vocab: string[];
  idf: number[];
  stopWords: string[];
  chunks: RagChunk[];
}

export interface RagHit {
  rank: number;
  score: number;
  id: string;
  source: string;
  title: string;
  text: string;
  meta: RagChunkMeta;
}

export interface RagResult {
  refused: boolean;
  topScore: number;
  hits: RagHit[];
}

/** Typed handle on the JSON bundle (JSON modules import as broad literals). */
const raw = bundle as unknown as RagIndex;

interface SparseVec {
  idx: Uint32Array;
  val: Float64Array;
}

const INDEX: RagIndex = raw;
const TERM_ID = new Map<string, number>(INDEX.vocab.map((t, i) => [t, i]));
const STOP = new Set(INDEX.stopWords);

/* ────────────────── tokenization (matches sklearn defaults) ────────────────── */

/** sklearn token_pattern (?u)\b\w\w+\b on Unicode text = maximal word-character
 *  runs (letters/numbers/underscore, incl. Unicode like "O₂", "µm") of length ≥ 2. */
export function tokenizeRag(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}_]+/gu) ?? []).filter(
    (t) => t.length >= 2 && !STOP.has(t),
  );
}

/** Unigrams + bigrams (space-joined), exactly CountVectorizer's ngram formation. */
function ngrams(tokens: string[]): string[] {
  const out: string[] = tokens.slice();
  for (let i = 0; i + 1 < tokens.length; i++) out.push(tokens[i] + " " + tokens[i + 1]);
  return out;
}

/* ────────────────── vectorization ────────────────── */

/** L2-normalized sparse TF-IDF vector; only terms present in the vocabulary count. */
export function vectorizeRag(text: string): SparseVec {
  const tf = new Map<number, number>();
  for (const g of ngrams(tokenizeRag(text))) {
    const col = TERM_ID.get(g);
    if (col !== undefined) tf.set(col, (tf.get(col) ?? 0) + 1);
  }
  const cols = [...tf.keys()].sort((a, b) => a - b);
  const val = new Float64Array(cols.length);
  let norm = 0;
  for (let j = 0; j < cols.length; j++) {
    const w = (1 + Math.log(tf.get(cols[j])!)) * INDEX.idf[cols[j]];
    val[j] = w;
    norm += w * w;
  }
  norm = Math.sqrt(norm);
  if (norm > 0) for (let j = 0; j < cols.length; j++) val[j] /= norm;
  return { idx: Uint32Array.from(cols), val };
}

/* ────────────────── precomputed corpus vectors ────────────────── */

let docVecs: SparseVec[] | null = null;

function getDocVecs(): SparseVec[] {
  if (!docVecs) docVecs = INDEX.chunks.map((c) => vectorizeRag(c.text));
  return docVecs;
}

/* ────────────────── search ────────────────── */

/**
 * Cosine-similarity retrieval over the indexed chunks; identical contract to
 * scripts/rag_retrieve.py::retrieve().
 */
export function searchRag(query: string, k = 5): RagResult {
  const q = vectorizeRag(query);
  const docs = getDocVecs();

  // dot product of two L2-normalized vectors = cosine similarity
  const scores = new Float64Array(docs.length);
  for (let d = 0; d < docs.length; d++) {
    const dv = docs[d];
    let s = 0;
    let i = 0;
    let j = 0;
    while (i < q.idx.length && j < dv.idx.length) {
      if (q.idx[i] === dv.idx[j]) {
        s += q.val[i] * dv.val[j];
        i++;
        j++;
      } else if (q.idx[i] < dv.idx[j]) i++;
      else j++;
    }
    scores[d] = s;
  }

  const order = Array.from(scores.keys()).sort((a, b) => scores[b] - scores[a]);
  const topScore = order.length > 0 ? scores[order[0]] : 0;
  const refused = order.length === 0 || topScore < INDEX.minScore;
  const hits: RagHit[] = order.slice(0, k).map((d, i) => ({
    rank: i + 1,
    score: Math.round(scores[d] * 10000) / 10000,
    id: INDEX.chunks[d].id,
    source: INDEX.chunks[d].source,
    title: INDEX.chunks[d].m.title,
    text: INDEX.chunks[d].text,
    meta: INDEX.chunks[d].m,
  }));
  return { refused, topScore: Math.round(topScore * 10000) / 10000, hits };
}

/** Ready-to-use index for app code that doesn't want to import the JSON itself. */
export const RAG_INDEX = INDEX;
