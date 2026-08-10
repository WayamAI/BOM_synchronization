import { useNavigate } from "react-router-dom";
import { fieldEvents, program, getPart } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { Sparkles, AlertTriangle, MapPin } from "lucide-react";

const sevTone = (s: string) =>
  s === "critical" ? "bg-critical/15 text-critical border-critical/30" :
  s === "high"     ? "bg-orange-500/15 text-orange-500 border-orange-500/30" :
  s === "medium"   ? "bg-warning/15 text-warning border-warning/30" :
                     "bg-success/15 text-success border-success/30";

const statusTone = (s: string) =>
  s === "Resolved"     ? "bg-success/15 text-success border-success/30" :
  s === "Contained"    ? "bg-primary/15 text-primary border-primary/30" :
  s === "Investigating"? "bg-warning/15 text-warning border-warning/30" :
                         "bg-muted text-muted-foreground border-border";

const FieldQuality = () => {
  const navigate = useNavigate();
  const totalVinsAffected = fieldEvents.reduce((s, e) => s + e.vinsAffected, 0);
  const criticalOpen = fieldEvents.filter(e => e.severity === "critical" && e.status !== "Resolved").length;

  return (
    <PageHeader
      title="Field Quality & Recall Scoping"
      subtitle="Warranty clusters · VIN population scoping · root-cause linkage to Part Master"
      actions={<Button size="sm" className="gap-1.5 bg-gradient-primary border-0"><Sparkles className="h-3.5 w-3.5" />Scope Recall (AI)</Button>}
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Pilot VINs built",         v: program.pilotVinsBuilt.toLocaleString(), tone: "primary" },
          { l: "Open quality events",      v: fieldEvents.filter(e => e.status !== "Resolved").length, tone: "warning" },
          { l: "VINs impacted (all events)",v: totalVinsAffected.toLocaleString(), tone: "warning" },
          { l: "Critical open",            v: criticalOpen, tone: "danger" },
        ].map(k => (
          <div key={k.l} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{k.l}</p>
            <p className={cn("text-2xl font-bold mt-1 tabular-nums",
              k.tone === "danger" && "text-critical",
              k.tone === "warning" && "text-warning",
              k.tone === "primary" && "text-gradient-primary",
            )}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* AI root-cause panel */}
      <div className="rounded-xl border border-primary/30 bg-card p-5 shadow-card relative overflow-hidden">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-primary opacity-15 blur-3xl" />
        <div className="flex items-center gap-2 relative">
          <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Root-Cause · Power Liftgate Actuator cluster</h3>
            <p className="text-[10px] text-muted-foreground">14 VINs · last 72h · Premium / Signature trims · BDY-LFT-7701</p>
          </div>
          <Badge className="ml-auto bg-warning/20 text-warning border-warning/30 text-[10px]">81% confidence</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs relative">
          {[
            { l: "Most likely cause",   v: "Actuator clutch slip on Magna lot 2026-MG-0418" },
            { l: "Common factor",       v: "All 14 VINs built at Pune ST-18 between Apr 12–14" },
            { l: "Recommended action",  v: "Contain lot 2026-MG-0418 (287 VINs scoped). ECN-2242 already approved." },
          ].map(b => (
            <div key={b.l} className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{b.l}</p>
              <p className="mt-1">{b.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Events table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Field Quality Events</h3>
          <Badge variant="outline" className="text-[10px]">{fieldEvents.length} tracked</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Severity</th>
                <th className="text-left p-3">Event</th>
                <th className="text-left p-3">Linked part</th>
                <th className="text-left p-3">Variant</th>
                <th className="text-right p-3">VINs</th>
                <th className="text-left p-3">Age</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3"></th>
              </tr>
            </thead>
            <tbody>
              {fieldEvents.map(e => {
                const part = e.partNumber ? getPart(e.partNumber) : null;
                return (
                  <tr key={e.id} className="border-t border-border/40 hover:bg-muted/30">
                    <td className="p-3 font-mono text-[10px]">{e.id}</td>
                    <td className="p-3"><Badge className={cn("text-[10px] border capitalize", sevTone(e.severity))}>{e.severity}</Badge></td>
                    <td className="p-3 font-semibold">{e.title}</td>
                    <td className="p-3">
                      {part
                        ? <button className="text-left hover:text-primary" onClick={() => navigate(`/parts/${e.partNumber}`)}>
                            <div>{part.name}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">{e.partNumber}</div>
                          </button>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">{e.variant}</td>
                    <td className="p-3 text-right tabular-nums">{e.vinsAffected.toLocaleString()}</td>
                    <td className="p-3 text-muted-foreground">{e.ageHours < 24 ? `${e.ageHours}h` : `${Math.round(e.ageHours / 24)}d`}</td>
                    <td className="p-3"><Badge className={cn("text-[10px] border", statusTone(e.status))}>{e.status}</Badge></td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1 text-primary"><MapPin className="h-3 w-3" />Trace</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-semibold text-warning">UNECE R155 reportability check</p>
          <p className="text-muted-foreground mt-1">
            1 cybersecurity event (Infotainment IHU log4j CVE) crosses the disclosure threshold and must be reported within 7 days.
            See <button className="underline" onClick={() => navigate("/compliance")}>Compliance</button> for the audit trail.
          </p>
        </div>
      </div>
    </PageHeader>
  );
};

export default FieldQuality;
