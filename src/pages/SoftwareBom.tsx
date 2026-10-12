import { EmptyState } from "@/components/ui/primitives";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  softwareComponents, parts as allParts, getPart, cveTimeline, totals,
} from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShieldAlert, Search, Download, Cpu } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const sevCls = (s: string) =>
  s === "Critical" ? "bg-critical/15 text-critical border-critical/30" :
  s === "High"     ? "bg-orange-500/15 text-orange-500 border-orange-500/30" :
  s === "Medium"   ? "bg-warning/15 text-warning border-warning/30" :
  s === "Low"      ? "bg-muted text-muted-foreground border-border" :
                     "bg-success/15 text-success border-success/30";

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
      title="Software BOM (Cyber)"
      subtitle={`CycloneDX-compatible software inventory · ${totals.softwareComponents} packages across ${ecuParts.length} ECUs`}
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" />Export CycloneDX</Button>
          <Button size="sm" className="gap-1.5 bg-gradient-primary border-0"><ShieldAlert className="h-3.5 w-3.5" />Run Vulnerability Scan</Button>
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
          <div key={k.label} className="rounded-lg border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
            <div className={cn("text-lg font-bold tabular-nums",
              k.tone === "critical" && "text-critical",
              k.tone === "warning" && "text-warning",
            )}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* ECU rollup + CVE trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold">ECU Cyber Posture</h3>
          <p className="text-[11px] text-muted-foreground mb-3">Each ECU and its software package footprint</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ecuRollup.map(r => (
              <button
                key={r.ecu.partNumber}
                onClick={() => navigate(`/parts/${r.ecu.partNumber}`)}
                className="flex items-center justify-between rounded-md border border-border p-2 hover:bg-muted/30 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Cpu className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{r.ecu.name}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{r.ecu.partNumber} · {r.ecu.revision}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-[10px]">{r.pkgs} pkg</Badge>
                  {r.crit > 0
                    ? <Badge className="bg-critical/15 text-critical border-critical/30 text-[10px]">{r.crit} crit</Badge>
                    : r.cves > 0
                      ? <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px]">{r.cves} CVE</Badge>
                      : <Badge className="bg-success/15 text-success border-success/30 text-[10px]">clean</Badge>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-semibold">CVE Trend · 6 weeks</h3>
          <p className="text-[11px] text-muted-foreground">New vulnerabilities identified per week</p>
          <div className="h-[220px] mt-2">
            <ResponsiveContainer>
              <BarChart data={cveTimeline} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
                <Bar dataKey="critical" stackId="a" fill="hsl(var(--critical))" />
                <Bar dataKey="high"     stackId="a" fill="hsl(25 95% 55%)" />
                <Bar dataKey="medium"   stackId="a" fill="hsl(var(--warning))" />
                <Bar dataKey="low"      stackId="a" fill="hsl(var(--muted-foreground))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={ecuFilter} onValueChange={setEcuFilter}>
          <SelectTrigger className="h-8 w-56 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All ECUs</SelectItem>
            {ecuParts.map(e => <SelectItem key={e.partNumber} value={e.partNumber}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sevFilter} onValueChange={setSevFilter}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
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
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search package or vendor…" className="h-8 w-64 pl-8 text-xs" />
        </div>
        <Badge variant="secondary" className="ml-auto">{filtered.length} package{filtered.length === 1 ? "" : "s"}</Badge>
      </div>

      {/* Package table */}
      <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
        <table className="tabular w-full text-xs">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Package</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Version</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">License</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Supplier</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Runs on (ECU)</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Safety-critical</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Vulnerabilities</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7}><EmptyState title="No packages match this filter" /></td></tr>
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
                      <div className="font-mono text-[10px] text-muted-foreground">{c.runsOnECU}</div>
                    </button>
                  </td>
                  <td className="px-3 py-2">{c.critical ? <Badge className="bg-critical/15 text-critical border-critical/30 text-[10px]">Safety-critical</Badge> : <Badge variant="outline" className="text-[10px]">Non-critical</Badge>}</td>
                  <td className="px-3 py-2">
                    {c.cves.length === 0 && <Badge className="bg-success/15 text-success border-success/30 text-[10px]">Clean</Badge>}
                    <div className="flex flex-col gap-1">
                      {c.cves.map(v => (
                        <div key={v.id} className="flex items-center gap-1.5">
                          <Badge className={cn("text-[10px] border", sevCls(v.severity))}>{v.severity}</Badge>
                          <span className="font-mono text-[10px]">{v.id}</span>
                          {v.fixedIn && <span className="text-[10px] text-muted-foreground">→ fixed in {v.fixedIn}</span>}
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
