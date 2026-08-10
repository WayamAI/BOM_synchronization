import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  c === "Recall"  ? "bg-critical/15 text-critical border-critical/30" :
  c === "Major"   ? "bg-accent/15 text-accent border-accent/30" :
  c === "Wear"    ? "bg-warning/15 text-warning border-warning/30" :
  c === "Repair"  ? "bg-primary/15 text-primary border-primary/30" :
                    "bg-success/15 text-success border-success/30";

const money = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const ServiceBom = () => {
  const navigate = useNavigate();
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
          <Button variant="outline" size="sm" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" />Service Manual</Button>
          <Button size="sm" className="gap-1.5 bg-gradient-primary border-0"><Package className="h-3.5 w-3.5" />New Service Kit</Button>
        </>
      }
    >
      {/* KPI strip — cost-focused */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-primary" />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Service kits</div>
          </div>
          <div className="text-lg font-bold tabular-nums mt-0.5">{totals.serviceKits}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <Wrench className="h-3.5 w-3.5 text-primary" />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">FRUs</div>
          </div>
          <div className="text-lg font-bold tabular-nums mt-0.5">{totals.frus}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-success" />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Replacement (kits)</div>
          </div>
          <div className="text-lg font-bold tabular-nums mt-0.5 text-success">{money(kitTotals.parts)}</div>
          <div className="text-[10px] text-muted-foreground">parts only · DIY</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-warning" />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Labor (kits)</div>
          </div>
          <div className="text-lg font-bold tabular-nums mt-0.5 text-warning">{money(kitTotals.labor)}</div>
          <div className="text-[10px] text-muted-foreground">{serviceKits.reduce((s, k) => s + k.laborHours, 0).toFixed(1)} hrs total</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-3.5 w-3.5 text-primary" />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Service cost (kits)</div>
          </div>
          <div className="text-lg font-bold tabular-nums mt-0.5 text-primary">{money(kitTotals.service)}</div>
          <div className="text-[10px] text-muted-foreground">parts + labor · dealer</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-accent" />
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">FRU replacement</div>
          </div>
          <div className="text-lg font-bold tabular-nums mt-0.5 text-accent">{money(fruTotals.replacement)}</div>
          <div className="text-[10px] text-muted-foreground">all FRUs at list price</div>
        </div>
      </div>

      {/* Tabs + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-border bg-card p-0.5">
          <button onClick={() => setTab("kits")} className={cn("px-3 py-1 text-xs rounded transition-colors", tab === "kits" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground")}>Service Kits</button>
          <button onClick={() => setTab("frus")} className={cn("px-3 py-1 text-xs rounded transition-colors", tab === "frus" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground")}>Field-Replaceable Units</button>
        </div>
        {tab === "kits" && (
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
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
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder={tab === "kits" ? "Search kits…" : "Search FRUs…"} className="h-8 w-64 pl-8 text-xs" />
        </div>
      </div>

      {/* Kits view */}
      {tab === "kits" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredKits.map(({ kit: k, costs }) => (
            <div key={k.id} className="rounded-xl border border-border bg-card p-4 shadow-card flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold leading-tight">{k.name}</h3>
                    <Badge className={cn("text-[10px] border", catBadge(k.category))}>{k.category}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{k.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Labor</div>
                  <div className="text-xs font-semibold">{k.laborHours}h</div>
                </div>
              </div>

              {/* Interval */}
              {(k.intervalKm || k.intervalMonths) && (
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  {k.intervalKm && <span>Every {k.intervalKm.toLocaleString()} km</span>}
                  {k.intervalKm && k.intervalMonths && <span className="opacity-50">·</span>}
                  {k.intervalMonths && <span>{k.intervalMonths} months</span>}
                </div>
              )}

              {/* Cost breakdown — the new block */}
              <div className="mt-3 rounded-lg border border-border bg-muted/30 p-2.5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-card p-2 border border-border">
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <Tag className="h-2.5 w-2.5" />Replacement cost
                    </div>
                    <div className="text-base font-bold tabular-nums text-success mt-0.5">{money(costs.partsSubtotal)}</div>
                    <div className="text-[10px] text-muted-foreground">parts only · DIY</div>
                  </div>
                  <div className="rounded-md bg-card p-2 border border-border">
                    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                      <Receipt className="h-2.5 w-2.5" />Service cost
                    </div>
                    <div className="text-base font-bold tabular-nums text-primary mt-0.5">{money(costs.serviceCost)}</div>
                    <div className="text-[10px] text-muted-foreground">parts + labor · dealer</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
                  <span>Labor: <span className="text-foreground font-semibold tabular-nums">{money(costs.laborCost)}</span></span>
                  <span>Save DIY: <span className="text-success font-semibold tabular-nums">{money(costs.diySavings)}</span></span>
                </div>
              </div>

              {/* Items */}
              <div className="mt-3 space-y-1 flex-1">
                {costs.itemBreakdown.map((it, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/parts/${it.partNumber}`)}
                    className="w-full flex items-center justify-between text-left rounded-md border border-border px-2 py-1.5 hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{it.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{it.partNumber}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="text-[10px] text-muted-foreground">×{it.qty} @ {money(it.unitCost)}</div>
                      <div className="text-xs font-semibold tabular-nums">{money(it.lineTotal)}</div>
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
        <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left p-3">Part Number</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Supplier</th>
                <th className="text-right p-3">Replacement<br/><span className="font-normal normal-case text-[9px]">parts only</span></th>
                <th className="text-right p-3">Labor</th>
                <th className="text-right p-3">Service<br/><span className="font-normal normal-case text-[9px]">parts + labor</span></th>
                <th className="text-left p-3">In Kits</th>
              </tr>
            </thead>
            <tbody>
              {filteredFrus.map(({ part: p, costs }) => {
                const kits = serviceKits.filter(k => k.items.some(i => i.partNumber === p.partNumber));
                return (
                  <tr key={p.partNumber} className="border-t border-border/40 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/parts/${p.partNumber}`)}>
                    <td className="p-3 font-mono">{p.partNumber}</td>
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3 text-muted-foreground">{p.type}</td>
                    <td className="p-3 text-muted-foreground">{p.supplierId}</td>
                    <td className="p-3 text-right tabular-nums text-success font-semibold">{money(costs.replacementCost)}</td>
                    <td className="p-3 text-right tabular-nums text-muted-foreground">
                      {money(costs.laborCost)}
                      <div className="text-[9px] opacity-70">{costs.laborHours}h</div>
                    </td>
                    <td className="p-3 text-right tabular-nums text-primary font-semibold">{money(costs.serviceCost)}</td>
                    <td className="p-3">
                      {kits.length > 0
                        ? <div className="flex flex-wrap gap-1">{kits.map(k => <Badge key={k.id} variant="outline" className="text-[10px] font-mono">{k.id}</Badge>)}</div>
                        : <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px]">not in any kit</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Coverage footer */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 flex items-center gap-3 flex-wrap">
        <Wrench className="h-4 w-4 text-warning" />
        <span className="text-xs font-semibold text-warning">Service coverage</span>
        <span className="text-xs text-muted-foreground">
          {partsCoveredByKits.size} of {frus.length} FRUs covered by a kit · {uncoveredFrus.length} FRUs need a kit assignment
        </span>
      </div>
    </PageHeader>
  );
};

export default ServiceBom;
