import { distribution } from "@/lib/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { chartTooltipLabelStyle, chartTooltipStyle, seriesColor } from "./chartTheme";

// mockData carries its own colour strings; the Chronus series tokens are applied here by position.
export const DistributionDonut = () => {
  const total = distribution.reduce((a, b) => a + b.value, 0);
  return (
    <div className="h-full rounded-lg border border-hairline bg-container p-4">
      <h3 className="type-eyebrow text-quaternary">Component Distribution</h3>
      <p className="type-body-sm mt-1 text-tertiary">Breakdown by type</p>
      <div className="relative mt-2 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={1.5}
              stroke="var(--surface-container)"
              isAnimationActive={false}
            >
              {distribution.map((_, i) => <Cell key={i} fill={seriesColor(i)} />)}
            </Pie>
            <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartTooltipLabelStyle} itemStyle={chartTooltipLabelStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="type-body-md tabular text-foreground">{total}</div>
          <div className="type-caption text-quaternary">Total</div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {distribution.map((d, i) => (
          <div key={d.name} className="type-body-sm flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: seriesColor(i) }} />
            <span className="truncate text-tertiary">{d.name}</span>
            <span className="ml-auto tabular text-foreground">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
