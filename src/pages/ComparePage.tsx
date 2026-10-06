import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ExperimentSummary from "../components/evidence/ExperimentSummary";
import FigureCard from "../components/evidence/FigureCard";
import SourceCard from "../components/evidence/SourceCard";
import { Card, EmptyState, LoadingSkeleton } from "../components/ui";
import { getExperiments } from "../services/api";
import type { Experiment } from "../types";
import { cn } from "../lib/utils";

const ROWS = ["fuel", "oxygen", "pressure", "gravity", "airflow", "outcome"] as const;

export default function ComparePage() {
  const [all, setAll] = useState<Experiment[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>(["EXP-001", "EXP-003", "EXP-005"]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(0, 4)));

  useEffect(() => {
    getExperiments().then(setAll).catch(() => setLoadError("Could not load the experiment list. Retry."));
  }, []);

  const exps = useMemo(() => (all ?? []).filter((e) => selected.includes(e.id)), [all, selected]);
  const differs = (k: (typeof ROWS)[number]) => new Set(exps.map((e) => String(e[k] ?? ""))).size > 1;

  const chartData = exps.map((e) => ({
    name: e.id,
    oxygen: e.oxygen ?? 0,
    pressure: e.pressure ?? 0,
  }));

  return (
    <div className="animate-view-enter mx-auto w-full max-w-6xl space-y-5 px-3 py-5 sm:px-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Side-by-side · differences highlighted</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Compare Experiments</h1>
        <p className="mt-1 text-[14px] text-slate-500 dark:text-slate-400">Select up to 4 demo experiments. Differences are highlighted; no safety inference is made.</p>
      </header>

      <Card className="p-4">
        <h2 className="text-sm font-semibold">Select experiments ({selected.length}/4)</h2>
        {!all && !loadError && <div className="mt-3"><LoadingSkeleton lines={2} /></div>}
        {loadError && <p className="mt-2 text-[13px] text-red-600 dark:text-red-400" role="alert">{loadError}</p>}
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Experiment selection">
          {(all ?? []).map((e) => (
            <button
              key={e.id}
              onClick={() => toggle(e.id)}
              aria-pressed={selected.includes(e.id)}
              className={cn("rounded-lg border px-2.5 py-1.5 font-mono text-[12px] transition-colors",
                selected.includes(e.id) ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 text-slate-600 hover:border-teal-600/40 dark:border-slate-700 dark:text-slate-300")}
            >
              {e.id}
            </button>
          ))}
        </div>
      </Card>

      {!all && !loadError ? (
        <Card className="p-4"><LoadingSkeleton lines={5} /></Card>
      ) : exps.length < 2 ? (
        <EmptyState title="Select at least two experiments" body="Comparison needs 2–4 experiments to highlight differences." />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Experiment comparison table, scroll horizontally on small screens">
              <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="sticky left-0 bg-white px-4 py-2.5 font-mono text-[11px] text-slate-400 dark:bg-slate-900 dark:text-slate-500">Attribute</th>
                    {exps.map((e) => <th key={e.id} className="px-4 py-2.5 font-mono text-[12px] text-teal-700 dark:text-teal-300">{e.id}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <td className="sticky left-0 bg-white px-4 py-2 font-medium text-slate-400 dark:bg-slate-900 dark:text-slate-500">Experiment</td>
                    {exps.map((e) => <td key={e.id} className="px-4 py-2 font-medium">{e.title}</td>)}
                  </tr>
                  {ROWS.map((k) => (
                    <tr key={k} className={cn("border-b border-slate-100 dark:border-slate-800", differs(k) && "bg-amber-500/[0.06]")}>
                      <td className={cn("sticky left-0 bg-white px-4 py-2 font-medium capitalize text-slate-400 dark:bg-slate-900 dark:text-slate-500", differs(k) && "bg-amber-50 dark:bg-amber-950/30")}>{k}{differs(k) && <span className="ml-1.5 rounded bg-amber-500/15 px-1 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">differs</span>}</td>
                      {exps.map((e) => (
                        <td key={e.id} className="px-4 py-2 text-slate-700 dark:text-slate-200">
                          {k === "oxygen" ? `${e.oxygen ?? "—"}%` : k === "pressure" ? `${e.pressure ?? "—"} kPa` : String(e[k] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="sticky left-0 bg-white px-4 py-2 font-medium text-slate-400 dark:bg-slate-900 dark:text-slate-500">Evidence strength</td>
                    {exps.map((e) => <td key={e.id} className="px-4 py-2">{e.evidenceStrength}</td>)}
                  </tr>
                  <tr>
                    <td className="sticky left-0 bg-white px-4 py-2 font-medium text-slate-400 dark:bg-slate-900 dark:text-slate-500">Source</td>
                    {exps.map((e) => <td key={e.id} className="px-4 py-2 font-mono text-[12px]">{e.sourceId}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid gap-3 lg:grid-cols-2">
            <Card className="p-4">
              <h2 className="text-sm font-semibold">Oxygen vs pressure <span className="font-mono text-[11px] font-normal text-slate-400">(demo values)</span></h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">One bar pair per selected experiment — raw condition values, not outcomes.</p>
              <div className="mt-2 h-56 text-slate-500 dark:text-slate-400" role="img" aria-label="Comparison chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.25} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "currentColor" }} tickLine={false} axisLine={{ stroke: "currentColor", opacity: 0.3 }} />
                    <YAxis tick={{ fontSize: 11, fill: "currentColor" }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="oxygen" fill="#0f766e" name="O₂ %" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="pressure" fill="#f59e0b" name="kPa" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <div className="space-y-2">
              {exps.slice(0, 2).map((e) => <SourceCard key={e.sourceId + e.id} sourceId={e.sourceId} compact />)}
              <div className="grid gap-2 sm:grid-cols-2">
                <FigureCard id="FIG-01" />
                <FigureCard id="FIG-02" />
              </div>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            {exps.map((e) => <ExperimentSummary key={e.id} id={e.id} />)}
          </div>
        </>
      )}
    </div>
  );
}
