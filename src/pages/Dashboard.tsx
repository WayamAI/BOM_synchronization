import { plural, statusText } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import { programs, suppliers } from "@/lib/mockData";
import { useProgramContext } from "@/context/ProgramContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthArc } from "@/components/dashboard/HealthArc";
import { SystemHealthMatrix } from "@/components/dashboard/SystemHealthMatrix";
import { PageHeader } from "@/components/layout/PageHeader";
import { Panel, KpiTile, EmptyState, StatusDot, QuietStatus } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { Sparkles, FileEdit, ShieldAlert, FileBarChart, AlertTriangle, ArrowRight } from "lucide-react";
import { Bar, Line, ComposedChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { axisTick, chartTooltipLabelStyle, chartTooltipStyle } from "@/components/dashboard/chartTheme";

const STAGES = ["Concept", "Design", "Engineering", "Pre-Production", "SOP"] as const;

type Tone = "neutral" | "info" | "warning" | "success";

const stageBadge = (stage: string): Tone => {
  const map: Record<string, Tone> = {
    "Concept":        "neutral",
    "Design":         "info",
    "Engineering":    "info",
    "Validation":     "info",
    "Pre-Production": "warning",
    "SOP":            "success",
    "In-Production":  "success",
  };
  return map[stage] ?? map["Pre-Production"];
};

// critical -> error, high -> warning, medium -> info, low -> neutral
const sevTone = (s: string) =>
  s === "critical" ? "error" :
  s === "high" ? "warning" :
  s === "medium" ? "info" : "neutral";

const Dashboard = () => {
  const navigate = useNavigate();
  const { activeProgram, setActiveProgramId } = useProgramContext();

  // Per-program KPI computations
  const progParts      = activeProgram.parts.filter(pt => pt.type !== "Vehicle" && pt.type !== "System");
  const progAssemblies = activeProgram.parts.filter(pt => pt.type === "Assembly" || pt.type === "Sub-Assembly");
  const progSuppliers  = new Set(activeProgram.parts.filter(pt => pt.supplierId).map(pt => pt.supplierId!));
  const pendingEcns    = activeProgram.ecns.filter(e => e.state === "In Review" || e.state === "Draft");

  // Per-program health arc scores
  const releasedParts  = progParts.filter(p => p.lifecycle === "Released");
  const ebomScore      = progParts.length ? Math.round(releasedParts.length / progParts.length * 100) : 0;

  const routedPNs      = new Set(activeProgram.mbomOps.map(o => o.partNumber));
  const mbomScore      = progAssemblies.length
    ? Math.round(progAssemblies.filter(a => routedPNs.has(a.partNumber)).length / progAssemblies.length * 100)
    : 0;

  const usedSupplierIds   = new Set(progParts.map(p => p.supplierId).filter(Boolean) as string[]);
  const usedSuppliers     = suppliers.filter(s => usedSupplierIds.has(s.id));
  const singleSrcCount    = usedSuppliers.filter(s => s.singleSource).length;
  const supplyScore       = usedSuppliers.length
    ? Math.round((1 - singleSrcCount / usedSuppliers.length) * 100)
    : 80;

  const serviceableParts  = progParts.filter(p => p.serviceable || p.fru);
  const serviceScore      = progParts.length
    ? Math.round(serviceableParts.length / progParts.length * 100)
    : 0;

  return (
    <PageHeader
      title="Command Center"
      mark="assembly"
      subtitle={`${activeProgram.name} · ${activeProgram.modelYear} · ${activeProgram.stage} · ${plural(activeProgram.daysToSOP, "day")} to SOP · ${plural(activeProgram.pilotVinsBuilt, "unit")} built · ${plural(activeProgram.activeEcns, "ECN")}`}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => navigate("/changes")}>
            <FileEdit aria-hidden /> ECN
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/software")}>
            <ShieldAlert aria-hidden /> Cyber
          </Button>
          <Button size="sm" onClick={() => navigate("/reports")}>
            <FileBarChart aria-hidden /> Export
          </Button>
        </>
      }
    >
      {/* Fleet summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {programs.map(prog => (
          <button
            key={prog.id}
            onClick={() => setActiveProgramId(prog.id)}
            aria-pressed={activeProgram.id === prog.id}
            className={cn(
              "rounded-lg border p-3 text-left outline-none transition-colors duration-[150ms] focus-visible:ring-2 focus-visible:ring-active",
              activeProgram.id === prog.id
                ? "border-strong bg-raised"
                : "border-hairline bg-container hover:border-strong",
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="type-label-md truncate text-foreground">{prog.name}</div>
                <div className="type-caption truncate text-quaternary">{prog.category}</div>
              </div>
              <span className="type-body-sm tabular shrink-0 text-quaternary">{prog.modelYear}</span>
            </div>
            <QuietStatus tone={stageBadge(prog.stage)}>{prog.stage}</QuietStatus>
            <div className="type-body-sm mt-2 grid grid-cols-2 gap-x-2">
              <div className="text-tertiary">Health</div>
              <div className="tabular text-right text-foreground">{prog.healthScore}%</div>
              <div className="text-tertiary">SOP in</div>
              <div className="tabular text-right text-foreground">{prog.daysToSOP}d</div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* KPI row, scoped to the active program */}
        <div className="col-span-12 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Parts",         value: progParts.length,                 trend: "eBOM",   to: "/ebom" },
            { label: "Assemblies",    value: progAssemblies.length,            trend: "Stable", to: "/ebom" },
            { label: "Operations",    value: activeProgram.mbomOps.length,     trend: "mBOM",   to: "/mbom" },
            { label: "Service kits",  value: activeProgram.serviceKits.length, trend: "Ready",  to: "/service" },
            { label: "Suppliers",     value: progSuppliers.size,               trend: "Live",   to: "/suppliers" },
            { label: "Variants",      value: activeProgram.variants.length,    trend: `${activeProgram.variants.length} active`, to: "/variants" },
          ].map(k => (
            <KpiTile
              key={k.label}
              label={k.label}
              value={k.value.toLocaleString("en-US")}
              hint={k.trend}
              onClick={() => navigate(k.to)}
            />
          ))}
        </div>

        {/* Health row */}
        <div className="col-span-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HealthArc value={ebomScore} label="EBOM maturity" direction="higher-better" micro={[{ label: "Released", value: `${releasedParts.length}/${progParts.length}` }, { label: "In review", value: String(progParts.filter(p => p.lifecycle === "In Review").length) }]} />
          <HealthArc value={mbomScore} label="MBOM readiness" direction="higher-better" micro={[{ label: "Operations", value: String(activeProgram.mbomOps.length) }, { label: "Plants", value: String(new Set(activeProgram.mbomOps.map(o => o.plantId)).size) }]} />
          <HealthArc value={100 - supplyScore} label="Supply risk" direction="lower-better" micro={[{ label: "Single-source", value: String(singleSrcCount) }, { label: "Suppliers", value: String(usedSuppliers.length) }]} />
          <HealthArc value={serviceScore} label="Service scope" direction="higher-better" micro={[{ label: "Kits", value: String(activeProgram.serviceKits.length) }, { label: "Serviceable", value: `${serviceableParts.length}` }]} />
        </div>

        <div className="col-span-12 flex flex-col xl:col-span-8">
          <SystemHealthMatrix />
        </div>

        <div className="col-span-12 flex flex-col gap-4 xl:col-span-4">
          <Panel title="Program Stage Pipeline" icon="variant" className="flex-none">
            <div className="space-y-3">
              {programs.map(prog => {
                const idx = STAGES.indexOf(prog.stage as typeof STAGES[number]);
                const pct = idx < 0 ? 5 : Math.round(((idx + 1) / STAGES.length) * 100);
                return (
                  <div key={prog.id}>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className={cn("type-label-sm truncate", activeProgram.id === prog.id ? "text-foreground" : "text-tertiary")}>{prog.name}</span>
                      <QuietStatus tone={stageBadge(prog.stage)}>{prog.stage}</QuietStatus>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-raised-2">
                      <div className="h-full rounded-full bg-action-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="type-caption mt-3 flex justify-between px-0.5 text-quaternary">
              {STAGES.map(s => <span key={s}>{s}</span>)}
            </div>
          </Panel>

          <Panel
            title="AI Assistant · Briefing"
            action={<Sparkles className="size-3.5 text-quaternary" aria-hidden />}
            className="min-h-[320px] flex-1"
          >
            <div className="flex h-full flex-col">
              <div className="space-y-4">
                {activeProgram.aiBriefing.map(b => (
                  <div key={b.priority} className="flex gap-3">
                    <span className="type-caption tabular mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-action text-secondary-foreground">
                      {b.priority}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="type-body-md text-foreground">{b.text}</p>
                      <div className="type-caption mt-1 flex items-center gap-1.5 text-warning">
                        <AlertTriangle className="size-3" aria-hidden /> Critical impact · {b.impact}
                      </div>
                    </div>
                  </div>
                ))}

                {activeProgram.ecns[0] && (
                  <div className="rounded-md border border-hairline bg-raised px-3 py-2">
                    <div className="type-eyebrow mb-1 text-quaternary">Actionable insight</div>
                    <p className="type-body-sm text-tertiary">
                      "{activeProgram.ecns[0].title} ({activeProgram.ecns[0].id}), prioritize resolution before next gate."
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-auto pt-4">
                <Button variant="outline" size="sm" className="w-full">
                  Explore AI strategy <ArrowRight aria-hidden />
                </Button>
              </div>
            </div>
          </Panel>

          <Panel
            title="Security Hub"
            className="flex-none"
          >
            <p className="type-body-sm text-tertiary">No active cybersecurity threats detected in the last <span className="tabular text-foreground">240 hours</span>. SOC status: Normal.</p>
          </Panel>
        </div>

        {/* ECN Approval Queue, scoped to the active program */}
        <div className="col-span-12 xl:col-span-6">
          <Panel
            title="ECN Approval Queue"
            icon="ecn"
            className="h-full min-h-[340px]"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate("/changes")}>
                Monitor <ArrowRight aria-hidden />
              </Button>
            }
          >
            {pendingEcns.length === 0 ? (
              <EmptyState title={`No pending ECNs for ${activeProgram.name}`} mark="ecn" />
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {pendingEcns.slice(0, 4).map(e => (
                  <button
                    key={e.id}
                    onClick={() => navigate(`/changes/${e.id}`)}
                    className="rounded-md border border-hairline bg-raised p-3 text-left outline-none transition-colors duration-[150ms] hover:border-strong focus-visible:ring-2 focus-visible:ring-active"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <span className="type-caption font-mono text-quaternary">{e.id}</span>
                      <Badge variant="warning">{statusText(e.state)}</Badge>
                    </div>
                    <p className="type-body-md line-clamp-1 text-foreground">{e.title}</p>
                    <p className="type-body-sm mt-0.5 line-clamp-1 text-tertiary">{e.reason}</p>
                  </button>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* Change Velocity, scoped to the active program */}
        <div className="col-span-12 xl:col-span-6">
          <Panel
            title="Change Velocity"
            className="h-full min-h-[340px]"
            action={<span className="type-caption tabular text-quaternary">{activeProgram.name}</span>}
          >
            <p className="type-body-sm text-tertiary">Changes per week (bars, left axis) and average cycle time in days (line, right axis)</p>
            <div className="mt-2 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeProgram.changeVelocity} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={axisTick} />
                  <YAxis yAxisId="count" width={28} axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} />
                  <YAxis yAxisId="days" orientation="right" width={28} axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartTooltipLabelStyle} itemStyle={chartTooltipLabelStyle} cursor={{ fill: "var(--surface-raised)" }} />
                  <Legend verticalAlign="bottom" height={28} formatter={(v: string) => <span style={{ color: "var(--text-tertiary)" }}>{v}</span>} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "var(--text-tertiary)" }} />
                  <Bar yAxisId="count" name="Approved" dataKey="approved" stackId="a" fill="var(--analytics-series-2)" barSize={12} isAnimationActive={false} />
                  <Bar yAxisId="count" name="Rejected" dataKey="rejected" stackId="a" fill="var(--analytics-series-4)" barSize={12} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  <Line yAxisId="days" name="Cycle time (days)" type="monotone" dataKey="cycle" stroke="var(--analytics-series-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* Live Quality Stream, scoped to the active program */}
        <div className="col-span-12">
          <Panel
            title={<span className="inline-flex items-center gap-2"><StatusDot tone="success" />Live Quality Stream · {activeProgram.name}</span>}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate("/field")}>
                Expand stream <ArrowRight aria-hidden />
              </Button>
            }
          >
            {activeProgram.fieldEvents.length === 0 ? (
              <EmptyState title={`No active field events for ${activeProgram.name}`} className="min-h-[96px]" />
            ) : (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
                {activeProgram.fieldEvents.map(e => (
                  <div key={e.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-hairline px-2 py-1.5 transition-colors duration-[150ms] hover:border-strong">
                    <StatusDot tone={sevTone(e.severity)} />
                    <div className="min-w-0">
                      <p className="type-body-sm line-clamp-2 text-foreground" title={e.title}>{e.title}</p>
                      <p className="type-caption text-quaternary">{e.variant}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </PageHeader>
  );
};

export default Dashboard;
