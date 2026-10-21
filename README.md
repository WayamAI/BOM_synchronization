# Wayam AI — BOM Synchronization

End-to-end BOM (Bill of Materials) synchronization for automotive programs — Engineering, Manufacturing, Service, and Software BOMs in one command center, by [Wayam AI](https://wayam.ai).

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/), [TanStack Query](https://tanstack.com/query), [@xyflow/react](https://reactflow.dev/)

## Getting started

```sh
git clone https://github.com/WayamAI/BOM_synchronization.git
cd BOM_synchronization
bun install    # or npm install
bun run dev    # or npm run dev
```

The app runs at `http://localhost:8080` (or the next free port).

## Login

The app sits behind a login screen. This is a **demo gate, not real
authentication** — there's no backend or user database. Any syntactically
valid email address and any non-empty password will sign you in (see
`src/lib/auth.ts`).

## Scripts

| Command | Description |
| --- | --- |
| `dev` | Start the Vite dev server |
| `build` | Production build |
| `preview` | Preview the production build locally |
| `lint` | Run ESLint |
| `test` | Run the test suite (Vitest) |

## Regenerating the entity icons

The 72 entity icons are cut from 6 source sheets (12 icons each, 4 columns by 3 rows, white background). To re-run:

```
pip install pillow numpy
python scripts/cut-icons.py
```

`scripts/icon-sheets.json` maps each sheet to its ordered ids (left to right, top to bottom):

| Sheet | Contents |
|---|---|
| `design/icons-sheet.jpg` | the original 12: part, assembly, variant, ebom, mbom, service-kit, fru, software, ecn, supplier, field-event, report |
| `design/icons-sheet-1.jpg` | systems, part types, places (system-*, system, vehicle, ecu, harness, plant, region) |
| `design/icons-sheet-2.jpg` | vehicle-* categories, stage-*, command-center, compare, notifications |
| `design/icons-sheet-3.jpg` | actions (add, link, sync, release, approve, reject, export, generate, schedule, scan, trace, manual) |
| `design/icons-sheet-4.jpg` | concepts and KPIs (ai, security, cve, validation, history, where-used, cost, watchlist, disruption, license, quality, trend) |
| `design/icons-sheet-5.jpg` | executive, compliance, not-found, scope, plus spares (person, department, lead-time, pinned, config-rule, market, volume, vin) |

`design/icons-sheet-6.jpg` holds 4 icons in one row: the chosen `system-battery` and `quality`, plus two unused alternates. An entry may declare `"count"` for a sheet that is not 12 icons, and `"candidates"` for ids that are cut only to `design/candidates/` (alternates and retired icons, for example `system-battery-old` and `quality-old` from sheets 1 and 4).

Output is two transparent PNGs per id: `public/icons/<id>.png` (144x144, page headers, cards, empty states) and `public/icons/sm/<id>.png` (96x96, 20 to 32px glyphs). The script exits with an error if a sheet does not yield exactly 12 icon-sized components or if an id repeats. Components far smaller than the median icon (such as a corner watermark) are ignored and reported. To add icons, generate a new 12-icon sheet, add it and its ids to `icon-sheets.json`, and re-run. The id to icon mapping lives in `src/components/icons/iconMap.ts`.
