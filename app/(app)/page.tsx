"use client";

import { useRouter } from "next/navigation";
import { programs, suppliers } from "@/lib/mockData";
import { useProgramContext } from "@/context/ProgramContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthArc } from "@/components/dashboard/HealthArc";
import { SystemHealthMatrix } from "@/components/dashboard/SystemHealthMatrix";
import { AppIcon } from "@/components/ui/app-icon";
import { Mark } from "@/components/ui/mark";
import { ChangeVelocityChart } from "@/components/dashboard/ChangeVelocityChart";

const STAGES = ["Concept", "Design", "Engineering", "Pre-Production", "SOP"] as const;

const stageBadge = (stage: string) => {
  const map: Record<string, string> = {
    "Concept":        "bg-[#3f3f46] text-white border-transparent",
    "Design":         "bg-[#175c6d] text-white border-transparent",
    "Engineering":    "bg-[#1c5083] text-white border-transparent",
    "Validation":     "bg-[#1c5083] text-white border-transparent",
    "Pre-Production": "bg-[#8a430f] text-white border-transparent",
    "SOP":            "bg-[#275a3b] text-white border-transparent",
    "In-Production":  "bg-[#275a3b] text-white border-transparent",
  };
  return map[stage] ?? map["Pre-Production"];
};

const ecnStateBadge = (state: string) => {
  switch (state) {
    case "In Review":
      return "bg-[#8a430f] text-white border-transparent";
    case "Draft":
      return "bg-[#3f3f46] text-white border-transparent";
    case "Approved":
      return "bg-[#175c6d] text-white border-transparent";
    case "Released":
      return "bg-[#275a3b] text-white border-transparent";
    case "Rejected":
    case "Cancelled":
      return "bg-[#891f24] text-white border-transparent";
    default:
      return "bg-[#3f3f46] text-white border-transparent";
  }
};

const ecnPriorityBadge = (priority: string) => {
  switch (priority) {
    case "Critical":
      return "bg-[#891f24] text-white border-transparent font-semibold";
    case "High":
      return "bg-[#9a3814] text-white border-transparent font-medium";
    case "Medium":
      return "bg-[#8a430f] text-white border-transparent font-medium";
    case "Low":
    default:
      return "bg-[#3f3f46] text-white border-transparent";
  }
};

const sevDot = (s: string) =>
  s === "critical" ? "bg-critical" :
  s === "high" ? "bg-warning" :
  s === "medium" ? "bg-warning/80" : "bg-success";

export default function Dashboard() {
  const router = useRouter();
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
    <div className="relative flex flex-col gap-4 pb-8">
      {/* Fleet Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {programs.map(prog => {
          const isSelected = activeProgram.id === prog.id;
          return (
            <button
              key={prog.id}
              onClick={() => setActiveProgramId(prog.id)}
              aria-pressed={isSelected}
              className={`rounded-lg border p-3 text-left transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 ${
                isSelected
                  ? "border-primary/80 ring-1 ring-primary/30 bg-surface-secondary text-foreground"
                  : "border-border/60 bg-card hover:bg-surface-secondary/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <div>
                  <div className="text-xs font-semibold leading-tight text-foreground">{prog.name}</div>
                  <div className="text-[10px] text-muted-foreground">{prog.category}</div>
                </div>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 rounded-full border-border/60 tabular-nums">{prog.modelYear}</Badge>
              </div>
              <Badge className={`${stageBadge(prog.stage)} border text-[10px] px-2 h-4 mb-2 rounded-full font-medium`}>{prog.stage}</Badge>
              <div className="grid grid-cols-2 gap-x-2 text-xs mt-1 pt-1.5 border-t border-border/50">
                <div className="text-muted-foreground">Health</div>
                <div className="font-semibold text-right tabular-nums text-foreground">{prog.healthScore}%</div>
                <div className="text-muted-foreground">SOP in</div>
                <div className="font-semibold text-right tabular-nums text-foreground">{prog.daysToSOP}d</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Program Header */}
      <header className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between px-3.5 py-2.5 bg-card rounded-lg border border-border">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Command Center</h1>
            <span className="text-muted-foreground/40 text-xs">/</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-display tracking-tight text-foreground">{activeProgram.name}</span>
              <Badge variant="outline" className="text-[10px] border-border/60 bg-surface-secondary/50 h-4 px-1.5 rounded-full tabular-nums">{activeProgram.modelYear}</Badge>
              <Badge className={`${stageBadge(activeProgram.stage)} border px-2 h-4 text-[10px] rounded-full font-medium`}>{activeProgram.stage}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground uppercase tracking-wide">
            <span className="inline-flex items-center gap-1">
              <AppIcon name="trendingUp" size="xs" className="text-muted-foreground" />
              <span className="text-foreground font-semibold tabular-nums">{activeProgram.daysToSOP}</span> Days to SOP
            </span>
            <span className="inline-flex items-center gap-1 border-l border-border/50 pl-2.5">
              <AppIcon name="factory" size="xs" className="text-muted-foreground" />
              <span className="text-foreground font-semibold tabular-nums">{activeProgram.pilotVinsBuilt}</span> Units Built
            </span>
            <span className="inline-flex items-center gap-1 border-l border-border/50 pl-2.5">
              <AppIcon name="changes" size="xs" className="text-muted-foreground" />
              <span className="text-foreground font-semibold tabular-nums">{activeProgram.activeEcns}</span> ECNs
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground mr-1.5 border border-border/60 bg-surface-secondary/40 px-2 py-0.5 rounded-full tabular-nums">
            Core Team (7)
          </span>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs rounded-md border-border/60 bg-card hover:bg-surface-secondary text-foreground" onClick={() => router.push("/changes")}>
            <AppIcon name="changes" size="xs" /> ECN
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs rounded-md border-border/60 bg-card hover:bg-surface-secondary text-foreground" onClick={() => router.push("/software")}>
            <AppIcon name="software" size="xs" /> Cyber
          </Button>
          <Button size="sm" className="btn-primary-white h-7 gap-1.5 px-2.5 rounded-md text-xs font-medium" onClick={() => router.push("/reports")}>
            <AppIcon name="reports" size="xs" /> Export
          </Button>
        </div>
      </header>

      {/* Unified 12-Column HUD Layout */}
      <div className="grid grid-cols-12 gap-3">
        {/* KPI Row — scoped to active program */}
        <div className="col-span-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Parts",  value: progParts.length,                trend: "eBOM",   to: "/ebom",      icon: "parts" as const },
            { label: "Assy",   value: progAssemblies.length,           trend: "Stable", to: "/ebom",      icon: "tree" as const },
            { label: "Ops",    value: activeProgram.mbomOps.length,    trend: "mBOM",   to: "/mbom",      icon: "factory" as const },
            { label: "Kits",   value: activeProgram.serviceKits.length,trend: "Ready",  to: "/service",    icon: "service" as const },
            { label: "Sups",   value: progSuppliers.size,              trend: "Live",   to: "/suppliers", icon: "suppliers" as const },
            { label: "Vars",   value: activeProgram.variants.length,   trend: `${activeProgram.variants.length} active`, to: "/variants", icon: "variants" as const },
          ].map(k => (
            <button
              key={k.label}
              onClick={() => router.push(k.to)}
              className="group relative flex flex-col justify-between rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-surface-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-muted-foreground border border-border/60 group-hover:text-primary transition-colors">
                  <AppIcon name={k.icon} size="xs" aria-hidden />
                </div>
                <span className="text-[10px] font-medium text-white bg-[#175c6d] px-2 py-0.5 rounded-full tabular-nums border-transparent">
                  {k.trend}
                </span>
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                  {k.label}
                </div>
                <div className="mt-0.5 text-lg sm:text-xl font-bold font-display tracking-tight tabular-nums text-foreground">
                  {k.value.toLocaleString()}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Health Row */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <HealthArc value={ebomScore} label="EBOM Maturity" tone="success" micro={[{ label: "Rlsd", value: `${releasedParts.length}/${progParts.length}` }, { label: "Rvws", value: String(progParts.filter(p => p.lifecycle === "In Review").length) }]} />
          <HealthArc value={mbomScore} label="MBOM Readiness" tone="warning" micro={[{ label: "Ops", value: String(activeProgram.mbomOps.length) }, { label: "Plants", value: String(new Set(activeProgram.mbomOps.map(o => o.plantId)).size) }]} />
          <HealthArc value={100 - supplyScore} label="Supply Risk" tone="danger" micro={[{ label: "Single", value: String(singleSrcCount) }, { label: "Sups", value: String(usedSuppliers.length) }]} />
          <HealthArc value={serviceScore} label="Service Scope" tone="success" micro={[{ label: "Kits", value: String(activeProgram.serviceKits.length) }, { label: "Svcbl", value: `${serviceableParts.length}` }]} />
        </div>

        <div className="col-span-12 xl:col-span-8 self-start">
        {/* System Health Matrix — Full 12-column width with natural content height */}
        <div className="col-span-12">
          <SystemHealthMatrix />
        </div>

        <div className="col-span-12 xl:col-span-4 flex flex-col gap-2.5">
          {/* Stage Progress Bar */}
          <div className="flex-none rounded-lg border border-border bg-card p-3.5 shadow-none">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5 mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Lifecycle
        {/* Lifecycle & Intelligence Row */}
        {/* Left: Program Stage Pipeline (col-span-12 xl:col-span-6) */}
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-lg border border-border bg-card p-3.5 shadow-none h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5 mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Lifecycle
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <AppIcon name="workflow" size="xs" className="text-muted-foreground" aria-hidden />
                    <Mark id="mark-flowing" size={18} className="shrink-0" />
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                      Program Stage Pipeline
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AppIcon name="workflow" size="xs" className="text-muted-foreground" aria-hidden />
                  <Mark id="mark-flowing" size={18} className="shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground tracking-tight">
                    Program Stage Pipeline
                  </h3>
                </div>
                <Badge className={`${stageBadge(activeProgram.stage)} border text-[10px] px-2 py-0.5 rounded-full font-medium leading-none`}>
                  {activeProgram.stage}
                </Badge>
              </div>
              <Badge className={`${stageBadge(activeProgram.stage)} border text-[10px] px-2 py-0.5 rounded-full font-medium leading-none`}>
                {activeProgram.stage}
              </Badge>
            </div>

            <div className="space-y-2">
              {programs.map(prog => {
                const isSelected = activeProgram.id === prog.id;
                const currentIdx = STAGES.indexOf(prog.stage as typeof STAGES[number]);
                return (
                  <div
                    key={prog.id}
                    className={`p-2 rounded-md transition-colors ${
                      isSelected
                        ? "bg-surface-secondary/70 border border-primary/30"
                        : "bg-transparent border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {isSelected && (
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                        )}
                        <span className={`font-medium ${isSelected ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                          {prog.name}
                        </span>
              <div className="space-y-2">
                {programs.map(prog => {
                  const isSelected = activeProgram.id === prog.id;
                  const currentIdx = STAGES.indexOf(prog.stage as typeof STAGES[number]);
                  return (
                    <div
                      key={prog.id}
                      className={`p-2 rounded-md transition-colors ${
                        isSelected
                          ? "bg-surface-secondary/70 border border-primary/30"
                          : "bg-transparent border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {isSelected && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                          )}
                          <span className={`font-medium ${isSelected ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                            {prog.name}
                          </span>
                        </div>
                        <Badge className={`${stageBadge(prog.stage)} border text-[10px] px-2 py-0.2 rounded-full font-medium leading-none`}>
                          {prog.stage}
                        </Badge>
                      </div>
                      <Badge className={`${stageBadge(prog.stage)} border text-[10px] px-2 py-0.2 rounded-full font-medium leading-none`}>
                        {prog.stage}
                      </Badge>
                    </div>

                    {/* Segmented 5-Stage Progression Track */}
                    <div
                      className="grid grid-cols-5 gap-1"
                      role="progressbar"
                      aria-valuenow={currentIdx + 1}
                      aria-valuemin={1}
                      aria-valuemax={STAGES.length}
                      aria-label={`${prog.name} lifecycle stage: ${prog.stage}`}
                    >
                      {STAGES.map((stageName, sIdx) => {
                        const isCompleted = sIdx < currentIdx;
                        const isActive = sIdx === currentIdx;
                        return (
                          <div
                            key={stageName}
                            title={`${prog.name} - ${stageName}: ${isCompleted ? "Completed" : isActive ? "Active" : "Pending"}`}
                            className={`h-1.5 rounded-full transition-all duration-200 ${
                              isActive
                                ? "bg-primary border border-primary/80 ring-1 ring-primary/40"
                                : isCompleted
                                ? "bg-success/50 border border-success/30"
                                : "bg-surface-secondary/90 border border-border/40"
                            }`}
                          />
                        );
                      })}
                      {/* Segmented 5-Stage Progression Track */}
                      <div
                        className="grid grid-cols-5 gap-1"
                        role="progressbar"
                        aria-valuenow={currentIdx + 1}
                        aria-valuemin={1}
                        aria-valuemax={STAGES.length}
                        aria-label={`${prog.name} lifecycle stage: ${prog.stage}`}
                      >
                        {STAGES.map((stageName, sIdx) => {
                          const isCompleted = sIdx < currentIdx;
                          const isActive = sIdx === currentIdx;
                          return (
                            <div
                              key={stageName}
                              title={`${prog.name} - ${stageName}: ${isCompleted ? "Completed" : isActive ? "Active" : "Pending"}`}
                              className={`h-1.5 rounded-full transition-all duration-200 ${
                                isActive
                                  ? "bg-primary border border-primary/80 ring-1 ring-primary/40"
                                  : isCompleted
                                  ? "bg-success/50 border border-success/30"
                                  : "bg-surface-secondary/90 border border-border/40"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
                  );
                })}
              </div>
            </div>

            {/* Stage Milestone Column Footer aligned directly with the 5-column grid */}
            <div className="grid grid-cols-5 gap-1 text-[10px] text-muted-foreground mt-2.5 pt-2 border-t border-border/50 text-center px-2">
              {STAGES.map(s => (
                <span key={s} className="truncate font-medium" title={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Assistant · Briefing + Security Hub (col-span-12 xl:col-span-6 flex flex-col gap-3) */}
        <div className="col-span-12 xl:col-span-6 flex flex-col gap-3">
          {/* AI Briefing — scoped to active program */}
          <div className="flex-1 flex flex-col min-h-[300px]">
            <div className="flex-1 rounded-lg border border-border bg-card p-3.5 shadow-none flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5 mb-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      Intelligence
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mark id="mark-insight" size={20} className="shrink-0" />
                      <h3 className="text-sm font-semibold text-foreground tracking-tight">
                        AI Assistant · Briefing
                      </h3>
                    </div>
          <div className="flex-1 rounded-lg border border-border bg-card p-3.5 shadow-none flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5 mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Intelligence
                  </div>
                  <span className="text-[10px] text-muted-foreground border border-border/60 bg-surface-secondary/60 px-2 py-0.5 rounded-full leading-none tabular-nums">
                    {activeProgram.aiBriefing.length} insights
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mark id="mark-insight" size={20} className="shrink-0" />
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                      AI Assistant · Briefing
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground border border-border/60 bg-surface-secondary/60 px-2 py-0.5 rounded-full leading-none tabular-nums">
                  {activeProgram.aiBriefing.length} insights
                </span>
              </div>

                <div className="space-y-3">
                  {activeProgram.aiBriefing.map(b => (
                    <div key={b.priority} className="flex gap-2.5 text-xs">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-secondary border border-border/60 text-[10px] font-bold text-foreground tabular-nums">
                        {b.priority}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="leading-snug font-medium text-foreground/90 text-xs">
                          {b.text}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-warning uppercase tracking-wide">
                          <AppIcon name="warning" size="xs" aria-hidden />
                          <span>CRITICAL IMPACT · {b.impact}</span>
                        </div>
              <div className="space-y-3">
                {activeProgram.aiBriefing.map(b => (
                  <div key={b.priority} className="flex gap-2.5 text-xs">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-secondary border border-border/60 text-[10px] font-bold text-foreground tabular-nums">
                      {b.priority}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="leading-snug font-medium text-foreground/90 text-xs">
                        {b.text}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-warning uppercase tracking-wide">
                        <AppIcon name="warning" size="xs" aria-hidden />
                        <span>CRITICAL IMPACT · {b.impact}</span>
                      </div>
                    </div>
                  ))}
                  </div>
                ))}

                  {activeProgram.ecns[0] && (
                    <div className="rounded-md border border-border/50 bg-surface-secondary/40 p-2.5">
                      <div className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground mb-1">
                        Actionable Insight
                      </div>
                      <p className="text-xs leading-relaxed italic text-muted-foreground/90">
                        "{activeProgram.ecns[0].title} ({activeProgram.ecns[0].id}) — prioritize resolution before next gate."
                      </p>
                {activeProgram.ecns[0] && (
                  <div className="rounded-md border border-border/50 bg-surface-secondary/40 p-2.5">
                    <div className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground mb-1">
                      Actionable Insight
                    </div>
                  )}
                </div>
                    <p className="text-xs leading-relaxed italic text-muted-foreground/90">
                      "{activeProgram.ecns[0].title} ({activeProgram.ecns[0].id}) — prioritize resolution before next gate."
                    </p>
                  </div>
                )}
              </div>
            </div>

              <div className="pt-3 mt-3 border-t border-border/50">
                <Button
                  size="sm"
                  className="w-full text-xs font-semibold tracking-wide h-8 gap-1.5 bg-surface-secondary/80 hover:bg-surface-secondary text-foreground border border-border/60 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 transition-colors"
                >
                  Explore AI Strategy <AppIcon name="arrowRight" size="xs" aria-hidden />
                </Button>
              </div>
            <div className="pt-3 mt-3 border-t border-border/50">
              <Button
                size="sm"
                className="w-full text-xs font-semibold tracking-wide h-8 gap-1.5 bg-surface-secondary/80 hover:bg-surface-secondary text-foreground border border-border/60 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 transition-colors"
              >
                Explore AI Strategy <AppIcon name="arrowRight" size="xs" aria-hidden />
              </Button>
            </div>
          </div>

          {/* Security Hub — scoped to active program */}
          <div className="flex-none rounded-lg border border-border bg-card p-3.5 shadow-none">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Cybersecurity
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AppIcon name="software" size="xs" className="text-muted-foreground" aria-hidden />
                  <Mark id="mark-vault" size={18} className="shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground tracking-tight">
                    Security Hub
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-1" role="status" aria-label="SOC Status: Normal (5 of 5 integrity channels verified)">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-1.5 w-2.5 rounded-full bg-success/80 border border-success/40" />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No active cybersecurity threats detected in the last{" "}
              <span className="text-foreground font-semibold tabular-nums">240 hours</span>. SOC status:{" "}
              <span className="text-success font-semibold">Normal</span>.
            </p>
          </div>
        </div>

        {/* ECN Approval Queue — scoped to active program */}
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-lg border border-border bg-card p-3.5 shadow-none h-full min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5 mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Change Orders
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mark id="mark-gate" size={20} className="shrink-0" />
                    <h3 className="text-sm font-semibold text-foreground tracking-tight">
                      ECN Approval Queue
                    </h3>
                    <span className="text-[10px] text-muted-foreground border border-border/60 bg-surface-secondary/60 px-2 py-0.5 rounded-full leading-none tabular-nums">
                      {pendingEcns.length} pending
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-2 text-xs text-primary hover:bg-surface-secondary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 rounded-md"
                  onClick={() => router.push("/changes")}
                  aria-label="Monitor all change orders in full table"
                >
                  Monitor <AppIcon name="arrowRight" size="xs" aria-hidden />
                </Button>
              </div>

              {pendingEcns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                  <AppIcon name="checkCircle" size="md" className="text-success mb-2" aria-hidden />
                  <p className="text-xs font-medium text-foreground">No pending ECNs for {activeProgram.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">All engineering change orders released or approved.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40 rounded-md border border-border bg-surface-secondary/20 overflow-hidden">
                  {pendingEcns.slice(0, 4).map(e => (
                    <button
                      key={e.id}
                      onClick={() => router.push(`/changes/${e.id}`)}
                      className="group flex w-full flex-col gap-1.5 p-2.5 text-left transition-colors hover:bg-surface-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors tabular-nums">
                            {e.id}
                          </span>
                          <Badge className={`text-[10px] px-2 py-0.2 rounded-full border leading-none font-medium ${ecnStateBadge(e.state)}`}>
                            {e.state}
                          </Badge>
                          <Badge className={`text-[10px] px-2 py-0.2 rounded-full border leading-none font-medium ${ecnPriorityBadge(e.priority)}`}>
                            {e.priority}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {e.reason}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-foreground leading-snug line-clamp-1 group-hover:text-foreground">
                        {e.title}
                      </p>

                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-0.5">
                        {e.affectedPNs && e.affectedPNs.length > 0 ? (
                          <div className="flex items-center gap-1 overflow-hidden">
                            <span className="text-muted-foreground/70 text-[10px]">Affects:</span>
                            {e.affectedPNs.slice(0, 2).map(pn => (
                              <span key={pn} className="rounded-full border border-border/60 bg-surface-secondary/80 px-2 py-0.2 text-[10px] text-muted-foreground tabular-nums">
                                {pn}
                              </span>
                            ))}
                            {e.affectedPNs.length > 2 && (
                              <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                                +{e.affectedPNs.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/70">No PNs affected</span>
                        )}
                        {e.raisedAt && (
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground/70">
                            {e.raisedAt}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Velocity — scoped to active program */}
        <div className="col-span-12 xl:col-span-6">
          <ChangeVelocityChart
            data={activeProgram.changeVelocity}
            programName={activeProgram.name}
          />
        </div>

        {/* Live Quality Stream — scoped to active program */}
        <div className="col-span-12">
          <div className="rounded-lg border border-border bg-card p-3.5 shadow-none">
            <div className="flex items-center justify-between border-b border-border/50 pb-2.5 mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  Field Intelligence
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AppIcon name="field" size="xs" className="text-muted-foreground" aria-hidden />
                  <h3 className="text-sm font-semibold text-foreground tracking-tight">
                    Live Quality Stream · {activeProgram.name}
                  </h3>
                  <span className="text-[10px] text-muted-foreground border border-border/60 bg-surface-secondary/60 px-2 py-0.5 rounded-full leading-none tabular-nums">
                    {activeProgram.fieldEvents.length} events
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 gap-1 px-2 text-xs text-primary hover:bg-surface-secondary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 rounded-md"
                onClick={() => router.push("/field")}
                aria-label="Expand stream in field events view"
              >
                Expand Stream <AppIcon name="arrowRight" size="xs" aria-hidden />
              </Button>
            </div>

            {activeProgram.fieldEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <AppIcon name="checkCircle" size="md" className="text-success mb-1.5" aria-hidden />
                <p className="text-xs font-medium text-foreground">No active field events for {activeProgram.name}.</p>
                <p className="text-xs text-muted-foreground mt-0.5">Fleet telemetry and warranty channels reporting zero anomalies.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
                {activeProgram.fieldEvents.map(e => (
                  <div
                    key={e.id}
                    className="flex flex-col justify-between gap-1.5 p-2.5 rounded-md bg-surface-secondary/30 border border-border/60 hover:bg-surface-secondary/70 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sevDot(e.severity)}`} aria-hidden />
                        <span className="text-[10px] uppercase text-muted-foreground font-medium">
                          {e.severity}
                        </span>
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground/70">
                        {e.ageHours}h ago
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-foreground truncate" title={e.title}>
                      {e.title}
                    </p>

                    <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground/80 pt-0.5 border-t border-border/40">
                      <span className="truncate max-w-[110px]" title={e.variant}>
                        {e.variant}
                      </span>
                      {e.vinsAffected > 0 && (
                        <span className="shrink-0 tabular-nums">
                          {e.vinsAffected} VINs
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
