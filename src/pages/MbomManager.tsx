import { EmptyState, QuietStatus } from "@/components/ui/primitives";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  mbomOps, plants, getPart, mbomConsumables, totals, parts as allParts,
} from "@/lib/mockData";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Factory, Search, AlertTriangle, CheckCircle2, ArrowDownToLine, ExternalLink } from "lucide-react";

const opStatusCls = (s: string): BadgeVariant =>
  s === "ready"   ? "success" :
  s === "warning" ? "warning" :
  s === "blocked" ? "error" :
                    "neutral";

const MbomManager = () => {
  const navigate = useNavigate();
  const [plantFilter, setPlantFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [q, setQ] = useState("");

  const filteredOps = useMemo(() => mbomOps.filter(o =>
    (plantFilter === "ALL" || o.plantId === plantFilter) &&
    (statusFilter === "ALL" || o.status === statusFilter) &&
    (!q || o.operation.toLowerCase().includes(q.toLowerCase()) || o.partNumber.toLowerCase().includes(q.toLowerCase()) || o.station.toLowerCase().includes(q.toLowerCase()))
  ), [plantFilter, statusFilter, q]);

  const ebomAssemblies = useMemo(() =>
    allParts.filter(p => p.type === "Assembly" || p.type === "Sub-Assembly"), []);
  const routedPNs = useMemo(() => new Set(mbomOps.map(o => o.partNumber)), []);
  const unmapped = useMemo(() => ebomAssemblies.filter(p => !routedPNs.has(p.partNumber)), [ebomAssemblies, routedPNs]);

  const plantRollup = useMemo(() => plants.map(p => {
    const ops = mbomOps.filter(o => o.plantId === p.id);
    const totalTakt = ops.reduce((s, o) => s + o.takeTimeSec, 0);
    const issues = ops.filter(o => o.status !== "ready").length;
    return { plant: p, ops: ops.length, totalTaktSec: totalTakt, issues };
  }), []);

  return (
    <PageHeader
      title="Manufacturing BOM"
      subtitle={`Meridian MY2026 · ${totals.mbomOps} routing operations across ${totals.plants} plants`}
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-1.5"><ArrowDownToLine className="h-3.5 w-3.5" />Sync from EBOM</Button>
          <Button size="sm" className="gap-1.5"><Factory className="h-3.5 w-3.5" />Release to MES</Button>
        </>
      }
    >
      {/* Plant rollup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {plantRollup.map(r => (
          <div key={r.plant.id} className="rounded-lg border border-hairline bg-container p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">{r.plant.name}</h3>
                </div>
                <p className="type-body-sm text-muted-foreground">{r.plant.country} · {r.plant.capacityPerDay} units/day</p>
              </div>
              {r.issues > 0
                ? <Badge variant="warning">{r.issues} open</Badge>
                : <QuietStatus tone="success">All ready</QuietStatus>
              }
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="type-eyebrow text-quaternary">Routing ops</div>
                <div className="font-semibold">{r.ops}</div>
              </div>
              <div>
                <div className="type-eyebrow text-quaternary">Line takt</div>
                <div className="font-semibold">{Math.round(r.totalTaktSec / 60)} min</div>
              </div>
              <div>
                <div className="type-eyebrow text-quaternary">Lines</div>
                <div className="font-semibold">{r.plant.lines.length}</div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {r.plant.lines.map(l => <Badge key={l} variant="outline" className="type-caption font-mono">{l}</Badge>)}
            </div>
          </div>
        ))}
        <div className="rounded-lg border border-hairline bg-container p-4 md:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="type-eyebrow text-quaternary">EBOM ↔ MBOM Reconciliation</h3>
              <p className="type-body-sm text-muted-foreground">Assemblies in EBOM that need a routing operation in MBOM</p>
            </div>
            <Badge variant={unmapped.length ? "warning" : "success"}>
              {unmapped.length ? `${unmapped.length} unmapped` : "100% mapped"}
            </Badge>
          </div>
          {unmapped.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {unmapped.slice(0, 16).map(p => (
                <button key={p.partNumber} className="type-caption font-mono px-2 py-1 rounded-md border border-hairline bg-warning-surface hover:bg-warning-surface" onClick={() => navigate(`/parts/${p.partNumber}`)}>
                  {p.partNumber} · {p.name}
                </button>
              ))}
              {unmapped.length > 16 && <span className="type-caption text-muted-foreground self-center">+{unmapped.length - 16} more</span>}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={plantFilter} onValueChange={setPlantFilter}>
          <SelectTrigger className="h-8 w-48 text-xs"><SelectValue placeholder="All plants" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All plants</SelectItem>
            {plants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search routing by PN, station, operation…"
            className="h-8 w-72 pl-8 text-xs"
          />
        </div>
        <Badge variant="secondary" className="ml-auto">{filteredOps.length} op{filteredOps.length === 1 ? "" : "s"}</Badge>
      </div>

      {/* Routing table */}
      <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
        <table className="tabular w-full text-xs">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Op ID</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Produces</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Operation</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Plant</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Line</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Station</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Takt</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Work Instr.</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOps.length === 0 && (
              <tr><td colSpan={9}><EmptyState title="No operations match this filter" /></td></tr>
            )}
            {filteredOps.map(o => {
              const plant = plants.find(p => p.id === o.plantId);
              const part = getPart(o.partNumber);
              return (
                <tr key={o.id} className="border-t border-hairline hover:bg-raised">
                  <td className="px-3 py-2 font-mono">{o.id}</td>
                  <td className="px-3 py-2">
                    <button className="text-left hover:text-primary" onClick={() => navigate(`/parts/${o.partNumber}`)}>
                      <div className="font-semibold">{part?.name ?? o.partNumber}</div>
                      <div className="font-mono type-caption text-muted-foreground">{o.partNumber}</div>
                    </button>
                  </td>
                  <td className="px-3 py-2">{o.operation}</td>
                  <td className="px-3 py-2">{plant?.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{o.line}</td>
                  <td className="px-3 py-2 font-mono">{o.station}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{o.takeTimeSec}s</td>
                  <td className="px-3 py-2 font-mono type-caption">{o.workInstructionId}</td>
                  <td className="px-3 py-2">{o.status === "ready" || o.status === "pending" ? <QuietStatus tone={o.status === "ready" ? "success" : "neutral"} className="capitalize">{o.status}</QuietStatus> : <Badge variant={opStatusCls(o.status)} className="capitalize">{o.status}</Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Consumables / phantoms */}
      <div className="rounded-lg border border-hairline bg-container p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="type-eyebrow text-quaternary">Consumables & Phantom Items</h3>
            <p className="type-body-sm text-muted-foreground">Fluids, adhesives and commodity items rolled up per vehicle — not tracked in EBOM</p>
          </div>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
          {mbomConsumables.map(c => (
            <div key={c.code} className="rounded-md border border-hairline p-2">
              <div className="text-xs font-semibold">{c.name}</div>
              <div className="type-caption text-muted-foreground font-mono">{c.code}</div>
              <div className="mt-1 flex items-center justify-between type-body-sm">
                <span>{c.qtyPerVehicle} {c.uom}/veh</span>
                <span className="text-muted-foreground">{c.supplier}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-lg border border-hairline bg-container p-3 flex items-center gap-3 flex-wrap">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="text-xs">{mbomOps.filter(o => o.status === "ready").length} ready</span>
        <AlertTriangle className="h-4 w-4 text-warning" />
        <span className="text-xs">{mbomOps.filter(o => o.status !== "ready").length} need attention</span>
        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
        <button className="type-body-sm text-muted-foreground hover:text-foreground" onClick={() => navigate("/compare")}>Compare with EBOM</button>
      </div>
    </PageHeader>
  );
};

export default MbomManager;
