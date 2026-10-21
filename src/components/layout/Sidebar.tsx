import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, Pin, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState, useMemo, useEffect, type SyntheticEvent } from "react";
import { ebomTree, type EbomNode } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import wayamMarkLight from "@/assets/brand/wayam-mark-light.svg";
import wayamMarkDark from "@/assets/brand/wayam-mark-dark.svg";
import wayamWordmarkLight from "@/assets/brand/wayam-wordmark-light.svg";
import wayamWordmarkDark from "@/assets/brand/wayam-wordmark-dark.svg";
import { navGroups, pinnedItems } from "./nav";
import { EntityGlyph } from "@/components/icons/EntityIcon";

const healthDot = (h?: string) => {
  if (h === "critical") return "bg-error";
  if (h === "warning")  return "bg-warning";
  return "bg-success";
};

// Chronus tree: a 1px spine with a tick per child and an L-shaped corner on the last one.
const TreeBranch = ({ node, onPick, depth = 0 }: { node: EbomNode; onPick: (pn: string) => void; depth?: number }) => {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = !!node.children?.length;
  return (
    <div>
      <div className="group flex w-full items-center gap-1 rounded-lg py-0.5 pr-2 type-body-sm text-secondary-foreground transition-colors duration-150 hover:bg-action hover:text-foreground">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
            className="grid size-5 shrink-0 place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-active"
          >
            {open ? <ChevronDown className="size-3 text-quaternary" aria-hidden /> : <ChevronRight className="size-3 text-quaternary" aria-hidden />}
          </button>
        ) : (
          <span className="size-5 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onPick(node.partNumber)}
          title={`${node.name} (${node.partNumber})`}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-active"
        >
          <span className={cn("size-1.5 shrink-0 rounded-full", healthDot(node.health))} />
          <span className="truncate">{node.name}</span>
        </button>
      </div>
      {open && hasChildren && (
        <div className="ml-[13px]">
          {node.children!.map((c, i, all) => {
            const last = i === all.length - 1;
            return (
              <div key={c.id} className="relative pl-3">
                {last ? (
                  <span aria-hidden className="absolute left-0 top-0 h-[15px] w-3 rounded-bl-[3px] border-b border-l border-strong" />
                ) : (
                  <>
                    <span aria-hidden className="absolute bottom-0 left-0 top-0 border-l border-strong" />
                    <span aria-hidden className="absolute left-0 top-[14px] w-3 border-t border-strong" />
                  </>
                )}
                <TreeBranch node={c} depth={depth + 1} onPick={onPick} />
              </div>
            );
          })}
        </div>
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
  const { pathname } = useLocation();
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [treeOpen, setTreeOpen] = useState(false);
  // Groups are open by default; the group of the current route is always opened on navigation.
  const [closedGroups, setClosedGroups] = useState<Set<string>>(() => new Set());
  const activeGroup = navGroups.find(g => g.items.some(i => (i.end ? pathname === i.to : pathname === i.to || pathname.startsWith(i.to + "/"))))?.section;
  useEffect(() => {
    if (!activeGroup) return;
    setClosedGroups(prev => {
      if (!prev.has(activeGroup)) return prev;
      const next = new Set(prev);
      next.delete(activeGroup);
      return next;
    });
  }, [activeGroup]);
  const toggleGroup = (section: string) =>
    setClosedGroups(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section); else next.add(section);
      return next;
    });
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
          aria-label="Wayam AI, Sama"
          className="flex min-w-0 items-center gap-2.5 rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-active"
        >
          <img src={wayamMarkLight} alt="" className="h-auto w-8 shrink-0 dark:hidden" />
          <img src={wayamMarkDark} alt="" className="hidden h-auto w-8 shrink-0 dark:block" />
          <span className={cn("flex min-w-0 flex-col gap-0.5", railOnly)}>
            <img src={wayamWordmarkLight} alt="" className="h-5 w-auto self-start dark:hidden" />
            <img src={wayamWordmarkDark} alt="" className="hidden h-5 w-auto self-start dark:block" />
            <span className="type-eyebrow block truncate text-quaternary">Sama</span>
          </span>
        </Link>
      </div>

      {/* Navigation + program tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <nav aria-label="Primary" className={cn("flex flex-col gap-1 px-3 py-3", !expanded && "lg:px-[14px]")}>
          {navGroups.map((group, gi) => {
            const single = group.items.length === 1;
            const open = single || !closedGroups.has(group.section);
            // The rail has no group headers, so it always shows every item.
            const hideItems = !open && (expanded ? "hidden" : "max-lg:hidden");
            return (
              <div key={group.section} className="flex flex-col gap-1">
                {gi > 0 && <div className={cn("my-1 border-t border-hairline", expanded ? "-mx-3" : "-mx-3 lg:-mx-[14px]")} />}
                {!single && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.section)}
                    aria-expanded={open}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-1 py-1 text-left outline-none transition-colors duration-150 hover:bg-raised focus-visible:ring-2 focus-visible:ring-active",
                      railOnly,
                    )}
                  >
                    <span className="type-section text-quaternary">{group.section}</span>
                    <ChevronDown className={cn("size-3 text-quaternary transition-transform duration-150", !open && "-rotate-90")} aria-hidden />
                  </button>
                )}
                <div className={cn("flex flex-col gap-1", hideItems)}>
                  {group.items.map(({ to, label, mark, end }) => (
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
                            <EntityGlyph id={mark} size={22} className={isActive ? "text-on-color" : undefined} />
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
              </div>
            );
          })}
        </nav>

        {/* Program tree: collapsed by default, scrolls inside its own box */}
        <div className={cn("border-t border-hairline", railOnly)}>
          <button
            type="button"
            onClick={() => setTreeOpen(!treeOpen)}
            aria-expanded={treeOpen}
            className="flex w-full items-center justify-between px-4 py-3 outline-none transition-colors duration-150 hover:bg-raised focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-active"
          >
            <span className="type-section text-quaternary">Program Tree</span>
            <span className="flex items-center gap-2">
              <span className="type-caption tabular text-quaternary">rev 2.4</span>
              <ChevronDown className={cn("size-3 text-quaternary transition-transform duration-150", !treeOpen && "-rotate-90")} aria-hidden />
            </span>
          </button>
          {treeOpen && (
            <div className="max-h-72 overflow-y-auto px-3 pb-3 scrollbar-thin">
              <TreeBranch node={tree} onPick={(pn) => navigate(`/parts/${pn}`)} />
            </div>
          )}
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
            <span className="type-section text-quaternary">Pinned</span>
          </div>
          <ChevronDown className={cn("size-3 text-quaternary transition-transform duration-150", !pinnedOpen && "-rotate-90")} aria-hidden />
        </button>

        {pinnedOpen && (
          <div className="px-2 pb-2">
            {pinnedItems.map(pn => (
              <button
                key={pn.id}
                onClick={() => navigate(pn.to)}
                className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 type-body-sm text-secondary-foreground outline-none transition-colors duration-150 hover:bg-action hover:text-foreground focus-visible:ring-2 focus-visible:ring-active"
              >
                <EntityGlyph id={pn.mark} size={20} />
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
          <div className="type-section whitespace-nowrap text-quaternary">{flyout.group}</div>
          <div className="type-label-md whitespace-nowrap text-foreground">{flyout.label}</div>
        </div>
      )}
    </aside>
  );
};
