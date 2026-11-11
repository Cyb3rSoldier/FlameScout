import { useId, type CSSProperties } from "react";
import { cn } from "../../lib/utils";
import { flameLook } from "../../lib/flameState";

/**
 * FreefallFlame — signature "Flame in Freefall" visual.
 * A suspended microgravity flame: near-spherical, softly deforming, with a
 * faint blue diffusion shell. GPU-friendly (transform/opacity only).
 *
 * Optional reactive props (all visual, never a prediction):
 *  - o2 / pressureKpa : brightness, size, shell and flicker speed follow oxygen
 *  - untested         : the flame goes dark and still — "no data, no flame"
 *  - sparks           : a few rising embers
 */
export default function FreefallFlame({
  size = 120,
  className,
  glow = true,
  o2,
  pressureKpa,
  untested = false,
  sparks = false,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
  o2?: number;
  pressureKpa?: number;
  untested?: boolean;
  sparks?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const outerId = `fs-outer-${uid}`;
  const coreId = `fs-core-${uid}`;
  const look = flameLook(o2, pressureKpa);

  const label = untested
    ? "Flame outline — no tested data at these conditions"
    : o2 === undefined
      ? "Flame in freefall — suspended microgravity flame illustration"
      : `Flame illustration at ${o2}% oxygen — ${look.label.toLowerCase()}`;

  return (
    <div
      className={cn("flame-wrap relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size, ["--fl-speed" as string]: `${look.flicker}s` } as CSSProperties}
      data-untested={untested || undefined}
      role="img"
      aria-label={label}
    >
      {glow && (
        <div aria-hidden className="flame-fade absolute inset-0" style={{ opacity: look.glow }}>
          <div
            className="animate-freefall-glow absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 55%, rgba(249,115,22,0.35), rgba(20,184,166,0.12) 55%, transparent 72%)",
              filter: "blur(6px)",
            }}
          />
        </div>
      )}

      <div
        className="flame-fade absolute inset-0 flex items-center justify-center"
        style={{ transform: `scale(${look.scale})` }}
      >
        <div className="animate-freefall-drift absolute inset-0 flex items-center justify-center">
          {/* blue diffusion shell — signature of microgravity combustion */}
          <div className="flame-fade absolute inset-[6%]" style={{ opacity: look.shell }}>
            <div className="flame-shell animate-flame-shell absolute inset-0 rounded-full" />
          </div>

          <svg
            viewBox="0 0 120 120"
            width={size * 0.82}
            height={size * 0.82}
            className="animate-freefall-morph relative"
            aria-hidden
          >
            <defs>
              <radialGradient id={outerId} cx="50%" cy="55%" r="55%">
                <stop offset="0%" stopColor="#fdba74" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#f97316" stopOpacity="0.85" />
                <stop offset="75%" stopColor="#0d9488" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={coreId} cx="50%" cy="52%" r="50%">
                <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.98" />
                <stop offset="40%" stopColor="#fed7aa" stopOpacity="0.9" />
                <stop offset="75%" stopColor="#2dd4bf" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
              </radialGradient>
            </defs>
            <path
              d="M60 8 C86 10 104 32 102 58 C100 84 84 108 58 110 C34 112 14 94 14 64 C14 36 34 6 60 8 Z"
              fill={`url(#${outerId})`}
            />
            <path
              d="M60 26 C76 27 88 40 87 58 C86 76 75 92 59 93 C43 94 30 81 30 61 C30 43 44 25 60 26 Z"
              fill={`url(#${coreId})`}
            />
            <g className="animate-flame-flicker">
              <ellipse cx="58" cy="58" rx="14" ry="16" fill="#fffbeb" opacity="0.9" />
              <ellipse cx="58" cy="58" rx="7" ry="8.5" fill="#ffffff" opacity="0.95" />
            </g>
          </svg>
        </div>
      </div>

      {sparks && !untested && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[
            { px: 14, py: -0.5, d: 0 },
            { px: -12, py: -0.42, d: 1.7 },
            { px: 4, py: -0.58, d: 3.3 },
          ].map((s, i) => (
            <span
              key={i}
              className="flame-spark absolute left-1/2 top-[38%] h-[3px] w-[3px] rounded-full"
              style={{
                ["--px" as string]: `${s.px}px`,
                ["--py" as string]: `${s.py * size}px`,
                animation: `particle-float 5.2s ease-out ${s.d}s infinite`,
              } as CSSProperties}
            />
          ))}
        </div>
      )}

      {/* orbit ring — research-instrument feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-1 rounded-full border border-dashed border-slate-400/30 dark:border-slate-500/30"
      />
    </div>
  );
}
