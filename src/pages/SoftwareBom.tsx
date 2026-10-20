import { EmptyState, KpiTile, Panel, QuietStatus } from "@/components/ui/primitives";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  softwareComponents, parts as allParts, getPart, cveTimeline, totals,
} from "@/lib/mockData";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShieldAlert, Search, Download, Cpu } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { axisTick, chartTooltipLabelStyle, chartTooltipStyle } from "@/components/dashboard/chartTheme";

const sevCls = (s: string): BadgeVariant =>
  s === "Critical" ? "error" :
  s === "High"     ? "warning" :
  s === "Medium"   ? "info" :
  s === "Low"      ? "neutral" :
                     "success";

const SoftwareBom = () => {
  const navigate = useNavigate();
  const [ecuFilter, setEcuFilter] = useState<string>("ALL");
  const [sevFilter, setSevFilter] = useState<string>("ALL");
  const [q, setQ] = useState("");

  const ecuParts = useMemo(() => allParts.filter(p => p.type === "ECU"), []);

  const filtered = useMemo(() => softwareComponents.filter(c => {
    if (ecuFilter !== "ALL" && c.runsOnECU !== ecuFilter) return false;
    if (sevFilter !== "ALL") {
      if (sevFilter === "Clean" && c.cves.length > 0) return false;
      if (sevFilter !== "Clean" && !c.cves.some(v => v.severity === sevFilter)) return false;
    }
    if (q && !c.name.toLowerCase().includes(q.toLowerCase()) && !c.supplier.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [ecuFilter, sevFilter, q]);

  const ecuRollup = useMemo(() => ecuParts.map(e => {
    const pkgs = softwareComponents.filter(c => c.runsOnECU === e.partNumber);
    const cves = pkgs.reduce((s, p) => s + p.cves.length, 0);
    const crit = pkgs.reduce((s, p) => s + p.cves.filter(v => v.severity === "Critical").length, 0);
    return { ecu: e, pkgs: pkgs.length, cves, crit };
  }), [ecuParts]);

  return (
    <PageHeader
      title="Software BOM"
      mark="software"
      subtitle={`Cyber · CycloneDX-compatible software inventory · ${totals.softwareComponents} packages across ${ecuParts.length} ECUs`}
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-1.5"><Download aria-hidden className="h-3.5 w-3.5" />Export CycloneDX</Button>
          <Button size="sm" className="gap-1.5"><ShieldAlert aria-hidden className="h-3.5 w-3.5" />Run vulnerability scan</Button>
        </>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Packages",        value: totals.softwareComponents },
          { label: "ECUs tracked",    value: ecuParts.length },
          { label: "Open CVEs",       value: totals.openCves, tone: "warning" },
          { label: "Critical CVEs",   value: totals.criticalCves, tone: "critical" },
          { label: "License clean",   value: `${softwareComponents.filter(c => !["GPL-3.0","AGPL-3.0"].includes(c.license)).length}/${softwareComponents.length}` },
        ].map(k => (
          <KpiTile
            key={k.label}
            label={k.label}
            value={k.value}
            valueClassName={k.tone === "critical" ? "text-error" : k.tone === "warning" ? "text-warning" : undefined}
          />
        ))}
      </div>

      {/* ECU rollup + CVE trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="ECU Cyber Posture" icon="software" className="lg:col-span-2">
          <p className="type-body-sm text-muted-foreground mb-3">Each ECU and its software package footprint</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ecuRollup.map(r => (
              <button
                key={r.ecu.partNumber}
                onClick={() => navigate(`/parts/${r.ecu.partNumber}`)}
                className="flex items-center justify-between rounded-md border border-hairline p-2 hover:bg-raised text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Cpu aria-hidden className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{r.ecu.name}</div>
                    <div className="type-caption font-mono text-muted-foreground">{r.ecu.partNumber} · {r.ecu.revision}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="type-body-sm tabular text-tertiary">{r.pkgs} pkg</span>
                  {r.crit > 0
                    ? <Badge variant="error">{r.crit} crit</Badge>
                    : r.cves > 0
                      ? <Badge variant="warning">{r.cves} CVE</Badge>
                      : <QuietStatus tone="success">clean</QuietStatus>}
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="CVE Trend · 6 Weeks">
          <p className="type-body-sm text-muted-foreground">New vulnerabilities identified per week</p>
          <div className="h-[220px] mt-2">
            <ResponsiveContainer>
              <BarChart data={cveTimeline} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={axisTick} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} />
                <Tooltip contentStyle={chartTooltipStyle} labelStyle={chartTooltipLabelStyle} itemStyle={chartTooltipLabelStyle} cursor={{ fill: "var(--surface-raised)" }} />
                <Legend formatter={(v: string) => <span style={{ color: "var(--text-tertiary)" }}>{v}</span>} wrapperStyle={{ fontSize: 12, color: "var(--text-tertiary)" }} iconType="circle" iconSize={8} />
                <Bar name="Critical" dataKey="critical" stackId="a" fill="var(--analytics-series-4)" isAnimationActive={false} />
                <Bar name="High" dataKey="high"     stackId="a" fill="var(--analytics-series-3)" isAnimationActive={false} />
                <Bar name="Medium" dataKey="medium"   stackId="a" fill="var(--analytics-series-1)" isAnimationActive={false} />
                <Bar name="Low" dataKey="low"      stackId="a" fill="var(--analytics-series-5)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={ecuFilter} onValueChange={setEcuFilter}>
          <SelectTrigger aria-label="Filter by ECUs" className="h-8 w-56 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All ECUs</SelectItem>
            {ecuParts.map(e => <SelectItem key={e.partNumber} value={e.partNumber}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sevFilter} onValueChange={setSevFilter}>
          <SelectTrigger aria-label="Filter by severity" className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any severity</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Clean">Clean</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Search aria-hidden className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input aria-label="Search package or vendor" value={q} onChange={e => setQ(e.target.value)} placeholder="Search package or vendor" className="h-8 w-64 pl-8 text-xs" />
        </div>
        <Badge variant="secondary" className="ml-auto">{filtered.length} package{filtered.length === 1 ? "" : "s"}</Badge>
      </div>

      {/* Package table */}
      <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
        <table className="tabular w-full text-xs">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Package</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Version</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">License</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Supplier</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Runs on (ECU)</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Safety-critical</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Vulnerabilities</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7}><EmptyState title="No packages match this filter" mark="software" /></td></tr>
            )}
            {filtered.map(c => {
              const ecu = getPart(c.runsOnECU);
              return (
                <tr key={c.id} className="border-t border-hairline hover:bg-raised">
                  <td className="px-3 py-2 font-mono font-semibold">{c.name}</td>
                  <td className="px-3 py-2 font-mono">{c.version}</td>
                  <td className="px-3 py-2">{c.license}</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.supplier}</td>
                  <td className="px-3 py-2">
                    <button className="text-left hover:text-primary" onClick={() => navigate(`/parts/${c.runsOnECU}`)}>
                      <div>{ecu?.name}</div>
                      <div className="font-mono type-caption text-muted-foreground">{c.runsOnECU}</div>
                    </button>
                  </td>
                  <td className="px-3 py-2">{c.critical ? <Badge variant="error">Safety-critical</Badge> : <span className="type-body-sm text-tertiary">Non-critical</span>}</td>
                  <td className="px-3 py-2">
                    {c.cves.length === 0 && <QuietStatus tone="success">Clean</QuietStatus>}
                    <div className="flex flex-col gap-1">
                      {c.cves.map(v => (
                        <div key={v.id} className="flex items-center gap-1.5">
                          <Badge variant={sevCls(v.severity)}>{v.severity}</Badge>
                          <span className="font-mono type-caption">{v.id}</span>
                          {v.fixedIn && <span className="type-caption text-muted-foreground">fixed in {v.fixedIn}</span>}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageHeader>
  );
};

export default SoftwareBom;
