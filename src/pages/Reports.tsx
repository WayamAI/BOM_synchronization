import { plural } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { EntityGlyph } from "@/components/icons/EntityIcon";

// One entity id per report type (ICON_AUDIT section 4.3).
const REPORT_MARK: Record<string, string> = {
  "Executive Program Pack": "executive",
  "EBOM Export": "ebom",
  "MBOM Routing Sheet": "mbom",
  "Service BOM / Spare Parts Catalog": "service-kit",
  "UNECE R155 / R156 Audit Pack": "compliance",
  "CycloneDX Software BOM Export": "software",
  "EU Battery Regulation · Digital Product Passport": "system-battery",
  "ECN Change Log": "ecn",
  "Supplier Risk Brief": "supplier",
  "Field Quality Trend Report": "trend",
  "PPAP / AS9102 Package": "quality",
  "Homologation Pack (FMVSS / UNECE)": "compliance",
};
import { totals, program } from "@/lib/mockData";

const reports = [
  {
    name: "Executive Program Pack",
    desc: "Single-page Meridian MY2026 status: health, ECNs, risk, days-to-SOP",
    format: "PDF",
    schedule: "Weekly",
    lastRun: "Apr 22, 2026",
    outputs: ["PDF", "PPTX"],
  },
  {
    name: "EBOM Export",
    desc: `Complete flattened EBOM · ${plural(totals.ebomParts, "part")} with quantities, suppliers, revs`,
    format: "CSV / JSON",
    schedule: "On demand",
    lastRun: "Apr 20, 2026",
    outputs: ["CSV", "JSON", "XML"],
  },
  {
    name: "MBOM Routing Sheet",
    desc: `Plant-wise work instructions · ${plural(totals.mbomOps, "op")} across ${plural(totals.plants, "plant")}`,
    format: "PDF / XML",
    schedule: "Per build",
    lastRun: "Apr 22, 2026",
    outputs: ["PDF", "XML (MES)"],
  },
  {
    name: "Service BOM / Spare Parts Catalog",
    desc: `${plural(totals.serviceKits, "kit")} · ${plural(totals.frus, "FRU")} for dealer network publication`,
    format: "PDF",
    schedule: "Monthly",
    lastRun: "Apr 1, 2026",
    outputs: ["PDF", "CSV"],
  },
  {
    name: "UNECE R155 / R156 Audit Pack",
    desc: "CSMS + SUMS evidence bundle for type-approval submission",
    format: "PDF",
    schedule: "On demand",
    lastRun: "Apr 12, 2026",
    outputs: ["PDF"],
  },
  {
    name: "CycloneDX Software BOM Export",
    desc: `All ECU firmware software packages · ${plural(totals.softwareComponents, "item")}`,
    format: "CycloneDX JSON",
    schedule: "Weekly",
    lastRun: "Apr 21, 2026",
    outputs: ["CycloneDX JSON", "SPDX"],
  },
  {
    name: "EU Battery Regulation · Digital Product Passport",
    desc: "Per-VIN battery passport in DPP-aligned JSON for EU compliance",
    format: "DPP JSON",
    schedule: "Per build",
    lastRun: "Apr 22, 2026",
    outputs: ["DPP JSON"],
  },
  {
    name: "ECN Change Log",
    desc: `Released and pending engineering changes · ${totals.activeEcns} active`,
    format: "CSV",
    schedule: "Weekly",
    lastRun: "Apr 22, 2026",
    outputs: ["CSV", "PDF"],
  },
  {
    name: "Supplier Risk Brief",
    desc: `Tier-1 / Tier-2 risk summary · ${totals.singleSource} single-source flags`,
    format: "PDF",
    schedule: "Bi-weekly",
    lastRun: "Apr 15, 2026",
    outputs: ["PDF", "CSV"],
  },
  {
    name: "Field Quality Trend Report",
    desc: "Warranty cluster, recall scoping and root cause across pilot VINs",
    format: "PDF",
    schedule: "Monthly",
    lastRun: "Apr 1, 2026",
    outputs: ["PDF"],
  },
  {
    name: "PPAP / AS9102 Package",
    desc: "Production Part Approval Process documents for new/changed parts",
    format: "PDF",
    schedule: "Per ECN release",
    lastRun: "Apr 18, 2026",
    outputs: ["PDF", "XLSX"],
  },
  {
    name: "Homologation Pack (FMVSS / UNECE)",
    desc: "Safety compliance evidence per regulated market",
    format: "PDF",
    schedule: "Per market launch",
    lastRun: "Mar 30, 2026",
    outputs: ["PDF"],
  },
];

const Reports = () => (
  <PageHeader
    title="Reports & Exports"
      mark="report"
    subtitle={`${reports.length} report types · regulatory, executive, operational and engineering deliverables for ${program.name} ${program.modelYear}`}
    actions={<Button size="sm" className="gap-1.5"><Calendar aria-hidden className="size-3.5" />Schedule report</Button>}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {reports.map(r => (
        <div key={r.name} className="rounded-lg border border-hairline bg-container p-4 hover:border-strong transition-colors duration-150 cursor-pointer group">
          <div className="flex items-start justify-between">
            <div className="grid size-11 place-items-center rounded-full bg-action transition-colors duration-150 group-hover:bg-raised-2">
              <EntityGlyph id={REPORT_MARK[r.name] ?? "report"} size={28} />
            </div>
            <span className="type-caption text-quaternary">{r.schedule}</span>
          </div>
          <h3 className="type-body-md mt-3 font-medium text-foreground">{r.name}</h3>
          <p className="type-body-sm mt-1 text-tertiary">{r.desc}</p>
          <p className="type-body-sm mt-3 text-quaternary">{r.outputs.join(" · ")}</p>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-hairline">
            <span className="type-body-sm text-tertiary">Last run · {r.lastRun}</span>
            <Button size="sm" variant="ghost" className="h-7 gap-1.5 type-label-sm"><Download aria-hidden className="size-3.5" />Generate</Button>
          </div>
        </div>
      ))}
    </div>
  </PageHeader>
);

export default Reports;
