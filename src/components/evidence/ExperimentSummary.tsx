import { experimentById, figuresForExperiment, sourceById } from "../../services/api";
import { StrengthBadge } from "../ui";

export default function ExperimentSummary({ id, citation, onSelect }: { id: string; citation?: number; onSelect?: (id: string) => void }) {
  const e = experimentById(id);
  if (!e) return null;
  const src = sourceById(e.sourceId);
  const figs = figuresForExperiment(e.id);
  const meta: Array<[string, string]> = [
    ["Fuel", e.fuel],
    ["O₂", e.oxygen != null ? `${e.oxygen}%` : "—"],
    ["Pressure", e.pressure != null ? `${e.pressure} kPa` : "—"],
    ["Gravity", e.gravity],
    ["Airflow", e.airflow],
    ["Source", src?.title.split("—")[0].trim() ?? e.sourceId],
  ];
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40" aria-label={`Experiment ${e.id}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-slate-400">
            {e.id}
            {citation != null && <span className="ml-1.5 rounded bg-teal-700 px-1 py-px font-mono text-[10px] font-bold text-white dark:bg-teal-600">[{citation}]</span>}
            {figs.length > 0 ? (
              <span className="ml-1.5 rounded border border-teal-600/30 bg-teal-600/10 px-1 py-px font-mono text-[10px] font-semibold text-teal-700 dark:text-teal-300" title={`${figs.length} demo figure${figs.length === 1 ? "" : "s"} available in the evidence workspace`}>
                FIGURE AVAILABLE{figs.length > 1 ? ` ×${figs.length}` : ""}
              </span>
            ) : (
              <span className="ml-1.5 rounded border border-slate-300/60 px-1 py-px font-mono text-[10px] text-slate-400 dark:border-slate-700" title="No demo figure attached to this experiment">
                NO FIGURE
              </span>
            )}
            <span className="ml-1.5">demo</span>
          </p>
          <h4 className="mt-0.5 truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100" title={e.title}>{e.title}</h4>
        </div>
        <StrengthBadge strength={e.evidenceStrength} />
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[12px] sm:grid-cols-3">
        {meta.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-400">{k}</dt>
            <dd className="truncate font-medium text-slate-700 dark:text-slate-200" title={String(v)}>{v}</dd>
          </div>
        ))}
      </dl>
      {e.outcome && <p className="mt-2 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">{e.outcome}</p>}
      {onSelect && (
        <button onClick={() => onSelect(e.id)} className="mt-2 text-[12px] font-medium text-teal-700 hover:underline dark:text-teal-300">
          View in evidence panel →
        </button>
      )}
    </article>
  );
}
