import { useEffect, useState } from "react";
import { CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Badge, Card, EmptyState, LoadingSkeleton, SectionTitle } from "../components/ui";
import { INPUT_LIMITS, TARGET_KEYS, TARGET_META } from "../lib/flexModel";
import { cn } from "../lib/utils";
import { predictFlex } from "../services/api";
import type { PredictionInput, PredictionResult, PredictionTarget, RangeStatus, TargetPrediction } from "../types";

const DEFAULTS: PredictionInput = { fuel: "methanol", pressureKpa: 101, o2: 21, co2: 0, he: 0, dropletMm: 2 };

const STATUS: Record<RangeStatus, { label: string; tone: string }> = {
  inside: { label: "Inside the tested range", tone: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  sparse: { label: "Few close tests", tone: "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  outside: { label: "Outside the tested range", tone: "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300" },
};

const fmt = (v: number | null, digits: number) => (v === null ? "—" : v.toFixed(digits));

function Control({ id, label, unit, value, min, max, step, limits, onChange }: {
  id: string; label: string; unit: string; value: number; min: number; max: number; step: number;
  limits: { min: number; max: number }; onChange: (v: number) => void;
}) {
  const out = value < limits.min || value > limits.max;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{label}</label>
        <span className={cn("font-mono text-[13px] tabular-nums", out ? "text-amber-700 dark:text-amber-300" : "text-slate-900 dark:text-white")}>{value}{unit}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-1.5 w-full cursor-pointer accent-teal-700 dark:accent-teal-400" />
      <p className="mt-0.5 font-mono text-[10px] text-slate-400">tested {limits.min}–{limits.max}{unit}{out && " · outside"}</p>
    </div>
  );
}

function ValueRow({ p }: { p: TargetPrediction }) {
  const [lo, hi] = p.dataRange;
  const pos = (x: number) => `${Math.min(100, Math.max(0, ((x - lo) / (hi - lo)) * 100))}%`;
  return (
    <div className="grid items-center gap-x-6 gap-y-2 px-4 py-3.5 sm:grid-cols-[150px_150px_minmax(0,1fr)]">
      <div>
        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{p.label}</p>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Unseen test days: R² {p.heldOut.r2.toFixed(2)}, ±{p.heldOut.mae} {p.unit}</p>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight tabular-nums">{fmt(p.value, p.digits)}<span className="ml-1 text-sm font-medium text-slate-400">{p.unit}</span></p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">nearest tests {fmt(p.low, p.digits)}–{fmt(p.high, p.digits)}</p>
      </div>
      <div>
        <div className="relative h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" role="img" aria-label={`${p.label} compared with the range of all tests`}>
          <span className="absolute inset-y-0 rounded-full bg-teal-600/40" style={{ left: pos(p.low), width: `calc(${pos(p.high)} - ${pos(p.low)})` }} />
          <span className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded bg-teal-700 dark:bg-teal-300" style={{ left: pos(p.value ?? lo) }} />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400"><span>{fmt(lo, p.digits)}</span><span>range across all tests</span><span>{fmt(hi, p.digits)}</span></div>
      </div>
    </div>
  );
}

export default function PredictionPage() {
  const [input, setInput] = useState<PredictionInput>(DEFAULTS);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<PredictionTarget>("burningRate");
  const set = <K extends keyof PredictionInput>(k: K, v: PredictionInput[K]) => setInput((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    let live = true;
    const t = setTimeout(() => {
      predictFlex(input)
        .then((r) => { if (live) { setResult(r); setError(null); } })
        .catch(() => { if (live) setError("Could not get an estimate. Check the connection and try again."); });
    }, 120);
    return () => { live = false; clearTimeout(t); };
  }, [input]);

  const n2 = Math.round((100 - input.o2 - input.co2 - input.he) * 10) / 10;
  const sweep = result?.sweep?.[target];
  const meta = TARGET_META[target];

  return (
    <div className="animate-view-enter mx-auto w-full max-w-6xl space-y-5 px-3 py-5 sm:px-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Exploratory · FLEX droplet tests only</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Predict from conditions</h1>
        <p className="mt-1 max-w-2xl text-[14px] text-slate-500 dark:text-slate-400">
          Set the fuel and atmosphere to estimate how a burning droplet behaves, next to the real ISS tests the estimate comes from. This is not fire-safety guidance.
        </p>
      </header>

      <div className="space-y-5">
        <Card className="p-4" data-tour="predict-controls">
          <div className="flex items-center justify-between">
            <SectionTitle sub="Move a slider; results update">Conditions</SectionTitle>
            <button onClick={() => setInput(DEFAULTS)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Reset conditions">
              <RotateCcw size={13} /> Reset
            </button>
          </div>
          <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <fieldset>
            <legend className="text-[13px] font-medium text-slate-700 dark:text-slate-200">Fuel</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {(["methanol", "heptane"] as const).map((f) => (
                <button key={f} onClick={() => set("fuel", f)} aria-pressed={input.fuel === f}
                  className={cn("rounded-lg border px-3 py-1.5 text-[13px] font-medium capitalize transition-colors",
                    input.fuel === f ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 text-slate-600 hover:border-teal-600/40 dark:border-slate-700 dark:text-slate-300")}>{f}</button>
              ))}
            </div>
          </fieldset>
          <Control id="p" label="Pressure" unit=" kPa" value={input.pressureKpa} min={60} max={320} step={1} limits={INPUT_LIMITS.pressureKpa} onChange={(v) => set("pressureKpa", v)} />
          <Control id="o2" label="Oxygen" unit="%" value={input.o2} min={10} max={36} step={0.5} limits={INPUT_LIMITS.o2} onChange={(v) => set("o2", v)} />
          <Control id="co2" label="Carbon dioxide" unit="%" value={input.co2} min={0} max={80} step={1} limits={INPUT_LIMITS.co2} onChange={(v) => set("co2", v)} />
          <Control id="he" label="Helium" unit="%" value={input.he} min={0} max={50} step={1} limits={INPUT_LIMITS.he} onChange={(v) => set("he", v)} />
          <Control id="d" label="Droplet diameter" unit=" mm" value={input.dropletMm} min={1} max={5} step={0.1} limits={INPUT_LIMITS.dropletMm} onChange={(v) => set("dropletMm", Math.round(v * 10) / 10)} />
          <p className={cn("rounded-lg bg-slate-100 px-3 py-2 font-mono text-[12px] dark:bg-slate-800", n2 < 0 ? "text-amber-700 dark:text-amber-300" : "text-slate-600 dark:text-slate-300")}>
            Nitrogen (balance): {n2}%
          </p>
          </div>
        </Card>

        <div className="min-w-0 space-y-5">
          {error && <p className="text-[13px] text-red-600 dark:text-red-400" role="alert">{error}</p>}
          {!result && !error && <Card className="p-4"><LoadingSkeleton lines={5} /></Card>}

          {result && (
            <>
              <div className="flex flex-wrap items-center gap-2" aria-live="polite">
                <Badge className={STATUS[result.status].tone}>{STATUS[result.status].label}</Badge>
                {result.status !== "outside" && <span className="text-xs text-slate-500 dark:text-slate-400">{result.similarCount} real {input.fuel} tests within ±15% pressure and ±2 points oxygen</span>}
              </div>

              {result.issues.length > 0 && (
                <div className="flex gap-2.5 rounded-xl border border-amber-600/30 bg-amber-500/[0.07] p-3.5 text-[13px] text-amber-900 dark:text-amber-200" role="status">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
                  <div>
                    {result.status === "outside" && <p className="font-semibold">No estimate: this setting is an evidence gap, not a result.</p>}
                    <ul className="mt-0.5 list-disc space-y-0.5 pl-4">{result.issues.map((i) => <li key={i}>{i}</li>)}</ul>
                  </div>
                </div>
              )}

              {result.status === "outside" ? (
                <EmptyState title="Nothing to estimate here" body="Move the sliders back into the tested range. FLEX has no measurements at this setting, so the page shows none." />
              ) : (
                <>
                  <Card className="divide-y divide-slate-100 dark:divide-slate-800">{result.predictions.map((p) => <ValueRow key={p.target} p={p} />)}</Card>

                  <Card className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <SectionTitle sub={`${meta.label} (${meta.unit}) for ${input.fuel} at about ${input.pressureKpa} kPa (±15%). Dots are real tests.`}>Oxygen sweep</SectionTitle>
                      <div className="flex gap-1" role="group" aria-label="Chart quantity">
                        {TARGET_KEYS.map((k) => (
                          <button key={k} onClick={() => setTarget(k)} aria-pressed={target === k}
                            className={cn("rounded-md border px-2 py-1 text-[11px] font-medium", target === k ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300")}>
                            {TARGET_META[k].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 h-64 text-slate-500 dark:text-slate-400" role="img" aria-label={`${meta.label} against oxygen percentage, estimated curve with real test points`}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart margin={{ top: 6, right: 8, left: -8, bottom: 14 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.25} />
                          <XAxis type="number" dataKey="o2" domain={[12, 34]} tick={{ fontSize: 10, fill: "currentColor" }} tickLine={false} label={{ value: "Oxygen (%)", position: "insideBottom", offset: -8, fontSize: 11, fill: "currentColor" }} />
                          <YAxis type="number" dataKey="value" tick={{ fontSize: 10, fill: "currentColor" }} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Scatter name="Real tests" data={sweep?.observed ?? []} fill="#ea580c" fillOpacity={0.7} />
                          <Line name="Estimate" data={sweep?.curve ?? []} dataKey="value" stroke="#0f766e" strokeWidth={2} dot={false} isAnimationActive={false} />
                          <ReferenceLine x={input.o2} stroke="#0f766e" strokeDasharray="4 3" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Other conditions are held at your settings. Where dots are missing, no test exists, so the line there is a guess.</p>
                  </Card>

                  <Card className="overflow-hidden">
                    <div className="p-4 pb-2"><SectionTitle sub="The measured tests the estimate is built from">Closest real tests</SectionTitle></div>
                    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Closest real tests, scroll horizontally on small screens">
                      <table className="w-full min-w-[860px] whitespace-nowrap border-collapse text-left text-[13px]">
                        <thead>
                          <tr className="border-y border-slate-200 font-mono text-[11px] text-slate-400 dark:border-slate-800">
                            {["Test", "Fuel", "kPa", "O₂ %", "Droplet mm", "Ext. mm", "Rate mm²/s", "Burn s", "Ended", "Source"].map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {result.nearest.map((n) => (
                            <tr key={n.id} className="border-b border-slate-100 dark:border-slate-800">
                              <td className="px-3 py-2 font-mono text-[12px] text-teal-700 dark:text-teal-300">{n.id}</td>
                              <td className="px-3 py-2 capitalize">{n.fuel}</td>
                              <td className="px-3 py-2 tabular-nums">{n.pressureKpa.toFixed(0)}</td>
                              <td className="px-3 py-2 tabular-nums">{n.o2.toFixed(0)}</td>
                              <td className="px-3 py-2 tabular-nums">{n.dropletMm.toFixed(2)}</td>
                              <td className="px-3 py-2 tabular-nums">{fmt(n.extinctionDiameter, 2)}</td>
                              <td className="px-3 py-2 tabular-nums">{fmt(n.burningRate, 2)}</td>
                              <td className="px-3 py-2 tabular-nums">{fmt(n.burnTime, 1)}</td>
                              <td className="px-3 py-2">{n.end}</td>
                              <td className="px-3 py-2 font-mono text-[11px] text-slate-500">{n.citation.figure ? `Fig. ${n.citation.figure}, p. ${n.citation.page}` : "Table IX"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}

              <Card className="p-4 text-[13px] text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{result.model.name}</p>
                <p className="mt-0.5">{result.model.note}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Built from {result.model.trainedOn}. Covers liquid droplets in microgravity only, so it says nothing about solid materials, flame spread, or lunar gravity.</p>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
