import { FlaskConical } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { experimentById, sourceById } from "../../services/api";
import { OXYGEN_CHART } from "../../data/coverage";
import EvidenceChart from "./EvidenceChart";
import FigureCard from "./FigureCard";
import SourceCard from "./SourceCard";
import { Card, SectionTitle, StrengthBadge } from "../ui";

export default function EvidencePanel() {
  const { messages, evidenceExperimentIds, loading } = useApp();
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const ids = evidenceExperimentIds.length > 0 ? evidenceExperimentIds : (lastAssistant?.experimentIds ?? []);
  const strength = lastAssistant?.strength;
  const citations = lastAssistant?.citations ?? [];

  if (loading && !lastAssistant) {
    return (
      <div className="space-y-3 p-4">
        <SectionTitle sub="Waiting for retrieval…">Evidence</SectionTitle>
        <Card className="animate-pulse p-4 text-xs text-slate-400">Retrieving supporting experiments…</Card>
      </div>
    );
  }

  if (!lastAssistant || ids.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <div>
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">Evidence</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Supporting research for your current query</p>
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Evidence will appear here</p>
          <p className="mx-auto mt-1 max-w-[26ch] text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Ask a research question to see supporting experiments, sources, figures and trace.
          </p>
        </div>
        <div>
          <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Dataset snapshot</h3>
          <Card className="mt-1.5 p-3">
            <ul className="space-y-1 text-[12px] text-slate-500 dark:text-slate-400">
              {OXYGEN_CHART.map((r) => (
                <li key={r.band} className="flex justify-between"><span>O₂ {r.band}</span><span className="font-mono">{r.experiments} runs</span></li>
              ))}
            </ul>
            <p className="mt-2 border-t border-slate-100 pt-2 font-mono text-[10px] text-slate-400 dark:border-slate-800">14 demo experiments · 8 demo sources · mock only</p>
          </Card>
        </div>
      </div>
    );
  }

  const exps = ids.map(experimentById).filter(Boolean);
  const uniqueSources = [...new Set(exps.map((e) => e!.sourceId))];

  return (
    <div className="space-y-4 p-4" aria-label="Evidence panel">
      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">Evidence</h2>
          {strength && <StrengthBadge strength={strength} />}
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{exps.length} supporting experiments · {uniqueSources.length} sources</p>
      </div>

      <section aria-label="Experiment conditions" className="space-y-2">
        <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500"><span className="font-mono text-teal-700 dark:text-teal-300">01</span><FlaskConical size={12} /> Experiment conditions</h3>
        {exps.map((e) => (
          <div key={e!.id} className="rounded-lg border border-slate-200 p-2.5 text-[12px] dark:border-slate-800">
            <p className="font-semibold text-slate-700 dark:text-slate-200">{e!.id} · {e!.title}</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {e!.fuel} · {e!.oxygen ?? "—"}% O₂ · {e!.pressure ?? "—"} kPa · {e!.gravity} · {e!.airflow}
            </p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Source: {sourceById(e!.sourceId)?.title}</p>
          </div>
        ))}
      </section>

      <EvidenceChart />

      <section aria-label="Sources" className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500"><span className="mr-1.5 font-mono text-teal-700 dark:text-teal-300">02</span>Sources · click a citation to inspect</h3>
        {citations.map((c) => (
          <SourceCard key={c.sourceId} sourceId={c.sourceId} citation={c.n} />
        ))}
        {citations.length === 0 && uniqueSources.map((id) => <SourceCard key={id} sourceId={id} />)}
      </section>

      <section aria-label="Original figures" className="space-y-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500"><span className="mr-1.5 font-mono text-teal-700 dark:text-teal-300">03</span>Original figures</h3>
        {(lastAssistant.figureIds ?? ["FIG-01"]).map((id) => (
          <FigureCard key={id} id={id} />
        ))}
      </section>
    </div>
  );
}
