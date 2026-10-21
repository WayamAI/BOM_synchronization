import { plural } from "@/lib/format";
import { EmptyState } from "@/components/ui/primitives";
import { EntityIcon } from "@/components/icons/EntityIcon";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { suppliers, parts as allParts, totals } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Panel, KpiTile } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { CveHeatmap } from "@/components/dashboard/CveHeatmap";
import { Sparkles, AlertTriangle, MapPin, Search, ExternalLink } from "lucide-react";

// Compute parts-per-supplier + single-source-per-supplier from the part master.
const supplierRollup = suppliers.map(s => {
  const parts = allParts.filter(p => p.supplierId === s.id);
  const riskScore =
    (s.financialRating === "A+" ? 5 : s.financialRating === "A" ? 15 : s.financialRating === "B+" ? 30 : s.financialRating === "B" ? 55 : 75) +
    (s.geoRisk === "Low" ? 0 : s.geoRisk === "Med" ? 15 : 40) +
    (s.singleSource ? 20 : 0) +
    Math.max(0, 100 - s.onTimePct) / 5 +
    s.pPMDefects / 10;
  return { ...s, partsCount: parts.length, riskScore: Math.round(riskScore) };
});

const riskTone = (r: number) =>
  r >= 60 ? "text-error" : r >= 35 ? "text-warning" : "text-success";

const SupplierIntel = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const filtered = useMemo(() =>
    supplierRollup.filter(s =>
      !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.country.toLowerCase().includes(q.toLowerCase()) || s.region.toLowerCase().includes(q.toLowerCase())
    ),
    [q]
  );
  const watchlistCount = supplierRollup.filter(s => s.financialRating === "B" || s.financialRating === "C" || s.geoRisk === "High").length;
  const disruptions = supplierRollup.filter(s => s.singleSource && (s.geoRisk === "High" || s.financialRating === "B"));

  return (
    <PageHeader
      title="Supplier Intelligence"
      mark="supplier"
      subtitle={`${totals.suppliers} active suppliers · ${totals.singleSource} single-source parts · automated risk scoring`}
      actions={<Button size="sm" className="gap-1.5"><Sparkles aria-hidden className="size-3.5" />Predict disruptions</Button>}
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Active suppliers",        v: totals.suppliers,                     tone: "primary" },
          { l: "Single-source suppliers", v: totals.singleSource,                  tone: "warning" },
          { l: "On watchlist",            v: watchlistCount,                       tone: "warning" },
          { l: "High-risk disruption",    v: disruptions.length,                   tone: "danger" },
        ].map(k => (
          <KpiTile
            key={k.l}
            label={k.l}
            value={k.v}
            valueClassName={k.tone === "danger" ? "text-error" : k.tone === "warning" ? "text-warning" : undefined}
          />
        ))}
      </div>

      {/* Heatmap + AI forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><CveHeatmap /></div>
        <Panel title="AI Disruption Forecast" icon="ai" action={<Sparkles className="size-3.5 text-quaternary" aria-hidden />}>
          <p className="type-body-sm text-tertiary">{plural(disruptions.length, "high-confidence signal")} · next 90 days</p>
          <ul className="mt-3 space-y-3 type-body-sm relative">
            {disruptions.map((s, i) => (
              <li key={i} className="rounded-md border border-hairline bg-warning-surface p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{s.name} · {s.country}</span>
                  <Badge variant="warning">{s.riskScore}%</Badge>
                </div>
                <p className="type-body-sm text-tertiary mt-0.5 flex items-center gap-1">
                  <AlertTriangle aria-hidden className="h-2.5 w-2.5" />
                  {s.financialRating === "B" ? "Financial pressure" : "Geopolitical exposure"} · {s.singleSource ? "single-source" : "dual-source"}
                </p>
              </li>
            ))}
            {disruptions.length === 0 && <p className="type-body-sm italic text-tertiary">No high-risk signals in forecast window.</p>}
          </ul>
        </Panel>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-tertiary" />
          <Input aria-label="Search suppliers" value={q} onChange={e => setQ(e.target.value)} placeholder="Search suppliers" className="h-8 w-80 pl-8 type-label-sm" />
        </div>
        <Badge variant="secondary" className="ml-auto">{filtered.length} of {supplierRollup.length}</Badge>
      </div>

      {/* Suppliers table */}
      <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
        <table className="tabular w-full type-body-sm">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Supplier</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Country / region</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Tier</th>
              <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">Parts</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Single-source</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Financial</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Geo risk</th>
              <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">On-time</th>
              <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">Defects PPM</th>
              <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">Risk</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10}><EmptyState title="No suppliers match this search" mark="supplier" /></td></tr>
            )}
            {filtered.map(s => (
              <tr key={s.id} className="border-t border-hairline hover:bg-raised">
                <td className="px-3 py-2 font-semibold"><span className="inline-flex items-center gap-1.5"><EntityIcon id="supplier" />{s.name}</span></td>
                <td className="px-3 py-2 text-tertiary flex items-center gap-1.5"><MapPin aria-hidden className="size-3.5" />{s.country} · {s.region}</td>
                <td className="px-3 py-2 tabular text-tertiary">T{s.tier}</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.partsCount}</td>
                <td className="px-3 py-2">{s.singleSource ? <Badge variant="warning">Yes</Badge> : <span className="text-tertiary">—</span>}</td>
                <td className="px-3 py-2 tabular text-tertiary">{s.financialRating}</td>
                <td className="px-3 py-2 text-tertiary">{s.geoRisk}</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.onTimePct}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.pPMDefects}</td>
                <td className={cn("px-3 py-2 text-right font-semibold tabular-nums", riskTone(s.riskScore))}>{s.riskScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-hairline bg-container p-3 flex items-center gap-3 flex-wrap">
        <span className="type-body-sm text-tertiary">Click any part in Part Master to see which supplier it comes from.</span>
        <ExternalLink aria-hidden className="size-3.5 ml-auto text-tertiary" />
        <button className="type-body-sm text-tertiary hover:text-foreground" onClick={() => navigate("/parts")}>Open Part Master</button>
      </div>
    </PageHeader>
  );
};

export default SupplierIntel;
