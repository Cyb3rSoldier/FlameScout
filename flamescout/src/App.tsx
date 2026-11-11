import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AssistantPage from "./pages/AssistantPage";

const CoveragePage = lazy(() => import("./pages/CoveragePage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const PredictionPage = lazy(() => import("./pages/PredictionPage"));
const MethodologyPage = lazy(() => import("./pages/MethodologyPage"));
const RankPage = lazy(() => import("./pages/RankPage"));
const EarthPage = lazy(() => import("./pages/EarthPage"));
const LabPage = lazy(() => import("./pages/LabPage"));
const ControlsPage = lazy(() => import("./pages/ControlsPage"));

export default function App() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500 dark:text-slate-400" role="status">Loading view…</div>}>
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/assistant" replace />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/rank" element={<RankPage />} />
        <Route path="/coverage" element={<CoveragePage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/predict" element={<PredictionPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/earth" element={<EarthPage />} />
        <Route path="/lab" element={<LabPage />} />
        <Route path="/controls" element={<ControlsPage />} />
        <Route path="*" element={<Navigate to="/assistant" replace />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
