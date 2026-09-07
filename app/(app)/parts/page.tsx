"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  parts as allParts, getPart, getWhereUsed, getChildren, suppliers as allSuppliers,
  softwareComponents, ecns, revisions, mbomOps, serviceKits, plants, products,
  type Part,
} from "@/lib/mockData";
import { useProgramContext } from "@/context/ProgramContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { AppIcon } from "@/components/ui/app-icon";
import { EnterpriseTable, type TableColumn } from "@/components/ui/enterprise-table";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const lcBadge = (lc?: string) => {
  if (lc === "In Review") return "bg-[#8a430f] text-white border-transparent font-medium";
  if (lc === "In Work")   return "bg-[#175c6d] text-white border-transparent font-medium";
  if (lc === "Obsolete")  return "bg-[#3f3f46] text-white border-transparent";
  return "bg-[#275a3b] text-white border-transparent font-medium";
};

const partsColumns = (router: ReturnType<typeof useRouter>): TableColumn<Part>[] => [
  {
    id: "partNumber",
    header: "Part Number",
    width: "w-36",
    cell: (p) => (
      <button
        type="button"
        onClick={(evt) => {
          evt.stopPropagation();
          router.push(`/parts/${encodeURIComponent(p.partNumber)}`);
        }}
        className="text-[11px] font-semibold text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded text-left"
        aria-label={`View details for ${p.partNumber}`}
      >
        {p.partNumber}
      </button>
    ),
    sortValue: (p) => p.partNumber,
  },
  {
    id: "name",
    header: "Name",
    cell: (p) => (
      <span className="font-medium text-foreground text-xs leading-normal">
        {p.name}
      </span>
    ),
    sortValue: (p) => p.name,
  },
  {
    id: "program",
    header: "Program",
    width: "w-32",
    cell: (p) => {
      const prog = products.find((pr) => pr.id === p.programId);
      return <span className="text-muted-foreground text-[10px]">{prog?.name ?? "—"}</span>;
    },
    sortValue: (p) => products.find((pr) => pr.id === p.programId)?.name ?? "",
  },
  {
    id: "type",
    header: "Type",
    width: "w-28",
    cell: (p) => (
      <span className="text-muted-foreground text-[11px]">{p.type}</span>
    ),
    sortValue: (p) => p.type,
  },
  {
    id: "rev",
    header: "Rev",
    width: "w-16",
    cell: (p) => (
      <span className="text-foreground text-[11px]">{p.revision}</span>
    ),
    sortValue: (p) => p.revision,
  },
  {
    id: "lifecycle",
    header: "Lifecycle",
    width: "w-28",
    cell: (p) => (
      <Badge className={cn("text-[9px] px-2 py-0.5 rounded-full border whitespace-nowrap font-medium", lcBadge(p.lifecycle))}>
        {p.lifecycle}
      </Badge>
    ),
    sortValue: (p) => p.lifecycle,
  },
  {
    id: "owner",
    header: "Owner",
    width: "w-28",
    cell: (p) => (
      <span className="text-foreground text-[11px]">{p.owner}</span>
    ),
    sortValue: (p) => p.owner,
  },
  {
    id: "supplier",
    header: "Supplier",
    width: "w-28",
    cell: (p) => (
      <span className="text-muted-foreground text-[11px]">{p.supplierId ?? "—"}</span>
    ),
    sortValue: (p) => p.supplierId ?? "",
  },
  {
    id: "cost",
    header: "Cost",
    width: "w-24",
    align: "right",
    cell: (p) => (
      <span className="text-[11px] tabular-nums text-foreground">
        ${p.cost.toLocaleString()}
      </span>
    ),
    sortValue: (p) => p.cost,
  },
  {
    id: "lead",
    header: "Lead",
    width: "w-20",
    align: "right",
    cell: (p) => (
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {p.leadTimeDays}d
      </span>
    ),
    sortValue: (p) => p.leadTimeDays,
  },
];

const PartList = () => {
  const router = useRouter();
  const { activeProgram } = useProgramContext();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [lcFilter, setLcFilter] = useState("ALL");
  const [programFilter, setProgramFilter] = useState(activeProgram.id);

  const columns = useMemo(() => partsColumns(router), [router]);

  const filtered = useMemo(() => allParts.filter(p =>
    (programFilter === "ALL" || p.programId === programFilter) &&
    (typeFilter === "ALL" || p.type === typeFilter) &&
    (lcFilter === "ALL" || p.lifecycle === lcFilter) &&
    (!q ||
      p.partNumber.toLowerCase().includes(q.toLowerCase()) ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      (p.supplierId ?? "").toLowerCase().includes(q.toLowerCase()))
  ), [q, typeFilter, lcFilter, programFilter]);

  const types = Array.from(new Set(allParts.map(p => p.type)));

  return (
    <PageHeader
      title="Part Master"
      subtitle={`Canonical registry · ${allParts.length} total parts across ${products.length} programs · single source of truth`}
      actions={
        <Button size="sm" className="btn-primary-white h-7 text-xs rounded-full gap-1.5 font-medium">
          <AppIcon name="parts" size="xs" />
          New Part
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <AppIcon name="search" size="xs" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by PN, name, supplier…"
            className="h-7 w-64 pl-7 text-xs rounded-full border-stroke-subtle bg-surface-secondary/30"
          />
        </div>
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="h-7 w-36 text-xs rounded-full border-stroke-subtle bg-surface-primary">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent className="rounded-full border-stroke-subtle bg-popover text-xs">
            <SelectItem value="ALL">All Programs</SelectItem>
            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-7 w-36 text-xs rounded-full border-stroke-subtle bg-surface-primary">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="rounded-full border-stroke-subtle bg-popover text-xs">
            <SelectItem value="ALL">All types</SelectItem>
            {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={lcFilter} onValueChange={setLcFilter}>
          <SelectTrigger className="h-7 w-36 text-xs rounded-full border-stroke-subtle bg-surface-primary">
            <SelectValue placeholder="Any lifecycle" />
          </SelectTrigger>
          <SelectContent className="rounded-full border-stroke-subtle bg-popover text-xs">
            <SelectItem value="ALL">Any lifecycle</SelectItem>
            <SelectItem value="In Work">In Work</SelectItem>
            <SelectItem value="In Review">In Review</SelectItem>
            <SelectItem value="Released">Released</SelectItem>
            <SelectItem value="Obsolete">Obsolete</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-auto rounded-full text-[9px] px-1.5 py-0 border-stroke-subtle">
          {filtered.length} part{filtered.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <EnterpriseTable<Part>
        rows={filtered}
        columns={columns}
        rowKey={(p) => p.partNumber}
        onRowClick={(p) => router.push(`/parts/${encodeURIComponent(p.partNumber)}`)}
        dense
        caption="Part Master"
        emptyMessage={
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
            <div className="h-8 w-8 rounded-full bg-surface-secondary/50 flex items-center justify-center text-muted-foreground">
              <AppIcon name="search" size="sm" />
            </div>
            <div className="text-xs font-medium text-foreground">No parts found</div>
            <div className="text-[11px] text-muted-foreground">
              No part matches the selected program, type, lifecycle, or search query.
            </div>
            {(programFilter !== "ALL" || typeFilter !== "ALL" || lcFilter !== "ALL" || q) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setProgramFilter("ALL");
                  setTypeFilter("ALL");
                  setLcFilter("ALL");
                  setQ("");
                }}
                className="mt-2 h-7 text-xs border-stroke-subtle"
              >
                Clear filters
              </Button>
            )}
          </div>
        }
      />
    </PageHeader>
  );
};

const PartDetail = ({ pn }: { pn: string }) => {
  const router = useRouter();
  const part = getPart(pn);
  if (!part) {
    return (
      <PageHeader title="Part not found" subtitle={`Part number ${pn} does not exist`}>
        <Button variant="outline" size="sm" onClick={() => router.push("/parts")}>
          <AppIcon name="arrowLeft" size="xs" className="mr-1" />Back to Part Master
        </Button>
      </PageHeader>
    );
  }

  const supplier = allSuppliers.find(s => s.id === part.supplierId);
  const whereUsed = getWhereUsed(pn);
  const children = getChildren(pn);
  const softOnMe = softwareComponents.filter(c => c.runsOnECU === pn);
  const affectingEcns = ecns.filter(e => e.affectedPNs.includes(pn));
  const history = revisions.filter(r => r.partNumber === pn);
  const routing = mbomOps.filter(o => o.partNumber === pn);
  const kits = serviceKits.filter(k => k.items.some(i => i.partNumber === pn));

  return (
    <PageHeader
      title={part.name}
      subtitle={`${pn} · rev ${part.revision} · ${part.type} · ${part.lifecycle}`}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => router.push("/parts")} className="h-7 text-xs rounded-full gap-1 border-stroke-subtle bg-surface-primary hover:bg-surface-secondary text-foreground">
            <AppIcon name="arrowLeft" size="xs" />All parts
          </Button>
          <Button size="sm" className="btn-primary-white h-7 text-xs rounded-full gap-1.5 font-medium"><AppIcon name="changes" size="xs" />Propose change</Button>
        </>
      }
    >
      {/* Facts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none lg:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Part Details</h3>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2.5 text-xs">
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Part Number</div><div className="font-semibold text-foreground">{part.partNumber}</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Revision</div><div className="text-foreground">{part.revision}</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Type</div><div className="text-foreground">{part.type}</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Lifecycle</div><Badge className={cn("text-[9px]  px-1 py-0 rounded-full border", lcBadge(part.lifecycle))}>{part.lifecycle}</Badge></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Owner</div><div className="text-foreground">{part.owner}</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Serviceable</div><div className="text-foreground">{part.serviceable ? "Yes" : "No"}{part.fru ? " · FRU" : ""}</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Unit cost</div><div className="tabular-nums text-foreground">${part.cost.toLocaleString()}</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Lead time</div><div className="text-foreground">{part.leadTimeDays} days</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">UoM</div><div className="text-foreground">{part.uom}</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Created</div><div className="text-muted-foreground">{part.createdAt}</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Updated</div><div className="text-muted-foreground">{part.updatedAt}</div></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Warnings</div><div className="text-foreground">{part.warnings ?? 0}</div></div>
          </div>
          {part.description && (
            <div className="mt-3 pt-2.5 border-t border-stroke-subtle text-xs text-muted-foreground leading-relaxed">{part.description}</div>
          )}
        </div>

        {supplier ? (
          <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier</h3>
            <p className="text-xs font-medium text-foreground mt-2">{supplier.name}</p>
            <p className="text-[10px] text-muted-foreground">{supplier.country} · Tier {supplier.tier}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Financial</div><div className="text-foreground">{supplier.financialRating}</div></div>
              <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Geo risk</div><div className="text-foreground">{supplier.geoRisk}</div></div>
              <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">On-time</div><div className="text-foreground">{supplier.onTimePct}%</div></div>
              <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Defect PPM</div><div className="text-foreground">{supplier.pPMDefects}</div></div>
              {supplier.singleSource && <div className="col-span-2"><Badge className="bg-[#8a430f] text-white border-transparent text-[9px] px-2 py-0.5 rounded-full font-medium">Single-source</Badge></div>}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none text-xs text-muted-foreground">No supplier assigned (in-house or TBD).</div>
        )}
      </div>

      {/* Where-used + Uses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
          <div className="flex items-center gap-1.5">
            <AppIcon name="ebom" size="sm" className="text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Where-Used (parents)</h3>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2 mt-0.5">This part is used as a child of {whereUsed.length} parent assembl{whereUsed.length === 1 ? "y" : "ies"}.</p>
          <div className="space-y-1.5">
            {whereUsed.length === 0 && <p className="text-[10px] italic text-muted-foreground">Top-level vehicle — no parents.</p>}
            {whereUsed.map((e, i) => {
              const parent = getPart(e.parentPN);
              return (
                <button key={i} onClick={() => router.push(`/parts/${e.parentPN}`)} className="w-full flex items-center justify-between rounded-lg border border-border p-2 hover:bg-surface-secondary/60 transition-colors">
                  <div className="text-left min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{parent?.name}</div>
                    <div className="text-[10px] text-muted-foreground">{e.parentPN} · qty {e.qty}{e.refDes ? ` · ${e.refDes}` : ""}</div>
                  </div>
                  <AppIcon name="externalLink" size="xs" className="opacity-50 shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
          <div className="flex items-center gap-1.5">
            <AppIcon name="parts" size="sm" className="text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Uses (children)</h3>
          </div>
          <p className="text-[10px] text-muted-foreground mb-2 mt-0.5">This part is built from {children.length} direct child part{children.length === 1 ? "" : "s"}.</p>
          <div className="space-y-1.5">
            {children.length === 0 && <p className="text-[10px] italic text-muted-foreground">Leaf part — no children.</p>}
            {children.map((e, i) => {
              const child = getPart(e.childPN);
              return (
                <button key={i} onClick={() => router.push(`/parts/${e.childPN}`)} className="w-full flex items-center justify-between rounded-lg border border-border p-2 hover:bg-surface-secondary/60 transition-colors">
                  <div className="text-left min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">{child?.name}</div>
                    <div className="text-[10px] text-muted-foreground">{e.childPN} · qty {e.qty}</div>
                  </div>
                  <AppIcon name="externalLink" size="xs" className="opacity-50 shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Extras: routing / kits / software / ECNs / history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        {routing.length > 0 && (
          <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Manufacturing Routing</h3>
            <div className="mt-2 space-y-1.5">
              {routing.map(op => {
                const plant = plants.find(p => p.id === op.plantId);
                return (
                  <div key={op.id} className="rounded-lg border border-border bg-surface-secondary/30 p-2 text-xs">
                    <div className="font-medium text-foreground">{op.operation}</div>
                    <div className="text-[10px] text-muted-foreground">{plant?.name} · {op.line} · {op.station} · {op.takeTimeSec}s</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {kits.length > 0 && (
          <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service Kits that include this part</h3>
            <div className="mt-2 flex flex-wrap gap-1">
              {kits.map(k => <Badge key={k.id} variant="outline" className="text-[9px] px-1 py-0 rounded-full border-stroke-subtle">{k.id} · {k.name}</Badge>)}
            </div>
          </div>
        )}

        {softOnMe.length > 0 && (
          <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Software running on this ECU</h3>
            <div className="mt-2 space-y-1.5">
              {softOnMe.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary/30 p-2 text-xs">
                  <div>
                    <div className="font-medium text-foreground">{s.name} <span className="text-muted-foreground text-[10px]">{s.version}</span></div>
                    <div className="text-[10px] text-muted-foreground">{s.license} · {s.supplier}</div>
                  </div>
                  {s.cves.length > 0
                    ? <Badge className="bg-[#891f24] text-white border-transparent text-[9px] px-2 py-0.5 rounded-full font-medium">{s.cves.length} CVE</Badge>
                    : <Badge className="bg-[#275a3b] text-white border-transparent text-[9px] px-2 py-0.5 rounded-full font-medium">Clean</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {affectingEcns.length > 0 && (
          <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ECNs affecting this part</h3>
            <div className="mt-2 space-y-1.5">
              {affectingEcns.map(e => (
                <button key={e.id} onClick={() => router.push(`/changes/${e.id}`)} className="w-full flex items-center justify-between rounded-lg border border-border p-2 hover:bg-surface-secondary/60 transition-colors text-left">
                  <div>
                    <div className="text-xs text-primary font-semibold">{e.id}</div>
                    <div className="text-xs font-medium text-foreground">{e.title}</div>
                  </div>
                  <Badge className={cn("text-[9px]  px-1 py-0 rounded-full border",
                    e.state === "Released" ? "bg-[#275a3b] text-white border-transparent font-medium" :
                    e.state === "Approved" ? "bg-accent/15 text-accent border-accent/30" :
                    e.state === "In Review" ? "bg-[#8a430f] text-white border-transparent font-medium" :
                    "bg-surface-secondary text-muted-foreground border-stroke-subtle")}>{e.state}</Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revision History</h3>
            <div className="mt-2.5 relative pl-4 space-y-2.5 border-l border-stroke-subtle">
              {history.map((h, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[19px] top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <div className="text-xs font-semibold text-foreground">rev {h.revision} {h.ecnId && <span className="text-primary">· {h.ecnId}</span>}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{h.note}</div>
                  <div className="text-[10px] text-muted-foreground">{h.date} · {h.by}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageHeader>
  );
};

export default function PartMasterPage() {
  const params = useParams();
  const pn = typeof params?.pn === "string" ? params.pn : Array.isArray(params?.pn) ? params?.pn[0] : undefined;
  return pn ? <PartDetail pn={pn} /> : <PartList />;
}

