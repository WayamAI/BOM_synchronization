/**
 * EbomGraphView — Progressive disclosure BOM dependency graph.
 *
 * UX model:
 *   • Starts showing only the root node (Vehicle level).
 *   • Clicking any node with children expands it one level.
 *   • Clicking an already-expanded node collapses it (and all descendants).
 *   • Selecting a node highlights it + descendants; opens the side-panel via onSelect.
 *   • Dagre TB layout re-runs whenever the visible set changes.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  Position,
  Handle,
  Panel,
} from '@xyflow/react';
import dagre from 'dagre';
import { EbomNode } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  Search, ZoomIn, ZoomOut, Maximize2, RotateCcw,
  ChevronRight, ChevronDown, X, GitBranch, AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import '@xyflow/react/dist/style.css';

// ─── Dimensions ───────────────────────────────────────────────────────────────
const NODE_W = 280;
const NODE_H = 100;

// ─── Type colours per BOM type ────────────────────────────────────────────────
const TYPE_CFG: Record<string, { ring: string; bg: string; badge: string; dot: string }> = {
  Vehicle:       { ring: 'border-violet-400', bg: 'from-violet-500/10 to-purple-500/5',   badge: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500' },
  System:        { ring: 'border-blue-400',   bg: 'from-blue-500/10 to-indigo-500/5',     badge: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  Assembly:      { ring: 'border-cyan-400',   bg: 'from-cyan-500/10 to-sky-500/5',        badge: 'bg-cyan-100 text-cyan-700',      dot: 'bg-cyan-500' },
  'Sub-Assembly':{ ring: 'border-teal-400',   bg: 'from-teal-500/10 to-emerald-500/5',    badge: 'bg-teal-100 text-teal-700',      dot: 'bg-teal-500' },
  ECU:           { ring: 'border-amber-400',  bg: 'from-amber-500/10 to-orange-500/5',    badge: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  Harness:       { ring: 'border-lime-400',   bg: 'from-lime-500/10 to-green-500/5',      badge: 'bg-lime-100 text-lime-700',      dot: 'bg-lime-500' },
  Part:          { ring: 'border-slate-300',  bg: 'from-slate-500/5 to-gray-500/3',       badge: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400' },
  Fastener:      { ring: 'border-stone-300',  bg: 'from-stone-500/5 to-neutral-500/3',    badge: 'bg-stone-100 text-stone-600',    dot: 'bg-stone-400' },
  Consumable:    { ring: 'border-orange-300', bg: 'from-orange-500/8 to-yellow-500/5',    badge: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-400' },
  Software:      { ring: 'border-pink-400',   bg: 'from-pink-500/10 to-rose-500/5',       badge: 'bg-pink-100 text-pink-700',      dot: 'bg-pink-500' },
};
const tc = (type: string) => TYPE_CFG[type] ?? TYPE_CFG['Part'];

const healthDot = (h?: string) =>
  h === 'critical' ? 'bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.5)] animate-pulse' :
  h === 'warning'  ? 'bg-amber-400' : 'bg-emerald-500';

// ─── Dagre auto-layout ────────────────────────────────────────────────────────
function layoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 30, ranksep: 100, marginx: 40, marginy: 40 });
  nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map(n => {
    const p = g.node(n.id);
    return { ...n, position: { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 }, targetPosition: Position.Left, sourcePosition: Position.Right };
  });
}

// ─── Build flat lookup from tree ──────────────────────────────────────────────
function buildLookup(root: EbomNode): Map<string, EbomNode> {
  const map = new Map<string, EbomNode>();
  const walk = (n: EbomNode) => { map.set(n.id, n); n.children?.forEach(walk); };
  walk(root);
  return map;
}

// ─── Custom Node ──────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BomNode = ({ data }: { data: any }) => {
  const {
    ebomNode: node,
    isSelected, isHighlighted, isDimmed,
    isExpanded, hasChildren, visibleChildCount, totalChildCount,
    onNodeClick,
  } = data as {
    ebomNode: EbomNode;
    isSelected: boolean; isHighlighted: boolean; isDimmed: boolean;
    isExpanded: boolean; hasChildren: boolean;
    visibleChildCount: number; totalChildCount: number;
    onNodeClick: (node: EbomNode) => void;
  };

  const cfg = tc(node.type);

  return (
    <div
      onClick={() => onNodeClick(node)}
      className={cn(
        'relative rounded-xl border-2 bg-white cursor-pointer select-none',
        `bg-gradient-to-br ${cfg.bg}`,
        cfg.ring,
        isSelected  && 'ring-2 ring-primary ring-offset-2 border-primary/60 shadow-[0_0_16px_2px_hsl(239_84%_60%/0.3)]',
        isHighlighted && !isSelected && 'border-primary/40 shadow-md',
        isDimmed    && 'opacity-25 grayscale pointer-events-none',
        'transition-all duration-200 hover:shadow-lg hover:scale-[1.02]',
      )}
      style={{ width: NODE_W, minHeight: NODE_H }}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0 !w-2 !h-2" />

      {/* Type bar + health dot */}
      <div className="px-4 pt-3 flex items-center gap-2">
        <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', healthDot(node.health))} />
        <span className={cn('text-[11px] font-bold uppercase tracking-widest', cfg.badge.replace('bg-', 'text-').replace(/text-\w+-\d+/, m => m))}>
          <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', cfg.badge)}>
            {node.type}
          </span>
        </span>
        {!!node.cves && (
          <span className="ml-auto text-[10px] bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5 font-bold">{node.cves} CVE</span>
        )}
        {!!node.warnings && !node.cves && (
          <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 font-bold">{node.warnings}⚠</span>
        )}
      </div>

      {/* Name + PN */}
      <div className="px-4 pt-1.5 pb-2">
        <div className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-1">{node.name}</div>
        <div className="text-[11px] font-mono text-gray-500 mt-0.5">{node.partNumber}</div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {node.revision && (
            <span className="text-[10px] font-mono bg-gray-100 text-gray-500 rounded px-1.5 border border-gray-200">{node.revision}</span>
          )}
          {node.status && (
            <span className={cn(
              'text-[10px] px-1.5 rounded border font-medium',
              node.status === 'Released'  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              node.status === 'In Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              node.status === 'Obsolete'  ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
            )}>{node.status}</span>
          )}
        </div>

        {/* Expand / collapse badge */}
        {hasChildren && (
          <div className={cn(
            'flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border',
            isExpanded
              ? 'bg-primary/10 text-primary border-primary/30'
              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-primary/10 hover:text-primary hover:border-primary/30',
            'transition-colors',
          )}>
            {isExpanded
              ? <><ChevronDown className="h-3 w-3" />{visibleChildCount}</>
              : <><ChevronRight className="h-3 w-3" />{totalChildCount}</>
            }
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!opacity-0 !w-2 !h-2" />
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, React.ComponentType<any>> = { bomNode: BomNode };

// ─── Helper: get all descendant IDs ──────────────────────────────────────────
function getDescendantIds(node: EbomNode): Set<string> {
  const ids = new Set<string>();
  const walk = (n: EbomNode) => { n.children?.forEach(c => { ids.add(c.id); walk(c); }); };
  walk(node);
  return ids;
}

// ─── Inner graph (needs ReactFlow context) ────────────────────────────────────
interface GraphViewProps {
  tree: EbomNode;
  selected: EbomNode | null;
  onSelect: (node: EbomNode | null) => void;
  filter: string;
}

const InnerGraph = ({ tree, selected, onSelect, filter: extFilter }: GraphViewProps) => {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Set of node IDs whose children are currently visible (expanded)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set([tree.id]));
  const [search, setSearch] = useState('');

  // Rebuild when tree changes
  useEffect(() => { setExpandedIds(new Set([tree.id])); }, [tree.id]);

  const lookup = useMemo(() => buildLookup(tree), [tree]);

  const effectiveFilter = search || extFilter;

  // ── Compute visible node set based on expansion ──────────────────────────
  const { visibleIds, parentMap } = useMemo(() => {
    const visible = new Set<string>();
    const parent = new Map<string, string>(); // childId → parentId

    const walk = (node: EbomNode, parentId?: string) => {
      visible.add(node.id);
      if (parentId) parent.set(node.id, parentId);
      if (expandedIds.has(node.id)) {
        node.children?.forEach(c => walk(c, node.id));
      }
    };
    walk(tree);
    return { visibleIds: visible, parentMap: parent };
  }, [tree, expandedIds]);

  // ── Highlighted IDs when something is selected ───────────────────────────
  const highlightedIds = useMemo(() => {
    if (!selected) return new Set<string>();
    const ids = new Set<string>([selected.id]);
    // also highlight ancestors up to root
    let cur = parentMap.get(selected.id);
    while (cur) { ids.add(cur); cur = parentMap.get(cur); }
    // and direct children
    selected.children?.forEach(c => ids.add(c.id));
    return ids;
  }, [selected, parentMap]);

  // ── Build RF nodes & edges ────────────────────────────────────────────────
  const { rfNodes, rfEdges } = useMemo(() => {
    const hasSelection = !!selected;

    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    visibleIds.forEach(id => {
      const node = lookup.get(id);
      if (!node) return;

      // filter check
      if (effectiveFilter) {
        const q = effectiveFilter.toLowerCase();
        const matches = node.name.toLowerCase().includes(q) || node.partNumber.toLowerCase().includes(q);
        const anyVisibleChildMatches = node.children?.some(c => {
          const cq = c.name.toLowerCase().includes(q) || c.partNumber.toLowerCase().includes(q);
          return cq;
        });
        if (!matches && !anyVisibleChildMatches) return;
      }

      const isSelected   = selected?.id === id;
      const isHighlighted = highlightedIds.has(id);
      const isDimmed      = hasSelection && !isHighlighted;
      const isExpanded    = expandedIds.has(id);
      const hasChildren   = (node.children?.length ?? 0) > 0;
      const visibleChildCount = node.children?.filter(c => visibleIds.has(c.id)).length ?? 0;
      const totalChildCount   = node.children?.length ?? 0;

      rawNodes.push({
        id,
        type: 'bomNode',
        position: { x: 0, y: 0 },
        data: { ebomNode: node, isSelected, isHighlighted, isDimmed, isExpanded, hasChildren, visibleChildCount, totalChildCount },
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
      });

      // edge from parent
      const pid = parentMap.get(id);
      if (pid && visibleIds.has(pid)) {
        const edgeHighlighted = isHighlighted && hasSelection;
        rawEdges.push({
          id: `e-${pid}-${id}`,
          source: pid,
          target: id,
          type: 'smoothstep',
          animated: edgeHighlighted,
          style: {
            stroke: edgeHighlighted ? 'hsl(239 84% 60%)' : isDimmed ? 'hsl(220 13% 88%)' : 'hsl(220 13% 78%)',
            strokeWidth: edgeHighlighted ? 2.5 : isDimmed ? 0.8 : 1.5,
            opacity: isDimmed ? 0.25 : 1,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeHighlighted ? 'hsl(239 84% 60%)' : 'hsl(220 13% 72%)',
            width: 14, height: 14,
          },
        });
      }
    });

    const laid = layoutNodes(rawNodes, rawEdges);
    return { rfNodes: laid, rfEdges: rawEdges };
  }, [visibleIds, parentMap, lookup, selected, highlightedIds, expandedIds, effectiveFilter]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Sync layout whenever it changes
  useEffect(() => { setNodes(rfNodes); setEdges(rfEdges); }, [rfNodes, rfEdges, setNodes, setEdges]);

  // Fit after layout changes
  useEffect(() => {
    const t = setTimeout(() => fitView({ duration: 350, padding: 0.2, maxZoom: 1.2 }), 80);
    return () => clearTimeout(t);
  }, [rfNodes.length, fitView]);

  // ── Node click: toggle expansion + select ────────────────────────────────
  const handleNodeClick = useCallback((ebomNode: EbomNode) => {
    // Select for side panel
    onSelect(ebomNode);

    // Toggle expansion if it has children
    if ((ebomNode.children?.length ?? 0) === 0) return;

    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(ebomNode.id)) {
        // Collapse: remove this node and ALL its descendants from expanded
        const descendants = getDescendantIds(ebomNode);
        descendants.forEach(id => next.delete(id));
        next.delete(ebomNode.id);
      } else {
        next.add(ebomNode.id);
      }
      return next;
    });
  }, [onSelect]);

  // Inject callback into nodes
  const nodesWithCb = useMemo(
    () => nodes.map(n => ({ ...n, data: { ...n.data, onNodeClick: handleNodeClick } })),
    [nodes, handleNodeClick],
  );

  // Reset: collapse back to root only
  const handleReset = useCallback(() => {
    setExpandedIds(new Set([tree.id]));
    onSelect(null);
    setTimeout(() => fitView({ duration: 350, padding: 0.2, maxZoom: 1.2 }), 80);
  }, [tree.id, onSelect, fitView]);

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border bg-card shadow-card">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/95 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-44 max-w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nodes…"
            className="h-7 pl-8 pr-7 text-xs bg-muted/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => zoomIn({ duration: 200 })} title="Zoom in">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => zoomOut({ duration: 200 })} title="Zoom out">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => fitView({ duration: 300, padding: 0.2, maxZoom: 1.2 })} title="Fit to screen">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={handleReset} title="Reset — collapse all">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Instruction hint */}
        <span className="text-[10px] text-muted-foreground hidden md:block">
          Click a node to expand its children · Click again to collapse
        </span>

        {/* Clear selection */}
        {selected && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-primary ml-auto" onClick={() => onSelect(null)}>
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border bg-muted/20 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Types:</span>
        {(['Vehicle','System','Assembly','ECU','Part','Harness'] as const).map(t => (
          <span key={t} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className={cn('h-2 w-2 rounded-full', tc(t).dot)} />{t}
          </span>
        ))}
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-2">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />Critical
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-amber-400" />Warning
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground font-medium">
          {nodes.length} visible · {lookup.size > 0 ? lookup.size : '?'} total
        </span>
      </div>

      {/* ── Canvas ── */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodesWithCb}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
          minZoom={0.1}
          maxZoom={3}
          proOptions={{ hideAttribution: true }}
          onPaneClick={() => onSelect(null)}
          nodesConnectable={false}
          nodesDraggable
          panOnDrag
          zoomOnScroll
          zoomOnPinch
          defaultEdgeOptions={{ type: 'smoothstep' }}
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="hsl(220 13% 88%)" />
          <Controls position="bottom-right" showZoom={false} showFitView={false}
            className="!border-border !bg-card !shadow-card !rounded-lg !overflow-hidden" />

          {/* Status bar */}
          <Panel position="bottom-left">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-card/90 border border-border shadow-card text-[10px] backdrop-blur">
              {selected ? (
                <>
                  <GitBranch className="h-3 w-3 text-primary" />
                  <span className="font-semibold text-primary">{selected.name}</span>
                  <span className="text-border">·</span>
                  <span className="text-muted-foreground">{selected.type}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Click a node to explore its dependencies</span>
              )}
            </div>
          </Panel>

          {/* Empty filter state */}
          {nodes.length === 0 && (
            <Panel position="top-center">
              <div className="flex flex-col items-center gap-2 mt-20 p-5 rounded-xl bg-card border border-border shadow-card">
                <AlertTriangle className="h-7 w-7 text-warning" />
                <p className="text-sm font-semibold">No matching nodes</p>
                <Button variant="outline" size="sm" onClick={() => setSearch('')}>Clear search</Button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
};

// ─── Public export ────────────────────────────────────────────────────────────
interface GraphViewProps {
  tree: EbomNode;
  selected: EbomNode | null;
  onSelect: (node: EbomNode | null) => void;
  filter: string;
}

const GraphView: React.FC<GraphViewProps> = (props) => (
  <ReactFlowProvider>
    <InnerGraph {...props} />
  </ReactFlowProvider>
);

export default GraphView;