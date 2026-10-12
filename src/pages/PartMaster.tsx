import { EmptyState } from "@/components/ui/primitives";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  parts as allParts, getPart, getWhereUsed, getChildren, suppliers as allSuppliers,
  softwareComponents, ecns, revisions, mbomOps, serviceKits, plants, products,
} from "@/lib/mockData";
import { useProgramContext } from "@/context/ProgramContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, ArrowLeft, GitBranch, Boxes, ExternalLink, FileEdit } from "lucide-react";

const lcBadge = (lc?: string) => {
  if (lc === "In Review") return "bg-warning/15 text-warning border-warning/30";
  if (lc === "In Work")   return "bg-primary/15 text-primary border-primary/30";
  if (lc === "Obsolete")  return "bg-muted text-muted-foreground";
  return "bg-success/15 text-success border-success/30";
};

const PartList = () => {
  const navigate = useNavigate();
  const { activeProgram } = useProgramContext();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [lcFilter, setLcFilter] = useState("ALL");
  const [programFilter, setProgramFilter] = useState(activeProgram.id);

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
      actions={<Button size="sm" className="gap-1.5 bg-gradient-primary border-0"><Boxes className="h-3.5 w-3.5" />New Part</Button>}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by PN, name, supplier…" className="h-8 w-80 pl-8 text-xs" />
        </div>
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Programs</SelectItem>
            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={lcFilter} onValueChange={setLcFilter}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any lifecycle</SelectItem>
            <SelectItem value="In Work">In Work</SelectItem>
            <SelectItem value="In Review">In Review</SelectItem>
            <SelectItem value="Released">Released</SelectItem>
            <SelectItem value="Obsolete">Obsolete</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-auto">{filtered.length} part{filtered.length === 1 ? "" : "s"}</Badge>
      </div>

      <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
        <table className="tabular w-full text-xs">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Part Number</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Name</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Program</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Type</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Rev</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Lifecycle</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Owner</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Supplier</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Cost</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Lead</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10}><EmptyState title="No parts match this filter" /></td></tr>
            )}
            {filtered.map(p => {
              const prog = products.find(pr => pr.id === p.programId);
              return (
                <tr key={p.partNumber} onClick={() => navigate(`/parts/${p.partNumber}`)} className="border-t border-hairline hover:bg-raised cursor-pointer">
                  <td className="px-3 py-2 font-mono">{p.partNumber}</td>
                  <td className="px-3 py-2 font-semibold">{p.name}</td>
                  <td className="px-3 py-2 text-muted-foreground text-[11px]">{prog?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.type}</td>
                  <td className="px-3 py-2 font-mono">{p.revision}</td>
                  <td className="px-3 py-2"><Badge className={cn("text-[10px] border", lcBadge(p.lifecycle))}>{p.lifecycle}</Badge></td>
                  <td className="px-3 py-2">{p.owner}</td>
                  <td className="px-3 py-2 text-muted-foreground">{p.supplierId ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">${p.cost.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.leadTimeDays}d</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageHeader>
  );
};

const PartDetail = ({ pn }: { pn: string }) => {
  const navigate = useNavigate();
  const part = getPart(pn);
  if (!part) {
    return (
      <PageHeader title="Part not found" subtitle={`Part number ${pn} does not exist`}>
        <Button variant="outline" size="sm" onClick={() => navigate("/parts")}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />Back to Part Master
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
          <Button variant="outline" size="sm" onClick={() => navigate("/parts")}>
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />All parts
          </Button>
          <Button size="sm" className="gap-1.5 bg-gradient-primary border-0"><FileEdit className="h-3.5 w-3.5" />Propose change</Button>
        </>
      }
    >
      {/* Facts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <h3 className="text-sm font-semibold">Part Details</h3>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 text-xs">
            <div><div className="text-[10px] uppercase text-muted-foreground">Part Number</div><div className="font-mono font-semibold">{part.partNumber}</div></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Revision</div><div className="font-mono">{part.revision}</div></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Type</div><div>{part.type}</div></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Lifecycle</div><Badge className={cn("text-[10px] border", lcBadge(part.lifecycle))}>{part.lifecycle}</Badge></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Owner</div><div>{part.owner}</div></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Serviceable</div><div>{part.serviceable ? "Yes" : "No"}{part.fru ? " · FRU" : ""}</div></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Unit cost</div><div className="tabular-nums">${part.cost.toLocaleString()}</div></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Lead time</div><div>{part.leadTimeDays} days</div></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">UoM</div><div>{part.uom}</div></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Created</div><div>{part.createdAt}</div></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Updated</div><div>{part.updatedAt}</div></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Warnings</div><div>{part.warnings ?? 0}</div></div>
          </div>
          {part.description && (
            <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground leading-relaxed">{part.description}</div>
          )}
        </div>

        {supplier ? (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold">Supplier</h3>
            <p className="text-sm font-semibold mt-2">{supplier.name}</p>
            <p className="text-[11px] text-muted-foreground">{supplier.country} · Tier {supplier.tier}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div><div className="text-[10px] uppercase text-muted-foreground">Financial</div><div>{supplier.financialRating}</div></div>
              <div><div className="text-[10px] uppercase text-muted-foreground">Geo risk</div><div>{supplier.geoRisk}</div></div>
              <div><div className="text-[10px] uppercase text-muted-foreground">On-time</div><div>{supplier.onTimePct}%</div></div>
              <div><div className="text-[10px] uppercase text-muted-foreground">Defect PPM</div><div>{supplier.pPMDefects}</div></div>
              {supplier.singleSource && <div className="col-span-2"><Badge className="bg-warning/15 text-warning border-warning/30 text-[10px]">Single-source</Badge></div>}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card text-xs text-muted-foreground">No supplier assigned (in-house or TBD).</div>
        )}
      </div>

      {/* Where-used + Uses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Where-Used (parents)</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">This part is used as a child of {whereUsed.length} parent assembl{whereUsed.length === 1 ? "y" : "ies"}.</p>
          <div className="space-y-2">
            {whereUsed.length === 0 && <p className="text-[11px] italic text-muted-foreground">Top-level vehicle — no parents.</p>}
            {whereUsed.map((e, i) => {
              const parent = getPart(e.parentPN);
              return (
                <button key={i} onClick={() => navigate(`/parts/${e.parentPN}`)} className="w-full flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted/30">
                  <div className="text-left">
                    <div className="text-xs font-semibold">{parent?.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{e.parentPN} · qty {e.qty}{e.refDes ? ` · ${e.refDes}` : ""}</div>
                  </div>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Uses (children)</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">This part is built from {children.length} direct child part{children.length === 1 ? "" : "s"}.</p>
          <div className="space-y-2">
            {children.length === 0 && <p className="text-[11px] italic text-muted-foreground">Leaf part — no children.</p>}
            {children.map((e, i) => {
              const child = getPart(e.childPN);
              return (
                <button key={i} onClick={() => navigate(`/parts/${e.childPN}`)} className="w-full flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted/30">
                  <div className="text-left">
                    <div className="text-xs font-semibold">{child?.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{e.childPN} · qty {e.qty}</div>
                  </div>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Extras: routing / kits / software / ECNs / history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {routing.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold">Manufacturing Routing</h3>
            <div className="mt-2 space-y-2">
              {routing.map(op => {
                const plant = plants.find(p => p.id === op.plantId);
                return (
                  <div key={op.id} className="rounded-md border border-border p-2 text-xs">
                    <div className="font-semibold">{op.operation}</div>
                    <div className="text-[10px] text-muted-foreground">{plant?.name} · {op.line} · {op.station} · {op.takeTimeSec}s</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {kits.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold">Service Kits that include this part</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {kits.map(k => <Badge key={k.id} variant="outline" className="text-[10px] font-mono">{k.id} · {k.name}</Badge>)}
            </div>
          </div>
        )}

        {softOnMe.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold">Software running on this ECU</h3>
            <div className="mt-2 space-y-1.5">
              {softOnMe.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-md border border-border p-2 text-xs">
                  <div>
                    <div className="font-semibold">{s.name} <span className="font-mono text-muted-foreground">{s.version}</span></div>
                    <div className="text-[10px] text-muted-foreground">{s.license} · {s.supplier}</div>
                  </div>
                  {s.cves.length > 0
                    ? <Badge className="bg-critical/15 text-critical border-critical/30 text-[10px]">{s.cves.length} CVE</Badge>
                    : <Badge className="bg-success/15 text-success border-success/30 text-[10px]">Clean</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {affectingEcns.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold">ECNs affecting this part</h3>
            <div className="mt-2 space-y-1.5">
              {affectingEcns.map(e => (
                <button key={e.id} onClick={() => navigate(`/changes/${e.id}`)} className="w-full flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted/30 text-left">
                  <div>
                    <div className="font-mono text-xs">{e.id}</div>
                    <div className="text-xs font-semibold">{e.title}</div>
                  </div>
                  <Badge className={cn("text-[10px] border",
                    e.state === "Released" ? "bg-success/15 text-success border-success/30" :
                    e.state === "Approved" ? "bg-accent/15 text-accent border-accent/30" :
                    e.state === "In Review" ? "bg-warning/15 text-warning border-warning/30" :
                    "bg-muted text-muted-foreground border-border")}>{e.state}</Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
            <h3 className="text-sm font-semibold">Revision History</h3>
            <div className="mt-3 relative pl-4 space-y-3 border-l border-border">
              {history.map((h, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[18px] top-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="text-xs font-semibold">rev {h.revision} {h.ecnId && <span className="text-primary font-mono">· {h.ecnId}</span>}</div>
                  <div className="text-[11px]">{h.note}</div>
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

const PartMaster = () => {
  const { pn } = useParams();
  return pn ? <PartDetail pn={pn} /> : <PartList />;
};

export default PartMaster;
