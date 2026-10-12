# Redesign report

Chronus-style UI redesign of the BOM Synchronization app (Wayam AI). Baseline: `7e885eb`. Head: `bfda617`.

Sections marked **TODO** need content from the original redesign summary, which was not available when this file was generated from git. Nothing in them has been guessed.

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

`git diff 7e885eb HEAD` shows no changes under `src/lib/`, `src/tests/`, `src/App.tsx` or `src/main.tsx`. The original logo SVGs (`wayam-logo-light.svg`, `wayam-logo-dark.svg`) are unchanged. The full do-not-touch list from the original brief is **TODO**; confirm it against the diff above.

## Login contract

`src/lib/auth.ts` (`isAuthenticated`, `login`, `logout`) and `src/tests/auth.test.ts` are unchanged, and the auth tests pass. Only the visual layer of `src/pages/Login.tsx` changed. Confirming that the form fields, the redirect behaviour and the error text are identical is **TODO**.

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

**TODO.** The type utilities now defined in `src/index.css` are: `type-eyebrow`, `type-label-sm`, `type-label-md`, `type-body-sm`, `type-body-md`, `type-body-lg`, `type-display-*`. The old-to-new mapping table was not available.

## Before and after per page

**TODO.** Visual and wording changes for each page. The per-page commits above are the source.

## Deliberate changes

- Avatars removed. Details **TODO**.
- Logo split into mark and wordmark (see above).
- Medium severity changed to the info (blue) colour. Details **TODO**.
- Wording edits (step 5). The list is **TODO**.

## Deviations from Chronus

**TODO.**

## Unused files left untouched

**TODO.**

## Pre-existing bugs (13 items)

**TODO.** The list of 13 pre-existing bugs was not available.

## Questions for reviewer

1. Should Medium stay blue (info), or go back to orange (warning)?
2. Should the unused files be deleted?
3. Do the pre-existing bugs need separate tickets?
