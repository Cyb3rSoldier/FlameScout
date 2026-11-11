import { useMemo, useState } from "react";
import { CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { FlaskConical, Info, Route } from "lucide-react";
import { Badge, Card, SectionTitle } from "../components/ui";
import FreefallFlame from "../components/flame/FreefallFlame";
import { cn } from "../lib/utils";
import { MISSION_ENVIRONMENTS } from "../lib/ranking";
import {
  atmosphereInsights, closestEnvironment, envelopeData, LAB_O2, LAB_PRESSURE,
  MAPPABLE, nearestCatalog,
} from "../lib/lab";
import type { GravityLevel } from "../types";

const GRAVITY: { id: GravityLevel; label: string }[] = [
  { id: "Microgravity", label: "Microgravity (µg)" },
  { id: "Lunar-g", label: "Lunar 1/6 g" },
  { id: "Mars-g", label: "Mars 3/8 g" },
  { id: "Normal gravity", label: "Earth 1 g" },
];

const TONES = {
  info: { icon: Info, cls: "border-slate-300/60 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300" },
  match: { icon: Route, cls: "border-teal-600/30 bg-teal-500/10 text-teal-800 dark:border-teal-400/30 dark:bg-teal-400/10 dark:text-teal-200" },
  gap: { icon: FlaskConical, cls: "border-amber-600/30 bg-amber-500/[0.07] text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/[0.07] dark:text-amber-200" },
} as const;

const DEFAULT_ID = "FLEX-2";
const DEFAULT = MAPPABLE.find((e) => e.id === DEFAULT_ID) ?? MAPPABLE[0];

export default function LabPage() {
  const [baselineId, setBaselineId] = useState(DEFAULT.id);
  const [o2, setO2] = useState<number>(DEFAULT.oxygen as number);
  const [pressureKpa, setPressureKpa] = useState<number>(DEFAULT.pressure as number);
  const [gravity, setGravity] = useState<GravityLevel>("Microgravity");

  const baseline = MAPPABLE.find((e) => e.id === baselineId) ?? DEFAULT;

  const nearest = useMemo(() => nearestCatalog(o2, pressureKpa), [o2, pressureKpa]);
  const insights = useMemo(() => atmosphereInsights(o2, pressureKpa, gravity), [o2, pressureKpa, gravity]);
  const data = useMemo(() => envelopeData(o2, pressureKpa), [o2, pressureKpa]);
  const { env } = useMemo(() => closestEnvironment(o2, pressureKpa), [o2, pressureKpa]);

  const setBaseline = (id: string) => {
    const e = MAPPABLE.find((x) => x.id === id);
    if (!e) return;
    setBaselineId(id);
    setO2(e.oxygen as number);
    setPressureKpa(e.pressure as number);
    setGravity(e.gravity);
  };
  const snap = (id: string) => {
    const m = MISSION_ENVIRONMENTS.find((x) => x.id === id);
    if (!m) return;
    setO2(m.o2);
    setPressureKpa(m.pressure);
  };

  const dO2 = Math.round(((o2 - (baseline.oxygen as number)) * 10)) / 10;
  const dP = Math.round(pressureKpa - (baseline.pressure as number));
  const flameSize = Math.round(Math.min(168, 64 + o2 * 1.1));

  return (
    <div className="animate-view-enter mx-auto w-full max-w-6xl space-y-5 px-3 py-5 sm:px-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Design-a-run sandbox</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Experiment Lab</h1>
        <p className="mt-1 max-w-2xl text-[14px] text-slate-500 dark:text-slate-400">
          Start from a catalog investigation, then raise or lower elements — oxygen, pressure, gravity — and see what the
          catalog knows near your setting, and which corners are entirely empty. The Lab retrieves evidence; it never predicts an outcome.
        </p>
      </header>

      <Card className="p-4 sm:p-5" data-tour="lab-baseline">
        <SectionTitle sub="Conditions seed the sliders — deltas shown as you move">Baseline</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Baseline investigation">
          {MAPPABLE.map((e) => (
            <button key={e.id} onClick={() => setBaseline(e.id)} aria-pressed={baselineId === e.id}
              className={cn("rounded-md border px-2 py-1 font-mono text-[11px] transition-colors",
                baselineId === e.id ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 text-slate-600 hover:border-teal-600/40 dark:border-slate-700 dark:text-slate-300")}>
              {e.id}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-300">
          <span className="font-semibold">{baseline.title}</span>
          <span className="text-slate-500 dark:text-slate-400"> — {baseline.fuel} · {baseline.oxygenNote ?? `${baseline.oxygen}% O₂`} · {baseline.pressureNote ?? `${baseline.pressure} kPa`} · {baseline.gravity}</span>
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          <Card className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionTitle sub="Raise or lower an element — every slider is live">Elements</SectionTitle>
              <div className="flex flex-wrap gap-1" role="group" aria-label="Snap to a crewed atmosphere">
                {MISSION_ENVIRONMENTS.map((m) => (
                  <button key={m.id} onClick={() => snap(m.id)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:border-teal-600/40 hover:text-teal-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-teal-200"
                    title={m.note}>
                    {m.name.replace(" / Space Station", "")}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <label htmlFor="lab-o2" className="text-[13px] font-medium text-slate-700 dark:text-slate-200">Oxygen</label>
                  <span className="font-mono text-[13px] tabular-nums text-slate-900 dark:text-white">{o2}% <span className={cn("text-[11px]", dO2 !== 0 ? "text-teal-700 dark:text-teal-300" : "text-slate-400")}>({dO2 >= 0 ? "+" : ""}{dO2} vs baseline)</span></span>
                </div>
                <input id="lab-o2" type="range" min={LAB_O2.min} max={LAB_O2.max} step={LAB_O2.step} value={o2}
                  onChange={(e) => setO2(Number(e.target.value))} className="mt-1 h-1.5 w-full cursor-pointer accent-teal-700 dark:accent-teal-400" />
                <p className="mt-0.5 font-mono text-[10px] text-slate-400">suit corner is 100% · ordinary air ≈ 21% · FLEX swept 12–34%</p>
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <label htmlFor="lab-p" className="text-[13px] font-medium text-slate-700 dark:text-slate-200">Pressure</label>
                  <span className="font-mono text-[13px] tabular-nums text-slate-900 dark:text-white">{pressureKpa} kPa <span className={cn("text-[11px]", dP !== 0 ? "text-teal-700 dark:text-teal-300" : "text-slate-400")}>({dP >= 0 ? "+" : ""}{dP} vs baseline)</span></span>
                </div>
                <input id="lab-p" type="range" min={LAB_PRESSURE.min} max={LAB_PRESSURE.max} step={LAB_PRESSURE.step} value={pressureKpa}
                  onChange={(e) => setPressureKpa(Number(e.target.value))} className="mt-1 h-1.5 w-full cursor-pointer accent-teal-700 dark:accent-teal-400" />
                <p className="mt-0.5 font-mono text-[10px] text-slate-400">suit ≈ 30 kPa · cabin ≈ 101 kPa · FLEX swept ≈ 45–320 kPa</p>
              </div>

              <fieldset>
                <legend className="text-[13px] font-medium text-slate-700 dark:text-slate-200">Gravity</legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {GRAVITY.map((g) => (
                    <button key={g.id} onClick={() => setGravity(g.id)} aria-pressed={gravity === g.id}
                      className={cn("rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors",
                        gravity === g.id ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 text-slate-600 hover:border-teal-600/40 dark:border-slate-700 dark:text-slate-300")}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </Card>

          <Card className="p-4 sm:p-5" data-tour="lab-insights">
            <SectionTitle sub="Derived from the catalog at your setting — retrieval, not physics">What the catalog knows here</SectionTitle>
            <ul className="mt-3 space-y-2">
              {insights.map((ins, i) => {
                const T = TONES[ins.tone];
                return (
                  <li key={i} className={cn("flex gap-2.5 rounded-xl border p-3 text-[13px] leading-relaxed", T.cls)}>
                    <T.icon size={15} className="mt-0.5 shrink-0" aria-hidden />
                    <span>{ins.text}</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card className="overflow-hidden" data-tour="lab-nearest">
            <div className="p-4 pb-2"><SectionTitle sub="The records whose anchors sit nearest to your setting">Nearest evidence</SectionTitle></div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {nearest.map(({ experiment, distance }) => (
                <li key={experiment.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                      <span className="font-mono text-[12px] text-teal-700 dark:text-teal-300">{experiment.id}</span> · {experiment.title}
                    </p>
                    <span className="font-mono text-[10px] text-slate-400">d {distance.toFixed(2)} · {experiment.gravity}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">{experiment.outcome}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="min-w-0 space-y-5">
          <Card className="relative p-4 sm:p-5" data-tour="lab-flame">
            <SectionTitle sub="Visual echo of your conditions — not a simulation">Flame echo</SectionTitle>
            <div className="mt-3 flex items-center justify-center py-2">
              <FreefallFlame size={flameSize} />
            </div>
            <p className="mt-2 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
              ≈{env.o2}% O₂ · ≈{Math.round(env.pressure)} kPa ({env.name.replace(" / Space Station", "").toLowerCase()})
            </p>
            <Badge className="absolute right-3 top-3 border-slate-300/60 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">schematic</Badge>
          </Card>

          <Card className="p-4 sm:p-5">
            <SectionTitle sub="Real catalog anchors (orange) and your what-if point (teal)">Tested envelope</SectionTitle>
            <div className="mt-2 h-64 text-slate-500 dark:text-slate-400" role="img" aria-label="Chart of catalog test conditions by oxygen and pressure, with your setting marked">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 8, left: -12, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.25} />
                  <XAxis type="number" dataKey="o2" domain={[0, 100]} tick={{ fontSize: 10, fill: "currentColor" }} tickLine={false}
                    label={{ value: "Oxygen (%)", position: "insideBottom", offset: -8, fontSize: 11, fill: "currentColor" }} />
                  <YAxis type="number" dataKey="pressureKpa" domain={[0, 360]} tick={{ fontSize: 10, fill: "currentColor" }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <ReferenceLine x={21} stroke="currentColor" strokeDasharray="2 3" opacity={0.5} />
                  <ReferenceLine y={101} stroke="currentColor" strokeDasharray="2 3" opacity={0.5} />
                  <Scatter name="Catalog anchors" data={data.observed} fill="#ea580c" fillOpacity={0.65} />
                  <Scatter name="Your setting" data={[data.point]} fill="#0f766e" shape="star" stroke="#0f766e" />
                  <ReferenceDot y={pressureKpa} x={o2} r={2} fill="none" stroke="none" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Crosshair marks air-normal conditions (21% · 101 kPa). Dots cluster where NASA tested; empty regions are evidence gaps, too.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
