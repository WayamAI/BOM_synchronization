import { distribution } from "@/lib/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const DistributionDonut = () => {
  const total = distribution.reduce((a, b) => a + b.value, 0);
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card h-full">
      <h3 className="text-sm font-semibold">Component Distribution</h3>
      <p className="text-xs text-muted-foreground">Breakdown by type</p>
      <div className="relative mt-2 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
              {distribution.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold tabular-nums">{total}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {distribution.map(d => (
          <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: d.color }} />
            <span className="text-muted-foreground truncate">{d.name}</span>
            <span className="ml-auto font-semibold tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
