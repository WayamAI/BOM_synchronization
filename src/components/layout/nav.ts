import {
  LayoutDashboard, Layers, GitBranch, Factory, Wrench, ShieldAlert, FileEdit, GitCompare,
  Boxes, Truck, AlertOctagon, FileBarChart, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

// One array drives the sidebar and the top-bar location (group eyebrow + title).
export const navGroups: { section: string; items: NavItem[] }[] = [
  { section: "Overview", items: [
    { to: "/",           label: "Command Center",  icon: LayoutDashboard, end: true },
  ]},
  { section: "BOM Views", items: [
    { to: "/variants",   label: "Variants & Configuration", icon: Layers },
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
    { to: "/suppliers",  label: "Supplier Intelligence",    icon: Truck },
    { to: "/field",      label: "Field Quality",     icon: AlertOctagon },
  ]},
  { section: "Reports", items: [
    { to: "/reports",    label: "Reports & Exports", icon: FileBarChart },
  ]},
];

export const pinnedItems = [
  { id: "ecn",  label: "ECN-2241 · cell tab",       to: "/changes/ECN-2241" },
  { id: "pn",   label: "BAT-PCK-8500 · HV Pack",    to: "/parts/BAT-PCK-8500" },
  { id: "sup",  label: "Anonymous PCB · Taiwan",    to: "/suppliers" },
];

const routeLabels: Record<string, string> = Object.fromEntries(
  navGroups.flatMap(g => g.items.map(i => [i.to.replace(/^\//, ""), i.label])),
);

export const locate = (pathname: string): { group: string; title: string } => {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  const target = "/" + first;
  const group = navGroups.find(g => g.items.some(i => i.to === target))?.section ?? "";
  return { group, title: routeLabels[first] ?? "Page not found" };
};
