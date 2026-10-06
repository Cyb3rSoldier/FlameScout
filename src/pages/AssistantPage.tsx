import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
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
  const [showInsufficientDemo, setShowInsufficientDemo] = useState(false);
  const navigate = useNavigate();

  const send = async (text: string) => {
    const userMsg = { id: `u-${Date.now()}`, role: "user" as const, text, createdAt: Date.now() };
    pushMessage(userMsg);
    setLoading(true);
    setShowInsufficientDemo(false);
    try {
      const effective = mode === "scenario"
        ? `Scenario: fuel ${scenario.fuel}, ${scenario.oxygen}% O2, ${scenario.pressure} kPa, ${scenario.gravity}, ${scenario.airflow}. ${text}`
        : text;
      const { message } = await askQuestion(effective, mode, filters, messages.length);
      // Scenario retrieval-not-prediction: surface matching experiments (mock filter)
      pushMessage(message);
      setEvidenceExperimentIds(message.experimentIds ?? []);
      // Demonstrate insufficient-evidence state when query probes an empty corner
      if (/13%|35 kpa|mars habitat.*30%/i.test(text)) setShowInsufficientDemo(true);
    } catch {
      pushMessage({
        id: `e-${Date.now()}`, role: "assistant", text: "", answer: "The demo evidence service failed. Please retry — your question was not answered from evidence.", strength: "Insufficient", citations: [], experimentIds: [], followUps: [], createdAt: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  const chatting = messages.length > 0;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div className="animate-view-enter mx-auto flex min-h-full w-full max-w-3xl flex-col px-3 py-4 sm:px-5">
      {!chatting && <EmptyStateHero onSuggest={send} />}

      {chatting && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="opacity-80 transition-opacity"><FreefallVisualization compact /></div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-700 dark:text-slate-200">Flame in Freefall · evidence session</p>
            <p className="text-[11px] text-slate-400">{messages.length} messages · demo evidence only</p>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-4" aria-live="polite">
        {messages.map((m) => (
          <ChatMessageView key={m.id} message={m} />
        ))}
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <FlameLoader />
          </div>
        )}
        {showInsufficientDemo && (
          <InsufficientEvidence
            available={lastAssistant?.experimentIds?.length ? `${lastAssistant.experimentIds.length} related demo experiments` : undefined}
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
                    ["fuel", ["Cellulose", "PMMA", "Polyethylene", "Cotton", "Silicone"]],
                    ["oxygen", ["16", "18", "21", "30"]],
                    ["pressure", ["40", "60", "80", "101"]],
                    ["gravity", ["Microgravity", "Reduced gravity", "Lunar-g", "Mars-g"]],
                    ["airflow", ["Quiescent", "Opposed 10 cm/s", "Concurrent 15 cm/s", "Co-flow 20 cm/s"]],
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
                <p className="col-span-2 text-[11px] text-slate-400 sm:col-span-5">Retrieval only — finds matching demo experiments, makes no safety prediction.</p>
              </div>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
