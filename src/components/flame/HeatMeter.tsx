import { Flame } from "lucide-react";
import { useAmbience } from "../../context/AmbienceContext";
import { cn } from "../../lib/utils";

/** Top-bar readout of the current flame intensity + the on/off switch. */
export default function HeatMeter() {
  const { intensity, label, enabled, setEnabled } = useAmbience();
  const lit = Math.round(intensity * 5);
  return (
    <div className="mr-1 hidden items-center gap-2 md:flex">
      {enabled && (
        <div className="flex items-center gap-2" role="img" aria-label={`Flame intensity ${lit} of 5: ${label}`} title={`Flame intensity — ${label}`}>
          <div className="flex h-4 items-end gap-[2px]" aria-hidden>
            {[0, 1, 2, 3, 4].map((k) => (
              <span
                key={k}
                className={cn("w-[3px] rounded-sm transition-colors duration-700", k < lit ? "bg-orange-500" : "bg-slate-300 dark:bg-slate-700")}
                style={{ height: 5 + k * 2.5 }}
              />
            ))}
          </div>
          <span className="max-w-[150px] truncate font-mono text-[10px] text-slate-400">{label}</span>
        </div>
      )}
      <button
        onClick={() => setEnabled(!enabled)}
        aria-pressed={enabled}
        aria-label="Flame ambience"
        title={enabled ? "Turn flame ambience off" : "Turn flame ambience on"}
        className={cn("rounded-md p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800", enabled ? "text-orange-500" : "text-slate-400")}
      >
        <Flame size={16} />
      </button>
    </div>
  );
}
