# Redesign report

Chronus-style UI redesign of the BOM Synchronization app (Wayam AI). Baseline: `7e885eb`. Head: `bfda617`.

Claims were checked against git (`git diff 7e885eb HEAD`) where possible. Corrections to the original notes are marked **Corrected**.

## Commits (7e885eb..HEAD, oldest first)

| Commit | Message |
|---|---|
| 5985848 | ui: step 1 chronus tokens and fonts |
| 0341ccf | ui: step 1b light default theme with data-theme attribute |
| b186b05 | ui: step 2 chronus app shell |
| 5883fde | ui: step 3a chronus shared primitives |
| 46cd63c | ui: step 3b chronus tables (restyle only) |
| d50287e | ui: step 3c chronus charts |
| c6dd4d2 | ui: step 4a login page |
| a2205a0 | ui: step 4b dashboard |
| 12b0b1d | ui: fix top bar title, unit glyphs and lifecycle strip overflow |
| 0f75354 | ui: step 4c-i variants page |
| c6a2b40 | ui: step 4c-ii part master page |
| 03366a3 | ui: step 4c-iii supplier intel page |
| d997058 | ui: step 4d ebom manager |
| 67833cf | ui: quiet-default status hierarchy for ebom and other pages |
| adb27fd | ui: restore ebom health indicator, quiet when healthy |
| b4c1fbd | ui: step 4e-i mbom manager |
| 7bcef3e | ui: step 4e-ii service bom |
| 144d8a0 | ui: step 4e-iii software bom |
| 913c6ea | ui: step 4f-i changes page |
| a9e61e9 | ui: step 4f-ii bom compare |
| bd379e8 | ui: step 4g-i field quality |
| fa3837e | ui: step 4g-ii reports and not found |
| 2ecf2c8 | ui: step 5 wording, formats and accessibility pass |
| 0c530c4 | ui: step 6 final polish |
| 6f89e8e | ui: sidebar logo uses mark-only rail and mark plus wordmark when expanded |
| bfda617 | ui: restore BOM Synchronization app name under the sidebar wordmark |

## Diff stat against 7e885eb, by area

50 files changed, 2246 insertions, 1792 deletions.

| Area | Files |
|---|---|
| Config and global styles | `index.html`, `tailwind.config.ts`, `src/index.css`, `src/styles/tokens.css` (new) |
| Layout shell | `AppShell`, `Sidebar`, `TopNav`, `PageHeader`, `PipelineBar`, `nav.ts` (new) |
| Theme | `ThemeProvider`, `ThemeToggle` |
| UI primitives (shadcn) | `badge`, `button`, `card`, `dropdown-menu`, `input`, `label`, `popover`, `select`, `tabs`, `tooltip`; new `primitives.tsx` |
| Dashboard and charts | `ActivityFeed`, `CveHeatmap`, `DistributionDonut`, `DriftIndicator`, `HealthArc`, `SankeyFlow`, `SystemHealthMatrix`, `chartTheme.ts` (new), `EbomGraphView` |
| Pages | `Login`, `Dashboard`, `EbomManager`, `MbomManager`, `ServiceBom`, `SoftwareBom`, `Variants`, `PartMaster`, `SupplierIntel`, `Changes`, `BomCompare`, `FieldQuality`, `Reports`, `NotFound` |
| Brand assets | four new SVGs, listed below |

## New files

- `src/styles/tokens.css`
- `src/components/layout/nav.ts`
- `src/components/ui/primitives.tsx`
- `src/components/dashboard/chartTheme.ts`
- `src/assets/brand/wayam-mark-light.svg`
- `src/assets/brand/wayam-mark-dark.svg`
- `src/assets/brand/wayam-wordmark-light.svg`
- `src/assets/brand/wayam-wordmark-dark.svg`
- `REDESIGN_REPORT.md`

## Untouched files

Zero diff against 7e885eb (verified):

`src/App.tsx`, `src/main.tsx`, `src/lib/*` (`auth.ts`, `mockData.ts`, `utils.ts`), `src/context/ProgramContext.tsx`, `src/hooks/*`, `src/components/NavLink.tsx`, `src/tests/*`, `vite.config.ts`, `vitest*.config.ts`, `eslint.config.js`, `tsconfig*`, `package.json`, `package-lock.json`, `bun.lock`.

Approved logic-adjacent edits:

- `ThemeProvider.tsx`: light default and `attribute={["class","data-theme"]}`; the storage key "theme" is kept.
- `ThemeToggle.tsx`: classes and `aria-hidden` on the icons only.

The original logo SVGs (`wayam-logo-light.svg`, `wayam-logo-dark.svg`) are also unchanged.

## Login contract

Verified in `src/pages/Login.tsx` against 7e885eb. Unchanged: `#email` and `#password` ids, the "Email" and "Password" labels, the "Sign in" heading and button, and the error string "Enter a valid email and a password to continue." `src/lib/auth.ts` and `src/tests/auth.test.ts` are unchanged.

Copy changes: password placeholder `••••••••••••` to `••••••••`; the demo note em dash replaced with a full stop.

## Dependencies

No new dependencies. `package.json`, `package-lock.json` and `bun.lock` have no diff against 7e885eb.

## Sidebar logo

- Collapsed rail (68px): mark only, 32px wide, no text.
- Expanded sidebar (252px) and mobile drawer: mark (32px) and wordmark (20px high, `gap-2.5`), with "BOM Synchronization" beneath the wordmark as `type-eyebrow text-quaternary`, single line, truncated if needed.
- The app name is kept visible because it is the only identifier of this accelerator. All accelerators share the Wayam logo.
- Light/dark switching is unchanged (`dark:hidden` / `dark:block` pairs).
- The page `<title>` is unchanged.

## Shared primitives

In `src/components/ui/primitives.tsx`: `Unit`, `Panel`, `KpiTile`, `StatusDot`, `QuietStatus`, `LifecycleStatus`, `EmptyState`.

In `src/components/dashboard/chartTheme.ts`: `seriesColor`, `chartTooltipStyle`, `chartTooltipLabelStyle`, `axisTick`.

## text-* to type-* mapping

Reason: `cn()` uses tailwind-merge, which treats unknown `text-*` names as colours and drops them next to `text-tertiary` and similar.

| Chronus | This repo |
|---|---|
| text-caption | type-caption |
| text-label-sm / text-label-md | type-label-sm / type-label-md |
| text-body-sm / -md / -lg | type-body-sm / -md / -lg |
| text-display-base / -lg / -xl / -2xl | type-display-* (Michroma, 400) |
| eyebrow (text-caption tracking-[0.08em] uppercase) | type-eyebrow + text-quaternary |
| border-muted / border-default | border-hairline / border-strong |
| ring-active | ring-active |

## Before and after per page

- **Shell:** two 64px bars and a 256px sidebar with breadcrumbs, orange gradients, glow and dark default became an h-14 top bar with a group eyebrow (sr-only h1), a 40px scrollable lifecycle chip strip with a right fade, a 68px rail (puck icons, label flyout) that expands to 252px, and an off-canvas drawer below lg (fixes the old ml-64 offset). Main is the scroll region. Light is the default. The logo is split into mark and wordmark, with the app name under the wordmark.
- **Login:** shadcn card became a split layout with a solid brand panel and a form column, h-11 pill inputs and button, and eyebrow labels.
- **Dashboard:** own h1 became PageHeader (program line in the subtitle). Fleet cards have aria-pressed, a KpiTile strip, Panels, EmptyState for empty ECN and field lines, health gauges with % in Geist, and flat charts. Wording: Assy/Ops/Kits/Sups/Vars to Assemblies/Operations/Service kits/Suppliers/Variants; Rlsd/Rvws/Svcbl to Released/In review/Serviceable; "CRITICAL IMPACT" to "Critical impact"; "Explore AI Strategy" to "Explore AI strategy".
- **Variants:** KpiTile row (the Conflicts tile keeps its tone via valueClassName); powertrain and trim as plain text; Clean is quiet; conflict rows keep the warning badge.
- **EBOM Manager:** chip tabs (Tree/Table/Graph). Tree rows have medium-weight names, a "PN · rev · ×qty" meta line, quiet lifecycle text, a HealthDot visible only for warning and critical, and hairline rows of about 37px. The Table view first column is restored as Health. The drawer has border-strong, a Michroma title and wrapping chip tabs. Graph nodes are neutral, with colour for status only and no glow.
- **MBOM, Service BOM, Software BOM:** Panels, chip segmented controls, quiet normal states, solid badges for issues. CVE chart: critical red, high orange, medium blue, low grey.
- **Part Master (list and detail):** Panels and LifecycleStatus. ECN states are quiet except In Review (warning) and Rejected/Cancelled (neutral).
- **Supplier Intel:** KpiTiles, AI forecast as a Panel, heatmap on series tokens. Tier, rating and geo are plain text. Single-source: Yes keeps the warning badge.
- **Changes (list and detail), BOM Compare:** restyled tables, severity mapping, approve/reject pill styles.
- **Field Quality, Reports, NotFound:** Panels, tables, EmptyState-style 404.
- **All tables:** eyebrow headers, hairline rows, hover:bg-raised, tabular numbers, and "No … match this filter" empty rows on 7 filterable tables. No sorting or pagination was added.
- **Buttons:** sentence case throughout (New variant, Add component, Run vulnerability scan, Schedule report, Predict disruptions, Scope recall (AI)…). "→" in link labels is replaced by chevron icons.

## Deliberate changes

- Dashboard avatar stack (including "+4") removed: decorative, and loaded from an external service.
- Decorative KPI icons and decorative colours removed.
- Medium severity is now info (blue) instead of orange (Live Quality Stream, Software BOM CVE chart).
- Logo split into mark and wordmark files (originals kept).
- Number formatting pinned to en-US.
- Wording edits as listed under the Dashboard and Buttons items above.

## Deviations from Chronus

- The collapsed-rail flyout shows a per-item label, not the Chronus group list (regrouping nav would be a logic change).
- The top bar has no visible title (sr-only h1); the group eyebrow hides below sm.
- The lifecycle strip is an extra 40px row that Chronus does not have (kept to preserve the feature).
- The Login brand panel is a solid colour (no hero image in the repo).
- HealthArc keeps its count-up animation (logic inside the component).
- Tailwind stays on 3.4 instead of the Chronus v4 (`package.json`: `^3.4.17`).

## Unused files left untouched

- `src/pages/Index.tsx` and `src/App.css`.
- `src/components/dashboard/ActivityFeed.tsx` and `DriftIndicator.tsx`. **Corrected:** these two do appear in the diff (small edits, 2 and 4 lines), so they were touched, not left alone.
- Unused shadcn `ui/*` files, not restyled. **Corrected:** the original notes said about 25. A check of imports from non-ui code finds 37 files with no direct app import (accordion, alert-dialog, alert, aspect-ratio, avatar, breadcrumb, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, form, hover-card, input-otp, menubar, navigation-menu, pagination, progress, radio-group, resizable, scroll-area, separator, sheet, sidebar, skeleton, slider, switch, table, textarea, toggle-group, toggle). Some are used by other ui files (for example dialog by sheet). `card.tsx` is among them and was restyled by 2 lines.

## Pre-existing bugs (13 items)

Not fixed in this redesign.

1. "Child components: -1" for leaf parts (getChildCount, EBOM drawer).
2. Dead links `/lineage/:pn` (EBOM drawer) and `/compliance` (Field Quality) lead to 404.
3. `key={n.id + Math.random()}` in EBOM table rows forces remounts (`EbomManager.tsx:383`).
4. Most action buttons (New…, Approve, Reject, Generate, Export, Trace, Compare, Filter) have no handler.
5. Unused files (listed above).
6. "Pipeline streaming live" is static text.
7. Two lint errors (empty interfaces) in unused `ui/command.tsx` and `ui/textarea.tsx`.
8. The HealthArc count-up animation deviates from "no chart animation".
9. Clickable table and tree rows have no keyboard activation (would need new handlers).
10. text-quaternary is about 3.4:1 on white. This is a Chronus choice and is below WCAG AA for small text.
11. Some mock dates are not ISO (for example Reports "Mar 30, 2026"); they live in mock data.
12. Unused colour strings in mockData (distribution, merSysRoots); colours are mapped in components.
13. The Medium to info mapping changes meaning (orange to blue).

## Verification

Baseline: npm test 23/23, build OK, lint 10 problems (2 errors, 8 warnings), all pre-existing. Final: same results. Browser: 14 routes, light and dark, 1440px and 390px, with no console errors, one h1 each and no horizontal overflow. That browser check was done before the logo and app-name commits.

## Icons

Entity icons come from `src/components/icons/iconMap.ts`: one id to `{ lucide, mark }` map. Nothing is hard-coded in components. An unknown id falls back to a generic `Box` icon; a missing or failed mark falls back to its lucide icon.

- **Marks (44px, empty alt):** `PageHeader` takes an optional `mark` prop. Shown on Variants, EBOM, MBOM, Service BOM, Software BOM, Part Master (list and detail), Supplier Intel, Field Quality, Reports, and Changes (list and ECN detail). Dashboard, BOM Compare and the not-found headers have none.
- **Row and tab icons (grey lucide, 14px, `aria-hidden`):** EBOM tree rows (assembly or part), the first column of the Part Master, Changes and Supplier Intel tables, the Service Kits and Field-Replaceable Units chips, and the EBOM vs MBOM chip on BOM Compare. EBOM tree names and the part-number line carry a `title` for truncated text.
- **Cutting script:** `scripts/cut-icons.py` reads `design/icons-sheet.jpg` (kept out of the build), detects the 12 icons by connected components, removes the background and shadows with edge defringing, and writes 144x144 PNGs to `public/icons/`. Re-run instructions are in `README.md`.
- **Tests:** `src/tests/icons.test.tsx` (new file) covers the mapping, the fallback, PNG size and transparent corners, and the header marks.
- **No brand colour token:** the marks carry the orange and row icons stay grey, so no `--icon-brand` was added and no brand icon sits next to a warning badge or dot.

Known concerns:

- **field-event looks like a warning sign.** It is used only in the Field Quality header, never in rows or next to warning badges. A test checks that no other page renders it.
- **Unused sizes:** `EmptyState` accepts a `mark` prop for the 72px size, and the 36px KPI/card size is defined in the design system, but neither is used yet. Field Quality has no empty state, and no KPI tile or card needed a mark.
- **Provenance:** the icons were AI-generated (Google Flow) from a single sheet, so there is no editable vector source.
- **Sidebar consistency:** see the table below.

Sidebar vs mapping (lucide icons), checked where both show the same concept:

| Page | Sidebar icon | Mapping icon | Decision |
|---|---|---|---|
| Variants | Layers | variant: Layers | match |
| Engineering BOM | GitBranch | ebom: GitBranch | match |
| Manufacturing BOM | Factory | mbom: Factory | match |
| Change Management | FileEdit | ecn: FileEdit | match |
| Supplier Intel | Truck | supplier: Truck | match |
| Field Quality | AlertOctagon | field-event: AlertOctagon | match |
| Service BOM | Wrench | service-kit: Wrench, fru: Cog | mapping changed to follow the sidebar; the two chips stay distinct |
| Reports | FileBarChart | report: FileBarChart | mapping changed to follow the sidebar |
| Part Master | Boxes | part: Box (assembly: Boxes) | accepted mismatch, no change |
| Software BOM | ShieldAlert | software: Cpu | accepted mismatch (ShieldAlert reads as cyber risk), no change |

BOM Compare (GitCompare) has no entity in the mapping. The nav is unchanged.

## Questions for reviewer

1. Should Medium stay blue (info), or go back to orange (warning)?
2. Should the unused files be deleted?
3. Do the pre-existing bugs need separate tickets?

## Login hero image

- **Source:** AI-generated with Google Flow (exploded-view SUV on a dark background); original kept at `design/login-hero-source.jpg` (2752×1536), outside the build.
- **Corner mark:** the generator's sparkle (✦) in the bottom-right was removed by cropping, not painting. Crop box `(0, 0, 2752, 1376)` — 160 px trimmed from the bottom; the car stays fully in frame.
- **Outputs:** `src/assets/brand/login-hero.webp` (q80, 88 KB) and `login-hero.jpg` (q82, 169 KB), both 2400×1200.
- **Script:** `python scripts/prepare-login-hero.py` (Pillow only) regenerates both from the source.
- **Login:** shown as a full-bleed `<picture>` behind the left panel (decorative, `object-right`), with a bottom-left black gradient overlay for headline legibility. Same in light and dark.

## Review fixes

Branch `ui-review-fixes` (from merged `main` at `aeb76de`). 17 commits, 37 files changed. Frontend only, no new dependencies, no backend change. The existing tests are unchanged; new tests are in `src/tests/review-fixes.test.tsx`. Final checks: `tsc` clean, 82 of 82 tests, build OK, lint 10 problems (2 errors, 8 warnings, same as baseline), production preview checked on all 14 routes plus the login scenarios.

### Commits

| Commit | Point |
|---|---|
| `48e9de6` | Restore `CHRONUS_DESIGN_SYSTEM.md` |
| `b22c10c` | 1. Login first (`sessionStorage`) |
| `d96b6c8` | Deployment config: `vercel.json` |
| `66aed50` | 6. Dashes, `InlineArrow` |
| `0f987e1` | 4. Casing and unified page names |
| `d38f14d` | 5. Tree view fixes |
| `c26cd07` | 3. Sidebar structure |
| `d2a2eed` | 2. Icon gaps |
| `16dd1d5` | 7. Line gaps |
| `b9bcb62` | 8. Dashboard charts |
| `b3325c8` | Scroll bug on `/ebom` |
| `0fc076e` | Last dash (heatmap tooltips) |
| `f57495e` | Top bar search hint |
| `ce1b9f3` | Toolbar investigation and test |
| `8f36e80` | Singular and plural labels |
| `8875914` | Child components count |
| `83bb864` | 9. Consistency pass |

### Design document

`CHRONUS_DESIGN_SYSTEM.md` was added in the baseline commit `7e885eb`, which is the root of the local `master` branch. The `main` and `ui-chronus-redesign` history never contained it, so it was not deleted by the merge; it was never carried over. It is restored from `7e885eb` in its own commit.

### Deployment config change

`vercel.json` is new: a single rewrite of every path to `/index.html`, so a refresh or deep link such as `/ebom` does not return a 404 on Vercel. Nothing else in deployment config changed.

### 1. Login shown first

- **Was wrong:** `auth.ts` stored `wayam_auth` in `localStorage`, which survives tabs and browser restarts, so `RequireAuth` let a returning browser straight into the dashboard.
- **Changed:** the flag lives in `sessionStorage` (`src/lib/auth.ts`); `logout()` also clears the old `localStorage` key. In `src/App.tsx`, unknown URLs now sit behind `RequireAuth`, so a logged-out user reaches `/login` for any path.
- **Verified (preview build):** fresh browser to `/`, `/ebom`, `/parts/BAT-PCK-8500` and an unknown URL all land on `/login`; sign in goes to `/`; reload keeps the session; a new tab opens on `/login`. Sign in does not return to the requested page (it never did), it goes to the dashboard.

### 2. Icons

- **Checked:** `public/icons/*.png` and the brand SVGs load correctly in the production build (HTTP 200, filenames lowercase and matching the ids, `BASE_URL` is `/`), so nothing breaks on Linux or Vercel.
- **Gaps filled:** lifecycle chips, Dashboard and BOM Compare header marks, empty-state marks on 7 tables and the Dashboard ECN queue, MBOM and Variants row icons, and an optional `icon` on `Panel`. Rows and panel headers use grey lucide icons only. `field-event` stays on Field Quality only.
- **Files:** `PipelineBar.tsx`, `primitives.tsx`, `Dashboard.tsx`, `BomCompare.tsx`, `Variants.tsx`, `MbomManager.tsx`, and the pages with empty states.

### 3. Sidebar

- Groups: Overview (one link, not collapsible), BOM Views, Change & Quality, Intelligence. Routes are unchanged. The three multi-item groups collapse; the group of the current route opens on navigation; the rail still shows every item.
- Program Tree and Pinned are collapsed by default. The tree has a Chronus spine (1px, a tick per child, an L-shaped last corner) and scrolls in its own box.
- Nothing is clipped at 900px height. Files: `nav.ts`, `Sidebar.tsx`.

### 4. Casing

- `.type-eyebrow` no longer uppercases. A new `.type-section` uppercases, and is used only for panel titles and sidebar group labels.
- Table headers, field labels and KPI labels are sentence case. Panel and page names are Title Case. Status values render sentence case ("In review") through `statusText` (`src/lib/format.ts`); stored data is unchanged.
- One name per route across nav, top bar and page header: "Variants & Configuration", "Supplier Intelligence", "Field Quality". Also fixed: "All statuses", "ECUs", "Work instructions".
- **Deviation from Chronus:** Chronus renders every eyebrow label in uppercase. Here only panel titles and sidebar group labels are uppercase, by decision of the reviewer.

### 5. Tree view

- **Was wrong (pre-existing, identical on baseline):** the open state of each EBOM row was set once from the filter at mount, so searching "Battery Management" showed the ancestors but hid the matching row; "zzz" showed an empty panel.
- **Changed:** open state follows the filter unless the user toggled the row; a chevron button toggles while a row click only selects; rows are `treeitem`s with arrow keys, Enter and Space; a no-match empty state shows. In the sidebar, the chevron toggles and the name navigates (no double-click flicker).
- **Regression from the redesign:** the sidebar tree was hidden in the default rail and below the fold; it is now a collapsed section.

### 6. Dashes

Em and en dashes are removed from user-facing text. The em dash stays only as the empty-cell placeholder. A rendered-DOM scan (text, `title`, `aria-label`, `placeholder`, `alt`, SVG text) over 16 routes, 4 programs, menus, drawer tabs and the graph finds none in sentences.

Replacements:
- `index.html` title and `og:title`: "Wayam AI · BOM Synchronization".
- BOM Compare: "Only in A · name", "Only in B · name", "not in EBOM. Investigate."
- EBOM: "No parents. This is the top-level vehicle."; graph reset tooltip "Reset and collapse all".
- Changes: "not been revised yet, so there is no lineage to display."
- Dashboard insight: comma instead of dash. Part Master: "Top-level vehicle. No parents." and "Leaf part. No children."
- MBOM: "per vehicle, not tracked in EBOM". Field Quality: "Apr 12 to 14". Reports: "status: health, ECNs, risk, days-to-SOP".
- Mock data (9 lines: AI briefing, ECN titles and descriptions, activity and briefing items): dash became a comma.
- Sankey title and tooltip, supplier heatmap tooltips (`" - "` became `" · "`).
- The arrow in flow labels is the Chronus `InlineArrow` chevron; the double arrow is "vs" ("EBOM vs MBOM Reconciliation").

### 7. Line gaps

Sidebar group dividers run edge to edge like the dock borders. The last table row no longer doubles the panel border (global rule in `index.css`). The EBOM tree's last row merges with the panel border. The Program Tree has its spine.

### 8. Charts

- **Gauges:** colour follows the value (85+ healthy, 65 to 84 watch, below 65 risk), no count-up animation, status tokens only. Direction per gauge: EBOM maturity higher is better; MBOM readiness higher is better; **Supply risk lower is better** (healthy at 15% or less, watch at 35% or less); Service scope higher is better. At the current mock data EBOM maturity (83%) and Service scope (71%) show warning, MBOM readiness (53%) and Supply risk (40%) show error.
- **Change Velocity:** legend (Approved, Rejected, Cycle time in days), caption, cycle time on its own right axis, two bar colours, neutral legend text. The CVE Trend legend follows the same pattern.
- **System Health Matrix:** uses the shared `Panel`; neutral system tiles instead of six rainbow icons; the header label overlap is fixed; legacy tokens removed.
- Security Hub dashes removed; Quality Stream titles wrap to two lines.
- The reviewer's "acknowledgment graph" has no matching name in the app; Change Velocity (approved, rejected, cycle) was the nearest candidate and is the chart that was reworked.

### Scroll bug

- **Was wrong:** `sr-only` health labels in the EBOM tree are absolutely positioned. With no positioned ancestor they escaped the shell's `overflow-hidden` clip and made the document 1461px tall, so scrolling moved the whole app and left an empty area below the shell.
- **Changed:** the shell and `<main>` are `relative`; `html` and `body` are `overflow: hidden` (Chronus 2.9); Login and the 404 page scroll inside their own `h-screen` wrapper. Files: `AppShell.tsx`, `index.css`, `Login.tsx`, `NotFound.tsx`.
- **Verified:** on all 14 routes at 1440x900, 1920x1080, 1366x768 and 390px, after wheel scrolling main and the sidebar and pressing End, `document.scrollingElement.scrollTop` stays 0 and the shell fills the window. Only `<main>` is a vertical scroll region.

### Top bar search, plurals, child components

- **Search:** on baseline `7e885eb` the input was decorative (no value, no handler; the Command K hint did nothing). No search logic was added; the pill is read-only and shows "Search coming soon" on focus.
- **Plurals:** `plural()` in `src/lib/format.ts` is used for dynamic counts (Structure title, subtitles, Reports descriptions, Service BOM coverage, lifecycle strip, lead time days). CVE badges read "1 CVE" and "2 CVEs".
- **Child components:** `getChildCount` subtracted one after counting descendants, so a leaf showed -1 and every assembly was one short. It now returns the descendant count (a leaf is 0).
- **Toolbar report:** a reviewer saw the `/ebom` toolbar missing. The DOM and geometry are identical to `c26cd07` at four viewport sizes, and every page's tabs, selects and search inputs match it. The likely cause is that a slightly scrolled `<main>` slides the toolbar under the sticky page header. A regression test guards it; the toolbar is not pinned, by decision.

### 9. Consistency

Legacy colour classes (`text-muted-foreground`, `border-border`, `bg-muted`, `bg-card`, `text-primary`, `bg-primary`, `bg-critical` and relatives) became Chronus tokens; raw `text-xs`, `text-sm` and pixel sizes became `type-*` roles; row icons are 14px grey lucide; hand-sized icon buttons use the `icon` variant; KPI and card grids use `gap-3`; custom panel headers use the shared `h-11` `PanelHeader`; BOM Compare selects are `h-8`; the top bar role tag is `type-caption`. The ECN detail table is wrapped in `overflow-x-auto`, which fixes the horizontal overflow at 390px.

### Development build vs production build

Checked on 15 pages (login plus the 14 routes) with the dev server (`vite`, port 8080) and `npm run build && npm run preview`: identical rendered text, identical image set (none broken), identical fonts (Geist and Michroma loaded), identical font families and one `h1` per page. The only difference is that the dev server logs two React Router future-flag warnings; the production build logs none. Fonts are loaded from Google Fonts, so a deployment without network access to it falls back to system fonts.

### Open questions for reviewer

Left as they are, by decision:
1. Inert buttons (no handler, same as baseline): top bar Export icon, Filter (EBOM), New variant, Compare, Add relationship, Add component, Sync from EBOM, Release to MES, Service manual, New service kit, Export CycloneDX, Run vulnerability scan, New ECN, Approve, Reject, Export diff (CSV), New part, Propose change, Predict disruptions, Scope recall (AI), the Trace buttons, Schedule report, the Generate buttons.
2. Dead links `/lineage/:pn` (EBOM drawer) and `/compliance` (Field Quality) lead to the 404 page.
3. The Command K hint in the top bar search does nothing.
4. The MBOM "Work instructions" column has no data; cells show an em dash.
5. Unused files kept: `Index.tsx`, `App.css`, `SankeyFlow`, `DistributionDonut`, `DriftIndicator`, `ActivityFeed`, and the unused shadcn `ui/*` files.
6. "Pipeline streaming live" is static text.
7. Overview is a single link rather than a collapsible group (a one-item group has nothing to collapse).
8. Should the sidebar names stay in full ("Variants & Configuration") or be shortened in the narrow rail flyout?
