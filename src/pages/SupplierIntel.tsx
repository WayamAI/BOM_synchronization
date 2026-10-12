import { EmptyState } from "@/components/ui/primitives";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { suppliers, parts as allParts, totals } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
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
  r >= 60 ? "text-critical" : r >= 35 ? "text-warning" : "text-success";

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
      title="Supplier & Risk Intelligence"
      subtitle={`${totals.suppliers} active suppliers · ${totals.singleSource} single-source parts · automated risk scoring`}
      actions={<Button size="sm" className="gap-1.5 bg-gradient-primary border-0"><Sparkles className="h-3.5 w-3.5" />Predict Disruptions</Button>}
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Active suppliers",        v: totals.suppliers,                     tone: "primary" },
          { l: "Single-source suppliers", v: totals.singleSource,                  tone: "warning" },
          { l: "On watchlist",            v: watchlistCount,                       tone: "warning" },
          { l: "High-risk disruption",    v: disruptions.length,                   tone: "danger" },
        ].map(k => (
          <div key={k.l} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{k.l}</p>
            <p className={cn("text-2xl font-bold mt-1 tabular-nums",
              k.tone === "danger" && "text-critical",
              k.tone === "warning" && "text-warning",
              k.tone === "primary" && "text-gradient-primary",
            )}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* Heatmap + AI forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><CveHeatmap /></div>
        <div className="rounded-xl border border-primary/30 bg-card p-5 shadow-card relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-primary opacity-20 blur-2xl" />
          <div className="flex items-center gap-2 relative">
            <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Disruption Forecast</h3>
              <p className="text-[10px] text-muted-foreground">{disruptions.length} high-confidence signals · next 90 days</p>
            </div>
          </div>
          <ul className="mt-3 space-y-3 text-xs relative">
            {disruptions.map((s, i) => (
              <li key={i} className="rounded-md border border-warning/30 bg-warning/5 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{s.name} · {s.country}</span>
                  <Badge className="bg-warning/20 text-warning border-warning/30 text-[10px]">{s.riskScore}%</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {s.financialRating === "B" ? "Financial pressure" : "Geopolitical exposure"} · {s.singleSource ? "single-source" : "dual-source"}
                </p>
              </li>
            ))}
            {disruptions.length === 0 && <p className="text-[11px] italic text-muted-foreground">No high-risk signals in forecast window.</p>}
          </ul>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search suppliers…" className="h-8 w-80 pl-8 text-xs" />
        </div>
        <Badge variant="secondary" className="ml-auto">{filtered.length} of {supplierRollup.length}</Badge>
      </div>

      {/* Suppliers table */}
      <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
        <table className="tabular w-full text-xs">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Supplier</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Country / Region</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Tier</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Parts</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Single-source</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Financial</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Geo risk</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">On-time</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Defects PPM</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Risk</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10}><EmptyState title="No suppliers match this search" /></td></tr>
            )}
            {filtered.map(s => (
              <tr key={s.id} className="border-t border-hairline hover:bg-raised">
                <td className="px-3 py-2 font-semibold">{s.name}</td>
                <td className="px-3 py-2 text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" />{s.country} · {s.region}</td>
                <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">T{s.tier}</Badge></td>
                <td className="px-3 py-2 text-right tabular-nums">{s.partsCount}</td>
                <td className="px-3 py-2">{s.singleSource ? <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px]">Yes</Badge> : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-3 py-2"><Badge variant="secondary" className="text-[10px] font-mono">{s.financialRating}</Badge></td>
                <td className="px-3 py-2"><Badge variant="secondary" className="text-[10px]">{s.geoRisk}</Badge></td>
                <td className="px-3 py-2 text-right tabular-nums">{s.onTimePct}%</td>
                <td className="px-3 py-2 text-right tabular-nums">{s.pPMDefects}</td>
                <td className={cn("px-3 py-2 text-right font-bold tabular-nums", riskTone(s.riskScore))}>{s.riskScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 flex-wrap">
        <span className="text-[11px] text-muted-foreground">Click any part in Part Master to see which supplier it comes from.</span>
        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
        <button className="text-[11px] text-muted-foreground hover:text-foreground" onClick={() => navigate("/parts")}>Open Part Master →</button>
      </div>
    </PageHeader>
  );
};

export default SupplierIntel;
