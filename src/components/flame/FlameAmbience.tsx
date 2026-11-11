import { useAmbience } from "../../context/AmbienceContext";

/** Rising embers — fixed positions so there is no per-render randomness. */
const EMBERS = [
  { l: 6, dx: 26, dur: 11, delay: 0, s: 3 },   { l: 14, dx: -18, dur: 14, delay: 3.2, s: 2 },
  { l: 23, dx: 30, dur: 12, delay: 6.1, s: 3 }, { l: 31, dx: -24, dur: 16, delay: 1.4, s: 2 },
  { l: 40, dx: 16, dur: 13, delay: 8.3, s: 3 }, { l: 48, dx: -30, dur: 15, delay: 4.6, s: 2 },
  { l: 56, dx: 22, dur: 12, delay: 9.8, s: 3 }, { l: 64, dx: -14, dur: 17, delay: 2.2, s: 2 },
  { l: 72, dx: 28, dur: 13, delay: 7.1, s: 3 }, { l: 80, dx: -26, dur: 15, delay: 5.3, s: 2 },
  { l: 88, dx: 18, dur: 12, delay: 10.4, s: 3 }, { l: 94, dx: -20, dur: 14, delay: 0.8, s: 2 },
];

/**
 * Full-bleed animated backdrop. It reads --amb-i (0 cold → 1 blazing) from
 * the shell: cold teal light fades out, warm ember light and a fire-floor
 * glow fade in, and embers appear. Sits behind content (-z-10).
 */
export default function FlameAmbience() {
  const { enabled } = useAmbience();
  if (!enabled) return null;
  return (
    <div aria-hidden className="flame-amb pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="amb-cold" />
      <div className="amb-warm" />
      <div className="amb-floor" />
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="amb-ember"
          style={{
            left: `${e.l}%`, width: e.s, height: e.s,
            ["--dx" as string]: `${e.dx}px`,
            animationDuration: `${e.dur}s`, animationDelay: `${e.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
