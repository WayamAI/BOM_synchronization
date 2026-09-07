"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  variants, bomEdges, getPart, totals, buildEbomTree, type EbomNode, parts,
} from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Layers, Plus, Check, X as XIcon, AlertTriangle } from "lucide-react";

const allOptionalPNs = Array.from(new Set(bomEdges.filter(e => e.effectivity && e.effectivity.length).map(e => e.childPN)));

const countEbom = (root: EbomNode): number => {
  const walk = (n: EbomNode): number => 1 + (n.children?.reduce((s, c) => s + walk(c), 0) ?? 0);
  return walk(root) - 1; // exclude vehicle root
};

export default function Variants() {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState(variants[0].code);

  const variant = variants.find(v => v.code === selectedVariant)!;
  const variantTree = useMemo(() => buildEbomTree("MER-VEH-0001", selectedVariant), [selectedVariant]);
  const variantPartsCount = useMemo(() => countEbom(variantTree), [variantTree]);

  // For each optional PN, show which variants include it (matrix)
  const effectivityMatrix = useMemo(() => {
    return allOptionalPNs.map(pn => {
      const edges = bomEdges.filter(e => e.childPN === pn);
      const cells = variants.map(v => {
        const included = edges.some(e => !e.effectivity || e.effectivity.includes(v.code));
        const excluded = v.excludesPNs?.includes(pn);
        return { variantCode: v.code, included: included && !excluded };
      });
      return { pn, part: getPart(pn), cells };
    });
  }, []);

  const totalUnitsPlanned = variants.reduce((s, v) => s + v.unitsPlanned, 0);

  return (
    <PageHeader
      title="Variants & Configuration (CAT BOM)"
      subtitle={`${totals.variants} variants across 3 powertrains × 3 trims × global markets`}
      actions={<Button size="sm" className="btn-primary-white gap-1.5 rounded-full h-7 text-xs font-medium"><Plus className="h-3 w-3" />New Variant</Button>}
    >
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="rounded-lg border border-border bg-surface-primary p-2.5">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Variants</div>
          <div className="mt-0.5 text-lg font-bold text-foreground">{totals.variants}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface-primary p-2.5">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Planned units (yr 1)</div>
          <div className="mt-0.5 text-lg font-bold text-foreground tabular-nums">{totalUnitsPlanned.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface-primary p-2.5">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Configuration rules</div>
          <div className="mt-0.5 text-lg font-bold text-foreground">{allOptionalPNs.length} <span className="text-xs font-normal text-muted-foreground">gated parts</span></div>
        </div>
        <div className="rounded-lg border border-border bg-surface-primary p-2.5">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Conflicts</div>
          <div className={cn("mt-0.5 text-lg  font-bold tabular-nums", variants.some(v => v.conflicts > 0) ? "text-warning" : "text-success")}>
            {variants.reduce((s, v) => s + v.conflicts, 0)}
          </div>
        </div>
      </div>

      {/* Variant table */}
      <div className="rounded-lg border border-border bg-surface-primary shadow-none overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[9px] uppercase tracking-wider text-muted-foreground bg-surface-secondary/40 border-b border-stroke-subtle">
            <tr>
              <th className="text-left py-2 px-3">SKU</th>
              <th className="text-left py-2 px-3">Variant Name</th>
              <th className="text-left py-2 px-3">Powertrain</th>
              <th className="text-left py-2 px-3">Trim</th>
              <th className="text-left py-2 px-3">Market</th>
              <th className="text-left py-2 px-3">SOP</th>
              <th className="text-right py-2 px-3">Planned / yr</th>
              <th className="text-left py-2 px-3">Conflicts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke-subtle">
            {variants.map(v => (
              <tr key={v.code}
                  onClick={() => setSelectedVariant(v.code)}
                  className={cn("cursor-pointer hover:bg-surface-secondary/50 transition-colors",
                    selectedVariant === v.code && "bg-primary/5")}>
                <td className="py-2 px-3 text-[11px] text-foreground">{v.code}</td>
                <td className="py-2 px-3 font-medium text-foreground">{v.name}</td>
                <td className="py-2 px-3"><Badge variant="outline" className="text-[9px] rounded-full border-stroke-subtle">{v.powertrain}</Badge></td>
                <td className="py-2 px-3"><Badge variant="outline" className="text-[9px] rounded-full border-stroke-subtle">{v.trim}</Badge></td>
                <td className="py-2 px-3 text-muted-foreground text-[11px]">{v.market}</td>
                <td className="py-2 px-3 text-[11px] text-muted-foreground">{v.startEffectivity}</td>
                <td className="py-2 px-3 text-right text-[11px] tabular-nums text-foreground">{v.unitsPlanned.toLocaleString()}</td>
                <td className="py-2 px-3">{v.conflicts > 0
                  ? <Badge className="bg-[#8a430f] text-white border-transparent text-[9px] px-2 py-0.5 rounded-full font-medium"><AlertTriangle className="h-2.5 w-2.5 mr-1 text-white" />{v.conflicts}</Badge>
                  : <Badge className="bg-[#275a3b] text-white border-transparent text-[9px] px-2 py-0.5 rounded-full font-medium"><Check className="h-2.5 w-2.5 mr-1 text-white" />Clean</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected variant detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="rounded-lg border border-border bg-surface-primary p-3.5 shadow-none lg:col-span-1">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{variant.name}</h3>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{variant.code}</p>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-stroke-subtle"><span className="text-muted-foreground">Powertrain</span><span className="font-semibold text-foreground">{variant.powertrain}</span></div>
            <div className="flex justify-between py-1 border-b border-stroke-subtle"><span className="text-muted-foreground">Trim</span><span className="font-semibold text-foreground">{variant.trim}</span></div>
            <div className="flex justify-between py-1 border-b border-stroke-subtle"><span className="text-muted-foreground">Market</span><span className="font-semibold text-foreground">{variant.market}</span></div>
            <div className="flex justify-between py-1 border-b border-stroke-subtle"><span className="text-muted-foreground">Start effectivity</span><span className="font-semibold text-foreground">{variant.startEffectivity}</span></div>
            <div className="flex justify-between py-1 border-b border-stroke-subtle"><span className="text-muted-foreground">Planned volume</span><span className="font-semibold text-foreground tabular-nums">{variant.unitsPlanned.toLocaleString()}</span></div>
            <div className="flex justify-between py-1"><span className="text-muted-foreground">EBOM parts in variant</span><span className="font-semibold text-foreground">{variantPartsCount}</span></div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs rounded-full border-stroke-subtle bg-surface-primary hover:bg-surface-secondary text-foreground" onClick={() => router.push("/ebom")}>
            Open EBOM filtered to this variant →
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-surface-primary p-3.5 shadow-none lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Effectivity Matrix</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Which variants include each optional / powertrain-gated part</p>
          <div className="mt-2.5 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stroke-subtle text-[9px] uppercase tracking-wider text-muted-foreground bg-surface-secondary/30">
                  <th className="text-left py-1.5 px-2 sticky left-0 bg-surface-primary z-10 border-r border-stroke-subtle">Part</th>
                  {variants.map(v => (
                    <th key={v.code} className="text-center py-1.5 px-2 whitespace-nowrap">
                      {v.code.split("-").slice(1).join("-")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke-subtle">
                {effectivityMatrix.map(row => (
                  <tr key={row.pn} className="hover:bg-surface-secondary/40 transition-colors">
                    <td className="py-1.5 px-2 sticky left-0 bg-surface-primary z-10 border-r border-stroke-subtle">
                      <div className="font-semibold text-xs text-foreground">{row.part?.name}</div>
                      <div className="text-[9px] text-muted-foreground">{row.pn}</div>
                    </td>
                    {row.cells.map(c => (
                      <td key={c.variantCode} className={cn("text-center py-1.5 px-2", c.variantCode === selectedVariant && "bg-primary/5")}>
                        {c.included
                          ? <Check className="inline h-3 w-3 text-success" />
                          : <XIcon className="inline h-3 w-3 text-muted-foreground/30" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageHeader>
  );
}

// unused import guard — silence type warning if effectivity recalculation drops `parts`
void parts;

