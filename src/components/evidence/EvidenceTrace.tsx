import { ArrowDown, ShieldCheck, X } from "lucide-react";
import { useEffect } from "react";
import { useApp } from "../../context/AppContext";

export default function EvidenceTrace() {
  const { activeTrace, setActiveTrace } = useApp();
  useEffect(() => {
    if (!activeTrace) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveTrace(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTrace, setActiveTrace]);
  if (!activeTrace) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Evidence trace" onClick={() => setActiveTrace(null)}>
      <div
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">Evidence trace</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Why this answer can be trusted</h3>
          </div>
          <button onClick={() => setActiveTrace(null)} className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-100" aria-label="Close evidence trace">
            <X size={16} />
          </button>
        </div>
        <ol className="mt-4 space-y-1">
          {activeTrace.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600/10 font-mono text-[11px] font-bold text-teal-700 dark:text-teal-300">{i + 1}</span>
                {i < activeTrace.steps.length - 1 && <ArrowDown size={12} className="my-1 text-slate-300" aria-hidden />}
              </div>
              <div className="pb-3">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{s.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-[12px] font-medium text-emerald-700 dark:text-emerald-300">
          <ShieldCheck size={14} /> {activeTrace.verifiedClaims}/{activeTrace.totalClaims} claims traced to sources · wording avoids safe/unsafe
        </p>
        <p className="mt-2 font-mono text-[11px] text-slate-400">Classification: {activeTrace.classification}</p>
      </div>
    </div>
  );
}
