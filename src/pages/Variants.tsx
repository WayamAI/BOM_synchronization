import { plural } from "@/lib/format";
import { EntityGlyph } from "@/components/icons/EntityIcon";
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
import { Plus, Check, X as XIcon, AlertTriangle } from "lucide-react";

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
      title="Variants & Configuration"
      mark="variant"
      subtitle={`CAT BOM · ${plural(totals.variants, "variant")} across 3 powertrains × 3 trims × global markets`}
      actions={<Button size="sm" className="gap-1.5"><Plus aria-hidden className="size-3.5" />New variant</Button>}
    >
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile label="Variants" icon="variant" value={<>{totals.variants}</>} />
        <KpiTile label="Planned units (yr 1)" icon="volume" value={<>{totalUnitsPlanned.toLocaleString("en-US")}</>} />
        <KpiTile label="Configuration rules" icon="config-rule" value={<>{allOptionalPNs.length}</>} hint="effectivity-gated parts" />
        <KpiTile
          label="Conflicts"
          icon="validation"
          value={<>{variants.reduce((s, v) => s + v.conflicts, 0)}</>}
          valueClassName={variants.some(v => v.conflicts > 0) ? "text-warning" : "text-success"}
        />
      </div>

      {/* Variant table */}
      <div className="rounded-lg border border-hairline bg-container overflow-x-auto">
        <table className="tabular w-full type-body-sm">
          <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
            <tr>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">SKU</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Variant name</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Powertrain</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Trim</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Market</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">SOP</th>
              <th scope="col" className="text-right px-3 py-2 font-medium whitespace-nowrap">Planned / yr</th>
              <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Conflicts</th>
            </tr>
          </thead>
          <tbody>
            {variants.map(v => (
              <tr key={v.code}
                  onClick={() => setSelectedVariant(v.code)}
                  className={cn("border-t border-hairline cursor-pointer hover:bg-raised",
                    selectedVariant === v.code && "bg-raised")}>
                <td className="px-3 py-2 font-mono"><span className="inline-flex items-center gap-2"><EntityGlyph id="variant" size={20} />{v.code}</span></td>
                <td className="px-3 py-2 font-semibold">{v.name}</td>
                <td className="px-3 py-2 text-tertiary">{v.powertrain}</td>
                <td className="px-3 py-2 text-tertiary">{v.trim}</td>
                <td className="px-3 py-2 text-tertiary">{v.market}</td>
                <td className="px-3 py-2 font-mono">{v.startEffectivity}</td>
                <td className="px-3 py-2 text-right tabular-nums">{v.unitsPlanned.toLocaleString("en-US")}</td>
                <td className="px-3 py-2">{v.conflicts > 0
                  ? <Badge variant="warning"><AlertTriangle aria-hidden className="size-3.5 mr-1" />{v.conflicts}</Badge>
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
            <EntityGlyph id="variant" size={20} />
            <h3 className="type-body-md font-semibold">{variant.name}</h3>
          </div>
          <p className="type-body-sm text-tertiary font-mono mt-0.5">{variant.code}</p>
          <div className="mt-4 space-y-2 type-body-sm">
            <div className="flex justify-between"><span className="text-tertiary">Powertrain</span><span className="font-semibold">{variant.powertrain}</span></div>
            <div className="flex justify-between"><span className="text-tertiary">Trim</span><span className="font-semibold">{variant.trim}</span></div>
            <div className="flex justify-between"><span className="text-tertiary">Market</span><span className="font-semibold">{variant.market}</span></div>
            <div className="flex justify-between"><span className="text-tertiary">Start effectivity</span><span className="font-semibold">{variant.startEffectivity}</span></div>
            <div className="flex justify-between"><span className="text-tertiary">Planned volume</span><span className="font-semibold">{variant.unitsPlanned.toLocaleString("en-US")}</span></div>
            <div className="flex justify-between"><span className="text-tertiary">EBOM parts in variant</span><span className="font-semibold">{variantPartsCount}</span></div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate(`/ebom`)}>
            Open EBOM filtered to this variant
          </Button>
        </div>

        <Panel title="Effectivity Matrix" icon="variant" className="lg:col-span-2">
          <p className="type-body-sm text-tertiary">Which variants include each optional / powertrain-gated part</p>
          <div className="mt-3 overflow-x-auto">
            <table className="tabular w-full type-body-sm">
              <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
                <tr className="border-b border-hairline">
                  <th scope="col" className="text-left px-3 py-2 sticky left-0 bg-container font-medium whitespace-nowrap">Part</th>
                  {variants.map(v => (
                    <th scope="col" key={v.code} className="text-center px-3 py-2 font-mono font-medium whitespace-nowrap">
                      {v.code.split("-").slice(1).join("-")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {effectivityMatrix.map(row => (
                  <tr key={row.pn} className="border-b border-hairline hover:bg-raised">
                    <td className="px-3 py-2 sticky left-0 bg-container">
                      <div className="font-semibold type-body-sm">{row.part?.name}</div>
                      <div className="font-mono type-caption text-tertiary">{row.pn}</div>
                    </td>
                    {row.cells.map(c => (
                      <td key={c.variantCode} className={cn("text-center px-3 py-2", c.variantCode === selectedVariant && "bg-raised")}>
                        {c.included
                          ? <Check aria-hidden className="inline size-3.5 text-success" />
                          : <XIcon aria-hidden className="inline size-3.5 text-tertiary opacity-40" />}
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
