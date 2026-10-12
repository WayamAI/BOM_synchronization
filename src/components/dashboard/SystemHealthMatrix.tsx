import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  parts, mbomOps, suppliers, softwareComponents, getChildren, ecns,
} from "@/lib/mockData";
import { useProgramContext } from "@/context/ProgramContext";
import { cn } from "@/lib/utils";
import {
  Zap, Battery, CircleDot, Box, Armchair, Cpu,
  TrendingUp, Factory, Truck, ShieldAlert, FileEdit,
} from "lucide-react";

const SYSTEM_VISUAL: Record<string, { icon: typeof Zap; color: string; short: string }> = {
  PWT: { icon: Zap,       color: "var(--analytics-series-1)", short: "PWT" },
  BAT: { icon: Battery,   color: "var(--analytics-series-2)", short: "BAT" },
  CHS: { icon: CircleDot, color: "var(--analytics-series-3)", short: "CHS" },
  BDY: { icon: Box,       color: "var(--analytics-series-4)", short: "BDY" },
  INT: { icon: Armchair,  color: "var(--analytics-series-5)", short: "INT" },
  ELE: { icon: Cpu,       color: "var(--analytics-series-6)", short: "ELE" },
};

const getSystemVisual = (pn: string) => {
  for (const [key, val] of Object.entries(SYSTEM_VISUAL)) {
    if (pn.toUpperCase().includes(key)) return val;
  }
  return { icon: Box, color: "var(--analytics-series-5)", short: pn.slice(0, 3) };
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
  if (s.value === null) return { fg: "text-quaternary", bar: "bg-quaternary" };
  if (s.value >= 85) return { fg: "text-success", bar: "bg-success" };
  if (s.value >= 65) return { fg: "text-warning", bar: "bg-warning" };
  return { fg: "text-error", bar: "bg-error" };
};

const scoreTone = (value: number | null) => {
  // Colour is carried by the percentage and the bar; the cell itself stays neutral.
  void value;
  return "border-hairline bg-container";
};

export const SystemHealthMatrix = () => {
  const navigate = useNavigate();
  const { activeProgram } = useProgramContext();

  const systemsMeta = useMemo(() => {
    const vehicleRoot = activeProgram.parts.find(p => p.type === "Vehicle");
    if (!vehicleRoot) return [];
    return getChildren(vehicleRoot.partNumber)
      .map(edge => {
        const sysPart = parts.find(p => p.partNumber === edge.childPN);
        if (!sysPart) return null;
        const vis = getSystemVisual(sysPart.partNumber);
        return { pn: sysPart.partNumber, name: sysPart.name, short: vis.short, icon: vis.icon, color: vis.color };
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
    { key: "design", label: "Design",        icon: TrendingUp,  to: "/ebom" },
    { key: "mfg",    label: "Manufacturing", icon: Factory,     to: "/mbom" },
    { key: "supply", label: "Supply",        icon: Truck,       to: "/suppliers" },
    { key: "cyber",  label: "Cyber",         icon: ShieldAlert, to: "/software" },
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
    <div className="h-full rounded-lg border border-hairline bg-container p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-4">
        <div>
          <h3 className="type-eyebrow text-quaternary">System Health Matrix</h3>
          <p className="type-body-sm mt-1 text-tertiary">
            Readiness by system across design, manufacturing, supply and cyber.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="type-caption inline-flex items-center gap-1.5 text-success">
            <span className="size-1.5 rounded-full bg-success" />
            Healthy 85+
          </span>
          <span className="type-caption inline-flex items-center gap-1.5 text-warning">
            <span className="size-1.5 rounded-full bg-warning" />
            Watch 65-84
          </span>
          <span className="type-caption inline-flex items-center gap-1.5 text-error">
            <span className="size-1.5 rounded-full bg-error" />
            Risk below 65
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
        <div className="rounded-md border border-hairline bg-raised px-3 py-2">
          <div className="type-eyebrow text-quaternary">Systems</div>
          <div className="type-display-lg tabular mt-1 text-foreground">{rows.length}</div>
        </div>
        <div className="rounded-md border border-hairline bg-raised px-3 py-2">
          <div className="type-eyebrow text-quaternary">Parts</div>
          <div className="type-display-lg tabular mt-1 text-foreground">{totals.totalParts}</div>
        </div>
        {dims.map(d => {
          const v = totals[d.key as "design" | "mfg" | "supply" | "cyber"];
          return (
            <div key={d.key} className="rounded-lg border border-border bg-muted/20 px-3 py-2">
              <div className="type-eyebrow flex items-center gap-1 text-quaternary">
                <d.icon className="size-3" aria-hidden />
                {d.label}
              </div>
              <div className={cn(
                "type-display-lg tabular mt-1",
                v >= 85 ? "text-success" : v >= 65 ? "text-warning" : "text-error"
              )}>
                {v}%
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 hidden grid-cols-[minmax(220px,1.7fr)_70px_repeat(4,minmax(110px,1fr))_84px] type-eyebrow gap-3 px-2 text-quaternary lg:grid">
        <div>System</div>
        <div className="text-center">Parts</div>
        {dims.map(d => (
          <div key={d.key} className="text-center">{d.label}</div>
        ))}
        <div className="text-center">Open ECN</div>
      </div>

      <div className="mt-2 space-y-2">
        {rows.map(row => {
          const Icon = row.icon;
          return (
            <div
              key={row.pn}
              className="rounded-lg border border-hairline bg-raised px-4 py-3 transition-colors duration-150 hover:border-strong"
            >
              <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(220px,1.7fr)_70px_repeat(4,minmax(110px,1fr))_84px] lg:items-center lg:gap-3">
                <button onClick={() => navigate(`/parts/${row.pn}`)} className="min-w-0 text-left">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-10 shrink-0 place-items-center rounded-lg"
                      style={{ background: `color-mix(in srgb, ${row.color} 8%, transparent)`, color: row.color, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${row.color} 18%, transparent)` }}
                    >
                      <Icon className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="type-label-md truncate text-foreground">{row.name}</span>
                        <span className="type-caption rounded-full border border-hairline bg-action px-2 py-0.5 font-mono text-quaternary">
                          {row.short}
                        </span>
                      </div>
                      <div className="type-body-sm mt-1 flex flex-wrap items-center gap-2 text-tertiary">
                        <span className={cn(row.inReview > 0 ? "text-warning" : "text-success")}>
                          {row.inReview > 0 ? `${row.inReview} in review` : "All released"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <div className="text-left lg:text-center">
                  <div className="type-eyebrow text-quaternary lg:hidden">Parts</div>
                  <div className="type-display-lg tabular text-foreground">{row.total}</div>
                </div>

                {dims.map(d => {
                  const s = row[d.key as keyof typeof row] as Score;
                  const style = cellStyle(s);
                  return (
                    <button
                      key={d.key}
                      onClick={() => navigate(d.to)}
                      title={s.raw}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left transition-colors",
                        "outline-none duration-150 hover:border-strong focus-visible:ring-2 focus-visible:ring-active",
                        scoreTone(s.value)
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="type-eyebrow text-quaternary lg:hidden">
                          {d.label}
                        </div>
                        <div className={cn("type-display-lg tabular leading-none", style.fg)}>
                          {s.value === null ? "N/A" : `${s.value}%`}
                        </div>
                      </div>
                      <div className="mt-2 h-1 rounded-full bg-raised-2">
                        <div
                          className={cn("h-full rounded-full", style.bar)}
                          style={{ width: `${s.value ?? 0}%` }}
                        />
                      </div>
                      <div className="type-body-sm mt-2 text-tertiary">{s.raw}</div>
                    </button>
                  );
                })}

                <div className="flex items-center lg:justify-center">
                  {row.openEcns > 0 ? (
                    <button
                      onClick={() => navigate("/changes")}
                      className="type-label-sm inline-flex items-center gap-1 rounded-full border border-hairline bg-action px-2.5 py-1 text-warning outline-none transition-colors duration-150 hover:border-strong hover:bg-raised-2 focus-visible:ring-2 focus-visible:ring-active"
                    >
                      <FileEdit className="size-3" aria-hidden />
                      {row.openEcns} open
                    </button>
                  ) : (
                    <span className="type-body-sm text-quaternary">—</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
