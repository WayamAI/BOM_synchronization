import { EmptyState, KpiTile } from "@/components/ui/primitives";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  serviceKits, parts as allParts, totals,
  computeKitCosts, computePartServiceCost, SERVICE_LABOR_RATE_USD_PER_HOUR,
} from "@/lib/mockData";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Wrench, Search, Package, BookOpen, Receipt, Tag } from "lucide-react";

const catBadge = (c: string): BadgeVariant =>
  c === "Recall"  ? "error" :
  c === "Major"   ? "info" :
  c === "Wear"    ? "warning" :
  c === "Repair"  ? "info" :
                    "success";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

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
          <Button variant="outline" size="sm" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" />Service manual</Button>
          <Button size="sm" className="gap-1.5"><Package className="h-3.5 w-3.5" />New service kit</Button>
        </>
      }
    >
      {/* KPI strip, cost-focused */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiTile label="Service kits" value={totals.serviceKits} />
        <KpiTile label="FRUs" value={totals.frus} />
        <KpiTile label="Replacement (kits)" value={money(kitTotals.parts)} hint="parts only · DIY" />
        <KpiTile label="Labor (kits)" value={money(kitTotals.labor)} hint={`${serviceKits.reduce((s, k) => s + k.laborHours, 0).toFixed(1)} hrs total`} />
        <KpiTile label="Service cost (kits)" value={money(kitTotals.service)} hint="parts + labor · dealer" />
        <KpiTile label="FRU replacement" value={money(fruTotals.replacement)} hint="all FRUs at list price" />
      </div>

      {/* Tabs + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex gap-1.5">
          <button onClick={() => setTab("kits")} aria-pressed={tab === "kits"} className={cn("rounded-full border px-3 py-1 text-xs font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-active", tab === "kits" ? "border-transparent bg-action-primary text-on-color" : "border-hairline bg-action text-tertiary hover:border-strong hover:bg-raised-2 hover:text-secondary-foreground")}>Service Kits</button>
          <button onClick={() => setTab("frus")} aria-pressed={tab === "frus"} className={cn("rounded-full border px-3 py-1 text-xs font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-active", tab === "frus" ? "border-transparent bg-action-primary text-on-color" : "border-hairline bg-action text-tertiary hover:border-strong hover:bg-raised-2 hover:text-secondary-foreground")}>Field-Replaceable Units</button>
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
            <div key={k.id} className="rounded-lg border border-hairline bg-container p-4 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold leading-tight">{k.name}</h3>
                    {catBadge(k.category) === "success" ? <span className="type-body-sm text-tertiary">{k.category}</span> : <Badge variant={catBadge(k.category)}>{k.category}</Badge>}
                  </div>
                  <p className="type-body-sm text-muted-foreground font-mono mt-0.5">{k.id}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="type-eyebrow text-quaternary">Labor</div>
                  <div className="text-xs font-semibold">{k.laborHours}h</div>
                </div>
              </div>

              {/* Interval */}
              {(k.intervalKm || k.intervalMonths) && (
                <div className="mt-1.5 flex items-center gap-2 type-caption text-muted-foreground">
                  {k.intervalKm && <span>Every {k.intervalKm.toLocaleString("en-US")} km</span>}
                  {k.intervalKm && k.intervalMonths && <span className="opacity-50">·</span>}
                  {k.intervalMonths && <span>{k.intervalMonths} months</span>}
                </div>
              )}

              {/* Cost breakdown — the new block */}
              <div className="mt-3 rounded-lg border border-hairline bg-raised p-2.5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-container p-2 border border-hairline">
                    <div className="type-eyebrow text-quaternary flex items-center gap-1">
                      <Tag className="h-2.5 w-2.5" />Replacement cost
                    </div>
                    <div className="text-base font-semibold tabular-nums text-success mt-0.5">{money(costs.partsSubtotal)}</div>
                    <div className="type-caption text-muted-foreground">parts only · DIY</div>
                  </div>
                  <div className="rounded-md bg-container p-2 border border-hairline">
                    <div className="type-eyebrow text-quaternary flex items-center gap-1">
                      <Receipt className="h-2.5 w-2.5" />Service cost
                    </div>
                    <div className="text-base font-semibold tabular-nums text-primary mt-0.5">{money(costs.serviceCost)}</div>
                    <div className="type-caption text-muted-foreground">parts + labor · dealer</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between type-caption text-muted-foreground pt-2 border-t border-hairline">
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
                    className="w-full flex items-center justify-between text-left rounded-md border border-hairline px-2 py-1.5 hover:bg-raised"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{it.name}</div>
                      <div className="type-caption font-mono text-muted-foreground">{it.partNumber}</div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="type-caption text-muted-foreground">×{it.qty} @ {money(it.unitCost)}</div>
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
        <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
          <table className="tabular w-full text-xs">
            <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
              <tr>
                <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Part Number</th>
                <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Name</th>
                <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Type</th>
                <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Supplier</th>
                <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Replacement<br/><span className="font-normal normal-case type-caption">parts only</span></th>
                <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Labor</th>
                <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Service<br/><span className="font-normal normal-case type-caption">parts + labor</span></th>
                <th className="text-left px-3 py-2 font-medium whitespace-nowrap">In Kits</th>
              </tr>
            </thead>
            <tbody>
              {filteredFrus.length === 0 && (
                <tr><td colSpan={8}><EmptyState title="No FRUs match this filter" /></td></tr>
              )}
              {filteredFrus.map(({ part: p, costs }) => {
                const kits = serviceKits.filter(k => k.items.some(i => i.partNumber === p.partNumber));
                return (
                  <tr key={p.partNumber} className="border-t border-hairline hover:bg-raised cursor-pointer" onClick={() => navigate(`/parts/${p.partNumber}`)}>
                    <td className="px-3 py-2 font-mono">{p.partNumber}</td>
                    <td className="px-3 py-2 font-semibold">{p.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.type}</td>
                    <td className="px-3 py-2 text-muted-foreground">{p.supplierId}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-success font-semibold">{money(costs.replacementCost)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                      {money(costs.laborCost)}
                      <div className="type-caption opacity-70">{costs.laborHours}h</div>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-primary font-semibold">{money(costs.serviceCost)}</td>
                    <td className="px-3 py-2">
                      {kits.length > 0
                        ? <div className="flex flex-wrap gap-1">{kits.map(k => <Badge key={k.id} variant="outline" className="type-caption font-mono">{k.id}</Badge>)}</div>
                        : <Badge variant="warning">not in any kit</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Coverage footer */}
      <div className="rounded-lg border border-hairline bg-warning-surface p-3 flex items-center gap-3 flex-wrap">
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
