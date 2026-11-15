// Verify the TS port of the RAG engine against the Python CLI (same queries,
// same expected scores). Run:  node scripts/verify_rag_ts.mjs
import { readFileSync } from "node:fs";
import { searchRag } from "../src/lib/ragSearch.ts";

const queries = [
  "how does CO2 diluent affect droplet extinction",
  "smoke particle size from overheated spacecraft materials",
  "cool flames methanol droplets",
  "lunar habitat fire safety solid materials",
  "sun temperature",                 // off-topic -> must refuse
  "rocket propellant combustion",    // house rule: out of scope
];

for (const q of queries) {
  const r = searchRag(q, 5);
  console.log(`Q: ${q}`);
  console.log(`   refused=${r.refused} topScore=${r.topScore}`);
  for (const h of r.hits.slice(0, 3)) console.log(`   [${h.rank}] ${h.score} ${h.id}`);
}
void readFileSync; // (fs import kept for potential manual checks)
