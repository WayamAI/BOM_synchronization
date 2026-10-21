export interface NavItem {
  to: string;
  label: string;
  mark: string;   // entity id (iconMap): the 22px glyph in the sidebar puck
  end?: boolean;
}

// One array drives the sidebar and the top-bar location (group eyebrow + title).
export const navGroups: { section: string; items: NavItem[] }[] = [
  { section: "Overview", items: [
    { to: "/",           label: "Command Center",         mark: "command-center", end: true },
  ]},
  { section: "BOM Views", items: [
    { to: "/variants",   label: "Variants & Configuration", mark: "variant" },
    { to: "/ebom",       label: "Engineering BOM",        mark: "ebom" },
    { to: "/mbom",       label: "Manufacturing BOM",      mark: "mbom" },
    { to: "/service",    label: "Service BOM",            mark: "service-kit" },
    { to: "/software",   label: "Software BOM",           mark: "software" },
  ]},
  { section: "Change & Quality", items: [
    { to: "/changes",    label: "Change Management",      mark: "ecn" },
    { to: "/compare",    label: "BOM Compare",            mark: "compare" },
    { to: "/field",      label: "Field Quality",          mark: "quality" },
  ]},
  { section: "Intelligence", items: [
    { to: "/parts",      label: "Part Master",            mark: "part" },
    { to: "/suppliers",  label: "Supplier Intelligence",  mark: "supplier" },
    { to: "/reports",    label: "Reports & Exports",      mark: "report" },
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
