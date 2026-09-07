# Phase 6: Existing Table Migration Audit & Plan

## Executive Summary
This document audits all six existing table implementations in **BOM Synchronization** prior to the migration of the first table (**EBOM**) to [`EnterpriseTable<T>`](file:///D:/projects/BOM_synchronization-main/src/components/ui/enterprise-table.tsx).

Strict adherence to zero functionality loss, zero schema mutations, and preservation of automotive domain terminology is enforced.

---

## 1. Six-Table Audit Matrix

### Table 1: EBOM (Engineering BOM) — TARGET FOR IMMEDIATE MIGRATION
- **File Location**: [`app/(app)/ebom/page.tsx`](file:///D:/projects/BOM_synchronization-main/app/(app)/ebom/page.tsx) (lines 366–403)
- **Data Source**: `buildEbomTree(rootPN, variantCode)` -> `flatten(tree)` -> filtered by `filter` search input and non-Vehicle/System types.
- **Row Type**: `EbomNode` (`id`, `name`, `partNumber`, `type`, `revision`, `status`, `health`, `qty`, `cost`, `supplier`, `owner`, `cves`, `warnings`, `version`).
- **Columns & Ordering**:
  1. Health status indicator (`dotCls(health)` pulse dot)
  2. Part Number (`partNumber`, font-mono text-[11px])
  3. Name (`name`, font-medium text-foreground)
  4. Type (`type`, font-mono text-[11px] text-muted-foreground)
  5. Rev (`revision`, font-mono text-[11px] text-muted-foreground)
  6. Qty (`qty`, font-mono text-[11px] tabular-nums)
  7. Cost (`cost`, right-aligned, font-mono tabular-nums, `$${cost.toLocaleString()}` or `—`)
  8. Supplier (`supplier ?? "—"`, font-mono text-[11px] text-muted-foreground)
  9. Lifecycle (`status`, badge with `lcBadge(status)`)
- **Existing Sorting**: None (rendered in flattened tree order).
- **Existing Filtering**: Variant selector (`Select` for `variantCode`), real-time search input (`filter` querying `name` and `partNumber`).
- **Row Actions**: `onClick={() => setSelected(n)}` opens the 400px `SidePanel` inspector drawer on the right.
- **Navigation Links**: Inside `SidePanel` (links to `/parts/[pn]`, `/mbom`, `/lineage/[pn]`).
- **Expandable / Detail Behavior**: Selecting a row opens `SidePanel` next to the table; table itself does not have inline row expansion.
- **Numeric Columns**: `qty`, `cost` (right-aligned with tabular numerals).
- **Badges / Indicators**: Lifecycle status badge, health status pulse dot.
- **Empty State**: Unhandled in raw table.
- **Pagination**: None (client-side high-density table).
- **Behavior to Preserve**:
  - Exact column set and ordering
  - Click row to select and open `SidePanel`
  - Variant filtering and text search
  - Quick stat summary metrics
  - Tree and Graph view tabs intact
  - Stable React keys (`rowKey={(n) => n.id}`) replacing raw `Math.random()`

---

### Table 2: MBOM (Manufacturing BOM) — SCHEDULED POST-EBOM
- **File Location**: [`app/(app)/mbom/page.tsx`](file:///D:/projects/BOM_synchronization-main/app/(app)/mbom/page.tsx) (lines 150–190)
- **Data Source**: `mbomOps` from `@/lib/mockData`.
- **Row Type**: `MbomOp` (`id`, `partNumber`, `plantId`, `line`, `station`, `operation`, `takeTimeSec`, `workInstructionId`, `status`).
- **Columns & Ordering**:
  1. Op ID (`id`, font-mono)
  2. Produces (`getPart(partNumber)?.name` + `partNumber`, navigation link to `/parts/${partNumber}`)
  3. Operation (`operation`)
  4. Plant (`plant?.name`)
  5. Line (`line`)
  6. Station (`station`)
  7. Takt (`takeTimeSec` + 's', right-aligned tabular-nums)
  8. Work Instr. (`workInstructionId`, font-mono)
  9. Status (`status` badge with `opStatusCls`)
- **Existing Filtering**: Plant filter dropdown (`plantId`), status filter dropdown (`status`), search query `q` (operation, partNumber, station).
- **Row Actions / Links**: Click on Produces cell navigates to `/parts/${partNumber}`.
- **Behavior to Preserve**: Clickable part link inside cell, plant and status dropdown filters, takt time tabular formatting.

---

### Table 3: Changes (ECN Management) — SCHEDULED POST-EBOM
- **File Location**: [`app/(app)/changes/page.tsx`](file:///D:/projects/BOM_synchronization-main/app/(app)/changes/page.tsx) (lines 103–139)
- **Data Source**: `ecns` from `@/lib/mockData`.
- **Row Type**: `ECN` (`id`, `title`, `state`, `priority`, `reason`, `affectedPNs`, `estCostImpactUsd`, `estVinsAffected`, `raisedAt`, `raisedBy`).
- **Columns & Ordering**:
  1. ECN (`id`, font-mono font-semibold)
  2. Title (`title`, font-medium)
  3. State (`state` badge with `stateCls`)
  4. Priority (`priority` badge with `prioCls`)
  5. Reason (`reason`, font-mono)
  6. Affected PNs (tags for first 2 PNs + `+N` badge)
  7. Cost/veh (`estCostImpactUsd`, signed right-aligned tabular-nums)
  8. VINs (`estVinsAffected`, right-aligned tabular-nums)
  9. Raised (`raisedAt` · `raisedBy`, font-mono)
- **Existing Filtering**: State dropdown, reason dropdown, search input `q`.
- **Row Actions / Links**: Entire row click navigates to `/changes/${e.id}`.
- **Behavior to Preserve**: Row click navigation, chip rendering for multiple affected PNs, signed currency impact.

---

### Table 4: Parts (Part Master) — SCHEDULED POST-EBOM
- **File Location**: [`app/(app)/parts/page.tsx`](file:///D:/projects/BOM_synchronization-main/app/(app)/parts/page.tsx) (lines 85–121)
- **Data Source**: `allParts` from `@/lib/mockData`.
- **Row Type**: `Part` (`partNumber`, `name`, `programId`, `type`, `revision`, `lifecycle`, `owner`, `supplierId`, `cost`, `leadTimeDays`).
- **Columns & Ordering**:
  1. Part Number (`partNumber`, font-mono font-semibold)
  2. Name (`name`, font-medium)
  3. Program (`prog?.name`)
  4. Type (`type`, font-mono)
  5. Rev (`revision`, font-mono)
  6. Lifecycle (`lifecycle` badge with `lcBadge`)
  7. Owner (`owner`)
  8. Supplier (`supplierId ?? "—"`)
  9. Cost (`cost`, right-aligned tabular-nums)
  10. Lead (`leadTimeDays` + 'd', right-aligned tabular-nums)
- **Existing Filtering**: Program dropdown, Type dropdown, Lifecycle dropdown, search query `q`.
- **Row Actions / Links**: Row click navigates to `/parts/${partNumber}`.
- **Behavior to Preserve**: Row navigation, 4 filter controls, right-aligned monetary and lead time columns.

---

### Table 5: Compare (EBOM vs MBOM Unmapped) — SCHEDULED POST-EBOM
- **File Location**: [`app/(app)/compare/page.tsx`](file:///D:/projects/BOM_synchronization-main/app/(app)/compare/page.tsx) (lines 161–189)
- **Data Source**: `ebomVsMbom.onlyEbom` (array of part numbers unmapped in MBOM).
- **Row Type**: Part number string `pn` mapped to `getPart(pn)`.
- **Columns & Ordering**:
  1. Part Number (`pn`, font-mono)
  2. Name (`p?.name`, font-medium)
  3. Type (`p?.type`, font-mono)
  4. Supplier (`p?.supplierId`, font-mono)
- **Existing Filtering**: Mode switch (`Variant A vs Variant B` vs `EBOM vs MBOM`).
- **Behavior to Preserve**: Conditional display only when mode is `ebom-mbom` and unmapped parts exist.

---

### Table 6: Suppliers (Supplier & Risk Intelligence) — SCHEDULED POST-EBOM
- **File Location**: [`app/(app)/suppliers/page.tsx`](file:///D:/projects/BOM_synchronization-main/app/(app)/suppliers/page.tsx) (lines 107–140)
- **Data Source**: `supplierRollup` derived from `suppliers` and `allParts`.
- **Row Type**: `Supplier & { partsCount: number; riskScore: number }`.
- **Columns & Ordering**:
  1. Supplier (`name`, font-medium)
  2. Country / Region (`country` · `region` with `MapPin` icon)
  3. Tier (`T${tier}` badge)
  4. Parts (`partsCount`, right-aligned tabular-nums)
  5. Single-source (`singleSource` badge or `—`)
  6. Financial (`financialRating` badge)
  7. Geo risk (`geoRisk` badge)
  8. On-time (`onTimePct` + '%', right-aligned tabular-nums)
  9. Defects PPM (`pPMDefects`, right-aligned tabular-nums)
  10. Risk (`riskScore`, right-aligned tabular-nums with dynamic risk tone)
- **Existing Filtering**: Search input `q` (name, country, region).
- **Behavior to Preserve**: Numeric risk coloring, on-time percentage formatting, single-source badge.

---

## 2. EBOM Migration Plan (Step 2)

### Target Component
[`app/(app)/ebom/page.tsx`](file:///D:/projects/BOM_synchronization-main/app/(app)/ebom/page.tsx)

### Scope
- Replace the raw manual `<table>` under `<TabsContent value="table">` with [`EnterpriseTable<EbomNode>`](file:///D:/projects/BOM_synchronization-main/src/components/ui/enterprise-table.tsx).
- Retain exact column order, widths, and styling:
  1. `health`: Custom dot indicator cell, sortable by health priority or unsortable.
  2. `partNumber`: Mono font, sortable by string.
  3. `name`: Font medium, sortable by name.
  4. `type`: Mono font, sortable by type.
  5. `revision`: Mono font, sortable by revision.
  6. `qty`: Right-aligned, sortable by number.
  7. `cost`: Right-aligned `$${cost.toLocaleString()}`, sortable by numeric cost.
  8. `supplier`: Mono font, sortable by supplier.
  9. `status`: Badge with `lcBadge(status)`, sortable by status.
- Set `rowKey={(row) => row.id}` (eliminates the buggy `Math.random()`).
- Set `onRowClick={(row) => setSelected(row)}`.
- Retain `filteredRows` calculation and search filter logic without modification.
- Retain `SidePanel`, Tree view, Graph view, Quick stats, and PageHeader.
- Empty state: `"No EBOM components match the active filter or variant."`

