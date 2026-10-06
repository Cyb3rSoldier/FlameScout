import { ArrowUp, FlaskConical, Image, GitCompareArrows, Map, MessageCircleQuestion, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import type { Filters, QueryMode } from "../../types";
import { cn } from "../../lib/utils";

const MODES: Array<{ id: QueryMode; label: string; icon: typeof MessageCircleQuestion }> = [
  { id: "ask", label: "Ask", icon: MessageCircleQuestion },
  { id: "compare", label: "Compare", icon: GitCompareArrows },
  { id: "figure", label: "Figure", icon: Image },
  { id: "scenario", label: "Scenario", icon: FlaskConical },
  { id: "gap", label: "Gap", icon: Map },
];

export function ModeTabs({ mode, setMode }: { mode: QueryMode; setMode: (m: QueryMode) => void }) {
  return (
    <div role="group" aria-label="Research mode">
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">Research mode</p>
      <div className="inline-flex max-w-full flex-wrap gap-0.5 rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 dark:border-slate-700 dark:bg-slate-800/60">
        {MODES.map((m) => (
          <button
            key={m.id}
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors sm:px-3",
              mode === m.id
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            <m.icon size={13} aria-hidden />
            {m.label}
            {mode === m.id && <span className="h-1 w-1 rounded-full bg-teal-600 dark:bg-teal-400" aria-hidden />}
          </button>
        ))}
      </div>
    </div>
  );
}

const FILTER_KEYS: Array<keyof Filters> = ["fuel", "oxygen", "pressure", "gravity", "airflow"];

export default function ChatInput({
  onSend, disabled, scenarioExtra,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  scenarioExtra?: React.ReactNode;
}) {
  const [text, setText] = useState("");
  const { filters, setFilters } = useApp();
  const activeFilters = FILTER_KEYS.filter((k) => filters[k] !== "All");
  const submit = () => {
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors focus-within:border-teal-600/60 dark:border-slate-700 dark:bg-slate-900">
      {scenarioExtra}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-3 pt-2.5 dark:border-slate-800" aria-label="Active filters">
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Filters</span>
          {activeFilters.map((k) => (
            <button
              key={k}
              onClick={() => setFilters({ ...filters, [k]: "All" })}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label={`Clear ${k} filter (${filters[k]})`}
              title="Clear filter"
            >
              {k}: {filters[k]} <X size={11} aria-hidden />
            </button>
          ))}
        </div>
      )}
      <label htmlFor="chat-input" className="sr-only">Ask about microgravity combustion evidence</label>
      <div className="flex items-end gap-2 p-2.5">
        <textarea
          id="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          rows={2}
          placeholder="Ask about oxygen, pressure, gravity, fuels, or flame behavior…"
          className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
          disabled={disabled}
        />
        <button
          onClick={submit}
          data-magnetic
          disabled={disabled || !text.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white transition-colors hover:bg-teal-600 disabled:opacity-40"
          aria-label="Send question"
        >
          <ArrowUp size={17} />
        </button>
      </div>
      <p className="border-t border-slate-100 px-3.5 py-1.5 text-[11px] text-slate-400 dark:border-slate-800">
        Retrieval over mock records, not prediction · avoids safe/unsafe claims · Enter to send
      </p>
    </div>
  );
}
