import { sankeyNodes, sankeyLinks } from "@/lib/mockData";
import { useMemo, useState } from "react";
import { InlineArrow } from "@/components/ui/primitives";

const groupColor: Record<string, string> = {
  cat:     "var(--analytics-series-6)",
  ebom:    "var(--analytics-series-1)",
  mbom:    "var(--analytics-series-3)",
  sbom:    "var(--analytics-series-2)",
  service: "var(--analytics-series-2)",
};
const groupOrder = ["cat", "ebom", "mbom", "service"] as const;

export const SankeyFlow = () => {
  const [hover, setHover] = useState<number | null>(null);

  const layout = useMemo(() => {
    const W = 820, H = 380, pad = 30, nodeW = 80;
    const colX = groupOrder.map((_, i) => pad + (W - pad * 2 - nodeW) * (i / (groupOrder.length - 1)));
    const groups: Record<string, number[]> = { cat: [], ebom: [], mbom: [], sbom: [], service: [] };
    sankeyNodes.forEach((n, i) => {
      if (!groups[n.group]) groups[n.group] = [];
      groups[n.group].push(i);
    });

    const positions: Record<number, { x: number; y: number; h: number }> = {};
    groupOrder.forEach((g, gi) => {
      const ids = groups[g];
      const totals = ids.map(id =>
        sankeyLinks.filter(l => l.source === id || l.target === id).reduce((a, b) => a + b.value, 0)
      );
      const sum = totals.reduce((a, b) => a + b, 0);
      let y = pad;
      const gap = 8;
      const usable = H - pad * 2 - gap * (ids.length - 1);
      ids.forEach((id, k) => {
        const h = Math.max(18, (totals[k] / sum) * usable);
        positions[id] = { x: colX[gi], y, h };
        y += h + gap;
      });
    });
    return { positions, W, H, nodeW };
  }, []);

  return (
    <div className="h-full rounded-lg border border-hairline bg-container p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="type-eyebrow text-quaternary">Cross-BOM Flow · Variants <InlineArrow /> EBOM <InlineArrow /> MBOM <InlineArrow /> Service</h3>
          <p className="type-body-sm mt-1 text-tertiary">Meridian SUV · variants flowing through engineering, plants and service</p>
        </div>
        <div className="type-caption flex items-center gap-3 text-tertiary">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-series-6" />Variants</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-series-1" />EBOM</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-series-3" />MBOM</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-series-2" />Service</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${layout.W} ${layout.H}`} className="w-full h-[360px]">
        <defs>
          <linearGradient id="flow-0" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--analytics-series-6)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--analytics-series-1)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="flow-1" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--analytics-series-1)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--analytics-series-3)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="flow-2" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--analytics-series-3)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--analytics-series-2)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        {sankeyLinks.map((l, i) => {
          const s = layout.positions[l.source];
          const t = layout.positions[l.target];
          if (!s || !t) return null;
          const sx = s.x + layout.nodeW, sy = s.y + s.h / 2;
          const tx = t.x, ty = t.y + t.h / 2;
          const cx = (sx + tx) / 2;
          const w = Math.max(2, l.value * 0.8);
          const sg = sankeyNodes[l.source].group;
          const grad = sg === "cat" ? "url(#flow-0)" : sg === "ebom" ? "url(#flow-1)" : "url(#flow-2)";
          const isHover = hover === i;
          return (
            <g key={i}>
              <path
                d={`M${sx},${sy} C${cx},${sy} ${cx},${ty} ${tx},${ty}`}
                stroke={grad}
                strokeWidth={w}
                fill="none"
                opacity={hover === null ? 0.7 : isHover ? 1 : 0.15}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ transition: "opacity .2s", cursor: "pointer" }}
              />
              {isHover && (
                <text x={cx} y={(sy + ty) / 2 - 6} textAnchor="middle" className="fill-foreground" fontSize="11" fontWeight="600">
                  {sankeyNodes[l.source].name} to {sankeyNodes[l.target].name}: {l.value}
                </text>
              )}
            </g>
          );
        })}
        {sankeyNodes.map((n, i) => {
          const p = layout.positions[i];
          if (!p) return null;
          return (
            <g key={i}>
              <rect x={p.x} y={p.y} width={layout.nodeW} height={p.h} rx={6} fill={groupColor[n.group]} opacity={0.9} />
              <text x={p.x + layout.nodeW / 2} y={p.y + p.h / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--feedback-badge-content)">
                {n.name.length > 12 ? n.name.slice(0, 12) + "…" : n.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
