import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useFlameIntensity } from "../context/AmbienceContext";
import { askQuestion } from "../services/api";
import type { QueryMode } from "../types";
import FlameLoader from "../components/flame/FlameLoader";
import { FreefallVisualization } from "../components/flame/FreefallVisualization";
import ChatInput, { ModeTabs } from "../components/chat/ChatInput";
import ChatMessageView from "../components/chat/ChatMessage";
import EmptyStateHero, { InsufficientEvidence } from "../components/chat/EmptyState";

const SCENARIO_DEFAULTS = { fuel: "PMMA", oxygen: "21", pressure: "60", gravity: "Microgravity", airflow: "Quiescent" };

export default function AssistantPage() {
  const { messages, pushMessage, filters, setEvidenceExperimentIds, loading, setLoading } = useApp();
  const [mode, setMode] = useState<QueryMode>("ask");
  const [scenario, setScenario] = useState(SCENARIO_DEFAULTS);
  const [showInsufficient, setShowInsufficient] = useState(false);
  const navigate = useNavigate();

  const send = async (text: string) => {
    const userMsg = { id: `u-${Date.now()}`, role: "user" as const, text, createdAt: Date.now() };
    pushMessage(userMsg);
    setLoading(true);
    setShowInsufficient(false);
    try {
      const effective = mode === "scenario"
        ? `Scenario: fuel ${scenario.fuel}, ${scenario.oxygen}% O2, ${scenario.pressure} kPa, ${scenario.gravity}, ${scenario.airflow}. ${text}`
        : text;
      const { message } = await askQuestion(effective, mode, filters, messages.length);
      pushMessage(message);
      setEvidenceExperimentIds(message.experimentIds ?? []);
    } catch {
      pushMessage({
        id: `e-${Date.now()}`, role: "assistant", text: "", answer: "The retrieval service failed. Please retry — your question was not answered from evidence.", strength: "Insufficient", citations: [], experimentIds: [], followUps: [], createdAt: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  const chatting = messages.length > 0;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  // The UI burns with the evidence: blazing while retrieving, then settles by evidence strength.
  const STRENGTH_I = { Strong: 0.78, Moderate: 0.55, Limited: 0.3, Insufficient: 0.06 } as const;
  const ambI = loading ? 0.95 : lastAssistant?.strength ? STRENGTH_I[lastAssistant.strength] : chatting ? 0.45 : 0.32;
  const ambLabel = loading ? "Retrieving evidence" : lastAssistant?.strength ? `${lastAssistant.strength} evidence` : "Ready";
  useFlameIntensity(ambI, ambLabel);

  return (
    <div className="animate-view-enter mx-auto flex min-h-full w-full max-w-3xl flex-col px-3 py-4 sm:px-5">
      {!chatting && <EmptyStateHero onSuggest={send} />}

      {chatting && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="opacity-80 transition-opacity"><FreefallVisualization compact /></div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-700 dark:text-slate-200">Flame in Freefall · evidence session</p>
            <p className="text-[11px] text-slate-400">{messages.length} messages · PSI-cited answers only</p>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-4" aria-live="polite">
        {messages.map((m) => (
          <ChatMessageView key={m.id} message={m} onFollowUp={send} />
        ))}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <FlameLoader />
          </div>
        )}
        {showInsufficient && (
          <InsufficientEvidence
            available={lastAssistant?.experimentIds?.length ? `${lastAssistant.experimentIds.length} related investigations` : undefined}
            missing={["O₂ below 15% at this pressure", "Repeated partial-g runs", "Airflow sweep data"]}
            onCoverage={() => navigate("/coverage")}
          />
        )}
      </div>

      <div className="sticky bottom-0 mt-4 space-y-2 border-t border-slate-200/70 bg-slate-50 pb-3 pt-3 dark:border-slate-800 dark:bg-slate-950">
        <ModeTabs mode={mode} setMode={setMode} />
        <ChatInput
          onSend={send}
          disabled={loading}
          scenarioExtra={
            mode === "scenario" ? (
              <div className="mb-2 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-50 p-2 sm:grid-cols-5 dark:bg-slate-800/50" aria-label="Scenario conditions">
                {(
                  [
                    ["fuel", ["Cotton / PMMA (solid)", "Cotton-fiberglass fabric", "Methanol droplet", "Heptane droplet", "Gaseous"]],
                    ["oxygen", ["16", "18", "21", "30", "60"]],
                    ["pressure", ["40", "60", "80", "101"]],
                    ["gravity", ["Microgravity", "Lunar-g", "Mars-g"]],
                    ["airflow", ["Quiescent", "Low forced flow", "Co-flow duct", "Spherical burner"]],
                  ] as const
                ).map(([k, opts]) => (
                  <label key={k} className="block">
                    <span className="mb-0.5 block font-mono text-[10px] uppercase text-slate-400">{k === "oxygen" ? "O₂ %" : k}</span>
                    <select
                      value={scenario[k]}
                      onChange={(e) => setScenario({ ...scenario, [k]: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[12px] dark:border-slate-700 dark:bg-slate-900"
                      aria-label={`Scenario ${k}`}
                    >
                      {opts.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </label>
                ))}
                <p className="col-span-2 text-[11px] text-slate-400 sm:col-span-5">Retrieval only — surfaces the nearest tested conditions, makes no safety prediction.</p>
              </div>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
