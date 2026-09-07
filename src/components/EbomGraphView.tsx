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
  Vehicle:       { ring: 'border-violet-500/40', bg: 'bg-card',   badge: 'bg-violet-950/40 text-violet-300 border-violet-700/30',  dot: 'bg-violet-400' },
  System:        { ring: 'border-blue-500/40',   bg: 'bg-card',   badge: 'bg-blue-950/40 text-blue-300 border-blue-700/30',      dot: 'bg-blue-400' },
  Assembly:      { ring: 'border-cyan-500/40',   bg: 'bg-card',   badge: 'bg-cyan-950/40 text-cyan-300 border-cyan-700/30',      dot: 'bg-cyan-400' },
  'Sub-Assembly':{ ring: 'border-teal-500/40',   bg: 'bg-card',   badge: 'bg-teal-950/40 text-teal-300 border-teal-700/30',      dot: 'bg-teal-400' },
  ECU:           { ring: 'border-amber-500/40',  bg: 'bg-card',   badge: 'bg-amber-950/40 text-amber-300 border-amber-700/30',    dot: 'bg-amber-400' },
  Harness:       { ring: 'border-lime-500/40',   bg: 'bg-card',   badge: 'bg-lime-950/40 text-lime-300 border-lime-700/30',      dot: 'bg-lime-400' },
  Part:          { ring: 'border-border',        bg: 'bg-card',   badge: 'bg-muted/40 text-muted-foreground border-border',    dot: 'bg-muted-foreground' },
  Fastener:      { ring: 'border-border',        bg: 'bg-card',   badge: 'bg-muted/40 text-muted-foreground border-border',    dot: 'bg-muted-foreground' },
  Consumable:    { ring: 'border-orange-500/40', bg: 'bg-card',   badge: 'bg-orange-950/40 text-orange-300 border-orange-700/30',  dot: 'bg-orange-400' },
  Software:      { ring: 'border-pink-500/40',   bg: 'bg-card',   badge: 'bg-pink-950/40 text-pink-300 border-pink-700/30',      dot: 'bg-pink-400' },
};
const tc = (type: string) => TYPE_CFG[type] ?? TYPE_CFG['Part'];

const healthDot = (h?: string) =>
  h === 'critical' ? 'bg-critical' :
  h === 'warning'  ? 'bg-warning' : 'bg-success';

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
        'relative rounded-sm border bg-card cursor-pointer select-none',
        cfg.ring,
        isSelected  && 'ring-1 ring-primary border-primary bg-primary/5',
        isHighlighted && !isSelected && 'border-primary/40',
        isDimmed    && 'opacity-25 grayscale pointer-events-none',
        'transition-colors hover:border-primary/50',
      )}
      style={{ width: NODE_W, minHeight: NODE_H }}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0 !w-2 !h-2" />

      {/* Type bar + health dot */}
      <div className="px-3 pt-2.5 flex items-center gap-1.5">
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', healthDot(node.health))} />
        <span className={cn('inline-flex items-center rounded-sm px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider border', cfg.badge)}>
          {node.type}
        </span>
        {!!node.cves && (
          <span className="ml-auto text-[9px] bg-[#891f24] text-white border-transparent rounded-full px-2 py-0.5 font-medium">{node.cves} CVE</span>
        )}
        {!!node.warnings && !node.cves && (
          <span className="ml-auto text-[9px] bg-[#8a430f] text-white border-transparent rounded-full px-2 py-0.5 font-medium">{node.warnings} warn</span>
        )}
      </div>

      {/* Name + PN */}
      <div className="px-3 pt-1 pb-1.5">
        <div className="text-xs font-semibold text-foreground leading-snug line-clamp-1">{node.name}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{node.partNumber}</div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-2 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 flex-wrap">
          {node.revision && (
            <span className="text-[9px] bg-muted/40 text-muted-foreground rounded-sm px-1 border border-border">{node.revision}</span>
          )}
          {node.status && (
            <span className={cn(
              'text-[9px] px-1 rounded-sm border',
              node.status === 'Released'  ? 'bg-[#275a3b] text-white border-transparent font-medium' :
              node.status === 'In Review' ? 'bg-[#8a430f] text-white border-transparent font-medium' :
              node.status === 'Obsolete'  ? 'bg-[#3f3f46] text-white border-transparent' :
                                            'bg-[#175c6d] text-white border-transparent font-medium'
            )}>{node.status}</span>
          )}
        </div>

        {/* Expand / collapse badge */}
        {hasChildren && (
          <div className={cn(
            'flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-sm border',
            isExpanded
              ? 'bg-[#175c6d] text-white border-transparent font-medium'
              : 'bg-muted/20 text-muted-foreground border-border hover:bg-muted/40',
            'transition-colors',
          )}>
            {isExpanded
              ? <><ChevronDown className="h-2.5 w-2.5" />{visibleChildCount}</>
              : <><ChevronRight className="h-2.5 w-2.5" />{totalChildCount}</>
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
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-card flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-44 max-w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nodes…"
            className="h-7 pl-7 pr-6 text-xs bg-muted/20 rounded-sm border-border"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-sm border-border bg-card hover:bg-muted/30" onClick={() => zoomIn({ duration: 200 })} title="Zoom in">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-sm border-border bg-card hover:bg-muted/30" onClick={() => zoomOut({ duration: 200 })} title="Zoom out">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-sm border-border bg-card hover:bg-muted/30" onClick={() => fitView({ duration: 300, padding: 0.2, maxZoom: 1.2 })} title="Fit to screen">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-sm border-border bg-card hover:bg-muted/30" onClick={handleReset} title="Reset — collapse all">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Instruction hint */}
        <span className="text-[9px] text-muted-foreground hidden md:block">
          Click node to expand/collapse · Select to inspect
        </span>

        {/* Clear selection */}
        {selected && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-primary ml-auto rounded-sm hover:bg-muted/30" onClick={() => onSelect(null)}>
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-3 px-3 py-1 border-b border-border bg-muted/10 flex-wrap">
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Types:</span>
        {(['Vehicle','System','Assembly','ECU','Part','Harness'] as const).map(t => (
          <span key={t} className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className={cn('h-1.5 w-1.5 rounded-full', tc(t).dot)} />{t}
          </span>
        ))}
        <span className="flex items-center gap-1 text-[9px] text-muted-foreground ml-2">
          <span className="h-1.5 w-1.5 rounded-full bg-critical" />Critical
        </span>
        <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" />Warning
        </span>
        <span className="ml-auto text-[9px] text-muted-foreground">
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
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="hsl(var(--border))" />
          <Controls position="bottom-right" showZoom={false} showFitView={false}
            className="!border-border !bg-card !shadow-none !rounded-sm !overflow-hidden" />

          {/* Status bar */}
          <Panel position="bottom-left">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-card border border-border shadow-none text-[10px]">
              {selected ? (
                <>
                  <GitBranch className="h-3 w-3 text-primary" />
                  <span className="font-semibold text-primary">{selected.name}</span>
                  <span className="text-border">·</span>
                  <span className="text-muted-foreground">{selected.type}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Click a node to inspect dependencies</span>
              )}
            </div>
          </Panel>

          {/* Empty filter state */}
          {nodes.length === 0 && (
            <Panel position="top-center">
              <div className="flex flex-col items-center gap-2 mt-16 p-4 rounded-sm bg-card border border-border shadow-none">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <p className="text-xs font-semibold text-foreground">No matching nodes</p>
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-sm" onClick={() => setSearch('')}>Clear search</Button>
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