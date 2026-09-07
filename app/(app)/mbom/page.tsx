"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  mbomOps, plants, getPart, mbomConsumables, totals, parts as allParts,
  type MbomOp,
} from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AppIcon } from "@/components/ui/app-icon";
import { EnterpriseTable, type TableColumn } from "@/components/ui/enterprise-table";

const opStatusCls = (s: string) =>
  s === "ready"   ? "bg-[#191919] text-emerald-400 border-emerald-500/30" :
  s === "warning" ? "bg-[#191919] text-amber-400 border-amber-500/30" :
  s === "blocked" ? "bg-[#191919] text-red-400 border-red-500/30" :
                    "bg-[#191919] text-muted-foreground border-border";

const mbomColumns = (router: ReturnType<typeof useRouter>): TableColumn<MbomOp>[] => [
  {
    id: "id",
    header: "Op ID",
    width: "w-28",
    cell: (o) => <span className="text-[11px] text-foreground font-semibold">{o.id}</span>,
    sortValue: (o) => o.id,
  },
  {
    id: "produces",
    header: "Produces",
    width: "w-52",
    cell: (o) => {
      const part = getPart(o.partNumber);
      return (
        <button
          type="button"
          className="text-left hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded py-0.5"
          onClick={() => router.push(`/parts/${o.partNumber}`)}
        >
          <div className="font-semibold text-foreground truncate max-w-[200px]">{part?.name ?? o.partNumber}</div>
          <div className="text-[10px] text-muted-foreground">{o.partNumber}</div>
        </button>
      );
    },
    sortValue: (o) => getPart(o.partNumber)?.name ?? o.partNumber,
  },
  {
    id: "operation",
    header: "Operation",
    cell: (o) => <span className="text-foreground">{o.operation}</span>,
    sortValue: (o) => o.operation,
  },
  {
    id: "plant",
    header: "Plant",
    width: "w-32",
    cell: (o) => {
      const plant = plants.find((p) => p.id === o.plantId);
      return <span className="text-[11px] text-foreground">{plant?.name ?? o.plantId}</span>;
    },
    sortValue: (o) => plants.find((p) => p.id === o.plantId)?.name ?? o.plantId,
  },
  {
    id: "line",
    header: "Line",
    width: "w-24",
    cell: (o) => <span className="text-muted-foreground text-[11px]">{o.line}</span>,
    sortValue: (o) => o.line,
  },
  {
    id: "station",
    header: "Station",
    width: "w-24",
    cell: (o) => <span className="text-[11px] text-foreground">{o.station}</span>,
    sortValue: (o) => o.station,
  },
  {
    id: "takt",
    header: "Takt",
    width: "w-20",
    align: "right",
    cell: (o) => <span className="text-[11px] tabular-nums text-foreground">{o.takeTimeSec}s</span>,
    sortValue: (o) => o.takeTimeSec,
  },
  {
    id: "workInstruction",
    header: "Work Instr.",
    width: "w-32",
    cell: (o) => <span className="text-[10px] text-muted-foreground">{o.workInstructionId}</span>,
    sortValue: (o) => o.workInstructionId ?? "",
  },
  {
    id: "status",
    header: "Status",
    width: "w-24",
    cell: (o) => (
      <Badge className={cn("text-[9px] rounded-full border capitalize px-2 py-0.5 font-medium whitespace-nowrap", opStatusCls(o.status))}>
        {o.status}
      </Badge>
    ),
    sortValue: (o) => o.status,
  },
];

export default function MbomManager() {
  const router = useRouter();
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

  const columns = useMemo(() => mbomColumns(router), [router]);

  return (
    <PageHeader
      title="Manufacturing BOM"
      subtitle={`Meridian MY2026 · ${totals.mbomOps} routing operations across ${totals.plants} plants`}
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs rounded-full border-stroke-subtle bg-surface-primary hover:bg-surface-secondary text-foreground"><AppIcon name="arrowDownToLine" size="xs" />Sync from EBOM</Button>
          <Button size="sm" className="btn-primary-white gap-1.5 rounded-full h-7 text-xs font-medium"><AppIcon name="factory" size="xs" />Release to MES</Button>
        </>
      }
    >
      {/* Plant rollup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {plantRollup.map(r => (
          <div key={r.plant.id} className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <AppIcon name="factory" size="sm" className="text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{r.plant.name}</h3>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{r.plant.country} · {r.plant.capacityPerDay} units/day</p>
              </div>
              {r.issues > 0
                ? <Badge className="bg-[#8a430f] text-white border-transparent text-[9px] px-2 py-0.5 rounded-full font-medium"><AppIcon name="warning" size="xs" className="mr-1 text-white" />{r.issues} open</Badge>
                : <Badge className="bg-[#275a3b] text-white border-transparent text-[9px] px-2 py-0.5 rounded-full font-medium"><AppIcon name="checkCircle" size="xs" className="mr-1 text-white" />Ready</Badge>
              }
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-xs pt-2 border-t border-stroke-subtle">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Routing ops</div>
                <div className="font-bold tabular-nums text-foreground">{r.ops}</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Line takt</div>
                <div className="font-bold tabular-nums text-foreground">{Math.round(r.totalTaktSec / 60)} min</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Lines</div>
                <div className="font-bold tabular-nums text-foreground">{r.plant.lines.length}</div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {r.plant.lines.map(l => <Badge key={l} variant="outline" className="text-[9px] rounded-full px-1 py-0 border-stroke-subtle">{l}</Badge>)}
            </div>
          </div>
        ))}
        <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none md:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">EBOM ↔ MBOM Reconciliation</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Assemblies in EBOM that need a routing operation in MBOM</p>
            </div>
            <Badge className={cn("text-[9px] px-2 py-0.5 rounded-full border-transparent font-medium", unmapped.length ? "bg-[#8a430f] text-white" : "bg-[#275a3b] text-white")}>
              {unmapped.length ? `${unmapped.length} unmapped` : "100% mapped"}
            </Badge>
          </div>
          {unmapped.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {unmapped.slice(0, 16).map(p => (
                <button key={p.partNumber} className="text-[9px] px-2 py-0.5 rounded-full bg-[#8a430f] text-white hover:bg-[#a65315] transition-colors border-transparent font-medium" onClick={() => router.push(`/parts/${p.partNumber}`)}>
                  {p.partNumber} · {p.name}
                </button>
              ))}
              {unmapped.length > 16 && <span className="text-[9px] text-muted-foreground self-center">+{unmapped.length - 16} more</span>}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={plantFilter} onValueChange={setPlantFilter}>
          <SelectTrigger className="h-7 w-48 text-xs rounded-full border-stroke-subtle bg-surface-primary"><SelectValue placeholder="All plants" /></SelectTrigger>
          <SelectContent className="rounded-full border-stroke-subtle bg-popover">
            <SelectItem value="ALL">All plants</SelectItem>
            {plants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-7 w-36 text-xs rounded-full border-stroke-subtle bg-surface-primary"><SelectValue placeholder="All status" /></SelectTrigger>
          <SelectContent className="rounded-full border-stroke-subtle bg-popover">
            <SelectItem value="ALL">All status</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <AppIcon name="search" size="sm" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search routing by PN, station, operation…"
            className="h-7 w-72 pl-8 text-xs rounded-full border-stroke-subtle bg-surface-secondary/30"
          />
        </div>
        <Badge variant="secondary" className="ml-auto text-[9px] rounded-full border-stroke-subtle">{filteredOps.length} op{filteredOps.length === 1 ? "" : "s"}</Badge>
      </div>

      {/* Routing table */}
      <EnterpriseTable<MbomOp>
        rows={filteredOps}
        columns={columns}
        rowKey={(o) => o.id}
        emptyMessage="No routing operations match the active plant or status filter."
        minWidth="min-w-[800px]"
        caption="Manufacturing Routing Operations"
      />

      {/* Consumables / phantoms */}
      <div className="rounded-lg border border-border bg-surface-primary shadow-none p-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Consumables & Phantom Items</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Fluids, adhesives and commodity items rolled up per vehicle — not tracked in EBOM</p>
          </div>
          <AppIcon name="warning" size="sm" className="text-muted-foreground" />
        </div>
        <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
          {mbomConsumables.map(c => (
            <div key={c.code} className="rounded-lg border border-border bg-surface-secondary/30 p-2">
              <div className="text-xs font-semibold text-foreground">{c.name}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">{c.code}</div>
              <div className="mt-1 flex items-center justify-between text-[10px] pt-1 border-t border-stroke-subtle">
                <span className="text-foreground">{c.qtyPerVehicle} {c.uom}/veh</span>
                <span className="text-muted-foreground">{c.supplier}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-lg border border-border bg-surface-primary p-2.5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-success">
          <AppIcon name="checkCircle" size="sm" />
          <span>{mbomOps.filter(o => o.status === "ready").length} ready</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-warning">
          <AppIcon name="warning" size="sm" />
          <span>{mbomOps.filter(o => o.status !== "ready").length} need attention</span>
        </div>
        <AppIcon name="external" size="xs" className="ml-auto text-muted-foreground" />
        <button className="text-[10px] text-muted-foreground hover:text-foreground" onClick={() => router.push("/compare")}>Compare with EBOM →</button>
      </div>
    </PageHeader>
  );
}

