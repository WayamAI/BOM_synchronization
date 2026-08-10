import { supplierRiskHeatmap } from "@/lib/mockData";

const severities = ["Financial", "Geopolitical", "Single-Source", "Quality", "Delivery"] as const;

const cellColor = (_sev: string, n: number) => {
  if (n === 0) return "hsl(var(--secondary))";
  const intensity = Math.min(1, 0.2 + n * 0.18);
  return `hsl(0 84% 55% / ${intensity})`;
};

export const CveHeatmap = () => {
  const totalRisks = supplierRiskHeatmap.reduce(
    (sum, row) => sum + severities.reduce((rowSum, sev) => rowSum + row[sev], 0),
    0
  );

  const hottestRegion = supplierRiskHeatmap.reduce((best, row) => {
    const score = severities.reduce((sum, sev) => sum + row[sev], 0);
    return score > best.score ? { region: row.region, score } : best;
  }, { region: supplierRiskHeatmap[0]?.region ?? "-", score: -1 });

  return (
    <div className="self-start rounded-xl border border-border bg-card p-4 shadow-card h-full w-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Supplier Risk by Region & Category</h3>
        <p className="text-xs text-muted-foreground">Click a cell to drill into Supplier Intelligence</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Risk flags</div>
          <div className="mt-1 text-lg font-semibold tabular-nums">{totalRisks}</div>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Highest region</div>
          <div className="mt-1 truncate text-sm font-semibold">{hottestRegion.region}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[108px_repeat(5,minmax(0,1fr))] gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div />
          {severities.map(s => <div key={s} className="text-center">{s}</div>)}
        </div>

        {supplierRiskHeatmap.map(row => (
          <div key={row.region} className="grid grid-cols-[108px_repeat(5,minmax(0,1fr))] gap-1.5 items-center">
            <div className="text-xs font-medium truncate">{row.region}</div>
            {severities.map(s => {
              const n = row[s];
              return (
                <div
                  key={s}
                  className="grid h-8 cursor-pointer place-items-center rounded-md border border-border/50 text-xs font-bold transition-transform hover:scale-[1.03]"
                  style={{ backgroundColor: cellColor(s, n), color: n > 0 ? "white" : "hsl(var(--muted-foreground))" }}
                  title={`${row.region} - ${s}: ${n}`}
                >
                  {n}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
