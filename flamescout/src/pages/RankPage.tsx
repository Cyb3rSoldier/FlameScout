import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { Badge, Card, StrengthBadge } from "../components/ui";
import { MISSION_ENVIRONMENTS, rankForEnvironment, roadmapRecords } from "../lib/ranking";
import { cn } from "../lib/utils";
import type { EnvironmentId, RankedExperiment } from "../types";

function ScoreBar({ value }: { value: number }) {
  const tone = value >= 70 ? "bg-teal-600 dark:bg-teal-400" : value >= 50 ? "bg-amber-500" : "bg-slate-400 dark:bg-slate-500";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800" role="presentation">
      <div className={cn("h-full rounded-full transition-all duration-500", tone)} style={{ width: `${value}%` }} />
    </div>
  );
}

function RankedRow({ r }: { r: RankedExperiment }) {
  const [open, setOpen] = useState(false);
  const planned = r.experiment.title.includes("planned");
  return (
    <li className="rounded-xl border border-slate-200 transition-colors hover:border-teal-600/30 dark:border-slate-800 dark:hover:border-teal-400/25">
      <button onClick={() => setOpen(!open)} className="flex w-full items-start gap-3 p-3.5 text-left" aria-expanded={open}>
        <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[12px] font-bold",
          r.rank <= 3 ? "bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
          {r.rank}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[12px] font-semibold text-teal-700 dark:text-teal-300">{r.experiment.id}</span>
            <StrengthBadge strength={r.experiment.evidenceStrength} />
            {planned && <Badge className="border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">planned · no PSI data</Badge>}
          </div>
          <p className="mt-0.5 truncate text-[13.5px] font-semibold text-slate-900 dark:text-white">{r.experiment.title}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">{r.reason}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-28"><ScoreBar value={r.total} /></div>
            <span className="font-mono text-[11px] text-slate-400">{r.total}/100</span>
            {open ? <ChevronDown size={13} className="ml-auto text-slate-400" /> : <ChevronRight size={13} className="ml-auto text-slate-400" />}
          </div>
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="text-slate-400">
                <th className="pb-1 font-mono text-[10px] uppercase tracking-wider">Factor</th>
                <th className="pb-1 font-mono text-[10px] uppercase tracking-wider">Score</th>
                <th className="pb-1 font-mono text-[10px] uppercase tracking-wider">Why</th>
              </tr>
            </thead>
            <tbody>
              {r.factors.map((f) => (
                <tr key={f.name} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1.5 pr-2 font-medium text-slate-600 dark:text-slate-300">{f.name}</td>
                  <td className="py-1.5 pr-2 font-mono text-slate-500">{Math.round(f.score * 100)}</td>
                  <td className="py-1.5 text-slate-500 dark:text-slate-400">{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-slate-500 dark:text-slate-400">
            <span className="font-mono">{r.experiment.oxygenNote ?? "O₂ —"}</span>
            <span className="font-mono">{r.experiment.pressureNote ?? "pressure —"}</span>
            <Link to="/compare" className="text-teal-700 hover:underline dark:text-teal-300">Compare →</Link>
          </div>
        </div>
      )}
    </li>
  );
}

const OPENING = "Ranking re-runs entirely in the browser using transparent weights (0.35 atmosphere overlap · 0.30 safety pillar · 0.20 materials directness · 0.15 evidence depth). Planned records are excluded from the ranking — they have no data — and are listed as roadmap lines instead.";

export default function RankPage() {
  const [envId, setEnvId] = useState<EnvironmentId>("lunar-base");
  const rankedAll = rankForEnvironment(envId);
  const ranked = useMemo(
    () => rankedAll
      .filter((r) => !r.experiment.title.includes("planned"))
      .map((r, i) => ({ ...r, rank: i + 1 })),
    [rankedAll],
  );
  const roadmap = useMemo(() => roadmapRecords(), []);
  const env = MISSION_ENVIRONMENTS.find((m) => m.id === envId)!;

  return (
    <div className="animate-view-enter mx-auto w-full max-w-5xl space-y-4 px-3 py-5 sm:px-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Summarize · Rank · Interpret</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Mission Fit</h1>
        <p className="mt-1 max-w-3xl text-[14px] text-slate-500 dark:text-slate-400">
          Which PSI investigations matter most for the fire-safety needs of each crewed environment — spacecraft, Moon Base, rovers and spacesuits (Mars uses the Moon Base atmosphere as a stand-in).
        </p>
      </header>

      <Card className="p-4" data-tour="rank-env-picker">
        <h2 className="text-sm font-semibold">Choose the crewed environment</h2>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {MISSION_ENVIRONMENTS.map((m) => (
            <button
              key={m.id}
              onClick={() => setEnvId(m.id)}
              aria-pressed={envId === m.id}
              className={cn("rounded-lg border px-3 py-2 text-left text-[12.5px] transition-colors",
                envId === m.id
                  ? "border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-500 dark:text-slate-950"
                  : "border-slate-200 text-slate-600 hover:border-teal-600/40 dark:border-slate-700 dark:text-slate-300")}
              title={m.note}
            >
              <span className="block font-semibold">{m.name}</span>
              <span className={cn("block font-mono text-[10.5px]", envId === m.id ? "text-white/80 dark:text-slate-900" : "text-slate-400")}>
                ≈{m.o2}% O₂ · ≈{m.pressure} kPa
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          <Info size={13} className="mt-0.5 shrink-0" />
          {env.note}
        </p>
      </Card>

      <div>
        <h2 className="text-sm font-semibold">Ranked investigations ({ranked.length})</h2>
        <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">{OPENING}</p>
        <ol className="mt-2 space-y-1.5">
          {ranked.map((r) => <RankedRow key={r.experiment.id} r={r} />)}
        </ol>
      </div>

      <Card className="border-amber-500/30 p-4">
        <h2 className="text-sm font-semibold text-amber-700 dark:text-amber-300">Roadmap — planned records, no PSI data yet</h2>
        <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">Included for completeness: these investigations appear in NASA plans but have not delivered data to PSI. They are shown here rather than ranked, so no ranking position pretends they have evidence.</p>
        <ul className="mt-2 space-y-1.5">
          {roadmap.map((e) => (
            <li key={e.id} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <span className="font-mono text-[12px] font-semibold text-teal-700 dark:text-teal-300">{e.id}</span>
              <span className="ml-2 text-[13px] font-medium text-slate-700 dark:text-slate-200">{e.title}</span>
              <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">{e.keyFindings?.[0]}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold">Honest-method notes</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-[12.5px] text-slate-500 dark:text-slate-400">
          <li>Goals: "identifies investigations most relevant to the fire-safety needs of habitable environments" — solved here with auditable factor weights instead of an opaque model.</li>
          <li>Scores describe relevance to the stated environment's atmosphere and mission needs — they are not a measure of experimental quality.</li>
          <li>Atmosphere values (Moon Base ≥30% O₂ / ≤10.2 psi; suit 100% O₂ / 4.3 psi) follow the Space Apps challenge text and NASA public positioning; Mars habitat values are estimates.</li>
          <li>Planned records (LUCI / FM²) are deliberately unranked — see the roadmap card.</li>
        </ul>
      </Card>
    </div>
  );
}
