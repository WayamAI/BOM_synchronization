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
      actions={<Button variant="outline" size="sm" className="gap-1.5"><Download className="h-3.5 w-3.5" />Export diff (CSV)</Button>}
    >
      {/* Mode toggle */}
      <div className="inline-flex rounded-md border border-border bg-card p-0.5">
        <button onClick={() => setMode("variants")} className={cn("px-3 py-1 text-xs rounded transition-colors", mode === "variants" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground")}>Variant A vs Variant B</button>
        <button onClick={() => setMode("ebom-mbom")} className={cn("px-3 py-1 text-xs rounded transition-colors", mode === "ebom-mbom" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground")}>EBOM vs MBOM</button>
      </div>

      {mode === "variants" ? (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={a} onValueChange={setA}>
              <SelectTrigger className="h-9 w-72 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {variants.map(v => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Select value={b} onValueChange={setB}>
              <SelectTrigger className="h-9 w-72 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {variants.map(v => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-auto"><GitCompare className="h-3 w-3 mr-1" />{variantResult.onlyA.length + variantResult.onlyB.length} differences</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 shadow-card">
              <div className="text-[11px] text-primary font-semibold uppercase tracking-wider mb-2">Only in A — {variants.find(v => v.code === a)?.name}</div>
              <div className="text-2xl font-bold mb-2">{variantResult.onlyA.length}</div>
              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {variantResult.onlyA.map(pn => (
                  <div key={pn} className="text-xs">
                    <span className="font-mono text-[10px] text-muted-foreground">{pn}</span>
                    <div>{getPart(pn)?.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="text-[11px] text-success font-semibold uppercase tracking-wider mb-2">In Both</div>
              <div className="text-2xl font-bold mb-2">{variantResult.both.length}</div>
              <div className="text-xs text-muted-foreground">Common carryover structure across both variants. These parts participate in shared manufacturing and service flows.</div>
            </div>

            <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 shadow-card">
              <div className="text-[11px] text-accent font-semibold uppercase tracking-wider mb-2">Only in B — {variants.find(v => v.code === b)?.name}</div>
              <div className="text-2xl font-bold mb-2">{variantResult.onlyB.length}</div>
              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {variantResult.onlyB.map(pn => (
                  <div key={pn} className="text-xs">
                    <span className="font-mono text-[10px] text-muted-foreground">{pn}</span>
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
            <div className="rounded-xl border border-success/30 bg-success/5 p-4 shadow-card">
              <div className="text-[11px] text-success font-semibold uppercase tracking-wider mb-2">Mapped both ways</div>
              <div className="text-2xl font-bold">{ebomVsMbom.matched.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Assemblies with a live MBOM routing.</p>
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 shadow-card">
              <div className="text-[11px] text-warning font-semibold uppercase tracking-wider mb-2">EBOM only (no routing)</div>
              <div className="text-2xl font-bold">{ebomVsMbom.onlyEbom.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Needs a manufacturing process decision.</p>
            </div>
            <div className="rounded-xl border border-critical/30 bg-critical/5 p-4 shadow-card">
              <div className="text-[11px] text-critical font-semibold uppercase tracking-wider mb-2">MBOM only (phantom)</div>
              <div className="text-2xl font-bold">{ebomVsMbom.onlyMbom.length}</div>
              <p className="text-[11px] text-muted-foreground mt-1">Routing exists for a part not in EBOM — investigate.</p>
            </div>
          </div>

          {ebomVsMbom.onlyEbom.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <h3 className="text-sm font-semibold mb-2">Unmapped EBOM Assemblies</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Part Number</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ebomVsMbom.onlyEbom.map(pn => {
                      const p = getPart(pn);
                      return (
                        <tr key={pn} className="border-b border-border/30 hover:bg-muted/30">
                          <td className="p-2 font-mono">{pn}</td>
                          <td className="p-2 font-semibold">{p?.name}</td>
                          <td className="p-2 text-muted-foreground">{p?.type}</td>
                          <td className="p-2 text-muted-foreground">{p?.supplierId}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </PageHeader>
  );
};

export default BomCompare;
