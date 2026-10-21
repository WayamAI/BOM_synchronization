import { drift } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const DriftIndicator = () => {
  return (
    <div className="rounded-xl border border-hairline bg-container p-5 shadow-card h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="type-body-md font-semibold">BOM Drift</h3>
          <p className="type-body-sm text-tertiary">Sync status across stages</p>
        </div>
        <span className="flex items-center gap-1 type-caption font-semibold uppercase text-warning">
          <AlertTriangle aria-hidden className="size-3.5" /> Drift detected
        </span>
      </div>

      <div className="space-y-3 mt-4">
        {drift.map(d => (
          <div key={d.stage} className="flex items-center gap-3">
            <span className="type-body-sm font-semibold w-12">{d.stage}</span>
            <div className="flex-1 h-2 rounded-full bg-action relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-primary rounded-full"
                style={{ width: `${d.offset}%` }}
              />
              <div className="absolute top-1/2 -translate-y-1/2 size-3.5 rounded-full bg-container border-2 border-strong"
                style={{ left: `calc(${d.offset}% - 6px)` }} />
            </div>
            <span className="type-caption text-tertiary w-14 text-right tabular-nums">{d.date}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg border border-warning/40 bg-warning/5">
        <p className="type-body-sm text-foreground">
          <span className="font-semibold text-warning">SBOM is 3 days behind EBOM.</span>{" "}
          4 components changed in EBOM have not been reflected in SBOM.
        </p>
        <Button size="sm" className="mt-2 h-7 type-label-sm gap-1.5 bg-gradient-primary border-0">
          <RefreshCw aria-hidden className="size-3.5" /> Re-generate SBOM
        </Button>
      </div>
    </div>
  );
};
