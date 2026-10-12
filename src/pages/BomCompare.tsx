import { Panel } from "@/components/ui/primitives";
import { EntityIcon } from "@/components/icons/EntityIcon";
import { useMemo, useState } from "react";
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
import { GitCompare, ArrowRight, Download } from "lucide-react";

type Mode = "variants" | "ebom-mbom";

const flattenPNs = (n: EbomNode): Set<string> => {
  const out = new Set<string>();
  const walk = (x: EbomNode) => { out.add(x.partNumber); x.children?.forEach(walk); };
  walk(n);
  out.delete("MER-VEH-0001");
  return out;
};

const BomCompare = () => {
  const [mode, setMode] = useState<Mode>("variants");
  const [a, setA] = useState(variants[0].code);
  const [b, setB] = useState(variants[2].code);

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

  return (
    <PageHeader
      title="BOM Compare"
      subtitle="Side-by-side diff across variants, or between EBOM and MBOM"
      actions={<Button variant="outline" size="sm" className="gap-1.5"><Download aria-hidden className="h-3.5 w-3.5" />Export diff (CSV)</Button>}
    >
      {/* Mode toggle */}
      <div className="inline-flex gap-1.5">
        <button onClick={() => setMode("variants")} aria-pressed={mode === "variants"} className={cn("rounded-full border px-3 py-1 text-xs font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-active", mode === "variants" ? "border-transparent bg-action-primary text-on-color" : "border-hairline bg-action text-tertiary hover:border-strong hover:bg-raised-2 hover:text-secondary-foreground")}>Variant A vs Variant B</button>
        <button onClick={() => setMode("ebom-mbom")} aria-pressed={mode === "ebom-mbom"} className={cn("rounded-full border px-3 py-1 text-xs font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-active", mode === "ebom-mbom" ? "border-transparent bg-action-primary text-on-color" : "border-hairline bg-action text-tertiary hover:border-strong hover:bg-raised-2 hover:text-secondary-foreground")}><EntityIcon id="ebom" className="mr-1.5 inline size-3.5 align-[-2px] text-current" />EBOM vs MBOM</button>
      </div>

      {mode === "variants" ? (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={a} onValueChange={setA}>
              <SelectTrigger aria-label="Variant A" className="h-9 w-72 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {variants.map(v => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <ArrowRight aria-hidden className="h-4 w-4 text-muted-foreground" />
            <Select value={b} onValueChange={setB}>
              <SelectTrigger aria-label="Variant B" className="h-9 w-72 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {variants.map(v => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-auto"><GitCompare aria-hidden className="h-3 w-3 mr-1" />{variantResult.onlyA.length + variantResult.onlyB.length} differences</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-hairline bg-container p-4">
              <div className="type-eyebrow text-quaternary mb-2">Only in A — {variants.find(v => v.code === a)?.name}</div>
              <div className="type-display-xl tabular text-foreground mb-2">{variantResult.onlyA.length}</div>
              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {variantResult.onlyA.map(pn => (
                  <div key={pn} className="text-xs">
                    <span className="font-mono type-caption text-muted-foreground">{pn}</span>
                    <div>{getPart(pn)?.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-hairline bg-container p-4">
              <div className="type-eyebrow text-quaternary mb-2">In Both</div>
              <div className="type-display-xl tabular text-foreground mb-2">{variantResult.both.length}</div>
              <div className="text-xs text-muted-foreground">Common carryover structure across both variants. These parts participate in shared manufacturing and service flows.</div>
            </div>

            <div className="rounded-lg border border-hairline bg-container p-4">
              <div className="type-eyebrow text-quaternary mb-2">Only in B — {variants.find(v => v.code === b)?.name}</div>
              <div className="type-display-xl tabular text-foreground mb-2">{variantResult.onlyB.length}</div>
              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {variantResult.onlyB.map(pn => (
                  <div key={pn} className="text-xs">
                    <span className="font-mono type-caption text-muted-foreground">{pn}</span>
                    <div>{getPart(pn)?.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Reconciliation between Engineering BOM (design intent) and Manufacturing BOM (routing of assemblies through plants). Any EBOM assembly without a routing is a mapping gap; any MBOM op without an EBOM assembly is a phantom that needs investigation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-hairline bg-container p-4">
              <div className="type-eyebrow text-quaternary mb-2">Mapped both ways</div>
              <div className="type-display-xl tabular text-foreground">{ebomVsMbom.matched.length}</div>
              <p className="type-body-sm text-muted-foreground mt-1">Assemblies with a live MBOM routing.</p>
            </div>
            <div className="rounded-lg border border-hairline bg-warning-surface p-4">
              <div className="type-eyebrow text-warning mb-2">EBOM only (no routing)</div>
              <div className="type-display-xl tabular text-foreground">{ebomVsMbom.onlyEbom.length}</div>
              <p className="type-body-sm text-muted-foreground mt-1">Needs a manufacturing process decision.</p>
            </div>
            <div className="rounded-lg border border-hairline bg-error-surface p-4">
              <div className="type-eyebrow text-error mb-2">MBOM only (phantom)</div>
              <div className="type-display-xl tabular text-foreground">{ebomVsMbom.onlyMbom.length}</div>
              <p className="type-body-sm text-muted-foreground mt-1">Routing exists for a part not in EBOM — investigate.</p>
            </div>
          </div>

          {ebomVsMbom.onlyEbom.length > 0 && (
            <Panel title="Unmapped EBOM Assemblies">
              <div className="overflow-x-auto">
                <table className="tabular w-full text-xs">
                  <thead className="type-eyebrow text-quaternary border-b border-hairline bg-container">
                    <tr className="border-b border-hairline">
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Part Number</th>
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Name</th>
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Type</th>
                      <th scope="col" className="text-left px-3 py-2 font-medium whitespace-nowrap">Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ebomVsMbom.onlyEbom.map(pn => {
                      const p = getPart(pn);
                      return (
                        <tr key={pn} className="border-b border-hairline hover:bg-raised">
                          <td className="px-3 py-2 font-mono">{pn}</td>
                          <td className="px-3 py-2 font-semibold">{p?.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{p?.type}</td>
                          <td className="px-3 py-2 text-muted-foreground">{p?.supplierId}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </>
      )}
    </PageHeader>
  );
};

export default BomCompare;
