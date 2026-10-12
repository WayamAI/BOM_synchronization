import {
  Box, Boxes, Layers, GitBranch, Factory, Package, Wrench, Cpu, FileEdit, Truck,
  AlertOctagon, FileText, type LucideIcon,
} from "lucide-react";

// Single source of truth for entity icons: id -> { lucide, mark }.
// lucide: greyscale row/tab icon. mark: PNG in public/icons, used only as a Chronus mark
// (44px page header, 36px card, 72px empty state). A missing mark falls back to the lucide icon.
// "field-event" looks like a warning sign: use it only in the Field Quality header and empty state.
export interface EntityIcon {
  lucide: LucideIcon;
  mark: string;
}

export const entityIcons = {
  "part":         { lucide: Box,          mark: "part" },
  "assembly":     { lucide: Boxes,        mark: "assembly" },
  "variant":      { lucide: Layers,       mark: "variant" },
  "ebom":         { lucide: GitBranch,    mark: "ebom" },
  "mbom":         { lucide: Factory,      mark: "mbom" },
  "service-kit":  { lucide: Package,      mark: "service-kit" },
  "fru":          { lucide: Wrench,       mark: "fru" },
  "software":     { lucide: Cpu,          mark: "software" },
  "ecn":          { lucide: FileEdit,     mark: "ecn" },
  "supplier":     { lucide: Truck,        mark: "supplier" },
  "field-event":  { lucide: AlertOctagon, mark: "field-event" },
  "report":       { lucide: FileText,     mark: "report" },
} as const satisfies Record<string, EntityIcon>;

export type EntityId = keyof typeof entityIcons;

export const FALLBACK_ICON: EntityIcon = { lucide: Box, mark: "" };

export const getEntityIcon = (id: string): EntityIcon =>
  (entityIcons as Record<string, EntityIcon>)[id] ?? FALLBACK_ICON;

export const markUrl = (id: string): string | null => {
  const m = getEntityIcon(id).mark;
  return m ? `${import.meta.env.BASE_URL}icons/${m}.png` : null;
};
