import { ArrowDown, Database, FileSearch, ListChecks, MessagesSquare, SearchCheck } from "lucide-react";
import { Card } from "../components/ui";

const PHASES = [
  {
    name: "Collect",
    steps: [
      { t: "Sources", d: "Reports, datasets and figure sets — demo placeholders in this build." },
      { t: "Parse", d: "Text → chunks · tables → rows · figures → image + caption + context." },
      { t: "Normalize", d: "One schema: id, source, page, fuel, O₂, pressure, gravity, airflow, outcome. Missing values flagged, never guessed." },
    ],
  },
  {
    name: "Find",
    steps: [
      { t: "Index", d: "Vector store for text/captions; structured table for exact numeric queries." },
      { t: "Route", d: "Classifier picks one of five query paths below." },
      { t: "Retrieve", d: "Hybrid keyword + vector + rerank, or SQL for numeric questions." },
    ],
  },
  {
    name: "Trust",
    steps: [
      { t: "Answer", d: "Cited answer written only from retrieved evidence." },
      { t: "Verify", d: "Every claim and number traced to a source; weak evidence → refusal." },
      { t: "Cite", d: "Answer rendered with source cards, tables, charts and figures." },
    ],
  },
];

const PATHS = [
  { icon: MessagesSquare, name: "Explain", use: "Why / how questions", method: "Hybrid search + reranker" },
  { icon: Database, name: "Numeric / Compare", use: "Counts, filters, comparisons", method: "SQL on the structured table" },
  { icon: FileSearch, name: "Show Figure", use: "Visual requests", method: "Figure retrieval" },
  { icon: SearchCheck, name: "Scenario", use: "Given conditions", method: "Condition-matched experiments (retrieval, not prediction)" },
  { icon: ListChecks, name: "Knowledge Gap", use: "What is not covered", method: "Coverage analysis of the table" },
];

export default function MethodologyPage() {
  return (
    <div className="animate-view-enter mx-auto w-full max-w-4xl space-y-5 px-3 py-5 sm:px-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Trust by design</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Methodology</h1>
        <p className="mt-1 max-w-2xl text-[14px] text-slate-500 dark:text-slate-400">How FlameScout turns scattered combustion records into cited, verifiable answers — and says “not enough data” when evidence is thin.</p>
      </header>

      <Card className="p-4 sm:p-5">
        <h2 className="text-sm font-semibold">Evidence pipeline <span className="font-mono text-[11px] font-normal text-slate-400">source → normalize → index → retrieve → verify → cite</span></h2>
        <div className="mt-4 space-y-5">
          {PHASES.map((phase, pi) => (
            <div key={phase.name}>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
                Phase {pi + 1} · {phase.name}
              </p>
              <ol className="mt-2 space-y-0.5">
                {phase.steps.map((s, i) => {
                  const n = pi * 3 + i + 1;
                  const last = pi === PHASES.length - 1 && i === phase.steps.length - 1;
                  return (
                    <li key={s.t} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600/10 font-mono text-[11px] font-bold text-teal-700 dark:text-teal-300">{n}</span>
                        {!last && <ArrowDown size={12} className="my-1 text-slate-300" aria-hidden />}
                      </div>
                      <div className="pb-2.5">
                        <p className="text-[13px] font-semibold">{s.t}</p>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400">{s.d}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <h2 className="text-sm font-semibold">How to read an evidence trace <span className="font-mono text-[11px] font-normal text-slate-400">“View evidence trace” on any answer</span></h2>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
          Every answer carries a step-by-step receipt: the original question, how the router classified it,
          which demo experiments were retrieved, the exact claims checked against sources, and the final
          evidence-strength label. If the trace shows thin retrieval, the answer says “not enough data”
          instead of guessing.
        </p>
      </Card>

      <section aria-label="Query paths">
        <h2 className="text-base font-bold">Five query paths</h2>
        <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
          {PATHS.map((p) => (
            <Card key={p.name} className="p-4">
              <p.icon size={18} className="text-teal-700 dark:text-teal-300" aria-hidden />
              <p className="mt-2 text-[14px] font-semibold">{p.name}</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">{p.use}</p>
              <p className="mt-1.5 rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{p.method}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="border-amber-600/30 bg-amber-500/5 p-4">
        <h2 className="text-sm font-semibold">Scientific honesty rules (enforced in UI copy)</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-slate-600 dark:text-slate-300">
          <li>Use “supported by available evidence”, “limited evidence”, “not enough data”, “not covered”.</li>
          <li>Never claim a condition is safe/unsafe or that “NASA proved X”.</li>
          <li>Scenario mode retrieves matching experiments — it does not predict outcomes.</li>
          <li>Demo sources are placeholders; wire to FastAPI + verified corpora before any real use.</li>
        </ul>
      </Card>
    </div>
  );
}
