import { EmptyState, Panel, KpiTile } from "@/components/ui/primitives";
import { EntityIcon } from "@/components/icons/EntityIcon";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ecns, getPart, variants, revisions, type ECN,
} from "@/lib/mockData";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FileEdit, Search, ArrowLeft, Check, Clock, X as XIcon, AlertTriangle, Workflow,
  GitCommit, UserCircle2, Building2, History,
} from "lucide-react";

const stateCls = (s: string): BadgeVariant =>
  s === "Draft"      ? "neutral" :
  s === "In Review"  ? "warning" :
  s === "Approved"   ? "info" :
  s === "Released"   ? "success" :
  s === "Rejected"   ? "error" :
                       "neutral";

// Normal states are quiet text; only states that need attention get a solid badge.
const EcnState = ({ state }: { state: string }) =>
  state === "In Review" || state === "Rejected"
    ? <Badge variant={stateCls(state)}>{state}</Badge>
    : <span className="type-body-sm text-tertiary">{state}</span>;

const prioCls = (p: string): BadgeVariant =>
  p === "Critical" ? "error" :
  p === "High"     ? "warning" :
  p === "Medium"   ? "info" :
                     "neutral";

// State machine — progression order
const STATES: ECN["state"][] = ["Draft", "In Review", "Approved", "Released"];

const ChangesList = () => {
  const navigate = useNavigate();
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [reasonFilter, setReasonFilter] = useState<string>("ALL");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => ecns.filter(e =>
    (stateFilter === "ALL" || e.state === stateFilter) &&
    (reasonFilter === "ALL" || e.reason === reasonFilter) &&
    (!q || e.title.toLowerCase().includes(q.toLowerCase()) || e.id.toLowerCase().includes(q.toLowerCase()) || e.affectedPNs.some(pn => pn.toLowerCase().includes(q.toLowerCase())))
  ), [stateFilter, reasonFilter, q]);

  const pendingCount = ecns.filter(e => e.state === "In Review" || e.state === "Draft").length;
  const criticalOpen = ecns.filter(e => e.priority === "Critical" && e.state !== "Released" && e.state !== "Rejected").length;

  return (
    <PageHeader
      title="Change Management"
      mark="ecn"
      subtitle={`ECN · ${ecns.length} engineering changes · ${pendingCount} pending approval · ${criticalOpen} critical open`}
      actions={<Button size="sm" className="gap-1.5"><FileEdit aria-hidden className="h-3.5 w-3.5" />New ECN</Button>}
    >
      {/* State summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STATES.map(s => {
          const count = ecns.filter(e => e.state === s).length;
          return (
            <KpiTile key={s} label={s} value={count} />
          );
        })}
        <KpiTile label="Rejected / Cancelled" value={<>{ecns.filter(e => e.state === "Rejected" || e.state === "Cancelled").length}</>} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger aria-label="Filter by states" className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All states</SelectItem>
            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={reasonFilter} onValueChange={setReasonFilter}>
          <SelectTrigger aria-label="Filter by reason" className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any reason</SelectItem>
            {["Quality", "Cost", "Supplier", "Regulatory", "Cyber", "Field", "Engineering"].map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input aria-label="Search ECN, title, or PN" value={q} onChange={e => setQ(e.target.value)} placeholder="Search ECN, title, or PN" className="h-8 w-72 pl-8 text-xs" />
        </div>
        <Badge variant="secondary" className="ml-auto">{filtered.length} ECN{filtered.length === 1 ? "" : "s"}</Badge>
      </div>

      {/* List */}
      <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
        <table className="tabular w-full text-xs">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">ECN</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Title</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">State</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Priority</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Reason</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Affected PNs</th>
              <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">Cost/veh</th>
              <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">VINs</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Raised</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9}><EmptyState title="No changes match this filter" /></td></tr>
            )}
            {filtered.map(e => (
              <tr key={e.id} onClick={() => navigate(`/changes/${e.id}`)} className="border-t border-hairline hover:bg-raised cursor-pointer">
                <td className="px-3 py-2 font-mono font-semibold"><span className="inline-flex items-center gap-1.5"><EntityIcon id="ecn" />{e.id}</span></td>
                <td className="px-3 py-2">{e.title}</td>
                <td className="px-3 py-2"><EcnState state={e.state} /></td>
                <td className="px-3 py-2">{prioCls(e.priority) === "neutral" ? <span className="type-body-sm text-tertiary">{e.priority}</span> : <Badge variant={prioCls(e.priority)}>{e.priority}</Badge>}</td>
                <td className="px-3 py-2 text-muted-foreground">{e.reason}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {e.affectedPNs.slice(0, 2).map(pn => <span key={pn} className="font-mono type-caption text-muted-foreground">{pn}</span>)}
                    {e.affectedPNs.length > 2 && <span className="type-caption text-muted-foreground">+{e.affectedPNs.length - 2}</span>}
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{e.estCostImpactUsd >= 0 ? "+" : ""}${e.estCostImpactUsd}</td>
                <td className="px-3 py-2 text-right tabular-nums">{e.estVinsAffected.toLocaleString("en-US")}</td>
                <td className="px-3 py-2 type-body-sm text-muted-foreground">{e.raisedAt} · {e.raisedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageHeader>
  );
};

const ChangesDetail = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const ecn = ecns.find(e => e.id === id);
  if (!ecn) {
    return (
      <PageHeader title={`No change ${id}`} subtitle="That ECN does not exist in this program">
        <Button variant="outline" size="sm" onClick={() => navigate("/changes")}>
          <ArrowLeft aria-hidden className="h-3.5 w-3.5 mr-1" />Back to ECN list
        </Button>
      </PageHeader>
    );
  }

  const stateIdx = STATES.indexOf(ecn.state);

  return (
    <PageHeader
      title={`${ecn.id} · ${ecn.title}`}
      subtitle={`Raised by ${ecn.raisedBy} on ${ecn.raisedAt}`}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => navigate("/changes")}>
            <ArrowLeft aria-hidden className="h-3.5 w-3.5 mr-1" />All ECNs
          </Button>
          {ecn.state === "In Review" && <>
            <Button variant="outline" size="sm" className="gap-1.5 border-hairline text-success hover:bg-success-surface"><Check aria-hidden className="h-3.5 w-3.5" />Approve</Button>
            <Button variant="outline" size="sm" className="gap-1.5 border-hairline text-error hover:bg-error-surface"><XIcon aria-hidden className="h-3.5 w-3.5" />Reject</Button>
          </>}
        </>
      }
    >
      {/* State stepper */}
      <div className="rounded-lg border border-hairline bg-container p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {STATES.map((s, i) => {
            const done = i < stateIdx || ecn.state === "Released";
            const current = i === stateIdx;
            return (
              <div key={s} className="flex items-center gap-2 flex-1 min-w-[140px]">
                <div className={cn(
                  "h-7 w-7 rounded-full grid place-items-center text-xs font-semibold shrink-0",
                  done ? "bg-success text-success-foreground" :
                  current ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground",
                )}>
                  {done ? <Check aria-hidden className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <div className="min-w-0">
                  <div className={cn("text-xs font-semibold", current && "text-primary")}>{s}</div>
                  <div className="type-caption text-muted-foreground">{i === 0 ? "Draft" : i === 1 ? "CCB review" : i === 2 ? "Approval granted" : "Production released"}</div>
                </div>
                {i < STATES.length - 1 && <div className="h-px flex-1 bg-border mx-2 hidden md:block" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Core facts */}
        <Panel title="Change Summary">
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ecn.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div><div className="type-eyebrow text-quaternary">State</div><EcnState state={ecn.state} /></div>
            <div><div className="type-eyebrow text-quaternary">Priority</div>{prioCls(ecn.priority) === "neutral" ? <span className="type-body-sm text-tertiary">{ecn.priority}</span> : <Badge variant={prioCls(ecn.priority)}>{ecn.priority}</Badge>}</div>
            <div><div className="type-eyebrow text-quaternary">Reason</div><span>{ecn.reason}</span></div>
            <div><div className="type-eyebrow text-quaternary">Target rev</div><span>{ecn.targetRev ?? "—"}</span></div>
            <div><div className="type-eyebrow text-quaternary">Raised by</div><span>{ecn.raisedBy}</span></div>
            <div><div className="type-eyebrow text-quaternary">Approver</div><span>{ecn.approver ?? "—"}</span></div>
          </div>
        </Panel>

        {/* Impact */}
        <div className="rounded-lg border border-hairline bg-container p-4">
          <div className="flex items-center gap-2">
            <Workflow aria-hidden className="h-4 w-4 text-primary" />
            <h3 className="type-eyebrow text-quaternary">Impact Analysis</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-md border border-hairline p-2">
              <div className="type-eyebrow text-quaternary">Affected parts</div>
              <div className="text-lg font-semibold">{ecn.affectedPNs.length}</div>
            </div>
            <div className="rounded-md border border-hairline p-2">
              <div className="type-eyebrow text-quaternary">Affected variants</div>
              <div className="text-lg font-semibold">{ecn.affectedVariants.length || variants.length}</div>
            </div>
            <div className="rounded-md border border-hairline p-2">
              <div className="type-eyebrow text-quaternary">Cost per vehicle</div>
              <div className={cn("text-lg font-semibold tabular-nums", ecn.estCostImpactUsd > 0 ? "text-warning" : ecn.estCostImpactUsd < 0 ? "text-success" : "")}>
                {ecn.estCostImpactUsd >= 0 ? "+" : ""}${ecn.estCostImpactUsd}
              </div>
            </div>
            <div className="rounded-md border border-hairline p-2">
              <div className="type-eyebrow text-quaternary">VINs in field</div>
              <div className="text-lg font-semibold tabular-nums">{ecn.estVinsAffected.toLocaleString("en-US")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enriched Timeline — full width with role/department/description */}
      <div className="rounded-lg border border-hairline bg-container p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock aria-hidden className="h-4 w-4 text-primary" />
            <h3 className="type-eyebrow text-quaternary">Timeline · People & Rationale</h3>
          </div>
          <Badge variant="secondary" className="type-caption">{ecn.timeline.length} event{ecn.timeline.length === 1 ? "" : "s"}</Badge>
        </div>
        <div className="relative pl-6 space-y-5 border-l-2 border-hairline">
          {ecn.timeline.map((t, i) => {
            const isRaise = i === 0;
            const isApproval = /approved|awaiting ccb/i.test(t.event);
            const accent = isRaise ? "bg-action-primary" : isApproval ? "bg-success" : "bg-quaternary";
            return (
              <div key={i} className="relative">
                <span className={cn("absolute -left-[30px] top-1 h-4 w-4 rounded-full grid place-items-center", accent)}>
                  {isApproval ? <Check aria-hidden className="h-2.5 w-2.5 text-success-foreground" /> :
                   isRaise    ? <FileEdit aria-hidden className="h-2.5 w-2.5 text-primary-foreground" /> :
                                <span className="h-1.5 w-1.5 rounded-full bg-background" />}
                </span>

                {/* Header row: event name + date + stage tag */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm font-semibold">{t.event}</span>
                  <Badge variant="outline" className="type-caption font-mono">{t.at}</Badge>
                  {isRaise &&    <Badge variant="info">Raised</Badge>}
                  {isApproval && <Badge variant="success">Approval</Badge>}
                </div>

                {/* Person card */}
                <div className="mt-2 inline-flex items-center gap-2.5 rounded-lg border border-hairline bg-raised px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-action-primary grid place-items-center type-caption font-semibold text-on-color shrink-0">
                    {t.by.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="leading-tight text-xs min-w-0">
                    <div className="font-semibold flex items-center gap-1">
                      <UserCircle2 aria-hidden className="h-3 w-3 opacity-60" />
                      {t.by}
                    </div>
                    {t.role && <div className="type-body-sm text-muted-foreground">{t.role}</div>}
                    {t.department && (
                      <div className="type-caption text-muted-foreground flex items-center gap-1">
                        <Building2 aria-hidden className="h-2.5 w-2.5" />
                        {t.department}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {t.description && (
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-3xl">{t.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Affected parts table */}
      <div className="rounded-lg border border-hairline bg-container">
        <div className="p-4 border-b border-hairline flex items-center justify-between">
          <h3 className="type-eyebrow text-quaternary">Affected Parts ({ecn.affectedPNs.length})</h3>
          {ecn.affectedVariants.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ecn.affectedVariants.map(v => <Badge key={v} variant="outline" className="type-caption font-mono">{v}</Badge>)}
            </div>
          )}
        </div>
        <table className="tabular w-full text-xs">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Part Number</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Name</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Type</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Current Rev</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Supplier</th>
              <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">Unit Cost</th>
            </tr>
          </thead>
          <tbody>
            {ecn.affectedPNs.map(pn => {
              const part = getPart(pn);
              if (!part) return null;
              return (
                <tr key={pn} onClick={() => navigate(`/parts/${pn}`)} className="border-t border-hairline hover:bg-raised cursor-pointer">
                  <td className="px-3 py-2 font-mono">{pn}</td>
                  <td className="px-3 py-2 font-semibold">{part.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{part.type}</td>
                  <td className="px-3 py-2 font-mono">{part.revision}</td>
                  <td className="px-3 py-2 text-muted-foreground">{part.supplierId}</td>
                  <td className="px-3 py-2 text-right tabular-nums">${part.cost.toLocaleString("en-US")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Revision Lineage for each affected part */}
      <div className="rounded-lg border border-hairline bg-container">
        <div className="p-4 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History aria-hidden className="h-4 w-4 text-primary" />
            <h3 className="type-eyebrow text-quaternary">Revision Lineage</h3>
          </div>
          <span className="type-caption text-muted-foreground">History of each affected part across prior ECNs</span>
        </div>
        <div className="divide-y divide-border">
          {ecn.affectedPNs.map(pn => {
            const part = getPart(pn);
            const hist = revisions
              .filter(r => r.partNumber === pn)
              .sort((a, b) => a.date.localeCompare(b.date));
            return (
              <div key={pn} className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <button onClick={() => navigate(`/parts/${pn}`)} className="text-left">
                    <div className="text-sm font-semibold hover:text-primary">{part?.name ?? pn}</div>
                    <div className="type-body-sm font-mono text-muted-foreground">{pn} · current rev {part?.revision ?? "—"}</div>
                  </button>
                  <Badge variant="outline" className="type-caption">
                    {hist.length === 0 ? "No history" : `${hist.length} revision${hist.length === 1 ? "" : "s"}`}
                  </Badge>
                </div>

                {hist.length === 0 ? (
                  <div className="mt-3 rounded-md border border-dashed border-hairline bg-raised px-3 py-4 text-center">
                    <p className="text-xs text-muted-foreground">This part has not been revised yet — no lineage to display.</p>
                    <p className="type-caption text-muted-foreground mt-1">Once this ECN is released, it will appear here as the first revision entry.</p>
                  </div>
                ) : (
                  <div className="mt-3 relative pl-5 space-y-3 border-l border-hairline">
                    {hist.map((h, i) => {
                      const linkedEcn = h.ecnId ? ecns.find(e => e.id === h.ecnId) : null;
                      const isCurrent = i === hist.length - 1;
                      return (
                        <div key={i} className="relative">
                          <span className={cn(
                            "absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full grid place-items-center",
                            isCurrent ? "" : "bg-muted border border-hairline"
                          )}>
                            <GitCommit aria-hidden className={cn("h-2 w-2", isCurrent ? "text-primary-foreground" : "text-muted-foreground")} />
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("type-caption border", isCurrent ? "bg-raised text-primary border-strong" : "bg-muted text-muted-foreground")}>
                              rev {h.revision}
                            </Badge>
                            <span className="type-body-sm text-muted-foreground font-mono">{h.date}</span>
                            <span className="type-body-sm text-muted-foreground">· {h.by}</span>
                            {linkedEcn && (
                              <button
                                onClick={() => navigate(`/changes/${linkedEcn.id}`)}
                                className="type-caption font-mono px-1.5 py-0.5 rounded border border-hairline hover:bg-muted"
                              >
                                {linkedEcn.id}
                              </button>
                            )}
                          </div>
                          <p className="text-xs mt-1">{h.note}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {ecn.priority === "Critical" && (
        <div className="rounded-lg border border-hairline bg-error-surface p-3 flex items-center gap-3">
          <AlertTriangle aria-hidden className="h-4 w-4 text-error" />
          <span className="text-xs font-semibold text-error">Critical change</span>
          <span className="text-xs text-muted-foreground">Escalate if not actioned within 48h · notify CCB chair and program manager.</span>
        </div>
      )}
    </PageHeader>
  );
};

const Changes = () => {
  const { id } = useParams();
  return id ? <ChangesDetail id={id} /> : <ChangesList />;
};

export default Changes;
