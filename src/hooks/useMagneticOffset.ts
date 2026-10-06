import { useEffect, type RefObject } from "react";

interface MagneticOptions {
  /** Element whose pointer position drives the effect. Defaults to the target's parent. */
  area?: RefObject<HTMLElement | null>;
  /** Maximum translation in px (default 35 / 25). */
  maxX?: number;
  maxY?: number;
  /** Lerp factor per frame — lower is slower/smoother (default 0.06). */
  ease?: number;
}

/**
 * Soft magnetic attraction: translates `target` toward the pointer with
 * spring-like smoothing, then settles back to rest when the pointer leaves.
 * GPU-friendly (translate3d only), zero React re-renders — all work happens
 * in a single rAF loop that stops once settled. Disabled on coarse pointers
 * and when prefers-reduced-motion is set.
 */
export function useMagneticOffset(
  target: RefObject<HTMLElement | null>,
  opts?: MagneticOptions,
) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const area = opts?.area?.current ?? el.parentElement;
    if (!area) return;

    const maxX = opts?.maxX ?? 35;
    const maxY = opts?.maxY ?? 25;
    const ease = opts?.ease ?? 0.06;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let running = false;
    let lastField = -1;

    const SETTLE = 0.05;

    /** 0 far → 1 at center: drives the faint proximity field orbit. */
    const setField = (nx: number, ny: number) => {
      const dist = Math.hypot(nx, ny);
      const p = Math.max(0, Math.min(1, 1 - dist / 1.1));
      if (Math.abs(p - lastField) > 0.04) {
        lastField = p;
        el.style.setProperty("--field", p.toFixed(2));
      }
    };

    const render = () => {
      cx += (tx - cx) * ease;
      cy += (ty - cy) * ease;
      const settledX = Math.abs(tx - cx) < SETTLE;
      const settledY = Math.abs(ty - cy) < SETTLE;
      if (settledX && settledY) {
        running = false;
        // Rest exactly at the original position — never drift.
        el.style.transform = tx === 0 && ty === 0 ? "" : `translate3d(${tx}px, ${ty}px, 0)`;
        return;
      }
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(render);
    };

    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(render);
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = area.getBoundingClientRect();
      // Generous radius so the flame feels the pointer before it arrives.
      const radiusX = Math.max(r.width / 2, 160);
      const radiusY = Math.max(r.height / 2, 140);
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / radiusX));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / radiusY));
      tx = nx * maxX;
      ty = ny * maxY;
      setField(nx, ny);
      kick();
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      setField(0, 10);
      kick();
    };

    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
    };
  }, [target, opts?.area, opts?.maxX, opts?.maxY, opts?.ease]);
}
