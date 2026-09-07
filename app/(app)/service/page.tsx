"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  serviceKits, parts as allParts, totals,
  computeKitCosts, computePartServiceCost, SERVICE_LABOR_RATE_USD_PER_HOUR,
} from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Wrench, Search, Package, Clock, DollarSign, BookOpen, Receipt, Tag } from "lucide-react";

const catBadge = (c: string) =>
  c === "Recall"  ? "bg-[#891f24] text-white border-transparent font-semibold" :
  c === "Major"   ? "bg-[#9a3814] text-white border-transparent font-medium" :
  c === "Wear"    ? "bg-[#8a430f] text-white border-transparent font-medium" :
  c === "Repair"  ? "bg-[#175c6d] text-white border-transparent font-medium" :
                    "bg-[#275a3b] text-white border-transparent font-medium";

const money = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function ServiceBom() {
  const router = useRouter();
  const [cat, setCat] = useState<string>("ALL");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"kits" | "frus">("kits");

  // Precompute costs for every kit once
  const kitRows = useMemo(() =>
    serviceKits.map(k => ({ kit: k, costs: computeKitCosts(k) })),
  []);

  const filteredKits = useMemo(() => kitRows.filter(({ kit: k }) =>
    (cat === "ALL" || k.category === cat) &&
    (!q || k.name.toLowerCase().includes(q.toLowerCase()) || k.id.toLowerCase().includes(q.toLowerCase()))
  ), [cat, q, kitRows]);

  const frus = useMemo(() => allParts.filter(p => p.fru).map(p => ({ part: p, costs: computePartServiceCost(p.partNumber) })), []);
  const filteredFrus = useMemo(() => frus.filter(({ part: p }) =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.partNumber.toLowerCase().includes(q.toLowerCase())
  ), [frus, q]);

  const partsCoveredByKits = useMemo(() => {
    const set = new Set<string>();
    serviceKits.forEach(k => k.items.forEach(i => set.add(i.partNumber)));
    return set;
  }, []);
  const uncoveredFrus = frus.filter(({ part: p }) => !partsCoveredByKits.has(p.partNumber));

  // Cost aggregates for KPI strip
  const kitTotals = useMemo(() => {
    const parts = kitRows.reduce((s, r) => s + r.costs.partsSubtotal, 0);
    const labor = kitRows.reduce((s, r) => s + r.costs.laborCost, 0);
    const service = kitRows.reduce((s, r) => s + r.costs.serviceCost, 0);
    return { parts, labor, service };
  }, [kitRows]);

  const fruTotals = useMemo(() => {
    const replacement = frus.reduce((s, r) => s + r.costs.replacementCost, 0);
    const service = frus.reduce((s, r) => s + r.costs.serviceCost, 0);
    return { replacement, service };
  }, [frus]);

  return (
    <PageHeader
      title="Service BOM"
      subtitle={`Spare parts, service kits & field-replaceable units · labor rate ${money(SERVICE_LABOR_RATE_USD_PER_HOUR)}/hr`}
      actions={
        <>
          <Button variant="outline" size="sm" className="h-7 text-xs rounded-md gap-1.5 border-border/60 bg-card hover:bg-surface-secondary text-foreground"><BookOpen className="h-3 w-3" />Service Manual</Button>
          <Button size="sm" className="btn-primary-white h-7 text-xs rounded-md gap-1.5 font-medium"><Package className="h-3 w-3" />New Service Kit</Button>
        </>
      }
    >
      {/* KPI strip — cost-focused */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
        <div className="rounded-lg border border-border bg-card p-3 shadow-none">
          <div className="flex items-center gap-1.5">
            <Package className="h-3 w-3 text-primary" />
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Service kits</div>
          </div>
          <div className="text-base font-bold tabular-nums mt-0.5 text-foreground">{totals.serviceKits}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-none">
          <div className="flex items-center gap-1.5">
            <Wrench className="h-3 w-3 text-primary" />
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">FRUs</div>
          </div>
          <div className="text-base font-bold tabular-nums mt-0.5 text-foreground">{totals.frus}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-none">
          <div className="flex items-center gap-1.5">
            <Tag className="h-3 w-3 text-success" />
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Replacement (kits)</div>
          </div>
          <div className="text-base font-bold tabular-nums mt-0.5 text-success">{money(kitTotals.parts)}</div>
          <div className="text-[10px] text-muted-foreground">parts only · DIY</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-none">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-warning" />
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Labor (kits)</div>
          </div>
          <div className="text-base font-bold tabular-nums mt-0.5 text-warning">{money(kitTotals.labor)}</div>
          <div className="text-[10px] text-muted-foreground tabular-nums">{serviceKits.reduce((s, k) => s + k.laborHours, 0).toFixed(1)}h total</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-none">
          <div className="flex items-center gap-1.5">
            <Receipt className="h-3 w-3 text-primary" />
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Service cost (kits)</div>
          </div>
          <div className="text-base font-bold tabular-nums mt-0.5 text-primary">{money(kitTotals.service)}</div>
          <div className="text-[10px] text-muted-foreground">parts + labor · dealer</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-none">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3 w-3 text-accent" />
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">FRU replacement</div>
          </div>
          <div className="text-base font-bold tabular-nums mt-0.5 text-accent">{money(fruTotals.replacement)}</div>
          <div className="text-[10px] text-muted-foreground">all FRUs at list price</div>
        </div>
      </div>

      {/* Tabs + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-border bg-surface-secondary/40 p-0.5">
          <button
            onClick={() => setTab("kits")}
            className={cn("px-3 py-1 text-xs rounded-full transition-colors", tab === "kits" ? "bg-card text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            Service Kits
          </button>
          <button
            onClick={() => setTab("frus")}
            className={cn("px-3 py-1 text-xs rounded-full transition-colors", tab === "frus" ? "bg-card text-foreground font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground")}
          >
            Field-Replaceable Units
          </button>
        </div>
        {tab === "kits" && (
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="h-7 w-36 text-xs rounded-md border-border/60 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent className="rounded-md border-border bg-popover text-xs">
              <SelectItem value="ALL">All categories</SelectItem>
              <SelectItem value="Routine">Routine</SelectItem>
              <SelectItem value="Wear">Wear</SelectItem>
              <SelectItem value="Major">Major</SelectItem>
              <SelectItem value="Repair">Repair</SelectItem>
              <SelectItem value="Recall">Recall</SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={tab === "kits" ? "Search kits…" : "Search FRUs…"}
            className="h-7 w-60 pl-7 text-xs rounded-md border-border/60 bg-surface-secondary/30"
          />
        </div>
      </div>

      {/* Kits view */}
      {tab === "kits" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {filteredKits.map(({ kit: k, costs }) => (
            <div key={k.id} className="rounded-lg border border-border bg-card p-4 shadow-none flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-semibold leading-tight text-foreground">{k.name}</h3>
                    <Badge className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", catBadge(k.category))}>{k.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums mt-0.5">{k.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Labor</div>
                  <div className="text-xs font-semibold text-foreground tabular-nums">{k.laborHours}h</div>
                </div>
              </div>

              {/* Interval */}
              {(k.intervalKm || k.intervalMonths) && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {k.intervalKm && <span>Every {k.intervalKm.toLocaleString()} km</span>}
                  {k.intervalKm && k.intervalMonths && <span className="opacity-50">·</span>}
                  {k.intervalMonths && <span>{k.intervalMonths} mo</span>}
                </div>
              )}

              {/* Cost breakdown */}
              <div className="mt-3 rounded-md border border-border/50 bg-surface-secondary/40 p-2.5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-card p-2 border border-border/60">
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      <Tag className="h-3 w-3" />Replacement
                    </div>
                    <div className="text-sm font-bold tabular-nums text-success mt-0.5">{money(costs.partsSubtotal)}</div>
                    <div className="text-[10px] text-muted-foreground">parts · DIY</div>
                  </div>
                  <div className="rounded-md bg-card p-2 border border-border/60">
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      <Receipt className="h-3 w-3" />Service cost
                    </div>
                    <div className="text-sm font-bold tabular-nums text-primary mt-0.5">{money(costs.serviceCost)}</div>
                    <div className="text-[10px] text-muted-foreground">parts + labor</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/50">
                  <span>Labor: <span className="text-foreground font-semibold tabular-nums">{money(costs.laborCost)}</span></span>
                  <span>Save DIY: <span className="text-success font-semibold tabular-nums">{money(costs.diySavings)}</span></span>
                </div>
              </div>

              {/* Items */}
              <div className="mt-3 space-y-1.5 flex-1">
                {costs.itemBreakdown.map((it, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(`/parts/${it.partNumber}`)}
                    className="w-full flex items-center justify-between text-left rounded-md border border-border/50 px-2.5 py-1.5 hover:bg-surface-secondary/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate text-foreground">{it.name}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">{it.partNumber}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-[10px] text-muted-foreground tabular-nums">×{it.qty} @ {money(it.unitCost)}</div>
                      <div className="text-xs font-semibold tabular-nums text-foreground">{money(it.lineTotal)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FRU view */}
      {tab === "frus" && (
        <div className="rounded-lg border border-border bg-card shadow-none overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="h-8 text-[10px] uppercase tracking-wide text-muted-foreground bg-surface-secondary/40 border-b border-border/50">
              <tr>
                <th className="text-left px-3 py-2">Part Number</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-left px-3 py-2">Supplier</th>
                <th className="text-right px-3 py-2">Replacement<br/><span className="font-normal normal-case text-[9px]">parts only</span></th>
                <th className="text-right px-3 py-2">Labor</th>
                <th className="text-right px-3 py-2">Service<br/><span className="font-normal normal-case text-[9px]">parts + labor</span></th>
                <th className="text-left px-3 py-2">In Kits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredFrus.map(({ part: p, costs }) => {
                const kits = serviceKits.filter(k => k.items.some(i => i.partNumber === p.partNumber));
                return (
                  <tr key={p.partNumber} className="hover:bg-surface-secondary/50 cursor-pointer transition-colors" onClick={() => router.push(`/parts/${p.partNumber}`)}>
                    <td className="px-3 py-1.5 text-xs text-foreground tabular-nums">{p.partNumber}</td>
                    <td className="px-3 py-1.5 font-medium text-foreground">{p.name}</td>
                    <td className="px-3 py-1.5 text-muted-foreground text-xs">{p.type}</td>
                    <td className="px-3 py-1.5 text-muted-foreground text-xs tabular-nums">{p.supplierId}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-success font-semibold">{money(costs.replacementCost)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                      {money(costs.laborCost)}
                      <div className="text-[9px] opacity-70">{costs.laborHours}h</div>
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-primary font-semibold">{money(costs.serviceCost)}</td>
                    <td className="px-3 py-1.5">
                      {kits.length > 0
                        ? <div className="flex flex-wrap gap-1">{kits.map(k => <Badge key={k.id} variant="outline" className="text-[10px] px-2 py-0.2 rounded-full border-border/60 tabular-nums">{k.id}</Badge>)}</div>
                        : <Badge className="bg-[#8a430f] text-white border-transparent text-[10px] px-2 py-0.5 rounded-full font-medium">not in kit</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Coverage footer */}
      <div className="rounded-md border border-warning/30 bg-warning/5 p-3 flex items-center gap-2.5 flex-wrap">
        <Wrench className="h-3.5 w-3.5 text-warning shrink-0" />
        <span className="text-xs font-semibold text-warning uppercase tracking-wide">SERVICE COVERAGE</span>
        <span className="text-xs text-muted-foreground">
          {partsCoveredByKits.size} of {frus.length} FRUs covered by a kit · {uncoveredFrus.length} FRUs need a kit assignment
        </span>
      </div>
    </PageHeader>
  );
}
