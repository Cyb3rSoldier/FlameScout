import { useId } from "react";
import { cn } from "../../lib/utils";

/**
 * FreefallFlame — signature "Flame in Freefall" visual.
 * A slow, suspended microgravity flame: near-spherical, softly deforming,
 * gentle glow. GPU-friendly (transform/opacity only). Static when
 * prefers-reduced-motion is set.
 */
export default function FreefallFlame({
  size = 120,
  className,
  glow = true,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  // Unique gradient IDs — several flames can share a page.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const outerId = `fs-outer-${uid}`;
  const coreId = `fs-core-${uid}`;
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Flame in freefall — suspended microgravity flame illustration"
    >
      {glow && (
        <div
          aria-hidden
          className="animate-freefall-glow absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, rgba(249,115,22,0.35), rgba(20,184,166,0.12) 55%, transparent 72%)",
            filter: "blur(6px)",
          }}
        />
      )}
      <div className="animate-freefall-drift absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          width={size * 0.82}
          height={size * 0.82}
          className="animate-freefall-morph"
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
          {/* soft organic outer envelope — quasi-spherical, no upward tongue */}
          <path
            d="M60 8 C86 10 104 32 102 58 C100 84 84 108 58 110 C34 112 14 94 14 64 C14 36 34 6 60 8 Z"
            fill={`url(#${outerId})`}
          />
          <path
            d="M60 26 C76 27 88 40 87 58 C86 76 75 92 59 93 C43 94 30 81 30 61 C30 43 44 25 60 26 Z"
            fill={`url(#${coreId})`}
          />
          {/* inner luminous kernel, slightly off-center like suspended droplet flames */}
          <ellipse cx="58" cy="58" rx="14" ry="16" fill="#fffbeb" opacity="0.9" />
          <ellipse cx="58" cy="58" rx="7" ry="8.5" fill="#ffffff" opacity="0.95" />
        </svg>
      </div>
      {/* orbit ring — research-instrument feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-1 rounded-full border border-dashed border-slate-400/30 dark:border-slate-500/30"
      />
    </div>
  );
}
