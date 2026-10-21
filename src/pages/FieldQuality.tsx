import { useNavigate } from "react-router-dom";
import { fieldEvents, program, getPart } from "@/lib/mockData";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { KpiTile, PanelHeader } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { Sparkles, AlertTriangle, MapPin } from "lucide-react";

const sevTone = (s: string): BadgeVariant =>
  s === "critical" ? "error" :
  s === "high"     ? "warning" :
  s === "medium"   ? "info" :
                     "neutral";

const statusTone = (s: string): BadgeVariant =>
  s === "Resolved"     ? "success" :
  s === "Contained"    ? "info" :
  s === "Investigating"? "warning" :
                         "neutral";

const FieldQuality = () => {
  const navigate = useNavigate();
  const totalVinsAffected = fieldEvents.reduce((s, e) => s + e.vinsAffected, 0);
  const criticalOpen = fieldEvents.filter(e => e.severity === "critical" && e.status !== "Resolved").length;

  return (
    <PageHeader
      title="Field Quality"
      mark="field-event"
      subtitle="Warranty clusters · VIN population scoping · root-cause linkage to Part Master"
      actions={<Button size="sm" className="gap-1.5"><Sparkles aria-hidden className="size-3.5" />Scope recall (AI)</Button>}
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Pilot VINs built",         v: program.pilotVinsBuilt.toLocaleString("en-US"), tone: "primary", icon: "vin" },
          { l: "Open quality events",      v: fieldEvents.filter(e => e.status !== "Resolved").length, tone: "warning" },
          { l: "VINs impacted (all events)",v: totalVinsAffected.toLocaleString("en-US"), tone: "warning" },
          { l: "Critical open",            v: criticalOpen, tone: "danger" },
        ].map(k => (
          <KpiTile
            key={k.l}
            label={k.l}
            icon={k.icon}
            value={k.v}
            valueClassName={k.tone === "danger" ? "text-error" : k.tone === "warning" ? "text-warning" : undefined}
          />
        ))}
      </div>

      {/* AI root-cause panel */}
      <div className="overflow-hidden rounded-lg border border-hairline bg-container p-4">
        <PanelHeader
          className="-mx-4 -mt-4 mb-4"
          title="AI Root-Cause · Power Liftgate Actuator Cluster"
          icon="ai"
          action={<Badge variant="warning">81% confidence</Badge>}
        />
        <p className="type-caption mb-3 text-tertiary">14 VINs · last 72h · Premium / Signature trims · BDY-LFT-7701</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 type-body-sm relative">
          {[
            { l: "Most likely cause",   v: "Actuator clutch slip on Magna lot 2026-MG-0418" },
            { l: "Common factor",       v: "All 14 VINs built at Pune ST-18 between Apr 12 to 14" },
            { l: "Recommended action",  v: "Contain lot 2026-MG-0418 (287 VINs scoped). ECN-2242 already approved." },
          ].map(b => (
            <div key={b.l} className="rounded-md border border-hairline bg-raised p-3">
              <p className="type-eyebrow text-quaternary">{b.l}</p>
              <p className="mt-1">{b.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Events table */}
      <div className="rounded-lg border border-hairline bg-container overflow-hidden">
        <PanelHeader title="Field Quality Events" icon="quality" action={<Badge variant="outline" className="type-caption">{fieldEvents.length} tracked</Badge>} />
        <div className="overflow-x-auto">
          <table className="tabular w-full type-body-sm">
            <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
              <tr>
                <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">ID</th>
                <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Severity</th>
                <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Event</th>
                <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Linked part</th>
                <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Variant</th>
                <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">VINs</th>
                <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Age</th>
                <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Status</th>
                <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody>
              {fieldEvents.map(e => {
                const part = e.partNumber ? getPart(e.partNumber) : null;
                return (
                  <tr key={e.id} className="border-t border-hairline hover:bg-raised">
                    <td className="px-3 py-2 font-mono type-caption">{e.id}</td>
                    <td className="px-3 py-2">{sevTone(e.severity) === "neutral" ? <span className="type-body-sm capitalize text-tertiary">{e.severity}</span> : <Badge variant={sevTone(e.severity)} className="capitalize">{e.severity}</Badge>}</td>
                    <td className="px-3 py-2 font-semibold">{e.title}</td>
                    <td className="px-3 py-2">
                      {part
                        ? <button className="text-left hover:text-foreground" onClick={() => navigate(`/parts/${e.partNumber}`)}>
                            <div>{part.name}</div>
                            <div className="font-mono type-caption text-tertiary">{e.partNumber}</div>
                          </button>
                        : <span className="text-tertiary">—</span>}
                    </td>
                    <td className="px-3 py-2 text-tertiary">{e.variant}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{e.vinsAffected.toLocaleString("en-US")}</td>
                    <td className="px-3 py-2 text-tertiary">{e.ageHours < 24 ? `${e.ageHours}h` : `${Math.round(e.ageHours / 24)}d`}</td>
                    <td className="px-3 py-2">{e.status === "Investigating" ? <Badge variant="warning">{e.status}</Badge> : <span className="type-body-sm text-tertiary">{e.status}</span>}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="ghost" className="h-6 type-body-sm gap-1 text-foreground"><MapPin aria-hidden className="size-3.5" />Trace</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-warning-surface p-4 flex items-start gap-3">
        <AlertTriangle aria-hidden className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="type-body-sm">
          <p className="font-semibold text-warning">UNECE R155 reportability check</p>
          <p className="text-tertiary mt-1">
            1 cybersecurity event (Infotainment IHU log4j CVE) crosses the disclosure threshold and must be reported within 7 days.
            See <button className="underline" onClick={() => navigate("/compliance")}>Compliance</button> for the audit trail.
          </p>
        </div>
      </div>
    </PageHeader>
  );
};

export default FieldQuality;
