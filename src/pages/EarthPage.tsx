import { Droplets, Flame, Globe2, Layers, Wind } from "lucide-react";
import { Card, StrengthBadge } from "../components/ui";
import { EARTH_APPLICATIONS, EARTH_TRANSFER_NOTE, type EarthApplication } from "../data/earthApplications";

const ICONS: Record<EarthApplication["id"], React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }>> = {
  "water-mist": Droplets,
  "smoke-detection": Flame,
  scba: Wind,
  "materials-screening": Layers,
  "burner-design": Globe2,
};

export default function EarthPage() {
  return (
    <div className="animate-view-enter mx-auto w-full max-w-4xl space-y-5 px-3 py-5 sm:px-5">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Down-to-Earth</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Earth Applications</h1>
        <p className="mt-1 max-w-2xl text-[14px] text-slate-500 dark:text-slate-400">
          Where published NASA crewed-spaceflight fire research has carried into terrestrial fire safety — presented as
          technology-transfer pointers, never as new conclusions from the FlameScout catalog.
        </p>
      </header>

      <Card className="p-4 sm:p-5" data-tour="earth-transfer">
        <h2 className="text-sm font-semibold">
          Why spacecraft fire research transfers <span className="font-mono text-[11px] font-normal text-slate-400">sealed cabin · clean gases · steep mass budgets</span>
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
          A spacecraft cabin concentrates the hard fire-safety constraints — an enclosed volume, no external help for
          many minutes or days, breathable gas mixtures (sometimes <span className="font-mono text-[12px]">≈100% O₂</span> at
          <span className="font-mono text-[12px]"> 4.3 psi</span> in a spacesuit), and strict limits on toxic extinguishing agents.
          Solving problems under tighter constraints than Earth buildings routinely solves them at has historically yielded
          tools terrestrial fire services later adopted. Coverage Map knowledge gaps is where that transfer story has not
          been written yet — the assistant can point them out.
        </p>
      </Card>

      <div className="grid gap-4">
        {EARTH_APPLICATIONS.map((app) => {
          const Icon = ICONS[app.id] ?? Flame;
          return (
            <Card key={app.id} className="overflow-hidden p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-600/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300" aria-hidden>
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-[15px] font-semibold leading-tight text-slate-900 dark:text-white">{app.title}</h3>
                    <StrengthBadge strength={app.strength} />
                  </div>

                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-400">In space</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{app.spaceOrigin}</p>

                  <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">On Earth</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{app.earthUse}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Catalog evidence</span>
                    {app.related.length ? (
                      app.related.map((r) => (
                        <span key={r} className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                          {r}
                        </span>
                      ))
                    ) : (
                      <span className="font-mono text-[10px] italic text-slate-400">materials heritage, outside the combustion catalog</span>
                    )}
                  </div>

                  <p className="mt-2 text-[11px] italic leading-relaxed text-slate-500 dark:text-slate-400">Source: {app.sourceNote}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="border-amber-600/30 bg-amber-500/[0.06] p-4 dark:border-amber-400/20 dark:bg-amber-400/[0.06]">
        <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Honesty rules for this page</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-amber-800/90 dark:text-amber-200/90">{EARTH_TRANSFER_NOTE}</p>
      </Card>
    </div>
  );
}
