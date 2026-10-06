import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppProvider, useApp } from "../../context/AppContext";
import EvidenceTrace from "../evidence/EvidenceTrace";
import EvidencePanel from "../evidence/EvidencePanel";
import { Sidebar, TopBar } from "./Sidebar";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

function ShellInner() {
  const [navOpen, setNavOpen] = useState(false);
  const { evidenceOpen, setEvidenceOpen } = useApp();
  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <TopBar onMenu={() => setNavOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
        <main className="min-w-0 flex-1 overflow-y-auto" id="main">
          <Outlet />
        </main>
        {/* Right evidence panel: static on xl, drawer otherwise */}
        <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-slate-200 bg-slate-50/60 xl:block dark:border-slate-800 dark:bg-slate-950" aria-label="Evidence">
          <EvidencePanel />
        </aside>
      </div>
      {/* mobile/tablet evidence drawer */}
      <div className={cn("fixed inset-0 z-40 xl:hidden", evidenceOpen ? "visible" : "invisible")}>
        <div className={cn("absolute inset-0 bg-black/40 transition-opacity", evidenceOpen ? "opacity-100" : "opacity-0")} onClick={() => setEvidenceOpen(false)} aria-hidden />
        <div className={cn("absolute inset-y-0 right-0 flex w-[92vw] max-w-sm flex-col bg-white shadow-xl transition-transform dark:bg-slate-950", evidenceOpen ? "translate-x-0" : "translate-x-full")}>
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
            <span className="text-sm font-semibold">Evidence</span>
            <button onClick={() => setEvidenceOpen(false)} className="rounded-md p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close evidence panel"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto"><EvidencePanel /></div>
        </div>
      </div>
      <EvidenceTrace />
    </div>
  );
}

export default function AppShell() {
  return (
    <AppProvider>
      <ShellInner />
    </AppProvider>
  );
}
