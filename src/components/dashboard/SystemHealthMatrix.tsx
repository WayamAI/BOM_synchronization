import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  parts, mbomOps, suppliers, softwareComponents, getChildren, ecns,
} from "@/lib/mockData";
import { useProgramContext } from "@/context/ProgramContext";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/ui/app-icon";
import type { IconName } from "@/lib/icons";

const SYSTEM_VISUAL: Record<string, { icon: IconName; short: string }> = {
  PWT: { icon: "activity", short: "PWT" },
  BAT: { icon: "package",  short: "BAT" },
  CHS: { icon: "settings", short: "CHS" },
  BDY: { icon: "parts",    short: "BDY" },
  INT: { icon: "variants", short: "INT" },
  ELE: { icon: "cpu",      short: "ELE" },
};

const getSystemVisual = (pn: string): { icon: IconName; short: string } => {
  for (const [key, val] of Object.entries(SYSTEM_VISUAL)) {
    if (pn.toUpperCase().includes(key)) return val;
  }
  return { icon: "parts", short: pn.slice(0, 3) };
};

// BFS over the BOM graph starting from a system root
const descendants = (rootPN: string) => {
  const set = new Set<string>();
  const walk = (pn: string) => {
    if (set.has(pn)) return;
    set.add(pn);
    getChildren(pn).forEach(e => walk(e.childPN));
  };
  walk(rootPN);
  set.delete(rootPN);
  return set;
};

type Score = { value: number | null; raw?: string };

const cellStyle = (s: Score) => {
  if (s.value === null) return { fg: "text-muted-foreground", bar: "bg-muted-foreground/30" };
  if (s.value >= 85) return { fg: "text-success", bar: "bg-success" };
  if (s.value >= 65) return { fg: "text-warning", bar: "bg-warning" };
  return { fg: "text-critical", bar: "bg-critical" };
};

const cellBorderTone = (value: number | null) => {
  if (value === null) return "border-border/60 bg-surface-secondary/20";
  if (value < 65) return "border-critical/30 bg-critical/5";
  if (value < 85) return "border-warning/20 bg-warning/5";
  return "border-border/60 bg-surface-secondary/30";
};

export const SystemHealthMatrix = () => {
  const router = useRouter();
  const { activeProgram } = useProgramContext();

  const systemsMeta = useMemo(() => {
    const vehicleRoot = activeProgram.parts.find(p => p.type === "Vehicle");
    if (!vehicleRoot) return [];
    return getChildren(vehicleRoot.partNumber)
      .map(edge => {
        const sysPart = parts.find(p => p.partNumber === edge.childPN);
        if (!sysPart) return null;
        const vis = getSystemVisual(sysPart.partNumber);
        return { pn: sysPart.partNumber, name: sysPart.name, short: vis.short, icon: vis.icon };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [activeProgram]);

  const rows = useMemo(() => {
    const routedPNs = new Set(mbomOps.map(o => o.partNumber));

    return systemsMeta.map(sys => {
      const pns = descendants(sys.pn);
      const partsInSys = parts.filter(p => pns.has(p.partNumber));
      const total = partsInSys.length;

      // Design = % parts in Released state
      const released = partsInSys.filter(p => p.lifecycle === "Released").length;
      const inReview = partsInSys.filter(p => p.lifecycle === "In Review").length;
      const design: Score = { value: total ? Math.round((released / total) * 100) : 100, raw: `${released}/${total} released` };

      // Manufacturing = % assemblies with MBOM routing
      const assemblies = partsInSys.filter(p => p.type === "Assembly" || p.type === "Sub-Assembly");
      const routed = assemblies.filter(p => routedPNs.has(p.partNumber)).length;
      const mfg: Score = assemblies.length
        ? { value: Math.round((routed / assemblies.length) * 100), raw: `${routed}/${assemblies.length} routed` }
        : { value: null, raw: "no assemblies" };

      // Supply = weighted supplier risk (on-time %, minus single-source penalty)
      const supIds = new Set(partsInSys.map(p => p.supplierId).filter(Boolean) as string[]);
      const rel = suppliers.filter(s => supIds.has(s.id));
      const avgOnTime = rel.length ? rel.reduce((a, s) => a + s.onTimePct, 0) / rel.length : 95;
      const singleSrc = rel.filter(s => s.singleSource).length;
      const supply: Score = rel.length
        ? { value: Math.max(0, Math.min(100, Math.round(avgOnTime - singleSrc * 4))), raw: `${rel.length} suppliers · ${singleSrc} single-source` }
        : { value: null, raw: "no suppliers" };

      // Cyber = 100 - (CVE count × 5 + criticals × 10)
      const ecus = partsInSys.filter(p => p.type === "ECU");
      const allCves = ecus.flatMap(e => softwareComponents.filter(c => c.runsOnECU === e.partNumber).flatMap(c => c.cves));
      const crit = allCves.filter(v => v.severity === "Critical").length;
      const cyber: Score = ecus.length === 0
        ? { value: null, raw: "no ECUs" }
        : { value: Math.max(0, 100 - allCves.length * 5 - crit * 10), raw: `${ecus.length} ECUs · ${allCves.length} CVEs` };

      // Open ECNs targeting parts in this system
      const openEcns = ecns.filter(e =>
        (e.state === "In Review" || e.state === "Draft") &&
        e.affectedPNs.some(pn => pns.has(pn))
      ).length;

      return { ...sys, total, inReview, design, mfg, supply, cyber, openEcns };
    });
  }, [systemsMeta]);

  const dims = [
    { key: "design", label: "Design",        icon: "trendingUp" as const, to: "/ebom" },
    { key: "mfg",    label: "Manufacturing", icon: "factory" as const,    to: "/mbom" },
    { key: "supply", label: "Supply",        icon: "suppliers" as const,  to: "/suppliers" },
    { key: "cyber",  label: "Cyber",         icon: "software" as const,   to: "/software" },
  ] as const;

  const totals = useMemo(() => {
    const weighted = (key: "design" | "mfg" | "supply" | "cyber") => {
      const valid = rows.filter(r => r[key].value !== null);
      const total = valid.reduce((s, r) => s + r.total, 0) || 1;
      return Math.round(valid.reduce((s, r) => s + (r[key].value ?? 0) * r.total, 0) / total);
    };

    return {
      design: weighted("design"),
      mfg: weighted("mfg"),
      supply: weighted("supply"),
      cyber: weighted("cyber"),
      totalParts: rows.reduce((s, r) => s + r.total, 0),
      totalOpenEcns: rows.reduce((s, r) => s + r.openEcns, 0),
    };
  }, [rows]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-none flex flex-col gap-3">
      {/* Header with Title & Governed Status Legend */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">System Health Matrix</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cross-discipline readiness across design, manufacturing, supply, and cybersecurity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#275a3b] px-2.5 py-0.5 text-white font-medium border-transparent">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Healthy ≥85
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8a430f] px-2.5 py-0.5 text-white font-medium border-transparent">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Watch 65–84
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#891f24] px-2.5 py-0.5 text-white font-medium border-transparent">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Risk &lt;65
          </span>
        </div>
      </div>

      {/* Headline Rollup Strip */}
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        <div className="rounded-md border border-border/50 bg-surface-secondary/40 px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Systems</div>
          <div className="mt-1 text-base font-bold tabular-nums text-foreground">{rows.length}</div>
        </div>
        <div className="rounded-md border border-border/50 bg-surface-secondary/40 px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Parts</div>
          <div className="mt-1 text-base font-bold tabular-nums text-foreground">{totals.totalParts}</div>
        </div>
        {dims.map(d => {
          const v = totals[d.key as "design" | "mfg" | "supply" | "cyber"];
          return (
            <div key={d.key} className="rounded-md border border-border/50 bg-surface-secondary/40 px-2.5 py-2">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                <AppIcon name={d.icon} size="xs" className="text-muted-foreground" />
                {d.label}
              </div>
              <div className={cn(
                "mt-1 text-base font-bold tabular-nums",
                v >= 85 ? "text-success" : v >= 65 ? "text-warning" : "text-critical"
              )}>
                {v}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Section: Header + Rows */}
      <div className="flex flex-col gap-1.5">
        {/* Table Column Headers (Desktop) */}
        <div className="hidden grid-cols-[minmax(180px,1.6fr)_55px_repeat(4,minmax(90px,1fr))_75px] gap-2 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground lg:grid">
          <div>System</div>
          <div className="text-center">Parts</div>
          {dims.map(d => (
            <div key={d.key} className="text-center">{d.label}</div>
          ))}
          <div className="text-center">Open ECN</div>
        </div>

        {/* Diagnostic Rows — Single structured panel with hairline dividers to eliminate card fatigue */}
        <div className="divide-y divide-border/40 rounded-lg border border-border bg-surface-secondary/15 overflow-hidden">
        {rows.map(row => (
          <div
            key={row.pn}
            className="px-3 py-2.5 transition-colors hover:bg-surface-secondary/50 focus-within:bg-surface-secondary/50"
          >
            <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-[minmax(180px,1.6fr)_55px_repeat(4,minmax(90px,1fr))_75px] lg:items-center lg:gap-2">
              {/* System Identifier & Metadata */}
              <button
                onClick={() => router.push(`/parts/${row.pn}`)}
                aria-label={`View ${row.name} system part master (${row.pn})`}
                className="group min-w-0 text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border/60 bg-surface-secondary text-foreground group-hover:border-primary/40 transition-colors">
                    <AppIcon name={row.icon} size="xs" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{row.name}</span>
                      <span className="rounded-full border border-border/60 bg-surface-secondary px-2 py-0.2 text-[10px] text-muted-foreground tabular-nums">
                        {row.short}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                      <span className={cn(
                        "rounded-full px-2 py-0 text-[10px] font-medium text-white border-transparent",
                        row.inReview > 0
                          ? "bg-[#8a430f]"
                          : "bg-[#275a3b]"
                      )}>
                        {row.inReview > 0 ? `${row.inReview} in review` : "All released"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Total Parts Count */}
              <div className="text-left lg:text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground lg:hidden">Parts</div>
                <div className="text-xs sm:text-sm font-semibold tabular-nums text-foreground">{row.total}</div>
              </div>

              {/* Dimension Metric Cells */}
              {dims.map(d => {
                const s = row[d.key as keyof typeof row] as Score;
                const style = cellStyle(s);
                return (
                  <button
                    key={d.key}
                    onClick={() => router.push(d.to)}
                    title={s.raw}
                    aria-label={`${row.name} ${d.label} readiness: ${s.value === null ? "N/A" : `${s.value}%`}. ${s.raw ?? ""}`}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-left transition-colors",
                      "hover:border-primary/40 hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
                      cellBorderTone(s.value)
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-1">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground lg:hidden">
                        {d.label}
                      </div>
                      <div className={cn("text-xs font-bold tabular-nums leading-none", style.fg)}>
                        {s.value === null ? "N/A" : `${s.value}%`}
                      </div>
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-surface-secondary overflow-hidden">
                      <div
                        className={cn("h-full transition-all duration-300", style.bar)}
                        style={{ width: `${s.value ?? 0}%` }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground truncate">{s.raw}</div>
                  </button>
                );
              })}

              {/* Open ECN Action Pill */}
              <div className="flex items-center lg:justify-center">
                {row.openEcns > 0 ? (
                  <button
                    onClick={() => router.push("/changes")}
                    aria-label={`View ${row.openEcns} open ECNs affecting ${row.name}`}
                    className="inline-flex items-center gap-1 rounded-full bg-[#8a430f] px-2.5 py-0.5 text-[10px] font-medium text-white hover:bg-[#a65315] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <AppIcon name="changes" size="xs" className="text-white" />
                    {row.openEcns} open
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground/60 tabular-nums">—</span>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};
