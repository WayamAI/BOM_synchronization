import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText } from "lucide-react";
import { totals, program } from "@/lib/mockData";

const reports = [
  {
    name: "Executive Program Pack",
    desc: "Single-page Meridian MY2026 status — health, ECNs, risk, days-to-SOP",
    format: "PDF",
    schedule: "Weekly",
    lastRun: "Apr 22, 2026",
    outputs: ["PDF", "PPTX"],
  },
  {
    name: "EBOM Export",
    desc: `Complete flattened EBOM · ${totals.ebomParts} parts with quantities, suppliers, revs`,
    format: "CSV / JSON",
    schedule: "On demand",
    lastRun: "Apr 20, 2026",
    outputs: ["CSV", "JSON", "XML"],
  },
  {
    name: "MBOM Routing Sheet",
    desc: `Plant-wise work instructions · ${totals.mbomOps} ops across ${totals.plants} plants`,
    format: "PDF / XML",
    schedule: "Per build",
    lastRun: "Apr 22, 2026",
    outputs: ["PDF", "XML (MES)"],
  },
  {
    name: "Service BOM / Spare Parts Catalog",
    desc: `${totals.serviceKits} kits · ${totals.frus} FRUs for dealer network publication`,
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
    desc: `All ECU firmware software packages · ${totals.softwareComponents} items`,
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
    subtitle={`${reports.length} report types · regulatory, executive, operational and engineering deliverables for ${program.name} ${program.modelYear}`}
    actions={<Button size="sm" className="gap-1.5 bg-gradient-primary border-0"><Calendar className="h-3.5 w-3.5" />Schedule Report</Button>}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map(r => (
        <div key={r.name} className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-elevated hover:border-primary/40 transition-all cursor-pointer group">
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-lg bg-gradient-accent grid place-items-center group-hover:shadow-glow transition-shadow">
              <FileText className="h-5 w-5 text-accent-foreground" />
            </div>
            <Badge variant="outline" className="text-[10px]">{r.schedule}</Badge>
          </div>
          <h3 className="text-sm font-semibold mt-3">{r.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
          <div className="flex flex-wrap gap-1 mt-3">
            {r.outputs.map(o => <Badge key={o} variant="secondary" className="text-[10px] font-mono">{o}</Badge>)}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <span className="text-[11px] text-muted-foreground">Last run · {r.lastRun}</span>
            <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs"><Download className="h-3 w-3" />Generate</Button>
          </div>
        </div>
      ))}
    </div>
  </PageHeader>
);

export default Reports;
