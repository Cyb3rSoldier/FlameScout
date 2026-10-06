import { ArrowRight, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EvidenceChart from "../components/evidence/EvidenceChart";
import ExperimentSummary from "../components/evidence/ExperimentSummary";
import SourceCard from "../components/evidence/SourceCard";
import { Card, EmptyState, LoadingSkeleton, StrengthBadge } from "../components/ui";
import { OXYGEN_BANDS, PRESSURE_BANDS } from "../data/coverage";
import { getCoverage } from "../services/api";
import { experimentById } from "../services/api";
import type { CoverageCell, KnowledgeGap } from "../types";
import { cn } from "../lib/utils";

const STATUS_STYLE: Record<string, string> = {
  tested: "bg-emerald-500/80 text-white hover:bg-emerald-500",
  limited: "bg-amber-400/90 text-amber-950 hover:bg-amber-400",
  "not-covered": "bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
};

export default function CoveragePage() {
  const [cells, setCells] = useState<CoverageCell[] | null>(null);
  const [gaps, setGaps] = useState<KnowledgeGap[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CoverageCell | null>(null);
  const [fuelFilter, setFuelFilter] = useState("All");

  useEffect(() => {
    getCoverage().then((r) => { setCells(r.cells); setGaps(r.gaps); }).catch(() => setError("Coverage service failed (demo). Retry."));
  }, []);

  const filtered = useMemo(() => {
    if (!cells) return [];
    if (fuelFilter === "All") return cells;
    return cells.map((c) => {
      const ids = c.experimentIds.filter((id) => experimentById(id)?.fuel.startsWith(fuelFilter));
      return { ...c, experimentCount: ids.length, experimentIds: ids, status: ids.length === 0 ? ("not-covered" as const) : c.status };
    });
  }, [cells, fuelFilter]);

  return (
    <div className="animate-view-enter mx-auto w-full max-w-5xl space-y-5 px-3 py-5 sm:px-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Differentiator · evidence coverage analysis</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Knowledge Coverage</h1>
        <p className="mt-1 max-w-2xl text-[14px] text-slate-500 dark:text-slate-400">Explore which combustion conditions have been studied and where evidence is limited.</p>
      </header>

      {error && <Card className="border-red-300 p-4 text-sm text-red-600">{error}</Card>}
      {!cells && !error && <LoadingSkeleton lines={6} />}
      {!cells && error && <EmptyState title="No coverage data" body="The coverage service is unavailable." />}

      {cells && (
        <>
          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Pressure × Oxygen heatmap <span className="font-mono text-[11px] font-normal text-slate-400">(demo)</span></h2>
              <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                Fuel
                <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900" aria-label="Coverage fuel filter">
                  {["All", "Cellulose", "PMMA", "Polyethylene", "Cotton"].map((f) => <option key={f}>{f}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400" aria-label="Legend">
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500/80" /> Tested</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-400/90" /> Limited evidence</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-slate-300 dark:bg-slate-700" /> Not covered</span>
            </div>
            <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Coverage heatmap, scroll horizontally on small screens">
              <table className="w-full min-w-[560px] border-separate" style={{ borderSpacing: 4 }} role="grid" aria-label="Coverage heatmap">
                <thead>
                  <tr>
                    <th className="w-28 text-left font-mono text-[11px] text-slate-400">kPa ↓ · O₂ →</th>
                    {OXYGEN_BANDS.map((o) => <th key={o} className="font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">{o}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PRESSURE_BANDS.map((p) => (
                    <tr key={p}>
                      <th className="text-left font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">{p}</th>
                      {OXYGEN_BANDS.map((o) => {
                        const cell = filtered.find((c) => c.pressureBand === p && c.oxygenBand === o)!;
                        const isSelected = selected?.pressureBand === p && selected?.oxygenBand === o;
                        return (
                          <td key={o}>
                            <button
                              onClick={() => setSelected(cell)}
                              aria-pressed={isSelected}
                              title={`${p} · ${o}: ${cell.status === "tested" ? "tested" : cell.status === "limited" ? "limited evidence" : "not covered"} — ${cell.experimentCount} experiment${cell.experimentCount === 1 ? "" : "s"}. Select for details.`}
                              className={cn("flex h-12 w-full flex-col items-center justify-center rounded-lg text-[11px] font-semibold transition-colors focus-visible:outline-2", STATUS_STYLE[cell.status], isSelected && "ring-2 ring-teal-700 ring-offset-1 dark:ring-teal-300 dark:ring-offset-slate-900")}
                              aria-label={`${p}, ${o}: ${cell.status}, ${cell.experimentCount} experiments`}
                            >
                              <span>{cell.status === "not-covered" ? "—" : cell.experimentCount}</span>
                              <span className="text-[9px] font-normal opacity-80">{cell.status === "tested" ? "tested" : cell.status === "limited" ? "limited" : "no data"}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {selected && (
            <Card className="border-teal-600/30 p-4" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Cell: {selected.pressureBand} · {selected.oxygenBand}</h2>
                <StrengthBadge strength={selected.status === "tested" ? "Strong" : selected.status === "limited" ? "Limited" : "Insufficient"} />
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div className="text-[13px] text-slate-600 dark:text-slate-300">
                  <p><span className="text-slate-400">Experiments:</span> <strong>{selected.experimentCount}</strong></p>
                  <p className="mt-1"><span className="text-slate-400">Missing variables:</span> {selected.missingVariables.join(", ") || "—"}</p>
                  <p className="mt-1 text-[12px] text-slate-400">Available evidence only — no extrapolation.</p>
                </div>
                <div className="space-y-2">
                  {selected.experimentIds.map((id) => <ExperimentSummary key={id} id={id} />)}
                  {selected.experimentIds.length === 0 && <p className="text-[13px] text-slate-400">No demo experiments in this cell — evidence gap.</p>}
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-3 lg:grid-cols-2">
            <EvidenceChart />
            <Card className="p-4">
              <h2 className="text-sm font-semibold">How to read this map</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-slate-500 dark:text-slate-400">
                <li>Rows = pressure bands, columns = oxygen bands (demo binning).</li>
                <li>“Limited” means 1–2 demo runs — describe, don’t conclude.</li>
                <li>“Not covered” means zero runs — a gap, not a prediction.</li>
              </ul>
            </Card>
          </div>

          <section aria-label="Priority knowledge gaps">
            <div className="flex items-center gap-2">
              <TriangleAlert size={16} className="text-amber-600" />
              <h2 className="text-base font-bold">Priority Knowledge Gaps</h2>
            </div>
            <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">Ranked by coverage sparsity in the demo set — evidence analysis, not prediction.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {gaps?.map((g, i) => (
                <Card key={g.id} className="border-l-4 border-l-orange-400/80 p-4 dark:border-l-orange-500/70">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-orange-700/80 dark:text-orange-300/80">{g.id} · gap #{i + 1}</p>
                      <p className="mt-0.5 text-[14px] font-semibold">{g.name}</p>
                    </div>
                    <span className="rounded-md bg-orange-500/10 px-2 py-0.5 font-mono text-[12px] font-bold text-orange-700 dark:text-orange-300" title="Priority score — coverage sparsity, not a prediction" aria-label={`priority ${g.priority}`}>{g.priority}</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-slate-400">{g.conditions}</p>
                  <p className="mt-2 text-[12px] text-slate-500 dark:text-slate-400">Available experiments: <strong className="text-slate-700 dark:text-slate-200">{g.availableExperiments}</strong></p>
                  <p className="mt-1 text-[12px] text-slate-500 dark:text-slate-400">Missing: {g.missingEvidence.join(" · ")}</p>
                  <Link to="/assistant" className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-teal-700 hover:underline dark:text-teal-300">
                    Explore experiments <ArrowRight size={13} />
                  </Link>
                </Card>
              ))}
            </div>
          </section>

          <Card className="p-4">
            <h2 className="text-sm font-semibold">Related sources</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <SourceCard sourceId="SRC-02" citation={2} compact />
              <SourceCard sourceId="SRC-07" citation={7} compact />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
