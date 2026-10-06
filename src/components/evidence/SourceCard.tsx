import { BookOpen, FileImage, FlaskConical } from "lucide-react";
import { sourceById } from "../../services/api";
import { Badge } from "../ui";

export default function SourceCard({ sourceId, citation, compact = false }: { sourceId: string; citation?: number; compact?: boolean }) {
  const s = sourceById(sourceId);
  if (!s) return null;
  return (
    <article className="group rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-teal-600/40 dark:border-slate-800 dark:bg-slate-900" aria-label={`Source ${s.title}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-teal-600/10 text-teal-700 dark:text-teal-300" aria-hidden>
            {s.type.includes("Figure") ? <FileImage size={15} /> : s.type.includes("Dataset") ? <FlaskConical size={15} /> : <BookOpen size={15} />}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium leading-snug text-slate-800 dark:text-slate-100">
              {citation ? <span className="mr-1 font-mono text-teal-700 dark:text-teal-300">[{citation}]</span> : null}
              {s.title}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <Badge className="border-slate-300/60 text-slate-600 dark:border-slate-700 dark:text-slate-300">{s.type}</Badge>
              <span>{s.page}</span>
              <span aria-label={`relevance ${Math.round(s.relevance * 100)} percent`}>· {Math.round(s.relevance * 100)}% match</span>
            </p>
          </div>
        </div>
      </div>
      {!compact && (
        <p className="mt-2 border-t border-slate-100 pt-2 font-mono text-[10px] leading-relaxed text-slate-400 dark:border-slate-800">
          Demo source — placeholder, not a NASA identifier · cited as [{citation ?? "–"}] in the answer
        </p>
      )}
    </article>
  );
}
