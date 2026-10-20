# Chronus (Chronos) Design System

Reverse-engineered from the frontend in this repo (`D:\Chronos-main`). The product is named **Chronos** in code and brand assets (Revenue Cycle Command Center, Wayam AI). It is called "Chronus" in the request, so this document uses the code spelling in paths and brand strings.

Every value below was read from source. Paths are relative to the repo root. Where the repo has no implementation of something the brief asks for (tabs, toasts, tooltips, date pickers and so on), the document says so and gives a recommended pattern built from the existing tokens. Those are marked **Not in repo**.

---

## 1. Tech stack

| Concern | Value | Source |
|---|---|---|
| Framework | Next.js **16.3.3** (App Router), React **19.2.8**, TypeScript 5 | `package.json` |
| Styling | **Tailwind CSS v4** (CSS-first, `@theme inline`, no `tailwind.config.js`) plus a two-tier CSS-variable token file | `src/app/globals.css`, `src/styles/tokens.css`, `postcss.config.mjs` |
| PostCSS | `@tailwindcss/postcss` only | `postcss.config.mjs` |
| Component library | **None.** No MUI, Bootstrap or shadcn. All components are hand-built from Tailwind utilities | `src/components/ui/*` |
| Icons | **lucide-react** `^1.34.0`. Stroke weight 1.75, sized by role (see §4.14) | `package.json` |
| Charts | **Recharts** `^3.10.1` | `src/components/analytics/chart-view.tsx` |
| Tables | Custom `DataTable<T>` component. No TanStack or AG Grid | `src/components/ui/data-table.tsx` |
| Grid/dashboard layout | `react-grid-layout` `^2.2.4` (declared dependency, used for analytics dashboards) | `package.json` |
| Fonts | `next/font/google`: **Geist** (UI) and **Michroma** (display), exposed as `--font-geist` and `--font-michroma` | `src/app/layout.tsx` |
| Theming | Light by default. Dark via `data-theme="dark"` on `<html>`, persisted in a cookie and `localStorage` (key `chronos-theme`) | `src/context/theme-context.tsx`, `src/app/layout.tsx` |
| Decorative imagery | 99 transparent PNG "3D marks" in `public/images/rcm/` | `src/lib/rcm/marks.ts`, `src/components/rcm/mark.tsx` |

**Next.js caveat.** `AGENTS.md` warns that this Next.js version has breaking changes. The design system itself is framework-agnostic: tokens are plain CSS variables, and the components are plain React plus Tailwind classes. You only need to take care with the font loading (`next/font`) and the cookie-based theme read in `layout.tsx` when porting.

**Architecture rule, stated in the code.** Components may only use *semantic* tokens. The Tailwind `@theme` block deliberately does **not** expose the raw `--ref-*` palette, so components cannot reach for a raw colour (`globals.css`, header comment). No hex values appear in component code. The one exception is the chart tooltip style object, which uses CSS variables.

---

## 2. Design tokens

### 2.1 Token architecture

```
TIER 1  --ref-*        raw palette. Never used by components.
TIER 2  --surface-*, --text-*, --icon-*, --stroke-*, --action-*, --feedback-*, --analytics-*
        semantic. Light is the default on :root; [data-theme="dark"] overrides.
TIER 3  Tailwind @theme inline maps semantic vars to utilities (bg-container, text-primary, border-muted, …)
```

The utility names are short and role-based. The ones you will see everywhere: `bg-page`, `bg-container`, `bg-raised`, `bg-raised-2`, `bg-action`, `text-primary`, `text-secondary`, `text-tertiary`, `text-quaternary`, `border-muted`, `border-default`, `ring-active`.

### 2.2 Colour: neutrals (the product is almost entirely greyscale)

The primary action colour is **near-black in light mode and near-white in dark mode**, not a hue. The only brand colour is the orange of the logo tile. Colour is reserved for status.

| Ref token | Hex | Ref token | Hex |
|---|---|---|---|
| `--ref-white` | `#ffffff` | `--ref-gray-700` | `#464646` |
| `--ref-gray-50` | `#fafafa` | `--ref-gray-750` | `#3b3b3b` |
| `--ref-gray-100` | `#f2f2f2` | `--ref-gray-800` | `#323232` |
| `--ref-gray-200` | `#e5e5e5` | `--ref-gray-825` | `#2a2a2a` |
| `--ref-gray-300` | `#d4d4d4` | `--ref-gray-850` | `#232323` |
| `--ref-gray-400` | `#afafaf` | `--ref-gray-900` | `#191919` |
| `--ref-gray-500` | `#8a8a8a` | `--ref-gray-950` | `#101010` |
| `--ref-gray-550` | `#737373` | `--ref-black` | `#000000` |
| `--ref-gray-600` | `#626262` | `--ref-gray-650` | `#525252` |

### 2.3 Colour: semantic tokens (light / dark)

Source: `src/styles/tokens.css`.

**Surfaces**

| Semantic token | Tailwind utility | Light | Dark | Use |
|---|---|---|---|---|
| `--surface-page-background` | `bg-page` | gray-100 `#f2f2f2` | black `#000000` | App canvas, top bar, `<main>` |
| `--surface-container` | `bg-container` | white `#ffffff` | gray-950 `#101010` | Cards, panels, sidebar, table header, popovers |
| `--surface-raised` | `bg-raised` | gray-50 `#fafafa` | gray-900 `#191919` | Row hover, selected row, nested callout |
| `--surface-raised-x2` | `bg-raised-2` | gray-100 `#f2f2f2` | gray-850 `#232323` | Hover on controls, bar-track background |
| `--surface-action` | `bg-action` | gray-100 `#f2f2f2` | gray-900 `#191919` | Resting fill of pills, inputs, icon buttons |
| `--surface-scroll-bar` | `bg-scroll-bar` | gray-300 `#d4d4d4` | gray-750 `#3b3b3b` | Scrollbar thumb |

**Text and icon** (icons use the same values via `icon-primary`…`icon-quaternary` utilities)

| Token | Utility | Light | Dark |
|---|---|---|---|
| `--text-primary` | `text-primary` | gray-950 `#101010` | gray-50 `#fafafa` |
| `--text-secondary` | `text-secondary` | gray-700 `#464646` | gray-300 `#d4d4d4` |
| `--text-tertiary` | `text-tertiary` | gray-550 `#737373` | gray-500 `#8a8a8a` |
| `--text-quaternary` | `text-quaternary` | gray-500 `#8a8a8a` | gray-600 `#626262` |
| `--text-on-color` | `text-on-color` | white | black |

Default body text colour is `--text-secondary` (not primary). Primary is reserved for titles, values and the active item.

**Strokes** (all alpha-based, so they work on any surface)

| Token | Utility | Light | Dark | Use |
|---|---|---|---|---|
| `--stroke-muted` | `border-muted` | `rgba(0,0,0,.08)` | `rgba(255,255,255,.08)` | **Default hairline** for cards, rows, dividers |
| `--stroke-default` | `border-default` | `rgba(0,0,0,.14)` | `rgba(255,255,255,.14)` | Hover border, popover and drawer border |
| `--stroke-active` | `ring-active` | `rgba(0,0,0,.24)` | `rgba(255,255,255,.24)` | **Focus ring** (`focus-visible:ring-2 ring-active`), text selection bg |
| `--stroke-disabled` | `border-disabled` | `rgba(0,0,0,.04)` | `rgba(255,255,255,.04)` | Disabled outline |
| `--stroke-on-color` | n/a | `rgba(255,255,255,.18)` | `rgba(0,0,0,.18)` | Border on coloured fills |

**Action surfaces**

| Variant | State | Light | Dark |
|---|---|---|---|
| Primary | default | gray-950 `#101010` | gray-50 `#fafafa` |
| | hover | gray-850 `#232323` | gray-200 `#e5e5e5` |
| | focused | black | white |
| | disabled | gray-300 `#d4d4d4` | gray-700 `#464646` |
| | content | white | black |
| Secondary | default / hover / focused / disabled | gray-100 / 200 / 300 / 50 | gray-850 / 800 / 750 / 950 |
| Tertiary (ghost) | default | transparent | transparent |
| | hover / focused | `rgba(0,0,0,.06)` / `.10` | `rgba(255,255,255,.06)` / `.10` |

**Feedback (status) colours.** Each status has five tokens: `content` (text), `icon`, `stroke`, `background` (a 12 % tint) and `badge` (solid fill with white label).

| Status | Content (light) | Icon (light) | Stroke (light) | Tint background (both modes) | Badge fill (light / dark) |
|---|---|---|---|---|---|
| Success | green-700 `#2b7046` | green-600 `#318c54` | green-300 `#8ed8a9` | `rgba(63,174,105,.12)` | green-700 `#2b7046` / green-800 `#275a3b` |
| Info | blue-700 `#1e61a0` | blue-600 `#2179be` | blue-300 `#88cef4` | `rgba(44,150,219,.12)` | blue-700 `#1e61a0` / blue-800 `#1c5083` |
| Warning | orange-700 `#c1460f` | orange-600 `#e95d0f` | orange-300 `#ffb365` | `rgba(255,123,28,.12)` | orange-700 `#c1460f` / orange-800 `#9a3814` |
| Error | red-700 `#c62830` | red-600 `#e9343c` | red-300 `#ff969b` | `rgba(255,65,73,.12)` | red-700 `#c62830` / red-800 `#a62329` |
| Neutral | gray-700 `#464646` | gray-600 `#626262` | gray-300 `#d4d4d4` | `rgba(0,0,0,.06)` light, `rgba(255,255,255,.06)` dark | gray-700 `#464646` / gray-700 |

Dark-mode shifts: content uses the `-300` step, icon the `-400` step, stroke the `-700` step (for example error content `#ff969b`, icon `#ff646b`). `--feedback-badge-content` is white in both modes.

Note that **warning is orange, not yellow or amber**, even though yellow and amber ramps exist in the ref tier.

**Chart series** (`--analytics-series-1…6`, utilities `bg-series-1`…)

| Series | Maps to | Light |
|---|---|---|
| 1 | info icon | blue-600 `#2179be` |
| 2 | success icon | green-600 `#318c54` |
| 3 | warning icon | orange-600 `#e95d0f` |
| 4 | error icon | red-600 `#e9343c` |
| 5 | neutral icon | gray-600 `#626262` |
| 6 | purple | purple-600 `#862aa3` (dark: purple-400 `#b65bd8`) |

**Brand colour.** Only appears in the logo/favicon tile: a linear gradient with stops `#DC440C`, `#F0731A`, `#FA8D23`, `#FFA12B` (orange) and white glyphs (`public/brand/chronos-mark.svg`). It is never used as a UI accent.

**Other ramps in the ref tier** (50–950 each, available but only red, green, blue, orange and purple are consumed): red, purple, blue, cyan, teal, green, yellow, amber, orange, deep-orange. See `tokens.css` lines 10–160 for the full hex tables.

### 2.4 Typography

Two families, both from Google Fonts via `next/font`:

| Role | Family | Weight | Where |
|---|---|---|---|
| UI / body (default) | **Geist** (`--font-geist`) with `ui-sans-serif, system-ui, sans-serif` fallback | 400, 500, 600 | Everything by default |
| Display | **Michroma** (`--font-michroma`) | **400 only** | Page titles, top-bar title, KPI numbers, drawer titles, metric values. Utility: `font-display` |

Base body (`globals.css`): `14px / 20px`, letter-spacing `-0.01em`, antialiased, `text-rendering: optimizeLegibility`, colour `--text-secondary`.

**Application type roles.** Use these by name. Components never pick a pixel size.

| Utility | Size / line-height | Letter-spacing | Weight | Family | Used for |
|---|---|---|---|---|---|
| `text-display-page` | 34 / 1.1 | -0.02em | 400 | Michroma | Largest page title |
| `text-display-metric-xl` | 56 / 1 | -0.03em | 400 | Michroma | Hero metric |
| `text-display-metric` | 40 / 1.05 | -0.03em | 400 | Michroma | Large metric |
| `text-display-2xl` | 28 / 1.15 | -0.02em | 400 | Michroma | KPI value (≥sm), login mid headline |
| `text-display-xl` | 22 / 1.2 | -0.01em | 400 | Michroma | **Page title** (≥sm), KPI value (mobile), "Sign in" |
| `text-display-lg` | 18 / 1.25 | -0.01em | 400 | Michroma | **Top-bar title**, page title (mobile), drawer title, secondary metrics |
| `text-display-base` | 14 / 1.4 | -0.01em | 400 | Michroma | Small display |
| `text-heading-lg` | 24 / 30 | -0.01em | 600 | Geist | Heading |
| `text-heading-md` | 18 / 24 | -0.01em | 600 | Geist | Heading |
| `text-heading-sm` | 16 / 22 | -0.01em | 600 | Geist | Heading |
| `text-body-lg` | 16 / 24 | -0.01em | 400 | Geist | Large body |
| `text-body-md` | 14 / 20 | -0.01em | 400 | Geist | **Default body**, descriptions |
| `text-body-sm` | 12 / 16 | -0.01em | 400 | Geist | **Table cell text**, secondary text |
| `text-label-md` | 14 / 20 | 0 | 500 | Geist | Primary/large button label |
| `text-label-sm` | 12 / 16 | 0 | 500 | Geist | **Pill buttons, chips, inputs, sidebar items** |
| `text-caption` | 12 / 16 | 0 | 500 | Geist | **Eyebrow/section labels, table headers**, hints |

A raw Geist size scale is also defined (`text-xs` 12/16, `sm` 14/20, `base` 16/24, `lg` 18/24, `xl` 20/26, `2xl` 24/30, `3xl` 32/38, `4xl` 40/44, `5xl` 48/52), plus Michroma display steps `display-3xl` 34, `4xl` 42, `5xl` 52, `6xl` 64. Prefer the role names above.

**There are no `h1`–`h6` defaults.** There is no CSS reset for headings. Each heading is styled explicitly with a role class.

| Semantic level | Element | Classes |
|---|---|---|
| Top-bar title (h1) | `<h1>` | `font-display text-display-lg text-primary truncate` |
| Page title | `<h2>` | `font-display text-display-lg sm:text-display-xl text-primary` |
| Panel title | `<h2>` | `text-caption tracking-[0.08em] text-quaternary uppercase` |
| Context-panel section | `<h3>` | same as panel title |
| Drawer title | `<h2>` | `font-display text-display-lg text-primary` |

**The "eyebrow" label is the most recognisable detail in the system:** `text-caption tracking-[0.08em] text-quaternary uppercase` (12 px, weight 500, +0.08em, uppercase, 4th-level grey). It is used for panel titles, KPI labels, table headers, form labels, sidebar section labels and drawer kickers. A slightly tighter `tracking-[0.06em]` appears in nested lists and the mobile card `<dt>`.

**Numbers.** All numeric columns, KPI values, deltas, counts and timestamps use the `tabular` utility (`font-variant-numeric: tabular-nums`).

### 2.5 Spacing

Tailwind v4 default scale (**4 px base**: `1` = 4 px, `2` = 8 px, `3` = 12 px, `4` = 16 px, `5` = 20 px). There is no custom spacing scale. The values actually used:

| Context | Value |
|---|---|
| Page padding | `p-4 sm:p-5` (16 px, 20 px at ≥640) |
| Gap between page sections | `gap-4` (16 px) |
| KPI grid gap | `gap-3` (12 px) |
| Panel body padding | `p-4` |
| Panel header height | `h-11` (44 px), `px-4` |
| Toolbar | `px-3 py-2`, `gap-2` |
| Table cell | `px-3 py-2` |
| Chip / button group gap | `gap-1.5` / `gap-2` |
| Drawer section | `px-5 py-4` |

### 2.6 Border radius

| Token (Tailwind v4 default) | Value | Used for |
|---|---|---|
| `rounded-full` | 9999 px | **All buttons, inputs, selects, chips, badges, search, icon buttons, sidebar pucks, progress bars** |
| `rounded-xl` | 12 px | Command palette, collapsed-sidebar flyout |
| `rounded-[10px]` | 10 px | Logo mark tile |
| `rounded-lg` | 8 px | **Cards, panels, KPI tiles, popovers, dropdowns, notification tray** |
| `rounded-md` | 6 px | Inner callouts, list-row hover, skeleton rows |
| `rounded-[4px]` | 4 px | Checkbox |
| `rounded-[3px]` | 3 px | Sidebar tree-branch corner |

Rule of thumb: **interactive controls are pills; containers are 8 px.**

### 2.7 Borders, shadows, elevation

The design is **flat and border-driven**. Elevation comes from surface step plus a hairline, not from shadows.

| Level | Treatment |
|---|---|
| Card / panel | `border border-muted bg-container` (no shadow) |
| Dropdown / popover / flyout | `border border-muted bg-container shadow-lg` (Tailwind default `shadow-lg`) |
| Notification tray / command palette / drawer | `border border-default bg-container` (**no shadow**; stronger border instead) |
| Modal scrim | `bg-page/70` (palette, evidence drawer) or `bg-black/50` (mobile nav, context panel on small screens) |

There is no custom shadow token. `shadow-lg` is used four times. Do not add shadows to cards.

### 2.8 Motion

| Use | Duration / easing |
|---|---|
| Buttons, pills, sidebar items, hover colour | `transition-colors duration-[180ms] ease-out` |
| Rows, list hover, chips, checkbox | `duration-[150ms]` |
| Sidebar width and slide | `transition-[width,transform] duration-200 ease-out` |
| Flyout fade | `transition-[opacity,visibility] duration-[180ms]` |
| Chevron rotate | `transition-transform duration-[150ms]` or `180ms`, `rotate-90` when open |
| Loading skeleton | Tailwind `animate-pulse` |
| Charts | `isAnimationActive={false}`: **no chart animation** |

There are no custom `@keyframes`. Animation is limited to colour, width and fade.

### 2.9 Breakpoints and responsive behaviour

Tailwind v4 defaults, no overrides: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536.

| Breakpoint | Behaviour |
|---|---|
| `< lg` | Sidebar becomes an off-canvas drawer (`fixed`, slide in, `bg-black/50` scrim) opened by a hamburger in the top bar |
| `lg` | Sidebar is in flow: 68 px rail, expandable to 252 px. Two-up `SplitRow` layouts go side by side (default `from="lg"`) |
| `xl` | Context panel docks inline as a 360 px right column (below `xl` it is an overlay) |
| `sm` | Page padding 16→20 px, page header switches column→row, "Search" label and ⌘K hint appear, "Today · Live" chip appears |
| KPI grid | `grid-cols-2 md:grid-cols-3 xl:grid-cols-6` |
| Tables | **Container queries** (`@container`): below **720 px** container width the table becomes a stacked card list; columns marked `hide="md"` disappear below 960 px, `hide="lg"` below 1200 px |

The app is a fixed-viewport shell: `html, body { height:100%; overflow:hidden; overscroll-behavior:none }`. Scrolling happens inside regions (`PageBody`, panels, tables), never on the document.

---

## 3. Layout

### 3.1 App shell

File: `src/components/layout/app-shell.tsx`.

```
┌────────┬───────────────────────────────────────────────┬──────────┐
│        │ TopBar  h-14  border-b  bg-page               │          │
│Sidebar ├───────────────────────────────────────────────┤ Context  │
│ 68/252 │ <main> bg-page                                │ panel    │
│  px    │   PageHeader (shrink-0, border-b)             │ 360px    │
│        │   PageBody  (flex-1 overflow-y-auto p-4/5)    │ (≥xl)    │
└────────┴───────────────────────────────────────────────┴──────────┘
                                          Evidence drawer (420px, overlay from right)
```

Root: `flex h-screen w-full overflow-hidden bg-page`. **There is no max-width page container.** Content is fluid and fills the main column.

### 3.2 Sidebar

Files: `sidebar.tsx`, `sidebar-item.tsx`.

| Property | Value |
|---|---|
| Collapsed width | **68 px** (default). Expanded **252 px**. Toggle persists in component state only |
| Surface | `bg-container`, `border-r border-muted` |
| Header | `h-14`, `border-b border-muted`; collapsed: logo mark only, expanded: mark plus wordmark |
| Nav padding | `py-3`, `px-[14px]` collapsed, `px-3` expanded; `gap-1.5` between items |
| Footer | `border-t border-muted`, `py-3`; contains Collapse/Expand sidebar, theme toggle, Settings |
| Item "puck" | `size-9` circle holding a 17 px icon (stroke 1.75) |
| Puck, idle | `bg-action icon-tertiary`; hover `bg-raised-2 icon-secondary` |
| Puck, **active** | `bg-action-primary icon-on-color` (solid near-black circle in light, near-white in dark) |
| Label (expanded) | `text-label-sm`, idle `text-tertiary`, hover `text-secondary`, active `text-primary` |
| Groups | Single-item groups render as a leaf. Multi-item groups are accordions with a chevron (rotates 90°) |
| Tree children | `SidebarTreeItem`: `rounded-lg py-1.5 pr-2 pl-3`, 14 px icon, `text-label-sm`; active `bg-action text-primary`. A 1 px `bg-muted` spine at `ml-[18px]`, with a horizontal tick per leaf and an L-shaped corner on the last |
| Section labels in tree | `px-3 py-1 text-caption tracking-[0.08em] text-quaternary uppercase` |
| Collapsed hover | A flyout (`w-[228px] rounded-xl border-muted bg-container shadow-lg`, max-height `min(80vh,560px)`) appears to the right, with the group's children |
| Focus | `focus-visible:ring-2 focus-visible:ring-active` |
| Mobile | Off-canvas: `fixed inset-y-0 left-0 z-50`, `-translate-x-full` when closed, `w-[252px]` |

Navigation groups (single source of truth: `src/lib/rcm/navigation.ts`): Command Center, Revenue Cycle (Access, Clinical, Claims, Cash), Work, Intelligence, Integrations, Governance. Settings sits in the footer.

### 3.3 Top bar

File: `top-bar.tsx`. `header` is `h-14 shrink-0 border-b border-muted bg-page px-4 sm:px-5`, with `justify-between`.

- Left: mobile hamburger (`size-8` circle, `lg:hidden`), group name as an eyebrow (hidden below `sm`), then the page title as `<h1 font-display text-display-lg text-primary truncate>`.
- Right: search pill (`h-8 rounded-full border-muted bg-action px-3 text-label-sm text-tertiary`, 13 px search icon, "Search", a `<kbd>` `⌘K` / `Ctrl K`), a scope pill ("Today · **Live** ⌄"; "Live" in `text-success`), and the notification bell (`size-8` circle with a red count badge).
- ⌘K / Ctrl+K opens the command palette from anywhere.

### 3.4 Page structure pattern

Every page is `<PageHeader …/>` followed by `<PageBody>…</PageBody>` (`src/components/layout/page-header.tsx`).

**PageHeader** (`shrink-0 border-b border-muted px-4 py-4 sm:px-5`):

1. Row: `flex-col gap-3 sm:flex-row sm:items-start sm:justify-between`.
2. Left: optional 3D mark (44 px), `<h2 font-display text-display-lg sm:text-display-xl text-primary>`, optional `InfoPopover` ("i" icon).
3. Under the title: description `mt-1 max-w-[70ch] text-body-md text-tertiary`. It is one sentence, no trailing full stop on short labels but with one on prose.
4. Right: `actions` slot, `flex flex-wrap items-center gap-2` (filter pills, scope-clear pill, primary button).
5. Optional second row `mt-3`: filter chips.

**There are no breadcrumbs.** The top bar's group eyebrow plus page title acts as the location indicator. Detail pages (`claims/[id]`, `coding/[id]`, `documents/[id]`) use the same header with a descriptive title.

**PageBody:** `min-h-0 flex-1 overflow-y-auto p-4 sm:p-5`. Children are normally `flex flex-col gap-4`.

**Typical dashboard composition** (`src/app/dashboard/page.tsx`):

1. KPI strip: `grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6` of `KpiTile`.
2. Full-width `Panel` (flow canvas, `padded={false}`).
3. `SplitRow` with two panels (table plus cards) at a fixed height (`lg:h-[32rem]`).
4. A second `SplitRow` (collections, charts, activity).

**Grid system.** No 12-column grid. Use CSS grid for KPI strips, and `SplitRow` (flex, stacks below `from`) with ratios `1.4/1`, `1/1.4`, `1.6/1`, `1/2`. Equal heights come from flex stretch.

### 3.5 Login layout

`src/app/login/page.tsx`. Full-bleed split: left hero image `flex-[1.4]` (hidden below `lg`) with a bottom `from-black/80` gradient and white display headline; right column `w-[min(28rem,42%)]` with `border-l border-muted`, logo plus theme toggle at the top, form centred vertically with `px-8`.

---

## 4. Components

All shared primitives live in `src/components/ui/primitives.tsx`, the table in `data-table.tsx`, shell pieces in `src/components/layout/`.

### 4.1 Panel (the content card)

`Panel` in `primitives.tsx`.

```
<section class="rounded-lg border border-muted bg-container overflow-hidden flex flex-col">
  <header class="h-11 px-4 border-b border-muted flex items-center justify-between gap-3">
    <h2 class="text-caption tracking-[0.08em] text-quaternary uppercase truncate">Title</h2>
    <div>{action}</div>              <!-- e.g. <span class="text-caption text-quaternary">hint</span> -->
  </header>
  <div class="p-4 overflow-auto">{children}</div>   <!-- padded={false} for tables/charts -->
</section>
```

- Title is the eyebrow style, not a heading style. Titles are Title Case, and a count is appended after a middle dot: `Exception Queue · 12`.
- Header actions are quiet text (`text-caption text-quaternary`) or small pill buttons.
- No footer region exists. Pagination and totals live inside the table component.

### 4.2 KPI / stat card

`KpiTile` in `primitives.tsx`; used at `src/app/dashboard/page.tsx`.

```
rounded-lg border border-muted bg-container px-4 py-3.5, flex-col gap-1.5
├─ Row: label (text-caption tracking-[0.08em] text-quaternary uppercase truncate) + optional 36px 3D mark (right)
├─ Value: font-display text-display-xl sm:text-display-2xl tabular text-primary
└─ Row: delta (text-body-sm tabular, tone colour) + hint (text-caption text-quaternary truncate)
```

Tones for the delta: `success` → `text-success`, `info` → `text-info`, `warning` → `text-warning`, `error` → `text-error`, `neutral` → `text-tertiary`. Deltas are signed with `+` ("+4.2%"). Compact money: `$1.84M`, `$782K`. The tile is non-interactive and has no hover state.

**Secondary stat** (inside panels): eyebrow label above a `font-display text-display-lg tabular` value; the value turns `text-warning` for risk (for example the 90+ days bucket).

### 4.3 Insight / content card

`src/components/rcm/insight-card.tsx`: `article rounded-lg border border-muted bg-container p-4 flex-col gap-3`. Sections are separated by eyebrow labels (Observation, Primary cause, Evidence, Recommendation). The recommendation sits in a callout `rounded-md border border-muted bg-raised px-3 py-2`. The action row at the bottom holds one primary pill, one secondary pill and one text button; a timestamp is right-aligned (`ml-auto text-caption text-quaternary`).

### 4.4 Tables

`DataTable<T>` in `src/components/ui/data-table.tsx`. This is the single table implementation for the whole product.

| Aspect | Spec |
|---|---|
| Wrapper | `@container isolate flex h-full flex-col overflow-hidden` (lives inside a `Panel padded={false}`) |
| Toolbar | `border-b border-muted px-3 py-2 gap-2 flex-wrap`: search pill (`h-8 rounded-full border-muted bg-action pl-8 pr-3 text-label-sm`, 13 px search icon), row count (`text-caption tabular text-quaternary`: "128 rows · 3 selected"), optional custom toolbar, **Sort** menu, **Columns** menu, **Export** (CSV) |
| Header row | `sticky top-0 bg-container`, `border-b border-muted`; cell `px-3 py-2 text-caption font-medium tracking-[0.08em] text-quaternary uppercase whitespace-nowrap` |
| Header sorting | Click toggles **desc → asc → none**. Active column text becomes `text-secondary`; 11 px `ArrowUp` / `ArrowDown` (stroke 2); inactive columns reserve an 11 px blank so headings do not shift. `aria-sort` is set |
| Header drag | `GripVertical` 12 px grip to reorder columns; order persists in `localStorage` key `chronos-table-cols:<exportName>` |
| Body row | `border-b border-muted`, **no zebra striping**; hover `bg-raised`; selected/focused `bg-raised`; keyboard rows get `tabIndex=0`, ↑/↓ move focus, Enter/Space activates |
| Cell | `px-3 py-2 text-body-sm text-secondary align-middle whitespace-nowrap`; left cells `max-w-[18rem]` with ellipsis; numeric cells `text-right` and `tabular` |
| Row height | Content-driven: 12 px type plus 8 px vertical padding ×2 ≈ **36–40 px**. No fixed row height token |
| Sticky columns | Selection checkbox (40 px), serial `#` (48 px, `text-quaternary tabular`), and the first data column stay pinned on horizontal scroll |
| Checkbox | `size-4 rounded-[4px] border`; checked/indeterminate: `bg-action-primary text-on-color` with a 10 px `Check` (stroke 3); unchecked: `border-default bg-action`, hover `border-active` |
| Pagination | Default **40 rows/page**. Footer `border-t border-muted px-3 py-2`: left "Showing 1–40 of 128" (`text-caption text-quaternary`), right Previous / `1 / 4` / Next. Pager buttons are pills with 13 px chevrons, `disabled:opacity-40`. Footer is hidden when everything fits on one page |
| Narrow mode | Below 720 px container width, rows become stacked cards: title column, metric column, up to 6 `<dl>` fields in two columns (`dt` is eyebrow style at `tracking-[0.06em]`) |
| Loading | 6 skeleton bars: `h-8 animate-pulse rounded-md bg-raised` |
| Empty | `EmptyState` (see §4.13). Default title "Nothing to show"; with an active search: "No rows match this search" plus "Clear the search to see the rest of the queue." |

**Status badges inside tables:** `StatusBadge` (§4.9) in the cell. For dense rows use `StatusDot` (`size-1.5` circle) plus text.

Example usage: `src/components/rcm/exception-queue.tsx`, `src/app/claims/page.tsx`.

### 4.5 Buttons

There is **no `Button` component**. Buttons are repeated Tailwind class strings. Standardise them like this (these are the exact strings found in the repo):

| Variant | Classes | Example |
|---|---|---|
| **Primary** | `rounded-full bg-action-primary px-3 py-1.5 text-label-sm text-on-color outline-none transition-colors duration-[180ms] hover:bg-action-primary-hover focus-visible:ring-2 focus-visible:ring-active` | `insight-card.tsx` |
| **Primary, large (forms)** | `h-11 rounded-full bg-action-primary text-label-md text-on-color … disabled:bg-action-primary-disabled` | `app/login/page.tsx` |
| **Secondary / outline pill** | `rounded-full border border-muted bg-action px-3 py-1.5 text-label-sm text-secondary outline-none transition-colors duration-[180ms] hover:border-default hover:bg-raised-2 hover:text-primary focus-visible:ring-2 focus-visible:ring-active disabled:opacity-40` | `insight-card.tsx`, `data-table.tsx` |
| **Toolbar pill (32 px)** | secondary plus `inline-flex h-8 items-center gap-1.5 px-3`, leading 13 px icon | Sort / Columns / Export |
| **Text / ghost** | `rounded-full px-3 py-1.5 text-label-sm text-tertiary hover:text-primary focus-visible:ring-2 focus-visible:ring-active` | `insight-card.tsx` |
| **Icon button** | `flex size-8 items-center justify-center rounded-full bg-action icon-tertiary hover:bg-raised-2 hover:icon-secondary focus-visible:ring-2 focus-visible:ring-active` (16 px icon). Small: `size-7` (`bg-action` replaced by hover-only) or `size-6` | top bar, drawer close |
| **Chip (toggle)** | idle `border border-muted bg-action text-tertiary hover:border-default hover:bg-raised-2 hover:text-secondary`; **active** `border-transparent bg-action-primary text-on-color`; shape `rounded-full px-2.5 py-1 text-label-sm`, `aria-pressed` | `FilterChips` in `data-table.tsx` |
| **Link-style** | `text-secondary underline-offset-2 hover:text-primary hover:underline` | login demo link |

Sizes: 32 px (`h-8`, default toolbar and top bar), 44 px (`h-11`, form submit). Small pills use `py-1`, standard use `py-1.5`.

States: **hover** = one surface step up plus stronger border; **focus** = `ring-2 ring-active` via `:focus-visible` only; **disabled** = `opacity-40` (secondary) or `bg-action-primary-disabled` (primary). **Loading** = no spinner. The label changes instead, for example "Enter command center" becomes "Entering…", and the button is disabled.

### 4.6 Forms

Only text inputs, a native select and a table checkbox exist in this repo.

| Control | Spec |
|---|---|
| Label | Eyebrow style above the field: `text-caption tracking-[0.08em] text-quaternary uppercase`, field wrapper `flex-col gap-1.5` |
| Text input | `h-11 w-full rounded-full border border-muted bg-action px-4 text-body-md text-primary outline-none placeholder:text-quaternary focus-visible:border-default focus-visible:ring-2 focus-visible:ring-active` (compact: `h-8`, `text-label-sm`) |
| Search input | `type="search"`, leading 13 px icon `absolute left-2.5`, input `pl-8` |
| Select | `Select` primitive: native `<select class="appearance-none pr-8 pl-3 …">` wrapped with a 12 px `ChevronDown` (`text-quaternary`) absolutely positioned at `right-2.5`. Styled with the same pill classes as buttons (`h-8 rounded-full border-muted bg-action text-label-sm text-secondary`) |
| Checkbox | See §4.4. Custom `role="checkbox"` button with `aria-checked` (supports `"mixed"`) |
| Validation | Inline `<p class="text-body-sm text-error">` below the form, before the submit button. Message is a full sentence with a full stop. **No red border on the field** |
| Form spacing | `flex flex-col gap-4`; submit button `mt-1` |
| Form field container | Single column, `mt-8` after the heading block |

**Not in repo** (no instances found by search): date picker, toggle/switch, radio, file upload, textarea, multi-select. Build them from the same tokens: pill/`rounded-lg` shape, `bg-action` fill, `border-muted`, focus ring `ring-2 ring-active`, checked state `bg-action-primary text-on-color`. A switch would be a `rounded-full` track, off `bg-raised-2`, on `bg-action-primary`, with a `bg-container` thumb. For errors, add a `border-error-stroke` to the field in addition to the message.

### 4.7 Dropdowns and popovers

- **Menu** (Sort, Columns): `absolute top-[calc(100%+6px)] right-0 z-40 w-56|w-64 rounded-lg border border-muted bg-container p-2 shadow-lg`. Starts with a hint line `px-1.5 pb-2 text-caption text-quaternary`. Items: `rounded-md px-2 py-1.5 text-label-sm`, idle `text-secondary hover:bg-raised hover:text-primary`, active `bg-raised text-primary`. Footer action is a full-width outline pill ("Clear sort", "Reset order"). Closes on outside `mousedown`.
- **Info popover** (`info-popover.tsx`): 15 px `Info` icon button (`size-7 rounded-full text-quaternary`), panel `top-[calc(100%+8px)] z-50 w-[min(calc(100vw-2.5rem),22rem)] sm:w-[28rem] rounded-lg border-muted bg-container p-3 shadow-lg`, closes on Escape or outside click. Used for how-to copy so descriptions do not take a page row.
- **Notification tray**: `w-[360px] max-h-[70vh] rounded-lg border border-default bg-container`; header with eyebrow title and "Mark all read" text button; rows `px-4 py-3 border-b border-muted hover:bg-raised` with a `StatusDot`, title (`text-body-md`, `text-primary` if unread, `text-tertiary` if read), detail (`text-body-sm text-tertiary`), relative time (`text-caption text-quaternary`).

### 4.8 Modal and command palette

`src/components/rcm/command-palette.tsx` is the only modal. `fixed inset-0 z-50 flex items-start justify-center pt-[12vh]`; scrim is a button with `bg-page/70`; dialog `w-[620px] max-w-[92vw] max-h-[62vh] rounded-xl border border-default bg-container`; header row has a 15 px search icon and `px-4` input, with a `border-b border-muted`. Results are grouped (Pages, Patients, Payers, Agents, Exceptions…) with ↑/↓/Enter/Esc keyboard support. Max 30 results.

Confirmation-style modals (title, body, footer buttons) **Not in repo**. Use the palette shell: `rounded-xl border border-default bg-container`, header `px-5 py-4 border-b border-muted`, footer right-aligned with Secondary then Primary pills.

### 4.9 Badges, chips and tags

`StatusBadge` / `PriorityBadge` / `StatusDot` in `primitives.tsx`.

```
StatusBadge:  inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium text-badge truncate
              fill = bg-{success|info|neutral|warning|error}-badge   (solid, white text)
StatusDot:    inline-block size-1.5 rounded-full bg-{tone}
```

Priority mapping: critical → error, high → warning, medium → info, low → neutral (label is the lowercase severity word as stored). Count bubble on the bell: `size-4 rounded-full bg-error-surface text-caption text-error tabular`. Inline status uses coloured text and an icon (for example evidence: `Check` green "Supports", `X` red "Conflicts", `AlertTriangle` red "Missing", `CircleMinus` orange "Partial").

### 4.10 Tabs

**Not in repo.** No `role="tab"` anywhere. The product uses **filter chips** (§4.5) and sidebar navigation instead of tabs. Work-board columns act as pseudo-tabs and can collapse to a vertical label rail. If tabs are needed, reuse the chip style as a segmented control rather than introducing underlined tabs.

### 4.11 Drawers and side panels

- **Evidence drawer** (`evidence.tsx`): `fixed inset-0 z-50 flex justify-end`; scrim `bg-page/70`; panel `w-[420px] max-w-full border-l border-default bg-container`; header `px-5 py-4 border-b border-muted` containing an eyebrow kicker ("Evidence"), a Michroma title, and a `size-7` close circle; body `px-5 py-3 overflow-y-auto`.
- **Context panel** (`context-panel.tsx`): `w-[min(360px,100vw)] border-l border-muted bg-container`; overlay with `bg-black/50` scrim below `xl`, docked inline at `xl`. Sections separated by `border-b border-muted px-5 py-4`, each with an eyebrow `<h3>` and `mt-2.5` content. Key/value rows: `flex justify-between py-1`, label `text-body-sm text-tertiary`, value `text-body-md text-primary text-right`.
- **Evidence row**: `flex gap-3 border-b border-muted py-2.5`, a 14 px status icon, a 12 px type icon, label (`text-body-md text-primary`), detail (`text-body-sm text-tertiary`), source line "System · 3h ago · 92% confidence" (`text-caption text-quaternary`).

### 4.12 Tooltips, toasts, alerts

- **Tooltips:** **Not in repo.** The code uses the native `title` attribute (collapsed sidebar items) and `aria-label`. Chart tooltips are Recharts: `background var(--color-container)`, `1px solid var(--color-muted)`, `borderRadius 8`, `fontSize 12`, `color var(--color-primary)`.
- **Toasts:** **Not in repo.** No toast system.
- **Alerts / banners:** **Not in repo** as a component. Use the feedback tokens: `rounded-lg border border-{tone}-stroke bg-{tone}-surface px-3 py-2`, icon `text-{tone}-icon`, text `text-{tone}`. Inline form errors are plain `text-error`.
- **Review flag:** `ConfidenceIndicator` shows a warning eyebrow (`text-caption tracking-[0.08em] text-warning uppercase`) when confidence is under 0.85.

### 4.13 Loaders, skeletons, empty states

- **Skeleton:** only in `DataTable`, `h-8 animate-pulse rounded-md bg-raised` ×6. No spinners anywhere.
- **EmptyState** (`primitives.tsx`): centred column, `min-h-[160px] gap-1.5 px-6 text-center`; optional 72 px 3D mark above; title `text-body-md text-tertiary`; detail `text-body-sm text-quaternary`. It is a plain statement with no illustration requirement and no call-to-action button.
- **Chart empty:** `<p class="p-4 text-body-sm text-quaternary">Nothing to chart for this query.</p>`.

### 4.14 Charts

`src/components/analytics/chart-view.tsx` (Recharts). Types: kpi, table, donut, pie, treemap, area, line, bar, stacked-bar, funnel, horizontal bar.

| Aspect | Spec |
|---|---|
| Colours | Cycle `var(--color-series-1…6)` (blue, green, orange, red, grey, purple). Always CSS variables, so charts follow the theme |
| Axes | No axis line, no tick line (`axisLine={false} tickLine={false}`), tick `fill: var(--color-quaternary)`, `fontSize: 11` |
| Gridlines | **None** |
| Bars | `radius={[4,4,4,4]}`; unselected bars dim to `--color-quaternary` when something is selected |
| Line / area | `type="monotone"`, `strokeWidth 2`, no dots; area `fillOpacity 0.18` |
| Donut | Inner radius 32 %, outer 44 % of size, `paddingAngle 1.5`, segment stroke `var(--color-container)`, centre label "Total" (`text-caption text-quaternary`) plus value (`text-body-md tabular`); legend list to the right with `size-2` dots, `text-body-sm`, value plus percent (`text-quaternary`) |
| Tooltip | See §4.12 |
| Animation | Off |
| Interactivity | Click a datum to drill down or filter; selected state dims others to 35 % opacity |
| Horizontal bar list | `BarList`: label and value on one row (`text-body-sm`), `h-1.5 rounded-full bg-raised-2` track, fill `bg-quaternary`, selected `bg-action-primary`. Deliberately **monochrome** when categories carry no status meaning |
| Value formats | currency → `$1.84M`; percentage → `82%`; otherwise `toLocaleString("en-US")` |

### 4.15 Progress and confidence

`ConfidenceIndicator`: label plus percent, then a `h-[3px] rounded-full bg-raised-2` track with a fill. Fill/text colour by band: ≥ 0.85 `secondary`, ≥ 0.70 `warning`, otherwise `error`. Work-board column progress bars are `h-0.5` (`bg-info`, or `bg-warning` when over capacity); column top bars are `h-0.5` in `info` (Open), `warning` (In progress), `success` (Done).

### 4.16 Navigation elements and icons

- **Icon library:** lucide-react, outline style. **Stroke width is 1.75 almost everywhere** (2 for tiny sort/status icons, 3 for the checkbox tick).
- **Icon sizes by context:** 17 px sidebar puck, 16 px top-bar icon buttons, 15 px bell/info/search-in-palette, 14 px tree items/evidence status/column chevrons, 13 px inline pill icons, 12 px dropdown chevrons and inline arrows, 11 px sort arrows.
- **Colour:** icons inherit via `icon-primary/secondary/tertiary/quaternary` utilities, mirroring the text hierarchy. Never a brand colour.
- **Always `aria-hidden`** on decorative icons, with `aria-label` on the button.
- **Inline arrows** `InlineArrow` is a 12 px `ChevronRight` and is the only separator glyph for flows ("Open → In progress").
- **Middle dot** (`·`) is the standard inline separator in metadata: "Source · 3h ago · 92 % confidence".
- **Decorative 3D marks:** `public/images/rcm/*.png`, referenced by id via `<Mark id="mark-kpi-slab" size={36}/>`. Sizes seen: 36 (KPI, cards), 44 (page header), 72 (empty state). They always have empty `alt`, and never replace a label or number.

---

## 5. Wording and content style

### 5.1 Tone

Operator-console voice: **formal, concise, declarative**. No exclamation marks, no emoji, no marketing superlatives. Sentences state facts and next actions. Examples from the code:

- "Where revenue is flowing, where it is stuck, why, and what should happen next."
- "The command center is operator-only."
- "That email or password does not match the demo operator."
- "Click again to flip direction."
- "Clear the search to see the rest of the queue."

### 5.2 Capitalisation

| Element | Rule | Examples |
|---|---|---|
| Page titles, nav items, panel titles | **Title Case** | Revenue Command Center, Exception Queue, Denial Intelligence, Collections & A/R |
| Eyebrow labels, table headers, form labels | Written in sentence/Title Case in source, **rendered UPPERCASE by CSS** (`uppercase` + `tracking-[0.08em]`). Do not type them in caps | EMAIL, PASSWORD, PRIMARY CAUSE |
| Buttons and pills | **Sentence case**, except product-action names which are Title Case | "Collapse sidebar", "Mark all read", "Clear sort", "Reset order", "Create Review Task", "Enter command center" |
| Status/priority values | lowercase stored words | critical, high, medium, low |
| Empty and error messages | Sentence case, full stop on sentences, no full stop on short titles | "No claims match this filter" |
| Placeholders | Sentence case, no full stop | "Search this queue" |
| Filter chip labels | Title Case or single words | "All", "Open" |

Be aware the repo is **not fully consistent** on button labels (for example "Create Review Task" is Title Case while neighbours are sentence case). For new apps, adopt sentence case for generic button labels, and Title Case for page and nav names.

### 5.3 Common strings

| Situation | Copy used |
|---|---|
| Empty table (generic) | "Nothing to show" |
| Filter returns nothing | "No {things} match this filter" (claims, appeals, denials, audit events, charges, documents) |
| Search returns nothing | "No rows match this search" / "Clear the search to see the rest of the queue." |
| Entity not found | "No claim CLM-1", "No document DOC-1" |
| Empty chart | "Nothing to chart for this query." |
| Empty list | "No evidence captured.", "No extracted fields", "No suggested codes" |
| Loading / submitting | Verb in progressive form with an ellipsis character: "Entering…" |
| Table toolbar | Search, Sort, Columns, Export; "Previous" / "Next"; "Showing 1–40 of 128" |
| Row count | "128 rows", "1 row", "3 selected" |
| Dismissals | Close, Mark all read, Clear sort, Reset order, Clear filters |
| Scoped state | "Scoped to {Stage} · clear" |
| Confidence | "92% confidence" |
| Placeholder password | "••••••••" |

### 5.4 Formats

Locale is pinned to `en-US` so SSR and client agree (`src/lib/rcm/format.ts`).

| Type | Format | Function |
|---|---|---|
| Currency, whole | `$1,234,567` (no decimals) | `usd()` |
| Currency, cents | `$1,234.56` | `usd(x, {cents:true})` |
| Currency, compact (KPIs, charts) | `$1.84M`, `$782K`, under $1,000 as whole dollars | `usdCompact()` |
| Integers | `1,234` | `count()` |
| Percent | `82.0%` (1 decimal default) | `percent()` |
| Signed delta | `+4.2%`, `-1.3%` (no plus sign when 0 or negative) | `signedPercent()` |
| Duration | `8.2 sec` under a minute, `3m 08s` otherwise | `duration()` |
| Relative time | `12m ago`, `3h ago`, `2d ago`, `in 4d` | `relativeTime()` |
| Age | `18h`, `5d` | `ageLabel()` |
| Absolute date | **ISO `YYYY-MM-DD`** | `shortDate()` |
| Aging buckets | `0-30`, `31-60`, `61-90`, `90+` ("0-30 days" under an eyebrow) | n/a |
| Empty value in a cell | `—` (em dash) | chart table |

---

## 6. Reusable assets

### 6.1 Files to copy into another repo

| Asset | Path | Notes |
|---|---|---|
| **Token file** | `src/styles/tokens.css` | Self-contained. Copy as-is |
| **Tailwind theme + base** | `src/app/globals.css` | Imports `tailwindcss` and `tokens.css`. Defines every utility, the type scale, base body styles and scrollbars |
| Font loading | `src/app/layout.tsx` (Geist + Michroma blocks) | Needs `next/font/google`. For non-Next apps, load the two families from Google Fonts and set `--font-geist` and `--font-michroma` |
| Theme provider | `src/context/theme-context.tsx` | Sets `data-theme` and `color-scheme`, persists to `localStorage` and a one-year cookie |
| Shared primitives | `src/components/ui/primitives.tsx` | `Panel`, `KpiTile`, `StatusBadge`, `PriorityBadge`, `StatusDot`, `EmptyState`, `BarList`, `SplitRow`, `Select`, `InlineArrow` |
| Data table | `src/components/ui/data-table.tsx` | Also exports `FilterChips`. Depends only on `primitives.tsx` and lucide-react |
| Info popover | `src/components/ui/info-popover.tsx` | Standalone |
| Shell | `src/components/layout/{app-shell,sidebar,sidebar-item,top-bar,page-header,logo,shell-gate}.tsx` | `app-shell.tsx` and `top-bar.tsx` import RCM-specific providers, palette and notifications; replace those with your own |
| Formatters | `src/lib/rcm/format.ts` | Imports `NOW` from the mock dataset for `relativeTime`; swap for `Date.now()` |
| Chart wrapper | `src/components/analytics/chart-view.tsx` | Coupled to the analytics query engine. Copy the **styling constants** (series array, `tooltipStyle`, axis props) rather than the file |
| Navigation model | `src/lib/rcm/navigation.ts` | Pattern: one array drives the sidebar, top-bar title and command palette |

Packages to install: `tailwindcss@^4`, `@tailwindcss/postcss@^4`, `lucide-react`, `recharts`. Add `react-grid-layout` only if you need draggable dashboards.

### 6.2 Brand assets

| Asset | Path |
|---|---|
| App icon / favicon | `src/app/icon.svg`; `public/brand/chronos-mark.svg` (used for icon and Apple touch icon via `metadata.icons`) |
| Mark (orange gradient clock tile, 1000×1000 SVG, rendered at 32 px with `rounded-[10px]`) | `public/brand/chronos-mark.svg`, `Chronos Assets/Chronos(Fav Icon).svg` |
| Wordmark light / dark (118×18, shown at `h-[18px]`) | `public/brand/chronos-wordmark-light.svg`, `chronos-wordmark-dark.svg` |
| Full logo light / dark | `public/brand/chronos-logo-light.svg`, `chronos-logo-dark.svg`; originals in `Chronos Assets/` |
| Login hero | `public/brand/login-bg.jpg` |
| 3D marks (99 PNGs) | `public/images/rcm/` (ids like `mark-command`, `stage-coding`); generated by `scripts/process-marks.py` |
| Reference screenshots | `docs/screenshots/{login,command-center,work-board,analytics-studio,claim-detail}.png` |

The wordmark swaps with the theme (`isDark ? dark : light`) in `logo.tsx`.

### 6.3 Copy-paste core tokens

**CSS variables** (minimal set; the full file is `src/styles/tokens.css`):

```css
:root {
  /* surface */
  --surface-page-background: #f2f2f2;
  --surface-container: #ffffff;
  --surface-raised: #fafafa;
  --surface-raised-x2: #f2f2f2;
  --surface-action: #f2f2f2;
  --surface-scroll-bar: #d4d4d4;

  /* text / icon */
  --text-primary: #101010;
  --text-secondary: #464646;
  --text-tertiary: #737373;
  --text-quaternary: #8a8a8a;
  --text-on-color: #ffffff;

  /* stroke */
  --stroke-muted: rgba(0, 0, 0, 0.08);
  --stroke-default: rgba(0, 0, 0, 0.14);
  --stroke-active: rgba(0, 0, 0, 0.24);

  /* action */
  --action-primary-default: #101010;
  --action-primary-hover: #232323;
  --action-primary-disabled: #d4d4d4;
  --action-primary-content: #ffffff;
  --action-secondary-default: #f2f2f2;
  --action-secondary-hover: #e5e5e5;

  /* feedback */
  --feedback-success-content: #2b7046; --feedback-success-background: rgba(63,174,105,.12); --feedback-success-badge: #2b7046;
  --feedback-info-content:    #1e61a0; --feedback-info-background:    rgba(44,150,219,.12); --feedback-info-badge:    #1e61a0;
  --feedback-warning-content: #c1460f; --feedback-warning-background: rgba(255,123,28,.12); --feedback-warning-badge: #c1460f;
  --feedback-error-content:   #c62830; --feedback-error-background:   rgba(255,65,73,.12);  --feedback-error-badge:   #c62830;
  --feedback-neutral-content: #464646; --feedback-neutral-background: rgba(0,0,0,.06);      --feedback-neutral-badge: #464646;
  --feedback-badge-content: #ffffff;

  /* chart series */
  --analytics-series-1: #2179be; --analytics-series-2: #318c54; --analytics-series-3: #e95d0f;
  --analytics-series-4: #e9343c; --analytics-series-5: #626262; --analytics-series-6: #862aa3;
}

[data-theme="dark"] {
  --surface-page-background: #000000;
  --surface-container: #101010;
  --surface-raised: #191919;
  --surface-raised-x2: #232323;
  --surface-action: #191919;
  --surface-scroll-bar: #3b3b3b;

  --text-primary: #fafafa;
  --text-secondary: #d4d4d4;
  --text-tertiary: #8a8a8a;
  --text-quaternary: #626262;
  --text-on-color: #000000;

  --stroke-muted: rgba(255, 255, 255, 0.08);
  --stroke-default: rgba(255, 255, 255, 0.14);
  --stroke-active: rgba(255, 255, 255, 0.24);

  --action-primary-default: #fafafa;
  --action-primary-hover: #e5e5e5;
  --action-primary-disabled: #464646;
  --action-primary-content: #000000;
  --action-secondary-default: #232323;
  --action-secondary-hover: #323232;

  --feedback-success-content: #8ed8a9; --feedback-success-badge: #275a3b;
  --feedback-info-content:    #88cef4; --feedback-info-badge:    #1c5083;
  --feedback-warning-content: #ffb365; --feedback-warning-badge: #9a3814;
  --feedback-error-content:   #ff969b; --feedback-error-badge:   #a62329;
  --feedback-neutral-content: #d4d4d4; --feedback-neutral-background: rgba(255,255,255,.06); --feedback-neutral-badge: #464646;

  --analytics-series-6: #b65bd8;
}
```

**Tailwind v4 theme mapping** (`globals.css`, abridged):

```css
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-michroma), var(--font-geist), sans-serif;

  --color-page: var(--surface-page-background);
  --color-container: var(--surface-container);
  --color-raised: var(--surface-raised);
  --color-raised-2: var(--surface-raised-x2);
  --color-action: var(--surface-action);

  --color-primary: var(--text-primary);
  --color-secondary: var(--text-secondary);
  --color-tertiary: var(--text-tertiary);
  --color-quaternary: var(--text-quaternary);
  --color-on-color: var(--text-on-color);

  --color-muted: var(--stroke-muted);     /* border-muted */
  --color-default: var(--stroke-default); /* border-default */
  --color-active: var(--stroke-active);   /* ring-active */

  --color-action-primary: var(--action-primary-default);
  --color-action-primary-hover: var(--action-primary-hover);
  --color-action-primary-disabled: var(--action-primary-disabled);

  --color-success: var(--feedback-success-content);
  --color-success-badge: var(--feedback-success-badge);
  --color-success-surface: var(--feedback-success-background);
  /* …same five-token pattern for info, warning, error, neutral */
  --color-badge: var(--feedback-badge-content);

  --color-series-1: var(--analytics-series-1); /* …through 6 */

  --text-caption: 12px;
  --text-caption--line-height: 16px;
  --text-caption--font-weight: 500;
  --text-label-sm: 12px;  --text-label-sm--line-height: 16px;  --text-label-sm--font-weight: 500;
  --text-label-md: 14px;  --text-label-md--line-height: 20px;  --text-label-md--font-weight: 500;
  --text-body-sm: 12px;   --text-body-sm--line-height: 16px;   --text-body-sm--letter-spacing: -0.01em;
  --text-body-md: 14px;   --text-body-md--line-height: 20px;   --text-body-md--letter-spacing: -0.01em;
  --text-display-lg: 18px; --text-display-lg--line-height: 1.25; --text-display-lg--letter-spacing: -0.01em;
  --text-display-xl: 22px; --text-display-xl--line-height: 1.2;  --text-display-xl--letter-spacing: -0.01em;
  --text-display-2xl: 28px; --text-display-2xl--line-height: 1.15; --text-display-2xl--letter-spacing: -0.02em;
}

@utility tabular { font-variant-numeric: tabular-nums; }
@utility icon-tertiary { color: var(--icon-tertiary); }

body {
  background: var(--surface-page-background);
  color: var(--text-secondary);
  font: 14px/20px var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
}
```

**Theme object for non-Tailwind stacks (JS)**

```ts
export const chronos = {
  font: { ui: "Geist, ui-sans-serif, system-ui, sans-serif", display: "Michroma, Geist, sans-serif" },
  radius: { control: 9999, card: 8, popover: 8, modal: 12, inner: 6, checkbox: 4 },
  space: { base: 4, page: 20, pageSm: 16, section: 16, kpiGap: 12, panelPad: 16, headerH: 44 },
  size: { topbar: 56, sidebarRail: 68, sidebarOpen: 252, contextPanel: 360, drawer: 420, control: 32, input: 44 },
  motion: { fast: "150ms", base: "180ms", layout: "200ms", easing: "ease-out" },
  light: { page: "#f2f2f2", container: "#ffffff", raised: "#fafafa", action: "#f2f2f2",
           text: ["#101010", "#464646", "#737373", "#8a8a8a"],
           stroke: { muted: "rgba(0,0,0,.08)", default: "rgba(0,0,0,.14)", active: "rgba(0,0,0,.24)" },
           primary: "#101010", primaryHover: "#232323" },
  dark:  { page: "#000000", container: "#101010", raised: "#191919", action: "#191919",
           text: ["#fafafa", "#d4d4d4", "#8a8a8a", "#626262"],
           stroke: { muted: "rgba(255,255,255,.08)", default: "rgba(255,255,255,.14)", active: "rgba(255,255,255,.24)" },
           primary: "#fafafa", primaryHover: "#e5e5e5" },
  status: { success: "#2b7046", info: "#1e61a0", warning: "#c1460f", error: "#c62830", neutral: "#464646" },
  series: ["#2179be", "#318c54", "#e95d0f", "#e9343c", "#626262", "#862aa3"],
};
```

---

## 7. Gaps and inconsistencies worth knowing

- **No `Button`, `Input` or `Tabs` component.** Class strings are copy-pasted. When you port, create wrappers so the variants in §4.5 are defined once.
- **Not implemented:** tooltips, toasts, alerts, tabs, date pickers, switches, radios, file upload, textarea, confirm modals, breadcrumbs, spinners. Recommendations are in the relevant sections, built from existing tokens.
- **Defined but unused in `.tsx`:** the `action-tertiary-*`, `border-disabled` (`--stroke-disabled`) and `on-color-stroke` utilities, and the role type tokens `text-heading-{lg,md,sm}`, `text-display-page` and `text-display-metric(-xl)`. The `action-secondary-*` utilities appear only once (`bg-action-secondary-disabled` in `sidebar-item.tsx`). The secondary pill actually uses `bg-action` plus `border-muted`, so treat that as the real secondary style.
- **Legacy key:** `data-table.tsx` also reads an old `wayam-table-cols:*` localStorage key as a fallback.
- **README claim of "Light by default"** is accurate: the layout reads the `chronos-theme` cookie and defaults to `light`.
- **Heading elements** are not globally styled; any new page that forgets the role classes will render unstyled browser defaults.
- **Accessibility conventions worth keeping:** visible `:focus-visible` rings on every control, `aria-pressed` on toggles, `aria-sort` on headers, `aria-current="page"` on active nav, `sr-only` labels on icon-only inputs, `aria-hidden` on decorative icons, keyboard navigation in tables and the palette.

---

## Redesign checklist

Follow these rules and an app will read as Chronus.

1. **Tokens only.** Use semantic tokens (`bg-container`, `text-secondary`, `border-muted`). Never a raw hex or `--ref-*` value in a component.
2. **Greyscale first.** Primary action is near-black (light) or near-white (dark). Colour means status only: green success, blue info, orange warning, red error. Orange is brand-only (logo).
3. **Light is the default theme.** Dark is a toggle via `data-theme="dark"` on `<html>`, persisted in a cookie. Every surface must have a dark value.
4. **Two fonts.** Geist for everything. Michroma, weight 400 only, for page and top-bar titles, KPI and metric numbers, and drawer titles.
5. **Eyebrow labels.** Panel titles, table headers, KPI labels and form labels are `12px / 500 / +0.08em / uppercase / text-quaternary`.
6. **Body is 14 px, table text and secondary text are 12 px.** Default text colour is `text-secondary`. `text-primary` is for titles, values and active items.
7. **Numbers are tabular.** Apply `tabular` to every figure, delta, count and timestamp.
8. **Pills for controls, 8 px for containers.** Buttons, inputs, selects, chips, badges and icon buttons are `rounded-full`. Cards, panels and popovers are `rounded-lg`. Modals are `rounded-xl`.
9. **Flat surfaces.** Separate with a 1 px `border-muted` hairline and a one-step surface change. No shadows on cards. `shadow-lg` only on dropdown menus and flyouts. Drawers and modals use `border-default`.
10. **Surface ladder.** Page `bg-page` → card `bg-container` → hover/selected `bg-raised` → control fill `bg-action` → control hover `bg-raised-2`.
11. **Fixed viewport shell.** Top bar `h-14`, sidebar 68 px rail expanding to 252 px, optional 360 px context panel at ≥ `xl`. The document does not scroll; page bodies do (`p-4 sm:p-5`, sections `gap-4`).
12. **Page = `PageHeader` + `PageBody`.** Header has a Michroma title, a one-line `text-tertiary` description, an info popover for long help text, and right-aligned actions. No breadcrumbs: the top bar shows group eyebrow plus title.
13. **Sidebar active state** is a solid circular "puck" (`size-9`) in the primary action colour with an inverted icon. Idle pucks use `bg-action`.
14. **Primary action in a view is one solid pill.** Everything else is an outline pill (`border-muted bg-action`) or a text button. Chips use the solid fill for the active state.
15. **Focus is always visible.** `focus-visible:ring-2 ring-active` on every interactive element. Disabled is `opacity-40` or the disabled action token.
16. **Hover is subtle and quick.** `transition-colors` at 180 ms (150 ms in rows). Move one surface step up and strengthen the border to `border-default`.
17. **Tables:** sticky container-coloured header, hairline row dividers, no zebra, row hover `bg-raised`, sortable headers with 11 px arrows, 40 rows per page, "Showing X–Y of Z", Previous / Next pills, and a stacked-card layout under 720 px container width.
18. **Status display:** solid pill badge with white text for table status; `StatusDot` for dense rows; coloured text for deltas. Priority maps critical → error, high → warning, medium → info, low → neutral.
19. **Icons:** lucide, stroke 1.75, sized by context (17 / 16 / 14 / 13 / 12), coloured with the `icon-*` hierarchy, decorative ones `aria-hidden`.
20. **Charts:** Recharts, series tokens 1–6 in order, no gridlines, no axis or tick lines, 11 px `text-quaternary` ticks, rounded 4 px bars, no animation, tooltip in `container` with `muted` border and 8 px radius.
21. **Empty states are plain statements:** "No {things} match this filter" in `text-tertiary`, with an optional hint in `text-quaternary`. No spinners. Use `animate-pulse` skeleton rows for loading.
22. **Copy:** formal and concise. Title Case for page, nav and panel names. Sentence case for buttons, placeholders and messages. No exclamation marks or emoji. Middle dot `·` between metadata. Loading verbs end in `…`.
23. **Formats:** `en-US`; `$1,234`, `$1.84M`, `$782K`; `82.0%`; signed deltas `+4.2%`; relative time `3h ago`; absolute dates `YYYY-MM-DD`; durations `3m 08s`; empty cell `—`.
24. **Responsive:** sidebar becomes an off-canvas drawer below `lg`; split rows stack below `lg`; the context panel overlays below `xl`; KPI grid goes 2 → 3 → 6 columns.