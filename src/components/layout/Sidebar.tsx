import { Link, NavLink, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, Pin, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState, useMemo, type SyntheticEvent } from "react";
import { ebomTree, type EbomNode } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import wayamMarkLight from "@/assets/brand/wayam-mark-light.svg";
import wayamMarkDark from "@/assets/brand/wayam-mark-dark.svg";
import wayamWordmarkLight from "@/assets/brand/wayam-wordmark-light.svg";
import wayamWordmarkDark from "@/assets/brand/wayam-wordmark-dark.svg";
import { navGroups, pinnedItems } from "./nav";

const healthDot = (h?: string) => {
  if (h === "critical") return "bg-critical";
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
        className="group flex w-full items-center gap-1.5 rounded-lg py-1 pr-2 text-xs text-secondary-foreground outline-none transition-colors duration-150 hover:bg-action hover:text-foreground focus-visible:ring-2 focus-visible:ring-active"
        style={{ paddingLeft: 8 + depth * 12 }}
        title={node.partNumber}
      >
        {hasChildren ? (
          open ? <ChevronDown className="size-3 shrink-0 text-quaternary" aria-hidden /> : <ChevronRight className="size-3 shrink-0 text-quaternary" aria-hidden />
        ) : (
          <span className="w-3" />
        )}
        <span className={cn("size-1.5 rounded-full shrink-0", healthDot(node.health))} />
        <span className="truncate text-left">{node.name}</span>
      </button>
      {open && hasChildren && (
        <div>{node.children!.map(c => <TreeBranch key={c.id} node={c} depth={depth + 1} onPick={onPick} />)}</div>
      )}
    </div>
  );
};

interface SidebarProps {
  expanded: boolean;
  onToggleExpanded: () => void;
  mobileOpen: boolean;
}

export const Sidebar = ({ expanded, onToggleExpanded, mobileOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const tree = useMemo(() => ebomTree, []);

  // Collapsed rail: hovering or focusing a puck shows a label flyout to its right.
  // The nav column scrolls (and clips), so the flyout is position:fixed.
  const [flyout, setFlyout] = useState<{ group: string; label: string; top: number } | null>(null);
  const showFlyout = (e: SyntheticEvent<HTMLElement>, group: string, label: string) => {
    if (expanded) return;
    const r = e.currentTarget.getBoundingClientRect();
    setFlyout({ group, label, top: r.top + r.height / 2 });
  };
  const hideFlyout = () => setFlyout(null);

  // Below lg the sidebar is an off-canvas drawer and always shows its full
  // layout. From lg it is a 68px rail that expands to 252px; labels, the
  // program tree and Pinned are shown only when expanded.
  const railOnly = expanded ? "" : "lg:hidden";

  return (
    <aside
      className={cn(
        "z-50 flex h-full shrink-0 flex-col border-r border-hairline bg-container",
        "transition-[width,transform,visibility] duration-200 ease-out",
        "fixed inset-y-0 left-0 w-[252px] -translate-x-full lg:static lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "max-lg:invisible",
        expanded ? "lg:w-[252px]" : "lg:w-[68px]",
      )}
    >
      {/* Brand */}
      <div className={cn("flex h-14 shrink-0 items-center gap-2.5 border-b border-hairline px-3", !expanded && "lg:px-[18px]")}>
        <Link
          to="/"
          aria-label="Wayam AI, BOM Synchronization"
          className="flex min-w-0 items-center gap-2.5 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-active"
        >
          <img src={wayamMarkLight} alt="" className="h-auto w-8 shrink-0 dark:hidden" />
          <img src={wayamMarkDark} alt="" className="hidden h-auto w-8 shrink-0 dark:block" />
          <span className={cn("flex shrink-0 items-center", railOnly)}>
            <img src={wayamWordmarkLight} alt="" className="h-5 w-auto dark:hidden" />
            <img src={wayamWordmarkDark} alt="" className="hidden h-5 w-auto dark:block" />
          </span>
        </Link>
      </div>

      {/* Navigation + program tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <nav aria-label="Primary" className={cn("flex flex-col gap-1.5 py-3 px-3", !expanded && "lg:px-[14px]")}>
          {navGroups.map((group, gi) => (
            <div key={group.section} className="flex flex-col gap-1.5">
              {gi > 0 && <div className={cn("mx-1 my-1 border-t border-hairline", expanded ? "" : "lg:mx-2")} />}
              <div className={cn("type-eyebrow px-1 pt-1 text-quaternary", railOnly)}>{group.section}</div>
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  aria-label={label}
                  onMouseEnter={(e) => showFlyout(e, group.section, label)}
                  onFocus={(e) => showFlyout(e, group.section, label)}
                  onMouseLeave={hideFlyout}
                  onBlur={hideFlyout}
                  className="group flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-active"
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-[180ms] ease-out",
                          isActive
                            ? "bg-action-primary text-on-color"
                            : "bg-action text-tertiary group-hover:bg-raised-2 group-hover:text-secondary-foreground",
                        )}
                      >
                        <Icon className="size-[17px]" aria-hidden />
                      </span>
                      <span
                        className={cn(
                          "type-label-sm truncate transition-colors duration-[180ms]",
                          isActive ? "text-foreground" : "text-tertiary group-hover:text-secondary-foreground",
                          railOnly,
                        )}
                      >
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={cn("border-t border-hairline px-3 pt-3", railOnly)}>
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="type-eyebrow text-quaternary">Program tree</span>
            <span className="type-caption tabular text-quaternary">rev 2.4</span>
          </div>
          <div className="pb-4">
            <TreeBranch node={tree} onPick={(pn) => navigate(`/parts/${pn}`)} />
          </div>
        </div>
      </div>

      {/* Pinned (docked, expanded only) */}
      <div className={cn("shrink-0 border-t border-hairline", railOnly)}>
        <button
          onClick={() => setPinnedOpen(!pinnedOpen)}
          aria-expanded={pinnedOpen}
          className="flex w-full items-center justify-between px-4 py-3 outline-none transition-colors duration-150 hover:bg-raised focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-active"
        >
          <div className="flex items-center gap-2">
            <Pin className="size-3 text-quaternary" aria-hidden />
            <span className="type-eyebrow text-quaternary">Pinned</span>
          </div>
          <ChevronDown className={cn("size-3 text-quaternary transition-transform duration-150", !pinnedOpen && "-rotate-90")} aria-hidden />
        </button>

        {pinnedOpen && (
          <div className="px-2 pb-2">
            {pinnedItems.map(pn => (
              <button
                key={pn.id}
                onClick={() => navigate(pn.to)}
                className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-secondary-foreground outline-none transition-colors duration-150 hover:bg-action hover:text-foreground focus-visible:ring-2 focus-visible:ring-active"
              >
                <span className="size-1 shrink-0 rounded-full bg-quaternary" />
                <span className="flex-1 truncate text-left">{pn.label}</span>
                <X className="size-3 text-quaternary opacity-0 group-hover:opacity-100" aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer: collapse / expand (desktop rail only) */}
      <div className={cn("hidden shrink-0 border-t border-hairline py-3 lg:block", expanded ? "px-3" : "px-[14px]")}>
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className="group flex w-full items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-active"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-action text-tertiary transition-colors duration-[180ms] ease-out group-hover:bg-raised-2 group-hover:text-secondary-foreground">
            {expanded ? <PanelLeftClose className="size-[17px]" aria-hidden /> : <PanelLeftOpen className="size-[17px]" aria-hidden />}
          </span>
          <span className={cn("type-label-sm text-tertiary group-hover:text-secondary-foreground", railOnly)}>
            {expanded ? "Collapse sidebar" : "Expand sidebar"}
          </span>
        </button>
      </div>
      {flyout && !expanded && (
        <div
          role="presentation"
          style={{ top: flyout.top }}
          className="pointer-events-none fixed left-[76px] z-50 hidden -translate-y-1/2 rounded-xl border border-hairline bg-container px-3 py-2 shadow-lg lg:block"
        >
          <div className="type-eyebrow whitespace-nowrap text-quaternary">{flyout.group}</div>
          <div className="type-label-md whitespace-nowrap text-foreground">{flyout.label}</div>
        </div>
      )}
    </aside>
  );
};
