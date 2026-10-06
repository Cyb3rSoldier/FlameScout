import { Link } from "react-router-dom";
import { SUGGESTED_QUESTIONS } from "../../data/conversations";
import { FreefallVisualization } from "../flame/FreefallVisualization";

export default function EmptyStateHero({ onSuggest }: { onSuggest: (q: string) => void }) {
  return (
    <div className="px-2 py-6 sm:py-8">
      <div className="flex flex-col items-center text-center">
        <FreefallVisualization compact magnetic />
        <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
          Microgravity combustion research
        </p>
        <h1 className="mt-2 max-w-xl text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
          Explore the evidence behind flame behavior in microgravity.
        </h1>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
          Search experiments, compare conditions, and understand where evidence is strong — or still limited.
        </p>
      </div>
      <div className="mx-auto mt-5 grid w-full max-w-2xl gap-2 sm:grid-cols-2" aria-label="Example research questions">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSuggest(q)}
            className="group rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left transition-colors hover:border-teal-600/50 dark:border-slate-700 dark:bg-slate-900"
          >
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">Research shortcut</span>
            <span className="mt-0.5 block text-[13px] font-medium leading-snug text-slate-700 group-hover:text-teal-800 dark:text-slate-200 dark:group-hover:text-teal-200">
              {q}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-[11px] text-slate-400">
        Question → Retrieval → Evidence → Answer → Citations → Gaps · <Link to="/coverage" className="underline underline-offset-2">open the Coverage Map</Link>
      </p>
    </div>
  );
}

export function InsufficientEvidence({
  missing,
  available,
  onCoverage,
}: {
  missing: string[];
  available?: string;
  onCoverage: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-amber-600/30 bg-white dark:bg-slate-900" role="alert">
      <div className="border-b border-amber-600/20 px-4 py-2.5 sm:px-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">Not enough evidence</p>
      </div>
      <div className="px-4 py-3.5 sm:px-5">
        <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
          We found related experiments, but the available evidence does not support a confident conclusion for this condition.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-100/80 p-3 dark:bg-slate-800/60">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">Evidence available</p>
            <p className="mt-1 text-[13px] font-medium text-slate-700 dark:text-slate-200">{available ?? "Related demo experiments"}</p>
          </div>
          <div className="rounded-lg bg-slate-100/80 p-3 dark:bg-slate-800/60">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">Evidence missing</p>
            <ul className="mt-1 space-y-0.5 text-[13px] text-slate-600 dark:text-slate-300">
              {missing.map((m) => <li key={m}>· {m}</li>)}
            </ul>
          </div>
        </div>
        <button onClick={onCoverage} data-magnetic className="mt-3 rounded-lg bg-teal-700 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-teal-600">
          Explore coverage gap
        </button>
      </div>
    </div>
  );
}
