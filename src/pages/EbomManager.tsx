import { EmptyState, KpiTile, LifecycleStatus, Panel, QuietStatus, StatusDot } from "@/components/ui/primitives";
import { EntityGlyph } from "@/components/icons/EntityIcon";
import { typeMark } from "@/components/icons/iconMap";
import { plural, statusText } from "@/lib/format";
import { useMemo, useState, useEffect, type KeyboardEvent } from "react";
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

// Health from node.health (same data as before). Healthy rows show nothing visible;
// warning and critical rows show a status dot. The state is always readable by assistive tech.
const HealthDot = ({ health }: { health?: string }) => {
  const tone = health === "critical" ? "error" : health === "warning" ? "warning" : null;
  const label = health === "critical" ? "Health: critical" : health === "warning" ? "Health: warning" : "Health: ok";
  return (
    <span className="inline-flex size-2 shrink-0" title={tone ? label : undefined}>
      {tone && <StatusDot tone={tone} className="size-2" />}
      <span className="sr-only">{label}</span>
    </span>
  );
};

const TreeRow = ({ node, depth = 0, onSelect, selected, filter }: {
  node: EbomNode; depth?: number; onSelect: (n: EbomNode) => void;
  selected?: string; filter: string;
}) => {
  const matchesFilter = !filter ||
    node.name.toLowerCase().includes(filter.toLowerCase()) ||
    node.partNumber.toLowerCase().includes(filter.toLowerCase());
  const anyChildMatches = node.children?.some(c => matchesDeep(c, filter)) ?? false;
  // Open state follows the filter unless the user toggled this row by hand.
  const [manual, setManual] = useState<boolean | null>(null);
  useEffect(() => setManual(null), [filter]);
  const has = !!node.children?.length;
  const open = has && (manual ?? (filter ? anyChildMatches : depth < 2));
  const isSel = selected === node.id;

  if (filter && !matchesFilter && !anyChildMatches) return null;

  // Roving keyboard support over the flat list of visible rows.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(node); }
    else if (e.key === "ArrowRight" && has && !open) { e.preventDefault(); setManual(true); }
    else if (e.key === "ArrowLeft" && has && open) { e.preventDefault(); setManual(false); }
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const items = Array.from(e.currentTarget.closest<HTMLElement>("[role=tree]")?.querySelectorAll<HTMLElement>("[role=treeitem]") ?? []);
      items[items.indexOf(e.currentTarget) + (e.key === "ArrowDown" ? 1 : -1)]?.focus();
    }
  };

  return (
    <div>
      <div
        role="treeitem"
        tabIndex={0}
        aria-level={depth + 1}
        aria-selected={isSel}
        aria-expanded={has ? open : undefined}
        onClick={() => onSelect(node)}
        onKeyDown={onKeyDown}
        className={cn(
          "group flex min-h-9 items-center gap-2 border-b border-hairline px-2 py-2 cursor-pointer outline-none hover:bg-raised transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-active",
          isSel && "bg-raised ring-1 ring-inset ring-active"
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {has ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
            onClick={(e) => { e.stopPropagation(); setManual(!open); }}
            className="grid size-5 shrink-0 place-items-center rounded-md outline-none hover:bg-raised-2"
          >
            {open ? <ChevronDown aria-hidden className="size-3.5 opacity-60" /> : <ChevronRight aria-hidden className="size-3.5 opacity-60" />}
          </button>
        ) : <span className="w-5 shrink-0" />}
        <HealthDot health={node.health} />
        <EntityGlyph id={typeMark(node.type)} size={20} />
        <span title={node.name} className={cn("type-body-md truncate text-foreground", depth === 0 ? "font-semibold" : "font-medium")}>{node.name}</span>
        <span className="type-body-sm tabular truncate text-tertiary" title={[node.partNumber, node.version, node.qty && node.qty > 1 ? `×${node.qty}` : null].filter(Boolean).join(" · ")}>
          {[node.partNumber, node.version, node.qty && node.qty > 1 ? `×${node.qty}` : null].filter(Boolean).join(" · ")}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-3">
          {!!node.cves && <Badge variant="error">{plural(node.cves, "CVE")}</Badge>}
          {!!node.warnings && <Badge variant="warning">{node.warnings} warn</Badge>}
          <span className="hidden w-24 items-center sm:flex">{node.status && <LifecycleStatus status={node.status} />}</span>
          <span className="type-body-sm hidden w-20 justify-end text-quaternary sm:flex">{node.type}</span>
        </span>
      </div>
      {open && node.children!.map(c => (
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
  return count; // descendants only; the node itself is never counted, so a leaf is 0
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="type-eyebrow text-quaternary">{label}</p>
    <div className="type-body-sm">{value}</div>
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
    <aside className="w-full lg:w-[420px] shrink-0 rounded-lg border border-strong bg-container">
      <div className="p-4 border-b border-hairline flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="type-display-lg truncate text-foreground">{node.name}</h3>
          </div>
          <p className="type-body-sm tabular mt-1 text-tertiary">{[node.partNumber, node.version].filter(Boolean).join(" · ")}</p>
          <p className="type-body-sm text-tertiary">{node.type} · {node.owner ?? "Unassigned"} · {node.status ? statusText(node.status) : "—"}</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Close details" onClick={onClose}><X aria-hidden /></Button>
      </div>

      <div className="flex flex-wrap gap-1.5 p-3 border-b border-hairline">
        {tabs.map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={cn("rounded-full border px-2.5 py-1 type-body-sm font-medium whitespace-nowrap outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-active",
              tab === t ? "border-transparent bg-action-primary text-on-color" : "border-hairline bg-action text-tertiary hover:border-strong hover:bg-raised-2 hover:text-secondary-foreground")}>
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3 type-body-sm">
        {tab === "Overview" && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Field label="Part number" value={<span className="font-mono">{node.partNumber}</span>} />
            <Field label="Revision" value={node.revision ?? "—"} />
            <Field label="Type" value={node.type} />
            <Field label="Lifecycle" value={<LifecycleStatus status={node.status} />} />
            <Field label="Owner team" value={node.owner ?? "—"} />
            <Field label="Supplier" value={node.supplier ?? "—"} />
            <Field label="Unit cost" value={part?.cost ? `$${part.cost.toLocaleString("en-US")}` : "—"} />
            <Field label="Lead time" value={part ? plural(part.leadTimeDays, "day") : "—"} />
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
            <p className="type-body-sm text-tertiary">This part is used as a child of {whereUsed.length} parent{whereUsed.length === 1 ? "" : "s"}:</p>
            {whereUsed.length === 0 && <p className="type-body-sm italic text-tertiary">No parents. This is the top-level vehicle.</p>}
            {whereUsed.map((e, i) => {
              const parent = getPart(e.parentPN);
              return (
                <div key={i} className="flex items-center justify-between rounded-md border border-hairline p-2 hover:bg-raised cursor-pointer" onClick={() => navigate(`/parts/${e.parentPN}`)}>
                  <div>
                    <div className="type-body-sm font-semibold">{parent?.name ?? e.parentPN}</div>
                    <div className="type-caption font-mono text-tertiary">{e.parentPN} · qty {e.qty}</div>
                  </div>
                  <ExternalLink aria-hidden className="size-3.5 opacity-50" />
                </div>
              );
            })}
          </div>
        )}

        {tab === "Manufacturing" && (
          <div className="space-y-2">
            {routingOps.length === 0 && <p className="type-body-sm italic text-tertiary">No MBOM routing defined. Add one from the MBOM Manager.</p>}
            {routingOps.map(op => {
              const plant = plants.find(p => p.id === op.plantId);
              return (
                <div key={op.id} className="rounded-lg border border-hairline p-3 bg-raised">
                  <div className="type-body-sm font-semibold">{op.operation}</div>
                  <div className="type-body-sm text-tertiary mt-1">{plant?.name} · {op.line} · {op.station}</div>
                  <div className="flex items-center justify-between type-caption mt-2">
                    <span className="text-tertiary">{op.takeTimeSec}s takt · {op.workInstructionId}</span>
                    {op.status === "ready" ? <QuietStatus tone="success">{op.status}</QuietStatus> : <Badge variant={op.status === "warning" ? "warning" : op.status === "blocked" ? "error" : "neutral"}>{op.status}</Badge>}
                  </div>
                </div>
              );
            })}
            <Button variant="link" className="type-label-sm px-0 h-auto" onClick={() => navigate("/mbom")}>Open in MBOM Manager</Button>
          </div>
        )}

        {tab === "Software" && (
          <div className="space-y-2">
            {softOnMe.length === 0 && <p className="type-body-sm italic text-tertiary">No software packages declared for this part. Relevant only for ECU-type parts.</p>}
            {softOnMe.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-md border border-hairline p-2">
                <div>
                  <div className="type-body-sm font-semibold">{c.name} <span className="font-mono text-tertiary">{c.version}</span></div>
                  <div className="type-caption text-tertiary">{c.license} · {c.supplier}</div>
                </div>
                {c.cves.length > 0
                  ? <Badge variant="error">{plural(c.cves.length, "CVE")}</Badge>
                  : <QuietStatus tone="success">Clean</QuietStatus>}
              </div>
            ))}
          </div>
        )}

        {tab === "History" && (
          <div className="relative pl-4 space-y-3 border-l border-hairline">
            {history.length === 0 && <p className="type-body-sm italic text-tertiary">No revision history yet.</p>}
            {history.map((h, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[18px] top-1 h-2 w-2 rounded-full bg-action-primary" />
                <div className="type-body-sm font-semibold">rev {h.revision}{h.ecnId ? ` · ${h.ecnId}` : ""}</div>
                <div className="type-body-sm">{h.note}</div>
                <div className="type-caption text-tertiary">{h.date} · {h.by}</div>
              </div>
            ))}
            <Button variant="link" className="type-label-sm px-0 h-auto" onClick={() => navigate(`/lineage/${node.partNumber}`)}>Open full lineage</Button>
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
      mark="ebom"
      subtitle={`${activeProgram.name} ${activeProgram.modelYear} · ${variantLabel} · ${activeProgram.globalRevision}`}
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-1.5"><GitCompare aria-hidden className="size-3.5" />Compare</Button>
          <Button variant="outline" size="sm" className="gap-1.5"><Link2 aria-hidden className="size-3.5" />Add relationship</Button>
          <Button size="sm" className="gap-1.5"><Plus aria-hidden className="size-3.5" />Add component</Button>
        </>
      }
    >
      <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="tree">Tree view</TabsTrigger>
          <TabsTrigger value="table">Table view</TabsTrigger>
          <TabsTrigger value="graph">Graph view</TabsTrigger>
        </TabsList>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={variantCode} onValueChange={setVariantCode}>
            <SelectTrigger aria-label="Filter by variants" className="h-8 w-56 type-label-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All variants (150% BOM)</SelectItem>
              {activeProgram.variants.map(v => (
                <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5 h-8"><Filter aria-hidden className="size-3.5" />Filter</Button>
          <div className="relative">
            <Search aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-tertiary" />
            <Input aria-label="Search EBOM by name or PN"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Search EBOM by name or PN"
              className="h-8 w-72 pl-8 type-label-sm"
            />
          </div>
        </div>

        {/* Completeness / quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { l: "Parts in view",    v: (filteredRows.length).toLocaleString("en-US"), icon: "part" },
            { l: "Unique assemblies", v: all.filter(n => n.type === "Assembly" || n.type === "Sub-Assembly").length, icon: "assembly" },
            { l: "ECUs",             v: all.filter(n => n.type === "ECU").length, icon: "ecu" },
            { l: "Rolled-up cost",   v: `$${Math.round(totalCost).toLocaleString("en-US")}`, icon: "cost" },
            { l: "Parts in program", v: activeProgram.parts.length, icon: "part" },
          ].map(k => (
            <KpiTile key={k.l} label={k.l} value={k.v} icon={k.icon} />
          ))}
        </div>

        {/* Main split */}
        <TabsContent value="tree" className="mt-0">
          <div className="flex flex-col lg:flex-row gap-4">
            <Panel title={`Structure · ${plural(filteredRows.length, "Part")}`} icon="ebom" padded={false} className="flex-1 min-h-[520px]">
              <div role="tree" aria-label="Engineering BOM structure" className="-mb-px">
                <TreeRow node={tree} onSelect={setSelected} selected={selected?.id} filter={filter} />
              </div>
              {filter && !matchesDeep(tree, filter) && <EmptyState title="No components match this search" mark="ebom" />}
            </Panel>
            {selected && <SidePanel node={selected} onClose={() => setSelected(null)} tree={tree} />}
          </div>
        </TabsContent>
        <TabsContent value="table" className="mt-0">
          <div className="flex flex-col lg:flex-row gap-4">
            <Panel title={`Parts · ${filteredRows.length.toLocaleString("en-US")}`} icon="ebom" padded={false} className="flex-1 min-h-[520px]">
              <div className="overflow-x-auto">
                <table className="tabular w-full type-body-sm">
                  <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
                    <tr className="border-b border-hairline">
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap"><span className="sr-only">Health</span></th>
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Part number</th>
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Name</th>
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Type</th>
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Rev</th>
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Qty</th>
                      <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">Cost</th>
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Supplier</th>
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Lifecycle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 && (
                      <tr><td colSpan={9}><EmptyState title="No components match this search" mark="ebom" /></td></tr>
                    )}
                    {filteredRows.map(n => (
                      <tr key={n.id + Math.random()} className="border-b border-hairline hover:bg-raised cursor-pointer" onClick={() => setSelected(n)}>
                        <td className="px-3 py-2"><HealthDot health={n.health} /></td>
                        <td className="px-3 py-2 tabular text-tertiary"><span className="inline-flex items-center gap-2"><EntityGlyph id={typeMark(n.type)} size={20} />{n.partNumber}</span></td>
                        <td className="type-body-md px-3 py-2 font-medium text-foreground">{n.name}</td>
                        <td className="type-body-sm px-3 py-2 text-quaternary">{n.type}</td>
                        <td className="px-3 py-2 tabular text-tertiary">{n.revision}</td>
                        <td className="px-3 py-2 tabular text-tertiary">{n.qty}</td>
                        <td className="px-3 py-2 tabular text-right">{n.cost ? `$${n.cost.toLocaleString("en-US")}` : "—"}</td>
                        <td className="px-3 py-2 text-tertiary">{n.supplier ?? "—"}</td>
                        <td className="px-3 py-2"><LifecycleStatus status={n.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
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
        <div className="rounded-lg border border-hairline bg-warning-surface p-3 flex items-center gap-3 flex-wrap">
          <GitBranch aria-hidden className="size-3.5 text-warning" />
          <span className="type-body-sm font-semibold text-warning">Validation</span>
          <span className="type-body-sm text-tertiary">
            {plural(activeProgram.bomEdges.length, "parent-child edge")} · {plural(all.filter(n => !n.owner).length, "part")} without owner · {plural(all.filter(n => n.health === "warning" || n.health === "critical").length, "health issue")} open
          </span>
          <Boxes aria-hidden className="size-3.5 ml-auto text-tertiary" />
          <ShieldAlert aria-hidden className="size-3.5 text-tertiary" />
        </div>
      </Tabs>
    </PageHeader>
  );
};

export default EbomManager;
