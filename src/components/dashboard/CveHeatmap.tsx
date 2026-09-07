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
    <div className="self-start rounded-lg border border-border bg-card p-4 shadow-none h-full w-full">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">Supplier Risk by Region & Category</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Click a cell to drill into Supplier Intelligence</p>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-border/50 bg-surface-secondary/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Risk flags</div>
          <div className="mt-0.5 text-base font-bold tabular-nums text-foreground">{totalRisks}</div>
        </div>
        <div className="rounded-md border border-border/50 bg-surface-secondary/40 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Highest region</div>
          <div className="mt-0.5 truncate text-xs font-semibold text-foreground">{hottestRegion.region}</div>
        </div>
      </div>

      <div className="overflow-x-auto pb-1 scrollbar-thin">
        <div className="min-w-[400px] space-y-1.5">
          <div className="grid grid-cols-[100px_repeat(5,minmax(0,1fr))] gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <div />
            {severities.map(s => <div key={s} className="text-center truncate">{s}</div>)}
          </div>

          {supplierRiskHeatmap.map(row => (
            <div key={row.region} className="grid grid-cols-[100px_repeat(5,minmax(0,1fr))] gap-1.5 items-center">
              <div className="text-xs font-medium truncate text-foreground">{row.region}</div>
              {severities.map(s => {
                const n = row[s];
                return (
                  <div
                    key={s}
                    className="grid h-7 cursor-pointer place-items-center rounded-md border border-border/40 text-xs font-semibold transition-colors hover:border-primary tabular-nums"
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
    </div>
  );
};
