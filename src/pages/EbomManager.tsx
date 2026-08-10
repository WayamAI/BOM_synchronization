import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  buildEbomTree, type EbomNode, getPart, getWhereUsed,
  revisions, softwareComponents, mbomOps, plants,
} from "@/lib/mockData";
import { useProgramContext } from "@/context/ProgramContext";
import {
  ChevronDown, ChevronRight, Plus, Link2, Search, Filter, X,
  GitBranch, Boxes, ShieldAlert, GitCompare, ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GraphView from "@/components/EbomGraphView";

const dotCls = (h?: string) =>
  h === "critical" ? "bg-critical shadow-glow-danger animate-pulse-dot" :
  h === "warning"  ? "bg-warning" : "bg-success";

const lcBadge = (lc?: string) => {
  if (lc === "In Review") return "bg-warning/15 text-warning border-warning/30";
  if (lc === "In Work")   return "bg-primary/15 text-primary border-primary/30";
  if (lc === "Obsolete")  return "bg-muted text-muted-foreground";
  return "bg-success/15 text-success border-success/30"; // Released
};

const TreeRow = ({ node, depth = 0, onSelect, selected, filter }: {
  node: EbomNode; depth?: number; onSelect: (n: EbomNode) => void;
  selected?: string; filter: string;
}) => {
  const matchesFilter = !filter ||
    node.name.toLowerCase().includes(filter.toLowerCase()) ||
    node.partNumber.toLowerCase().includes(filter.toLowerCase());
  const anyChildMatches = node.children?.some(c => matchesDeep(c, filter)) ?? false;
  const [open, setOpen] = useState(depth < 2 || (!!filter && anyChildMatches));
  const has = !!node.children?.length;
  const isSel = selected === node.id;

  if (filter && !matchesFilter && !anyChildMatches) return null;

  return (
    <div>
      <div
        onClick={() => { onSelect(node); if (has) setOpen(!open); }}
        className={cn(
          "group flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
          isSel && "bg-primary/10 ring-1 ring-primary/30"
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {has ? (open ? <ChevronDown className="h-3.5 w-3.5 opacity-60" /> : <ChevronRight className="h-3.5 w-3.5 opacity-60" />) : <span className="w-3.5" />}
        <span className={cn("h-2 w-2 rounded-full shrink-0", dotCls(node.health))} />
        <span className="text-sm font-semibold">{node.name}</span>
        <span className="text-[10px] font-mono text-muted-foreground">{node.partNumber}</span>
        {node.qty && node.qty > 1 && <Badge variant="outline" className="text-[10px] h-5 px-1.5">×{node.qty}</Badge>}
        {node.version && <Badge variant="outline" className="font-mono text-[10px] h-5 px-1.5">{node.version}</Badge>}
        {node.status && <Badge className={cn("text-[10px] h-5 border", lcBadge(node.status))}>{node.status}</Badge>}
        {!!node.cves && <Badge className="bg-critical/15 text-critical hover:bg-critical/15 border-critical/30 text-[10px] h-5">{node.cves} CVE</Badge>}
        {!!node.warnings && <Badge className="bg-warning/15 text-warning hover:bg-warning/15 border-warning/30 text-[10px] h-5">{node.warnings} warn</Badge>}
        <span className="ml-auto text-[10px] text-muted-foreground">{node.type}</span>
      </div>
      {open && has && node.children!.map(c => (
        <TreeRow key={c.id} node={c} depth={depth + 1} onSelect={onSelect} selected={selected} filter={filter} />
      ))}
    </div>
  );
};

function matchesDeep(node: EbomNode, filter: string): boolean {
  if (!filter) return true;
  const q = filter.toLowerCase();
  if (node.name.toLowerCase().includes(q) || node.partNumber.toLowerCase().includes(q)) return true;
  return node.children?.some(c => matchesDeep(c, filter)) ?? false;
}

const flatten = (n: EbomNode): EbomNode[] => [n, ...(n.children?.flatMap(flatten) ?? [])];

const getDepth = (tree: EbomNode, nodeId: string, depth = 0): number => {
  if (tree.id === nodeId) return depth;
  if (tree.children) {
    for (const child of tree.children) {
      const d = getDepth(child, nodeId, depth + 1);
      if (d !== -1) return d;
    }
  }
  return -1;
};

const getChildCount = (node: EbomNode): number => {
  let count = 0;
  const traverse = (n: EbomNode) => {
    count++;
    if (n.children) n.children.forEach(traverse);
  };
  if (node.children) node.children.forEach(traverse);
  return count - 1; // exclude self
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
    <p className="text-xs">{value}</p>
  </div>
);

const SidePanel = ({ node, onClose, tree }: { node: EbomNode; onClose: () => void; tree: EbomNode }) => {
  const navigate = useNavigate();
  const tabs = ["Overview", "Where-Used", "Manufacturing", "Software", "History"] as const;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const part = getPart(node.partNumber);
  const whereUsed = getWhereUsed(node.partNumber);
  const softOnMe = softwareComponents.filter(c => c.runsOnECU === node.partNumber);
  const routingOps = mbomOps.filter(o => o.partNumber === node.partNumber);
  const history = revisions.filter(r => r.partNumber === node.partNumber);
  const depth = getDepth(tree, node.id);
  const childCount = getChildCount(node);

  return (
    <aside className="w-full lg:w-[420px] shrink-0 rounded-xl border border-border bg-card shadow-elevated animate-slide-in-right">
      <div className="p-4 border-b border-border flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold truncate">{node.name}</h3>
            <Badge variant="outline" className="text-[10px]">{node.type}</Badge>
            {node.version && <Badge className="bg-gradient-primary border-0 text-[10px]">{node.version}</Badge>}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 font-mono">{node.partNumber}</p>
          <p className="text-[11px] text-muted-foreground">{node.owner ?? "Unassigned"} · {node.status ?? "—"}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X className="h-4 w-4" /></Button>
      </div>

      <div className="flex gap-1 p-2 border-b border-border overflow-x-auto scrollbar-thin">
        {tabs.map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={cn("px-2.5 py-1 text-[11px] rounded-md whitespace-nowrap transition-colors",
              tab === t ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground hover:bg-muted/50")}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3 text-xs">
        {tab === "Overview" && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Field label="Part number" value={<span className="font-mono">{node.partNumber}</span>} />
            <Field label="Revision" value={node.revision ?? "—"} />
            <Field label="Type" value={node.type} />
            <Field label="Lifecycle" value={<Badge className={cn("text-[10px] border", lcBadge(node.status))}>{node.status ?? "—"}</Badge>} />
            <Field label="Owner team" value={node.owner ?? "—"} />
            <Field label="Supplier" value={node.supplier ?? "—"} />
            <Field label="Unit cost" value={part?.cost ? `$${part.cost.toLocaleString()}` : "—"} />
            <Field label="Lead time" value={part ? `${part.leadTimeDays} days` : "—"} />
            <Field label="UoM" value={part?.uom ?? "—"} />
            <Field label="Serviceable" value={part?.serviceable ? "Yes (in Service BOM)" : "No"} />
            <Field label="Dependency depth" value={depth} />
            <Field label="Child components" value={childCount} />
            <div className="col-span-2">
              <Field label="Description" value={part?.description ?? "—"} />
            </div>
            <div className="col-span-2">
              <Field label="Last modified" value={part ? `${part.updatedAt}` : "—"} />
            </div>
          </div>
        )}

        {tab === "Where-Used" && (
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground">This part is used as a child of {whereUsed.length} parent{whereUsed.length === 1 ? "" : "s"}:</p>
            {whereUsed.length === 0 && <p className="text-[11px] italic text-muted-foreground">No parents — this is the top-level vehicle.</p>}
            {whereUsed.map((e, i) => {
              const parent = getPart(e.parentPN);
              return (
                <div key={i} className="flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/parts/${e.parentPN}`)}>
                  <div>
                    <div className="text-xs font-semibold">{parent?.name ?? e.parentPN}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{e.parentPN} · qty {e.qty}</div>
                  </div>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </div>
              );
            })}
          </div>
        )}

        {tab === "Manufacturing" && (
          <div className="space-y-2">
            {routingOps.length === 0 && <p className="text-[11px] italic text-muted-foreground">No MBOM routing defined. Add one from the MBOM Manager.</p>}
            {routingOps.map(op => {
              const plant = plants.find(p => p.id === op.plantId);
              return (
                <div key={op.id} className="rounded-lg border border-border p-3 bg-muted/30">
                  <div className="text-xs font-semibold">{op.operation}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{plant?.name} · {op.line} · {op.station}</div>
                  <div className="flex items-center justify-between text-[10px] mt-2">
                    <span className="text-muted-foreground">{op.takeTimeSec}s takt · {op.workInstructionId}</span>
                    <Badge className={
                      op.status === "ready"   ? "bg-success/15 text-success border-success/30" :
                      op.status === "warning" ? "bg-warning/15 text-warning border-warning/30" :
                      op.status === "blocked" ? "bg-critical/15 text-critical border-critical/30" :
                                                "bg-muted text-muted-foreground"
                    }>{op.status}</Badge>
                  </div>
                </div>
              );
            })}
            <Button variant="link" className="text-xs px-0 h-auto" onClick={() => navigate("/mbom")}>Open in MBOM Manager →</Button>
          </div>
        )}

        {tab === "Software" && (
          <div className="space-y-2">
            {softOnMe.length === 0 && <p className="text-[11px] italic text-muted-foreground">No software packages declared for this part. Relevant only for ECU-type parts.</p>}
            {softOnMe.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-md border border-border p-2">
                <div>
                  <div className="text-xs font-semibold">{c.name} <span className="font-mono text-muted-foreground">{c.version}</span></div>
                  <div className="text-[10px] text-muted-foreground">{c.license} · {c.supplier}</div>
                </div>
                {c.cves.length > 0
                  ? <Badge className="bg-critical/15 text-critical border-critical/30">{c.cves.length} CVE</Badge>
                  : <Badge className="bg-success/15 text-success border-success/30">Clean</Badge>}
              </div>
            ))}
          </div>
        )}

        {tab === "History" && (
          <div className="relative pl-4 space-y-3 border-l border-border">
            {history.length === 0 && <p className="text-[11px] italic text-muted-foreground">No revision history yet.</p>}
            {history.map((h, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[18px] top-1 h-2 w-2 rounded-full bg-primary" />
                <div className="text-xs font-semibold">rev {h.revision}{h.ecnId ? ` · ${h.ecnId}` : ""}</div>
                <div className="text-[11px]">{h.note}</div>
                <div className="text-[10px] text-muted-foreground">{h.date} · {h.by}</div>
              </div>
            ))}
            <Button variant="link" className="text-xs px-0 h-auto" onClick={() => navigate(`/lineage/${node.partNumber}`)}>Open full lineage →</Button>
          </div>
        )}
      </div>
    </aside>
  );
};

const EbomManager = () => {
  const { activeProgram } = useProgramContext();
  const [variantCode, setVariantCode] = useState<string>("ALL");
  const [view, setView] = useState<"tree" | "table" | "graph">("tree");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<EbomNode | null>(null);

  useEffect(() => {
    setVariantCode("ALL");
    setSelected(null);
    setFilter("");
  }, [activeProgram.id]);

  const rootPN = useMemo(
    () => activeProgram.parts.find(p => p.type === "Vehicle")?.partNumber ?? "MER-VEH-0001",
    [activeProgram]
  );

  const tree = useMemo(
    () => buildEbomTree(rootPN, variantCode === "ALL" ? undefined : variantCode),
    [rootPN, variantCode]
  );
  const all = useMemo(() => flatten(tree), [tree]);

  const variantLabel = variantCode === "ALL"
    ? "All variants (150% BOM)"
    : activeProgram.variants.find(v => v.code === variantCode)?.name ?? variantCode;

  const filteredRows = useMemo(() => {
    const items = all.filter(n => n.type !== "Vehicle" && n.type !== "System");
    if (!filter) return items;
    const q = filter.toLowerCase();
    return items.filter(n => n.name.toLowerCase().includes(q) || n.partNumber.toLowerCase().includes(q));
  }, [all, filter]);

  const totalCost = useMemo(() =>
    filteredRows.reduce((s, n) => s + (n.cost ?? 0) * (n.qty ?? 1), 0),
    [filteredRows]
  );

  return (
    <PageHeader
      title="Engineering BOM"
      subtitle={`${activeProgram.name} ${activeProgram.modelYear} · ${variantLabel} · ${activeProgram.globalRevision}`}
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-1.5"><GitCompare className="h-3.5 w-3.5" />Compare</Button>
          <Button variant="outline" size="sm" className="gap-1.5"><Link2 className="h-3.5 w-3.5" />Add Relationship</Button>
          <Button size="sm" className="gap-1.5 bg-gradient-primary border-0"><Plus className="h-3.5 w-3.5" />Add Component</Button>
        </>
      }
    >
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="w-full">
        <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted/50 p-1 mb-6">
          <TabsTrigger value="tree" className="text-xs px-5 py-1.5 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm">Tree View</TabsTrigger>
          <TabsTrigger value="table" className="text-xs px-5 py-1.5 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm">Table View</TabsTrigger>
          <TabsTrigger value="graph" className="text-xs px-5 py-1.5 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm">Graph View</TabsTrigger>
        </TabsList>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={variantCode} onValueChange={setVariantCode}>
            <SelectTrigger className="h-8 w-56 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All variants (150% BOM)</SelectItem>
              {activeProgram.variants.map(v => (
                <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5 h-8"><Filter className="h-3.5 w-3.5" />Filter</Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search EBOM by name or PN…"
              className="h-8 w-72 pl-8 text-xs"
            />
          </div>
        </div>

        {/* Completeness / quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { l: "Parts in view",    v: (filteredRows.length).toLocaleString() },
            { l: "Unique assemblies", v: all.filter(n => n.type === "Assembly" || n.type === "Sub-Assembly").length },
            { l: "ECUs",             v: all.filter(n => n.type === "ECU").length },
            { l: "Rolled-up cost",   v: `$${Math.round(totalCost).toLocaleString()}` },
            { l: "Parts in program", v: activeProgram.parts.length },
          ].map(k => (
            <div key={k.l} className="rounded-lg border border-border bg-card p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.l}</div>
              <div className="text-base font-bold tabular-nums">{k.v}</div>
            </div>
          ))}
        </div>

        {/* Main split */}
        <TabsContent value="tree" className="mt-0">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 rounded-xl border border-border bg-card shadow-card p-2 min-h-[520px]">
              <TreeRow node={tree} onSelect={setSelected} selected={selected?.id} filter={filter} />
            </div>
            {selected && <SidePanel node={selected} onClose={() => setSelected(null)} tree={tree} />}
          </div>
        </TabsContent>
        <TabsContent value="table" className="mt-0">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 rounded-xl border border-border bg-card shadow-card p-2 min-h-[520px]">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="text-left p-2"></th>
                      <th className="text-left p-2">Part Number</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Rev</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-right p-2">Cost</th>
                      <th className="text-left p-2">Supplier</th>
                      <th className="text-left p-2">Lifecycle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map(n => (
                      <tr key={n.id + Math.random()} className="border-b border-border/40 hover:bg-muted/40 cursor-pointer" onClick={() => setSelected(n)}>
                        <td className="p-2"><span className={cn("inline-block h-2 w-2 rounded-full", dotCls(n.health))} /></td>
                        <td className="p-2 font-mono">{n.partNumber}</td>
                        <td className="p-2 font-semibold">{n.name}</td>
                        <td className="p-2 text-muted-foreground">{n.type}</td>
                        <td className="p-2 font-mono">{n.revision}</td>
                        <td className="p-2 tabular-nums">{n.qty}</td>
                        <td className="p-2 tabular-nums text-right">{n.cost ? `$${n.cost.toLocaleString()}` : "—"}</td>
                        <td className="p-2 text-muted-foreground">{n.supplier ?? "—"}</td>
                        <td className="p-2"><Badge className={cn("text-[10px] border", lcBadge(n.status))}>{n.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {selected && <SidePanel node={selected} onClose={() => setSelected(null)} tree={tree} />}
          </div>
        </TabsContent>
        <TabsContent value="graph" className="mt-0">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-h-[640px]" style={{ height: 'calc(100vh - 320px)', minHeight: 640 }}>
              <GraphView tree={tree} selected={selected} onSelect={setSelected} filter={filter} />
            </div>
            {selected && <SidePanel node={selected} onClose={() => setSelected(null)} tree={tree} />}
          </div>
        </TabsContent>

        {/* Validation footer */}
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-3 flex items-center gap-3 flex-wrap">
          <GitBranch className="h-4 w-4 text-warning" />
          <span className="text-xs font-semibold text-warning">Validation</span>
          <span className="text-xs text-muted-foreground">
            {activeProgram.bomEdges.length} parent-child edges · {all.filter(n => !n.owner).length} parts without owner · {all.filter(n => n.health === "warning" || n.health === "critical").length} health issues open
          </span>
          <Boxes className="h-4 w-4 ml-auto text-muted-foreground" />
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        </div>
      </Tabs>
    </PageHeader>
  );
};

export default EbomManager;
