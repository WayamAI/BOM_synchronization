import { supplierRiskHeatmap } from "@/lib/mockData";

const severities = ["Financial", "Geopolitical", "Single-Source", "Quality", "Delivery"] as const;

const cellColor = (_sev: string, n: number) => {
  if (n === 0) return "var(--surface-raised-x2)";
  const intensity = Math.min(1, 0.2 + n * 0.18);
  return `color-mix(in srgb, var(--analytics-series-4) ${Math.round(intensity * 100)}%, transparent)`;
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
    <div className="h-full w-full self-start rounded-lg border border-hairline bg-container p-4">
      <div className="mb-4">
        <h3 className="type-eyebrow text-quaternary">Supplier Risk by Region & Category</h3>
        <p className="type-body-sm mt-1 text-tertiary">Click a cell to drill into Supplier Intelligence</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-md border border-hairline bg-raised px-3 py-2">
          <div className="type-eyebrow text-quaternary">Risk flags</div>
          <div className="type-display-lg tabular mt-1 text-foreground">{totalRisks}</div>
        </div>
        <div className="rounded-md border border-hairline bg-raised px-3 py-2">
          <div className="type-eyebrow text-quaternary">Highest region</div>
          <div className="type-body-md mt-1 truncate text-foreground">{hottestRegion.region}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-[108px_repeat(5,minmax(0,1fr))] gap-1.5 type-caption text-quaternary">
          <div />
          {severities.map(s => <div key={s} className="truncate text-center" title={s}>{s}</div>)}
        </div>

        {supplierRiskHeatmap.map(row => (
          <div key={row.region} className="grid grid-cols-[108px_repeat(5,minmax(0,1fr))] gap-1.5 items-center">
            <div className="type-body-sm truncate text-foreground">{row.region}</div>
            {severities.map(s => {
              const n = row[s];
              return (
                <div
                  key={s}
                  className="tabular grid h-8 cursor-pointer place-items-center rounded-md border border-hairline text-xs font-medium transition-colors duration-150 hover:border-strong"
                  style={{ backgroundColor: cellColor(s, n), color: n > 0 ? "var(--text-primary)" : "var(--text-quaternary)" }}
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
