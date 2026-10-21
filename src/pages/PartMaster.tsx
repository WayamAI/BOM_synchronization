import { EmptyState, Panel, PanelHeader, LifecycleStatus, QuietStatus } from "@/components/ui/primitives";
import { EntityGlyph } from "@/components/icons/EntityIcon";
import { typeMark } from "@/components/icons/iconMap";
import { plural, statusText } from "@/lib/format";
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
import { Search, ArrowLeft, Plus, ExternalLink, FileEdit } from "lucide-react";

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
      mark="part"
      subtitle={`Canonical registry · ${plural(allParts.length, "total part")} across ${plural(products.length, "program")} · single source of truth`}
      actions={<Button size="sm" className="gap-1.5"><Plus aria-hidden className="size-3.5" />New part</Button>}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-tertiary" />
          <Input aria-label="Search by PN, name, supplier" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by PN, name, supplier" className="h-8 w-80 pl-8 type-label-sm" />
        </div>
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger aria-label="Filter by programs" className="h-8 w-44 type-label-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Programs</SelectItem>
            {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger aria-label="Filter by types" className="h-8 w-40 type-label-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={lcFilter} onValueChange={setLcFilter}>
          <SelectTrigger aria-label="Filter by lifecycle" className="h-8 w-36 type-label-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any lifecycle</SelectItem>
            <SelectItem value="In Work">In work</SelectItem>
            <SelectItem value="In Review">In review</SelectItem>
            <SelectItem value="Released">Released</SelectItem>
            <SelectItem value="Obsolete">Obsolete</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-auto">{filtered.length} part{filtered.length === 1 ? "" : "s"}</Badge>
      </div>

      <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
        <table className="tabular w-full type-body-sm">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Part number</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Name</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Program</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Type</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Rev</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Lifecycle</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Owner</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Supplier</th>
              <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">Cost</th>
              <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">Lead</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10}><EmptyState title="No parts match this filter" mark="part" /></td></tr>
            )}
            {filtered.map(p => {
              const prog = products.find(pr => pr.id === p.programId);
              return (
                <tr key={p.partNumber} onClick={() => navigate(`/parts/${p.partNumber}`)} className="border-t border-hairline hover:bg-raised cursor-pointer">
                  <td className="px-3 py-2 font-mono"><span className="inline-flex items-center gap-2"><EntityGlyph id={typeMark(p.type)} size={20} />{p.partNumber}</span></td>
                  <td className="px-3 py-2 font-semibold">{p.name}</td>
                  <td className="px-3 py-2 text-tertiary type-body-sm">{prog?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-tertiary">{p.type}</td>
                  <td className="px-3 py-2 font-mono">{p.revision}</td>
                  <td className="px-3 py-2"><LifecycleStatus status={p.lifecycle} /></td>
                  <td className="px-3 py-2">{p.owner}</td>
                  <td className="px-3 py-2 text-tertiary">{p.supplierId ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">${p.cost.toLocaleString("en-US")}</td>
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
      <PageHeader title={`No part ${pn}`} mark="not-found" subtitle="That part number does not exist">
        <Button variant="outline" size="sm" onClick={() => navigate("/parts")}>
          <ArrowLeft aria-hidden className="size-3.5 mr-1" />Back to Part Master
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
      mark="part"
      subtitle={`${pn} · rev ${part.revision} · ${part.type} · ${statusText(part.lifecycle)}`}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => navigate("/parts")}>
            <ArrowLeft aria-hidden className="size-3.5 mr-1" />All parts
          </Button>
          <Button size="sm" className="gap-1.5"><FileEdit aria-hidden className="size-3.5" />Propose change</Button>
        </>
      }
    >
      {/* Facts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Part Details" icon="part" className="lg:col-span-2">
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 type-body-sm">
            <div><div className="type-eyebrow text-quaternary">Part number</div><div className="font-mono font-semibold">{part.partNumber}</div></div>
            <div><div className="type-eyebrow text-quaternary">Revision</div><div className="font-mono">{part.revision}</div></div>
            <div><div className="type-eyebrow text-quaternary">Type</div><div>{part.type}</div></div>
            <div><div className="type-eyebrow text-quaternary">Lifecycle</div><LifecycleStatus status={part.lifecycle} /></div>
            <div><div className="type-eyebrow text-quaternary">Owner</div><div>{part.owner}</div></div>
            <div><div className="type-eyebrow text-quaternary">Serviceable</div><div>{part.serviceable ? "Yes" : "No"}{part.fru ? " · FRU" : ""}</div></div>
            <div><div className="type-eyebrow text-quaternary">Unit cost</div><div className="tabular-nums">${part.cost.toLocaleString("en-US")}</div></div>
            <div><div className="type-eyebrow text-quaternary">Lead time</div><div>{plural(part.leadTimeDays, "day")}</div></div>
            <div><div className="type-eyebrow text-quaternary">UoM</div><div>{part.uom}</div></div>
            <div><div className="type-eyebrow text-quaternary">Created</div><div>{part.createdAt}</div></div>
            <div><div className="type-eyebrow text-quaternary">Updated</div><div>{part.updatedAt}</div></div>
            <div><div className="type-eyebrow text-quaternary">Warnings</div><div>{part.warnings ?? 0}</div></div>
          </div>
          {part.description && (
            <div className="mt-4 pt-3 border-t border-hairline type-body-sm text-tertiary leading-relaxed">{part.description}</div>
          )}
        </Panel>

        {supplier ? (
          <Panel title="Supplier" icon="supplier">
            <p className="type-body-md font-semibold mt-2">{supplier.name}</p>
            <p className="type-body-sm text-tertiary">{supplier.country} · Tier {supplier.tier}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 type-body-sm">
              <div><div className="type-eyebrow text-quaternary">Financial</div><div>{supplier.financialRating}</div></div>
              <div><div className="type-eyebrow text-quaternary">Geo risk</div><div>{supplier.geoRisk}</div></div>
              <div><div className="type-eyebrow text-quaternary">On-time</div><div>{supplier.onTimePct}%</div></div>
              <div><div className="type-eyebrow text-quaternary">Defect PPM</div><div>{supplier.pPMDefects}</div></div>
              {supplier.singleSource && <div className="col-span-2"><Badge variant="warning">Single-source</Badge></div>}
            </div>
          </Panel>
        ) : (
          <div className="rounded-lg border border-hairline bg-container p-4 type-body-sm text-tertiary">No supplier assigned (in-house or TBD).</div>
        )}
      </div>

      {/* Where-used + Uses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="overflow-hidden rounded-lg border border-hairline bg-container p-4">
          <PanelHeader className="-mx-4 -mt-4 mb-4" title="Where-Used (Parents)" icon="where-used" />
          <p className="type-body-sm text-tertiary mb-3">This part is used as a child of {whereUsed.length} parent assembl{whereUsed.length === 1 ? "y" : "ies"}.</p>
          <div className="space-y-2">
            {whereUsed.length === 0 && <p className="type-body-sm italic text-tertiary">Top-level vehicle. No parents.</p>}
            {whereUsed.map((e, i) => {
              const parent = getPart(e.parentPN);
              return (
                <button key={i} onClick={() => navigate(`/parts/${e.parentPN}`)} className="w-full flex items-center justify-between rounded-md border border-hairline p-2 hover:bg-raised">
                  <div className="flex items-center gap-2.5 text-left">
                    <EntityGlyph id={typeMark(parent?.type)} size={20} />
                    <div>
                      <div className="type-body-sm font-semibold">{parent?.name}</div>
                      <div className="type-caption font-mono text-tertiary">{e.parentPN} · qty {e.qty}{e.refDes ? ` · ${e.refDes}` : ""}</div>
                    </div>
                  </div>
                  <ExternalLink aria-hidden className="size-3.5 opacity-50" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-hairline bg-container p-4">
          <PanelHeader className="-mx-4 -mt-4 mb-4" title="Uses (Children)" icon="assembly" />
          <p className="type-body-sm text-tertiary mb-3">This part is built from {children.length} direct child part{children.length === 1 ? "" : "s"}.</p>
          <div className="space-y-2">
            {children.length === 0 && <p className="type-body-sm italic text-tertiary">Leaf part. No children.</p>}
            {children.map((e, i) => {
              const child = getPart(e.childPN);
              return (
                <button key={i} onClick={() => navigate(`/parts/${e.childPN}`)} className="w-full flex items-center justify-between rounded-md border border-hairline p-2 hover:bg-raised">
                  <div className="flex items-center gap-2.5 text-left">
                    <EntityGlyph id={typeMark(child?.type)} size={20} />
                    <div>
                      <div className="type-body-sm font-semibold">{child?.name}</div>
                      <div className="type-caption font-mono text-tertiary">{e.childPN} · qty {e.qty}</div>
                    </div>
                  </div>
                  <ExternalLink aria-hidden className="size-3.5 opacity-50" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Extras: routing / kits / software / ECNs / history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {routing.length > 0 && (
          <Panel title="Manufacturing Routing" icon="mbom">
            <div className="mt-2 space-y-2">
              {routing.map(op => {
                const plant = plants.find(p => p.id === op.plantId);
                return (
                  <div key={op.id} className="rounded-md border border-hairline p-2 type-body-sm">
                    <div className="font-semibold">{op.operation}</div>
                    <div className="type-caption text-tertiary">{plant?.name} · {op.line} · {op.station} · {op.takeTimeSec}s</div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        {kits.length > 0 && (
          <Panel title="Service Kits That Include This Part" icon="service-kit">
            <div className="mt-2 flex flex-wrap gap-1.5">
              {kits.map(k => <Badge key={k.id} variant="outline" className="type-caption font-mono">{k.id} · {k.name}</Badge>)}
            </div>
          </Panel>
        )}

        {softOnMe.length > 0 && (
          <Panel title="Software Running on This ECU" icon="software">
            <div className="mt-2 space-y-1.5">
              {softOnMe.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-md border border-hairline p-2 type-body-sm">
                  <div>
                    <div className="font-semibold">{s.name} <span className="font-mono text-tertiary">{s.version}</span></div>
                    <div className="type-caption text-tertiary">{s.license} · {s.supplier}</div>
                  </div>
                  {s.cves.length > 0
                    ? <Badge variant="error">{plural(s.cves.length, "CVE")}</Badge>
                    : <QuietStatus tone="success">Clean</QuietStatus>}
                </div>
              ))}
            </div>
          </Panel>
        )}

        {affectingEcns.length > 0 && (
          <Panel title="ECNs Affecting This Part" icon="ecn">
            <div className="mt-2 space-y-1.5">
              {affectingEcns.map(e => (
                <button key={e.id} onClick={() => navigate(`/changes/${e.id}`)} className="w-full flex items-center justify-between rounded-md border border-hairline p-2 hover:bg-raised text-left">
                  <div>
                    <div className="font-mono type-body-sm">{e.id}</div>
                    <div className="type-body-sm font-semibold">{e.title}</div>
                  </div>
                  {e.state === "In Review" ? <Badge variant="warning">{statusText(e.state)}</Badge> : e.state === "Rejected" || e.state === "Cancelled" ? <Badge variant="neutral">{statusText(e.state)}</Badge> : <QuietStatus tone={e.state === "Released" ? "success" : e.state === "Approved" ? "info" : "neutral"}>{statusText(e.state)}</QuietStatus>}
                </button>
              ))}
            </div>
          </Panel>
        )}

        {history.length > 0 && (
          <Panel title="Revision History" icon="history" className="lg:col-span-2">
            <div className="mt-3 relative pl-4 space-y-3 border-l border-hairline">
              {history.map((h, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[18px] top-1 h-2 w-2 rounded-full bg-action-primary" />
                  <div className="type-body-sm font-semibold">rev {h.revision} {h.ecnId && <span className="text-foreground font-mono">· {h.ecnId}</span>}</div>
                  <div className="type-body-sm">{h.note}</div>
                  <div className="type-caption text-tertiary">{h.date} · {h.by}</div>
                </div>
              ))}
            </div>
          </Panel>
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
