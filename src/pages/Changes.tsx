import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ecns, getPart, variants, revisions, type ECN,
} from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
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

const stateCls = (s: string) =>
  s === "Draft"      ? "bg-muted text-muted-foreground border-border" :
  s === "In Review"  ? "bg-warning/15 text-warning border-warning/30" :
  s === "Approved"   ? "bg-accent/15 text-accent border-accent/30" :
  s === "Released"   ? "bg-success/15 text-success border-success/30" :
  s === "Rejected"   ? "bg-critical/15 text-critical border-critical/30" :
                       "bg-muted text-muted-foreground border-border";

const prioCls = (p: string) =>
  p === "Critical" ? "bg-critical/15 text-critical border-critical/30" :
  p === "High"     ? "bg-orange-500/15 text-orange-500 border-orange-500/30" :
  p === "Medium"   ? "bg-warning/15 text-warning border-warning/30" :
                     "bg-muted text-muted-foreground border-border";

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
      title="Change Management (ECN)"
      subtitle={`${ecns.length} engineering changes · ${pendingCount} pending approval · ${criticalOpen} critical open`}
      actions={<Button size="sm" className="gap-1.5 bg-gradient-primary border-0"><FileEdit className="h-3.5 w-3.5" />New ECN</Button>}
    >
      {/* State summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STATES.map(s => {
          const count = ecns.filter(e => e.state === s).length;
          return (
            <div key={s} className="rounded-lg border border-border bg-card p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s}</div>
              <div className="text-lg font-bold">{count}</div>
            </div>
          );
        })}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rejected / Cancelled</div>
          <div className="text-lg font-bold text-muted-foreground">{ecns.filter(e => e.state === "Rejected" || e.state === "Cancelled").length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All states</SelectItem>
            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={reasonFilter} onValueChange={setReasonFilter}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any reason</SelectItem>
            {["Quality", "Cost", "Supplier", "Regulatory", "Cyber", "Field", "Engineering"].map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search ECN, title, or PN…" className="h-8 w-72 pl-8 text-xs" />
        </div>
        <Badge variant="secondary" className="ml-auto">{filtered.length} ECN{filtered.length === 1 ? "" : "s"}</Badge>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40">
            <tr>
              <th className="text-left p-3">ECN</th>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">State</th>
              <th className="text-left p-3">Priority</th>
              <th className="text-left p-3">Reason</th>
              <th className="text-left p-3">Affected PNs</th>
              <th className="text-right p-3">Cost/veh</th>
              <th className="text-right p-3">VINs</th>
              <th className="text-left p-3">Raised</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} onClick={() => navigate(`/changes/${e.id}`)} className="border-t border-border/40 hover:bg-muted/30 cursor-pointer">
                <td className="p-3 font-mono font-semibold">{e.id}</td>
                <td className="p-3">{e.title}</td>
                <td className="p-3"><Badge className={cn("text-[10px] border", stateCls(e.state))}>{e.state}</Badge></td>
                <td className="p-3"><Badge className={cn("text-[10px] border", prioCls(e.priority))}>{e.priority}</Badge></td>
                <td className="p-3 text-muted-foreground">{e.reason}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {e.affectedPNs.slice(0, 2).map(pn => <span key={pn} className="font-mono text-[10px] text-muted-foreground">{pn}</span>)}
                    {e.affectedPNs.length > 2 && <span className="text-[10px] text-muted-foreground">+{e.affectedPNs.length - 2}</span>}
                  </div>
                </td>
                <td className="p-3 text-right tabular-nums">{e.estCostImpactUsd >= 0 ? "+" : ""}${e.estCostImpactUsd}</td>
                <td className="p-3 text-right tabular-nums">{e.estVinsAffected.toLocaleString()}</td>
                <td className="p-3 text-[11px] text-muted-foreground">{e.raisedAt} · {e.raisedBy}</td>
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
      <PageHeader title="Change not found" subtitle={`ECN ${id} does not exist in this program`}>
        <Button variant="outline" size="sm" onClick={() => navigate("/changes")}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />Back to ECN list
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
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />All ECNs
          </Button>
          {ecn.state === "In Review" && <>
            <Button variant="outline" size="sm" className="gap-1.5 border-success/40 text-success hover:bg-success/10"><Check className="h-3.5 w-3.5" />Approve</Button>
            <Button variant="outline" size="sm" className="gap-1.5 border-critical/40 text-critical hover:bg-critical/10"><XIcon className="h-3.5 w-3.5" />Reject</Button>
          </>}
        </>
      }
    >
      {/* State stepper */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {STATES.map((s, i) => {
            const done = i < stateIdx || ecn.state === "Released";
            const current = i === stateIdx;
            return (
              <div key={s} className="flex items-center gap-2 flex-1 min-w-[140px]">
                <div className={cn(
                  "h-7 w-7 rounded-full grid place-items-center text-xs font-bold shrink-0",
                  done ? "bg-success text-success-foreground" :
                  current ? "bg-primary text-primary-foreground shadow-glow" :
                  "bg-muted text-muted-foreground",
                )}>
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <div className="min-w-0">
                  <div className={cn("text-xs font-semibold", current && "text-primary")}>{s}</div>
                  <div className="text-[10px] text-muted-foreground">{i === 0 ? "Draft" : i === 1 ? "CCB review" : i === 2 ? "Approval granted" : "Production released"}</div>
                </div>
                {i < STATES.length - 1 && <div className="h-px flex-1 bg-border mx-2 hidden md:block" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Core facts */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold">Change Summary</h3>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ecn.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div><div className="text-[10px] uppercase text-muted-foreground">State</div><Badge className={cn("text-[10px] border", stateCls(ecn.state))}>{ecn.state}</Badge></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Priority</div><Badge className={cn("text-[10px] border", prioCls(ecn.priority))}>{ecn.priority}</Badge></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Reason</div><span>{ecn.reason}</span></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Target rev</div><span>{ecn.targetRev ?? "—"}</span></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Raised by</div><span>{ecn.raisedBy}</span></div>
            <div><div className="text-[10px] uppercase text-muted-foreground">Approver</div><span>{ecn.approver ?? "—"}</span></div>
          </div>
        </div>

        {/* Impact */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Impact Analysis</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-md border border-border p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Affected parts</div>
              <div className="text-lg font-bold">{ecn.affectedPNs.length}</div>
            </div>
            <div className="rounded-md border border-border p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Affected variants</div>
              <div className="text-lg font-bold">{ecn.affectedVariants.length || variants.length}</div>
            </div>
            <div className="rounded-md border border-border p-2">
              <div className="text-[10px] uppercase text-muted-foreground">Cost per vehicle</div>
              <div className={cn("text-lg font-bold tabular-nums", ecn.estCostImpactUsd > 0 ? "text-warning" : ecn.estCostImpactUsd < 0 ? "text-success" : "")}>
                {ecn.estCostImpactUsd >= 0 ? "+" : ""}${ecn.estCostImpactUsd}
              </div>
            </div>
            <div className="rounded-md border border-border p-2">
              <div className="text-[10px] uppercase text-muted-foreground">VINs in field</div>
              <div className="text-lg font-bold tabular-nums">{ecn.estVinsAffected.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enriched Timeline — full width with role/department/description */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Timeline · People & Rationale</h3>
          </div>
          <Badge variant="secondary" className="text-[10px]">{ecn.timeline.length} event{ecn.timeline.length === 1 ? "" : "s"}</Badge>
        </div>
        <div className="relative pl-6 space-y-5 border-l-2 border-border">
          {ecn.timeline.map((t, i) => {
            const isRaise = i === 0;
            const isApproval = /approved|awaiting ccb/i.test(t.event);
            const accent = isRaise ? "bg-primary" : isApproval ? "bg-success" : "bg-accent";
            return (
              <div key={i} className="relative">
                <span className={cn("absolute -left-[30px] top-1 h-4 w-4 rounded-full grid place-items-center shadow-glow", accent)}>
                  {isApproval ? <Check className="h-2.5 w-2.5 text-success-foreground" /> :
                   isRaise    ? <FileEdit className="h-2.5 w-2.5 text-primary-foreground" /> :
                                <span className="h-1.5 w-1.5 rounded-full bg-background" />}
                </span>

                {/* Header row: event name + date + stage tag */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm font-semibold">{t.event}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{t.at}</Badge>
                  {isRaise &&    <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">Raised</Badge>}
                  {isApproval && <Badge className="bg-success/15 text-success border-success/30 text-[10px]">Approval</Badge>}
                </div>

                {/* Person card */}
                <div className="mt-2 inline-flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary grid place-items-center text-[10px] font-bold text-primary-foreground shrink-0">
                    {t.by.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="leading-tight text-xs min-w-0">
                    <div className="font-semibold flex items-center gap-1">
                      <UserCircle2 className="h-3 w-3 opacity-60" />
                      {t.by}
                    </div>
                    {t.role && <div className="text-[11px] text-muted-foreground">{t.role}</div>}
                    {t.department && (
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-2.5 w-2.5" />
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
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Affected Parts ({ecn.affectedPNs.length})</h3>
          {ecn.affectedVariants.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ecn.affectedVariants.map(v => <Badge key={v} variant="outline" className="text-[10px] font-mono">{v}</Badge>)}
            </div>
          )}
        </div>
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/20">
            <tr>
              <th className="text-left p-3">Part Number</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Current Rev</th>
              <th className="text-left p-3">Supplier</th>
              <th className="text-right p-3">Unit Cost</th>
            </tr>
          </thead>
          <tbody>
            {ecn.affectedPNs.map(pn => {
              const part = getPart(pn);
              if (!part) return null;
              return (
                <tr key={pn} onClick={() => navigate(`/parts/${pn}`)} className="border-t border-border/40 hover:bg-muted/30 cursor-pointer">
                  <td className="p-3 font-mono">{pn}</td>
                  <td className="p-3 font-semibold">{part.name}</td>
                  <td className="p-3 text-muted-foreground">{part.type}</td>
                  <td className="p-3 font-mono">{part.revision}</td>
                  <td className="p-3 text-muted-foreground">{part.supplierId}</td>
                  <td className="p-3 text-right tabular-nums">${part.cost.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Revision Lineage for each affected part */}
      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Revision Lineage</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">History of each affected part across prior ECNs</span>
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
                    <div className="text-[11px] font-mono text-muted-foreground">{pn} · current rev {part?.revision ?? "—"}</div>
                  </button>
                  <Badge variant="outline" className="text-[10px]">
                    {hist.length === 0 ? "No history" : `${hist.length} revision${hist.length === 1 ? "" : "s"}`}
                  </Badge>
                </div>

                {hist.length === 0 ? (
                  <div className="mt-3 rounded-md border border-dashed border-border bg-muted/20 px-3 py-4 text-center">
                    <p className="text-xs text-muted-foreground">This part has not been revised yet — no lineage to display.</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Once this ECN is released, it will appear here as the first revision entry.</p>
                  </div>
                ) : (
                  <div className="mt-3 relative pl-5 space-y-3 border-l border-border">
                    {hist.map((h, i) => {
                      const linkedEcn = h.ecnId ? ecns.find(e => e.id === h.ecnId) : null;
                      const isCurrent = i === hist.length - 1;
                      return (
                        <div key={i} className="relative">
                          <span className={cn(
                            "absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full grid place-items-center",
                            isCurrent ? "bg-gradient-primary shadow-glow" : "bg-muted border border-border"
                          )}>
                            <GitCommit className={cn("h-2 w-2", isCurrent ? "text-primary-foreground" : "text-muted-foreground")} />
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("text-[10px] border", isCurrent ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground")}>
                              rev {h.revision}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground font-mono">{h.date}</span>
                            <span className="text-[11px] text-muted-foreground">· {h.by}</span>
                            {linkedEcn && (
                              <button
                                onClick={() => navigate(`/changes/${linkedEcn.id}`)}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border hover:bg-muted"
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
        <div className="rounded-xl border border-critical/30 bg-critical/5 p-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-critical" />
          <span className="text-xs font-semibold text-critical">Critical change</span>
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
