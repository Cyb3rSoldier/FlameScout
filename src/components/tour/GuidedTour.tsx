import { useEffect, useState } from "react";
import { ArrowRight, Compass, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";

const STORAGE_KEY = "flamescout-tour-v1";
const CARD_WIDTH = 330;

/** Each step highlights the first selector that is visible on screen. */
const STEPS: Array<{ title: string; body: string; selectors: string[] }> = [
  {
    title: "Ask — answers come with evidence",
    body: "Type any research question. Every answer shows key findings, limitations, and citation chips you can open.",
    selectors: ["#chat-input"],
  },
  {
    title: "Click a citation to verify",
    body: "Citation chips open the exact source in the Evidence workspace — experiment, conditions, page and figures included.",
    selectors: ['aside[aria-label="Evidence"]', 'button[aria-label="Toggle evidence panel"]'],
  },
  {
    title: "See what science hasn't studied",
    body: "The Coverage Map shows which pressure × oxygen conditions are tested, limited — or entirely missing from the record.",
    selectors: ['a[href="/coverage"]'],
  },
];

/**
 * Lightweight 3-step first-run tour. Spotlight + card, no dependencies.
 * Auto-opens once (localStorage); restartable from the sidebar link.
 */
export default function GuidedTour() {
  const { tourOpen, setTourOpen } = useApp();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // First run: auto-open on the assistant page, once ever.
  useEffect(() => {
    if (window.location.pathname !== "/assistant") return;
    let seen = true;
    try { seen = localStorage.getItem(STORAGE_KEY) === "1"; } catch { /* private mode — never auto-open */ }
    if (seen) return;
    const t = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
      setStep(0);
      setTourOpen(true);
    }, 1400);
    return () => window.clearTimeout(t);
  }, [setTourOpen]);

  const target = STEPS[step];

  // Track the highlighted element while open. An element qualifies only when it
  // is actually visible on screen — hidden drawers (visibility:hidden) and
  // off-screen items are skipped, so the spotlight never lands on nothing.
  useEffect(() => {
    if (!tourOpen) return;
    const measure = () => {
      for (const sel of target.selectors) {
        for (const el of document.querySelectorAll(sel)) {
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          const st = getComputedStyle(el);
          if (st.visibility === "hidden" || st.display === "none") continue;
          if (r.right <= 0 || r.bottom <= 0 || r.left >= window.innerWidth || r.top >= window.innerHeight) continue;
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          return;
        }
      }
      setRect(null);
    };
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [tourOpen, step, target]);

  // Escape closes.
  useEffect(() => {
    if (!tourOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTourOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tourOpen, setTourOpen]);

  if (!tourOpen) return null;

  const close = () => { setTourOpen(false); setStep(0); };
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : close());

  // Card placement: below the target when it fits, above otherwise, centered as fallback.
  let cardStyle: React.CSSProperties;
  if (rect) {
    const left = Math.min(Math.max(rect.left + rect.width / 2 - CARD_WIDTH / 2, 12), window.innerWidth - CARD_WIDTH - 12);
    const below = rect.top + rect.height + 14;
    const top = below + 190 < window.innerHeight ? below : Math.max(rect.top - 204, 12);
    cardStyle = { position: "fixed", top, left, width: CARD_WIDTH };
  } else {
    cardStyle = { position: "fixed", top: "38%", left: "50%", transform: "translate(-50%, -50%)", width: CARD_WIDTH };
  }

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Guided tour">
      {/* Click-away closes the tour */}
      <div className="absolute inset-0" onClick={close} />
      {/* Spotlight: transparent hole + dims everything around it */}
      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-teal-400 transition-all duration-300"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: "0 0 0 9999px rgb(2 6 23 / 0.55)",
          }}
        />
      )}
      {!rect && <div className="absolute inset-0 bg-slate-950/55" />}
      <div style={cardStyle} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xl transition-all duration-300 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-2">
          <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">
            <Compass size={13} aria-hidden /> Step {step + 1} of {STEPS.length}
          </p>
          <button onClick={close} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Skip tour">
            <X size={15} />
          </button>
        </div>
        <p className="mt-2 text-[15px] font-bold text-slate-900 dark:text-white">{target.title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{target.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden>
            {STEPS.map((_, i) => (
              <span key={i} className={cn("h-1.5 w-5 rounded-full", i === step ? "bg-teal-600 dark:bg-teal-400" : "bg-slate-200 dark:bg-slate-700")} />
            ))}
          </div>
          <button
            onClick={next}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-teal-600"
          >
            {step < STEPS.length - 1 ? "Next" : "Finish"} <ArrowRight size={14} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
