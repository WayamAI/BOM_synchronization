"use client";

import { useRouter } from "next/navigation";
import { fieldEvents, program, getPart } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { Mark } from "@/components/ui/mark";
import { AlertTriangle, MapPin } from "lucide-react";

const sevTone = (s: string) =>
  s === "critical" ? "bg-[#891f24] text-white border-transparent font-semibold" :
  s === "high"     ? "bg-[#9a3814] text-white border-transparent font-medium" :
  s === "medium"   ? "bg-[#8a430f] text-white border-transparent font-medium" :
                     "bg-[#275a3b] text-white border-transparent font-medium";

const statusTone = (s: string) =>
  s === "Resolved"     ? "bg-[#275a3b] text-white border-transparent font-medium" :
  s === "Contained"    ? "bg-[#175c6d] text-white border-transparent font-medium" :
  s === "Investigating"? "bg-[#8a430f] text-white border-transparent font-medium" :
                         "bg-[#3f3f46] text-white border-transparent";

export default function FieldQualityPage() {
  const router = useRouter();
  const totalVinsAffected = fieldEvents.reduce((s, e) => s + e.vinsAffected, 0);
  const criticalOpen = fieldEvents.filter(e => e.severity === "critical" && e.status !== "Resolved").length;

  return (
    <PageHeader
      title="Field Quality & Recall Scoping"
      subtitle="Warranty clusters · VIN population scoping · root-cause linkage to Part Master"
      actions={
        <Button size="sm" className="h-7 text-xs rounded-md gap-1.5 btn-primary-white font-medium">
          <Mark id="mark-insight" size={16} />Scope Recall (AI)
        </Button>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { l: "Pilot VINs built",          v: program.pilotVinsBuilt.toLocaleString(), tone: "primary" },
          { l: "Open quality events",       v: fieldEvents.filter(e => e.status !== "Resolved").length, tone: "warning" },
          { l: "VINs impacted (all events)", v: totalVinsAffected.toLocaleString(), tone: "warning" },
          { l: "Critical open",             v: criticalOpen, tone: "danger" },
        ].map(k => (
          <div key={k.l} className="rounded-lg border border-border bg-card p-3 shadow-none">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{k.l}</p>
            <p className={cn("text-base font-bold mt-0.5 tabular-nums",
              k.tone === "danger" && "text-critical",
              k.tone === "warning" && "text-warning",
              k.tone === "primary" && "text-foreground",
            )}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* AI root-cause panel */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-none">
        <div className="flex items-center gap-2.5">
          <Mark id="mark-insight" size={20} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground tracking-tight">AI Root-Cause · Power Liftgate Actuator cluster</h3>
            <p className="text-xs text-muted-foreground mt-0.5">14 VINs · last 72h · Premium / Signature trims · BDY-LFT-7701</p>
          </div>
          <Badge className="bg-[#8a430f] text-white border-transparent text-[10px] px-2.5 py-0.5 rounded-full shrink-0 font-medium">81% confidence</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-xs">
          {[
            { l: "Most likely cause",   v: "Actuator clutch slip on Magna lot 2026-MG-0418" },
            { l: "Common factor",       v: "All 14 VINs built at Pune ST-18 between Apr 12–14" },
            { l: "Recommended action",  v: "Contain lot 2026-MG-0418 (287 VINs scoped). ECN-2242 already approved." },
          ].map(b => (
            <div key={b.l} className="rounded-md border border-border/50 bg-surface-secondary/40 p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{b.l}</p>
              <p className="mt-0.5 text-foreground leading-snug text-xs">{b.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Events table */}
      <div className="rounded-lg border border-border bg-card shadow-none overflow-hidden">
        <div className="p-3 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground tracking-tight">Field Quality Events</h3>
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full border-border/60 tabular-nums">{fieldEvents.length} tracked</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="h-8 text-[10px] uppercase tracking-wide text-muted-foreground bg-surface-secondary/40 border-b border-border/50">
              <tr>
                <th className="th-dense text-left">ID</th>
                <th className="th-dense text-left">Severity</th>
                <th className="th-dense text-left">Event</th>
                <th className="th-dense text-left">Linked part</th>
                <th className="th-dense text-left">Variant</th>
                <th className="th-dense text-right">VINs</th>
                <th className="th-dense text-left">Age</th>
                <th className="th-dense text-left">Status</th>
                <th className="th-dense text-left"></th>
              </tr>
            </thead>
            <tbody>
              {fieldEvents.map(e => {
                const part = e.partNumber ? getPart(e.partNumber) : null;
                return (
                  <tr key={e.id} className="table-row-dense">
                    <td className="px-3 py-1.5 text-xs text-foreground font-semibold tabular-nums">{e.id}</td>
                    <td className="px-3 py-1.5"><Badge className={cn("text-[10px] px-2 py-0.5 rounded-full border capitalize font-medium", sevTone(e.severity))}>{e.severity}</Badge></td>
                    <td className="px-3 py-1.5 font-medium text-foreground">{e.title}</td>
                    <td className="px-3 py-1.5">
                      {part
                        ? <button className="text-left hover:text-primary transition-colors" onClick={() => router.push(`/parts/${e.partNumber}`)}>
                            <div className="text-foreground font-medium">{part.name}</div>
                            <div className="text-[10px] text-muted-foreground tabular-nums">{e.partNumber}</div>
                          </button>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-3 py-1.5 text-muted-foreground text-xs">{e.variant}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-foreground">{e.vinsAffected.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-muted-foreground text-xs tabular-nums">{e.ageHours < 24 ? `${e.ageHours}h` : `${Math.round(e.ageHours / 24)}d`}</td>
                    <td className="px-3 py-1.5"><Badge className={cn("text-[10px] px-2 py-0.5 rounded-full border font-medium", statusTone(e.status))}>{e.status}</Badge></td>
                    <td className="px-3 py-1.5">
                      <Button size="sm" variant="ghost" className="h-6 text-xs rounded-md gap-1 text-primary hover:bg-primary/10 px-2"><MapPin className="h-3 w-3" />Trace</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md border border-warning/30 bg-warning/5 p-3 flex items-start gap-2.5 text-xs">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-warning">UNECE R155 reportability check</p>
          <p className="text-muted-foreground mt-0.5 leading-relaxed">
            1 cybersecurity event (Infotainment IHU log4j CVE) crosses the disclosure threshold and must be reported within 7 days.
            See <button className="underline text-foreground hover:text-primary" onClick={() => router.push("/compliance")}>Compliance</button> for the audit trail.
          </p>
        </div>
      </div>
    </PageHeader>
  );
}
