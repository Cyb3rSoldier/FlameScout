import type { Conversation } from "../types";

export const CONVERSATIONS: Conversation[] = [
  { id: "c1", title: "What do Saffire results tell us about large-scale fire growth?", preview: "Strong evidence · 3 investigations", updatedAt: "2m ago" },
  { id: "c2", title: "Which studies tested elevated oxygen like a Moon Base?", preview: "CFI-G line · precondition gap", updatedAt: "1h ago" },
  { id: "c3", title: "Compare BASS and BASS-II variables", preview: "Same hardware · shared duct · two eras", updatedAt: "3h ago" },
  { id: "c4", title: "What conditions have not been tested?", preview: "Coverage gaps · Moon-regime on top", updatedAt: "Yesterday" },
  { id: "c5", title: "How do smoke particle sizes differ by material?", preview: "SAME/SAME-R · detection pillar", updatedAt: "Yesterday" },
  { id: "c6", title: "Cool flame extinction in methanol droplets", preview: "FLEX Table IX · 280 runs cited", updatedAt: "2d ago" },
  { id: "c7", title: "What does E-FIELD say about mimicking partial gravity?", preview: "Electric-field analog · physics pillar", updatedAt: "3d ago" },
  { id: "c8", title: "Mission fit for a pressurized rover", preview: "Ranking view", updatedAt: "4d ago" },
];

export const SUGGESTED_QUESTIONS = [
  "What do Saffire results tell us about large-scale fire growth?",
  "Which studies tested elevated oxygen like a Moon Base would use?",
  "What conditions have not been tested?",
  "How do smoke particle sizes differ by material?",
];

export const FILTER_OPTIONS: Record<string, string[]> = {
  Fuel: ["All", "Cotton", "PMMA", "Fabric", "Droplet", "Gaseous", "Smoke/dust"],
  Oxygen: ["All", "<18%", "18–21%", ">21%", "No-O₂-records"],
  Pressure: ["All", "<60 kPa", "60–100 kPa", "≈101 kPa"],
  Gravity: ["All", "Microgravity", "Reduced gravity", "Lunar-g", "Mars-g", "Normal gravity"],
  Airflow: ["All", "Quiescent", "Opposed", "Concurrent", "Co-flow", "Low flow", "Spherical burner"],
};
