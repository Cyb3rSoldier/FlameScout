import { cn } from "../lib/utils";
import type { EvidenceStrength } from "../types";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium", className)}>
      {children}
    </span>
  );
}

export function StrengthBadge({ strength }: { strength: EvidenceStrength }) {
  const map: Record<string, string> = {
    Strong: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    Moderate: "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    Limited: "border-orange-600/30 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    Insufficient: "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-300",
  };
  return (
    <Badge className={map[strength]}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {strength === "Insufficient" ? "Not enough data" : `${strength} evidence`}
    </Badge>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">{children}</h2>
      {sub && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center dark:border-slate-700">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 animate-pulse rounded bg-slate-200/70 dark:bg-slate-800" style={{ width: `${92 - i * 12}%` }} />
      ))}
    </div>
  );
}
