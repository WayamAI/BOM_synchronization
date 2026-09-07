"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { suppliers, parts as allParts, totals, type Supplier } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppIcon } from "@/components/ui/app-icon";
import { Mark } from "@/components/ui/mark";
import { EnterpriseTable, type TableColumn } from "@/components/ui/enterprise-table";
import { cn } from "@/lib/utils";
import { CveHeatmap } from "@/components/dashboard/CveHeatmap";

type SupplierRow = Supplier & {
  partsCount: number;
  riskScore: number;
};

// Compute parts-per-supplier + single-source-per-supplier from the part master.
const supplierRollup: SupplierRow[] = suppliers.map(s => {
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
  r >= 60 ? "text-red-400" : r >= 35 ? "text-amber-400" : "text-emerald-400";

const supplierColumns: TableColumn<SupplierRow>[] = [
  {
    id: "supplier",
    header: "Supplier",
    width: "w-48",
    cell: (s) => (
      <span className="font-medium text-foreground text-xs leading-normal">{s.name}</span>
    ),
    sortValue: (s) => s.name,
  },
  {
    id: "countryRegion",
    header: "Country / Region",
    width: "w-52",
    cell: (s) => (
      <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
        <AppIcon name="mapPin" className="h-3 w-3 shrink-0" />
        {s.country} · {s.region}
      </span>
    ),
    sortValue: (s) => `${s.country} ${s.region}`,
  },
  {
    id: "tier",
    header: "Tier",
    width: "w-20",
    cell: (s) => (
      <Badge variant="outline" className="text-[9px] px-2 py-0.5 rounded-full border-border">
        T{s.tier}
      </Badge>
    ),
    sortValue: (s) => s.tier,
  },
  {
    id: "parts",
    header: "Parts",
    width: "w-20",
    align: "right",
    cell: (s) => (
      <span className="text-right tabular-nums text-foreground text-xs">
        {s.partsCount}
      </span>
    ),
    sortValue: (s) => s.partsCount,
  },
  {
    id: "singleSource",
    header: "Single-source",
    width: "w-28",
    cell: (s) => (
      s.singleSource ? (
        <Badge className="bg-[#8a430f] text-white border-transparent text-[9px] px-2 py-0.5 rounded-full font-medium">
          Yes
        </Badge>
      ) : (
        <span className="text-muted-foreground text-[11px]">—</span>
      )
    ),
    sortValue: (s) => (s.singleSource ? 1 : 0),
  },
  {
    id: "financial",
    header: "Financial",
    width: "w-24",
    cell: (s) => (
      <Badge variant="secondary" className="text-[9px] px-2 py-0.5 rounded-full border-border">
        {s.financialRating}
      </Badge>
    ),
    sortValue: (s) => s.financialRating,
  },
  {
    id: "geoRisk",
    header: "Geo risk",
    width: "w-24",
    cell: (s) => (
      <Badge variant="secondary" className="text-[9px] px-1 py-0 rounded-full border-stroke-subtle">
        {s.geoRisk}
      </Badge>
    ),
    sortValue: (s) => s.geoRisk,
  },
  {
    id: "onTime",
    header: "On-time",
    width: "w-24",
    align: "right",
    cell: (s) => (
      <span className="text-right tabular-nums text-foreground text-xs">
        {s.onTimePct}%
      </span>
    ),
    sortValue: (s) => s.onTimePct,
  },
  {
    id: "defects",
    header: "Defects PPM",
    width: "w-28",
    align: "right",
    cell: (s) => (
      <span className="text-right tabular-nums text-foreground text-xs">
        {s.pPMDefects}
      </span>
    ),
    sortValue: (s) => s.pPMDefects,
  },
  {
    id: "risk",
    header: "Risk",
    width: "w-20",
    align: "right",
    cell: (s) => (
      <span className={cn("text-right font-bold tabular-nums text-xs", riskTone(s.riskScore))}>
        {s.riskScore}
      </span>
    ),
    sortValue: (s) => s.riskScore,
  },
];

export default function SupplierIntelPage() {
  const router = useRouter();
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
      actions={
        <Button size="sm" className="btn-primary-white h-7 text-xs rounded-full gap-1.5 font-medium">
          <Mark id="mark-insight" size={14} />
          Predict Disruptions
        </Button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { l: "Active suppliers",        v: totals.suppliers,        tone: "primary" },
          { l: "Single-source suppliers", v: totals.singleSource,     tone: "warning" },
          { l: "On watchlist",            v: watchlistCount,          tone: "warning" },
          { l: "High-risk disruption",    v: disruptions.length,      tone: "danger" },
        ].map(k => (
          <div key={k.l} className="rounded-lg border border-border bg-surface-primary p-2.5 shadow-none">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{k.l}</p>
            <p className={cn("text-base  font-bold mt-0.5 tabular-nums",
              k.tone === "danger" && "text-critical",
              k.tone === "warning" && "text-warning",
              k.tone === "primary" && "text-foreground",
            )}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* Heatmap + AI forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="lg:col-span-2"><CveHeatmap /></div>
        <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none flex flex-col">
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-6 rounded-full bg-surface-secondary text-primary border border-border/60 grid place-items-center">
              <Mark id="mark-insight" size={14} />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Disruption Forecast</h3>
              <p className="text-[10px] text-muted-foreground">{disruptions.length} high-confidence signals · next 90 days</p>
            </div>
          </div>
          <ul className="mt-2.5 space-y-2 text-xs flex-1">
            {disruptions.map((s, i) => (
              <li key={i} className="rounded-md border border-border/60 bg-surface-secondary/40 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-xs">{s.name} · {s.country}</span>
                  <Badge className="bg-[#8a430f] text-white border-transparent text-[9px] px-2 py-0.5 rounded-full font-medium">{s.riskScore}%</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <AppIcon name="warning" className="h-2.5 w-2.5 text-warning shrink-0" />
                  {s.financialRating === "B" ? "Financial pressure" : "Geopolitical exposure"} · {s.singleSource ? "single-source" : "dual-source"}
                </p>
              </li>
            ))}
            {disruptions.length === 0 && <p className="text-[10px] italic text-muted-foreground">No high-risk signals in forecast window.</p>}
          </ul>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <AppIcon name="search" size="xs" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search suppliers…" className="h-7 w-64 pl-7 text-xs rounded-full border-stroke-subtle bg-surface-secondary/30" />
        </div>
        <Badge variant="secondary" className="ml-auto rounded-full text-[9px] px-1.5 py-0 border-stroke-subtle">{filtered.length} of {supplierRollup.length}</Badge>
      </div>

      {/* Modernized Enterprise Table */}
      <EnterpriseTable<SupplierRow>
        rows={filtered}
        columns={supplierColumns}
        rowKey={(s) => s.id}
        dense
        caption="Suppliers & Risk Intelligence"
        minWidth="min-w-[850px]"
        emptyMessage={
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
            <div className="h-8 w-8 rounded-full bg-surface-secondary/50 flex items-center justify-center text-muted-foreground">
              <AppIcon name="search" size="sm" />
            </div>
            <div className="text-xs font-medium text-foreground">No suppliers found</div>
            <div className="text-[11px] text-muted-foreground">
              No supplier matches "{q}".
            </div>
            {q && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQ("")}
                className="mt-2 h-7 text-xs border-stroke-subtle"
              >
                Clear search
              </Button>
            )}
          </div>
        }
      />

      <div className="rounded-full border border-border bg-card p-2.5 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground">Click any part in Part Master to see which supplier it comes from.</span>
        <AppIcon name="externalLink" className="h-3 w-3 ml-auto text-muted-foreground opacity-60" />
        <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors" onClick={() => router.push("/parts")}>Open Part Master →</button>
      </div>
    </PageHeader>
  );
}

