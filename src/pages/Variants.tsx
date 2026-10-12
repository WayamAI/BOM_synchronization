import { Panel, KpiTile, QuietStatus } from "@/components/ui/primitives";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const Variants = () => {
  const navigate = useNavigate();
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
      actions={<Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />New variant</Button>}
    >
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile label="Variants" value={<>{totals.variants}</>} />
        <KpiTile label="Planned units (yr 1)" value={<>{totalUnitsPlanned.toLocaleString("en-US")}</>} />
        <KpiTile label="Configuration rules" value={<>{allOptionalPNs.length}</>} hint="effectivity-gated parts" />
        <KpiTile
          label="Conflicts"
          value={<>{variants.reduce((s, v) => s + v.conflicts, 0)}</>}
          valueClassName={variants.some(v => v.conflicts > 0) ? "text-warning" : "text-success"}
        />
      </div>

      {/* Variant table */}
      <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
        <table className="tabular w-full text-xs">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">SKU</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Variant Name</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Powertrain</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Trim</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Market</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">SOP</th>
              <th className="text-right px-3 py-2 font-medium whitespace-nowrap">Planned / yr</th>
              <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Conflicts</th>
            </tr>
          </thead>
          <tbody>
            {variants.map(v => (
              <tr key={v.code}
                  onClick={() => setSelectedVariant(v.code)}
                  className={cn("border-t border-hairline cursor-pointer hover:bg-raised",
                    selectedVariant === v.code && "bg-raised")}>
                <td className="px-3 py-2 font-mono">{v.code}</td>
                <td className="px-3 py-2 font-semibold">{v.name}</td>
                <td className="px-3 py-2 text-tertiary">{v.powertrain}</td>
                <td className="px-3 py-2 text-tertiary">{v.trim}</td>
                <td className="px-3 py-2 text-muted-foreground">{v.market}</td>
                <td className="px-3 py-2 font-mono">{v.startEffectivity}</td>
                <td className="px-3 py-2 text-right tabular-nums">{v.unitsPlanned.toLocaleString("en-US")}</td>
                <td className="px-3 py-2">{v.conflicts > 0
                  ? <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />{v.conflicts}</Badge>
                  : <QuietStatus tone="success">Clean</QuietStatus>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected variant detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border border-hairline bg-container p-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">{variant.name}</h3>
          </div>
          <p className="type-body-sm text-muted-foreground font-mono mt-0.5">{variant.code}</p>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Powertrain</span><span className="font-semibold">{variant.powertrain}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Trim</span><span className="font-semibold">{variant.trim}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Market</span><span className="font-semibold">{variant.market}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Start effectivity</span><span className="font-semibold">{variant.startEffectivity}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Planned volume</span><span className="font-semibold">{variant.unitsPlanned.toLocaleString("en-US")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">EBOM parts in variant</span><span className="font-semibold">{variantPartsCount}</span></div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate(`/ebom`)}>
            Open EBOM filtered to this variant
          </Button>
        </div>

        <Panel title="Effectivity Matrix" className="lg:col-span-2">
          <p className="type-body-sm text-muted-foreground">Which variants include each optional / powertrain-gated part</p>
          <div className="mt-3 overflow-x-auto">
            <table className="tabular w-full text-xs">
              <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
                <tr className="border-b border-hairline">
                  <th className="text-left px-3 py-2 sticky left-0 bg-container font-medium whitespace-nowrap">Part</th>
                  {variants.map(v => (
                    <th key={v.code} className="text-center px-3 py-2 font-mono font-medium whitespace-nowrap">
                      {v.code.split("-").slice(1).join("-")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {effectivityMatrix.map(row => (
                  <tr key={row.pn} className="border-b border-hairline hover:bg-raised">
                    <td className="px-3 py-2 sticky left-0 bg-container">
                      <div className="font-semibold text-xs">{row.part?.name}</div>
                      <div className="font-mono type-caption text-muted-foreground">{row.pn}</div>
                    </td>
                    {row.cells.map(c => (
                      <td key={c.variantCode} className={cn("text-center px-3 py-2", c.variantCode === selectedVariant && "bg-raised")}>
                        {c.included
                          ? <Check className="inline h-3.5 w-3.5 text-success" />
                          : <XIcon className="inline h-3.5 w-3.5 text-muted-foreground opacity-40" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </PageHeader>
  );
};

// unused import guard — silence type warning if effectivity recalculation drops `parts`
void parts;

export default Variants;
