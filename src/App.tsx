import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AssistantPage from "./pages/AssistantPage";

const CoveragePage = lazy(() => import("./pages/CoveragePage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const MethodologyPage = lazy(() => import("./pages/MethodologyPage"));

export default function App() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500 dark:text-slate-400" role="status">Loading view…</div>}>
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/assistant" replace />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/coverage" element={<CoveragePage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="*" element={<Navigate to="/assistant" replace />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
