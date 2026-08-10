import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Layers, GitBranch, Factory, Wrench, ShieldAlert, FileEdit, GitCompare,
  Boxes, Truck, AlertOctagon, FileBarChart, ChevronRight, ChevronDown, Pin, X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { ebomTree, type EbomNode } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const nav = [
  { section: "Overview", items: [
    { to: "/",           label: "Command Center",  icon: LayoutDashboard, end: true },
  ]},
  { section: "BOM Views", items: [
    { to: "/variants",   label: "Variants & Config", icon: Layers },
    { to: "/ebom",       label: "Engineering BOM",   icon: GitBranch },
    { to: "/mbom",       label: "Manufacturing BOM", icon: Factory },
    { to: "/service",    label: "Service BOM",       icon: Wrench },
    { to: "/software",   label: "Software BOM",      icon: ShieldAlert },
  ]},
  { section: "Change & Compare", items: [
    { to: "/changes",    label: "Change Management", icon: FileEdit },
    { to: "/compare",    label: "BOM Compare",       icon: GitCompare },
  ]},
  { section: "Parts & Supply", items: [
    { to: "/parts",      label: "Part Master",       icon: Boxes },
    { to: "/suppliers",  label: "Supplier Intel",    icon: Truck },
    { to: "/field",      label: "Field Quality",     icon: AlertOctagon },
  ]},
  { section: "reports", items: [
    { to: "/reports",    label: "Reports & Exports", icon: FileBarChart },
  ]},
];

const pinned = [
  { id: "ecn",  label: "ECN-2241 · cell tab",       to: "/changes/ECN-2241" },
  { id: "pn",   label: "BAT-PCK-8500 · HV Pack",    to: "/parts/BAT-PCK-8500" },
  { id: "sup",  label: "Anonymous PCB · Taiwan",    to: "/suppliers" },
];

const healthDot = (h?: string) => {
  if (h === "critical") return "bg-critical shadow-glow-danger";
  if (h === "warning")  return "bg-warning";
  return "bg-success";
};

const TreeBranch = ({ node, depth = 0, onPick }: { node: EbomNode; depth?: number; onPick: (pn: string) => void }) => {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = !!node.children?.length;
  return (
    <div>
      <button
        onClick={() => hasChildren ? setOpen(!open) : onPick(node.partNumber)}
        onDoubleClick={() => onPick(node.partNumber)}
        className="group flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-xs transition-colors hover:bg-sidebar-accent text-sidebar-foreground"
        style={{ paddingLeft: 8 + depth * 12 }}
        title={node.partNumber}
      >
        {hasChildren ? (
          open ? <ChevronDown className="h-3 w-3 shrink-0 opacity-60" /> : <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
        ) : (
          <span className="w-3" />
        )}
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", healthDot(node.health))} />
        <span className="truncate text-left">{node.name}</span>
      </button>
      {open && hasChildren && (
        <div>{node.children!.map(c => <TreeBranch key={c.id} node={c} depth={depth + 1} onPick={onPick} />)}</div>
      )}
    </div>
  );
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const tree = useMemo(() => ebomTree, []);

  return (
    <aside className="hidden md:flex flex-col border-r border-sidebar-border bg-sidebar/40 backdrop-blur-md h-full">
      {/* Scrollable primary navigation and tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <nav className="p-2 space-y-1">
          {nav.map(group => (
            <div key={group.section} className="mb-2">
              <div className="px-2 pt-1 pb-1 text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                {group.section}
              </div>
              <div className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                        "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        isActive && "bg-sidebar-accent text-sidebar-foreground"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-gradient-primary" />}
                        <Icon className={cn("h-3.5 w-3.5", isActive && "text-primary")} />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mx-3 my-1 border-t border-sidebar-border" />

        <div className="px-3 pb-1">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Live Program Tree</span>
            <span className="text-[10px] text-muted-foreground">rev 2.4</span>
          </div>
          <div className="px-2 pb-6">
            <TreeBranch node={tree} onPick={(pn) => navigate(`/parts/${pn}`)} />
          </div>
        </div>
      </div>

      {/* Collapsible Docked Pinned Section */}
      <div className="flex-none bg-sidebar/5 border-t border-sidebar-border">
        <button 
          onClick={() => setPinnedOpen(!pinnedOpen)}
          className="flex w-full items-center justify-between p-3 transition-colors hover:bg-sidebar-accent/50"
        >
          <div className="flex items-center gap-2">
            <Pin className={cn("h-3 w-3 transition-colors", pinnedOpen ? "text-primary" : "text-muted-foreground")} />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Pinned Hub</span>
          </div>
          <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", !pinnedOpen && "-rotate-90")} />
        </button>
        
        {pinnedOpen && (
          <div className="px-2 pb-2 animate-in slide-in-from-bottom-1 fade-in duration-200">
            {pinned.map(pn => (
              <button
                key={pn.id}
                onClick={() => navigate(pn.to)}
                className="group flex w-full items-center gap-1.5 rounded-md px-2 py-2 text-[10px] hover:bg-sidebar-accent text-sidebar-foreground/75"
              >
                <div className="h-1 w-1 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                <span className="truncate text-left flex-1">{pn.label}</span>
                <X className="h-2.5 w-2.5 opacity-0 group-hover:opacity-40" />
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
