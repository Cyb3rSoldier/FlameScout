import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Atom, Droplets, Radar, Shield } from "lucide-react";
import { Badge, Card, StrengthBadge } from "../components/ui";
import { EXPERIMENTS } from "../data/experiments";
import { cn } from "../lib/utils";
import type { Experiment, FireFocus } from "../types";

type PillarId = FireFocus | "all";

const PILLARS: { id: Exclude<PillarId, "all">; label: string; icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }>; blurb: string }[] = [
  {
    id: "prevention",
    label: "Prevention",
    icon: Shield,
    blurb: "Material flammability, flame spread and requirements for selecting what flies — the records that inform cabin atmospheres, ventilation envelopes and materials screening.",
  },
  {
    id: "detection",
    label: "Detection",
    icon: Radar,
    blurb: "Smoke particle behaviour, alarm thresholds and false-alarm backgrounds — the records that inform next-generation detector and alarm-system design.",
  },
  {
    id: "suppression",
    label: "Suppression",
    icon: Droplets,
    blurb: "How burning and extinction actually behave in sealed microgravity volumes — the records that inform extinguisher agents, water-mist systems and suppression tactics.",
  },
  {
    id: "combustion-physics",
    label: "Combustion physics",
    icon: Atom,
    blurb: "Core flame science in microgravity — soot, smoke points, fuel-droplet behaviour and electrostatic control — the enabling records behind modelling and design tools.",
  },
];

function ControlsCard({ e }: { e: Experiment }) {
  const bullets = (e.keyFindings ?? []).slice(0, 2);
  return (
    <Card className="p-4 transition-colors hover:border-teal-600/30 sm:p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[12px] font-semibold text-teal-700 dark:text-teal-300">{e.id}</span>
        <StrengthBadge strength={e.evidenceStrength} />
        {e.title.includes("planned") && (
          <Badge className="border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">planned · no PSI data</Badge>
        )}
      </div>
      <p className="mt-1 text-[14px] font-semibold leading-snug text-slate-900 dark:text-white">{e.title}</p>
      <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">{e.objective}</p>
      {bullets.length > 0 && (
        <ul className="mt-2 space-y-1" aria-label="Design-relevant published findings">
          {bullets.map((k, i) => (
            <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-300">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400" aria-hidden />
              <span>{k}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-slate-400">
        <span>{e.fuel}</span>
        <span>{e.oxygenNote ?? (e.oxygen !== null ? `≈${e.oxygen}% O₂` : "O₂ —")}</span>
        <span>{e.pressureNote ?? (e.pressure !== null ? `≈${e.pressure} kPa` : "pressure —")}</span>
        <span>{e.gravity}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
        <Link to="/compare" className="text-teal-700 hover:underline dark:text-teal-300">Compare →</Link>
        {e.sourceId && <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">source: {e.sourceId}</span>}
      </div>
    </Card>
  );
}

export default function ControlsPage() {
  const [pillar, setPillar] = useState<PillarId>("all");

  const grouped = useMemo(() => {
    const by = new Map<Exclude<PillarId, "all">, Experiment[]>();
    for (const p of PILLARS) by.set(p.id, []);
    for (const e of EXPERIMENTS) {
      for (const f of e.fireFocus ?? ["combustion-physics"] as FireFocus[]) {
        if (by.has(f)) by.get(f)!.push(e);
      }
    }
    for (const list of by.values()) list.sort((a, b) => (a.evidenceStrength === b.evidenceStrength ? 0 : a.evidenceStrength === "Strong" ? -1 : b.evidenceStrength === "Strong" ? 1 : a.evidenceStrength === "Moderate" ? -1 : 1));
    return by;
  }, []);

  const visible: { id: Exclude<PillarId, "all">; items: Experiment[] }[] =
    pillar === "all"
      ? PILLARS.map((p) => ({ id: p.id, items: grouped.get(p.id) ?? [] }))
      : [{ id: pillar, items: grouped.get(pillar) ?? [] }];

  return (
    <div className="animate-view-enter mx-auto w-full max-w-5xl space-y-4 px-3 py-5 sm:px-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">From catalog to equipment</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Safety Controls</h1>
        <p className="mt-1 max-w-3xl text-[14px] text-slate-500 dark:text-slate-400">
          The research behind next-generation fire-safety controls and equipment — grouped by the pillar it feeds:
          prevention (materials), detection (smoke and alarms), suppression (extinguishment) and the combustion physics underneath them all.
          Planned records are listed but marked — they are roadmap, not data.
        </p>
      </header>

      <Card className="p-4">
        <h2 className="text-sm font-semibold">Pick a safety pillar</h2>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {([{ id: "all" as PillarId, label: "All pillars" }, ...PILLARS]).map((p) => (
            <button
              key={p.id}
              onClick={() => setPillar(p.id)}
              aria-pressed={pillar === p.id}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                pillar === p.id
                  ? "border-teal-700 bg-teal-700 text-white dark:border-teal-400 dark:bg-teal-500 dark:text-slate-950"
                  : "border-slate-200 text-slate-600 hover:border-teal-600/40 dark:border-slate-700 dark:text-slate-300",
              )}
            >
              {p.label}
              {p.id !== "all" && <span className={cn("ml-1.5 font-mono text-[10px]", pillar === p.id ? "text-white/80 dark:text-slate-900" : "text-slate-400")}>{(grouped.get(p.id as Exclude<PillarId, "all">) ?? []).length}</span>}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-5">
        {visible.map(({ id, items }) => {
          const meta = PILLARS.find((p) => p.id === id)!;
          return (
            <section key={id} aria-label={meta.label}>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                  <meta.icon size={18} aria-hidden />
                </span>
                <div>
                  <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">
                    {meta.label} <span className="font-mono text-[11px] font-normal text-slate-400">{items.length} investigations</span>
                  </h2>
                  <p className="max-w-3xl text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">{meta.blurb}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-3.5">
                {items.map((e) => (
                  <ControlsCard key={`${e.id}-${id}`} e={e} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Card className="p-4 text-[13px] text-slate-600 dark:text-slate-300">
        <p className="font-semibold text-slate-900 dark:text-slate-100">Terrestrial note</p>
        <p className="mt-0.5">
          Published Earth-side transfer of this research (fine-water-mist extinguishers, smoke-detector assumptions, protective gear) is kept on its own page with its own honesty rules — see{" "}
          <Link to="/earth" className="text-teal-700 hover:underline dark:text-teal-300">Earth Applications</Link>.
        </p>
      </Card>
    </div>
  );
}
