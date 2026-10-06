import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ChatMessage, EvidenceTrace, Filters } from "../types";
import { EMPTY_FILTERS } from "../types";

interface AppState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  messages: ChatMessage[];
  pushMessage: (m: ChatMessage) => void;
  clearMessages: () => void;
  activeTrace: EvidenceTrace | null;
  setActiveTrace: (t: EvidenceTrace | null) => void;
  evidenceExperimentIds: string[];
  setEvidenceExperimentIds: (ids: string[]) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  evidenceOpen: boolean;
  setEvidenceOpen: (v: boolean) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark",
  );
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTrace, setActiveTrace] = useState<EvidenceTrace | null>(null);
  const [evidenceExperimentIds, setEvidenceExperimentIds] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  const pushMessage = useCallback((m: ChatMessage) => setMessages((prev) => [...prev, m]), []);
  const clearMessages = useCallback(() => {
    setMessages([]);
    setEvidenceExperimentIds([]);
  }, []);

  const value = useMemo(
    () => ({
      theme, toggleTheme, filters, setFilters, messages, pushMessage, clearMessages,
      activeTrace, setActiveTrace, evidenceExperimentIds, setEvidenceExperimentIds,
      sidebarOpen, setSidebarOpen, evidenceOpen, setEvidenceOpen, loading, setLoading,
    }),
    [theme, toggleTheme, filters, messages, pushMessage, clearMessages, activeTrace, evidenceExperimentIds, sidebarOpen, evidenceOpen, loading],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp outside provider");
  return v;
}
