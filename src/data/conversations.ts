import type { Conversation } from "../types";

export const CONVERSATIONS: Conversation[] = [
  { id: "c1", title: "How does oxygen affect flame behavior?", preview: "Evidence strength: Moderate · 4 experiments", updatedAt: "2m ago" },
  { id: "c2", title: "Which experiments studied low pressure?", preview: "5 experiments · 2 sources", updatedAt: "1h ago" },
  { id: "c3", title: "Show reduced gravity experiments", preview: "Limited evidence · 3 runs", updatedAt: "3h ago" },
  { id: "c4", title: "What conditions have not been tested?", preview: "Knowledge-gap analysis", updatedAt: "Yesterday" },
  { id: "c5", title: "Compare PMMA vs cellulose spread", preview: "Side-by-side · 4 experiments", updatedAt: "Yesterday" },
  { id: "c6", title: "Show flame shape at low oxygen", preview: "2 figures retrieved", updatedAt: "2d ago" },
  { id: "c7", title: "Cotton fabric concurrent flow", preview: "Moderate evidence", updatedAt: "3d ago" },
  { id: "c8", title: "Partial-g coverage check", preview: "Not enough data", updatedAt: "4d ago" },
];

export const SUGGESTED_QUESTIONS = [
  "How does oxygen concentration affect flame behavior?",
  "Which experiments studied low-pressure combustion?",
  "What conditions have not been tested?",
  "Show experiments involving reduced gravity.",
];

export const FILTER_OPTIONS: Record<string, string[]> = {
  Fuel: ["All", "Cellulose", "PMMA", "Polyethylene", "Cotton", "Silicone", "Nomex blend", "Ethylene (gas)", "Methane (gas)"],
  Oxygen: ["All", "<18%", "18–21%", ">21%"],
  Pressure: ["All", "<60 kPa", "60–90 kPa", "~101 kPa"],
  Gravity: ["All", "Microgravity", "Reduced gravity", "Lunar-g", "Mars-g", "Normal gravity"],
  Airflow: ["All", "Quiescent", "Opposed", "Concurrent", "Co-flow", "Low flow"],
};
