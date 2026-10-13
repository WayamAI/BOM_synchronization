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
