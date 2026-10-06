import { ArrowRight, Copy, FileSearch, ListChecks, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getEvidenceTrace } from "../../services/api";
import type { ChatMessage } from "../../types";
import { StrengthBadge } from "../ui";
import ExperimentSummary from "../evidence/ExperimentSummary";

function CitationChip({ n, code, label, onClick }: { n: number; code: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      data-citation
      className="inline-flex items-center gap-1.5 rounded-md border border-teal-600/25 bg-teal-600/[0.07] px-2 py-1 font-mono text-[11px] font-semibold text-teal-800 transition-colors hover:border-teal-600/50 hover:bg-teal-600/[0.14] dark:text-teal-200"
      title={label}
      aria-label={`Citation ${n}, ${code}: ${label}. Open in evidence workspace.`}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded bg-teal-700 font-mono text-[10px] font-bold text-white dark:bg-teal-600">{n}</span>
      {code}
    </button>
  );
}

export default function ChatMessageView({ message }: { message: ChatMessage }) {
  const { setActiveTrace, setEvidenceExperimentIds, setEvidenceOpen } = useApp();
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  if (message.role === "user") {
    return (
      <div className="flex justify-end" aria-label="Your question">
        <div className="max-w-[85%] rounded-xl rounded-br-sm border border-teal-700/30 bg-teal-700 px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-sm">
          {message.text}
        </div>
      </div>
    );
  }

  const openTrace = async () => {
    if (!message.traceId) return;
    const t = await getEvidenceTrace(message.traceId);
    setActiveTrace(t);
  };
  const viewSources = () => {
    setEvidenceExperimentIds(message.experimentIds ?? []);
    setEvidenceOpen(true);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900" aria-label="Assistant answer">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2.5 sm:px-5 dark:border-slate-800">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Answer</h3>
        {message.strength && <StrengthBadge strength={message.strength} />}
        <span className="ml-auto font-mono text-[10px] text-slate-400">demo · {message.mode}</span>
      </div>

      <div className="px-4 py-3.5 sm:px-5">
        <p className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-200">{message.answer}</p>

        {message.findings && message.findings.length > 0 && (
          <div className="mt-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Key findings</h4>
            <ul className="mt-1.5 space-y-1.5">
              {message.findings.map((f, i) => (
                <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {message.insufficient && (
          <div className="mt-3 rounded-lg border border-amber-600/30 bg-amber-500/5 p-3" role="alert">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">Not enough data</p>
            <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
              The available evidence does not cover this combination of conditions. See the Coverage Map for ranked gaps.
            </p>
          </div>
        )}

        {message.citations && message.citations.length > 0 && (
          <div className="mt-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Citations</h4>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {message.citations.map((c) => (
                <CitationChip key={c.n} n={c.n} code={c.sourceId} label={`${c.label} · ${c.page}`} onClick={viewSources} />
              ))}
            </div>
          </div>
        )}

        {message.experimentIds && message.experimentIds.length > 0 && (
          <div className="mt-3 space-y-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Supporting evidence</h4>
            {message.experimentIds.slice(0, 3).map((id, i) => (
              <ExperimentSummary
                key={id}
                id={id}
                citation={(message.citations?.length ?? 0) > i ? i + 1 : undefined}
                onSelect={(x) => { setEvidenceExperimentIds([x]); setEvidenceOpen(true); }}
              />
            ))}
          </div>
        )}

        {message.limitations && (
          <div className="mt-3 rounded-lg bg-slate-100/80 px-3 py-2.5 dark:bg-slate-800/60">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Limitations</h4>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">{message.limitations}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 px-3 py-2 sm:px-4 dark:border-slate-800">
        <button
          onClick={() => { navigator.clipboard?.writeText(message.answer ?? "").then(() => setCopied(true)).catch(() => setCopied(false)); setTimeout(() => setCopied(false), 1500); }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Copy answer"
        >
          <Copy size={13} /> {copied ? "Copied" : "Copy"}
        </button>
        <button onClick={viewSources} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label="View sources">
          <FileSearch size={13} /> View sources
        </button>
        <button onClick={openTrace} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200" aria-label="View evidence trace">
          <ListChecks size={13} /> Evidence trace
        </button>
        <span className="ml-auto flex items-center gap-1">
          <button onClick={() => setVote(vote === "up" ? null : "up")} className={`rounded-md p-1.5 ${vote === "up" ? "text-teal-600" : "text-slate-400 hover:text-slate-600"}`} aria-label="Helpful" aria-pressed={vote === "up"}><ThumbsUp size={14} /></button>
          <button onClick={() => setVote(vote === "down" ? null : "down")} className={`rounded-md p-1.5 ${vote === "down" ? "text-orange-500" : "text-slate-400 hover:text-slate-600"}`} aria-label="Not helpful" aria-pressed={vote === "down"}><ThumbsDown size={14} /></button>
        </span>
      </div>

      {message.followUps && message.followUps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-2.5 sm:px-5 dark:border-slate-800">
          {message.followUps.map((f) => (
            <span key={f} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[12px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {f} <ArrowRight size={12} aria-hidden />
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
