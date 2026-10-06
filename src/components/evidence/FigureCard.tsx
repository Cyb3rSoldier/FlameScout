import { ImageIcon } from "lucide-react";
import { figureById, sourceById } from "../../services/api";

/** Demo figure placeholder — SVG schematic, never a fabricated NASA image. */
export function FigureArt({ kind, seed = 1 }: { kind: string; seed?: number }) {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" role="img" aria-label={`Demo ${kind} placeholder figure`}>
      <rect width="200" height="120" fill="currentColor" opacity="0.04" />
      <g opacity="0.85" stroke="currentColor" fill="none" strokeWidth="1.2">
        <rect x="10" y="10" width="180" height="100" rx="6" strokeDasharray="4 4" opacity="0.4" />
        {kind === "schematic" ? (
          <g>
            <rect x="60" y="40" width="80" height="40" rx="3" />
            <line x1="20" y1="60" x2="60" y2="60" markerEnd="none" />
            <line x1="140" y1="60" x2="180" y2="60" />
            <circle cx="100" cy="60" r="10" fill="currentColor" opacity="0.15" />
          </g>
        ) : (
          <g>
            <ellipse cx="100" cy={58 + (seed % 3) * 3} rx="26" ry="30" fill="currentColor" opacity="0.16" stroke="none" />
            <ellipse cx="100" cy="60" rx="14" ry="17" fill="currentColor" opacity="0.2" stroke="none" />
            <line x1="30" y1="100" x2="170" y2="100" opacity="0.4" />
            <line x1="30" y1="100" x2="30" y2="30" opacity="0.4" />
          </g>
        )}
      </g>
    </svg>
  );
}

export default function FigureCard({ id }: { id: string }) {
  const f = figureById(id);
  if (!f) return null;
  const src = sourceById(f.sourceId);
  return (
    <figure className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <ImageIcon size={13} /> {f.id} · Original figure (demo placeholder)
      </div>
      <div className="h-32 text-slate-500 dark:text-slate-400">
        <FigureArt kind={f.kind} seed={f.id.length} />
      </div>
      <figcaption className="px-3 py-2">
        <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{f.title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{f.caption}</p>
        <p className="mt-1 font-mono text-[10px] text-slate-400">Source: {src?.title ?? f.sourceId}</p>
      </figcaption>
    </figure>
  );
}
