# ICON AUDIT

Audit only. No source file was changed. Branch `ui-review-fixes`, built to a scratch folder and driven with Playwright (Chromium, 1440×900 unless stated).

## 0. Summary

| Measure | Count |
|---|---|
| Icon sites in the inventory (one row per file:line and icon) | **177** |
| Class A, concept / entity | 96 |
| Class B, action with meaning | 22 |
| Class C, UI control or status (keep lucide) | 59 |
| Of the A/B rows, already custom brand marks | 20 (12 page headers at 44px + 8 empty states at 72px) |
| A/B lucide rows rendered below 20px (flagged) | 98 |
| Of those, B rows below 16px (outside the ≥16px rule) | 21 |
| Missing-icon spots (concept with no icon today) | **69** |
| Unique ids in the catalogue (12 existing + 52 new) | 64 |
| **New icons to generate** | **52** (+8 spares to fill the last sheet = 60 slots) |
| **Generation sheets (12 per sheet)** | **5** |
| Unique lucide glyphs measured at runtime | 54 |
| Raw runtime sightings across 53 interaction states | 3160 (before deduplication) |

**Why the counts are not a single number.** The rows are *render sites* (file:line). Data-driven sites are expanded: 12 nav items, 7 system icons, 5 stage icons and 5 plants are one row each. A site that renders in many routes or states is one row. Runtime sightings (3 000+) are the same sites seen again in each state.

**Decisions needed from the manager** (marked D1 to D3 below):
- **D1.** `field-event.png` is a stop-sign-shaped mark. The `iconMap.ts` comment already limits it to the Field Quality header and empty state. Using it in the Field Quality *sidebar puck* and on the Dashboard would put a warning-looking shape next to health dots. Recommendation: keep it in those two places only and give the nav puck and panels the non-warning `quality` icon, or regenerate it. This conflicts with the rule “same concept, same id”, so it needs a decision.
- **D2.** Buttons render icons at 13px (`Button` forces `[&_svg]:size-[13px]`). A 3D mark is unreadable there. Either keep lucide in buttons (recommended) or grow buttons to 20px icons.
- **D3.** Dense rows (14px) and 10 to 12px badges. Recommendation: keep lucide.

**Measured vs. source size.** `Button` overrides any `size-*` on child svgs, so icons in buttons and pills render at 13px even where the class says `size-3` or `size-3.5` (TopNav chevrons, MapPin). The tables use measured values. Not rendered anywhere: `ActivityFeed`, `DriftIndicator`, `SankeyFlow`, `DistributionDonut`, `Index.tsx` and the unused `ui/*` kit components (accordion, calendar, carousel, command, dialog, sheet, …). Their lucide imports are not counted. If `ActivityFeed` is mounted later it needs event-type icons (upgrade, add, CVE, approval, warning, sync).

Non-lucide images (not icons, not candidates): Wayam logo / mark 32px (Login, sidebar), Wayam wordmark 101×20 (sidebar), login hero image, Recharts chart shapes, the xyflow background and edge markers, HealthArc SVG arcs (200px). The only xyflow control icon is the lock (12px).

## 1. Full inventory

Columns: route/component · file:line · meaning · current icon · rendered px (measured) · colour/token · text label next to it · class · note or proposal. **A** concept/entity, **B** action, **C** UI control or status.

| # | Route / component | file:line | Meaning | Current icon | px | Colour / token | Label | Cls | Note / proposal |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Top bar (all routes) | TopNav.tsx:39 | Open navigation (mobile, <lg) | lucide Menu | 16 | text-tertiary on bg-action puck | N | C | keep |
| 2 | Top bar | TopNav.tsx:53 | Program switcher dropdown | lucide ChevronDown | 13 | text-quaternary | Y | C | keep. Renders 13px, not the 12px class: Button forces [&_svg]:size-[13px] |
| 3 | Top bar | TopNav.tsx:78 | VIN / program scope | lucide MapPin | 13 | text-tertiary | Y | A | keep lucide (inside a 32px pill); optional `scope` |
| 4 | Top bar | TopNav.tsx:80 | Scope popover dropdown | lucide ChevronDown | 13 | text-quaternary | Y | C | keep |
| 5 | Top bar (xl+) | TopNav.tsx:97 | Universal search | lucide Search | 14 | text-quaternary | Y (placeholder) | C | keep |
| 6 | Top bar (xl+) | TopNav.tsx:118 | Keyboard hint ⌘K | lucide Command | 12 | text-quaternary | Y (K) | C | keep |
| 7 | Top bar | TopNav.tsx:126 | Notifications | lucide Bell | 16 | text-tertiary on puck, count badge | N (aria only) | A | enlarge to 20px in the 32px puck, use `notifications` |
| 8 | Top bar + Login | ThemeToggle.tsx:19 | Light theme | lucide Sun | 16 | text-tertiary | N (aria only) | C | keep |
| 9 | Top bar + Login | ThemeToggle.tsx:20 | Dark theme | lucide Moon | 16 | text-tertiary | N (aria only) | C | keep |
| 10 | Top bar (md+) | TopNav.tsx:154 | Export (global) | lucide Download | 16 | text-tertiary | N (aria only) | B | enlarge to 20px in the 32px puck, use `export` |
| 11 | Lifecycle strip (all routes) | PipelineBar.tsx:70 | Pipeline stage: CAT BOM | variant → lucide Layers | 14 | text-tertiary; text-on-color when active | Y | A | enlarge to 20px: chip h-7→h-9, strip h-10→h-12; else keep lucide |
| 12 | Lifecycle strip (all routes) | PipelineBar.tsx:70 | Pipeline stage: EBOM | ebom → lucide GitBranch | 14 | text-tertiary; text-on-color when active | Y | A | enlarge to 20px: chip h-7→h-9, strip h-10→h-12; else keep lucide |
| 13 | Lifecycle strip (all routes) | PipelineBar.tsx:70 | Pipeline stage: MBOM | mbom → lucide Factory | 14 | text-tertiary; text-on-color when active | Y | A | enlarge to 20px: chip h-7→h-9, strip h-10→h-12; else keep lucide |
| 14 | Lifecycle strip (all routes) | PipelineBar.tsx:70 | Pipeline stage: Software | software → lucide Cpu | 14 | text-tertiary; text-on-color when active | Y | A | enlarge to 20px: chip h-7→h-9, strip h-10→h-12; else keep lucide |
| 15 | Lifecycle strip (all routes) | PipelineBar.tsx:70 | Pipeline stage: Service | service-kit → lucide Wrench | 14 | text-tertiary; text-on-color when active | Y | A | enlarge to 20px: chip h-7→h-9, strip h-10→h-12; else keep lucide |
| 16 | Lifecycle strip | PipelineBar.tsx:81 | Flow separator between stages | lucide ChevronRight | 12 | text-quaternary | N | C | keep |
| 17 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Command Center (/) | lucide LayoutDashboard | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → command-center (new) |
| 18 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Variants & Configuration (/variants) | lucide Layers | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → variant |
| 19 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Engineering BOM (/ebom) | lucide GitBranch | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → ebom |
| 20 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Manufacturing BOM (/mbom) | lucide Factory | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → mbom |
| 21 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Service BOM (/service) | lucide Wrench | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → service-kit |
| 22 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Software BOM (/software) | lucide ShieldAlert | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → software (nav uses ShieldAlert, entity map uses Cpu) |
| 23 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Change Management (/changes) | lucide FileEdit | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → ecn |
| 24 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: BOM Compare (/compare) | lucide GitCompare | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → compare (new) |
| 25 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Field Quality (/field) | lucide AlertOctagon | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → field-event (see decision D1) |
| 26 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Part Master (/parts) | lucide Boxes | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → part (nav uses Boxes = the assembly icon) |
| 27 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Supplier Intelligence (/suppliers) | lucide Truck | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → supplier |
| 28 | Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Reports & Exports (/reports) | lucide FileBarChart | 17 | text-tertiary on 36px puck; text-on-color when active | Y expanded/drawer; N in rail (flyout on hover) | A | enlarge to 22px in the 36px puck → report |
| 29 | Sidebar | Sidebar.tsx:33 | Program Tree expand/collapse | lucide ChevronRight/Down | 12 | text-quaternary | aria only | C | keep |
| 30 | Sidebar | Sidebar.tsx:167 | Nav group collapse | lucide ChevronDown | 12 | text-quaternary | Y | C | keep |
| 31 | Sidebar | Sidebar.tsx:225 | Program Tree section collapse | lucide ChevronDown | 12 | text-quaternary | Y | C | keep |
| 32 | Sidebar (expanded/drawer) | Sidebar.tsx:244 | Pinned section marker | lucide Pin | 12 | text-quaternary | Y | A | keep lucide (12px eyebrow glyph) |
| 33 | Sidebar | Sidebar.tsx:247 | Pinned collapse | lucide ChevronDown | 12 | text-quaternary | Y | C | keep |
| 34 | Sidebar Pinned row (hover only) | Sidebar.tsx:260 | Unpin | lucide X | 12 | text-quaternary, opacity-0 → group-hover | N | C | keep |
| 35 | Sidebar footer (lg+) | Sidebar.tsx:277 | Collapse sidebar | lucide PanelLeftClose | 17 | text-tertiary on puck | Y expanded; N rail | C | keep |
| 36 | Sidebar footer (lg+) | Sidebar.tsx:277 | Expand sidebar | lucide PanelLeftOpen | 17 | text-tertiary on puck | N (title only) | C | keep |
| 37 | Dashboard / | Dashboard.tsx:73 | Page header mark | mark assembly | 44 | brand mark | Y (title) | A | already custom; WRONG concept (assembly on the Command Center) → `command-center` |
| 38 | Dashboard / | Dashboard.tsx:78 | Go to ECNs | lucide FileEdit | 13 | button text | Y | A | keep (13px in button) or `ecn` |
| 39 | Dashboard / | Dashboard.tsx:81 | Go to cyber (Software BOM) | lucide ShieldAlert | 13 | button text | Y | A | keep or `security` |
| 40 | Dashboard / | Dashboard.tsx:84 | Export reports | lucide FileBarChart | 13 | button text (primary) | Y | A | keep or `report` |
| 41 | Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Powertrain (PWT) | lucide Zap | 16 | text-tertiary in 40px tile | N (name beside) | A | enlarge to 28px: tile 40→44px → `system-powertrain` |
| 42 | Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Battery (BAT) | lucide Battery | 16 | text-tertiary in 40px tile | N (name beside) | A | enlarge to 28px → `system-battery` |
| 43 | Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Chassis (CHS) | lucide CircleDot | 16 | text-tertiary in 40px tile | N (name beside) | A | enlarge to 28px → `system-chassis` |
| 44 | Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Body (BDY) | lucide Box | 16 | text-tertiary in 40px tile | N (name beside) | A | enlarge to 28px → `system-body` (Box collides with the part icon) |
| 45 | Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Interior (INT) | lucide Armchair | 16 | text-tertiary in 40px tile | N (name beside) | A | enlarge to 28px → `system-interior` |
| 46 | Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Electrical (ELE) | lucide Cpu | 16 | text-tertiary in 40px tile | N (name beside) | A | enlarge to 28px → `system-electrical` (Cpu collides with the software icon) |
| 47 | Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:28 | System fallback (unknown prefix) | lucide Box | 16 | text-tertiary in 40px tile | N | A | enlarge to 28px → `system` |
| 48 | Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:278 | Open ECNs for a system | lucide FileEdit | 12 | text-warning chip | Y | A | keep lucide (12px, warning-coloured status chip) |
| 49 | Dashboard | Dashboard.tsx:155 | Panel Program Stage Pipeline | lucide Layers (icon="variant") | 14 | text-tertiary | Y | A | enlarge to 20px in header (h-11) → `stage-*` / `variant` (wrong concept today) |
| 50 | Dashboard | Dashboard.tsx:180 | AI Assistant panel action | lucide Sparkles | 14 | text-quaternary | Y (title) | A | enlarge to 20px → `ai` |
| 51 | Dashboard | Dashboard.tsx:193 | AI briefing: critical impact (status) | lucide AlertTriangle | 12 | text-warning | Y | C | keep: status, must stay lucide |
| 52 | Dashboard | Dashboard.tsx:210 | Explore AI strategy | lucide ArrowRight | 13 | button text | Y | C | keep |
| 53 | Dashboard | Dashboard.tsx:228 | Panel ECN Approval Queue | lucide FileEdit (icon="ecn") | 14 | text-tertiary | Y | A | enlarge to 20px → `ecn` |
| 54 | Dashboard | Dashboard.tsx:232 | Monitor ECNs | lucide ArrowRight | 13 | button text | Y | C | keep |
| 55 | Dashboard | Dashboard.tsx:237 | Empty state: no pending ECNs | mark ecn | 72 | brand mark | Y | A | already custom |
| 56 | Dashboard | Dashboard.tsx:290 | Expand stream | lucide ArrowRight | 13 | button text | Y | C | keep |
| 57 | Dashboard Change Velocity | Dashboard.tsx:274 | Chart legend markers (Recharts circle) | recharts circle | 8 | analytics-series | Y | C | keep |
| 58 | Variants /variants | Variants.tsx:51 | Page header mark | mark variant | 44 | brand mark | Y | A | already custom |
| 59 | Variants | Variants.tsx:53 | New variant | lucide Plus | 13 | button text | Y | B | <16px: keep lucide (or `add` if buttons grow) |
| 60 | Variants (table rows) | Variants.tsx:88 | Variant code row | lucide Layers (EntityIcon) | 14 | text-tertiary | Y | A | keep lucide at 14px (dense row) |
| 61 | Variants (table) | Variants.tsx:96 | Conflicts badge (status) | lucide AlertTriangle | 14 | badge warning | Y | C | keep: status |
| 62 | Variants (detail card) | Variants.tsx:108 | Selected variant heading | lucide Layers | 14 | text-tertiary | Y | A | enlarge to 20px → `variant` |
| 63 | Variants | Variants.tsx:125 | Panel Effectivity Matrix | lucide Layers (icon="variant") | 14 | text-tertiary | Y | A | enlarge to 20px → `variant` |
| 64 | Variants (matrix) | Variants.tsx:149 | Effective in variant | lucide Check | 14 | text-success | N | C | keep |
| 65 | Variants (matrix) | Variants.tsx:150 | Not effective | lucide X | 14 | text-tertiary opacity-40 | N | C | keep |
| 66 | EBOM /ebom | EbomManager.tsx:332 | Page header mark | mark ebom | 44 | brand mark | Y | A | already custom |
| 67 | EBOM | EbomManager.tsx:336 | Compare | lucide GitCompare | 13 | button text | Y | B | <16px: keep lucide, or `compare` if buttons grow |
| 68 | EBOM | EbomManager.tsx:337 | Add relationship | lucide Link2 | 13 | button text | Y | B | <16px: keep lucide, or `link` |
| 69 | EBOM | EbomManager.tsx:338 | Add component | lucide Plus | 13 | button text (primary) | Y | B | <16px: keep lucide, or `add` |
| 70 | EBOM toolbar | EbomManager.tsx:362 | Filter | lucide Filter | 13 | button text | Y | C | keep |
| 71 | EBOM toolbar | EbomManager.tsx:364 | Search | lucide Search | 14 | text-tertiary | N (placeholder) | C | keep |
| 72 | EBOM + 6 other pages (13 Select triggers in all) | ui/select.tsx:27 | Select dropdown chevron | lucide ChevronDown | 12 | text-quaternary | N | C | keep |
| 73 | Any open Select (hover/open only) | ui/select.tsx:115 | Selected option tick | lucide Check | 14 | foreground | Y | C | keep |
| 74 | EBOM tree | EbomManager.tsx:93 | Row expand/collapse | lucide ChevronRight/Down | 14 | opacity-60 | aria only | C | keep |
| 75 | EBOM tree | EbomManager.tsx:97 | Row: assembly (has children) | lucide Boxes (EntityIcon assembly) | 14 | text-tertiary | Y | A | keep lucide at 14px in dense rows; type-aware icons optional |
| 76 | EBOM tree | EbomManager.tsx:97 | Row: part (leaf) | lucide Box (EntityIcon part) | 14 | text-tertiary | Y | A | keep lucide at 14px |
| 77 | EBOM tree | EbomManager.tsx:394 | Empty state: no match | mark ebom | 72 | brand mark | Y | A | already custom |
| 78 | EBOM drawer (select a row) | EbomManager.tsx:175 | Close details | lucide X | 16 | button | N (aria only) | C | keep. Drawer tabs Overview / Where-Used / Manufacturing / Software / History render no icons |
| 79 | EBOM drawer: Where-Used tab | EbomManager.tsx:226 | Open parent part | lucide ExternalLink | 14 | opacity-50 | N | C | keep |
| 80 | EBOM footer | EbomManager.tsx:452 | Validation banner | lucide GitBranch | 14 | text-warning | Y | A | enlarge to 20px → `validation`; GitBranch is the EBOM icon, so the meaning clashes |
| 81 | EBOM footer | EbomManager.tsx:457 | Decorative (no meaning, no label) | lucide Boxes | 14 | text-tertiary | N | A | remove or replace; decorative |
| 82 | EBOM footer | EbomManager.tsx:458 | Decorative (no meaning, no label) | lucide ShieldAlert | 14 | text-tertiary | N | A | remove or replace; decorative |
| 83 | EBOM graph view | EbomGraphView.tsx:365 | Search nodes | lucide Search | 14 | text-tertiary | N | C | keep |
| 84 | EBOM graph view | EbomGraphView.tsx:374 | Clear search (visible when text entered) | lucide X | 14 | text-tertiary | N | C | keep |
| 85 | EBOM graph view | EbomGraphView.tsx:382 | Zoom in | lucide ZoomIn | 16 | icon button | N (title) | C | keep |
| 86 | EBOM graph view | EbomGraphView.tsx:385 | Zoom out | lucide ZoomOut | 16 | icon button | N (title) | C | keep |
| 87 | EBOM graph view | EbomGraphView.tsx:388 | Fit to screen | lucide Maximize2 | 16 | icon button | N (title) | C | keep |
| 88 | EBOM graph view | EbomGraphView.tsx:391 | Reset / collapse all | lucide RotateCcw | 16 | icon button | N (title) | C | keep |
| 89 | EBOM graph view (node selected) | EbomGraphView.tsx:403 | Clear selection | lucide X | 13 | button | Y | C | keep |
| 90 | EBOM graph node | EbomGraphView.tsx:171 | Expand/collapse children (count pill) | lucide ChevronRight/Down | 14 | pill text (scales with zoom, 8.6 to 16.8 measured) | Y (count) | C | keep |
| 91 | EBOM graph canvas | EbomGraphView.tsx:457 | Status bar: selected node | lucide GitBranch | 14 | text-tertiary | Y | A | keep lucide at 14px (status-bar chip) |
| 92 | EBOM graph canvas | EbomGraphView.tsx:472 | Empty state: no matching nodes | lucide AlertTriangle | 28 | text-warning | Y | C | wrong: warning triangle for a plain empty state → use an existing mark (`ebom` 72px) |
| 93 | EBOM graph canvas (xyflow) | EbomGraphView.tsx:441 (Controls) | Toggle interactivity (lock) | xyflow built-in svg | 12 | xyflow | N | C | keep |
| 94 | EBOM graph node | EbomGraphView.tsx:134 | Text glyph ⚠ after warning count (not an svg) | text glyph ⚠ | 12 | badge text | Y | C | replace with plain text “n warnings”; not a candidate |
| 95 | MBOM /mbom | MbomManager.tsx:52 | Page header mark | mark mbom | 44 | brand mark | Y | A | already custom |
| 96 | MBOM | MbomManager.tsx:56 | Sync from EBOM | lucide ArrowDownToLine | 13 | button text | Y | B | <16px: keep lucide, or `sync` |
| 97 | MBOM | MbomManager.tsx:57 | Release to MES | lucide Factory | 13 | button text (primary) | Y | B | <16px: keep lucide, or `release` |
| 98 | MBOM plant cards (per program) | MbomManager.tsx:68 | Plant: Pune | lucide Factory | 14 | text-tertiary | Y | A | enlarge to 20px → `plant` |
| 99 | MBOM plant cards (per program) | MbomManager.tsx:68 | Plant: Detroit | lucide Factory | 14 | text-tertiary | Y | A | enlarge to 20px → `plant` |
| 100 | MBOM plant cards (per program) | MbomManager.tsx:68 | Plant: Chengdu | lucide Factory | 14 | text-tertiary | Y | A | enlarge to 20px → `plant` |
| 101 | MBOM plant cards (per program) | MbomManager.tsx:68 | Plant: San Antonio | lucide Factory | 14 | text-tertiary | Y | A | enlarge to 20px → `plant` |
| 102 | MBOM plant cards (per program) | MbomManager.tsx:68 | Plant: Querétaro | lucide Factory | 14 | text-tertiary | Y | A | enlarge to 20px → `plant` |
| 103 | MBOM table | MbomManager.tsx:177 | Operation row | lucide Factory (EntityIcon mbom) | 14 | text-tertiary | Y | A | keep lucide at 14px (dense row) |
| 104 | MBOM | MbomManager.tsx:170 | Empty state | mark mbom | 72 | brand mark | Y | A | already custom |
| 105 | MBOM footer | MbomManager.tsx:218 | All mapped (status) | lucide CheckCircle2 | 14 | text-success | Y | C | keep: status |
| 106 | MBOM footer | MbomManager.tsx:220 | Needs attention (status) | lucide AlertTriangle | 14 | text-warning | Y | C | keep: status |
| 107 | MBOM footer | MbomManager.tsx:222 | Compare with EBOM link | lucide ExternalLink | 14 | text-tertiary | N | C | keep |
| 108 | Service /service | ServiceBom.tsx:75 | Page header mark | mark service-kit | 44 | brand mark | Y | A | already custom |
| 109 | Service | ServiceBom.tsx:79 | Service manual | lucide BookOpen | 13 | button text | Y | B | <16px: keep lucide, or `manual` |
| 110 | Service | ServiceBom.tsx:80 | New service kit | lucide Plus | 13 | button text (primary) | Y | B | <16px: keep lucide, or `add` |
| 111 | Service tab | ServiceBom.tsx:97 | Tab: Service Kits | lucide Wrench (EntityIcon) | 14 | currentColor | Y | A | keep lucide at 14px in pill tabs |
| 112 | Service tab | ServiceBom.tsx:98 | Tab: Field-Replaceable Units | lucide Cog (EntityIcon) | 14 | currentColor | Y | A | keep lucide at 14px in pill tabs |
| 113 | Service (kit detail) | ServiceBom.tsx:153 | Replacement cost | lucide Tag | 10 | badge text | Y | A | 10px: keep lucide |
| 114 | Service (kit detail) | ServiceBom.tsx:160 | Service cost | lucide Receipt | 10 | badge text | Y | A | 10px: keep lucide |
| 115 | Service (FRU tab) | ServiceBom.tsx:214 | Empty state | mark fru | 72 | brand mark | Y | A | already custom |
| 116 | Service footer | ServiceBom.tsx:245 | Service coverage banner | lucide Wrench | 14 | text-warning | Y | A | keep lucide (warning-coloured banner, status context) |
| 117 | Software /software | SoftwareBom.tsx:55 | Page header mark | mark software | 44 | brand mark | Y | A | already custom |
| 118 | Software | SoftwareBom.tsx:59 | Export CycloneDX | lucide Download | 13 | button text | Y | B | <16px: keep lucide, or `export` |
| 119 | Software | SoftwareBom.tsx:60 | Run vulnerability scan | lucide ShieldAlert | 13 | button text (primary) | Y | B | <16px: keep lucide, or `scan` |
| 120 | Software | SoftwareBom.tsx:84 | Panel ECU Cyber Posture | lucide Cpu (icon="software") | 14 | text-tertiary | Y | A | enlarge to 20px → `ecu` (ECU ≠ software package) |
| 121 | Software ECU rows | SoftwareBom.tsx:94 | ECU row | lucide Cpu | 14 | text-tertiary | Y | A | keep lucide at 14px, or `ecu` |
| 122 | Software | SoftwareBom.tsx:175 | Empty state | mark software | 72 | brand mark | Y | A | already custom |
| 123 | Software CVE Trend | SoftwareBom.tsx:121 | Chart legend (Recharts) | recharts legend square | 14 | analytics-series | Y | C | keep |
| 124 | Changes /changes | Changes.tsx:63 | Page header mark | mark ecn | 44 | brand mark | Y | A | already custom |
| 125 | Changes | Changes.tsx:65 | New ECN | lucide FileEdit | 13 | button text (primary) | Y | B | <16px: keep lucide, or `ecn` |
| 126 | Changes list | Changes.tsx:98 | Search | lucide Search | 14 | text-tertiary | N | C | keep |
| 127 | Changes list | Changes.tsx:122 | Empty state | mark ecn | 72 | brand mark | Y | A | already custom |
| 128 | Changes list rows | Changes.tsx:126 | ECN row | lucide FileEdit (EntityIcon) | 14 | text-tertiary | Y | A | keep lucide at 14px |
| 129 | Changes detail (+ Part detail) | Changes.tsx:156, 171; PartMaster.tsx:131, 154 | Back to list | lucide ArrowLeft | 13 | button text | Y | C | keep |
| 130 | Changes detail | Changes.tsx:174 | Approve | lucide Check | 13 | text-success | Y | B | <16px: keep lucide, or `approve` |
| 131 | Changes detail | Changes.tsx:175 | Reject | lucide X | 13 | text-error | Y | B | <16px: keep lucide, or `reject` |
| 132 | Changes detail stepper | Changes.tsx:194 | Stage done | lucide Check | 14 | success-foreground on green circle | Y | C | keep: status |
| 133 | Changes detail | Changes.tsx:209 | Panel Change Summary | lucide FileEdit (icon="ecn") | 14 | text-tertiary | Y | A | enlarge to 20px → `ecn` |
| 134 | Changes detail timeline | Changes.tsx:262 | Approval event marker | lucide Check | 10 | success-foreground | N | C | keep: status marker |
| 135 | Changes detail timeline | Changes.tsx:263 | Raised event marker | lucide FileEdit | 10 | text-on-color | N | A | 10px: keep lucide |
| 136 | Changes detail timeline | Changes.tsx:282 | Person (raised by) | lucide UserCircle2 | 14 | opacity-60 | Y | A | keep lucide (14px inline) |
| 137 | Changes detail timeline | Changes.tsx:288 | Department | lucide Building2 | 10 | text-tertiary | Y | A | 10px: keep lucide |
| 138 | Changes detail (part history) | Changes.tsx:387 | Revision commit marker | lucide GitCommit | 8 | text-tertiary | N | C | keep |
| 139 | Changes detail | Changes.tsx:418 | Critical-change banner (status) | lucide AlertTriangle | 14 | text-error | Y | C | keep: status |
| 140 | Compare /compare | BomCompare.tsx:63 | Page header mark | mark variant | 44 | brand mark | Y | A | already custom; WRONG concept (variant on the compare page) → `compare` |
| 141 | Compare | BomCompare.tsx:65 | Export diff (CSV) | lucide Download | 13 | button text | Y | B | <16px: keep lucide, or `export` |
| 142 | Compare mode tab | BomCompare.tsx:70 | Tab: EBOM vs MBOM | lucide GitBranch (EntityIcon ebom) | 14 | currentColor | Y | A | keep lucide at 14px in pill tabs |
| 143 | Compare | BomCompare.tsx:82 | Variant A → B | lucide ArrowRight | 14 | text-tertiary | N | C | keep |
| 144 | Compare | BomCompare.tsx:89 | Differences badge | lucide GitCompare | 14 | badge outline | Y | A | keep lucide at 14px (badge) |
| 145 | Compare | BomCompare.tsx:150 | Panel Unmapped EBOM Assemblies | lucide Boxes (icon="assembly") | 14 | text-tertiary | Y | A | enlarge to 20px → `assembly` |
| 146 | Part Master /parts | PartMaster.tsx:44, 149 | Page header mark (list and detail) | mark part | 44 | brand mark | Y | A | already custom |
| 147 | Part Master | PartMaster.tsx:46 | New part | lucide Boxes | 13 | button text (primary) | Y | B | <16px: keep lucide; Boxes is the assembly icon, so the meaning is wrong → `add` |
| 148 | Part Master | PartMaster.tsx:50 | Search | lucide Search | 14 | text-tertiary | N | C | keep |
| 149 | Part Master | PartMaster.tsx:98 | Empty state | mark part | 72 | brand mark | Y | A | already custom |
| 150 | Part Master rows | PartMaster.tsx:104 | Part row | lucide Box (EntityIcon) | 14 | text-tertiary | Y | A | keep lucide at 14px |
| 151 | Part detail | PartMaster.tsx:156 | Propose change | lucide FileEdit | 13 | button text (primary) | Y | B | <16px: keep lucide, or `ecn` |
| 152 | Part detail | PartMaster.tsx:162 | Panel Part Details | lucide Box (icon="part") | 14 | text-tertiary | Y | A | enlarge to 20px → `part` |
| 153 | Part detail | PartMaster.tsx:183 | Panel Supplier | lucide Truck (icon="supplier") | 14 | text-tertiary | Y | A | enlarge to 20px → `supplier` |
| 154 | Part detail | PartMaster.tsx:214, 234 | Open related part (Where-Used, Uses) | lucide ExternalLink | 14 | opacity-50 | N | C | keep |
| 155 | Part detail | PartMaster.tsx:245 | Panel Manufacturing Routing | lucide Factory (icon="mbom") | 14 | text-tertiary | Y | A | enlarge to 20px → `mbom` |
| 156 | Part detail | PartMaster.tsx:261 | Panel Service Kits | lucide Wrench (icon="service-kit") | 14 | text-tertiary | Y | A | enlarge to 20px → `service-kit` |
| 157 | Part detail | PartMaster.tsx:269 | Panel Software Running on ECU | lucide Cpu (icon="software") | 14 | text-tertiary | Y | A | enlarge to 20px → `software` |
| 158 | Part detail | PartMaster.tsx:287 | Panel ECNs Affecting Part | lucide FileEdit (icon="ecn") | 14 | text-tertiary | Y | A | enlarge to 20px → `ecn` |
| 159 | Suppliers /suppliers | SupplierIntel.tsx:46 | Page header mark | mark supplier | 44 | brand mark | Y | A | already custom |
| 160 | Suppliers | SupplierIntel.tsx:48 | Predict disruptions (AI) | lucide Sparkles | 13 | button text (primary) | Y | B | <16px: keep lucide, or `ai` |
| 161 | Suppliers | SupplierIntel.tsx:70 | Panel AI Disruption Forecast | lucide Truck (icon="supplier") | 14 | text-tertiary | Y | A | enlarge to 20px → `ai` (wrong concept today) |
| 162 | Suppliers | SupplierIntel.tsx:70 | Panel action: AI marker | lucide Sparkles | 14 | text-quaternary | N | A | enlarge to 20px → `ai`, or drop (duplicates the header icon) |
| 163 | Suppliers forecast rows | SupplierIntel.tsx:80 | Risk badge (status) | lucide AlertTriangle | 10 | badge warning | Y | C | keep: status |
| 164 | Suppliers | SupplierIntel.tsx:93 | Search | lucide Search | 14 | text-tertiary | N | C | keep |
| 165 | Suppliers | SupplierIntel.tsx:118 | Empty state | mark supplier | 72 | brand mark | Y | A | already custom |
| 166 | Suppliers rows | SupplierIntel.tsx:122 | Supplier row | lucide Truck (EntityIcon) | 14 | text-tertiary | Y | A | keep lucide at 14px |
| 167 | Suppliers rows | SupplierIntel.tsx:123 | Country · region | lucide MapPin | 14 | text-tertiary | Y | A | keep lucide at 14px, or `region` |
| 168 | Suppliers footer | SupplierIntel.tsx:140 | Open Part Master hint | lucide ExternalLink | 14 | text-tertiary | N | C | keep |
| 169 | Field Quality /field | FieldQuality.tsx:30 | Page header mark | mark field-event | 44 | brand mark (looks like a stop sign) | Y | A | already custom; see decision D1 |
| 170 | Field Quality | FieldQuality.tsx:32 | Scope recall (AI) | lucide Sparkles | 13 | button text (primary) | Y | B | <16px: keep lucide, or `ai` |
| 171 | Field Quality events table | FieldQuality.tsx:112 | Trace affected VINs | lucide MapPin | 13 | ghost button text | Y | B | <16px: keep lucide, or `trace` |
| 172 | Field Quality | FieldQuality.tsx:123 | UNECE R155 reportability banner (status) | lucide AlertTriangle | 20 | text-warning | Y | C | keep: status |
| 173 | Reports /reports | Reports.tsx:110 | Page header mark | mark report | 44 | brand mark | Y | A | already custom |
| 174 | Reports | Reports.tsx:112 | Schedule report | lucide Calendar | 13 | button text (primary) | Y | B | <16px: keep lucide, or `schedule` |
| 175 | Reports cards ×12 | Reports.tsx:119 | Report type (the same icon for all 12 types) | lucide FileBarChart (EntityIcon report) | 17 | text-tertiary on 36px puck | N (title below) | A | enlarge to 22px in the 36px puck → per-type icons (see section 4) |
| 176 | Reports cards ×12 | Reports.tsx:128 | Generate report | lucide Download | 13 | ghost button text | Y | B | <16px: keep lucide, or `generate` |
| 177 | Login /login | Login.tsx:74 (ThemeToggle) | Theme toggle | lucide Sun/Moon | 16 | text-tertiary | N | C | counted once under Top bar |

### 1.1 Inconsistencies found (the same concept drawn with different icons)

- **Software**: nav = `ShieldAlert`, entity/stage/panel = `Cpu`, Dashboard Cyber button and Run scan = `ShieldAlert`, EBOM footer = `ShieldAlert`.
- **ECU**: shares `Cpu` with Software; the Electrical system tile (`ELE`) also uses `Cpu`.
- **Part vs assembly**: Part Master nav and New part button use `Boxes` (the assembly icon); `Box` is also the Body system tile and the unknown-system fallback.
- **Dashboard mark** = `assembly`; **Compare mark** = `variant`; the stage pipeline panel = `variant`; AI Disruption Forecast panel = `supplier`.
- **Factory**: MBOM entity, plant cards and the Release to MES action all use `Factory`.
- **Download**: top-bar Export, Export CycloneDX, Export diff and report **Generate** are one glyph for two meanings.
- **MapPin**: scope, supplier country/region and the **Trace** action.
- **Sparkles** (AI) is used for five different AI features, each unlabelled as a concept.
- **Warning triangle** is used for a non-warning empty state (graph, no matching nodes), and the EBOM validation banner uses the EBOM branch icon.
- **Reports**: all 12 report types share one icon.
- Hover-only icons found: pinned-row `X` (Sidebar.tsx:260) and the Select option `Check` (ui/select.tsx:115). Interaction-only: drawer close, graph clear, node pills, graph empty state, Reject / Approve (detail only), timeline markers. The notification, account and program menus, the scope popover and the sidebar flyout contain **no icons**.

## 2. Classification and flags

- **A (concept/entity): 96 rows.** Candidates for a generated icon.
- **B (action): 22 rows.** Candidates only if rendered ≥16px. Of these 21 are 13px in buttons, so they stay lucide unless D2 is approved. One B row is a 16px icon button (top-bar Export); the graph zoom controls are C.
- **C (control or status): 59 rows.** Keep lucide: chevrons, close ×, search, sort/check ticks, menu, theme, kebab (none), external-link, collapse, zoom and the whole status family (warning triangle, check-circle, check). Status icons must never become brand marks (section 6).

**A/B lucide icons below 20px and the proposed fix**

| Where | file:line | Icon | Now | Proposal |
|---|---|---|---|---|
| Top bar | TopNav.tsx:78 | VIN / program scope | 13px | keep lucide (inside a 32px pill); optional `scope` |
| Top bar | TopNav.tsx:126 | Notifications | 16px | enlarge to 20px in the 32px puck, use `notifications` |
| Top bar (md+) | TopNav.tsx:154 | Export (global) | 16px | enlarge to 20px in the 32px puck, use `export` |
| Lifecycle strip (all routes) | PipelineBar.tsx:70 | Pipeline stage: CAT BOM | 14px | enlarge to 20px: chip h-7→h-9, strip h-10→h-12; else keep lucide |
| Lifecycle strip (all routes) | PipelineBar.tsx:70 | Pipeline stage: EBOM | 14px | enlarge to 20px: chip h-7→h-9, strip h-10→h-12; else keep lucide |
| Lifecycle strip (all routes) | PipelineBar.tsx:70 | Pipeline stage: MBOM | 14px | enlarge to 20px: chip h-7→h-9, strip h-10→h-12; else keep lucide |
| Lifecycle strip (all routes) | PipelineBar.tsx:70 | Pipeline stage: Software | 14px | enlarge to 20px: chip h-7→h-9, strip h-10→h-12; else keep lucide |
| Lifecycle strip (all routes) | PipelineBar.tsx:70 | Pipeline stage: Service | 14px | enlarge to 20px: chip h-7→h-9, strip h-10→h-12; else keep lucide |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Command Center (/) | 17px | enlarge to 22px in the 36px puck → command-center (new) |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Variants & Configuration (/variants) | 17px | enlarge to 22px in the 36px puck → variant |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Engineering BOM (/ebom) | 17px | enlarge to 22px in the 36px puck → ebom |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Manufacturing BOM (/mbom) | 17px | enlarge to 22px in the 36px puck → mbom |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Service BOM (/service) | 17px | enlarge to 22px in the 36px puck → service-kit |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Software BOM (/software) | 17px | enlarge to 22px in the 36px puck → software (nav uses ShieldAlert, entity map uses Cpu) |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Change Management (/changes) | 17px | enlarge to 22px in the 36px puck → ecn |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: BOM Compare (/compare) | 17px | enlarge to 22px in the 36px puck → compare (new) |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Field Quality (/field) | 17px | enlarge to 22px in the 36px puck → field-event (see decision D1) |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Part Master (/parts) | 17px | enlarge to 22px in the 36px puck → part (nav uses Boxes = the assembly icon) |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Supplier Intelligence (/suppliers) | 17px | enlarge to 22px in the 36px puck → supplier |
| Sidebar: rail, expanded, flyout, mobile drawer | nav.ts + Sidebar.tsx:193 | Page: Reports & Exports (/reports) | 17px | enlarge to 22px in the 36px puck → report |
| Sidebar (expanded/drawer) | Sidebar.tsx:244 | Pinned section marker | 12px | keep lucide (12px eyebrow glyph) |
| Dashboard / | Dashboard.tsx:78 | Go to ECNs | 13px | keep (13px in button) or `ecn` |
| Dashboard / | Dashboard.tsx:81 | Go to cyber (Software BOM) | 13px | keep or `security` |
| Dashboard / | Dashboard.tsx:84 | Export reports | 13px | keep or `report` |
| Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Powertrain (PWT) | 16px | enlarge to 28px: tile 40→44px → `system-powertrain` |
| Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Battery (BAT) | 16px | enlarge to 28px → `system-battery` |
| Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Chassis (CHS) | 16px | enlarge to 28px → `system-chassis` |
| Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Body (BDY) | 16px | enlarge to 28px → `system-body` (Box collides with the part icon) |
| Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Interior (INT) | 16px | enlarge to 28px → `system-interior` |
| Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:216 | System: Electrical (ELE) | 16px | enlarge to 28px → `system-electrical` (Cpu collides with the software icon) |
| Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:28 | System fallback (unknown prefix) | 16px | enlarge to 28px → `system` |
| Dashboard SystemHealthMatrix | SystemHealthMatrix.tsx:278 | Open ECNs for a system | 12px | keep lucide (12px, warning-coloured status chip) |
| Dashboard | Dashboard.tsx:155 | Panel Program Stage Pipeline | 14px | enlarge to 20px in header (h-11) → `stage-*` / `variant` (wrong concept today) |
| Dashboard | Dashboard.tsx:180 | AI Assistant panel action | 14px | enlarge to 20px → `ai` |
| Dashboard | Dashboard.tsx:228 | Panel ECN Approval Queue | 14px | enlarge to 20px → `ecn` |
| Variants | Variants.tsx:53 | New variant | 13px | <16px: keep lucide (or `add` if buttons grow) |
| Variants (table rows) | Variants.tsx:88 | Variant code row | 14px | keep lucide at 14px (dense row) |
| Variants (detail card) | Variants.tsx:108 | Selected variant heading | 14px | enlarge to 20px → `variant` |
| Variants | Variants.tsx:125 | Panel Effectivity Matrix | 14px | enlarge to 20px → `variant` |
| EBOM | EbomManager.tsx:336 | Compare | 13px | <16px: keep lucide, or `compare` if buttons grow |
| EBOM | EbomManager.tsx:337 | Add relationship | 13px | <16px: keep lucide, or `link` |
| EBOM | EbomManager.tsx:338 | Add component | 13px | <16px: keep lucide, or `add` |
| EBOM tree | EbomManager.tsx:97 | Row: assembly (has children) | 14px | keep lucide at 14px in dense rows; type-aware icons optional |
| EBOM tree | EbomManager.tsx:97 | Row: part (leaf) | 14px | keep lucide at 14px |
| EBOM footer | EbomManager.tsx:452 | Validation banner | 14px | enlarge to 20px → `validation`; GitBranch is the EBOM icon, so the meaning clashes |
| EBOM footer | EbomManager.tsx:457 | Decorative (no meaning, no label) | 14px | remove or replace; decorative |
| EBOM footer | EbomManager.tsx:458 | Decorative (no meaning, no label) | 14px | remove or replace; decorative |
| EBOM graph canvas | EbomGraphView.tsx:457 | Status bar: selected node | 14px | keep lucide at 14px (status-bar chip) |
| MBOM | MbomManager.tsx:56 | Sync from EBOM | 13px | <16px: keep lucide, or `sync` |
| MBOM | MbomManager.tsx:57 | Release to MES | 13px | <16px: keep lucide, or `release` |
| MBOM plant cards (per program) | MbomManager.tsx:68 | Plant: Pune | 14px | enlarge to 20px → `plant` |
| MBOM plant cards (per program) | MbomManager.tsx:68 | Plant: Detroit | 14px | enlarge to 20px → `plant` |
| MBOM plant cards (per program) | MbomManager.tsx:68 | Plant: Chengdu | 14px | enlarge to 20px → `plant` |
| MBOM plant cards (per program) | MbomManager.tsx:68 | Plant: San Antonio | 14px | enlarge to 20px → `plant` |
| MBOM plant cards (per program) | MbomManager.tsx:68 | Plant: Querétaro | 14px | enlarge to 20px → `plant` |
| MBOM table | MbomManager.tsx:177 | Operation row | 14px | keep lucide at 14px (dense row) |
| Service | ServiceBom.tsx:79 | Service manual | 13px | <16px: keep lucide, or `manual` |
| Service | ServiceBom.tsx:80 | New service kit | 13px | <16px: keep lucide, or `add` |
| Service tab | ServiceBom.tsx:97 | Tab: Service Kits | 14px | keep lucide at 14px in pill tabs |
| Service tab | ServiceBom.tsx:98 | Tab: Field-Replaceable Units | 14px | keep lucide at 14px in pill tabs |
| Service (kit detail) | ServiceBom.tsx:153 | Replacement cost | 10px | 10px: keep lucide |
| Service (kit detail) | ServiceBom.tsx:160 | Service cost | 10px | 10px: keep lucide |
| Service footer | ServiceBom.tsx:245 | Service coverage banner | 14px | keep lucide (warning-coloured banner, status context) |
| Software | SoftwareBom.tsx:59 | Export CycloneDX | 13px | <16px: keep lucide, or `export` |
| Software | SoftwareBom.tsx:60 | Run vulnerability scan | 13px | <16px: keep lucide, or `scan` |
| Software | SoftwareBom.tsx:84 | Panel ECU Cyber Posture | 14px | enlarge to 20px → `ecu` (ECU ≠ software package) |
| Software ECU rows | SoftwareBom.tsx:94 | ECU row | 14px | keep lucide at 14px, or `ecu` |
| Changes | Changes.tsx:65 | New ECN | 13px | <16px: keep lucide, or `ecn` |
| Changes list rows | Changes.tsx:126 | ECN row | 14px | keep lucide at 14px |
| Changes detail | Changes.tsx:174 | Approve | 13px | <16px: keep lucide, or `approve` |
| Changes detail | Changes.tsx:175 | Reject | 13px | <16px: keep lucide, or `reject` |
| Changes detail | Changes.tsx:209 | Panel Change Summary | 14px | enlarge to 20px → `ecn` |
| Changes detail timeline | Changes.tsx:263 | Raised event marker | 10px | 10px: keep lucide |
| Changes detail timeline | Changes.tsx:282 | Person (raised by) | 14px | keep lucide (14px inline) |
| Changes detail timeline | Changes.tsx:288 | Department | 10px | 10px: keep lucide |
| Compare | BomCompare.tsx:65 | Export diff (CSV) | 13px | <16px: keep lucide, or `export` |
| Compare mode tab | BomCompare.tsx:70 | Tab: EBOM vs MBOM | 14px | keep lucide at 14px in pill tabs |
| Compare | BomCompare.tsx:89 | Differences badge | 14px | keep lucide at 14px (badge) |
| Compare | BomCompare.tsx:150 | Panel Unmapped EBOM Assemblies | 14px | enlarge to 20px → `assembly` |
| Part Master | PartMaster.tsx:46 | New part | 13px | <16px: keep lucide; Boxes is the assembly icon, so the meaning is wrong → `add` |
| Part Master rows | PartMaster.tsx:104 | Part row | 14px | keep lucide at 14px |
| Part detail | PartMaster.tsx:156 | Propose change | 13px | <16px: keep lucide, or `ecn` |
| Part detail | PartMaster.tsx:162 | Panel Part Details | 14px | enlarge to 20px → `part` |
| Part detail | PartMaster.tsx:183 | Panel Supplier | 14px | enlarge to 20px → `supplier` |
| Part detail | PartMaster.tsx:245 | Panel Manufacturing Routing | 14px | enlarge to 20px → `mbom` |
| Part detail | PartMaster.tsx:261 | Panel Service Kits | 14px | enlarge to 20px → `service-kit` |
| Part detail | PartMaster.tsx:269 | Panel Software Running on ECU | 14px | enlarge to 20px → `software` |
| Part detail | PartMaster.tsx:287 | Panel ECNs Affecting Part | 14px | enlarge to 20px → `ecn` |
| Suppliers | SupplierIntel.tsx:48 | Predict disruptions (AI) | 13px | <16px: keep lucide, or `ai` |
| Suppliers | SupplierIntel.tsx:70 | Panel AI Disruption Forecast | 14px | enlarge to 20px → `ai` (wrong concept today) |
| Suppliers | SupplierIntel.tsx:70 | Panel action: AI marker | 14px | enlarge to 20px → `ai`, or drop (duplicates the header icon) |
| Suppliers rows | SupplierIntel.tsx:122 | Supplier row | 14px | keep lucide at 14px |
| Suppliers rows | SupplierIntel.tsx:123 | Country · region | 14px | keep lucide at 14px, or `region` |
| Field Quality | FieldQuality.tsx:32 | Scope recall (AI) | 13px | <16px: keep lucide, or `ai` |
| Field Quality events table | FieldQuality.tsx:112 | Trace affected VINs | 13px | <16px: keep lucide, or `trace` |
| Reports | Reports.tsx:112 | Schedule report | 13px | <16px: keep lucide, or `schedule` |
| Reports cards ×12 | Reports.tsx:119 | Report type (the same icon for all 12 types) | 17px | enlarge to 22px in the 36px puck → per-type icons (see section 4) |
| Reports cards ×12 | Reports.tsx:128 | Generate report | 13px | <16px: keep lucide, or `generate` |

Summary of proposals: **enlarge** (sidebar puck 17→22, system tile 16→28, panel headers 14→20, lifecycle chips 14→20 with taller chips, report puck 17→22, bell and export 16→20) or **keep lucide** (13px buttons, 14px dense rows, 10 to 12px badges and chips).

## 3. Missing icons

Priority: H high (page identity or primary visual), M medium (panel header or KPI), L low. Size = proposed render size in px. Where the proposal says “keep lucide” it is listed for completeness only.

| # | file:line | Where / what has no icon | Suggested id | Pri | px |
|---|---|---|---|---|---|
| 1 | Changes.tsx:165 | ECN detail page header has no mark (list has `ecn`) | ecn | H | 44 |
| 2 | Changes.tsx:154 · PartMaster.tsx:129 | ‘No change / No part’ not-found headers, no mark | not-found | L | 44 |
| 3 | Dashboard.tsx:73 | Header uses `assembly`; Command Center has no mark of its own | command-center | H | 44 |
| 4 | BomCompare.tsx:63 | Header uses `variant`; compare has no mark of its own | compare | H | 44 |
| 5 | NotFound.tsx:12 | 404 page has no icon at all | not-found | M | 72 |
| 6 | Login.tsx:30-60 | Login form fields have no leading icons (optional) | lucide Mail/Lock, keep | L | 14 |
| 7 | Dashboard.tsx:91 | 4 program cards (fleet summary), no vehicle icon | vehicle-suv, vehicle-sedan, vehicle-truck, vehicle-ev | H | 28 to 36 |
| 8 | Dashboard.tsx:132 | 6 KPI tiles: Parts, Assemblies, Operations, Service kits, Suppliers, Variants | part, assembly, mbom, service-kit, supplier, variant | H | 20 |
| 9 | Dashboard.tsx:144-147 | 4 HealthArc cards: EBOM maturity, MBOM readiness, Supply risk, Service scope | ebom, mbom, supplier, service-kit | M | 20 |
| 10 | SystemHealthMatrix.tsx:148 | System Health Matrix panel has no header icon | system | M | 20 |
| 11 | SystemHealthMatrix.tsx:~172-190 | Matrix summary tiles Systems / Parts / Design / Mfg / Supply / Cyber (no icons) | system, part, ebom, mbom, supplier, security | L | 20 |
| 12 | SystemHealthMatrix.tsx:~207-262 | Matrix column cells (Design, Mfg, Supply, Cyber) only show % | ebom, mbom, supplier, security | L | 20 |
| 13 | Dashboard.tsx:155 | Stage pipeline panel uses `variant`; 5 stage labels (Concept to SOP) at :200 have no icons | stage-concept … stage-sop | H | 20 |
| 14 | Dashboard.tsx:178-181 | AI Assistant panel: header icon is a 14px lucide on the right only | ai | M | 20 |
| 15 | Dashboard.tsx:217 | Security Hub panel has no icon | security | H | 20 |
| 16 | Dashboard.tsx:262 | Change Velocity panel has no icon | trend | M | 20 |
| 17 | Dashboard.tsx:287 | Live Quality Stream panel has no icon (only a dot) | quality | M | 20 |
| 18 | Dashboard.tsx:295 | Field-events empty state has no mark (the ECN one has) | field-event or quality | M | 72 |
| 19 | Dashboard.tsx:~246 (ECN queue cards) | ECN cards show only id and badge | ecn | L | 20 |
| 20 | nav.ts:16 | Command Center nav = generic LayoutDashboard | command-center | H | 22 |
| 21 | nav.ts:27 | BOM Compare nav = GitCompare | compare | H | 22 |
| 22 | Sidebar.tsx:255-262 | Pinned rows show a dot only (pinnedItems already carry ids ecn / pn / sup) | ecn, part, supplier | M | 20 |
| 23 | Sidebar.tsx:44 | Program Tree rows have health dots only (EBOM tree has type icons) | system, assembly, part (keep lucide at 14) | L | 14 |
| 24 | TopNav.tsx:50-57 | Program switcher pill and its menu items (TopNav.tsx:60-72) have no vehicle icon | vehicle-suv etc. | L | 20 |
| 25 | TopNav.tsx:78 | Scope pill uses a generic MapPin | scope | L | 13 (keep lucide) |
| 26 | TopNav.tsx:137-146 | Notification items have no type icons | ecn, supplier, quality … | L | 20 |
| 27 | TopNav.tsx:168 | Account avatar is initials only | person | L | 32 |
| 28 | EbomManager.tsx:344-346 | Tree / Table / Graph view tabs have no icons | lucide ListTree/Table/Network, keep | L | 14 |
| 29 | EbomManager.tsx:381 | 5 KPI tiles: Parts in view, Unique assemblies, ECUs, Rolled-up cost, Parts in program | part, assembly, ecu, cost, part | M | 20 |
| 30 | EbomManager.tsx:352 | Variant select has no icon | variant | L | 14 |
| 31 | EbomManager.tsx:97 | Tree rows use only 2 icons; Vehicle, System, ECU, Harness, Sub-Assembly have none | vehicle, system, ecu, harness, assembly | M | 14 (keep lucide) or 20 |
| 32 | EbomManager.tsx:390, 401 | Panels ‘Structure’ and ‘Parts’ have no header icon | ebom | M | 20 |
| 33 | EbomManager.tsx:162-209 | Drawer header has no part-type icon; tabs have no icons | part-type ids; history, where-used, plant, software | M | 20 |
| 34 | EbomManager.tsx:244 (Manufacturing tab rows) | Plant not marked | plant | L | 20 |
| 35 | EbomManager.tsx:419 | Table-view empty state has no mark | ebom | M | 72 |
| 36 | EbomGraphView.tsx:408-422 | Graph legend (Vehicle, System, Assembly, ECU, Part, Harness) uses coloured dots | vehicle, system, assembly, ecu, part, harness | M | 14 to 20 |
| 37 | EbomGraphView.tsx:127-133 | Graph node type chip has no icon | vehicle, system, assembly, ecu, part, harness | M | 20 |
| 38 | EbomGraphView.tsx:472 | Empty graph uses a warning triangle | ebom (mark) | M | 72 |
| 39 | Variants.tsx:57-65 | 4 KPI tiles: Variants, Planned units, Configuration rules, Conflicts | variant, volume, config-rule, (status stays lucide) | M | 20 |
| 40 | Variants.tsx:~112-123 | Selected-variant card details (market, powertrain, trim) | market | L | 20 |
| 41 | MbomManager.tsx:98 | ‘Unmapped’ panel has no header icon | validation | L | 20 |
| 42 | MbomManager.tsx:200 | ‘Consumables & Phantom Items’ header has no icon | mbom | L | 20 |
| 43 | MbomManager.tsx:93 | Production line badges have no icon | plant | L | 14 |
| 44 | ServiceBom.tsx:86-91 | 6 KPI tiles: Service kits, FRUs, Replacement, Labor, Service cost, FRU replacement | service-kit, fru, cost, lead-time, cost, fru | M | 20 |
| 45 | ServiceBom.tsx:129 | Service category badges (Routine/Wear/Repair/Major/Recall) have no icons | none (keep text) | L | - |
| 46 | SoftwareBom.tsx:73 | 5 KPI tiles: Packages, ECUs tracked, Open CVEs, Critical CVEs, License clean | software, ecu, cve, cve, license | M | 20 |
| 47 | SoftwareBom.tsx:113 | CVE Trend panel has no header icon | cve | M | 20 |
| 48 | SoftwareBom.tsx:~195 | Vulnerability rows have no icon | cve | L | 14 |
| 49 | Changes.tsx:70-75 | 6 ECN state KPI tiles (Draft, In Review, Approved, Released, Rejected/Cancelled) | ecn (or per-state, optional) | L | 20 |
| 50 | Changes.tsx:185-200 | 4-step stepper uses numbers (Draft / In Review / Approved / Released) | ecn, validation, approve, release (optional) | L | 20 |
| 51 | Changes.tsx:223 | Impact Analysis header has no icon | validation | M | 20 |
| 52 | Changes.tsx:226-243 | 4 impact tiles: Affected parts, Affected variants, Cost per vehicle, VINs in field | part, variant, cost, vin | M | 20 |
| 53 | Changes.tsx:249 | Timeline header has no icon | history | M | 20 |
| 54 | Changes.tsx:307 | Affected variants header has no icon | variant | M | 20 |
| 55 | Changes.tsx:349 | Affected parts / revision history header has no icon | part | M | 20 |
| 56 | BomCompare.tsx:70-71 | ‘Variant vs variant’ mode tab has no icon (the EBOM vs MBOM tab has) | variant | L | 14 |
| 57 | BomCompare.tsx:77-84 | Variant A / B selects have no icons | variant | L | 14 |
| 58 | PartMaster.tsx:202 | Where-Used (Parents) header has no icon | where-used | M | 20 |
| 59 | PartMaster.tsx:222 | Uses (Children) header has no icon | assembly | M | 20 |
| 60 | PartMaster.tsx:303 | Revision History header has no icon | history | M | 20 |
| 61 | PartMaster.tsx:162-182 | Part Details header does not show the part type (Vehicle, System, ECU, Harness …) | part-type ids | L | 20 |
| 62 | SupplierIntel.tsx:58-65 | 4 KPI tiles: Suppliers, Single-source, On watchlist, High-risk disruption | supplier, supplier, watchlist, disruption | M | 20 |
| 63 | CveHeatmap.tsx:25 | Supplier Risk by Region & Category panel has no icon | region | M | 20 |
| 64 | SupplierIntel.tsx:70 | AI Disruption Forecast uses `supplier` | ai | M | 20 |
| 65 | FieldQuality.tsx:42-50 | 4 KPI tiles: Pilot VINs built, Open quality events, VINs impacted, Critical open | vin, quality, vin, (status stays text) | M | 20 |
| 66 | FieldQuality.tsx:53 | AI Root-Cause header has no icon | ai | M | 20 |
| 67 | FieldQuality.tsx:62-68 | 3 root-cause cards (Most likely cause, Common factor, Recommended action) have no icons | none (text) | L | - |
| 68 | FieldQuality.tsx:75 | Field Quality Events header has no icon | quality | M | 20 |
| 69 | Reports.tsx:119 | 12 report cards share one icon; most report types have an entity icon that is not used | ebom, mbom, service-kit, compliance, software, system-battery, ecn, supplier, quality, trend, executive, compliance | H | 22 |

## 4. Deduplicated icon catalogue

One id, one meaning. The same id is used everywhere (sidebar puck, page header, panel header, rows, chips, KPI tiles, empty states).

### 4.1 Already covered by the 12 existing PNGs (reuse, do not regenerate)

| id | Reuse at |
|---|---|
| `part` | Part Master (nav, header, rows, panels), part-type Part, KPI Parts, impact tiles |
| `assembly` | Sub-assembly rows, Uses panel, KPI Assemblies, compare panel (stop using it as the Dashboard mark and Part Master nav icon) |
| `variant` | Variants (nav, header, rows, panels, KPI), CAT BOM stage chip |
| `ebom` | Engineering BOM (nav, header, panels, stage chip, EBOM vs MBOM tab, HealthArc) |
| `mbom` | Manufacturing BOM (nav, header, panels, stage chip, KPI Operations, Release to MES context) |
| `service-kit` | Service BOM (nav, header, tab, panels, KPIs, stage chip) |
| `fru` | FRU tab, FRU empty state, KPI FRUs |
| `software` | Software BOM (nav, header, panels, stage chip, KPI Packages) |
| `ecn` | Change Management (nav, header, rows, panels, queue, Dashboard ECN button, Propose change, New ECN) |
| `supplier` | Suppliers (nav, header, rows, panels, KPIs, supply-risk HealthArc) |
| `field-event` | Field Quality (nav, header, empty state). Looks like a stop sign: see decision D1 |
| `report` | Reports (nav, header, Dashboard Export button); each card gets its own type icon |

### 4.2 New ids to generate (52) and spares (8)

Class A concept, B action. Visual descriptions avoid warning, octagon and triangle shapes and contain no text.

| # | Sheet | id | Meaning | Used at | Cls | Draw |
|---|---|---|---|---|---|---|
| 1 | 1 | `system-powertrain` | System: Powertrain | Dashboard System Health Matrix, EBOM tree/drawer, graph | A | a compact engine block with two cylinder heads and a small gear on its side |
| 2 | 1 | `system-battery` | System: HV Battery & Charging | System Health Matrix, EU Battery DPP report | A | a rounded battery pack block with a raised terminal on top and a small plug on the front |
| 3 | 1 | `system-chassis` | System: Chassis & Suspension | System Health Matrix | A | a single wheel with a coil spring and a short axle bar through its centre |
| 4 | 1 | `system-body` | System: Body, Closures & Exterior | System Health Matrix | A | a single car door with a window and handle |
| 5 | 1 | `system-interior` | System: Interior, Seats & HVAC | System Health Matrix | A | a car seat in 3/4 view with a headrest |
| 6 | 1 | `system-electrical` | System: Electrical, ADAS & Infotainment | System Health Matrix | A | a rounded square tile with a bold lightning bolt in grey |
| 7 | 1 | `system` | Generic system / unknown-prefix fallback / part type System | SystemHealthMatrix fallback, EBOM tree, graph legend | A | a hexagonal block built from three joined modules |
| 8 | 1 | `vehicle` | Vehicle (part type, root of the EBOM) | EBOM root row, graph legend, drawer header | A | a plain hatchback car in 3/4 view, rounded body, two wheels visible |
| 9 | 1 | `ecu` | ECU (hardware controller) | ECU Cyber Posture rows and panel, EBOM tree/graph, Part Master | A | a flat rectangular control module box with a plug connector on one side and two mounting ears |
| 10 | 1 | `harness` | Wiring harness (part type) | EBOM tree/graph legend | A | a bundle of thick cables looped once, with a connector plug on each end |
| 11 | 1 | `plant` | Plant / production line | MBOM plant cards, Manufacturing tab, KPI plants | A | a conveyor belt with a small box on it and a robot arm above |
| 12 | 1 | `region` | Region / country (supplier risk, location) | Supplier country · region, heatmap panel | A | a globe on a small stand with a latitude band |
| 13 | 2 | `vehicle-suv` | Program category: SUV | Dashboard program cards, program switcher | A | a tall SUV with a roof rail, 3/4 front view |
| 14 | 2 | `vehicle-sedan` | Program category: Sedan | Dashboard program cards, program switcher | A | a low three-box sedan, 3/4 front view |
| 15 | 2 | `vehicle-truck` | Program category: Truck | Dashboard program cards, program switcher | A | a pickup truck with an open cargo bed, 3/4 front view |
| 16 | 2 | `vehicle-ev` | Program category: EV Crossover | Dashboard program cards, program switcher | A | a sleek crossover with a small plug socket shape on the rear fender |
| 17 | 2 | `stage-concept` | Stage: Concept | Dashboard stage pipeline | A | a rounded light bulb with a small grey base |
| 18 | 2 | `stage-design` | Stage: Design | Dashboard stage pipeline | A | a pencil lying across a drafting triangle ruler |
| 19 | 2 | `stage-engineering` | Stage: Engineering | Dashboard stage pipeline | A | two interlocking gears, one large and one small |
| 20 | 2 | `stage-preproduction` | Stage: Pre-Production | Dashboard stage pipeline | A | a short row of three small boxes on a tray, the last slightly lifted |
| 21 | 2 | `stage-sop` | Stage: SOP (start of production) | Dashboard stage pipeline | A | a chequered flag on a short pole |
| 22 | 2 | `command-center` | Page: Command Center (dashboard) | Sidebar nav, Dashboard header | A | a rounded dashboard panel with a round dial gauge and two small bars |
| 23 | 2 | `compare` | Page / action: BOM Compare | Sidebar nav, Compare header, Compare buttons and badges | A/B | two overlapping rounded cards, the front one offset to the right, each with two grey bars |
| 24 | 2 | `notifications` | Notifications | Top bar bell | A | a rounded bell with a small round clapper beneath it |
| 25 | 3 | `add` | Add (new component / variant / service kit / part) | Add component, New variant, New service kit, New part | B | a rounded block with a bold plus sign standing out in front |
| 26 | 3 | `link` | Add relationship (link two parts) | EBOM toolbar | B | two chain links joined together at a slight angle |
| 27 | 3 | `sync` | Sync from EBOM / re-generate | MBOM Sync from EBOM | B | two curved arrows chasing each other in a circle |
| 28 | 3 | `release` | Release to MES / production release | MBOM Release to MES, ECN Released stage | B | a small rocket-like capsule lifting off from a short platform |
| 29 | 3 | `approve` | Approve | ECN Approve button, ECN Approved stage | B | a rounded stamp with a bold tick on its face |
| 30 | 3 | `reject` | Reject | ECN Reject button | B | a rounded stamp with a bold cross on its face |
| 31 | 3 | `export` | Export | Top bar export, Export CycloneDX, Export diff | B | an open box with an arrow leaving from its top to the right |
| 32 | 3 | `generate` | Generate report | Reports Generate | B | a document sheet with a small play-triangle badge on its corner |
| 33 | 3 | `schedule` | Schedule | Reports Schedule report | B | a calendar block with a small clock face on its corner |
| 34 | 3 | `scan` | Vulnerability scan | Software Run vulnerability scan | B | a magnifying glass over a small circuit chip |
| 35 | 3 | `trace` | Trace (affected VINs / lineage) | Field Quality Trace | B | two round nodes joined by a dotted winding path, a pin on one end |
| 36 | 3 | `manual` | Service manual | Service Service manual | B | an open book with two grey page lines on each side |
| 37 | 4 | `ai` | AI assistant / predict / forecast | AI panels, Scope recall, Predict disruptions | A | one large four-point sparkle star with two small ones |
| 38 | 4 | `security` | Security / cyber | Security Hub, Dashboard Cyber, KPI Cyber | A | a rounded shield with a keyhole in the middle |
| 39 | 4 | `cve` | CVE / vulnerability | Software KPIs, CVE Trend, vulnerability rows | A | a small round beetle bug with six short legs |
| 40 | 4 | `validation` | Validation / checks | EBOM validation footer, ECN Impact Analysis, Unmapped panel | A | a clipboard with two tick rows |
| 41 | 4 | `history` | History / revisions / timeline | Revision History, Timeline, drawer History | A | a round clock face with a curved arrow circling back |
| 42 | 4 | `where-used` | Where-Used (parents) | Part Where-Used, drawer Where-Used tab | A | a box with an arrow pointing up to a larger box above |
| 43 | 4 | `cost` | Cost | KPI cost tiles, Replacement/Service cost | A | a short stack of three coins |
| 44 | 4 | `watchlist` | Watchlist | Supplier KPI On watchlist | A | a rounded eye with a large round pupil |
| 45 | 4 | `disruption` | Supply disruption | Supplier KPI High-risk disruption | A | a chain with one link broken apart (no warning shapes) |
| 46 | 4 | `license` | License / compliance clean | Software KPI License clean | A | a certificate scroll with a ribbon rosette |
| 47 | 4 | `quality` | Quality / quality stream / PPAP | Live Quality Stream, Field Quality Events, PPAP report | A | a round gauge dial with a tick mark at its top |
| 48 | 4 | `trend` | Trend (change velocity, quality trend) | Change Velocity panel, Field Quality Trend report | A | a rising zig-zag line over three bars |
| 49 | 5 | `executive` | Executive program pack | Reports Executive Program Pack | A | a podium with three steps and a small flag on the middle step |
| 50 | 5 | `compliance` | Regulatory / homologation (UNECE, DPP, FMVSS) | Reports UNECE R155/R156, Homologation, EU Battery DPP | A | a document with a ribbon seal at the bottom |
| 51 | 5 | `not-found` | 404 / not found | NotFound page, optional empty states | A | a compass with a round dial and a needle |
| 52 | 5 | `scope` | VIN / program scope (optional) | Top bar scope pill (keep lucide at 13px unless the pill grows) | A | a concentric target ring with a small pin on top |
| 53 | 5 | `person` (spare) | Person / owner / raised by | Timeline, avatar, owner fields (optional) | A | a rounded head and shoulders bust |
| 54 | 5 | `department` (spare) | Department / team | Timeline department (optional) | A | a small office block with a grid of windows |
| 55 | 5 | `lead-time` (spare) | Lead time | Part lead-time fields, KPI Labor | A | an hourglass |
| 56 | 5 | `pinned` (spare) | Pinned item | Sidebar Pinned section | A | a push-pin seen from the front |
| 57 | 5 | `config-rule` (spare) | Configuration rule | Variants KPI Configuration rules | A | a rounded slider switch with a round knob |
| 58 | 5 | `market` (spare) | Market | Variants market, scope Market | A | a small shop stall with a striped awning |
| 59 | 5 | `volume` (spare) | Planned units / volume | Variants KPI Planned units | A | a stack of three crates |
| 60 | 5 | `vin` (spare) | VIN / vehicles in field | KPI VINs built/impacted, impact tile VINs in field | A | a rectangular tag with a barcode strip, no digits |

### 4.3 Report-type mapping (Reports.tsx:119, one icon per card)

| Report | id |
|---|---|
| Executive Program Pack | `executive` |
| EBOM Export | `ebom` |
| MBOM Routing Sheet | `mbom` |
| Service BOM / Spare Parts Catalog | `service-kit` |
| UNECE R155 / R156 Audit Pack | `compliance` |
| CycloneDX Software BOM Export | `software` |
| EU Battery Regulation · Digital Product Passport | `system-battery` |
| ECN Change Log | `ecn` |
| Supplier Risk Brief | `supplier` |
| Field Quality Trend Report | `trend` |
| PPAP / AS9102 Package | `quality` |
| Homologation Pack (FMVSS / UNECE) | `compliance` |

### 4.4 Stage and system mapping

| Source | id |
|---|---|
| Lifecycle strip CAT / EBOM / MBOM / Software / Service | `variant`, `ebom`, `mbom`, `software`, `service-kit` |
| Program stages Concept / Design / Engineering / Pre-Production / SOP | `stage-concept`, `stage-design`, `stage-engineering`, `stage-preproduction`, `stage-sop` (In-Production reuses `stage-sop`) |
| Systems PWT / BAT / CHS / BDY / INT / ELE (+fallback) | `system-powertrain`, `system-battery`, `system-chassis`, `system-body`, `system-interior`, `system-electrical`, `system` |
| Part types Vehicle / System / Assembly, Sub-Assembly / ECU / Part / Harness | `vehicle`, `system`, `assembly`, `ecu`, `part`, `harness` |
| Program categories SUV / Sedan / Truck / EV Crossover | `vehicle-suv`, `vehicle-sedan`, `vehicle-truck`, `vehicle-ev` |

## 5. Generation batches

Fixed order. Generate each sheet in Google Flow with the prompt below, save as `design/icons-sheet-N.jpg` (the existing sheet stays as sheet 0). Check each result: exactly 12 icons, left to right and top to bottom as listed, no stray shapes.

Style text (identical for every sheet):

> A clean icon sheet of 12 product icons arranged in a precise 4 columns × 3 rows grid, equal spacing, each icon centred in its own square cell with generous empty margin. Pure solid white background (#FFFFFF), no grid lines, no borders, no text, no labels, no shadows on the background. Style: minimal 3D glyph icons, soft rounded geometric shapes, matte finish, subtle soft lighting from the top left, smooth orange gradient from light orange #FFA12B to deep red-orange #DC440C, with small neutral grey (#8A8A8A) accent details. All 12 icons in exactly the same style, size, perspective (slight 3/4 front view), lighting and colour palette. Simple, recognisable at small size, no fine details, no thin lines.

### Sheet 1 · Systems, part types, places  (`icons-sheet-1.jpg`)

```text
A clean icon sheet of 12 product icons arranged in a precise 4 columns × 3 rows grid, equal spacing, each icon centred in its own square cell with generous empty margin. Pure solid white background (#FFFFFF), no grid lines, no borders, no text, no labels, no shadows on the background. Style: minimal 3D glyph icons, soft rounded geometric shapes, matte finish, subtle soft lighting from the top left, smooth orange gradient from light orange #FFA12B to deep red-orange #DC440C, with small neutral grey (#8A8A8A) accent details. All 12 icons in exactly the same style, size, perspective (slight 3/4 front view), lighting and colour palette. Simple, recognisable at small size, no fine details, no thin lines.

Icons, left to right, top to bottom:
1. a compact engine block with two cylinder heads and a small gear on its side
2. a rounded battery pack block with a raised terminal on top and a small plug on the front
3. a single wheel with a coil spring and a short axle bar through its centre
4. a single car door with a window and handle
5. a car seat in 3/4 view with a headrest
6. a rounded square tile with a bold lightning bolt in grey
7. a hexagonal block built from three joined modules
8. a plain hatchback car in 3/4 view, rounded body, two wheels visible
9. a flat rectangular control module box with a plug connector on one side and two mounting ears
10. a bundle of thick cables looped once, with a connector plug on each end
11. a conveyor belt with a small box on it and a robot arm above
12. a globe on a small stand with a latitude band
```

Ids in order: `system-powertrain`, `system-battery`, `system-chassis`, `system-body`, `system-interior`, `system-electrical`, `system`, `vehicle`, `ecu`, `harness`, `plant`, `region`

### Sheet 2 · Programs, stages, pages  (`icons-sheet-2.jpg`)

```text
A clean icon sheet of 12 product icons arranged in a precise 4 columns × 3 rows grid, equal spacing, each icon centred in its own square cell with generous empty margin. Pure solid white background (#FFFFFF), no grid lines, no borders, no text, no labels, no shadows on the background. Style: minimal 3D glyph icons, soft rounded geometric shapes, matte finish, subtle soft lighting from the top left, smooth orange gradient from light orange #FFA12B to deep red-orange #DC440C, with small neutral grey (#8A8A8A) accent details. All 12 icons in exactly the same style, size, perspective (slight 3/4 front view), lighting and colour palette. Simple, recognisable at small size, no fine details, no thin lines.

Icons, left to right, top to bottom:
1. a tall SUV with a roof rail, 3/4 front view
2. a low three-box sedan, 3/4 front view
3. a pickup truck with an open cargo bed, 3/4 front view
4. a sleek crossover with a small plug socket shape on the rear fender
5. a rounded light bulb with a small grey base
6. a pencil lying across a drafting triangle ruler
7. two interlocking gears, one large and one small
8. a short row of three small boxes on a tray, the last slightly lifted
9. a chequered flag on a short pole
10. a rounded dashboard panel with a round dial gauge and two small bars
11. two overlapping rounded cards, the front one offset to the right, each with two grey bars
12. a rounded bell with a small round clapper beneath it
```

Ids in order: `vehicle-suv`, `vehicle-sedan`, `vehicle-truck`, `vehicle-ev`, `stage-concept`, `stage-design`, `stage-engineering`, `stage-preproduction`, `stage-sop`, `command-center`, `compare`, `notifications`

### Sheet 3 · Actions  (`icons-sheet-3.jpg`)

```text
A clean icon sheet of 12 product icons arranged in a precise 4 columns × 3 rows grid, equal spacing, each icon centred in its own square cell with generous empty margin. Pure solid white background (#FFFFFF), no grid lines, no borders, no text, no labels, no shadows on the background. Style: minimal 3D glyph icons, soft rounded geometric shapes, matte finish, subtle soft lighting from the top left, smooth orange gradient from light orange #FFA12B to deep red-orange #DC440C, with small neutral grey (#8A8A8A) accent details. All 12 icons in exactly the same style, size, perspective (slight 3/4 front view), lighting and colour palette. Simple, recognisable at small size, no fine details, no thin lines.

Icons, left to right, top to bottom:
1. a rounded block with a bold plus sign standing out in front
2. two chain links joined together at a slight angle
3. two curved arrows chasing each other in a circle
4. a small rocket-like capsule lifting off from a short platform
5. a rounded stamp with a bold tick on its face
6. a rounded stamp with a bold cross on its face
7. an open box with an arrow leaving from its top to the right
8. a document sheet with a small play-triangle badge on its corner
9. a calendar block with a small clock face on its corner
10. a magnifying glass over a small circuit chip
11. two round nodes joined by a dotted winding path, a pin on one end
12. an open book with two grey page lines on each side
```

Ids in order: `add`, `link`, `sync`, `release`, `approve`, `reject`, `export`, `generate`, `schedule`, `scan`, `trace`, `manual`

### Sheet 4 · Concepts and KPIs  (`icons-sheet-4.jpg`)

```text
A clean icon sheet of 12 product icons arranged in a precise 4 columns × 3 rows grid, equal spacing, each icon centred in its own square cell with generous empty margin. Pure solid white background (#FFFFFF), no grid lines, no borders, no text, no labels, no shadows on the background. Style: minimal 3D glyph icons, soft rounded geometric shapes, matte finish, subtle soft lighting from the top left, smooth orange gradient from light orange #FFA12B to deep red-orange #DC440C, with small neutral grey (#8A8A8A) accent details. All 12 icons in exactly the same style, size, perspective (slight 3/4 front view), lighting and colour palette. Simple, recognisable at small size, no fine details, no thin lines.

Icons, left to right, top to bottom:
1. one large four-point sparkle star with two small ones
2. a rounded shield with a keyhole in the middle
3. a small round beetle bug with six short legs
4. a clipboard with two tick rows
5. a round clock face with a curved arrow circling back
6. a box with an arrow pointing up to a larger box above
7. a short stack of three coins
8. a rounded eye with a large round pupil
9. a chain with one link broken apart (no warning shapes)
10. a certificate scroll with a ribbon rosette
11. a round gauge dial with a tick mark at its top
12. a rising zig-zag line over three bars
```

Ids in order: `ai`, `security`, `cve`, `validation`, `history`, `where-used`, `cost`, `watchlist`, `disruption`, `license`, `quality`, `trend`

### Sheet 5 · Reports, 404, scope, spares  (`icons-sheet-5.jpg`)

```text
A clean icon sheet of 12 product icons arranged in a precise 4 columns × 3 rows grid, equal spacing, each icon centred in its own square cell with generous empty margin. Pure solid white background (#FFFFFF), no grid lines, no borders, no text, no labels, no shadows on the background. Style: minimal 3D glyph icons, soft rounded geometric shapes, matte finish, subtle soft lighting from the top left, smooth orange gradient from light orange #FFA12B to deep red-orange #DC440C, with small neutral grey (#8A8A8A) accent details. All 12 icons in exactly the same style, size, perspective (slight 3/4 front view), lighting and colour palette. Simple, recognisable at small size, no fine details, no thin lines.

Icons, left to right, top to bottom:
1. a podium with three steps and a small flag on the middle step
2. a document with a ribbon seal at the bottom
3. a compass with a round dial and a needle
4. a concentric target ring with a small pin on top
5. a rounded head and shoulders bust
6. a small office block with a grid of windows
7. an hourglass
8. a push-pin seen from the front
9. a rounded slider switch with a round knob
10. a small shop stall with a striped awning
11. a stack of three crates
12. a rectangular tag with a barcode strip, no digits
```

Ids in order: `executive`, `compliance`, `not-found`, `scope`, `person`, `department`, `lead-time`, `pinned`, `config-rule`, `market`, `volume`, `vin`  (last 8 are spares)

## 6. Integration plan (not implemented)

**Files that change**

| File | Change |
|---|---|
| `scripts/icon-sheets.json` (new) | Ordered list: `[{"file": "design/icons-sheet.jpg", "ids": [12 existing]}, {"file": "design/icons-sheet-1.jpg", "ids": [...]}, …]`. The id order in section 5 is the source of truth. |
| `scripts/cut-icons.py` | Replace the hard-coded `IDS` and `SRC` with a loop over the JSON. Keep the connected-component detection and the “exactly 12 or fail” guard, per sheet. Fail on duplicate ids across sheets. Write two sizes per id: `public/icons/<id>.png` (144×144) and `public/icons/sm/<id>.png` (96×96). The existing 12 are re-cut so both sizes exist. |
| `src/components/icons/iconMap.ts` | Add the 52 ids to `entityIcons` (`{ lucide, mark }`). Every new id gets a lucide fallback of the same meaning. Add `markUrl(id, px)` returning `icons/sm/` for ≤32px and `icons/` above. Keep the 12 current ids unchanged. |
| `src/components/icons/EntityIcon.tsx` | Add `EntityGlyph` (sizes 20, 24, 28, 32) for the new small spots. It renders the 96px PNG and falls back to lucide on error, like `EntityMark`. `EntityMark` keeps 36/44/72. `EntityIcon` (lucide) stays for 14px rows, badges and buttons. |
| `nav.ts` + `Sidebar.tsx:193` | `NavItem.icon` becomes `NavItem.mark` (an id). Puck stays 36px, glyph 22px. Rail, expanded, flyout and drawer share the component. |
| `SystemHealthMatrix.tsx:15-28,216` | `SYSTEM_VISUAL` maps to the `system-*` ids. Tile 40→44px, glyph 28px. |
| `PipelineBar.tsx:13,70` | `stageIcon` unchanged ids; glyph 14→20px with chip h-9. Or keep lucide (decision D3). |
| `ui/primitives.tsx` (`PanelHeader`, `KpiTile`, `EmptyState`) | `PanelHeader` icon 14→20px glyph. `KpiTile` gets an optional `icon` prop (24px, top-right). `EmptyState` unchanged. |
| `src/tests/icons.test.tsx` | The test hard-codes the 12 ids and 144×144. Change it to read the JSON: every id has a lucide fallback, a 144 PNG and a 96 PNG, and ids are unique. |

**Output sizes.** 144×144 for header (44), card (36) and empty-state (72) marks (≥2× density). 96×96 for 20 to 32px glyphs (3× at 32px). Nothing below 20px uses a generated icon.

**Small spots.** Below 20px (13px buttons, 14px rows, 10 to 12px badges, chevrons, status) stay lucide. The 3D set has soft shading that turns to a blob under 20px. Where a spot is enlarged the container grows with it (puck, tile, header), never the glyph alone.

**Dark mode.** The orange gradient and grey (#8A8A8A) accents have enough contrast on both `bg-container` surfaces, but the grey accents are the weak point on dark `bg-action` pucks. Check with Playwright screenshots in both themes at 20, 22, 28 and 44px. The active sidebar puck is near-black/near-white (`bg-action-primary`) and the orange mark must stay legible on it. If it does not, the active puck uses the neutral `bg-action` with a ring instead. No CSS filter on the PNGs; the cutter's defringe keeps the alpha edge clean on both themes.

**Keeping status separate**

1. Orange marks are **identity only** (what the thing is). Status (healthy, warning, critical, success) stays in the feedback tokens: dots, text, and lucide status icons (`AlertTriangle`, `CheckCircle2`, `Check`, `X`).
2. A mark is never placed inside a `Badge`, `QuietStatus` or banner with a warning/error/success tone, and never replaces a status icon. Rows A to C marked “status” in section 1 stay lucide.
3. `field-event` (stop-sign shape) and `reject` must not sit next to a warning badge; use `quality` for Field Quality panels (D1).
4. All marks are `aria-hidden` and always have a text label nearby; any icon-only mark gets an `aria-label` on its button.
5. Add a test that fails if an `EntityGlyph` or `EntityMark` renders inside an element with a status tone class.

**Order of work.** 1) generate sheets 1 and 2 (systems, stages, pages: most visible), 2) update the cutter and registry, 3) wire sidebar, system matrix, pipeline, headers, 4) KPI tiles, 5) action and concept sheets, 6) reports. Stop for review after each step.
