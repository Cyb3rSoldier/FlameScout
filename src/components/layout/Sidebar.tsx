import { Link, NavLink, useLocation } from "react-router-dom";
import { FlaskConical, GitBranch, LayoutGrid, MessageSquareText, Moon, Plus, Sun, X } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { CONVERSATIONS, FILTER_OPTIONS } from "../../data/conversations";
import { cn } from "../../lib/utils";
import FreefallFlame from "../flame/FreefallFlame";

const NAV = [
  { to: "/assistant", label: "Evidence Assistant", hint: "Ask · cite · verify", icon: MessageSquareText },
  { to: "/coverage", label: "Coverage Map", hint: "Studied vs untested", icon: LayoutGrid },
  { to: "/compare", label: "Experiment Compare", hint: "Side-by-side", icon: GitBranch },
  { to: "/methodology", label: "Methodology", hint: "Pipeline · trace", icon: FlaskConical },
];

const PAGE_CONTEXT: Record<string, { title: string; sub: string }> = {
  "/assistant": { title: "Evidence Assistant", sub: "Ask · retrieve · cite" },
  "/coverage": { title: "Coverage Map", sub: "Studied vs untested" },
  "/compare": { title: "Experiment Compare", sub: "Side-by-side analysis" },
  "/methodology": { title: "Methodology", sub: "Pipeline · evidence trace" },
};

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const { theme, toggleTheme, evidenceOpen, setEvidenceOpen } = useApp();
  const { pathname } = useLocation();
  const ctx = PAGE_CONTEXT[pathname] ?? PAGE_CONTEXT["/assistant"];
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex min-w-0 items-center gap-2">
        <button className="rounded-md p-2 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" onClick={onMenu} aria-label="Open navigation">
          <LayoutGrid size={18} />
        </button>
        <Link to="/assistant" className="flex shrink-0 items-center gap-2" aria-label="FlameScout home">
          <FreefallFlame size={30} glow={false} />
          <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">FlameScout</span>
        </Link>
        <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" aria-hidden />
        <div className="hidden min-w-0 sm:block" aria-live="polite">
          <p className="truncate text-[13px] font-semibold leading-tight text-slate-700 dark:text-slate-200">{ctx.title}</p>
          <p className="truncate font-mono text-[10px] leading-tight text-slate-400">{ctx.sub}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="mr-1 hidden items-center gap-1.5 font-mono text-[10px] text-slate-400 lg:inline-flex" title="Frontend runs on mock data; a backend developer will connect real APIs later">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden /> mock data
        </span>
        <button onClick={() => setEvidenceOpen(!evidenceOpen)} className="rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium hover:border-teal-600/40 xl:hidden dark:border-slate-700" aria-label="Toggle evidence panel" aria-pressed={evidenceOpen}>
          Evidence
        </button>
        <button onClick={toggleTheme} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{children}</p>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { filters, setFilters, clearMessages } = useApp();
  return (
    <>
      {open && <button className="fixed inset-0 z-30 cursor-default bg-black/30 lg:hidden" onClick={onClose} aria-label="Close navigation" tabIndex={-1} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:z-auto lg:translate-x-0 lg:visible dark:border-slate-800 dark:bg-slate-950",
          open ? "visible translate-x-0" : "invisible -translate-x-full",
        )}
        aria-label="Research workspace sidebar"
      >
        <div className="flex items-center justify-between px-3 pt-3 lg:hidden">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Menu</span>
          <button onClick={onClose} className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close navigation"><X size={16} /></button>
        </div>
        <div className="mt-1 flex-1 space-y-5 overflow-y-auto px-3 py-3">
          <section aria-label="Workspace">
            <SectionLabel>Workspace</SectionLabel>
            <nav className="mt-1.5 space-y-0.5" aria-label="Primary">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn("group flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 transition-colors",
                      isActive
                        ? "border-teal-600/20 bg-teal-600/[0.08] dark:border-teal-400/20"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/70")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <n.icon size={16} aria-hidden className={isActive ? "text-teal-700 dark:text-teal-300" : "text-slate-400 group-hover:text-slate-500"} />
                      <span className="min-w-0">
                        <span className={cn("block truncate text-[13px] font-medium", isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300")}>{n.label}</span>
                        <span className="block truncate font-mono text-[10px] text-slate-400">{n.hint}</span>
                      </span>
                      {isActive && <span className="ml-auto h-5 w-0.5 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400" aria-hidden />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </section>
          <section aria-label="Conversations">
            <SectionLabel>Conversations</SectionLabel>
            <button onClick={() => { clearMessages(); onClose(); }} data-magnetic className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-semibold text-slate-700 transition-colors hover:border-teal-600/40 hover:text-teal-800 dark:border-slate-700 dark:text-slate-200 dark:hover:text-teal-200" aria-label="Start new conversation">
              <Plus size={15} /> New conversation
            </button>
            <ul className="mt-1.5 space-y-0.5">
              {CONVERSATIONS.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <Link to="/assistant" onClick={onClose} className="block rounded-lg px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/70">
                    <p className="truncate text-[13px] font-medium text-slate-700 dark:text-slate-200">{c.title}</p>
                    <p className="truncate font-mono text-[10px] text-slate-400">{c.preview}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section aria-label="Evidence filters">
            <SectionLabel>Filters</SectionLabel>
            <div className="mt-1.5 space-y-2">
              {Object.entries(FILTER_OPTIONS).map(([k, opts]) => (
                <label key={k} className="block">
                  <span className="mb-1 block font-mono text-[11px] text-slate-500 dark:text-slate-400">{k}</span>
                  <select
                    value={(filters as unknown as Record<string, string>)[k.toLowerCase()] ?? "All"}
                    onChange={(e) => setFilters({ ...filters, [k.toLowerCase()]: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    aria-label={`${k} filter`}
                  >
                    {opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-slate-100 px-2.5 py-2 text-[11px] leading-relaxed text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              Filters narrow the mock evidence set. Wording stays within “available evidence”.
            </p>
          </section>
        </div>
      </aside>
    </>
  );
}
