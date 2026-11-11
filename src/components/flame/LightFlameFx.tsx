import { useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import { useAmbience } from "../../context/AmbienceContext";

/** Deterministic flame-tongue silhouette (no per-render randomness). */
function tongues(seed: number, count: number, minH: number, maxH: number, w: number) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const n = (v: number) => Math.round(v);
  let d = "";
  for (let i = 0; i < count; i++) {
    const x = (i + 0.5) * (1200 / count) + (rnd() - 0.5) * 40;
    const h = minH + rnd() * (maxH - minH);
    const ww = w * (0.8 + rnd() * 0.5);
    const sk = (rnd() - 0.5) * 50;
    d += `M${n(x - ww / 2)},300 C${n(x - ww / 2)},${n(300 - h * 0.35)} ${n(x - ww * 0.12)},${n(300 - h * 0.62)} ${n(x + sk)},${n(300 - h)} C${n(x + ww * 0.16)},${n(300 - h * 0.58)} ${n(x + ww / 2)},${n(300 - h * 0.32)} ${n(x + ww / 2)},300 Z `;
  }
  return d;
}
const BACK = tongues(11, 7, 120, 230, 210);
const MID = tongues(23, 9, 90, 170, 170);
const FRONT = tongues(37, 11, 50, 110, 130);

/**
 * Light-mode only: a swaying flame silhouette along the bottom (height follows
 * --amb-i), a warm torch that follows the cursor, a hot spotlight on cards,
 * ember trails while moving, and an "ignite" burst on click.
 */
export default function LightFlameFx() {
  const { theme } = useApp();
  const { enabled, pulse } = useAmbience();
  const active = enabled && theme === "light";
  const heatRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const heat = heatRef.current;
    const fx = fxRef.current;
    if (!heat || !fx) return;

    let lastX = -999, lastY = -999, lastT = 0, alive = 0, raf = 0;

    const spawn = (cls: string, x: number, y: number, vars?: Record<string, string>) => {
      const el = document.createElement("span");
      el.className = cls;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      if (vars) for (const k in vars) el.style.setProperty(k, vars[k]);
      alive++;
      el.addEventListener("animationend", () => { el.remove(); alive--; }, { once: true });
      fx.appendChild(el);
    };

    const onMove = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        heat.style.transform = `translate3d(${x - 230}px, ${y - 230}px, 0)`;
        heat.classList.add("is-on");
      });
      // hot spotlight position on the card/tile under the cursor
      const t = (e.target as Element | null)?.closest?.(".flame-card, .flame-tile") as HTMLElement | null;
      if (t) {
        const r = t.getBoundingClientRect();
        t.style.setProperty("--mx", `${x - r.left}px`);
        t.style.setProperty("--my", `${y - r.top}px`);
      }
      // ember trail
      const now = performance.now();
      if (alive < 16 && now - lastT > 70 && Math.hypot(x - lastX, y - lastY) > 46) {
        spawn("light-trail", x, y, { "--tx": `${Math.round((Math.random() - 0.5) * 26)}px` });
        lastX = x; lastY = y; lastT = now;
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      spawn("light-ripple", e.clientX, e.clientY);
      for (let i = 0; i < 7; i++) {
        const a = (Math.PI * 2 * i) / 7 + Math.random() * 0.6;
        const r = 26 + Math.random() * 30;
        spawn("light-spark", e.clientX, e.clientY, {
          "--sx": `${Math.round(Math.cos(a) * r)}px`,
          "--sy": `${Math.round(Math.sin(a) * r - 14)}px`,
        });
      }
      pulse();
    };

    const onLeave = () => heat.classList.remove("is-on");
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      fx.replaceChildren();
    };
  }, [active, pulse]);

  if (!active) return null;
  return (
    <>
      <div aria-hidden className="light-tongues pointer-events-none absolute inset-x-0 bottom-0 -z-10">
        <svg className="tongue tongue-a" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lt-a" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#fdba74" stopOpacity="0.5" />
              <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lt-b" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#fb923c" stopOpacity="0.5" />
              <stop offset="1" stopColor="#fdba74" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lt-c" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#ea580c" stopOpacity="0.5" />
              <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={BACK} fill="url(#lt-a)" />
        </svg>
        <svg className="tongue tongue-b" viewBox="0 0 1200 300" preserveAspectRatio="none"><path d={MID} fill="url(#lt-b)" /></svg>
        <svg className="tongue tongue-c" viewBox="0 0 1200 300" preserveAspectRatio="none"><path d={FRONT} fill="url(#lt-c)" /></svg>
      </div>
      <div ref={heatRef} aria-hidden className="light-heat pointer-events-none fixed left-0 top-0 -z-10" />
      <div ref={fxRef} aria-hidden className="light-fx pointer-events-none fixed inset-0 z-30 overflow-hidden" />
    </>
  );
}
