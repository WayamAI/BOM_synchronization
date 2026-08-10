# Multi-Vehicle BOM Application — Design Spec
Date: 2026-05-06

## Overview

Expand the BOM management application from a single Meridian SUV program to a 4-program portfolio covering diverse vehicle categories. Add a program switcher, restructure mock data to cover all programs, redesign the Command Center to show active-program detail with a fleet summary strip, and trim parts from 121 (Meridian-only) to ~80 distributed across all programs.

---

## 1. Data Model

### Programs Array
A new top-level `programs: Program[]` array in `mockData.ts` holds all program data. Each program contains its own scoped arrays.

```ts
interface Program {
  id: string
  name: string
  codename: string
  modelYear: number
  stage: 'Concept' | 'Design' | 'Engineering' | 'Pre-Production' | 'SOP'
  category: 'SUV' | 'Sedan' | 'Truck' | 'EV Crossover'
  daysToSOP: number
  plannedAnnualVolume: number
  pilotVinsBuilt: number
  activeEcns: number
  openFieldEvents: number
  globalRevision: string
  lastUpdated: string
  healthScore: number
  systemHealth: SystemHealth[]       // per-program system health entries
  activityFeed: ActivityEntry[]      // per-program activity log
  aiBriefing: AIBriefingItem[]       // per-program AI briefing items
  changeVelocity: ChangeVelocityEntry[] // per-program 12-week ECN trend
  parts: Part[]
  bomEdges: BomEdge[]                // EBOM parent→child edges for this program
  variants: Variant[]
  ecns: ECN[]
  suppliers: Supplier[]
  fieldEvents: FieldEvent[]
  serviceKits: ServiceKit[]
  softwareComponents: SoftwareComponent[]
  plants: Plant[]
  mbomOps: MbomOp[]
}
```

### Part Identity Across Programs
Each `Part` object gains a `programId: string` field. When flat-mapping for backward-compatible exports the field is injected:
```ts
export const parts = programs.flatMap(p =>
  p.parts.map(part => ({ ...part, programId: p.id }))
)
```
This ensures the Program column in the Parts Master table always has data.

### Backward-Compatible Flat Exports
Existing flat array exports stay intact as derived values so no page breaks:
```ts
export const parts = programs.flatMap(p => p.parts.map(pt => ({ ...pt, programId: p.id })))
export const bomEdges = programs.flatMap(p => p.bomEdges)
export const ecns = programs.flatMap(p => p.ecns)
export const suppliers = programs.flatMap(p => p.suppliers)
// ... etc
```

### 4 Programs

| Program | ID | Category | Model Year | Stage | Parts |
|---|---|---|---|---|---|
| Meridian SUV | `meridian-suv` | SUV | 2026 | Pre-Production | ~30 |
| Atlas Sedan | `atlas-sedan` | Sedan | 2026 | Concept | ~20 |
| Titan Truck | `titan-truck` | Truck | 2027 | Design | ~18 |
| Nova EV | `nova-ev` | EV Crossover | 2027 | Engineering | ~15 |

**Total parts: ~83** (down from 121, diverse across categories)

### Part Number Schemes
- Meridian SUV: `MER-*` (existing, trimmed to key systems)
- Atlas Sedan: `ATL-*`
- Titan Truck: `TTN-*`
- Nova EV: `NOV-*`

### Parts Coverage Per Program

**Meridian SUV (~30 parts)** — Trimmed from 121, retains one representative part per sub-system:
- Powertrain (ICE 2.0T, Hybrid, EV motor, transmission, exhaust)
- Battery & HV (pack, modules, BMS, charger, DC-DC)
- Chassis (front/rear suspension, brakes, steering, wheels)
- Body (doors, liftgate, bumpers, lights, windshield, sunroof)
- Interior (HVAC, seats, airbags, dashboard)
- Electrical/ADAS (BMS ECU, TCU, IHU, BCM, radars, cameras, harnesses)

**Atlas Sedan (~20 parts)** — Compact ICE/EV sedan:
- Compact 1.5L ICE engine + CVT
- Sedan monocoque body, 4 doors, trunk lid
- Comfort HVAC, cloth/leather seats
- Basic ADAS (forward collision, lane assist)
- 12V electrical, infotainment head unit, instrument cluster
- Front/rear suspension (torsion beam rear), disc brakes

**Titan Truck (~18 parts)** — Body-on-frame pickup:
- 3.5L Diesel engine, 6-speed manual gearbox
- Ladder frame chassis, rear leaf springs
- Truck bed with bed liner, tow hitch assembly (5,000 kg rating)
- Heavy-duty front/rear disc brakes
- Off-road suspension lift kit (optional)
- 4WD transfer case, locking rear differential
- Basic infotainment, analog instrument cluster

**Nova EV (~15 parts)** — Pure EV, ADAS-heavy crossover:
- Dual motor all-wheel drive system
- 95 kWh lithium battery pack
- OTA manager ECU, telematics gateway
- LiDAR unit, 360-degree camera array (×8)
- DC fast-charge port (CCS2 + CHAdeMO)
- Active thermal management system
- Premium IHU with 15" touchscreen

---

## 2. Program Switcher

### Context
New file: `src/context/ProgramContext.tsx`

```tsx
interface ProgramContextValue {
  activeProgram: Program | null
  activeProgramId: string | null
  setActiveProgramId: (id: string | null) => void
}
```

- Default active program on load: `'meridian-suv'`
- Context wraps the app inside `AppShell.tsx`

### UI
- Dropdown added to `TopNav.tsx` (right side of nav bar)
- Shows program name + category badge + stage badge
- Option to clear (show "All Programs")

---

## 3. Command Center Redesign

### Fleet Summary Strip (top of dashboard)
4 cards displayed horizontally, one per program:
- Program name + category icon
- Stage badge
- Health score arc (mini)
- Days to SOP

Always visible regardless of active program selection.

### Active Program Header
When a program is selected (default: Meridian SUV):
- Program name, model year, stage badge
- KPIs: Days to SOP, Pilot VINs Built, Active ECNs

### KPI Row (6 tiles, sourced from active program)
Parts | Assemblies | Ops | Kits | Suppliers | Variants

### Kept Visualizations (scoped to active program)
- **Health Arc** — overall program health %
- **System Health Matrix** — 6 systems for that vehicle type
- **Change Velocity Chart** — 12-week ECN trend
- **Activity Feed** — program-scoped events
- **AI Briefing** — top issues for active program

### Replaced Visualizations
| Removed | Replaced With | Reason |
|---|---|---|
| CVE Heatmap | Program Stage Progress bar | Fleet-level signal; CVE detail lives in Software BOM |
| Sankey Flow | Parts by System donut | Simpler, per-program part distribution; Sankey was Meridian-specific |

---

## 4. Parts Master Restructuring

### New "Program" Filter
Added as a 4th filter (alongside Search, Type, Lifecycle):
- Dropdown: All Programs | Meridian SUV | Atlas Sedan | Titan Truck | Nova EV
- Default: pre-set to active program (from context) if one is set
- User can clear it to "All Programs"

### Table Column
"Program" column added to the parts table so users can identify which vehicle a part belongs to when viewing cross-program.

### Part Detail View
Unchanged — still shows Where-Used, Children, Software, ECNs, Revision History, Routing, Service Kits scoped to that specific part.

---

## 5. Redundant Data Removed

| Location | What Was Redundant | Resolution |
|---|---|---|
| Parts list | 121 parts, all Meridian SUV, many duplicated sub-assemblies | Trimmed to ~30, added 3 new programs |
| Command Center | CVE Heatmap duplicates Software BOM page | Replaced with Stage Progress bar |
| Command Center | Sankey Flow too complex for single-program view, no cross-program value | Replaced with Parts donut |
| Program header | Single hard-coded "Meridian SUV" badge | Now a dynamic program switcher |

---

## 6. Files Changed

| File | Change |
|---|---|
| `src/lib/mockData.ts` | Major expansion — add 3 new programs, restructure into `programs[]`, trim Meridian parts to ~30, add flat re-exports |
| `src/context/ProgramContext.tsx` | New file — program context + hook |
| `src/components/layout/AppShell.tsx` | Wrap with ProgramContext provider |
| `src/components/layout/TopNav.tsx` | Add program switcher dropdown |
| `src/pages/Dashboard.tsx` | Fleet summary strip, replace CVE heatmap + Sankey, scope KPIs/charts to active program |
| `src/pages/PartMaster.tsx` | Add Program filter, add Program column to table |

---

## 7. Out of Scope

- No backend changes (all mock data)
- EBOM, MBOM, Changes, Variants, Service, Software, Suppliers, FieldQuality pages are not restructured (they use flat re-exports and continue working)
- No routing changes
- No new pages added
