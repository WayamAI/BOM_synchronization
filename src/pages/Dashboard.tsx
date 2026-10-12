import { useNavigate } from "react-router-dom";
import { programs, suppliers } from "@/lib/mockData";
import { useProgramContext } from "@/context/ProgramContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthArc } from "@/components/dashboard/HealthArc";
import { SystemHealthMatrix } from "@/components/dashboard/SystemHealthMatrix";
import { Sparkles, FileEdit, ShieldAlert, FileBarChart, AlertTriangle, ArrowRight, TrendingUp, Factory } from "lucide-react";
import { Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const STAGES = ["Concept", "Design", "Engineering", "Pre-Production", "SOP"] as const;

const stageBadge = (stage: string) => {
  const map: Record<string, string> = {
    "Concept":        "bg-muted text-muted-foreground",
    "Design":         "bg-primary/15 text-primary border-primary/30",
    "Engineering":    "bg-accent/15 text-accent border-accent/30",
    "Validation":     "bg-accent/15 text-accent border-accent/30",
    "Pre-Production": "bg-warning/15 text-warning border-warning/30",
    "SOP":            "bg-success/15 text-success border-success/30",
    "In-Production":  "bg-success/15 text-success border-success/30",
  };
  return map[stage] ?? map["Pre-Production"];
};

const sevDot = (s: string) =>
  s === "critical" ? "bg-critical" :
  s === "high" ? "bg-orange-500" :
  s === "medium" ? "bg-warning" : "bg-success";

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
    <div className="relative flex flex-col gap-3 animate-fade-in-up p-4 pb-6 sm:p-5">
      {/* Dynamic HUD Frames */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-10 top-1/2 h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />

      {/* Fleet Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {programs.map(prog => (
          <button
            key={prog.id}
            onClick={() => setActiveProgramId(prog.id)}
            className={`rounded-xl border p-3 text-left transition-all card-hover ${
              activeProgram.id === prog.id
                ? "border-primary/50 bg-primary/5 shadow-glow/10"
                : "border-border bg-card/60 backdrop-blur-md"
            }`}
          >
            <div className="flex items-start justify-between gap-1 mb-1.5">
              <div>
                <div className="text-xs font-semibold leading-tight">{prog.name}</div>
                <div className="text-[10px] text-muted-foreground">{prog.category}</div>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono h-4 px-1 shrink-0">{prog.modelYear}</Badge>
            </div>
            <Badge className={`${stageBadge(prog.stage)} border text-[9px] px-1.5 h-4 mb-2`}>{prog.stage}</Badge>
            <div className="grid grid-cols-2 gap-x-2 text-[10px] mt-1">
              <div className="text-muted-foreground">Health</div>
              <div className="font-bold text-right">{prog.healthScore}%</div>
              <div className="text-muted-foreground">SOP in</div>
              <div className="font-bold text-right">{prog.daysToSOP}d</div>
            </div>
          </button>
        ))}
      </div>

      {/* Active Program Header */}
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between px-1 bg-card/10 p-4 rounded-2xl border border-border/40 backdrop-blur-sm">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Command Center</h1>
            <span className="text-muted-foreground/30 px-1">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-gradient-primary">{activeProgram.name}</span>
              <Badge variant="outline" className="font-mono text-[10px] border-primary/30 bg-primary/5 h-5 px-1.5">{activeProgram.modelYear}</Badge>
              <Badge className={`${stageBadge(activeProgram.stage)} border px-1.5 h-5 text-[9px] shadow-sm`}>{activeProgram.stage}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            <span className="flex items-center gap-1"><TrendingUp className="h-2.5 w-2.5" /> <span className="text-foreground">{activeProgram.daysToSOP}</span> Days to SOP</span>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1"><Factory className="h-2.5 w-2.5" /> <span className="text-foreground">{activeProgram.pilotVinsBuilt}</span> Units Built</span>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1"><FileEdit className="h-2.5 w-2.5" /> <span className="text-foreground">{activeProgram.activeEcns}</span> ECNs</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-2">
            {[0, 1, 2].map(n => (
              <div key={n} className="h-7 w-7 rounded-full border-2 border-background bg-muted ring-1 ring-border overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${n + 10}`} alt="user" />
              </div>
            ))}
            <div className="h-7 w-7 rounded-full border-2 border-background bg-card flex items-center justify-center text-[10px] font-bold ring-1 ring-border">+4</div>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs card-hover border-border/40 shadow-sm" onClick={() => navigate("/changes")}>
            <FileEdit className="h-3 w-3" /> ECN
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs card-hover border-border/40 shadow-sm" onClick={() => navigate("/software")}>
            <ShieldAlert className="h-3 w-3" /> Cyber
          </Button>
          <Button size="sm" className="h-8 gap-1.5 px-3 bg-gradient-primary shadow-glow text-xs" onClick={() => navigate("/reports")}>
            <FileBarChart className="h-3 w-3" /> Export
          </Button>
        </div>
      </header>

      {/* Unified 12-Column HUD Layout */}
      <div className="grid grid-cols-12 gap-3">
        {/* KPI Row — scoped to active program */}
        <div className="col-span-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Parts",  value: progParts.length,                trend: "eBOM",   to: "/ebom" },
            { label: "Assy",   value: progAssemblies.length,           trend: "Stable", to: "/ebom" },
            { label: "Ops",    value: activeProgram.mbomOps.length,    trend: "mBOM",   to: "/mbom" },
            { label: "Kits",   value: activeProgram.serviceKits.length,trend: "Ready",  to: "/service" },
            { label: "Sups",   value: progSuppliers.size,              trend: "Live",   to: "/suppliers" },
            { label: "Vars",   value: activeProgram.variants.length,   trend: `${activeProgram.variants.length} active`, to: "/variants" },
          ].map(k => (
            <button key={k.label} onClick={() => navigate(k.to)} className="group relative overflow-hidden rounded-xl border border-border bg-card/60 p-3 text-left shadow-sm backdrop-blur-md hover:border-primary/40 card-hover">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{k.label}</span>
                <span className="text-[8px] font-mono text-primary bg-primary/5 px-1 rounded">{k.trend}</span>
              </div>
              <div className="mt-1 text-xl font-bold tracking-tight tabular-nums">{k.value.toLocaleString()}</div>
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

        <div className="col-span-12 xl:col-span-8 flex flex-col">
          <SystemHealthMatrix />
        </div>

        <div className="col-span-12 xl:col-span-4 flex flex-col gap-3">
          {/* Stage Progress Bar — replaces CVE Heatmap */}
          <div className="flex-none rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-4">Program Stage Pipeline</h3>
            <div className="space-y-3">
              {programs.map(prog => {
                const idx = STAGES.indexOf(prog.stage as typeof STAGES[number]);
                const pct = idx < 0 ? 5 : Math.round(((idx + 1) / STAGES.length) * 100);
                return (
                  <div key={prog.id}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className={`font-medium ${activeProgram.id === prog.id ? "text-primary" : ""}`}>{prog.name}</span>
                      <Badge className={`${stageBadge(prog.stage)} border text-[9px] px-1 h-4`}>{prog.stage}</Badge>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground mt-3 px-0.5">
              {STAGES.map(s => <span key={s}>{s}</span>)}
            </div>
          </div>

          {/* AI Briefing — scoped to active program */}
          <div className="flex-1 flex flex-col min-h-[320px]">
            <div className="group relative flex-1 overflow-hidden rounded-xl border border-primary/20 bg-card p-5 shadow-card transition-all hover:border-primary/40 bg-mesh/5">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
              <div className="relative flex items-center gap-2 border-b border-border/50 pb-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <h3 className="text-sm font-semibold">AI Assistant · Briefing</h3>
                </div>
              </div>
              <div className="space-y-4">
                {activeProgram.aiBriefing.map(b => (
                  <div key={b.priority} className="relative flex gap-3 text-xs group/item">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded bg-primary/10 text-[9px] font-bold text-primary ring-1 ring-primary/20 group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                      {b.priority}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="leading-tight font-medium text-foreground/90">{b.text}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[8px] font-bold text-orange-500 uppercase tracking-tighter">
                        <AlertTriangle className="h-2.5 w-2.5" /> CRITICAL IMPACT · {b.impact}
                      </div>
                    </div>
                  </div>
                ))}

                {activeProgram.ecns[0] && (
                  <div className="rounded-lg border border-border/40 bg-muted/5 p-3">
                    <div className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground mb-1.5">Actionable Insight</div>
                    <p className="text-[11px] leading-relaxed italic text-muted-foreground/80">
                      "{activeProgram.ecns[0].title} ({activeProgram.ecns[0].id}) — prioritize resolution before next gate."
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-auto pt-4">
                <Button size="sm" className="w-full text-[10px] uppercase font-bold tracking-widest h-8 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20">
                  Explore AI Strategy <ArrowRight className="h-2.5 w-2.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-none h-24 rounded-xl border border-dashed border-border/60 bg-muted/5 p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5">
              <span>Security Hub</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => <div key={i} className="h-1 w-3 rounded-full bg-success/40" />)}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/80 leading-tight">No active cybersecurity threats detected in the last <span className="text-foreground">240 hours</span>. SOC status: Normal.</p>
          </div>
        </div>

        {/* ECN Approval Queue — scoped to active program */}
        <div className="col-span-12 xl:col-span-6">
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-card h-full min-h-[340px]">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-12 -translate-y-12 rounded-full bg-warning/5 blur-3xl" />
            <div className="flex items-center justify-between relative z-10 border-b border-border/50 pb-2 mb-3">
              <h3 className="text-sm font-semibold">ECN Approval Queue</h3>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-primary" onClick={() => navigate("/changes")}>
                Monitor <ArrowRight className="h-2.5 w-2.5 ml-1" />
              </Button>
            </div>
            {pendingEcns.length === 0 ? (
              <p className="text-xs text-muted-foreground italic mt-4">No pending ECNs for {activeProgram.name}.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {pendingEcns.slice(0, 4).map(e => (
                  <button key={e.id} onClick={() => navigate(`/changes/${e.id}`)} className="rounded-lg border border-border/40 bg-muted/10 p-2.5 text-left transition-all hover:bg-muted/20 text-[11px]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-[9px] text-muted-foreground">{e.id}</span>
                      <Badge className="text-[8px] h-3.5 px-1 bg-warning/10 text-warning border-0">{e.state}</Badge>
                    </div>
                    <p className="font-bold leading-tight line-clamp-1">{e.title}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">{e.reason}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Change Velocity — scoped to active program */}
        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card h-full min-h-[340px]">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-3">
              <h3 className="text-sm font-semibold">Change Velocity</h3>
              <span className="text-[10px] text-muted-foreground tabular-nums">{activeProgram.name}</span>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeProgram.changeVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" fontSize={9} />
                  <YAxis axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" fontSize={9} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 10 }} />
                  <Bar dataKey="approved" stackId="a" fill="hsl(var(--success))" barSize={12} />
                  <Bar dataKey="rejected" stackId="a" fill="hsl(var(--critical))" barSize={12} />
                  <Line type="monotone" dataKey="cycle" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 1.5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Quality Stream — scoped to active program */}
        <div className="col-span-12">
          <div className="rounded-xl border border-border/60 bg-card/40 p-4 shadow-sm backdrop-blur-md group relative overflow-hidden">
            <div className="absolute inset-0 pattern-grid opacity-[0.02]" />
            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Live Quality Stream · {activeProgram.name}</h3>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-[9px] uppercase font-bold text-muted-foreground hover:text-foreground" onClick={() => navigate("/field")}>
                Expand Stream <ArrowRight className="h-2 w-2 ml-1" />
              </Button>
            </div>
            {activeProgram.fieldEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No active field events for {activeProgram.name}.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2">
                {activeProgram.fieldEvents.map(e => (
                  <div key={e.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/10 border border-transparent hover:border-border/40 transition-all cursor-pointer">
                    <span className={`h-1.5 w-1.5 rounded-full ${sevDot(e.severity)}`} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-foreground truncate">{e.title}</p>
                      <p className="text-[8px] text-muted-foreground">{e.variant}</p>
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
};

export default Dashboard;
