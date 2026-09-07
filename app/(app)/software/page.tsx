"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  s === "Critical" ? "bg-[#891f24] text-white border-transparent font-semibold" :
  s === "High"     ? "bg-[#9a3814] text-white border-transparent font-medium" :
  s === "Medium"   ? "bg-[#8a430f] text-white border-transparent font-medium" :
  s === "Low"      ? "bg-[#3f3f46] text-white border-transparent" :
                     "bg-[#275a3b] text-white border-transparent font-medium";

export default function SoftwareBom() {
  const router = useRouter();
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
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs rounded-md border-border/60 bg-card hover:bg-surface-secondary text-foreground"><Download className="h-3 w-3" />Export CycloneDX</Button>
          <Button size="sm" className="btn-primary-white gap-1.5 rounded-md h-7 text-xs font-medium"><ShieldAlert className="h-3 w-3" />Run Vulnerability Scan</Button>
        </>
      }
    >
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: "Packages",        value: totals.softwareComponents },
          { label: "ECUs tracked",    value: ecuParts.length },
          { label: "Open CVEs",       value: totals.openCves, tone: "warning" },
          { label: "Critical CVEs",   value: totals.criticalCves, tone: "critical" },
          { label: "License clean",   value: `${softwareComponents.filter(c => !["GPL-3.0","AGPL-3.0"].includes(c.license)).length}/${softwareComponents.length}` },
        ].map(k => (
          <div key={k.label} className="rounded-lg border border-border bg-card p-3 shadow-none">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{k.label}</div>
            <div className={cn("mt-0.5 text-base font-bold tabular-nums",
              k.tone === "critical" ? "text-critical" :
              k.tone === "warning" ? "text-warning" : "text-foreground"
            )}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* ECU rollup + CVE trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4 shadow-none">
          <h3 className="text-sm font-semibold text-foreground tracking-tight">ECU Cyber Posture</h3>
          <p className="text-xs text-muted-foreground mb-2.5 mt-0.5">Each ECU and its software package footprint</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ecuRollup.map(r => (
              <button
                key={r.ecu.partNumber}
                onClick={() => router.push(`/parts/${r.ecu.partNumber}`)}
                className="flex items-center justify-between rounded-md border border-border/60 p-2.5 hover:bg-surface-secondary/70 text-left transition-colors bg-surface-secondary/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Cpu className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate text-foreground">{r.ecu.name}</div>
                    <div className="text-[10px] text-muted-foreground tabular-nums">{r.ecu.partNumber} · {r.ecu.revision}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.2 border-border/60 tabular-nums">{r.pkgs} pkg</Badge>
                  {r.crit > 0
                    ? <Badge className="bg-[#891f24] text-white border-transparent text-[10px] rounded-full px-2 py-0.5 font-medium">{r.crit} crit</Badge>
                    : r.cves > 0
                      ? <Badge className="bg-[#8a430f] text-white border-transparent text-[10px] rounded-full px-2 py-0.5 font-medium">{r.cves} CVE</Badge>
                      : <Badge className="bg-[#275a3b] text-white border-transparent text-[10px] rounded-full px-2 py-0.5 font-medium">clean</Badge>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-none">
          <h3 className="text-sm font-semibold text-foreground tracking-tight">CVE Trend · 6 weeks</h3>
          <p className="text-xs text-muted-foreground mt-0.5">New vulnerabilities identified per week</p>
          <div className="h-[200px] mt-2">
            <ResponsiveContainer>
              <BarChart data={cveTimeline} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={10} fontFamily="var(--font-geist-sans, sans-serif)" />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} fontFamily="var(--font-geist-sans, sans-serif)" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 11, fontFamily: "var(--font-geist-sans, sans-serif)" }} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-geist-sans, sans-serif)" }} iconSize={8} />
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
          <SelectTrigger className="h-7 w-56 text-xs rounded-md border-border/60 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent className="rounded-md border-border bg-popover">
            <SelectItem value="ALL">All ECUs</SelectItem>
            {ecuParts.map(e => <SelectItem key={e.partNumber} value={e.partNumber}>{e.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sevFilter} onValueChange={setSevFilter}>
          <SelectTrigger className="h-7 w-40 text-xs rounded-md border-border/60 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent className="rounded-md border-border bg-popover">
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
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search package or vendor…" className="h-7 w-64 pl-8 text-xs rounded-md border-border/60 bg-surface-secondary/30" />
        </div>
        <Badge variant="secondary" className="ml-auto text-[10px] rounded-full border-border/60 tabular-nums">{filtered.length} package{filtered.length === 1 ? "" : "s"}</Badge>
      </div>

      {/* Package table */}
      <div className="rounded-lg border border-border bg-card shadow-none overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wide text-muted-foreground bg-surface-secondary/40 border-b border-border/50">
            <tr>
              <th className="text-left py-2 px-3">Package</th>
              <th className="text-left py-2 px-3">Version</th>
              <th className="text-left py-2 px-3">License</th>
              <th className="text-left py-2 px-3">Supplier</th>
              <th className="text-left py-2 px-3">Runs on (ECU)</th>
              <th className="text-left py-2 px-3">Safety-critical</th>
              <th className="text-left py-2 px-3">Vulnerabilities</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.map(c => {
              const ecu = getPart(c.runsOnECU);
              return (
                <tr key={c.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="py-2 px-3 text-xs font-semibold text-foreground">{c.name}</td>
                  <td className="py-2 px-3 text-xs text-muted-foreground tabular-nums">{c.version}</td>
                  <td className="py-2 px-3 text-foreground">{c.license}</td>
                  <td className="py-2 px-3 text-muted-foreground text-xs">{c.supplier}</td>
                  <td className="py-2 px-3">
                    <button className="text-left hover:text-primary transition-colors" onClick={() => router.push(`/parts/${c.runsOnECU}`)}>
                      <div className="text-foreground">{ecu?.name}</div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">{c.runsOnECU}</div>
                    </button>
                  </td>
                  <td className="py-2 px-3">{c.critical ? <Badge className="bg-[#891f24] text-white border-transparent text-[10px] rounded-full px-2.5 py-0.5 font-medium">Safety-critical</Badge> : <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0.5 border-border/60">Non-critical</Badge>}</td>
                  <td className="py-2 px-3">
                    {c.cves.length === 0 && <Badge className="bg-[#275a3b] text-white border-transparent text-[10px] rounded-full px-2.5 py-0.5 font-medium">Clean</Badge>}
                    <div className="flex flex-col gap-1">
                      {c.cves.map(v => (
                        <div key={v.id} className="flex items-center gap-1.5">
                          <Badge className={cn("text-[9px] rounded-full border px-1.5 py-0 font-medium", sevCls(v.severity))}>{v.severity}</Badge>
                          <span className="text-xs text-foreground tabular-nums">{v.id}</span>
                          {v.fixedIn && <span className="text-[10px] text-muted-foreground tabular-nums">→ fixed in {v.fixedIn}</span>}
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
}
