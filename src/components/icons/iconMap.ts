import {
  Box, Boxes, Layers, GitBranch, Factory, Wrench, Cog, Cpu, FileEdit, Truck,
  AlertOctagon, FileBarChart, Zap, Battery, CircleDot, CarFront, Armchair, Plug, Blocks, Car,
  Cable, Globe, BatteryCharging, Lightbulb, PencilRuler, PackageCheck, Flag, LayoutDashboard,
  GitCompare, Bell, Plus, Link2, RefreshCw, Rocket, Check, X, Upload, FileOutput, CalendarClock,
  ScanSearch, Route, BookOpen, Sparkles, ShieldCheck, Bug, ClipboardCheck, History, ArrowUpToLine,
  Coins, Eye, Unlink, BadgeCheck, Gauge, TrendingUp, Presentation, FileBadge, Compass, Crosshair,
  User, Building2, Hourglass, Pin, SlidersHorizontal, Store, Barcode, type LucideIcon,
} from "lucide-react";

// Single source of truth for entity icons: id -> { lucide, mark }.
// lucide: greyscale icon for dense rows, tabs, chips and buttons (and the fallback for a mark that fails to load).
// mark: PNG in public/icons (144px) and public/icons/sm (96px), cut from the sheets in scripts/icon-sheets.json.
//   Marks are brand-orange identity icons. Use them only at 20px or more: EntityGlyph (20 to 32px) and
//   EntityMark (36, 44 and 72px). Never use one for a status (warning, error, success).
// One id means one thing everywhere (sidebar, header, panel, KPI tile, row).
// "field-event" looks like a warning sign: use it only in the Field Quality header and empty state;
// everywhere else that page's concept is "quality".
export interface EntityIcon {
  lucide: LucideIcon;
  mark: string;
}

export const entityIcons = {
  // Original 12
  "part":         { lucide: Box,          mark: "part" },
  "assembly":     { lucide: Boxes,        mark: "assembly" },
  "variant":      { lucide: Layers,       mark: "variant" },
  "ebom":         { lucide: GitBranch,    mark: "ebom" },
  "mbom":         { lucide: Factory,      mark: "mbom" },
  "service-kit":  { lucide: Wrench,       mark: "service-kit" },
  "fru":          { lucide: Cog,          mark: "fru" },
  "software":     { lucide: Cpu,          mark: "software" },
  "ecn":          { lucide: FileEdit,     mark: "ecn" },
  "supplier":     { lucide: Truck,        mark: "supplier" },
  "field-event":  { lucide: AlertOctagon, mark: "field-event" },
  "report":       { lucide: FileBarChart, mark: "report" },
  // Systems, part types, places
  "system-powertrain": { lucide: Zap,       mark: "system-powertrain" },
  "system-battery":    { lucide: Battery,   mark: "system-battery" },
  "system-chassis":    { lucide: CircleDot, mark: "system-chassis" },
  "system-body":       { lucide: CarFront,  mark: "system-body" },
  "system-interior":   { lucide: Armchair,  mark: "system-interior" },
  "system-electrical": { lucide: Plug,      mark: "system-electrical" },
  "system":            { lucide: Blocks,    mark: "system" },
  "vehicle":           { lucide: Car,       mark: "vehicle" },
  "ecu":               { lucide: Cpu,       mark: "ecu" },
  "harness":           { lucide: Cable,     mark: "harness" },
  "plant":             { lucide: Factory,   mark: "plant" },
  "region":            { lucide: Globe,     mark: "region" },
  // Programs, stages, pages
  "vehicle-suv":         { lucide: Car,             mark: "vehicle-suv" },
  "vehicle-sedan":       { lucide: Car,             mark: "vehicle-sedan" },
  "vehicle-truck":       { lucide: Truck,           mark: "vehicle-truck" },
  "vehicle-ev":          { lucide: BatteryCharging, mark: "vehicle-ev" },
  "stage-concept":       { lucide: Lightbulb,       mark: "stage-concept" },
  "stage-design":        { lucide: PencilRuler,     mark: "stage-design" },
  "stage-engineering":   { lucide: Cog,             mark: "stage-engineering" },
  "stage-preproduction": { lucide: PackageCheck,    mark: "stage-preproduction" },
  "stage-sop":           { lucide: Flag,            mark: "stage-sop" },
  "command-center":      { lucide: LayoutDashboard, mark: "command-center" },
  "compare":             { lucide: GitCompare,      mark: "compare" },
  "notifications":       { lucide: Bell,            mark: "notifications" },
  // Actions
  "add":      { lucide: Plus,          mark: "add" },
  "link":     { lucide: Link2,         mark: "link" },
  "sync":     { lucide: RefreshCw,     mark: "sync" },
  "release":  { lucide: Rocket,        mark: "release" },
  "approve":  { lucide: Check,         mark: "approve" },
  "reject":   { lucide: X,             mark: "reject" },
  "export":   { lucide: Upload,        mark: "export" },
  "generate": { lucide: FileOutput,    mark: "generate" },
  "schedule": { lucide: CalendarClock, mark: "schedule" },
  "scan":     { lucide: ScanSearch,    mark: "scan" },
  "trace":    { lucide: Route,         mark: "trace" },
  "manual":   { lucide: BookOpen,      mark: "manual" },
  // Concepts and KPIs
  "ai":         { lucide: Sparkles,       mark: "ai" },
  "security":   { lucide: ShieldCheck,    mark: "security" },
  "cve":        { lucide: Bug,            mark: "cve" },
  "validation": { lucide: ClipboardCheck, mark: "validation" },
  "history":    { lucide: History,        mark: "history" },
  "where-used": { lucide: ArrowUpToLine,  mark: "where-used" },
  "cost":       { lucide: Coins,          mark: "cost" },
  "watchlist":  { lucide: Eye,            mark: "watchlist" },
  "disruption": { lucide: Unlink,         mark: "disruption" },
  "license":    { lucide: BadgeCheck,     mark: "license" },
  "quality":    { lucide: Gauge,          mark: "quality" },
  "trend":      { lucide: TrendingUp,     mark: "trend" },
  // Reports, 404, scope, spares
  "executive":   { lucide: Presentation,      mark: "executive" },
  "compliance":  { lucide: FileBadge,         mark: "compliance" },
  "not-found":   { lucide: Compass,           mark: "not-found" },
  "scope":       { lucide: Crosshair,         mark: "scope" },
  "person":      { lucide: User,              mark: "person" },
  "department":  { lucide: Building2,         mark: "department" },
  "lead-time":   { lucide: Hourglass,         mark: "lead-time" },
  "pinned":      { lucide: Pin,               mark: "pinned" },
  "config-rule": { lucide: SlidersHorizontal, mark: "config-rule" },
  "market":      { lucide: Store,             mark: "market" },
  "volume":      { lucide: Boxes,             mark: "volume" },
  "vin":         { lucide: Barcode,           mark: "vin" },
} as const satisfies Record<string, EntityIcon>;

export type EntityId = keyof typeof entityIcons;

export const FALLBACK_ICON: EntityIcon = { lucide: Box, mark: "" };

export const getEntityIcon = (id: string): EntityIcon =>
  (entityIcons as Record<string, EntityIcon>)[id] ?? FALLBACK_ICON;

// Part type (mockData PartType) -> entity id, for row and tree glyphs. Unknown types fall back to "part".
const TYPE_MARK: Record<string, EntityId> = {
  "Vehicle": "vehicle", "System": "system", "Assembly": "assembly", "Sub-Assembly": "assembly",
  "ECU": "ecu", "Part": "part", "Harness": "harness",
};
export const typeMark = (type?: string): EntityId => (type && TYPE_MARK[type]) || "part";

// 96px cut (public/icons/sm) for glyphs up to 32px, 144px cut above that.
export const markUrl = (id: string, px?: number): string | null => {
  const m = getEntityIcon(id).mark;
  if (!m) return null;
  const folder = px !== undefined && px <= 32 ? "icons/sm" : "icons";
  return `${import.meta.env.BASE_URL}${folder}/${m}.png`;
};
