import { useEffect, useState } from "react";
import FreefallFlame from "./FreefallFlame";

const STEPS = ["Retrieving evidence...", "Verifying sources...", "Building evidence trace..."];

export default function FlameLoader({ step }: { step?: number }) {
  const [i, setI] = useState(step ?? 0);
  useEffect(() => {
    if (step !== undefined) return;
    const t = setInterval(() => setI((v) => (v + 1) % STEPS.length), 1400);
    return () => clearInterval(t);
  }, [step]);
  const label = STEPS[step ?? i];
  return (
    <div className="flex items-center gap-4" role="status" aria-live="polite" aria-label={label}>
      <FreefallFlame size={52} />
      <div>
        <p className="animate-loader-pulse text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Searching demo evidence index…</p>
      </div>
    </div>
  );
}
