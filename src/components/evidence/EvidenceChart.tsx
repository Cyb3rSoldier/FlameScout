import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { OXYGEN_CHART } from "../../data/coverage";
import { Card, SectionTitle } from "../ui";

export default function EvidenceChart({ title = "Experiments by oxygen band (demo)" }: { title?: string }) {
  return (
    <Card className="p-4">
      <SectionTitle sub="Counts from demo records only">{title}</SectionTitle>
      <div className="mt-2 h-44 text-slate-500 dark:text-slate-400" role="img" aria-label="Bar chart of demo experiment counts by oxygen band">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={OXYGEN_CHART} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.25} />
            <XAxis dataKey="band" tick={{ fontSize: 10, fill: "currentColor" }} tickLine={false} axisLine={{ stroke: "currentColor", opacity: 0.3 }} />
            <YAxis tick={{ fontSize: 10, fill: "currentColor" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="experiments" fill="#0f766e" radius={[3, 3, 0, 0]} name="experiments" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
