# FINAL BOM SYNC IMPLEMENTATION PLAN FROM TASARA REPOSITORY ANALYSIS

> **DOCUMENT PURPOSE**: This is the exhaustive, production-grade implementation specification for the UI/UX overhaul of **BOM Synchronization** (`D:\projects\BOM_synchronization-main`), incorporating the design engineering standards, token architecture, typography discipline, and table systems discovered in **IMCC-TASARA** (`D:\projects\IMCC-TASARA-main`).
>
> **POLICY NOTICE**: This document represents a **planning-only milestone**. No production code has been modified, no dependencies installed or removed, and no domain business logic altered.

---

## 1. Executive Summary

### The Core Problem
The current BOM Synchronization interface suffers from unmistakable **"AI-generated UI"** symptoms:
- **Card-in-card nesting overload**: Up to 4 levels of rounded rectangular cards nested inside grids, creating visual claustrophobia and high cognitive strain.
- **Uncurated typography**: Declared Google Sans/Product Sans fonts are never loaded; the application falls back to system fonts (`Segoe UI`) while developers arbitrarily sprinkle `font-mono` and random size classes (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-xs`) across elements.
- **Un-sortable, static tables**: Data tables across EBOM, ECN Changes, Part Master, Compare, and Supplier Intelligence are implemented as raw HTML `<table>` elements with zero column sorting, no row expansion, no pagination, and row keys generated via `Math.random()`.
- **Rigid 60px icon rail**: Navigation is trapped in a non-expandable icon-only column with no labels, no category grouping, and zero mobile accessibility (it is hidden entirely on `< md` screens without an off-canvas drawer).
- **Unprovenanced numbers**: KPIs and metrics are presented as isolated digits without variance baselines, tolerances, confidence scores, or links to source evidence.

### The Solution: Tasara-Inspired Design Engineering
Through our forensic audit of the actual Tasara source code, we identified six foundational systems that make Tasara look like a polished enterprise SaaS application designed over months:
1. **Strict 3-Tier Design Token Hierarchy**: Raw palette (`--ref-gray-*`) $\rightarrow$ Semantic intent (`--surface-container`, `--text-primary`, `--stroke-muted`) $\rightarrow$ Tailwind utilities.
2. **Dual-Font System**: Geometric techno-display (**Michroma**) reserved strictly for high-impact metric anchors (headers, big numbers) paired with precision UI typography (**Geist Sans**) for functional labels, body copy, and tabular numbers.
3. **Restrained Near-Monochrome Canvas (85–90% neutral darks)**: Color is an expensive resource spent exclusively on discrete actionable states (`critical`, `warning`, `success`, `info`, `pending`, `neutral`). Reading numbers are colored text with secondary context, NOT loud solid-fill pills.
4. **Reusable `EnterpriseTable<T>`**: A type-safe generic table component with built-in client-side sorting (strings and numbers), right-aligned tabular numbers, and inline expandable inspection panels (`renderExpanded`) with contrasting surface backgrounds.
5. **Dual-State Adaptive Navigation**: A 64px collapsed icon rail with hover-flyout sub-panels (`GroupFlyout`) that expands into a 256px categorized accordion sidebar.
6. **Ambient Context Header**: An executive topbar that permanently displays active program state, lifecycle progress, SOP countdown, and system freshness alongside keyboard search (`Ctrl K`).

### The Product Rule of Law
**BOM Sync is NOT a Tasara clone.** 
- All automotive domain terminology, part numbers (`MER-BAT-0042`), ECNs (`ECN-2241`), vehicle programs (`Aura EV`, `Apex GT`, `Atlas Cargo`, `Rover EV`), variants, and supply chain data are **100% preserved**.
- Mining terminology (haul trucks, dig blocks, blast zones, pit benches) and geospatial GIS maps (`maplibre-gl`) are strictly excluded.
- The interactive `@xyflow/react` node graph in EBOM is preserved and enhanced.

---

## 2. Tasara Findings That Directly Influence Implementation

| Finding in Tasara Source | Exact File in Tasara | Concrete Implementation Impact on BOM Sync |
|---|---|---|
| **3-Tier Token Isolation** | `styles/tokens.css` (lines 1–274) | Refactor `src/index.css` to define reference tokens and semantic tokens cleanly, decoupling UI styling from arbitrary Tailwind utility strings. |
| **Michroma / Geist Font Pair** | `app/layout.tsx` (lines 14–24) & `app/globals.css` (lines 9–13) | Import `Michroma` and `Geist` via `next/font` in `app/layout.tsx`. Restrict Michroma to page titles and metric digits; use Geist for all functional UI. |
| **`EnterpriseTable<T>` Abstraction** | `components/tables/enterprise-table.tsx` (lines 1–196) | Build `src/components/tables/enterprise-table.tsx`. Replace raw tables across EBOM, Changes, Parts, Compare, and Suppliers with this reusable component. |
| **Dual-Mode Sidebar & Flyout** | `components/layout/sidebar.tsx` (lines 1–329) | Refactor `Sidebar.tsx` to support both 64px collapsed icon rail and 256px expanded accordion, with a 120ms debounced hover flyout panel. |
| **Read Value vs Status Pill** | `components/imcc/variance-badge.tsx` (lines 29–36) | Enforce rule: colored inline text with secondary context (e.g. `+4.2% vs ±2.0%`) for reading metrics; solid pills (`<StatusBadge />`) reserved only for critical/warning states. |
| **Governed Metric Contract** | `components/imcc/kpi-card.tsx` (lines 1–78) | Create `BOMKpiCard` requiring metric label, description tooltip, variance against baseline, confidence band, and provenance drawer trigger. |
| **Slide-Out Provenance Drawer** | `components/imcc/evidence-drawer.tsx` (lines 59–134) | Build `ProvenanceDrawer` (380px right-hand slide-out) to inspect part revision history, ECN lineage, and MBOM routings without leaving the table. |
| **Monochromatic Charting** | `lib/charts/chart-theme.ts` & `chart-primitives.tsx` | Redesign Recharts to use neutral monochromatic ramps (`#e5e5e5` / `#464646`) and line styling (solid vs. dashed), saving colors for threshold limits. |

---

## 3. BOM Sync Protected Areas (Non-Negotiable)

The following areas are strictly **READ-ONLY / FROZEN** in terms of business functionality:
1. **Mock Data Contracts (`src/lib/mockData.ts`)**: All part numbers, parent-child edges, effectivity rules, vehicle programs, variants, plant operations, service kits, software packages, CVEs, and supplier metrics.
2. **Application Routes**:
   - `/` (Command Center)
   - `/variants` (Variants & Configuration)
   - `/ebom` (Engineering BOM)
   - `/mbom` (Manufacturing BOM)
   - `/service` (Service BOM)
   - `/software` (Software BOM)
   - `/changes` & `/changes/[id]` (Change Management / ECNs)
   - `/compare` (BOM Compare)
   - `/parts` & `/parts/[pn]` (Part Master)
   - `/suppliers` (Supplier Intelligence)
   - `/field` (Field Quality & Warranty)
   - `/reports` (Reports & Compliance)
   - `/login` (Authentication)
3. **Authentication State & Logic (`src/lib/auth.ts`)**: Session token handling, user profiles, and login redirects.
4. **Global Program Context (`src/context/ProgramContext.tsx`)**: Active program selection and switching contract across all 4 vehicle lines.
5. **Interactive EBOM Node Graph (`src/components/EbomGraphView.tsx`)**: The `@xyflow/react` node layout, dagre hierarchical layout engine, and zoom/pan controls.
6. **Automotive Domain Terminology**: No replacement of BOM, EBOM, MBOM, SBOM, ECN, SKU, FRU, VIN, Takt time, or Effectivity terms.

---

## 4. Phase 1: Design Tokens & Styling Architecture

### Reference Token Architecture (`src/index.css`)
We will replace the messy mix of ad-hoc shadcn HSL and partial variables with an engineered 3-tier CSS architecture:

```css
/* =============================================================================
   TIER 1: REFERENCE TOKENS (RAW PALETTES)
   ============================================================================= */
:root {
  --ref-black: #000000;
  --ref-white: #ffffff;

  /* Industrial Neutral Charcoal Ramp */
  --ref-gray-50:  #f8fafc;
  --ref-gray-100: #f1f5f9;
  --ref-gray-200: #e2e8f0;
  --ref-gray-300: #cbd5e1;
  --ref-gray-400: #94a3b8;
  --ref-gray-500: #64748b;
  --ref-gray-600: #475569;
  --ref-gray-700: #334155;
  --ref-gray-800: #1e293b;
  --ref-gray-850: #141b26;
  --ref-gray-900: #0f151f;
  --ref-gray-925: #0b0f17;
  --ref-gray-950: #070a0f;
  --ref-gray-1000:#030508;

  /* Restrained Automotive Orange Accent */
  --ref-orange-400: #fb713b;
  --ref-orange-500: #f05d1a;
  --ref-orange-600: #d64808;

  /* Discrete Status Ramps (WCAG AA Compliant) */
  --ref-red-500:    #ef4444; /* Text error */
  --ref-red-600:    #dc2626; /* Critical pill fill (4.83:1) */
  --ref-amber-500:  #f59e0b; /* Text warning */
  --ref-amber-700:  #b45309; /* Warning pill fill (5.02:1) */
  --ref-green-500:  #22c55e; /* Text success */
  --ref-green-700:  #15803d; /* Success pill fill (5.02:1) */
  --ref-blue-400:   #60a5fa; /* Text info */
  --ref-blue-600:   #2563eb; /* Info pill fill (5.17:1) */
  --ref-purple-600: #7c3aed; /* Pending pill fill (6.01:1) */
}

/* =============================================================================
   TIER 2: SEMANTIC INTENT TOKENS (DARK DEFAULT)
   ============================================================================= */
:root {
  /* Surfaces */
  --surface-page:       var(--ref-black);
  --surface-container:  var(--ref-gray-950);
  --surface-raised:     var(--ref-gray-900);
  --surface-raised-x2:  var(--ref-gray-850);
  --surface-action:     var(--ref-gray-900);
  --surface-hover:      rgba(255, 255, 255, 0.04);
  --surface-active:     rgba(255, 255, 255, 0.08);

  /* Typography */
  --text-primary:       var(--ref-gray-50);
  --text-secondary:     var(--ref-gray-300);
  --text-tertiary:      var(--ref-gray-500);
  --text-quaternary:    var(--ref-gray-600);
  --text-on-color:      var(--ref-black);

  /* Hairline Strokes */
  --stroke-muted:       rgba(255, 255, 255, 0.07);
  --stroke-default:     rgba(255, 255, 255, 0.12);
  --stroke-active:      rgba(255, 255, 255, 0.22);
  --stroke-accent:      var(--ref-orange-500);

  /* Actions */
  --action-primary-bg:      var(--ref-gray-50);
  --action-primary-hover:   var(--ref-gray-200);
  --action-primary-text:    var(--ref-black);
  --action-secondary-bg:    var(--ref-gray-900);
  --action-secondary-hover: var(--ref-gray-850);
  --action-secondary-text:  var(--ref-gray-50);
  --action-accent-bg:       var(--ref-orange-500);
  --action-accent-hover:    var(--ref-orange-400);
  --action-accent-text:     var(--ref-white);

  /* Feedback Colors (Inline Text) */
  --feedback-success:   var(--ref-green-500);
  --feedback-warning:   var(--ref-amber-500);
  --feedback-error:     var(--ref-red-500);
  --feedback-info:      var(--ref-blue-400);

  /* Status Pills (Solid Fills carrying white text) */
  --status-critical:    var(--ref-red-600);
  --status-warning:     var(--ref-amber-700);
  --status-success:     var(--ref-green-700);
  --status-info:        var(--ref-blue-600);
  --status-pending:     var(--ref-purple-600);
  --status-neutral:     var(--ref-gray-600);
  --status-content:     #ffffff;
}

/* Light Mode Overrides (when .light class is present) */
:root.light {
  --surface-page:       var(--ref-gray-50);
  --surface-container:  var(--ref-white);
  --surface-raised:     var(--ref-gray-100);
  --surface-raised-x2:  var(--ref-gray-200);
  --surface-action:     var(--ref-gray-100);
  --surface-hover:      rgba(0, 0, 0, 0.04);
  --surface-active:     rgba(0, 0, 0, 0.08);

  --text-primary:       var(--ref-gray-950);
  --text-secondary:     var(--ref-gray-700);
  --text-tertiary:      var(--ref-gray-500);
  --text-quaternary:    var(--ref-gray-400);
  --text-on-color:      var(--ref-white);

  --stroke-muted:       rgba(0, 0, 0, 0.07);
  --stroke-default:     rgba(0, 0, 0, 0.12);
  --stroke-active:      rgba(0, 0, 0, 0.20);

  --action-primary-bg:      var(--ref-gray-950);
  --action-primary-hover:   var(--ref-gray-800);
  --action-primary-text:    var(--ref-white);
  --action-secondary-bg:    var(--ref-gray-200);
  --action-secondary-hover: var(--ref-gray-300);
  --action-secondary-text:  var(--ref-gray-950);
}
```

### Tailwind Config Mapping (`tailwind.config.ts`)
To preserve Tailwind v3 compatibility without breaking existing shadcn components:
- Map `colors.page` $\rightarrow$ `var(--surface-page)`
- Map `colors.container` $\rightarrow$ `var(--surface-container)`
- Map `colors.raised` $\rightarrow$ `var(--surface-raised)`
- Map `colors.primary.DEFAULT` $\rightarrow$ `var(--action-accent-bg)`
- Map `colors.stroke.muted` $\rightarrow$ `var(--stroke-muted)`
- Map `colors.stroke.default` $\rightarrow$ `var(--stroke-default)`
- Standardize `borderRadius`:
  - `sm`: 4px
  - `DEFAULT`: 8px (`rounded-lg`)
  - `xl`: 12px (`rounded-xl` for cards/tables)
  - `full`: 9999px (for buttons, chips, badges)

---

## 5. Typography Plan

### Font Integration (`app/layout.tsx`)
We use Next.js built-in `next/font`:
1. **Functional Typography**: `Geist` from `next/font/google`:
   ```tsx
   import { Geist } from "next/font/google";
   const geistSans = Geist({
     variable: "--font-geist-sans",
     subsets: ["latin"],
   });
   ```
2. **Display Typography**: `Michroma` from `next/font/google` (or local TTF):
   ```tsx
   import { Michroma } from "next/font/google";
   const michroma = Michroma({
     variable: "--font-michroma",
     weight: "400",
     subsets: ["latin"],
   });
   ```

### Standardized Type Scale & Usage Rules

| Token / Class | Size / Line Height / Weight | Font Family | Permitted Usage | Prohibited Usage |
|---|---|---|---|---|
| `text-display-page` | 32px / 36px / 400 (-0.03em) | `Michroma` (`font-display`) | Main `PageHeader` titles ONLY | Subheadings, cards, tables, body copy |
| `text-display-sm` | 18px / 22px / 400 (-0.01em) | `Michroma` (`font-display`) | Key headline KPI digits, drawer section titles | Regular table values, labels, body text |
| `text-heading-lg` | 24px / 30px / 600 | `Geist Sans` (`font-sans`) | Major modal titles, top-level dashboard sections | Inline data labels |
| `text-heading-md` | 18px / 24px / 600 | `Geist Sans` (`font-sans`) | Card section headers, table group titles | Regular table cells |
| `text-heading-sm` | 15px / 20px / 600 | `Geist Sans` (`font-sans`) | Nested panel titles, drawer headers | Small metadata |
| `text-body-md` | 14px / 20px / 400 (-0.01em) | `Geist Sans` (`font-sans`) | Standard descriptions, overview prose, inputs | Table headers |
| `text-body-sm` | 13px / 18px / 400 (-0.01em) | `Geist Sans` (`font-sans`) | Table cell text, list items, dropdown options | Main headers |
| `text-label-md` | 14px / 20px / 500 | `Geist Sans` (`font-sans`) | Primary button labels, active tab triggers | Body copy |
| `text-label-sm` | 12px / 16px / 500 | `Geist Sans` (`font-sans`) | Secondary buttons, filter chips, badge labels | Big headlines |
| `text-caption` | 11px / 15px / 400 | `Geist Sans` (`font-sans`) | Context labels, table header titles, timestamps | Primary reading text |
| `tabular-nums` | Inherited / Mono figures | Any numerical context | **Mandatory** for all costs, quantities, % | Pure text strings |

---

## 6. Phase 2: App Shell & Navigation Redesign

### The Dual-Mode Sidebar (`src/components/layout/Sidebar.tsx`)
Replace the static 60px rail with an intelligent adaptive sidebar:

```
Collapsed Rail (64px)                 Expanded Sidebar (256px)
┌──────────────┐                      ┌──────────────────────────────┐
│ [LogoMark]   │                      │ [LogoMark]  BOM SYNC v2.4    │
├──────────────┤                      ├──────────────────────────────┤
│  (Gauge)     │                      │ Command Center               │
│  (Layers)    │                      │                              │
│  ───────     │                      │ ▼ BILLS OF MATERIALS         │
│  (GitBranch) │                      │   • Engineering BOM (EBOM)   │
│  (Factory)   │                      │   • Manufacturing BOM (MBOM) │
│  (Wrench)    │                      │   • Service BOM              │
│  (Shield)    │                      │   • Software BOM (SBOM)      │
│  ───────     │                      │                              │
│  (FileEdit)  │                      │ ▼ LIFECYCLE & TRACEABILITY   │
│  (GitCompare)│                      │   • Engineering Changes      │
│  (Boxes)     │                      │   • BOM Compare              │
│  (Truck)     │                      │   • Part Master              │
│  (Alert)     │                      │   • Supplier Intelligence    │
│  (Chart)     │                      │   • Field Quality & Warranty │
├──────────────┤                      │   • Reports & Compliance     │
│ [Tree Hub]   │                      ├──────────────────────────────┤
│ [Expand >>]  │                      │ [Tree Hub Drawer]            │
│ [Theme]      │                      │ [Theme Toggle]  [<< Collapse]│
└──────────────┘                      └──────────────────────────────┘
```

#### Exact Implementation Details:
1. **Collapsed Mode (`w-16` / 64px)**:
   - Icon items are rendered as 36px circular buttons (`h-9 w-9 rounded-full bg-action`).
   - Active item: High-contrast white background with black icon (`bg-action-primary text-icon-on-color`).
   - **Debounced Hover Flyout (`GroupFlyout`)**: Hovering an icon opens a fixed panel anchored `fixed left-16 z-50 ml-1 w-56 rounded-xl border border-muted bg-container p-1.5 shadow-2xl`. A 120ms timeout prevents the menu from vanishing as the cursor moves from the rail to the flyout.
2. **Expanded Mode (`w-64` / 256px)**:
   - Displays full route titles grouped under uppercase section headers:
     - `EXECUTIVE`: Command Center
     - `BILLS OF MATERIALS`: Variants & Config, EBOM, MBOM, Service BOM, Software BOM
     - `GOVERNANCE & TRACEABILITY`: Change Management (ECN), BOM Compare, Part Master, Supplier Intelligence, Field Quality, Reports
   - Automatic route expansion: The section containing the active pathname is open on load.
3. **Mobile Behavior (`< md`)**:
   - The rail collapses to a hamburger trigger in `TopNav`. Clicking opens the sidebar as an off-canvas drawer with backdrop blur.

---

## 7. Phase 3: Header System (TopNav & PipelineBar)

### TopNav (`src/components/layout/TopNav.tsx`)
Restructure from a cramped 44px bar to an **80px Executive Command Bar**:
- **Left**: Wayam AI Brand Logo $\rightarrow$ hairline vertical divider (`h-5 w-px bg-muted`) $\rightarrow$ Active Vehicle Program Dropdown $\rightarrow$ Breadcrumb trail.
- **Center**: Universal Search input trigger (`min-w-[240px] h-8 rounded-lg border border-muted bg-action px-3 py-1.5`) with `<kbd className="text-caption">Ctrl K</kbd>`.
- **Right (Ambient Program Telemetry)**:
  - **Days to SOP**: e.g. `142d to SOP` (Caption label + body value)
  - **Build Progress**: e.g. `48 Units Built`
  - **Sync Freshness**: e.g. `Synced 3m ago`
  - Hairline divider $\rightarrow$ Notification Bell Popover $\rightarrow$ Theme Toggle $\rightarrow$ User Avatar (`h-9 w-9 rounded-full`).

### PipelineBar (`src/components/layout/PipelineBar.tsx`)
Retain as a dedicated 36px lifecycle bar directly below `TopNav`, but upgrade to an **Interactive Lifecycle Audit Bar**:
- Nodes: `Variants (CAT)` $\rightarrow$ `Engineering (EBOM)` $\rightarrow$ `Manufacturing (MBOM)` $\rightarrow$ `Software (SBOM)` $\rightarrow$ `Service (BOM)`.
- Connecting chevron arrows between stages.
- Each node shows:
  - Small health indicator dot (Green = synchronized, Amber = drift detected, Red = blocked)
  - Stage title
  - Component count in tabular numerals
- **Interaction**: Clicking any stage navigates directly to that BOM module. Hovering reveals a tooltip detailing synchronization status with upstream CAD and downstream MES.

---

## 8. Phase 4: Reusable Table System (`EnterpriseTable<T>`)

### Component Architecture (`src/components/tables/enterprise-table.tsx`)
Build the cornerstone component inspired by Tasara's `EnterpriseTable`:

```tsx
export interface TableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  width?: string; // Tailwind class, e.g. "w-36"
  align?: "left" | "right" | "center";
}

export interface EnterpriseTableProps<T> {
  rows: T[];
  columns: TableColumn<T>[];
  rowKey: (row: T) => string;
  renderExpanded?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  initialExpanded?: string[];
  emptyMessage?: string;
  minWidth?: string; // default "min-w-[1000px]"
  className?: string;
}
```

### Table Feature Contracts
1. **Client-Side Generic Sorting**:
   - State: `sort: { id: string, dir: "asc" | "desc" } | null`
   - Numeric sorting: `sortValue(a) - sortValue(b)`
   - String sorting: `String(sortValue(a)).localeCompare(String(sortValue(b)))`
   - Header shows `chevronUp` (asc), `chevronDown` (desc), or neutral `sort` glyph on hover.
2. **Inline Row Expansion (`renderExpanded`)**:
   - An expander column (`w-9 px-2 py-2`) houses a clean chevron toggle.
   - Clicking expands a full-width container `<td colSpan={colSpan} className="bg-page px-4 py-4">`.
   - Contrasting background: Parent table sits on `--surface-container` (`#070a0f`); child expansion sits on `--surface-page` (`#000000`) or `--surface-raised` (`#0f151f`), creating distinct visual depth.
3. **Typography & Alignment Discipline**:
   - Headers: `h-9 text-caption font-medium uppercase tracking-wider text-quaternary border-b border-muted`
   - Data rows: `h-11 text-body-sm text-primary border-b border-muted transition-colors hover:bg-raised`
   - Numeric cells: Right-aligned with `tabular-nums`
   - Active open row: `bg-raised`
4. **Scroll & Overflow Safety**:
   - Wrapped in `<div className="overflow-x-auto rounded-xl border border-muted bg-container scrollbar-thin">`
   - Enforces `minWidth="min-w-[1000px]"` so columns never collide or truncate on tablets.

### Existing BOM Sync Tables Migration Inventory

| Page | Current Implementation | New `EnterpriseTable` Columns | Expandable Row Feature (`renderExpanded`) |
|---|---|---|---|
| **EBOM (`/ebom`)** | Raw `<table>`, `Math.random()` keys, no sorting | Status Dot, Part Number, Name, Type, Rev, Qty, Cost, Supplier, Lifecycle | Child components list + Where-used parent assemblies + Serviceable badge |
| **Changes (`/changes`)** | Raw `<table>`, no sorting | ECN ID, Title, State, Priority, Reason, Cost Impact, Affected VINs, Raised Date | Affected parts pill row + State progression stepper + CCB approver |
| **Part Master (`/parts`)** | Raw `<table>`, no sorting | Part Number, Name, Program, Type, Rev, Lifecycle, Owner, Supplier, Cost, Lead Time | Direct child parts breakdown + Where-used parents + Associated ECN list |
| **Compare (`/compare`)** | 3 static cards + raw unrouted table | Part Number, Assembly Name, CAD Design Rev, MBOM Plant Station, Status, Actions | Reconciliation gap diagnosis: ECN cause, work instruction gap, resolve CTA |
| **Suppliers (`/suppliers`)** | Raw `<table>`, no sorting | Supplier Name, Country/Region, Tier, Active Parts, Single Source, Geo Risk, On-Time %, Defect PPM, Risk Score | Single-source parts list provided by this supplier + Contingency dual-source status |

---

## 9. Phase 5: Dashboard Cockpit Redesign (`/`)

### Layout Blueprint (Eliminating Card Overload)
Replace the 9 crammed containers with **3 disciplined visual tiers**:

```
Tier 1: Executive Program Status Strip (Single Container, 4 Metrics)
┌─────────────────────────────────────────────────────────────────────────┐
│ Active: AURA EV (2026) · Stage: Pre-Production · SOP: 142 Days · 48 Built│
└─────────────────────────────────────────────────────────────────────────┘

Tier 2: Governed BOM KPI Row (4 Cards)
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ EBOM Maturity│ │MBOM Readiness│ │ Supply Risk  │ │ Cyber SBOM   │
│ 84%          │ │ 72%          │ │ 18% Single   │ │ 0 Critical   │
│ +3% vs Target│ │ -6% vs Target│ │ 4 Watchlist  │ │ 14 Clean     │
│ High Conf    │ │ Mod Conf     │ │ High Conf    │ │ High Conf    │
│ [4 Sources]  │ │ [2 Sources]  │ │ [6 Sources]  │ │ [1 Source]   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

Tier 3: Master Operational Split (2 Columns)
┌──────────────────────────────────────┬──────────────────────────────────┐
│ Left (8 Cols): Reconciliation Table  │ Right (4 Cols): Priority Actions │
│ • Mapped EBOM <-> MBOM Assemblies   │ • ECN Approval Queue (Top 3)     │
│ • Unrouted Assemblies (Exceptions)   │ • AI Engineering Strategy        │
│ • Monochromatic Velocity Chart       │ • Cybersecurity Feed             │
└──────────────────────────────────────┴──────────────────────────────────┘
```

#### Core Improvements:
- **No nested cards**: All sub-panels sit on `--surface-container` with subtle hairline borders.
- **Governed `BOMKpiCard`**: Each KPI includes metric label, Michroma value, variance indicator, confidence score, and trigger to open the provenance drawer.
- **Monochromatic Recharts**: Replace garish red/green bars in `ChangeVelocityChart` with single-hue neutral bars (`#94a3b8`) and a solid line for velocity, reserving red/green strictly for threshold lines.

---

## 10. Phase 6: Subpage Modernization Sequence

### Priority 1: Engineering BOM (`/ebom`)
- **Keep Existing Tabs**: `Tree View`, `Table View`, `Graph View`.
- **Table View**: Upgrade to `EnterpriseTable<EbomNode>`. Clicking expander opens the child component hierarchy.
- **Graph View**: Preserve `@xyflow/react` graph intact, styling node containers with `--surface-container` and hairline borders.

### Priority 2: Change Management (`/changes`)
- **ECN List**: Sortable `EnterpriseTable<ECN>` (sortable by Cost Delta, Priority, Raised Date).
- **ECN Detail (`/changes/[id]`)**:
  - Top: Clean 4-step horizontal stepper (`Draft` $\rightarrow$ `In Review` $\rightarrow$ `Approved` $\rightarrow$ `Released`).
  - Middle: 2-column split (Change facts on left, "Change Blast Radius" analysis on right).
  - Bottom: Affected parts table using `EnterpriseTable`.

### Priority 3: BOM Compare (`/compare`)
- **Variant Comparison**: A vs. B diff with clear visual separation (Only in A, Common In Both, Only in B).
- **EBOM vs. MBOM Reconciliation**: Move from plain text cards to a formal **Reconciliation Table**:
  - Filter pills: `All (18)`, `Mapped (14)`, `Unrouted (3)`, `Phantoms (1)`.
  - Columns: Part Number, Assembly Name, EBOM Status, MBOM Station, Root Cause, Action.

### Priority 4: Part Master (`/parts`)
- **List View**: `EnterpriseTable<Part>` with category filters (`All`, `Vehicle`, `System`, `Assembly`, `ECU`, `Component`).
- **Detail View (`/parts/[pn]`)**:
  - Left: Part specifications, cost roll-up, lifecycle stage.
  - Right: Supplier card with geo-risk indicator, Where-used parent assemblies list, and uses child parts list.

### Priority 5: Supplier Intelligence (`/suppliers`)
- **Table**: `EnterpriseTable<Supplier>` with single-source badges and risk scores.
- **Expandable row**: Direct list of parts sourced exclusively from that supplier.

### Priority 6: Remaining Pages (Variants, MBOM, Service, Software, Field, Reports)
- Apply standardized `PageHeader` (required title + required description).
- Replace ad-hoc borders and cards with `--surface-container` and `rounded-xl`.
- Convert data lists to `EnterpriseTable`.

---

## 11. Phase 7: Modals, Drawers & Detail Views

### Provenance & Audit Drawer (`src/components/reconciliation/provenance-drawer.tsx`)
Build a reusable slide-out drawer inspired by Tasara's `EvidenceDrawer`:
- **Placement**: Fixed right slide-out (`w-[380px] h-full border-l border-muted bg-container z-50`).
- **Trigger**: Clickable button on any KPI card, part record, or ECN item stating `Provenance · N sources`.
- **Content**:
  - Source PLM/CAD system (e.g. `Siemens Teamcenter v14.2`)
  - Timestamp of last sync
  - Authoritative engineering owner
  - Quality/Validation confidence score
  - Audit trail of recent revisions

### Command Palette (`src/components/layout/command-palette.tsx`)
- Keyboard-first search modal triggered by `Ctrl+K`.
- Searches parts, ECNs, vehicle programs, and suppliers with immediate keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`).

---

## 12. Phase 8: Icon Architecture Plan

### Centralized Registry (`src/lib/icons.ts`)
To eliminate dependency churn, **we will NOT install Tabler Icons**. We will wrap existing `lucide-react` icons in a centralized semantic registry:

```tsx
import {
  Gauge, GitBranch, Factory, Wrench, ShieldAlert, FileEdit,
  GitCompare, Boxes, Truck, AlertOctagon, FileBarChart, Layers,
  Search, Plus, Check, X, ChevronRight, ChevronDown, ChevronUp,
  AlertTriangle, Info, Clock, Pin, Download, type LucideIcon
} from "lucide-react";

export const icons = {
  dashboard: Gauge,
  variants: Layers,
  ebom: GitBranch,
  mbom: Factory,
  service: Wrench,
  software: ShieldAlert,
  changes: FileEdit,
  compare: GitCompare,
  parts: Boxes,
  suppliers: Truck,
  field: AlertOctagon,
  reports: FileBarChart,
  search: Search,
  add: Plus,
  check: Check,
  close: X,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  warning: AlertTriangle,
  info: Info,
  clock: Clock,
  pin: Pin,
  download: Download,
} as const;

export type IconName = keyof typeof icons;
```

### Unified `AppIcon` (`src/components/ui/app-icon.tsx`)
- Standardized stroke width locked at `strokeWidth={1.75}`.
- Standardized size scale:
  - `xs`: 12px
  - `sm`: 14px
  - `md`: 16px
  - `lg`: 18px
  - `xl`: 20px
  - `2xl`: 24px

---

## 13. Phase 9: Responsive Design Strategy

### Breakpoint Matrix

| Viewport | Width | Navigation Treatment | Layout Behavior | Table Strategy |
|---|---|---|---|---|
| **Desktop Ultra** | `1920 × 1080` | Expanded Sidebar (256px) | Max-width 1800px, 3-column dashboard | Full width, expanded columns |
| **Desktop Standard** | `1440 × 900` | Expanded Sidebar (256px) | 12-column HUD grid, generous spacing | Standard `min-w-[1000px]` with internal scroll |
| **Laptop / Small Desktop** | `1024 × 768` | Collapsed Rail (64px) + Hover Flyouts | TopNav ambient stats collapse to compact icons | Internal horizontal scrollbar |
| **Tablet** | `768 × 1024` | Collapsed Rail (64px) | Single-column stack for dashboard cards | Internal horizontal scrollbar |
| **Mobile** | `390 × 844` | Off-canvas Drawer via TopNav hamburger | Single-column cards, drawer slide-overs full width | Touch-scrollable table cards |

### Golden Responsive Rule
**Zero page-level horizontal overflow**. The outer viewport (`html, body`) has `overflow-x: hidden`. Tables, code blocks, and wide matrixes scroll strictly within their own rounded containers using thin custom scrollbars.

---

## 14. Anti-AI-Slop Governance Rules

To ensure BOM Sync looks like an authoritative, precision-engineered industrial tool rather than generic AI boilerplate, every component must pass these rules:

1. **NO Decorative Gradient Meshes**: Backgrounds must be solid, controlled dark neutrals (`#000000`, `#070a0f`, `#0f151f`). No purple/blue neon gradients.
2. **NO Glowing Shadows**: Remove `shadow-glow`, `shadow-glow-danger`, `shadow-glow-success`. Shadows are flat and functional (`shadow-card`, `shadow-elevated`).
3. **NO Micro-Border Overload**: Stop putting 1px borders on every word. A card contains a section; items inside use clean whitespace and layout hierarchy.
4. **NO Arbitrary Font Sizing**: Eliminate `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`. Strictly use the standardized typographic scale (`caption`, `body-sm`, `label-sm`, etc.).
5. **NO Meaningless AI Visualizations**: No animated pulsing radar circles or fake "AI Confidence Waves". AI suggestions are presented as structured engineering cards with confidence bands.
6. **NO Christmas-Tree Tables**: Tables must never look like a wall of bright colored pills. Colored text is used for data reading; solid pills are reserved for critical exceptions.

---

## 15. Shared Component Architecture

```
src/
├── components/
│   ├── ui/
│   │   ├── app-icon.tsx          # Centralized Lucide wrapper (stroke 1.75)
│   │   ├── icon-button.tsx       # 36px circular button (ghost/subtle/inverse)
│   │   ├── page-header.tsx       # Standardized page title + purpose description
│   │   ├── status-badge.tsx      # 6-tone WCAG AA status pill
│   │   ├── select-menu.tsx       # Pill-triggered tokenized listbox
│   │   └── toast.tsx             # Severity-governed toast queue
│   ├── tables/
│   │   ├── enterprise-table.tsx  # Generic sortable table with row expansion
│   │   └── table-pagination.tsx  # Clean density controls
│   ├── layout/
│   │   ├── AppShell.tsx          # Master viewport layout
│   │   ├── TopNav.tsx            # 80px ambient command header
│   │   ├── Sidebar.tsx           # Dual-mode (64px rail <-> 256px accordion)
│   │   └── PipelineBar.tsx       # Interactive lifecycle audit bar
│   ├── reconciliation/
│   │   ├── provenance-drawer.tsx # Slide-out audit & evidence drawer
│   │   ├── confidence-indicator.tsx # High/Moderate/Low confidence badge
│   │   └── cause-panel.tsx       # Root cause decision callout
│   └── dashboard/
│       ├── bom-kpi-card.tsx      # Governed metric card with variance & drawer
│       └── velocity-chart.tsx    # Monochromatic trend chart
```

---

## 16. Exact Files to Modify & Create

### New Files to Create:
1. `src/lib/icons.ts` (Centralized Lucide icon registry)
2. `src/components/ui/app-icon.tsx` (Standardized icon component)
3. `src/components/ui/status-badge.tsx` (6-state WCAG status pill)
4. `src/components/tables/enterprise-table.tsx` (Generic enterprise data table)
5. `src/components/reconciliation/provenance-drawer.tsx` (Slide-out audit drawer)
6. `src/components/reconciliation/confidence-indicator.tsx` (Confidence band component)
7. `src/components/dashboard/bom-kpi-card.tsx` (Governed KPI metric card)

### Existing Files to Modify:
1. `src/index.css` (Implement 3-tier token architecture & semantic variables)
2. `tailwind.config.ts` (Map semantic tokens, radii, and fonts)
3. `app/layout.tsx` (Load Michroma & Geist Sans fonts via `next/font`)
4. `src/components/layout/AppShell.tsx` (Viewport padding & layout adjustments)
5. `src/components/layout/Sidebar.tsx` (Dual-mode 64px rail / 256px accordion)
6. `src/components/layout/TopNav.tsx` (80px header with ambient program context)
7. `src/components/layout/PipelineBar.tsx` (Interactive lifecycle flow nodes)
8. `src/components/layout/PageHeader.tsx` (Standardize title + mandatory description)
9. `app/(app)/page.tsx` (Dashboard cockpit streamlining)
10. `app/(app)/ebom/page.tsx` (Modernize EBOM table & expandable children)
11. `app/(app)/changes/page.tsx` (Sortable ECN table & change blast radius)
12. `app/(app)/compare/page.tsx` (Flagship BOM reconciliation engine)
13. `app/(app)/parts/page.tsx` (Modernize Part Master table)
14. `app/(app)/suppliers/page.tsx` (Supply chain risk table & single-source drawer)
15. `app/(app)/variants/page.tsx` (Effectivity matrix visual polish)
16. `app/(app)/mbom/page.tsx` (Plant routing table standardization)
17. `app/(app)/service/page.tsx` (Service kits table polish)
18. `app/(app)/software/page.tsx` (SBOM ECU package table polish)
19. `app/(app)/field/page.tsx` (Field warranty stream polish)
20. `app/(app)/reports/page.tsx` (Compliance export table polish)

---

## 17. Phased Implementation Sequence

```
┌────────────────────────────────────────────────────────────┐
│ PHASE 1: Design Tokens & Typography                        │
│ • src/index.css, tailwind.config.ts, app/layout.tsx        │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ PHASE 2: Shared UI Primitives                              │
│ • src/lib/icons.ts, app-icon.tsx, status-badge.tsx         │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ PHASE 3: AppShell & Adaptive Navigation                    │
│ • Sidebar.tsx (dual-mode), AppShell.tsx                    │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ PHASE 4: Ambient Header & Pipeline                         │
│ • TopNav.tsx (80px), PipelineBar.tsx, PageHeader.tsx       │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ PHASE 5: Enterprise Table Foundation                       │
│ • src/components/tables/enterprise-table.tsx               │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ PHASE 6: Flagship Data Tables Modernization                │
│ • EBOM (/ebom), Changes (/changes), Parts (/parts),        │
│   Suppliers (/suppliers), Compare (/compare)               │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ PHASE 7: Dashboard Cockpit Streamlining                    │
│ • app/(app)/page.tsx, bom-kpi-card.tsx                     │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ PHASE 8: Provenance Drawer & Modals                        │
│ • provenance-drawer.tsx, command-palette.tsx               │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ PHASE 9: Secondary Subpages Modernization                  │
│ • Variants, MBOM, Service, Software, Field, Reports        │
└─────────────────────────────┬──────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ PHASE 10: Responsive QA & Cross-Browser Validation         │
│ • 1440px, 1024px, 768px, 390px viewport verification       │
└────────────────────────────────────────────────────────────┘
```

---

## 18. Validation Strategy

For each phase, the following verification gates must pass before proceeding:

1. **TypeScript Compilation**: `npx tsc --noEmit` must return code 0 with zero errors.
2. **Automated Smoke Tests**: `npm test` runs `src/tests/smoke.test.tsx` verifying that all 14 routes mount cleanly without throwing exceptions.
3. **Production Build**: `npm run build` must complete successfully.
4. **Visual Regression Verification**: Inspect pages at desktop (1440px), laptop (1024px), tablet (768px), and mobile (390px) to confirm zero horizontal overflow and flawless typographic alignment.
5. **Rollback Safety**: Every phase is committed as an atomic Git change, allowing instantaneous rollback if any regression occurs.

---

## 19. Technical Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|
| **Next.js 14 Font Loading Failure** | Low | Medium | Use `next/font/google` with `display: "swap"`. Provide fallback system font stack (`-apple-system, Segoe UI, Roboto`) in CSS variables to ensure zero FOIT (flash of invisible text). |
| **Tailwind v3 Configuration Mismatch** | Medium | Medium | Do not attempt to use Tailwind v4 `@theme` syntax in BOM Sync. Define variables in standard CSS `:root` and map them via `theme.extend.colors` in `tailwind.config.ts`. |
| **Radix UI Accessibility Breakage** | Low | High | Do not replace Radix primitives (`@radix-ui/react-select`, `@radix-ui/react-dialog`) with custom unverified HTML. Style Radix components using the new token classes. |
| **Table Horizontal Truncation on Mobile** | High | Medium | Enforce `min-w-[1000px]` wrapped in `overflow-x-auto` on all tables, paired with custom thin scrollbars. Never allow table cells to wrap awkwardly or clip. |

---

## 20. Future Product & UX Opportunities (Automotive X-Factor)

While we are not modifying business logic during this UI overhaul, the following **domain differentiation opportunities** should be prioritized for future releases:

1. **Multi-BOM Reconciliation Engine (EBOM $\leftrightarrow$ MBOM $\leftrightarrow$ SBOM)**:
   - Automated cross-system reconciliation highlighting which CAD assemblies lack factory routing in SAP MES.
   - Primary cause attribution linking discrepancies to pending ECNs.
2. **Change Order "Blast Radius" Analyzer**:
   - Visualizing the cascading ripple effect of an engineering change: unit cost $\times$ program volume, affected variants, and field VIN warranty risk.
3. **Hardware-Software Cybersecurity Fusion**:
   - Correlating open CVEs directly with affected vehicle ECUs in the Part Master and EBOM tree.
4. **Supplier Geopolitical Risk Exposure**:
   - Interactive vulnerability scoring for single-source parts tied to specific geopolitical regions.

---

## 21. Decisions Requiring Immediate Approval

Before commencing code implementation in Phase 1, the user/manager should review and approve:

1. **Font Strategy**: Approval of **Michroma** (for high-impact metric anchors and page titles) and **Geist Sans** (for functional UI, labels, and tabular numbers) loaded via `next/font`.
2. **Icon Library**: Approval to retain **Lucide** (wrapped in a centralized `AppIcon` registry with locked `1.75` stroke width) rather than introducing Tabler Icons.
3. **Sidebar Default Mode**: Confirmation that desktop users should see the **collapsed 64px rail by default** (with hover-flyout sub-menus), expandable to 256px on demand.
4. **Phased Execution Order**: Confirmation to proceed sequentially starting with **Phase 1 (Tokens & Typography)** through **Phase 10 (Responsive QA)**.

