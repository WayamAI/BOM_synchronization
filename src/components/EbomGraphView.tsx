import { plural } from "@/lib/format";
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
import { EntityGlyph, EntityMark } from '@/components/icons/EntityIcon';
import { typeMark } from '@/components/icons/iconMap';
import { EbomNode } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import {
  Search, ZoomIn, ZoomOut, Maximize2, RotateCcw,
  ChevronRight, ChevronDown, X, GitBranch,
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
  // Colour is reserved for status in Chronus, so nodes stay neutral and the type is the label.
  // Only the legend dot uses a chart series colour.
  Vehicle:       { ring: 'border-hairline', bg: '', badge: 'bg-raised-2 text-secondary-foreground', dot: 'bg-series-6' },
  System:        { ring: 'border-hairline', bg: '', badge: 'bg-raised-2 text-secondary-foreground', dot: 'bg-series-1' },
  Assembly:      { ring: 'border-hairline', bg: '', badge: 'bg-raised-2 text-secondary-foreground', dot: 'bg-series-2' },
  'Sub-Assembly':{ ring: 'border-hairline', bg: '', badge: 'bg-raised-2 text-secondary-foreground', dot: 'bg-series-2' },
  ECU:           { ring: 'border-hairline', bg: '', badge: 'bg-raised-2 text-secondary-foreground', dot: 'bg-series-3' },
  Harness:       { ring: 'border-hairline', bg: '', badge: 'bg-raised-2 text-secondary-foreground', dot: 'bg-series-5' },
  Part:          { ring: 'border-hairline', bg: '', badge: 'bg-raised-2 text-secondary-foreground', dot: 'bg-quaternary' },
  Fastener:      { ring: 'border-hairline', bg: '', badge: 'bg-raised-2 text-secondary-foreground', dot: 'bg-quaternary' },
  Consumable:    { ring: 'border-hairline', bg: '', badge: 'bg-raised-2 text-secondary-foreground', dot: 'bg-quaternary' },
  Software:      { ring: 'border-hairline', bg: '', badge: 'bg-raised-2 text-secondary-foreground', dot: 'bg-series-6' },
};
const tc = (type: string) => TYPE_CFG[type] ?? TYPE_CFG['Part'];

const healthDot = (h?: string) =>
  h === 'critical' ? 'bg-error' :
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
        'relative rounded-lg border bg-container cursor-pointer select-none',
        cfg.ring,
        isSelected  && 'border-strong ring-2 ring-active',
        isHighlighted && !isSelected && 'border-strong',
        isDimmed    && 'opacity-25 grayscale pointer-events-none',
        'transition-colors duration-150 hover:border-strong',
      )}
      style={{ width: NODE_W, minHeight: NODE_H }}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0 !w-2 !h-2" />

      {/* Type bar + health dot */}
      <div className="px-4 pt-3 flex items-center gap-2">
        <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', healthDot(node.health))} />
        <EntityGlyph id={typeMark(node.type)} size={20} />
        <span>
          <span className={cn('type-eyebrow inline-flex items-center rounded-full px-2 py-0.5 type-caption', cfg.badge)}>
            {node.type}
          </span>
        </span>
        {!!node.cves && (
          <span className="ml-auto rounded-full bg-error-badge px-2 py-0.5 type-caption font-medium text-badge">{plural(node.cves, "CVE")}</span>
        )}
        {!!node.warnings && !node.cves && (
          <span className="ml-auto rounded-full bg-warning-badge px-2 py-0.5 type-caption font-medium text-badge">{node.warnings}⚠</span>
        )}
      </div>

      {/* Name + PN */}
      <div className="px-4 pt-1.5 pb-2">
        <div className="text-[14px] font-medium text-foreground leading-snug line-clamp-1">{node.name}</div>
        <div className="type-caption font-mono text-tertiary mt-0.5">{node.partNumber}</div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {node.revision && (
            <span className="type-caption font-mono bg-action text-tertiary rounded-full px-2 border border-hairline">{node.revision}</span>
          )}
          {node.status && (
            <span className={cn(
              'type-caption px-2 rounded-full font-medium text-badge',
              node.status === 'Released'  ? 'bg-success-badge' :
              node.status === 'In Review' ? 'bg-warning-badge' :
              node.status === 'Obsolete'  ? 'bg-neutral-badge' :
                                            'bg-info-badge'
            )}>{node.status}</span>
          )}
        </div>

        {/* Expand / collapse badge */}
        {hasChildren && (
          <div className={cn(
            'flex items-center gap-0.5 type-caption font-bold px-2 py-0.5 rounded-full border',
            isExpanded
              ? 'bg-action-primary text-on-color border-transparent'
              : 'bg-action text-tertiary border-hairline hover:border-strong hover:text-foreground',
            'transition-colors',
          )}>
            {isExpanded
              ? <><ChevronDown className="size-3.5" />{visibleChildCount}</>
              : <><ChevronRight className="size-3.5" />{totalChildCount}</>
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
            stroke: edgeHighlighted ? 'var(--text-foreground)' : isDimmed ? 'var(--stroke-muted)' : 'var(--stroke-default)',
            strokeWidth: edgeHighlighted ? 2.5 : isDimmed ? 0.8 : 1.5,
            opacity: isDimmed ? 0.25 : 1,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgeHighlighted ? 'var(--text-foreground)' : 'var(--stroke-default)',
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
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-hairline bg-container shadow-card">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-hairline bg-container flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-44 max-w-60">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-tertiary pointer-events-none" />
          <Input aria-label="Search nodes"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nodes"
            className="h-7 pl-8 pr-7 type-body-sm bg-raised"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-tertiary hover:text-foreground">
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => zoomIn({ duration: 200 })} title="Zoom in">
            <ZoomIn  />
          </Button>
          <Button variant="outline" size="icon" onClick={() => zoomOut({ duration: 200 })} title="Zoom out">
            <ZoomOut  />
          </Button>
          <Button variant="outline" size="icon" onClick={() => fitView({ duration: 300, padding: 0.2, maxZoom: 1.2 })} title="Fit to screen">
            <Maximize2  />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset} title="Reset and collapse all">
            <RotateCcw  />
          </Button>
        </div>

        {/* Instruction hint */}
        <span className="type-caption text-tertiary hidden md:block">
          Click a node to expand its children · Click again to collapse
        </span>

        {/* Clear selection */}
        {selected && (
          <Button variant="ghost" size="sm" className="h-7 px-2 type-label-sm gap-1 text-foreground ml-auto" onClick={() => onSelect(null)}>
            <X className="size-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-hairline bg-raised flex-wrap">
        <span className="type-caption font-bold uppercase tracking-widest text-tertiary">Types:</span>
        {(['Vehicle','System','Assembly','ECU','Part','Harness'] as const).map(t => (
          <span key={t} className="flex items-center gap-1 type-caption text-tertiary">
            <EntityGlyph id={typeMark(t)} size={20} />{t}
          </span>
        ))}
        <span className="flex items-center gap-1 type-caption text-tertiary ml-2">
          <span className="h-2 w-2 rounded-full bg-error" />Critical
        </span>
        <span className="flex items-center gap-1 type-caption text-tertiary">
          <span className="h-2 w-2 rounded-full bg-warning" />Warning
        </span>
        <span className="ml-auto type-caption text-tertiary font-medium">
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
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="var(--stroke-default)" />
          <Controls position="bottom-right" showZoom={false} showFitView={false}
            className="!border-hairline !bg-container !shadow-none !rounded-lg !overflow-hidden" />

          {/* Status bar */}
          <Panel position="bottom-left">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-container border border-hairline type-caption">
              {selected ? (
                <>
                  <GitBranch className="size-3.5 text-tertiary" />
                  <span className="font-medium text-foreground">{selected.name}</span>
                  <span className="text-border">·</span>
                  <span className="text-tertiary">{selected.type}</span>
                </>
              ) : (
                <span className="text-tertiary">Click a node to explore its dependencies</span>
              )}
            </div>
          </Panel>

          {/* Empty filter state */}
          {nodes.length === 0 && (
            <Panel position="top-center">
              <div className="flex flex-col items-center gap-2 mt-20 p-5 rounded-lg bg-container border border-hairline">
                <EntityMark id="ebom" size={72} />
                <p className="type-body-md font-semibold">No matching nodes</p>
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