import { useRef } from "react";
import { cn } from "../../lib/utils";
import { useMagneticOffset } from "../../hooks/useMagneticOffset";
import FreefallFlame from "./FreefallFlame";

/** Tiny drifting specks — restrained, few DOM nodes. */
export default function FlameParticles({ count = 7, className }: { count?: number; className?: string }) {
  const dots = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const px = Math.cos(angle) * (18 + (i % 3) * 10);
    const py = -30 - (i % 4) * 12;
    return { px, py, delay: (i * 1.3) % 5, size: 2 + (i % 3) };
  });
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full bg-orange-300/70 dark:bg-teal-200/60"
          style={{
            width: d.size, height: d.size,
            ["--px" as string]: `${d.px}px`,
            ["--py" as string]: `${d.py}px`,
            animation: `particle-float 6s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function FreefallVisualization({ compact = false, magnetic = false }: { compact?: boolean; magnetic?: boolean }) {
  const areaRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  useMagneticOffset(targetRef, { area: areaRef, maxX: 35, maxY: 25 });
  return (
    <div ref={magnetic ? areaRef : undefined} className={cn("relative flex flex-col items-center", magnetic && "px-12 py-3")}>
      <div ref={magnetic ? targetRef : undefined} data-flame={magnetic || undefined} className={cn("relative", magnetic && "will-change-transform")}>
        {magnetic && <div aria-hidden className="flame-field" />}
        <FreefallFlame size={compact ? 64 : 148} />
        <FlameParticles count={compact ? 0 : 7} />
      </div>
      {!compact && (
        <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
          microgravity · quiescent · demo render
        </div>
      )}
    </div>
  );
}
