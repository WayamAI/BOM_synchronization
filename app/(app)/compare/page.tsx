"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  variants, buildEbomTree, type EbomNode, mbomOps, parts as allParts, getPart,
} from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AppIcon } from "@/components/ui/app-icon";
import { EnterpriseTable, type TableColumn } from "@/components/ui/enterprise-table";

type Mode = "variants" | "ebom-mbom";

interface UnmappedAssemblyRow {
  partNumber: string;
  name: string;
  type: string;
  supplierId: string;
}

const flattenPNs = (n: EbomNode): Set<string> => {
  const out = new Set<string>();
  const walk = (x: EbomNode) => { out.add(x.partNumber); x.children?.forEach(walk); };
  walk(n);
  out.delete("MER-VEH-0001");
  return out;
};

const compareColumns = (router: ReturnType<typeof useRouter>): TableColumn<UnmappedAssemblyRow>[] => [
  {
    id: "partNumber",
    header: "Part Number",
    width: "w-44",
    cell: (row) => (
      <button
        type="button"
        onClick={(evt) => {
          evt.stopPropagation();
          router.push(`/parts/${encodeURIComponent(row.partNumber)}`);
        }}
        className="font-mono text-[11px] font-semibold text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded text-left inline-flex items-center gap-1.5"
        aria-label={`View details for ${row.partNumber}`}
      >
        <span>{row.partNumber}</span>
        <AppIcon name="externalLink" className="h-3 w-3 text-muted-foreground/60" />
      </button>
    ),
    sortValue: (row) => row.partNumber,
  },
  {
    id: "name",
    header: "Name",
    cell: (row) => (
      <span className="font-medium text-foreground text-xs leading-normal">
        {row.name}
      </span>
    ),
    sortValue: (row) => row.name,
  },
  {
    id: "type",
    header: "Type",
    width: "w-32",
    cell: (row) => (
      <span className="text-muted-foreground font-mono text-[11px]">{row.type}</span>
    ),
    sortValue: (row) => row.type,
  },
  {
    id: "supplier",
    header: "Supplier",
    width: "w-36",
    cell: (row) => (
      <span className="text-muted-foreground font-mono text-[11px]">{row.supplierId || "—"}</span>
    ),
    sortValue: (row) => row.supplierId || "",
  },
];

export default function BomComparePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("variants");
  const [a, setA] = useState(variants[0].code);
  const [b, setB] = useState(variants[2].code);

  const columns = useMemo(() => compareColumns(router), [router]);

  const variantResult = useMemo(() => {
    const A = flattenPNs(buildEbomTree("MER-VEH-0001", a));
    const B = flattenPNs(buildEbomTree("MER-VEH-0001", b));
    const onlyA: string[] = [];
    const onlyB: string[] = [];
    const both: string[] = [];
    const all = new Set<string>([...A, ...B]);
    all.forEach(pn => {
      const inA = A.has(pn);
      const inB = B.has(pn);
      if (inA && inB) both.push(pn);
      else if (inA) onlyA.push(pn);
      else onlyB.push(pn);
    });
    return { onlyA, onlyB, both };
  }, [a, b]);

  const ebomVsMbom = useMemo(() => {
    const assemblies = allParts.filter(p => p.type === "Assembly" || p.type === "Sub-Assembly");
    const mbomRouted = new Set(mbomOps.map(o => o.partNumber));
    const routedList: string[] = [];
    const unroutedList: string[] = [];
    assemblies.forEach(p => (mbomRouted.has(p.partNumber) ? routedList : unroutedList).push(p.partNumber));
    // Things in MBOM that are not EBOM assemblies (e.g. consumables-as-ops) — none in this dataset but check anyway
    const ebomSet = new Set(assemblies.map(p => p.partNumber));
    const onlyMbom = Array.from(mbomRouted).filter(pn => !ebomSet.has(pn));
    return { matched: routedList, onlyEbom: unroutedList, onlyMbom };
  }, []);

  const unmappedRows: UnmappedAssemblyRow[] = useMemo(() => {
    return ebomVsMbom.onlyEbom.map((pn) => {
      const p = getPart(pn);
      return {
        partNumber: pn,
        name: p?.name ?? pn,
        type: p?.type ?? "Assembly",
        supplierId: p?.supplierId ?? "—",
      };
    });
  }, [ebomVsMbom.onlyEbom]);

  return (
    <PageHeader
      title="BOM Compare"
      subtitle="Side-by-side diff across variants, or between EBOM and MBOM"
      actions={
        <Button variant="outline" size="sm" className="h-7 text-xs rounded-sm font-mono gap-1.5 border-stroke-subtle bg-surface-primary hover:bg-surface-secondary text-foreground">
          <AppIcon name="download" className="h-3 w-3" />
          Export diff (CSV)
        </Button>
      }
    >
      {/* Mode toggle */}
      <div className="inline-flex rounded-sm border border-stroke-subtle bg-surface-primary p-0.5">
        <button
          onClick={() => setMode("variants")}
          className={cn("px-2.5 py-1 text-xs rounded-sm font-mono transition-colors", mode === "variants" ? "bg-surface-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground")}
        >
          Variant A vs Variant B
        </button>
        <button
          onClick={() => setMode("ebom-mbom")}
          className={cn("px-2.5 py-1 text-xs rounded-sm font-mono transition-colors", mode === "ebom-mbom" ? "bg-surface-secondary text-foreground font-semibold" : "text-muted-foreground hover:text-foreground")}
        >
          EBOM vs MBOM
        </button>
      </div>

      {mode === "variants" ? (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={a} onValueChange={setA}>
              <SelectTrigger className="h-7 w-60 text-xs rounded-sm border-stroke-subtle bg-surface-primary font-mono"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-sm border-stroke-subtle bg-popover font-mono text-xs">
                {variants.map(v => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <AppIcon name="arrowRight" className="h-3.5 w-3.5 text-muted-foreground" />
            <Select value={b} onValueChange={setB}>
              <SelectTrigger className="h-7 w-60 text-xs rounded-sm border-stroke-subtle bg-surface-primary font-mono"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-sm border-stroke-subtle bg-popover font-mono text-xs">
                {variants.map(v => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-auto rounded-sm font-mono text-[9px] px-1.5 py-0 border-stroke-subtle">
              <AppIcon name="compare" className="h-2.5 w-2.5 mr-1" />{variantResult.onlyA.length + variantResult.onlyB.length} differences
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="rounded-sm border border-stroke-subtle bg-surface-primary p-3 shadow-none">
              <div className="text-[9px] text-primary font-mono font-semibold uppercase tracking-wider mb-1.5">Only in A — {variants.find(v => v.code === a)?.name}</div>
              <div className="text-xl font-mono font-bold text-foreground mb-2">{variantResult.onlyA.length}</div>
              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {variantResult.onlyA.map(pn => (
                  <button
                    key={pn}
                    type="button"
                    onClick={() => router.push(`/parts/${encodeURIComponent(pn)}`)}
                    className="w-full text-left text-xs p-1.5 rounded-sm border border-stroke-subtle bg-surface-secondary/30 hover:bg-surface-secondary/60 transition-colors block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">{pn}</span>
                    <div className="text-foreground font-medium truncate">{getPart(pn)?.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-stroke-subtle bg-surface-primary p-3 shadow-none">
              <div className="text-[9px] text-success font-mono font-semibold uppercase tracking-wider mb-1.5">In Both</div>
              <div className="text-xl font-mono font-bold text-foreground mb-2">{variantResult.both.length}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">Common carryover structure across both variants. These parts participate in shared manufacturing and service flows.</div>
            </div>

            <div className="rounded-sm border border-stroke-subtle bg-surface-primary p-3 shadow-none">
              <div className="text-[9px] text-accent font-mono font-semibold uppercase tracking-wider mb-1.5">Only in B — {variants.find(v => v.code === b)?.name}</div>
              <div className="text-xl font-mono font-bold text-foreground mb-2">{variantResult.onlyB.length}</div>
              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {variantResult.onlyB.map(pn => (
                  <button
                    key={pn}
                    type="button"
                    onClick={() => router.push(`/parts/${encodeURIComponent(pn)}`)}
                    className="w-full text-left text-xs p-1.5 rounded-sm border border-stroke-subtle bg-surface-secondary/30 hover:bg-surface-secondary/60 transition-colors block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">{pn}</span>
                    <div className="text-foreground font-medium truncate">{getPart(pn)?.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground font-mono leading-relaxed">
            Reconciliation between Engineering BOM (design intent) and Manufacturing BOM (routing of assemblies through plants). Any EBOM assembly without a routing is a mapping gap; any MBOM op without an EBOM assembly is a phantom that needs investigation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="rounded-sm border border-success/40 bg-surface-primary p-3 shadow-none">
              <div className="text-[9px] text-success font-mono font-semibold uppercase tracking-wider mb-1.5">Mapped both ways</div>
              <div className="text-xl font-mono font-bold text-foreground">{ebomVsMbom.matched.length}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">Assemblies with a live MBOM routing.</p>
            </div>
            <div className="rounded-sm border border-warning/40 bg-surface-primary p-3 shadow-none">
              <div className="text-[9px] text-warning font-mono font-semibold uppercase tracking-wider mb-1.5">EBOM only (no routing)</div>
              <div className="text-xl font-mono font-bold text-foreground">{ebomVsMbom.onlyEbom.length}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">Needs a manufacturing process decision.</p>
            </div>
            <div className="rounded-sm border border-critical/40 bg-surface-primary p-3 shadow-none">
              <div className="text-[9px] text-critical font-mono font-semibold uppercase tracking-wider mb-1.5">MBOM only (phantom)</div>
              <div className="text-xl font-mono font-bold text-foreground">{ebomVsMbom.onlyMbom.length}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-mono">Routing exists for a part not in EBOM — investigate.</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Unmapped EBOM Assemblies
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">
                {unmappedRows.length} {unmappedRows.length === 1 ? "assembly" : "assemblies"}
              </span>
            </div>
            <EnterpriseTable<UnmappedAssemblyRow>
              rows={unmappedRows}
              columns={columns}
              rowKey={(row) => row.partNumber}
              onRowClick={(row) => router.push(`/parts/${encodeURIComponent(row.partNumber)}`)}
              minWidth="min-w-[650px]"
              className="rounded-sm shadow-none"
              emptyMessage={
                <div className="text-center py-6">
                  <AppIcon name="compare" className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium text-foreground">No unmapped assemblies</p>
                  <p className="text-xs text-muted-foreground mt-0.5">All EBOM assemblies are routed in the MBOM</p>
                </div>
              }
            />
          </div>
        </>
      )}
    </PageHeader>
  );
}

