"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ecns, getPart, variants, revisions, type ECN,
} from "@/lib/mockData";
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

const stateCls = (s: string) =>
  s === "Draft"      ? "bg-[#3f3f46] text-white border-transparent" :
  s === "In Review"  ? "bg-[#8a430f] text-white border-transparent" :
  s === "Approved"   ? "bg-[#175c6d] text-white border-transparent" :
  s === "Released"   ? "bg-[#275a3b] text-white border-transparent" :
  s === "Rejected"   ? "bg-[#891f24] text-white border-transparent" :
  s === "Cancelled"  ? "bg-[#891f24] text-white border-transparent" :
                       "bg-[#3f3f46] text-white border-transparent";

const prioCls = (p: string) =>
  p === "Critical" ? "bg-[#891f24] text-white border-transparent font-semibold" :
  p === "High"     ? "bg-[#9a3814] text-white border-transparent font-medium" :
  p === "Medium"   ? "bg-[#8a430f] text-white border-transparent font-medium" :
                     "bg-[#3f3f46] text-white border-transparent";

// State machine — progression order
const STATES: ECN["state"][] = ["Draft", "In Review", "Approved", "Released"];

const changesColumns = (router: ReturnType<typeof useRouter>): TableColumn<ECN>[] => [
  {
    id: "ecn",
    header: "ECN",
    width: "w-28",
    cell: (e) => (
      <button
        type="button"
        onClick={(evt) => {
          evt.stopPropagation();
          router.push(`/changes/${encodeURIComponent(e.id)}`);
        }}
        className="text-[11px] font-semibold text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded text-left"
        aria-label={`View details for ${e.id}`}
      >
        {e.id}
      </button>
    ),
    sortValue: (e) => e.id,
  },
  {
    id: "title",
    header: "Title",
    cell: (e) => (
      <span className="font-medium text-foreground text-xs leading-normal">
        {e.title}
      </span>
    ),
    sortValue: (e) => e.title,
  },
  {
    id: "state",
    header: "State",
    width: "w-28",
    cell: (e) => (
      <Badge className={cn("text-[9px] px-2 py-0.5 rounded-full border whitespace-nowrap font-medium", stateCls(e.state))}>
        {e.state}
      </Badge>
    ),
    sortValue: (e) => e.state,
  },
  {
    id: "priority",
    header: "Priority",
    width: "w-24",
    cell: (e) => (
      <Badge className={cn("text-[9px] px-2 py-0.5 rounded-full border whitespace-nowrap font-medium", prioCls(e.priority))}>
        {e.priority}
      </Badge>
    ),
    sortValue: (e) => {
      const ranks: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return ranks[e.priority] ?? 0;
    },
  },
  {
    id: "reason",
    header: "Reason",
    width: "w-28",
    cell: (e) => (
      <span className="text-muted-foreground text-[11px]">{e.reason}</span>
    ),
    sortValue: (e) => e.reason,
  },
  {
    id: "affectedPNs",
    header: "Affected PNs",
    width: "w-36",
    cell: (e) => (
      <div className="flex flex-wrap items-center gap-1">
        {e.affectedPNs.slice(0, 2).map((pn) => (
          <span
            key={pn}
            className="text-[10px] text-muted-foreground bg-surface-raised px-2 py-0.5 rounded-full border border-border"
          >
            {pn}
          </span>
        ))}
        {e.affectedPNs.length > 2 && (
          <span className="text-[10px] text-muted-foreground bg-surface-raised px-2 py-0.5 rounded-full border border-border">
            +{e.affectedPNs.length - 2}
          </span>
        )}
      </div>
    ),
    sortValue: (e) => e.affectedPNs.length,
  },
  {
    id: "cost",
    header: "Cost/veh",
    width: "w-24",
    align: "right",
    cell: (e) => (
      <span
        className={cn(
          "text-[11px] tabular-nums font-medium",
          e.estCostImpactUsd > 0
            ? "text-status-warning"
            : e.estCostImpactUsd < 0
            ? "text-status-success"
            : "text-foreground"
        )}
      >
        {e.estCostImpactUsd >= 0 ? "+" : ""}${e.estCostImpactUsd}
      </span>
    ),
    sortValue: (e) => e.estCostImpactUsd,
  },
  {
    id: "vins",
    header: "VINs",
    width: "w-24",
    align: "right",
    cell: (e) => (
      <span className="text-[11px] tabular-nums text-foreground">
        {e.estVinsAffected.toLocaleString()}
      </span>
    ),
    sortValue: (e) => e.estVinsAffected,
  },
  {
    id: "raised",
    header: "Raised",
    width: "w-44",
    cell: (e) => (
      <div className="text-[10px] text-muted-foreground whitespace-nowrap">
        <span className="text-foreground">{e.raisedAt}</span> · {e.raisedBy}
      </div>
    ),
    sortValue: (e) => e.raisedAt,
  },
];

const ChangesList = () => {
  const router = useRouter();
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [reasonFilter, setReasonFilter] = useState<string>("ALL");
  const [q, setQ] = useState("");

  const columns = useMemo(() => changesColumns(router), [router]);

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
      actions={
        <Button size="sm" className="btn-primary-white h-7 text-xs rounded-full gap-1.5 font-medium">
          <AppIcon name="changes" size="xs" />
          New ECN
        </Button>
      }
    >
      {/* State summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {STATES.map(s => {
          const count = ecns.filter(e => e.state === s).length;
          return (
            <div key={s} className="rounded-lg border border-border bg-surface-primary p-2.5 shadow-none">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{s}</div>
              <div className="text-base font-bold text-foreground mt-0.5">{count}</div>
            </div>
          );
        })}
        <div className="rounded-lg border border-border bg-surface-primary p-2.5 shadow-none">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Rejected / Cancelled</div>
          <div className="text-base font-bold text-muted-foreground mt-0.5">
            {ecns.filter(e => e.state === "Rejected" || e.state === "Cancelled").length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="h-7 w-36 text-xs rounded-full border-stroke-subtle bg-surface-primary">
            <SelectValue placeholder="All states" />
          </SelectTrigger>
          <SelectContent className="rounded-full border-stroke-subtle bg-popover text-xs">
            <SelectItem value="ALL">All states</SelectItem>
            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={reasonFilter} onValueChange={setReasonFilter}>
          <SelectTrigger className="h-7 w-36 text-xs rounded-full border-stroke-subtle bg-surface-primary">
            <SelectValue placeholder="Any reason" />
          </SelectTrigger>
          <SelectContent className="rounded-full border-stroke-subtle bg-popover text-xs">
            <SelectItem value="ALL">Any reason</SelectItem>
            {["Quality", "Cost", "Supplier", "Regulatory", "Cyber", "Field", "Engineering"].map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <AppIcon name="search" size="xs" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search ECN, title, or PN…"
            className="h-7 w-64 pl-7 text-xs rounded-full border-stroke-subtle bg-surface-secondary/30"
          />
        </div>
        <Badge variant="secondary" className="ml-auto rounded-full text-[9px] px-1.5 py-0 border-stroke-subtle">
          {filtered.length} ECN{filtered.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {/* Modernized Enterprise Table */}
      <EnterpriseTable<ECN>
        rows={filtered}
        columns={columns}
        rowKey={(e) => e.id}
        onRowClick={(e) => router.push(`/changes/${encodeURIComponent(e.id)}`)}
        dense
        caption="Engineering Change Orders (ECN)"
        emptyMessage={
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
            <div className="h-8 w-8 rounded-full bg-surface-secondary/50 flex items-center justify-center text-muted-foreground">
              <AppIcon name="search" size="sm" />
            </div>
            <div className="text-xs font-medium text-foreground">No change orders found</div>
            <div className="text-[11px] text-muted-foreground">
              No ECN matches the selected state, reason, or search query.
            </div>
            {(stateFilter !== "ALL" || reasonFilter !== "ALL" || q) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStateFilter("ALL");
                  setReasonFilter("ALL");
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

const ChangesDetail = ({ id }: { id: string }) => {
  const router = useRouter();
  const ecn = ecns.find(e => e.id === id);
  if (!ecn) {
    return (
      <PageHeader title="Change not found" subtitle={`ECN ${id} does not exist in this program`}>
        <Button variant="outline" size="sm" onClick={() => router.push("/changes")}>
          <AppIcon name="arrowLeft" size="xs" className="mr-1" />Back to ECN list
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
          <Button variant="outline" size="sm" onClick={() => router.push("/changes")} className="h-7 text-xs rounded-full gap-1">
            <AppIcon name="arrowLeft" size="xs" />All ECNs
          </Button>
          <Button size="sm" className="h-7 text-xs rounded-full gap-1.5 bg-[#275a3b] text-white hover:bg-[#317049] border-transparent font-medium">
            <AppIcon name="check" size="xs" className="text-white" />Approve
          </Button>
          <Button size="sm" className="h-7 text-xs rounded-full gap-1.5 bg-[#891f24] text-white hover:bg-[#a62a30] border-transparent font-medium">
            <AppIcon name="close" size="xs" className="text-white" />Reject
          </Button>
        </>
      }
    >
      {/* State stepper */}
      <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {STATES.map((s, i) => {
            const done = i < stateIdx || ecn.state === "Released";
            const current = i === stateIdx;
            return (
              <div key={s} className="flex items-center gap-2 flex-1 min-w-[140px]">
                <div className={cn(
                  "h-6 w-6 rounded-full grid place-items-center text-xs  font-bold shrink-0",
                  done ? "bg-[#275a3b] text-white border-transparent" :
                  current ? "bg-primary text-primary-foreground font-bold" :
                  "bg-surface-secondary text-muted-foreground border border-stroke-subtle",
                )}>
                  {done ? <AppIcon name="check" size="xs" /> : i + 1}
                </div>
                <div className="min-w-0">
                  <div className={cn("text-xs  font-semibold", current ? "text-primary" : "text-foreground")}>{s}</div>
                  <div className="text-[10px] text-muted-foreground">{i === 0 ? "Draft" : i === 1 ? "CCB review" : i === 2 ? "Approval granted" : "Production released"}</div>
                </div>
                {i < STATES.length - 1 && <div className="h-px flex-1 bg-stroke-subtle mx-2 hidden md:block" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Core facts */}
        <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Change Summary</h3>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{ecn.description}</p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">State</div><Badge className={cn("text-[9px]  px-1 py-0 rounded-full border", stateCls(ecn.state))}>{ecn.state}</Badge></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Priority</div><Badge className={cn("text-[9px]  px-1 py-0 rounded-full border", prioCls(ecn.priority))}>{ecn.priority}</Badge></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Reason</div><span className="text-foreground">{ecn.reason}</span></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Target rev</div><span className="text-foreground">{ecn.targetRev ?? "—"}</span></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Raised by</div><span className="text-foreground">{ecn.raisedBy}</span></div>
            <div><div className="text-[9px] uppercase tracking-wider text-muted-foreground">Approver</div><span className="text-foreground">{ecn.approver ?? "—"}</span></div>
          </div>
        </div>

        {/* Impact */}
        <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
          <div className="flex items-center gap-1.5">
            <AppIcon name="workflow" size="sm" className="text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Impact Analysis</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-border bg-surface-secondary/30 p-2">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Affected parts</div>
              <div className="text-base font-bold text-foreground mt-0.5">{ecn.affectedPNs.length}</div>
            </div>
            <div className="rounded-lg border border-border bg-surface-secondary/30 p-2">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Affected variants</div>
              <div className="text-base font-bold text-foreground mt-0.5">{ecn.affectedVariants.length || variants.length}</div>
            </div>
            <div className="rounded-lg border border-border bg-surface-secondary/30 p-2">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Cost per vehicle</div>
              <div className={cn("text-base  font-bold tabular-nums mt-0.5", ecn.estCostImpactUsd > 0 ? "text-warning" : ecn.estCostImpactUsd < 0 ? "text-success" : "text-foreground")}>
                {ecn.estCostImpactUsd >= 0 ? "+" : ""}${ecn.estCostImpactUsd}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface-secondary/30 p-2">
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground">VINs in field</div>
              <div className="text-base font-bold tabular-nums text-foreground mt-0.5">{ecn.estVinsAffected.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enriched Timeline — full width with role/department/description */}
      <div className="rounded-lg border border-border bg-surface-primary p-3 shadow-none">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <AppIcon name="clock" size="sm" className="text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timeline · People & Rationale</h3>
          </div>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded-full border-stroke-subtle">{ecn.timeline.length} event{ecn.timeline.length === 1 ? "" : "s"}</Badge>
        </div>
        <div className="relative pl-5 space-y-4 border-l border-stroke-subtle">
          {ecn.timeline.map((t, i) => {
            const isRaise = i === 0;
            const isApproval = /approved|awaiting ccb/i.test(t.event);
            const accent = isRaise ? "bg-primary" : isApproval ? "bg-success" : "bg-accent";
            return (
              <div key={i} className="relative">
                <span className={cn("absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full", accent)} />

                {/* Header row: event name + date + stage tag */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-medium text-foreground">{t.event}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 rounded-full border-stroke-subtle">{t.at}</Badge>
                  {isRaise &&    <Badge className="bg-primary/15 text-primary border-primary/30 text-[9px] px-1 py-0 rounded-full">Raised</Badge>}
                  {isApproval && <Badge className="bg-[#275a3b] text-white border-transparent text-[9px] px-2 py-0.5 rounded-full font-medium">Approval</Badge>}
                </div>

                {/* Person card */}
                <div className="mt-1.5 inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary/40 px-2.5 py-1">
                  <div className="h-5 w-5 rounded-full bg-primary/20 text-primary border border-primary/30 grid place-items-center text-[9px] font-bold shrink-0">
                    {t.by.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="leading-tight text-xs min-w-0">
                    <div className="font-medium flex items-center gap-1 text-foreground">
                      <AppIcon name="user" size="xs" className="opacity-60" />
                      {t.by}
                    </div>
                    {t.role && <div className="text-[10px] text-muted-foreground">{t.role}</div>}
                    {t.department && (
                      <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                        <AppIcon name="building" size="xs" />
                        {t.department}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {t.description && (
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-3xl">{t.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Affected parts table */}
      <div className="rounded-lg border border-border bg-surface-primary shadow-none overflow-x-auto">
        <div className="p-3 border-b border-stroke-subtle flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Affected Parts ({ecn.affectedPNs.length})</h3>
          {ecn.affectedVariants.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {ecn.affectedVariants.map(v => <Badge key={v} variant="outline" className="text-[9px] px-1 py-0 rounded-full border-stroke-subtle">{v}</Badge>)}
            </div>
          )}
        </div>
        <table className="w-full text-xs">
          <thead className="h-8 text-[9px] uppercase tracking-wider text-muted-foreground bg-surface-secondary/40 border-b border-stroke-subtle">
            <tr>
              <th className="text-left px-3 py-2">Part Number</th>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Current Rev</th>
              <th className="text-left px-3 py-2">Supplier</th>
              <th className="text-right px-3 py-2">Unit Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke-subtle">
            {ecn.affectedPNs.map(pn => {
              const part = getPart(pn);
              if (!part) return null;
              return (
                <tr key={pn} onClick={() => router.push(`/parts/${pn}`)} className="hover:bg-surface-secondary/50 cursor-pointer transition-colors">
                  <td className="px-3 py-1.5 font-semibold text-foreground text-[11px]">{pn}</td>
                  <td className="px-3 py-1.5 font-medium text-foreground">{part.name}</td>
                  <td className="px-3 py-1.5 text-muted-foreground text-[11px]">{part.type}</td>
                  <td className="px-3 py-1.5 text-foreground text-[11px]">{part.revision}</td>
                  <td className="px-3 py-1.5 text-muted-foreground text-[11px]">{part.supplierId}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-foreground text-[11px]">${part.cost.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Revision Lineage for each affected part */}
      <div className="rounded-lg border border-border bg-surface-primary shadow-none">
        <div className="p-3 border-b border-stroke-subtle flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AppIcon name="history" size="sm" className="text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revision Lineage</h3>
          </div>
          <span className="text-[10px] text-muted-foreground">History of each affected part across prior ECNs</span>
        </div>
        <div className="divide-y divide-stroke-subtle">
          {ecn.affectedPNs.map(pn => {
            const part = getPart(pn);
            const hist = revisions
              .filter(r => r.partNumber === pn)
              .sort((a, b) => a.date.localeCompare(b.date));
            return (
              <div key={pn} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{pn}</span>
                    <span className="text-xs text-muted-foreground">{part?.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 rounded-full border-stroke-subtle">Rev {part?.revision} active</Badge>
                </div>
                {hist.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No historical revisions recorded.</p>
                ) : (
                  <div className="mt-2 relative pl-4 space-y-2 border-l border-stroke-subtle">
                    {hist.map((h, i) => {
                      const linkedEcn = h.ecnId ? ecns.find(e => e.id === h.ecnId) : null;
                      const isCurrent = i === hist.length - 1;
                      return (
                        <div key={i} className="relative">
                          <span className={cn(
                            "absolute -left-[20px] top-1.5 h-2 w-2 rounded-full",
                            isCurrent ? "bg-primary" : "bg-surface-secondary border border-stroke-subtle"
                          )} />
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={cn("text-[9px]  px-1 py-0 rounded-full border", isCurrent ? "bg-primary/15 text-primary border-primary/30" : "bg-surface-secondary text-muted-foreground border-stroke-subtle")}>
                              rev {h.revision}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{h.date}</span>
                            <span className="text-[10px] text-muted-foreground">· {h.by}</span>
                            {linkedEcn && (
                              <button
                                onClick={() => router.push(`/changes/${linkedEcn.id}`)}
                                className="text-[9px] px-1.5 py-0 rounded-lg border border-border hover:bg-surface-secondary text-foreground"
                              >
                                {linkedEcn.id}
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>
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
        <div className="rounded-lg border border-critical/30 bg-critical/5 p-3 flex items-center gap-2.5 text-xs">
          <AppIcon name="warning" size="sm" className="text-critical shrink-0" />
          <span className="font-semibold text-critical">CRITICAL CHANGE</span>
          <span className="text-muted-foreground">Escalate if not actioned within 48h · notify CCB chair and program manager.</span>
        </div>
      )}
    </PageHeader>
  );
};

export default function ChangesPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id[0] : undefined;
  return id ? <ChangesDetail id={id} /> : <ChangesList />;
}
