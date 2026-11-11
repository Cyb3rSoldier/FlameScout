import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Compass, MapPin, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";

const STORAGE_KEY = "flamescout-tour-v4";
const CARD_WIDTH = 330;

/**
 * Each step navigates to the feature's page and spotlights the real UI
 * (data-tour landmarks), with the sidebar link as fallback. `where` is shown
 * only when nothing could be highlighted (e.g. the page failed to load).
 */
const STEPS: Array<{ path: string; title: string; body: string; where: string; selectors: string[] }> = [
  {
    path: "/assistant",
    title: "Ask — answers come with evidence",
    body: "Type any research question. Every answer shows key findings, limitations, and citation chips you can open.",
    where: "the composer at the bottom of the Assistant page",
    selectors: ["#chat-input"],
  },
  {
    path: "/assistant",
    title: "Click a citation to verify",
    body: "Citation chips open the exact PSI record in the Evidence workspace — investigation, conditions, hardware and figures included.",
    where: "the Evidence panel on the right, or the Evidence button in the top bar",
    selectors: ['aside[aria-label="Evidence"]', 'button[aria-label="Toggle evidence panel"]'],
  },
  {
    path: "/rank",
    title: "Mission Fit — ranked for each mission",
    body: "Pick a crewed environment — Moon Base, rover, spacesuit — and see which PSI investigations rank highest for its fire-safety needs, with an expandable score breakdown. Planned (no-data) records are listed separately as roadmap lines.",
    where: "the environment picker on the Mission Fit page (left sidebar → Mission Fit)",
    selectors: ['[data-tour="rank-env-picker"]', 'a[href="/rank"]'],
  },
  {
    path: "/coverage",
    title: "Coverage Map — studied vs untested",
    body: "Green cells are well-studied conditions; grey cells are knowledge gaps — what science hasn't tested yet. Click any cell for details.",
    where: "the heatmap on the Coverage Map page (left sidebar → Coverage Map)",
    selectors: ['[data-tour="coverage-heatmap"]', 'a[href="/coverage"]'],
  },
  {
    path: "/compare",
    title: "Compare — side by side",
    body: "Pick up to four experiments and see exactly where their conditions and outcomes differ. Differences highlight automatically.",
    where: "the experiment picker on the Compare page (left sidebar → Experiment Compare)",
    selectors: ['[data-tour="compare-picker"]', 'a[href="/compare"]'],
  },
  {
    path: "/predict",
    title: "Predict — from real FLEX tests",
    body: "Move the sliders to set fuel and atmosphere. The estimator reads real ISS droplet tests, shows a confidence range — and refuses to guess outside the tested range.",
    where: "the condition sliders on the Prediction page (left sidebar → Prediction)",
    selectors: ['[data-tour="predict-controls"]', 'a[href="/predict"]'],
  },
  {
    path: "/methodology",
    title: "Methodology — trust by design",
    body: "See how evidence is collected, retrieved and verified — every step of the pipeline is inspectable, including when the answer is “not enough data”.",
    where: "the evidence pipeline on the Methodology page (left sidebar → Methodology)",
    selectors: ['[data-tour="pipeline"]', 'a[href="/methodology"]'],
  },
];

/**
 * Guided tour: walks the user through every feature by navigating to each page
 * and spotlighting the real element with a marching-dash arrow. Auto-opens once
 * (localStorage); restartable from the sidebar link or the top-bar ? button.
 */
export default function GuidedTour() {
  const { tourOpen, setTourOpen } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardRect, setCardRect] = useState<{ top: number; left: number; right: number; bottom: number } | null>(null);
  const startPath = useRef<string | null>(null);

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

  // The tour takes the user to each feature's page, then returns them when done.
  useEffect(() => {
    if (tourOpen) {
      if (startPath.current === null) startPath.current = window.location.pathname;
      if (window.location.pathname !== target.path) navigate(target.path);
    } else if (startPath.current !== null) {
      const back = startPath.current;
      startPath.current = null;
      if (window.location.pathname !== back) navigate(back);
    }
  }, [tourOpen, target, navigate]);

  // Track the spotlighted element while open: poll until the (lazy-loaded) page
  // renders it. Elements qualify only when actually visible on screen; hidden
  // drawers and off-screen items are scrolled into view or skipped.
  useEffect(() => {
    if (!tourOpen) return;
    const scrolled = new WeakSet<Element>();
    const findAndSet = (): boolean => {
      for (const sel of target.selectors) {
        for (const el of document.querySelectorAll(sel)) {
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          const st = getComputedStyle(el);
          if (st.visibility === "hidden" || st.display === "none") continue;
          const inView = r.right > 0 && r.bottom > 0 && r.left < window.innerWidth && r.top < window.innerHeight;
          if (!inView) {
            if (!scrolled.has(el)) {
              scrolled.add(el);
              el.scrollIntoView({ block: "nearest", inline: "nearest" });
            }
            continue;
          }
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          return true;
        }
      }
      return false;
    };
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      if (findAndSet()) return;
      if (performance.now() - t0 > 4000) { setRect(null); return; } // give up → centered card + "where" hint
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("scroll", findAndSet, true);
    window.addEventListener("resize", findAndSet);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", findAndSet, true);
      window.removeEventListener("resize", findAndSet);
    };
  }, [tourOpen, step, target]);

  // Measure the card so an arrow can connect it to the spotlighted target.
  useEffect(() => {
    if (!tourOpen || !rect) return;
    const measureCard = () => {
      const el = cardRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setCardRect({ top: r.top, left: r.left, right: r.right, bottom: r.bottom });
    };
    const raf = requestAnimationFrame(measureCard);
    const t = window.setTimeout(measureCard, 350); // re-measure after the slide transition
    window.addEventListener("resize", measureCard);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      window.removeEventListener("resize", measureCard);
    };
  }, [tourOpen, rect, step]);

  // Arrow geometry: connect the card edge to the target edge (vertical, since
  // the card is always placed above or below the target).
  const arrow = useMemo(() => {
    if (!rect || !cardRect) return null;
    const targetCx = rect.left + rect.width / 2;
    const rectBottom = rect.top + rect.height;
    const below = cardRect.top >= rectBottom - 1; // card sits below the target
    const above = cardRect.bottom <= rect.top + 1; // card sits above the target
    if (!below && !above) return null;
    const y1 = below ? rectBottom : rect.top; // target edge (arrow tip)
    const y2 = below ? cardRect.top : cardRect.bottom; // card edge (line start)
    const x = Math.max(cardRect.left + 32, Math.min(targetCx, cardRect.right - 32));
    return { x, y1, y2, below };
  }, [rect, cardRect]);

  // Escape closes.
  useEffect(() => {
    if (!tourOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTourOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tourOpen, setTourOpen]);

  if (!tourOpen) return null;

  const close = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* private mode — ignore */ }
    setTourOpen(false);
    setStep(0);
  };
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
      {/* Spotlight: transparent hole + dims everything around it, with a glowing halo */}
      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-teal-400 transition-all duration-300"
          style={{
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            boxShadow: "0 0 0 9999px rgb(2 6 23 / 0.62), 0 0 0 7px rgb(45 212 191 / 0.3)",
          }}
        />
      )}
      {!rect && <div className="absolute inset-0 bg-slate-950/62" />}
      {/* Arrow: marching dashes from the card to the highlighted element */}
      {arrow && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <line
            x1={arrow.x} y1={arrow.y2}
            x2={arrow.x} y2={arrow.below ? arrow.y1 + 4 : arrow.y1 - 4}
            stroke="#2dd4bf" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="6 5" className="tour-arrow"
          />
          {arrow.below ? (
            <polygon points={`${arrow.x - 6},${arrow.y1 + 10} ${arrow.x + 6},${arrow.y1 + 10} ${arrow.x},${arrow.y1}`} fill="#2dd4bf" />
          ) : (
            <polygon points={`${arrow.x - 6},${arrow.y1 - 10} ${arrow.x + 6},${arrow.y1 - 10} ${arrow.x},${arrow.y1}`} fill="#2dd4bf" />
          )}
        </svg>
      )}
      <div ref={cardRef} style={cardStyle} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xl transition-all duration-300 dark:border-slate-700 dark:bg-slate-900">
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
        {!rect && (
          <p className="mt-2.5 inline-flex items-start gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] leading-snug text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <MapPin size={12} className="mt-0.5 shrink-0" aria-hidden /> Can't spot it? Open: {target.where}
          </p>
        )}
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
