# TASARA UI DEEP ANALYSIS & BOM SYNC UI/UX RECONCILIATION

> **Executive Note**: This document is an **investigatory, evidence-based architectural study** comparing the reference application **IMCC-TASARA** (`D:\projects\IMCC-TASARA-main`) with the active product **BOM Synchronization** (`D:\projects\BOM_synchronization-main`). No code has been modified, no dependencies installed or removed, and no domain business logic altered.

---

## 1. Executive Summary

The manager's feedback on BOM Sync is clear and urgent: the current interface appears **too generic and AI-generated**. While the application contains rich domain data (EBOM, MBOM, SBOM, Service BOM, ECNs, Variants, Suppliers, Field Quality), the visual presentation suffers from common AI-boilerplate symptoms:
- Card-in-card nesting overload and lack of negative space
- Random typography scales without a clear display vs. functional hierarchy
- Inconsistent micro-radii (`rounded-sm` / 2px–4px) paired with heavy borders and dark container stacking
- Static, un-sortable raw HTML tables without pagination, density control, or expandable diagnostic drill-downs
- Absence of governed KPI definitions (numbers without provenance, variance against tolerance, or confidence bands)
- A rigid 60px icon rail navigation that vanishes on smaller screens and cannot be expanded to show labeled hierarchies

By contrast, **IMCC-Tasara** (`fleet-dashboard`) achieves an exceptional, production-grade visual polish not through heavy third-party UI component libraries, but through **disciplined design engineering**:
1. **A Strict 3-Tier Design Token Architecture**: Raw reference tokens (`--ref-gray-*`) $\rightarrow$ Semantic intent tokens (`--surface-container`, `--text-primary`, `--stroke-muted`) $\rightarrow$ Component CSS.
2. **Dual-Font Typography System**: A bold, engineered geometric display font (**Michroma**) for high-impact metric anchors, paired with a pristine, variable sans-serif (**Geist Sans**) for functional labels, body copy, and tabular numbers.
3. **Restrained Near-Monochrome Canvas (85–90% neutral darks)**: Color is strictly reserved for actionable state (critical, warning, success, info, pending, neutral). Charts use a single sequential lightness ramp rather than categorical multi-hue rainbows.
4. **Governed Metrics with "Proof of Work"**: Every KPI card and reconciliation record answers four mandatory questions:
   - *What is this figure?* (Governed metric definition)
   - *How does it compare to expectation?* (Variance vs. tolerance)
   - *How confident are we?* (Confidence indicator with semantic bands)
   - *Where did it come from?* (Interactive Evidence Drawer showing source system, timestamp, and version)
5. **The Enterprise Table Standard**: A clean, reusable, generic table abstraction (`EnterpriseTable<T>`) featuring built-in client-side type-safe sorting, row click drill-downs, and inline expandable inspection panels (`renderExpanded`) with contrasting surface backgrounds.
6. **Dual-State Adaptive Navigation**: An icon rail (64px) that expands into a 256px categorized accordion sidebar with hover-flyout panels when collapsed.

**The Golden Product Rule**: We do **not** clone Tasara's mining domain, haul trucks, blast zones, or geological models. Instead, we adapt Tasara's **architectural rigor, typographic discipline, table foundation, and evidence-driven UX** into the **automotive Bill of Materials (BOM)** domain. In BOM Sync, the core reconciliation is not *plan vs. measured tonnes*, but **Engineering Intent (EBOM) vs. Manufacturing Execution (MBOM) vs. Software Release (SBOM) vs. Service Parts (Service BOM)** across Vehicle Programs, Variants, and Engineering Change Notices (ECNs).

---

## 2. Repository Structure

### Tasara Reference Repository (`D:\projects\IMCC-TASARA-main`)
```
IMCC-TASARA-main/
├── package.json              # Next.js 16.3.1, React 19.2.8, Tailwind 4, Tabler Icons, Recharts 3
├── next.config.ts            # Minimal config
├── postcss.config.mjs        # @tailwindcss/postcss
├── tsconfig.json             # TypeScript 5, path alias @/* -> ./*
├── app/
│   ├── globals.css           # Tailwind 4 @theme inline mappings, display & functional text scales
│   ├── layout.tsx            # Geist + Michroma font loading, ThemeProvider, AppShell, ToastViewport
│   ├── page.tsx              # Root redirect -> /dashboard
│   ├── dashboard/page.tsx    # Shift command center, KPIs, map, action queue, event feed
│   ├── reconciliation/       # Core reconciliation views:
│   │   ├── page.tsx          # Reconciliation hub: PageHeader, KPIs, Flow pipeline, Table
│   │   ├── plan-vs-actual/   # Deep plan-vs-actual drilldown
│   │   ├── exceptions/       # Out-of-tolerance exceptions
│   │   └── coal-quality/     # Quality reconciliation
│   ├── equipment/            # Equipment registry & [id] detail views
│   ├── ai/                   # AI root-cause, recommendations, insights
│   ├── geology/              # Block models, surveys
│   ├── data/                 # Sources, lineage, interfaces, quality
│   └── settings/page.tsx     # Notification, simulation & display preferences
├── components/
│   ├── ui/                   # Primitive tokens: app-icon, icon-button, page-header, select-menu, status-badge, toast
│   ├── tables/
│   │   └── enterprise-table.tsx # THE reusable generic data table component
│   ├── layout/               # app-shell, sidebar, sidebar-item, topbar, breadcrumbs, command-palette, logo-mark
│   ├── imcc/                 # kpi-card, cause-panel, confidence-indicator, evidence-drawer, reconciliation-flow, variance-badge
│   ├── command-center/       # action-queue, context-panel, health-score-card, impact-card, shift-progress-card
│   └── charts/               # chart-primitives (TrendAreaChart, PlanActualChart, LevelLineChart, MagnitudeBarChart, Meter)
├── lib/
│   ├── icons.ts              # Centralized Tabler icon registry with semantic concepts
│   ├── charts/chart-theme.ts # Tokenized monochromatic chart theme engine
│   ├── models/               # Data contracts: reconciliation, variance, evidence, cause, confidence, entity, event
│   └── mock/                 # Governed mock datasets
└── styles/
    └── tokens.css            # 398 lines of reference & semantic CSS variables (dark default + light override)
```

### BOM Sync Product Repository (`D:\projects\BOM_synchronization-main`)
```
BOM_synchronization-main/
├── package.json              # Next.js 14.2.35, React 18.3.1, Tailwind 3.4.17, Radix UI suite, Lucide, Recharts 2.15
├── tailwind.config.ts        # Tailwind 3 configuration with shadcn HSL variable mappings
├── postcss.config.js         # PostCSS 8 + Autoprefixer
├── components.json           # shadcn-ui configuration (New York style, slate base)
├── app/
│   ├── layout.tsx            # Global HTML wrapper, index.css, Providers
│   ├── providers.tsx         # NextThemesProvider + React Query client
│   ├── login/page.tsx        # Authentication screen
│   └── (app)/                # Authenticated application route group:
│       ├── layout.tsx        # Injects AppShell
│       ├── page.tsx          # Command Center Dashboard (HUD, HealthArc, SystemHealthMatrix, AI Briefing)
│       ├── variants/page.tsx # Variants & Configuration (CAT BOM, Effectivity Matrix)
│       ├── ebom/page.tsx     # Engineering BOM (Tree view, raw Table view, ReactFlow GraphView)
│       ├── mbom/page.tsx     # Manufacturing BOM (Plant routings, line operations)
│       ├── service/page.tsx  # Service BOM (FRUs, Maintenance Kits)
│       ├── software/page.tsx # Software BOM / SBOM (ECUs, CVEs, Licenses)
│       ├── changes/          # Engineering Changes (ECN list & [id] detail views, state stepper)
│       ├── compare/page.tsx  # BOM Compare (Variant A vs B, EBOM vs MBOM reconciliation)
│       ├── parts/            # Part Master (Canonical registry & [pn] detail views)
│       ├── suppliers/page.tsx# Supplier Intelligence & Geo-risk scoring
│       ├── field/page.tsx    # Field Quality & Warranty telemetry
│       └── reports/page.tsx  # Compliance & Export reports
└── src/
    ├── index.css             # Hybrid CSS: shadcn HSL variables + partial tier 1/2 BOM tokens
    ├── context/
    │   └── ProgramContext.tsx# Active vehicle program state (Aura EV, Apex GT, Atlas Cargo, Rover EV)
    ├── components/
    │   ├── layout/           # AppShell, TopNav, PipelineBar, Sidebar, PageHeader
    │   ├── dashboard/        # HealthArc, SystemHealthMatrix, ActivityFeed, CveHeatmap, DistributionDonut
    │   └── ui/               # 40+ uncustomized shadcn Radix wrappers
    └── lib/
        ├── mockData.ts       # Comprehensive automotive mock dataset (2400+ lines of vehicles, parts, ECNs, routings)
        └── utils.ts          # clsx + tailwind-merge helper
```

---

## 3. Tasara Tech Stack

| Layer | Tasara Implementation | Version / Details | Architectural Rationale |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `16.3.1` | Modern server/client component separation; zero client routing overhead. |
| **Runtime / Library** | React | `19.2.8` | React 19 concurrent features, native hooks. |
| **Language** | TypeScript | `^5.0.0` | Strict typing across data models and generic components (`EnterpriseTable<T>`). |
| **CSS Engine** | Tailwind CSS v4 | `^4.0.0` with `@tailwindcss/postcss` | Tailwind v4 `@theme inline` block in `globals.css`; no `tailwind.config.js` required. |
| **Theme System** | `next-themes` | `^0.4.6` | Dark-first root class toggle (`.dark` on `<html>`). |
| **Iconography** | `@tabler/icons-react` | `^3.46.0` | 80+ semantic icons wrapped behind a single `AppIcon` abstraction. |
| **Charting** | `recharts` | `^3.10.1` | Custom SVG charts styled strictly via CSS custom properties. |
| **Geospatial / Map** | `maplibre-gl` | `^5.24.0` | High-performance vector map rendering for open-pit operations. |
| **Design System** | Handcrafted Token Architecture | Custom `tokens.css` | Zero third-party UI suite dependencies (no shadcn, no Radix primitives). |

---

## 4. Library Comparison & Migration Strategy

| Library | In Tasara? | In BOM Sync? | Purpose in Tasara | Purpose in BOM Sync | Decision / Recommendation |
|---|---|---|---|---|---|
| **Next.js** | 16.3.1 | 14.2.35 | App framework | App framework | **Keep BOM Sync on 14.x**. Do not upgrade framework during UI redesign. |
| **React** | 19.2.8 | 18.3.1 | UI library | UI library | **Keep React 18**. Maintain existing hooks and state libraries. |
| **Tailwind CSS** | v4 (@tailwindcss/postcss) | v3.4.17 (tailwind.config.ts) | Styling engine | Styling engine | **Keep Tailwind v3 in BOM Sync**. Map Tasara's token system directly into Tailwind v3 `extend.colors` and CSS variables. |
| **@tabler/icons-react** | Yes (^3.46.0) | No | Unified icon set | Not present | **Do not replace Lucide**. Lucide is already installed in BOM Sync (`0.462.0`). Wrap Lucide in a centralized `AppIcon` registry matching Tasara's pattern. |
| **lucide-react** | No | Yes (0.462.0) | — | Current icons | **Keep and centralize**. Create `src/lib/icons.ts` to export semantic icon names mapped to Lucide icons. |
| **@radix-ui/\*** | No | Yes (full suite) | Not needed | Powers shadcn-ui | **Retain for accessibility**, but restyle all primitives to match Tasara surface/border/radius tokens. |
| **recharts** | Yes (3.10.1) | Yes (2.15.0) | Trend & plan vs actual | Velocity & drift | **Keep Recharts 2.15**. Adopt Tasara's monochromatic `chart-theme.ts` and `chart-primitives.tsx`. |
| **maplibre-gl** | Yes (5.24.0) | No | Mine surface map | Not needed | **DO NOT ADD**. Automotive BOM sync has zero use for open-pit mining GIS maps. |
| **@xyflow/react** | No | Yes (12.10.2) | — | Interactive EBOM node graph | **Keep & protect**. Core BOM engineering dependency. |
| **cmdk** | No | Yes (1.1.1) | Handcrafted palette | Used in Command palette | **Keep cmdk** or adopt Tasara's lightweight keyboard palette. |

---

## 5. Tasara Design System Architecture

Tasara's visual cohesion stems from a strict **Three-Tier Token Architecture** implemented in `styles/tokens.css` and `app/globals.css`:

```
Tier 1: REFERENCE TOKENS (Raw Palette)
  --ref-gray-950: #101010
  --ref-gray-900: #191919
  --ref-gray-50:  #fafafa
  --ref-red-600:  #dc2626
  --ref-green-600:#16a34a
       │
       ▼
Tier 2: SEMANTIC TOKENS (Intent & Roles)
  --surface-page-background: var(--ref-black)
  --surface-container:       var(--ref-gray-950)
  --surface-raised:          var(--ref-gray-900)
  --text-primary:            var(--ref-gray-50)
  --stroke-default:          rgba(255, 255, 255, 0.14)
  --status-critical:         #dc2626
       │
       ▼
Tier 3: COMPONENT CONSUMPTION (Tailwind Utilities & Components)
  bg-page      -> var(--color-page) -> var(--surface-page-background)
  bg-container -> var(--color-container) -> var(--surface-container)
  text-primary -> var(--color-primary) -> var(--text-primary)
  border-muted -> var(--color-muted) -> var(--stroke-muted)
```

### Key Principles of the Surface Hierarchy
1. **The Dark Canvas**: Page background is true pitch or near-black (`#000000` or `#080a0d`).
2. **Container Level (`--surface-container`)**: Cards, tables, and nav headers sit at step 950 (`#101010`), providing subtle lift above the page.
3. **Raised Level (`--surface-raised`)**: Active table rows, dropdowns, and nested sub-panels sit at step 900 (`#191919`).
4. **Action Level (`--surface-action`)**: Inactive buttons, chips, and table triggers sit at step 900 (`#191919`) or 850 (`#232323`).
5. **Hairline Strokes**: Borders never use bright opaque colors. They use translucent white alphas:
   - `--stroke-muted`: `rgba(255, 255, 255, 0.08)` (hairline grid dividers)
   - `--stroke-default`: `rgba(255, 255, 255, 0.14)` (card & table perimeters)
   - `--stroke-active`: `rgba(255, 255, 255, 0.24)` (active focus & selected outlines)

---

## 6. Typography Deep Study

Tasara achieves an unmistakably bespoke look by separating **Display Anchors** from **Functional UI**:

### 1. Display Scale (Engineered Aesthetic — Michroma)
Loaded via `next/font/local` (`public/Michroma/Michroma-Regular.ttf`):
- `--text-display-metric-xl`: 64px / line-height 1.05 / letter-spacing -0.03em
- `--text-display-metric`: 42px / line-height 1.10 / letter-spacing -0.03em
- `--text-display-page`: 34px / line-height 1.12 / letter-spacing -0.03em (Used exclusively in `PageHeader` titles)
- `--text-display-sm`: 18px / line-height 1.25 / letter-spacing -0.01em (Used in `KpiCard` numbers and drawer headers)

*Why it works*: Michroma is an extended, geometric techno-sans inspired by mid-century industrial instrumentation. When used **sparingly** (only for big numeric values and page headers), it immediately anchors the screen and signals an industrial enterprise control center.

### 2. Functional Scale (Precision Legibility — Geist Sans)
Loaded via `next/font/google`:
- `--text-heading-lg`: 24px / 30px / weight 600
- `--text-heading-md`: 18px / 24px / weight 600
- `--text-heading-sm`: 16px / 22px / weight 600
- `--text-body-lg`: 16px / 24px / weight 400 / tracking -0.01em
- `--text-body-md`: 14px / 20px / weight 400 / tracking -0.01em
- `--text-body-sm`: 12px / 16px / weight 400 / tracking -0.01em
- `--text-label-md`: 14px / 20px / weight 500
- `--text-label-sm`: 12px / 16px / weight 500
- `--text-caption`: 12px / 16px / weight 400 (Quaternary context labels)

### 3. Numerical & Tabular Data Rule
All numerical readings in tables, KPIs, and coordinates use `tabular-nums`. This prevents columns from jittering when values update and aligns decimal points cleanly across rows.

### 4. Comparison with BOM Sync's Current State
BOM Sync declares `"Google Sans"` and `"JetBrains Mono"` in `tailwind.config.ts`, but **never loads them** in `app/layout.tsx`. As a result, the browser falls back to generic system sans (`Segoe UI` on Windows), while developers arbitrarily sprinkle `font-mono` and arbitrary sizes (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`) across components.

---

## 7. Color System & WCAG AA Contrast Analysis

Tasara enforces a strict separation between **Inline Reading Values** and **Status Pills**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           COLOR ROLE SEPARATION                          │
├──────────────────────────────────┬──────────────────────────────────────┤
│ READ VALUES (Subtle Inline Text)  │ STATUS PILLS (Loud Discrete State)   │
├──────────────────────────────────┼──────────────────────────────────────┤
│ Applied to metrics, variances,   │ Applied ONLY to <StatusBadge />      │
│ differences, and inline stats.   │ to mark high-priority exceptions.    │
│                                  │                                      │
│ • Success Text: #16a34a (5.84:1) │ • Success Pill: #15803d (step 700)   │
│ • Warning Text: #f59e0b (4.50:1) │ • Warning Pill: #b45309 (step 700)   │
│ • Error Text:   #ef4444 (4.88:1) │ • Critical Pill: #dc2626 (step 600)  │
│                                  │ • Text on Pill: Pure White #ffffff   │
│ Never fills the background!      │ Fills pill background completely.    │
└──────────────────────────────────┴──────────────────────────────────────┘
```

*The Critical Rule Explained*: AI-generated SaaS dashboards put bright red, green, and yellow background pills on *every single table cell and card*. This creates sensory overload. Tasara keeps numbers as **clean colored text with neutral secondary labels** (e.g. `+4.2% vs ±2.0%`), reserving solid background pills strictly for the few rows that represent genuine exceptions.

---

## 8. Spacing & Visual Rhythm

Tasara uses a strict 4px/8px-based spatial scale:
- **Outer Page Padding**: Exactly `p-6` (24px) all around the viewport content container.
- **Header to Content Gap**: `mt-5` (20px) between `PageHeader` and KPI cards.
- **Section Stack Gap**: `mt-4` (16px) or `mt-6` (24px) between major functional zones.
- **KPI Card Grid**: `grid grid-cols-2 gap-3 lg:grid-cols-4` (12px gap).
- **Table Dimensions**:
  - Header row height: `36px` (`px-3 py-2 text-caption`)
  - Body row height: `44px` (`px-3 py-2.5 text-body-sm`)
  - Cell horizontal padding: `px-3` (12px)
  - Expander button: `h-6 w-6` with `AppIcon size="sm"`
- **Card Padding**: Uniform `p-4` (16px).
- **Corner Radii**:
  - Cards & Table containers: `rounded-xl` (12px)
  - Nested callouts & flyout items: `rounded-lg` (8px)
  - Buttons & State Badges: `rounded-full` (9999px)

---

## 9. Navigation System

### Collapsed Rail (`w-16` / 64px)
- Fixed width `w-16 shrink-0 flex flex-col items-center py-4`.
- Items are rendered as circular icon buttons (`h-9 w-9 rounded-full bg-action`).
- **Active state**: High-contrast white fill with black icon (`bg-action-primary text-icon-on-color`).
- **Flyout Navigation (`GroupFlyout`)**: Hovering or focusing an item opens a floating panel anchored `fixed left-16 z-50 ml-1 w-56 rounded-xl border border-muted bg-container p-1.5 shadow-2xl`. A 120ms debounce timer prevents the flyout from closing while the user's cursor crosses the gap.

### Expanded Sidebar (`w-64` / 256px)
- Width is `w-64` (256px) so labels like `"Engineering Changes"` or `"Supplier Intelligence"` fit on one line without truncation.
- Groups render as collapsible accordions (`GroupSection`) with `chevronUp`/`chevronDown`.
- The active route automatically expands its parent group on load.
- Planned/future modules are explicitly styled in a muted tone (`text-quaternary`) rather than hidden or fake.

---

## 10. Header Architecture

Tasara's `Topbar` is an ambient context provider, not just a navigation bar:
- Height: `h-20` (80px), `px-4 bg-page`.
- **Left**: `LogoMark` $\rightarrow$ hairline divider (`h-4 w-px bg-muted`) $\rightarrow$ `Breadcrumbs`.
- **Center**: Keyboard-first search trigger (`min-w-[220px] rounded-lg border border-muted bg-action px-3 py-1.5`) with `<kbd>Ctrl K</kbd>`.
- **Right (Ambient Operational Context)**:
  - Shift Window (e.g. `Shift A · 06:00–14:00`)
  - Operating Date (e.g. `16 Aug 2026`)
  - Last Sync (e.g. `Sync 4m ago`)
  - Vertical divider $\rightarrow$ Notification menu $\rightarrow$ Profile avatar button (`h-9 w-9 rounded-full`).

*Translation to BOM Sync*: BOM Sync's current TopNav is 44px high and cramped with a Program Switcher, Scope Chip, Search, Notifications, ThemeToggle, Export button, and User Avatar. Integrating the active program's lifecycle status into an ambient context strip elevates the header into an executive cockpit.

---

## 11. Table System (Critical Architecture Review)

Tasara's `EnterpriseTable<T>` in `components/tables/enterprise-table.tsx` is the engineering centerpiece:

```tsx
export interface TableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  width?: string;
  align?: "left" | "right";
}
```

### Why the Table Feels Production-Grade:
1. **Generic Type Safety**: Reusable across any data type (`ReconciliationRecord`, `Part`, `ECN`, `Supplier`).
2. **Built-in Sorting**: Clicking a sortable header toggles `asc` $\leftrightarrow$ `desc` with `chevronUp`/`chevronDown` icons. Numbers sort numerically (`a - b`), strings sort alphabetically (`localeCompare`).
3. **Expandable Row Architecture (`renderExpanded`)**:
   - An expander column (`w-9 px-2 py-2`) houses a clean chevron button.
   - Expanding a row opens a full-width container `<td colSpan={colSpan} className="bg-page px-4 py-4">`.
   - **Contrasting Background**: The main table sits on `--surface-container` (`#101010`), while the expanded drawer sits on `--surface-page-background` (`#000000`) or `--surface-raised` (`#191919`). This creates immediate visual separation between parent record and child breakdown.
4. **Clean Row States**:
   - Inactive row: `border-b border-muted`
   - Hover row: `hover:bg-raised`
   - Active/Open row: `bg-raised`
5. **Right-Alignment for Numbers**: All monetary, quantitative, and percentage columns are explicitly right-aligned with `tabular-nums`.

---

## 12. Cards, Metrics & Information Density

Tasara avoids "card fatigue" by treating cards as **governed metric contracts** rather than generic container boxes:

### The `KpiCard` Anatomy:
1. **Top Row**: 36px circular icon pill (`bg-action text-icon-secondary`) on the left; Variance vs. Tolerance (`VarianceValue`) on the right.
2. **Metric Value**: Formatted in `font-display text-display-sm` (18px Michroma).
3. **Governed Label**: `text-caption text-quaternary` sourced from a central metric registry (`metric-definitions.ts`).
4. **Bottom Metadata Row**:
   - **Confidence Indicator**: Shows numeric percentage + semantic band label ("High", "Moderate", "Low") + optional micro-progress bar.
   - **Evidence Trigger**: Button stating `Evidence · N sources` that opens the right-hand slide-out drawer.

*Why this avoids clutter*: Every element on the card has a dedicated function. If confidence or evidence is not applicable, the footer is omitted cleanly.

---

## 13. Modals, Drawers & Detail Views

### EvidenceDrawer (`components/imcc/evidence-drawer.tsx`)
- Width: `w-[380px]`.
- Fixed right slide-out with backdrop blur (`bg-black/40`).
- Lists every source artifact: Source system, timestamp, version, owner, and quality score.
- **Design Insight**: Drawers prevent clutter. Rather than squeezing version lineage and audit logs into a table column, a small trigger button allows on-demand inspection without losing table context.

### CommandPalette (`components/layout/command-palette.tsx`)
- Centered modal dialog `w-[min(560px,92vw)] max-h-[64vh] rounded-xl border border-muted bg-container shadow-2xl`.
- Keyboard-first: Arrow up/down navigation, `Enter` to navigate, `Esc` to dismiss.
- Search items grouped by uppercase category headers (`NAVIGATION`, `PARTS`, `ECNS`).

---

## 14. Forms & Filter System

### SelectMenu (`components/ui/select-menu.tsx`)
- Custom listbox built directly from design tokens without heavy external libraries.
- Trigger button: Pill shape `rounded-full border border-muted bg-action px-3 py-1.5 text-label-sm`.
- Displays optional category prefix (e.g. `Filter:`), active option label, and numeric count chip.
- Dropdown panel: `rounded-xl border border-muted bg-container/95 p-1.5 shadow-lg backdrop-blur-sm`.
- Fully accessible keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).

### Filter Pill Rows
- Rendered as horizontal pill groups with counts:
  ```tsx
  <button className="rounded-full px-3 py-1.5 text-label-sm bg-action-primary text-on-color">
    All 24
  </button>
  <button className="rounded-full px-3 py-1.5 text-label-sm bg-action text-secondary hover:bg-raised">
    Production 8
  </button>
  ```

---

## 15. Icon System

Tasara maintains a single icon registry file (`lib/icons.ts`) containing 80+ semantic concepts mapped to Tabler icons.
- **Rule**: Components **never** import icons directly from the library. They consume `<AppIcon name="iconName" size="sm" />`.
- **Stroke Width**: Universally locked at `stroke={1.75}`.
- **Standardized Size Scale**:
  - `xs`: 12px
  - `sm`: 14px
  - `md`: 16px
  - `lg`: 18px
  - `xl`: 20px
  - `2xl`: 24px
  - `3xl`: 28px
- In BOM Sync, Lucide icons are currently imported ad-hoc with inconsistent stroke widths and arbitrary size classes (`h-3 w-3`, `h-3.5 w-3.5`, `h-4 w-4`, `h-2 w-2`).

---

## 16. Chart System Architecture

In `lib/charts/chart-theme.ts` and `components/charts/chart-primitives.tsx`:
1. **Near-Monochrome Philosophy**: 85–90% of the chart is rendered in grey tones. Status colors (green/amber/red) are strictly reserved for genuine operational thresholds, never spent on distinguishing "Series A" from "Series B".
2. **Line Differentiation**: Two series in a single chart (`PlanActualChart`) are separated by **line style** (solid line for Actual, dashed `4 3` line for Plan), not by contrasting bright colors. This preserves accessibility for colorblind users and greyscale printing.
3. **Padded Domains**: Charts tracking metrics that do not start at zero (e.g. efficiency or tolerance drift) calculate a padded domain around the data:
   `const pad = Math.max((max - min) * 0.35, Math.abs(max) * 0.02);`
   This prevents a 4% variance from flattening into an invisible straight line.
4. **Tokenized Tooltips**: `<ChartTooltip />` uses container tokens with backdrop blur rather than Recharts default white tooltips.

---

## 17. Responsive Design Principles

Tasara adapts interfaces across breakpoints rather than crudely shrinking elements:
- **Navigation**: Full 256px sidebar $\rightarrow$ 64px icon rail on medium screens $\rightarrow$ off-canvas drawer on mobile.
- **Topbar Context**: Ambient shift indicators hide on `< xl`, collapsing to a compact icon button on `< lg`.
- **Tables**: Tables enforce minimum width (`min-w-[1100px]`) wrapped in an `overflow-x-auto` container with custom thin scrollbars, preventing cell truncation on smaller screens.
- **KPI Grids**: Responsive grid breakpoints (`grid-cols-2 lg:grid-cols-4`).

---

## 18. Micro-Interactions

- **Hover Transitions**: Restrained durations: `transition-colors duration-150` or `120ms ease`.
- **Toast Notifications**: Slide in with `@keyframes toast-in (220ms cubic-bezier(0.16, 1, 0.3, 1))`. Includes `@media (prefers-reduced-motion)` guards. Critical alerts stay on screen until dismissed, while warnings auto-dismiss after 9s.
- **Zero Useless Animations**: No continuous looping pulses or bouncing icons.

---

## 19. Tasara Component Catalog

| Component | File Path | Purpose | Reusable? | Category |
|---|---|---|---|---|
| `EnterpriseTable` | `components/tables/enterprise-table.tsx` | Generic sortable table with row expansion | **Yes** | Generic Core |
| `PageHeader` | `components/ui/page-header.tsx` | Standardized header with required description | **Yes** | Generic Core |
| `AppIcon` | `components/ui/app-icon.tsx` | Centralized icon renderer with fixed stroke | **Yes** | Generic Core |
| `IconButton` | `components/ui/icon-button.tsx` | Circular icon action button (ghost/subtle/inverse)| **Yes** | Generic Core |
| `StatusBadge` | `components/ui/status-badge.tsx` | 6-state status pill with WCAG AA compliance | **Yes** | Generic Core |
| `SelectMenu` | `components/ui/select-menu.tsx` | Accessible tokenized dropdown listbox | **Yes** | Generic Core |
| `ToastViewport` | `components/ui/toast.tsx` | Severity-governed toast notification queue | **Yes** | Generic Core |
| `AppShell` | `components/layout/app-shell.tsx` | Viewport flex shell with fixed layout containers | **Yes** | Layout Core |
| `Sidebar` | `components/layout/sidebar.tsx` | Dual-mode expandable rail/sidebar navigation | **Yes** | Layout Core |
| `Topbar` | `components/layout/topbar.tsx` | Header with ambient context & Ctrl+K search | **Yes** | Layout Core |
| `CommandPalette`| `components/layout/command-palette.tsx` | Keyboard search modal | **Yes** | Layout Core |
| `KpiCard` | `components/imcc/kpi-card.tsx` | Metric card with variance, confidence & drawer | **Yes** | Domain-Pattern |
| `ConfidenceIndicator` | `components/imcc/confidence-indicator.tsx` | Banded percentage confidence indicator | **Yes** | Domain-Pattern |
| `VarianceBadge` | `components/imcc/variance-badge.tsx` | Variance status label & inline value | **Yes** | Domain-Pattern |
| `EvidenceDrawer`| `components/imcc/evidence-drawer.tsx` | Slide-out provenance inspection drawer | **Yes** | Domain-Pattern |
| `CausePanel` | `components/imcc/cause-panel.tsx` | Primary cause & next-step decision block | **Yes** | Domain-Pattern |
| `ReconciliationFlow` | `components/imcc/reconciliation-flow.tsx` | Pipeline stages with stage detail inspection | **Yes** | Domain-Pattern |
| `ChartPrimitives`| `components/charts/chart-primitives.tsx` | Monochromatic Trend, Plan/Actual & Meter charts | **Yes** | Generic Charts |

---

## 20. BOM Sync Current Architecture Review

BOM Sync is organized into:
1. **Routing (`app/(app)/*`)**: Next.js App Router with 12 distinct routes covering the complete automotive lifecycle.
2. **Context (`ProgramContext.tsx`)**: Global state managing the active vehicle program (`Aura EV`, `Apex GT`, `Atlas Cargo`, `Rover EV`) and providing access to parts, ECNs, routings, and variants.
3. **Data Foundation (`src/lib/mockData.ts`)**: An extensive, highly realistic 2400-line dataset containing genuine automotive engineering relationships:
   - EBOM hierarchical trees with parent-child edges and effectivity expressions
   - MBOM manufacturing routings across multi-plant assembly stations
   - Service BOM kits with replacement intervals and FRU flags
   - Software BOM with ECU firmware versions, open-source licenses, and CVEs
   - ECN change orders with cost impact per vehicle and affected VIN counts
   - Supplier geo-risk, financial ratings, single-source flags, and PPM defect rates

---

## 21. Audit of Current BOM Sync UI Problems

| Area | Current BOM Sync Implementation | Identified UX / Visual Flaw | Root Cause |
|---|---|---|---|
| **Typography** | Fallback system fonts (`Segoe UI`), arbitrary inline font sizes (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`). | Chaotic typographic scale; numbers do not stand out; lacks enterprise authority. | Declared Google Sans/Product Sans in Tailwind config was never imported into CSS/layout. |
| **Tables** | Hardcoded HTML `<table>` in `ebom/page.tsx`, `changes/page.tsx`, `parts/page.tsx`, `suppliers/page.tsx`. | No sorting headers; no pagination; no row expansion; keys use `Math.random()`. | Lack of an `EnterpriseTable` reusable abstraction. |
| **Navigation** | Fixed 60px icon rail without text labels, disappearing completely on mobile. | User must memorize 12 icons or hover for browser tooltips; no expandable menu. | No dual-mode expanded sidebar or flyout panel. |
| **Dashboard** | 9 overlapping cards, HUD matrix, AI briefing box, and multi-colored charts crammed into one view. | "Card overload" / AI-generated dashboard appearance; high cognitive strain. | No visual hierarchy or whitespace breathing room. |
| **Borders & Radii** | `rounded-sm` (2px–4px) across every element, heavy borders, dark container stacking. | Boxy, cramped, dated appearance reminiscent of legacy enterprise software. | Overuse of micro-radii and high-contrast borders without surface gradation. |
| **Color Discipline** | Status colors (red, green, orange) applied across table cells, badges, and charts simultaneously. | Visual noise; difficult to identify true critical exceptions. | Lack of separation between inline read values and discrete status pills. |
| **Reconciliation** | "BOM Compare" (`compare/page.tsx`) handles EBOM vs MBOM but presents it as 3 static cards. | Misses the opportunity to provide deep variance analysis, tolerance checks, and cause attribution. | Lack of an evidence and reconciliation workflow pattern. |

---

## 22. TASARA $\rightarrow$ BOM SYNC Mapping Matrix

| Tasara Pattern | Tasara Implementation | BOM Sync Current Implementation | Recommended BOM Sync Adaptation | Priority | Risk |
|---|---|---|---|---|---|
| **3-Tier Design Tokens** | `tokens.css` + `@theme inline` | `src/index.css` (mixed shadcn HSL + BOM tokens) | Unify `src/index.css` into a clean reference $\rightarrow$ semantic token system. | **P0** | Low |
| **Dual-Font System** | Michroma (display) + Geist Sans (functional) | System font fallback + ad-hoc `font-mono` | Import modern fonts via `next/font` (Geist Sans + industrial display font). | **P0** | Low |
| **Reusable Enterprise Table** | `EnterpriseTable<T>` with sorting & expandable rows | Raw un-sortable `<table>` elements | Build `src/components/ui/enterprise-table.tsx` and migrate all 5 data tables. | **P0** | Medium |
| **Dual-Mode Navigation** | 64px rail $\leftrightarrow$ 256px expanded accordion | Fixed 60px icon-only rail | Implement expandable Sidebar with smooth transition and flyout menus. | **P1** | Low |
| **PageHeader Contract** | Required `title` + required `description` | Simple header without explanatory context | Standardize `PageHeader` to require purpose description across all 12 routes. | **P1** | Low |
| **Governed KPI Cards** | Value + Variance + Confidence + Evidence Drawer | Simple 2-line stat box (`p-2.5`) | Create `BOMKpiCard` with variance, confidence, and provenance drawer. | **P1** | Low |
| **Tokenized Dropdowns** | Custom `SelectMenu` with count chips | Standard shadcn Radix `<Select>` | Refactor Radix Select styling to match Tasara's pill trigger and floating menu. | **P2** | Low |
| **Monochromatic Charts** | Near-monochrome sequential theme | Default multi-color Recharts | Adopt `chart-theme.ts` with dashed lines for comparison and status colors for thresholds. | **P2** | Low |
| **Evidence / Provenance Drawer** | `EvidenceDrawer` (380px) slide-out | Separate static subpages | Introduce `ProvenanceDrawer` for part history, ECN audits, and MBOM routings. | **P1** | Low |
| **Reconciliation Workflow** | `ReconciliationFlow` interactive pipeline | Static `PipelineBar` (32px) | Elevate `PipelineBar` to an interactive lifecycle audit bar showing stage drift. | **P1** | Low |

---

## 23. Design Patterns Worth Adopting

1. **The Strict Metric Contract**: Every headline number is accompanied by its baseline (variance vs tolerance) and confidence rating.
2. **The "Read Value" vs "Status Pill" Rule**: Muted text for data reading, solid background badges reserved exclusively for actionable alerts.
3. **The `renderExpanded` Table Pattern**: Clicking a row reveals a rich contextual panel on a contrasting background without navigating away.
4. **The Ambient Context Header**: Showing active program, SOP countdown, units built, and sync freshness permanently in the top chrome.
5. **The Side-Drawer Audit**: Keeping the main data view intact while sliding out provenance, where-used graphs, or revision lineage.
6. **Restrained Near-Monochrome Charting**: Eliminating decorative rainbows in favor of high-legibility monochromatic line/bar comparisons.

---

## 24. Patterns NOT to Copy from Tasara

1. **DO NOT COPY Mining Domain Terminology**: No haul trucks, excavators, dig blocks, blast zones, coal quality, stockpiles, or washeries.
2. **DO NOT COPY MapLibre GIS Maps**: Automotive BOM synchronization is a hierarchical tree, network graph, and tabular problem—not a terrain map problem.
3. **DO NOT COPY Tasara's Shift Simulation**: Tasara uses a live clock tick simulation (`13:42`). BOM Sync uses enterprise vehicle program versions (`rev 2.4`, `SOP in 142 days`).
4. **DO NOT DISCARD BOM Sync's Node Graph**: BOM Sync's `@xyflow/react` graph in `ebom/page.tsx` is an exceptional domain asset for visualizing multi-level assembly hierarchies.
5. **DO NOT BREAK Automotive Business Logic**: Keep all existing part numbers (`MER-BAT-0042`), ECN identifiers (`ECN-2241`), and variant codes (`GT-PERF-AWD`).

---

## 25. Route-by-Route BOM Sync UX Audit

### 1. Dashboard (`/`)
- *Current*: Visual clutter; 9 distinct boxes competing for attention; SystemHealthMatrix takes up 8 columns with tiny cells; Change Velocity chart uses garish red/green bars.
- *Recommended*: Restructure into 3 clear vertical tiers:
  1. Executive Program Summary Strip (Active program status, Days to SOP, Health maturity)
  2. 4 Governed KPI Cards (EBOM Maturity, MBOM Readiness, Supply Chain Risk, Software Cyber Exposure)
  3. Master Split: Left = Interactive Lifecycle Reconciliation Table (EBOM $\rightarrow$ MBOM $\rightarrow$ SBOM gaps); Right = Priority ECN Action Queue & AI Strategy Briefing.

### 2. Engineering BOM (`/ebom`)
- *Current*: Table tab uses a raw HTML table with `Math.random()` keys and no sorting. Tree tab is functional but lacks quick filtering by status/type.
- *Recommended*: Retain Tree, Table, and Graph tabs. Upgrade the Table view with `EnterpriseTable` including sortable headers (Part Number, Name, Type, Rev, Qty, Cost, Supplier, Lifecycle), expandable row details showing child components and where-used parents, and a dedicated provenance drawer.

### 3. Change Management (`/changes`)
- *Current*: ECN list table lacks column sorting; detail view has a good timeline and affected parts table, but lacks clear impact analysis.
- *Recommended*: Sortable ECN table by Priority, Cost Impact, Affected VINs, and State. In the detail view, implement an interactive "Change Blast Radius" drawer showing affected variants, suppliers, and downstream MBOM operations.

### 4. BOM Compare (`/compare`)
- *Current*: Static 3-card layout for Variant comparison and EBOM vs MBOM.
- *Recommended*: Transform EBOM vs MBOM compare into the **flagship BOM Reconciliation Engine**:
  - Show Mapped vs. Unrouted vs. Phantom assemblies in an `EnterpriseTable`
  - Include Tolerance, Confidence, Primary Root Cause (e.g. "ECN-2241 modified battery enclosure without MBOM station update"), and an Action button to resolve.

### 5. Part Master (`/parts`)
- *Current*: Plain list table; detail page has rich data but is laid out as cramped stacked cards.
- *Recommended*: `EnterpriseTable` with filter pills by type (Vehicle, System, Assembly, ECU, Component). Part detail view organized into a clean 2-column layout with an on-demand Revision Lineage drawer.

### 6. Supplier Intelligence (`/suppliers`)
- *Current*: Mix of KPIs, a CVE heatmap, and a supplier table.
- *Recommended*: Connect supplier risk directly to affected vehicle parts. In the table, expanding a supplier reveals which single-source assemblies they provide and the associated financial/geopolitical exposure.

---

## 26. BOM-Specific UX Opportunities (The "Why")

### Opportunity 1: The BOM Reconciliation Engine (EBOM $\leftrightarrow$ MBOM $\leftrightarrow$ SBOM)
- **Problem**: In automotive engineering, design engineers (EBOM) and manufacturing process engineers (MBOM) work in different PLM/MES systems. Parts added to the CAD tree often have no assembly station routing, resulting in costly plant line stops.
- **Solution**: A dedicated Reconciliation Table inspired by Tasara's reconciliation module:
  - Columns: Assembly, Planned (EBOM Rev), Measured (MBOM Station), Variance Status, Confidence, Root Cause ECN, and Action Owner.
  - Expandable row reveals CAD revision vs. Shop-floor work instruction.
- **Product Value**: Saves millions in pre-production re-tooling delays.

### Opportunity 2: Change Order "Blast Radius" Analyzer
- **Problem**: An ECN to change a battery cell tab looks simple on paper, but affects 3 vehicle variants, 4 suppliers, and 45,000 VINs in the field.
- **Solution**: A visual impact card in ECN detail that computes:
  - Unit Cost delta $\times$ Planned Program Volume
  - Affected Downstream Suppliers & Tooling Lead Times
  - Warranty/Field Risk exposure

### Opportunity 3: Software-Hardware BOM Reconciliation
- **Problem**: Hardware engineers specify an ECU (e.g. `BAT-ECU-9000`), while software teams release firmware images with open-source dependencies and CVE vulnerabilities.
- **Solution**: Linking SBOM directly to the Part Master. If an ECU has a critical CVE, the part health badge turns critical in EBOM and triggers an automatic ECN review.

---

## 27. The "X-Factor": What Makes BOM Sync a Category Leader?

To transcend generic AI-generated interfaces, BOM Sync must embody the concept of **"Auditable Automotive Truth"**:
1. **Never Show an Unexplained Number**: Every metric, cost delta, and readiness percentage must be clickable to reveal its mathematical formula, contributing parts, and source system.
2. **Explicit Authority Boundaries**: Like Tasara, BOM Sync does not pretend to edit CAD files or execute robot routines. It clearly states: *"Design authority sits with Siemens Teamcenter; manufacturing execution sits with SAP MES. BOM Sync provides independent cross-system reconciliation."*
3. **Restrained Executive Aesthetic**: Dark charcoal surfaces, crisp hairline borders, pure white primary CTAs, and restrained industrial orange accents (`#f05d1a`) tailored for automotive engineering leaders.

---

## 28. Recommended Component Architecture for BOM Sync

```
src/
├── components/
│   ├── ui/                           # Primitive Design Tokens
│   │   ├── app-icon.tsx              # Centralized Lucide wrapper (stroke 1.75, fixed scale)
│   │   ├── page-header.tsx           # Standardized header with required description
│   │   ├── status-badge.tsx          # 6-tone status pill (WCAG AA compliant)
│   │   └── select-menu.tsx           # Pill-triggered listbox with item counts
│   ├── tables/                       # Enterprise Table System
│   │   ├── enterprise-table.tsx      # Generic sortable, expandable table
│   │   └── table-pagination.tsx      # Clean density & page controls
│   ├── layout/                       # Chrome & Navigation
│   │   ├── AppShell.tsx              # Fixed layout shell
│   │   ├── TopNav.tsx                # 80px ambient header with program context
│   │   ├── Sidebar.tsx               # Dual-mode (64px rail <-> 256px accordion)
│   │   └── PipelineBar.tsx           # Interactive Lifecycle flow bar
│   ├── reconciliation/               # Flagship Reconciliation Modules
│   │   ├── bom-reconciliation-table.tsx # EBOM vs MBOM audit table
│   │   ├── confidence-indicator.tsx  # High / Moderate / Low evidence bands
│   │   ├── cause-panel.tsx           # Root cause attribution container
│   │   └── provenance-drawer.tsx     # Slide-out audit & source drawer
│   └── dashboard/                    # Redesigned Cockpit Components
│       ├── kpi-card.tsx              # Governed BOM metric cards
│       ├── ecn-queue-panel.tsx       # Priority change actions
│       └── change-velocity-chart.tsx # Monochromatic trend charts
```

---

## 29. Recommended Implementation Roadmap

### Phase 1: Foundation & Design Tokens
- Normalize `src/index.css`: Establish reference tokens (`--ref-gray-*`), semantic tokens (`--surface-*`, `--text-*`, `--stroke-*`), and status colors.
- Configure Google Fonts in `app/layout.tsx` (Geist Sans for functional UI, Michroma or Space Grotesk for display metrics).
- Build `src/lib/icons.ts` and `src/components/ui/app-icon.tsx` with unified Lucide icon registry.
- *Validation*: Zero visual regression on existing routes; tokens verified via browser inspector.

### Phase 2: Shell & Navigation Redesign
- Upgrade `Sidebar.tsx`: Implement dual-state navigation (64px icon rail $\leftrightarrow$ 256px expanded accordion) with smooth CSS transitions and hover-flyout panels.
- Refactor `TopNav.tsx`: Clean 80px height, unified breadcrumbs, ambient program status (Days to SOP, Units Built, Sync Freshness), and keyboard search trigger (`Ctrl K`).
- Refactor `PipelineBar.tsx`: Make pipeline nodes interactive triggers that highlight lifecycle stages.
- *Validation*: Responsive check on desktop (1920px), laptop (1440px), and tablet (1024px).

### Phase 3: The Reusable Enterprise Table Foundation
- Implement `src/components/tables/enterprise-table.tsx` with generic types (`T`), client-side column sorting, right-aligned numbers, and `renderExpanded` drawer rows.
- Build `src/components/ui/status-badge.tsx` with 6 standard tones.
- *Validation*: Unit test sorting logic for strings, numbers, and dates.

### Phase 4: Route-by-Route Table Modernization
- **EBOM (`/ebom`)**: Replace raw table with `EnterpriseTable`. Add expandable row for child parts and where-used parents.
- **Changes (`/changes`)**: Replace ECN table with `EnterpriseTable` (sortable by Cost, Priority, VINs).
- **Part Master (`/parts`)**: Replace parts table with `EnterpriseTable` (sortable by PN, Cost, Rev, Lead Time).
- **Suppliers (`/suppliers`)**: Replace suppliers table with `EnterpriseTable` (expandable to show single-source assemblies).
- *Validation*: Verify all click handlers, links, and search filter inputs continue working seamlessly.

### Phase 5: Dashboard Cockpit & HUD Streamlining
- Redesign `app/(app)/page.tsx`:
  - Replace 9 cramped boxes with 4 governed `KpiCard` components (Maturity, Readiness, Supply Risk, Cyber).
  - Streamline SystemHealthMatrix into an intuitive status grid.
  - Implement monochromatic `ChangeVelocityChart`.
  - Reorganize ECN queue into clean action cards.
- *Validation*: Verify all program switching in `ProgramContext` immediately updates dashboard values.

### Phase 6: Flagship BOM Reconciliation & Provenance Drawers
- Upgrade `/compare` into the **BOM Reconciliation Engine** (EBOM vs MBOM reconciliation table with cause attribution).
- Introduce `ProvenanceDrawer` across Part Master and EBOM for on-demand revision history.
- *Validation*: Verify that clicking "Investigate Gap" opens the diagnostic drawer with complete source data.

---

## 30. Protected Functionality & Safe Boundaries

During future implementation, the following core assets **must remain strictly untouched**:
1. **Mock Data Integrity (`src/lib/mockData.ts`)**: All part numbers, ECN IDs, variants, program names, and financial figures are source of truth.
2. **Application Routes**: The 12 existing routes (`/`, `/variants`, `/ebom`, `/mbom`, `/service`, `/software`, `/changes`, `/compare`, `/parts`, `/suppliers`, `/field`, `/reports`, `/login`) must not be renamed or broken.
3. **Node Graph Visualization (`src/components/EbomGraphView.tsx`)**: The `@xyflow/react` and `dagre` tree layout algorithm is protected.
4. **Authentication Logic (`src/lib/auth.ts`)**: Session state and mock authentication remain intact.
5. **Program Context State (`src/context/ProgramContext.tsx`)**: Active program switching contract remains intact.

---

## 31. Technical Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Tailwind v3 vs v4 divergence** | Medium | Do not attempt to upgrade BOM Sync to Tailwind v4. Implement Tasara's token variables directly in CSS `:root` and map them through Tailwind v3 `theme.extend.colors`. |
| **Radix UI Component Conflicts** | Low | Retain existing Radix UI primitives. Style them using the new semantic tokens rather than rewriting them from scratch. |
| **Table Sorting Performance** | Low | With ~100 parts per program, client-side sorting via `useMemo` executes in $<2\text{ms}$. No server-side paging required for current mock scope. |
| **Responsive Overflow on Tables** | Medium | Always wrap `EnterpriseTable` in an `overflow-x-auto` container with `min-w-[1000px]` to guarantee data readability on small viewports. |

---

## 32. Exact Files Targeted for Future Modernization

```
1.  src/index.css                             (Token foundation & theme variables)
2.  app/layout.tsx                             (Font loading & typography classes)
3.  src/lib/icons.ts                           (NEW: Centralized icon registry)
4.  src/components/ui/app-icon.tsx             (NEW: Unified icon component)
5.  src/components/ui/status-badge.tsx         (NEW: 6-state WCAG status badge)
6.  src/components/ui/page-header.tsx          (Refactored standardized header)
7.  src/components/tables/enterprise-table.tsx (NEW: Generic data table foundation)
8.  src/components/layout/Sidebar.tsx          (Dual-mode expandable rail navigation)
9.  src/components/layout/TopNav.tsx           (Ambient executive cockpit header)
10. src/components/layout/PipelineBar.tsx      (Interactive lifecycle drift bar)
11. src/components/reconciliation/provenance-drawer.tsx (NEW: Slide-out audit drawer)
12. app/(app)/page.tsx                         (Cockpit dashboard streamlining)
13. app/(app)/ebom/page.tsx                    (Modernized EBOM table & drawer)
14. app/(app)/changes/page.tsx                 (Sortable ECN table & blast radius)
15. app/(app)/compare/page.tsx                 (Flagship BOM reconciliation engine)
16. app/(app)/parts/page.tsx                   (Modernized part master table)
17. app/(app)/suppliers/page.tsx               (Supply chain risk table & drawer)
```

---

## 33. "What Makes Tasara Look Production-Grade?"

When analyzing Tasara, the impression of quality does not come from visual tricks, neon glows, or trendy gradients. It comes from **six disciplined design engineering truths**:

1. **Restraint Over Decoration**: 90% of the screen is composed of disciplined dark neutrals. Color is an expensive resource spent exclusively on state.
2. **Every Number Has a Pedigree**: Numbers are never stranded alone. They are accompanied by variance against tolerance, confidence ratings, and provenance links.
3. **Predictable Typographic Hierarchy**: The eye instantly understands where to look—Michroma anchors the metric, Geist Sans handles the labels, and tabular monospace handles the data.
4. **Data Density Without Clutter**: Tables are compact (~40px rows), but use generous negative space between sections (`p-6`, `gap-4`).
5. **Interactive Progressive Disclosure**: Information is layered. The user scans the headline row, expands the row for cause analysis, and opens the drawer for audit logs.
6. **Intentional Navigation Affordances**: The sidebar is not an afterthought; it tells an honest story of the application's structure with responsive flyout panels and smooth transitions.

---

## 34. "What Should BOM Sync Become?"

BOM Sync should become the **definitive industrial control center for automotive bill of materials synchronization**:
- An application where an engineering executive can open the **Command Center** and immediately understand program maturity, days to SOP, and supply chain vulnerabilities.
- A platform where a manufacturing engineer can open **BOM Reconciliation** and instantly identify which CAD assemblies lack shop-floor routings, why the gap occurred, and which ECN is responsible.
- A system that feels **crafted, engineered, robust, and authoritative**—a true production-grade automotive SaaS platform built for the next generation of software-defined vehicles.

