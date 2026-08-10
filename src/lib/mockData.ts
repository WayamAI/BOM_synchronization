// =============================================================================
// Multi-Vehicle BOM Mock Data — 4 Programs
// =============================================================================

export type Health = "healthy" | "warning" | "critical";
export type Lifecycle = "In Work" | "In Review" | "Released" | "Obsolete";
export type PartType =
  | "Vehicle" | "System" | "Assembly" | "Sub-Assembly" | "Part"
  | "ECU" | "Harness" | "Fastener" | "Consumable" | "Software";

export type Part = {
  partNumber: string;
  name: string;
  type: PartType;
  revision: string;
  lifecycle: Lifecycle;
  owner: string;
  supplierId?: string;
  cost: number;
  leadTimeDays: number;
  uom: string;
  health: Health;
  cves?: number;
  warnings?: number;
  serviceable?: boolean;
  fru?: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  programId: string;
};

export type BomEdge = {
  parentPN: string;
  childPN: string;
  qty: number;
  refDes?: string;
  findNumber?: number;
  effectivity?: string[];
};

export type Supplier = {
  id: string;
  name: string;
  country: string;
  region: "North America" | "Europe" | "East Asia" | "South Asia" | "Other";
  tier: 1 | 2 | 3;
  financialRating: "A+" | "A" | "B+" | "B" | "C";
  geoRisk: "Low" | "Med" | "High";
  onTimePct: number;
  pPMDefects: number;
  singleSource: boolean;
  certifications: string[];
};

export type Plant = {
  id: string;
  name: string;
  country: string;
  lines: string[];
  capacityPerDay: number;
};

export type MbomOp = {
  id: string;
  partNumber: string;
  plantId: string;
  line: string;
  station: string;
  operation: string;
  takeTimeSec: number;
  toolingRef?: string;
  workInstructionId?: string;
  status: "ready" | "pending" | "warning" | "blocked";
};

export type Variant = {
  code: string;
  name: string;
  powertrain: string;
  trim: "Base" | "Premium" | "Signature";
  market: string;
  startEffectivity: string;
  endEffectivity?: string;
  unitsPlanned: number;
  includesPNs: string[];
  excludesPNs?: string[];
  conflicts: number;
};

export type ServiceKit = {
  id: string;
  name: string;
  category: "Routine" | "Wear" | "Repair" | "Major" | "Recall";
  intervalKm?: number;
  intervalMonths?: number;
  laborHours: number;
  price: number;
  items: { partNumber: string; qty: number }[];
};

export type SoftwareComponent = {
  id: string;
  name: string;
  version: string;
  license: string;
  supplier: string;
  runsOnECU: string;
  critical: boolean;
  cves: { id: string; severity: "Critical" | "High" | "Medium" | "Low"; published: string; fixedIn?: string }[];
};

export type ECN = {
  id: string;
  title: string;
  state: "Draft" | "In Review" | "Approved" | "Released" | "Rejected" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Critical";
  raisedBy: string;
  raisedAt: string;
  approver?: string;
  targetRev?: string;
  affectedPNs: string[];
  affectedVariants: string[];
  reason: "Quality" | "Cost" | "Supplier" | "Regulatory" | "Cyber" | "Field" | "Engineering";
  estCostImpactUsd: number;
  estVinsAffected: number;
  description: string;
  timeline: { at: string; by: string; role?: string; department?: string; event: string; description?: string }[];
};

export type RevisionLogEntry = {
  partNumber: string;
  revision: string;
  date: string;
  by: string;
  ecnId?: string;
  note: string;
};

export type FieldEvent = {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  partNumber?: string;
  vinsAffected: number;
  ageHours: number;
  variant: string;
  reportedBy: string;
  status: "Open" | "Investigating" | "Contained" | "Resolved";
};

export type ComplianceFramework = {
  id: string;
  name: string;
  scope: string;
  score: number;
  status: "compliant" | "warning" | "critical";
  controls: number;
  passing: number;
  nextAuditDate: string;
};

export type ActivityEntry = { id: number; type: string; text: string; user: string; time: string };
export type AIBriefingItem = { priority: number; text: string; impact: string };
export type ChangeVelocityEntry = { week: string; proposed: number; approved: number; rejected: number; cycle: number };

export type VehicleProgram = {
  id: string;
  name: string;
  codename: string;
  modelYear: string;
  stage: "Concept" | "Design" | "Engineering" | "Pre-Production" | "SOP" | "In-Production";
  category: "SUV" | "Sedan" | "Truck" | "EV Crossover";
  daysToSOP: number;
  plannedAnnualVolume: number;
  pilotVinsBuilt: number;
  activeEcns: number;
  openFieldEvents: number;
  globalRevision: string;
  lastUpdated: string;
  healthScore: number;
  activityFeed: ActivityEntry[];
  aiBriefing: AIBriefingItem[];
  changeVelocity: ChangeVelocityEntry[];
  parts: Part[];
  bomEdges: BomEdge[];
  variants: Variant[];
  ecns: ECN[];
  fieldEvents: FieldEvent[];
  serviceKits: ServiceKit[];
  softwareComponents: SoftwareComponent[];
  plants: Plant[];
  mbomOps: MbomOp[];
};

// ─────────────────────────── SHARED SUPPLIERS ────────────────────────────────

export const suppliers: Supplier[] = [
  { id: "SUP-BOSCH",   name: "Bosch Mobility",       country: "Germany",     region: "Europe",        tier: 1, financialRating: "A+", geoRisk: "Low", onTimePct: 98, pPMDefects: 12, singleSource: false, certifications: ["IATF 16949","ISO 9001"] },
  { id: "SUP-CONTI",   name: "Continental AG",        country: "Germany",     region: "Europe",        tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 96, pPMDefects: 18, singleSource: false, certifications: ["IATF 16949"] },
  { id: "SUP-LGES",    name: "LG Energy Solution",    country: "South Korea", region: "East Asia",     tier: 1, financialRating: "A",  geoRisk: "Med", onTimePct: 94, pPMDefects: 22, singleSource: true,  certifications: ["IATF 16949","UL 2580"] },
  { id: "SUP-NIDEC",   name: "Nidec Corporation",     country: "Japan",       region: "East Asia",     tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 97, pPMDefects: 15, singleSource: true,  certifications: ["IATF 16949"] },
  { id: "SUP-HARMAN",  name: "Harman International",  country: "USA",         region: "North America", tier: 1, financialRating: "B+", geoRisk: "Low", onTimePct: 92, pPMDefects: 41, singleSource: true,  certifications: ["IATF 16949"] },
  { id: "SUP-MAGNA",   name: "Magna International",   country: "Canada",      region: "North America", tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 95, pPMDefects: 20, singleSource: false, certifications: ["IATF 16949"] },
  { id: "SUP-BREMBO",  name: "Brembo S.p.A.",         country: "Italy",       region: "Europe",        tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 97, pPMDefects: 11, singleSource: false, certifications: ["IATF 16949"] },
  { id: "SUP-TATA",    name: "Tata Motors Captive",   country: "India",       region: "South Asia",    tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 93, pPMDefects: 28, singleSource: true,  certifications: ["IATF 16949"] },
  { id: "SUP-ZF",      name: "ZF Friedrichshafen",    country: "Germany",     region: "Europe",        tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 96, pPMDefects: 16, singleSource: false, certifications: ["IATF 16949"] },
  { id: "SUP-VALEO",   name: "Valeo S.E.",             country: "France",      region: "Europe",        tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 95, pPMDefects: 19, singleSource: false, certifications: ["IATF 16949"] },
  { id: "SUP-DENSO",   name: "Denso Corporation",      country: "Japan",       region: "East Asia",     tier: 1, financialRating: "A+", geoRisk: "Low", onTimePct: 98, pPMDefects: 9,  singleSource: false, certifications: ["IATF 16949"] },
  { id: "SUP-ADIENT",  name: "Adient plc",             country: "Ireland",     region: "Europe",        tier: 1, financialRating: "B+", geoRisk: "Low", onTimePct: 91, pPMDefects: 32, singleSource: false, certifications: ["IATF 16949"] },
  { id: "SUP-AUTOLIV", name: "Autoliv Inc.",           country: "Sweden",      region: "Europe",        tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 96, pPMDefects: 14, singleSource: true,  certifications: ["IATF 16949"] },
  { id: "SUP-APTIV",   name: "Aptiv PLC",              country: "Ireland",     region: "Europe",        tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 95, pPMDefects: 18, singleSource: false, certifications: ["IATF 16949"] },
  { id: "SUP-NVIDIA",  name: "NVIDIA (DRIVE)",         country: "USA",         region: "North America", tier: 1, financialRating: "A+", geoRisk: "Low", onTimePct: 97, pPMDefects: 8,  singleSource: true,  certifications: ["ASPICE L2"] },
  { id: "SUP-VISTEON", name: "Visteon Corporation",    country: "USA",         region: "North America", tier: 1, financialRating: "B+", geoRisk: "Low", onTimePct: 93, pPMDefects: 27, singleSource: true,  certifications: ["IATF 16949"] },
  { id: "SUP-PCBCO",   name: "Anonymous PCB Co.",      country: "Taiwan",      region: "East Asia",     tier: 2, financialRating: "B",  geoRisk: "High",onTimePct: 81, pPMDefects: 92, singleSource: true,  certifications: ["ISO 9001"] },
  { id: "SUP-CUMMINS", name: "Cummins Inc.",           country: "USA",         region: "North America", tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 96, pPMDefects: 14, singleSource: false, certifications: ["IATF 16949"] },
  { id: "SUP-AISIN",   name: "Aisin Corporation",      country: "Japan",       region: "East Asia",     tier: 1, financialRating: "A",  geoRisk: "Low", onTimePct: 97, pPMDefects: 11, singleSource: false, certifications: ["IATF 16949"] },
  { id: "SUP-LUMINAR", name: "Luminar Technologies",   country: "USA",         region: "North America", tier: 1, financialRating: "B+", geoRisk: "Low", onTimePct: 90, pPMDefects: 35, singleSource: true,  certifications: ["ISO 9001"] },
];

// ─────────────────────────── SHARED PLANTS ───────────────────────────────────

const merPlants: Plant[] = [
  { id: "PLT-PUN", name: "Pune Plant",    country: "India", lines: ["Line 1 · ICE","Line 2 · Hybrid","Line 3 · EV"], capacityPerDay: 240 },
  { id: "PLT-DET", name: "Detroit Plant", country: "USA",   lines: ["Line 1 · ICE/Hybrid","Line 2 · EV"],            capacityPerDay: 180 },
];
const atlPlants: Plant[] = [
  { id: "PLT-CHN", name: "Chengdu Plant", country: "China", lines: ["Line 1 · ICE","Line 2 · EV"], capacityPerDay: 320 },
];
const ttnPlants: Plant[] = [
  { id: "PLT-SAN", name: "San Antonio Plant", country: "USA",    lines: ["Line 1 · Diesel","Line 2 · Petrol"], capacityPerDay: 150 },
  { id: "PLT-QUE", name: "Querétaro Plant",   country: "Mexico", lines: ["Line 1 · Diesel"],                   capacityPerDay: 120 },
];
const novPlants: Plant[] = [
  { id: "PLT-FRE", name: "Fremont Plant", country: "USA",   lines: ["Line 1 · EV"], capacityPerDay: 200 },
  { id: "PLT-GIG", name: "Giga Berlin",   country: "Germany",lines: ["Line 1 · EV"], capacityPerDay: 250 },
];

// ============================================================================
// PROGRAM 1 — MERIDIAN SUV (MY2026, Pre-Production)
// ============================================================================

const p = (programId: string, partNumber: string, name: string, type: PartType, opts: Partial<Omit<Part,"partNumber"|"name"|"type"|"programId">> = {}): Part => ({
  revision: "A", lifecycle: "Released", owner: "Vehicle Eng.",
  cost: 0, leadTimeDays: 0, uom: "each", health: "healthy",
  createdAt: "2024-06-01", updatedAt: "2026-04-18",
  partNumber, name, type, programId, ...opts,
});

const merParts: Part[] = [
  p("meridian-suv","MER-VEH-0001","Meridian SUV MY2026","Vehicle",        { revision:"2.4", owner:"Program Mgmt",    cost:52000, description:"5-seat D-segment SUV · multi-powertrain" }),
  p("meridian-suv","PWT-SYS-0001","Powertrain System",  "System",         { owner:"Powertrain WG",  cost:18000 }),
  p("meridian-suv","BAT-SYS-0001","HV Battery & Charging System","System",{ owner:"Battery WG",     cost:14000, health:"warning" }),
  p("meridian-suv","CHS-SYS-0001","Chassis & Suspension System", "System",{ owner:"Chassis WG",     cost:5200  }),
  p("meridian-suv","BDY-SYS-0001","Body, Closures & Exterior",   "System",{ owner:"Body WG",        cost:4800, health:"warning" }),
  p("meridian-suv","INT-SYS-0001","Interior, Seats & HVAC",      "System",{ owner:"Interior WG",    cost:3600  }),
  p("meridian-suv","ELE-SYS-0001","Electrical, ADAS & Infotainment","System",{ owner:"E/E WG",      cost:5100, health:"critical" }),
  // Powertrain
  p("meridian-suv","PWT-ENG-2001","ICE 2.0L Turbo Engine Assy",  "Assembly",    { revision:"C", owner:"Powertrain WG", supplierId:"SUP-TATA",  cost:4200, leadTimeDays:35 }),
  p("meridian-suv","PWT-HYB-3001","Hybrid e-Drive 1.5 Assy",     "Assembly",    { revision:"B", lifecycle:"In Review", owner:"Powertrain WG", supplierId:"SUP-BOSCH", cost:6800, leadTimeDays:42, health:"warning", warnings:2 }),
  p("meridian-suv","PWT-EVM-5001","EV Front Drive Motor Assy",   "Assembly",    { revision:"A", owner:"e-Motor Eng.", supplierId:"SUP-NIDEC", cost:3200, leadTimeDays:35 }),
  p("meridian-suv","PWT-TRN-4001","8-speed Automatic Transmission","Assembly",  { revision:"B", owner:"Transmission Eng.", supplierId:"SUP-ZF", cost:3400, leadTimeDays:42 }),
  // Battery & HV
  p("meridian-suv","BAT-PCK-8500","HV Battery Pack 85 kWh",      "Assembly",    { revision:"D", owner:"Battery WG", supplierId:"SUP-LGES", cost:11800, leadTimeDays:56, health:"warning", warnings:1, description:"NMC 96-cell liquid-cooled" }),
  p("meridian-suv","BAT-BMS-1140","Battery Management System",   "ECU",         { revision:"fw 4.2.1", lifecycle:"In Review", owner:"E/E WG", supplierId:"SUP-CONTI", cost:420, leadTimeDays:35, health:"critical", cves:2, fru:true }),
  p("meridian-suv","BAT-OBC-1301","On-Board Charger 11 kW",      "Assembly",    { revision:"A", owner:"Power Elec.", supplierId:"SUP-CONTI", cost:720, leadTimeDays:35 }),
  // Chassis
  p("meridian-suv","CHS-SUS-1010","Front MacPherson Strut Assy", "Assembly",    { revision:"A", owner:"Chassis WG", supplierId:"SUP-ZF",    cost:420, leadTimeDays:21, serviceable:true, fru:true }),
  p("meridian-suv","CHS-SUS-2010","Rear Multi-Link Assy",        "Assembly",    { revision:"A", owner:"Chassis WG", supplierId:"SUP-ZF",    cost:540, leadTimeDays:21, serviceable:true, fru:true }),
  p("meridian-suv","CHS-BRK-3001","Front Brake Caliper",         "Assembly",    { revision:"B", owner:"Brakes Eng.", supplierId:"SUP-BREMBO",cost:210, leadTimeDays:21, serviceable:true, fru:true }),
  p("meridian-suv","CHS-BRK-3005","Front Brake Pad Set",         "Part",        { revision:"A", owner:"Brakes Eng.", supplierId:"SUP-BREMBO",cost:48,  leadTimeDays:7,  serviceable:true, fru:true }),
  // Body
  p("meridian-suv","BDY-LFT-7700","Power Liftgate Assy",         "Assembly",    { revision:"C", lifecycle:"In Review", owner:"Body WG", supplierId:"SUP-MAGNA", cost:680, leadTimeDays:28, health:"warning", warnings:1, fru:true }),
  p("meridian-suv","BDY-LFT-7701","Liftgate Actuator",           "Part",        { revision:"C", owner:"Body WG", supplierId:"SUP-MAGNA", cost:180, leadTimeDays:21, serviceable:true, fru:true, health:"warning", warnings:1 }),
  p("meridian-suv","BDY-GLS-0101","Windshield (acoustic laminated)","Part",     { revision:"A", owner:"Glazing",   supplierId:"SUP-VALEO", cost:340, leadTimeDays:21, serviceable:true, fru:true }),
  p("meridian-suv","BDY-HDL-0401","Headlight LED Projector L",   "Assembly",    { revision:"B", owner:"Lighting",  supplierId:"SUP-VALEO", cost:380, leadTimeDays:28, serviceable:true, fru:true }),
  // Interior
  p("meridian-suv","INT-HVC-6600","HVAC Climate Unit",           "Assembly",    { revision:"B", owner:"HVAC Eng.", supplierId:"SUP-DENSO", cost:540, leadTimeDays:28, fru:true }),
  p("meridian-suv","INT-SEA-1101","Front Seat L (power, heated)","Assembly",    { revision:"A", owner:"Seats",    supplierId:"SUP-ADIENT", cost:620, leadTimeDays:35, fru:true }),
  p("meridian-suv","INT-ABG-2004","Driver Airbag",               "Assembly",    { revision:"A", owner:"Safety Eng.", supplierId:"SUP-AUTOLIV", cost:180, leadTimeDays:28, fru:true }),
  // Electrical & ADAS
  p("meridian-suv","ELE-ADAS-9001","ADAS Domain Controller",     "ECU",         { revision:"fw 6.1.0", owner:"E/E WG", supplierId:"SUP-NVIDIA", cost:1200, leadTimeDays:42, health:"warning", cves:1, fru:true }),
  p("meridian-suv","ELE-IHU-4400","Infotainment Head Unit",      "ECU",         { revision:"fw 12.4.2", lifecycle:"In Review", owner:"E/E WG", supplierId:"SUP-HARMAN", cost:680, leadTimeDays:35, health:"critical", cves:3, fru:true }),
  p("meridian-suv","ELE-TCU-2210","Telematics Control Unit",     "ECU",         { revision:"fw 3.7.0", owner:"E/E WG", supplierId:"SUP-HARMAN", cost:320, leadTimeDays:28, health:"warning", cves:1, fru:true }),
  p("meridian-suv","ELE-BCM-5001","Body Control Module",         "ECU",         { revision:"fw 5.1.0", owner:"E/E WG", supplierId:"SUP-MAGNA",  cost:220, leadTimeDays:28, fru:true }),
  p("meridian-suv","ELE-RAD-7001","Front Radar (77 GHz)",        "Assembly",    { revision:"A", owner:"ADAS", supplierId:"SUP-CONTI", cost:340, leadTimeDays:28, fru:true }),
  p("meridian-suv","ELE-HRN-9001","Main Vehicle Wiring Harness", "Harness",     { revision:"B", owner:"E/E WG", supplierId:"SUP-APTIV", cost:540, leadTimeDays:35 }),
];

const merEdges: BomEdge[] = [
  { parentPN:"MER-VEH-0001", childPN:"PWT-SYS-0001", qty:1 },
  { parentPN:"MER-VEH-0001", childPN:"BAT-SYS-0001", qty:1, effectivity:["MER-HYB15-PREM-EU","MER-HYB15-SIG-UK","MER-EV85-BASE-IN","MER-EV85-PREM-NA","MER-EV85-SIG-GCC"] },
  { parentPN:"MER-VEH-0001", childPN:"CHS-SYS-0001", qty:1 },
  { parentPN:"MER-VEH-0001", childPN:"BDY-SYS-0001", qty:1 },
  { parentPN:"MER-VEH-0001", childPN:"INT-SYS-0001", qty:1 },
  { parentPN:"MER-VEH-0001", childPN:"ELE-SYS-0001", qty:1 },
  { parentPN:"PWT-SYS-0001", childPN:"PWT-ENG-2001", qty:1, effectivity:["MER-PT20-BASE-NA","MER-PT20-PREM-EU"] },
  { parentPN:"PWT-SYS-0001", childPN:"PWT-HYB-3001", qty:1, effectivity:["MER-HYB15-PREM-EU","MER-HYB15-SIG-UK"] },
  { parentPN:"PWT-SYS-0001", childPN:"PWT-EVM-5001", qty:1, effectivity:["MER-EV85-BASE-IN","MER-EV85-PREM-NA","MER-EV85-SIG-GCC"] },
  { parentPN:"PWT-SYS-0001", childPN:"PWT-TRN-4001", qty:1, effectivity:["MER-PT20-BASE-NA","MER-PT20-PREM-EU"] },
  { parentPN:"BAT-SYS-0001", childPN:"BAT-PCK-8500", qty:1 },
  { parentPN:"BAT-SYS-0001", childPN:"BAT-OBC-1301", qty:1 },
  { parentPN:"BAT-PCK-8500", childPN:"BAT-BMS-1140", qty:1 },
  { parentPN:"CHS-SYS-0001", childPN:"CHS-SUS-1010", qty:2, refDes:"FL/FR" },
  { parentPN:"CHS-SYS-0001", childPN:"CHS-SUS-2010", qty:2, refDes:"RL/RR" },
  { parentPN:"CHS-SYS-0001", childPN:"CHS-BRK-3001", qty:2 },
  { parentPN:"CHS-BRK-3001", childPN:"CHS-BRK-3005", qty:1 },
  { parentPN:"BDY-SYS-0001", childPN:"BDY-LFT-7700", qty:1 },
  { parentPN:"BDY-SYS-0001", childPN:"BDY-GLS-0101", qty:1 },
  { parentPN:"BDY-SYS-0001", childPN:"BDY-HDL-0401", qty:1 },
  { parentPN:"BDY-LFT-7700", childPN:"BDY-LFT-7701", qty:2 },
  { parentPN:"INT-SYS-0001", childPN:"INT-HVC-6600", qty:1 },
  { parentPN:"INT-SYS-0001", childPN:"INT-SEA-1101", qty:1 },
  { parentPN:"INT-SYS-0001", childPN:"INT-ABG-2004", qty:1 },
  { parentPN:"ELE-SYS-0001", childPN:"ELE-ADAS-9001",qty:1 },
  { parentPN:"ELE-SYS-0001", childPN:"ELE-IHU-4400", qty:1 },
  { parentPN:"ELE-SYS-0001", childPN:"ELE-TCU-2210", qty:1 },
  { parentPN:"ELE-SYS-0001", childPN:"ELE-BCM-5001", qty:1 },
  { parentPN:"ELE-SYS-0001", childPN:"ELE-RAD-7001", qty:1 },
  { parentPN:"ELE-SYS-0001", childPN:"ELE-HRN-9001", qty:1 },
];

const merVariants: Variant[] = [
  { code:"MER-PT20-BASE-NA",  name:"Meridian 2.0T Base (NA)",       powertrain:"Petrol 2.0T",  trim:"Base",      market:"North America",  startEffectivity:"2026-07-15", unitsPlanned:8400,  conflicts:0, includesPNs:[], excludesPNs:[] },
  { code:"MER-PT20-PREM-EU",  name:"Meridian 2.0T Premium (EU)",    powertrain:"Petrol 2.0T",  trim:"Premium",   market:"European Union", startEffectivity:"2026-07-29", unitsPlanned:5200,  conflicts:1, includesPNs:[], excludesPNs:[] },
  { code:"MER-HYB15-PREM-EU", name:"Meridian Hybrid Premium (EU)",  powertrain:"Hybrid 1.5",   trim:"Premium",   market:"European Union", startEffectivity:"2026-08-12", unitsPlanned:7600,  conflicts:0, includesPNs:[], excludesPNs:[] },
  { code:"MER-HYB15-SIG-UK",  name:"Meridian Hybrid Signature (UK)",powertrain:"Hybrid 1.5",   trim:"Signature", market:"United Kingdom", startEffectivity:"2026-08-26", unitsPlanned:3800,  conflicts:0, includesPNs:[], excludesPNs:[] },
  { code:"MER-EV85-BASE-IN",  name:"Meridian EV 85 Base (India)",   powertrain:"EV 85 kWh",    trim:"Base",      market:"India",          startEffectivity:"2026-09-09", unitsPlanned:6200,  conflicts:0, includesPNs:[], excludesPNs:[] },
  { code:"MER-EV85-PREM-NA",  name:"Meridian EV 85 Premium (NA)",   powertrain:"EV 85 kWh",    trim:"Premium",   market:"North America",  startEffectivity:"2026-09-23", unitsPlanned:9400,  conflicts:1, includesPNs:[], excludesPNs:[] },
  { code:"MER-EV85-SIG-GCC",  name:"Meridian EV 85 Signature (GCC)",powertrain:"EV 85 kWh",    trim:"Signature", market:"GCC",            startEffectivity:"2026-10-07", unitsPlanned:7400,  conflicts:0, includesPNs:[], excludesPNs:[] },
];

const merEcns: ECN[] = [
  { id:"ECN-2241", title:"Battery cell tab geometry update (EV)", state:"In Review", priority:"High", raisedBy:"Priya Sharma", raisedAt:"2026-04-10", approver:"Anika Mehta", targetRev:"E", affectedPNs:["BAT-PCK-8500"], affectedVariants:["MER-EV85-BASE-IN","MER-EV85-PREM-NA","MER-EV85-SIG-GCC"], reason:"Quality", estCostImpactUsd:12, estVinsAffected:0, description:"Cell tab weld geometry revised to reduce micro-crack risk.",
    timeline:[{ at:"2026-04-10", by:"Priya Sharma", role:"Battery Cell Engineer", event:"ECN raised", description:"Electrical resistance drift exceeded 2% on cell tabs after 500h aging." },{ at:"2026-04-22", by:"Anika Mehta", role:"Director · Platform Engineering", event:"Awaiting CCB approval" }] },
  { id:"ECN-2242", title:"Power liftgate actuator reinforcement", state:"Approved", priority:"Critical", raisedBy:"Rohan Deshpande", raisedAt:"2026-04-05", approver:"Ravi Kumar", targetRev:"D", affectedPNs:["BDY-LFT-7701","BDY-LFT-7700"], affectedVariants:["MER-PT20-PREM-EU","MER-HYB15-PREM-EU","MER-HYB15-SIG-UK"], reason:"Field", estCostImpactUsd:18, estVinsAffected:14, description:"14 pilot VINs showed actuator binding under sub-zero conditions.",
    timeline:[{ at:"2026-04-05", by:"Rohan Deshpande", role:"Field Quality Lead", event:"ECN raised from warranty cluster" },{ at:"2026-04-15", by:"Ravi Kumar", role:"Program Manager", event:"Approved" }] },
  { id:"ECN-2244", title:"Infotainment log4j CVE remediation (OTA)", state:"Approved", priority:"Critical", raisedBy:"Meera Krishnan", raisedAt:"2026-04-17", approver:"Ravi Kumar", affectedPNs:["ELE-IHU-4400"], affectedVariants:[], reason:"Cyber", estCostImpactUsd:0, estVinsAffected:3420, description:"Log4Shell (CVE-2021-44228) on Infotainment IHU. OTA campaign authorised.",
    timeline:[{ at:"2026-04-17", by:"Meera Krishnan", role:"Product Security Analyst", event:"ECN raised after SBOM scan" },{ at:"2026-04-21", by:"Ravi Kumar", role:"Program Manager", event:"Approved for OTA" }] },
  { id:"ECN-2245", title:"BMS firmware v4.2.3 release", state:"In Review", priority:"High", raisedBy:"Arjun Pillai", raisedAt:"2026-04-14", affectedPNs:["BAT-BMS-1140"], affectedVariants:["MER-EV85-BASE-IN","MER-EV85-PREM-NA","MER-EV85-SIG-GCC"], reason:"Cyber", estCostImpactUsd:0, estVinsAffected:0, description:"Fixes CVE-2024-31000 and CVE-2024-31001 in BMS CAN stack.",
    timeline:[{ at:"2026-04-14", by:"Arjun Pillai", role:"Firmware Engineer", event:"ECN raised" }] },
  { id:"ECN-2248", title:"Hybrid e-Drive bracket rev D", state:"In Review", priority:"Medium", raisedBy:"Vikram Shah", raisedAt:"2026-04-16", affectedPNs:["PWT-HYB-3001"], affectedVariants:["MER-HYB15-PREM-EU","MER-HYB15-SIG-UK"], reason:"Engineering", estCostImpactUsd:5, estVinsAffected:0, description:"Bracket geometry revised after Pune ST-12 line over-takt event.",
    timeline:[{ at:"2026-04-16", by:"Vikram Shah", role:"Manufacturing Engineer", event:"ECN raised" }] },
];

const merFieldEvents: FieldEvent[] = [
  { id:"FLD-0412", severity:"high",     title:"Warranty cluster · Power liftgate actuator",   partNumber:"BDY-LFT-7701", vinsAffected:14,   ageHours:2,  variant:"Premium / Signature", reportedBy:"Dealer network", status:"Investigating" },
  { id:"FLD-0411", severity:"critical", title:"Critical CVE · Infotainment IHU",               partNumber:"ELE-IHU-4400", vinsAffected:3420, ageHours:6,  variant:"All trims",           reportedBy:"Cyber WG",        status:"Contained" },
  { id:"FLD-0408", severity:"high",     title:"BMS thermal warning · cold-start regen",        partNumber:"BAT-BMS-1140", vinsAffected:96,   ageHours:72, variant:"EV India market",     reportedBy:"Telematics",      status:"Investigating" },
  { id:"FLD-0409", severity:"low",      title:"Cabin rattle reports · B-pillar trim",                                     vinsAffected:22,   ageHours:48, variant:"Base trim",           reportedBy:"Dealer network",  status:"Open" },
];

const merServiceKits: ServiceKit[] = [
  { id:"SVC-10K",  name:"10,000 km Routine Service",         category:"Routine", intervalKm:10000,  intervalMonths:12, laborHours:1.5, price:220,  items:[{partNumber:"INT-HVC-6600",qty:0},{partNumber:"CHS-BRK-3005",qty:0}] },
  { id:"SVC-BRK-F",name:"Front Brake Service (pads)",        category:"Wear",                                          laborHours:2.0, price:340,  items:[{partNumber:"CHS-BRK-3005",qty:1}] },
  { id:"SVC-LFT",  name:"Power Liftgate Recall (ECN-2242)",  category:"Recall",                                        laborHours:1.5, price:0,    items:[{partNumber:"BDY-LFT-7701",qty:2}] },
  { id:"SVC-HVP",  name:"HV Pack Major Service (EV)",        category:"Major",   intervalKm:80000,  intervalMonths:96, laborHours:6.0, price:1650, items:[{partNumber:"BAT-BMS-1140",qty:0}] },
];

const merSoftware: SoftwareComponent[] = [
  { id:"SW-001", name:"openssl",      version:"1.1.1k",  license:"Apache-2.0", supplier:"OpenSSL",     runsOnECU:"ELE-TCU-2210", critical:true,  cves:[{ id:"CVE-2023-0286",          severity:"High",     published:"2023-02-08", fixedIn:"3.0.8"  }] },
  { id:"SW-002", name:"log4j-core",   version:"2.14.0",  license:"Apache-2.0", supplier:"Apache",      runsOnECU:"ELE-IHU-4400", critical:true,  cves:[{ id:"CVE-2021-44228 (Log4Shell)",severity:"Critical", published:"2021-12-10", fixedIn:"2.17.1" }] },
  { id:"SW-003", name:"qnx-base",     version:"7.1.0",   license:"Commercial", supplier:"BlackBerry",  runsOnECU:"ELE-ADAS-9001",critical:true,  cves:[] },
  { id:"SW-004", name:"bms-firmware", version:"4.2.1",   license:"Commercial", supplier:"Continental", runsOnECU:"BAT-BMS-1140", critical:true,  cves:[{ id:"CVE-2024-31000", severity:"High", published:"2024-02-14", fixedIn:"4.2.3" },{ id:"CVE-2024-31001", severity:"High", published:"2024-02-14", fixedIn:"4.2.3" }] },
  { id:"SW-005", name:"carplay-stack",version:"5.2",     license:"Commercial", supplier:"Apple",       runsOnECU:"ELE-IHU-4400", critical:false, cves:[{ id:"CVE-2023-32435", severity:"Critical", published:"2023-06-21", fixedIn:"5.3" }] },
];

const merMbomOps: MbomOp[] = [
  { id:"OP-001", partNumber:"PWT-ENG-2001", plantId:"PLT-PUN", line:"Line 1 · ICE",    station:"ST-10", operation:"Engine dress-up & sub-assembly",   takeTimeSec:180, status:"ready" },
  { id:"OP-002", partNumber:"PWT-HYB-3001", plantId:"PLT-PUN", line:"Line 2 · Hybrid", station:"ST-12", operation:"Hybrid e-Drive install + torque",  takeTimeSec:220, status:"ready" },
  { id:"OP-003", partNumber:"PWT-TRN-4001", plantId:"PLT-PUN", line:"Line 1 · ICE",    station:"ST-14", operation:"Transmission mate + fill",         takeTimeSec:150, status:"ready" },
  { id:"OP-004", partNumber:"BAT-PCK-8500", plantId:"PLT-PUN", line:"Line 3 · EV",     station:"ST-22", operation:"HV Pack lower + final torque",     takeTimeSec:260, status:"warning" },
  { id:"OP-005", partNumber:"PWT-EVM-5001", plantId:"PLT-PUN", line:"Line 3 · EV",     station:"ST-20", operation:"Front e-motor install",            takeTimeSec:170, status:"ready" },
  { id:"OP-006", partNumber:"CHS-SUS-1010", plantId:"PLT-PUN", line:"Line 1 · ICE",    station:"ST-06", operation:"Front strut install (L+R)",        takeTimeSec:120, status:"ready" },
  { id:"OP-007", partNumber:"BDY-LFT-7700", plantId:"PLT-PUN", line:"Line 2 · Hybrid", station:"ST-18", operation:"Power liftgate fit + calibration", takeTimeSec:140, status:"warning" },
  { id:"OP-008", partNumber:"INT-HVC-6600", plantId:"PLT-PUN", line:"Line 2 · Hybrid", station:"ST-26", operation:"HVAC pre-charge & leak test",      takeTimeSec:200, status:"pending" },
  { id:"OP-009", partNumber:"ELE-IHU-4400", plantId:"PLT-PUN", line:"Line 2 · Hybrid", station:"ST-30", operation:"Infotainment install + flash",     takeTimeSec: 90, status:"ready" },
  { id:"OP-010", partNumber:"PWT-ENG-2001", plantId:"PLT-DET", line:"Line 1 · ICE/Hybrid", station:"ST-10", operation:"Engine dress-up",             takeTimeSec:180, status:"ready" },
  { id:"OP-011", partNumber:"BAT-PCK-8500", plantId:"PLT-DET", line:"Line 2 · EV",         station:"ST-22", operation:"HV Pack lower + torque",     takeTimeSec:260, status:"ready" },
  { id:"OP-012", partNumber:"ELE-ADAS-9001",plantId:"PLT-DET", line:"Line 1 · ICE/Hybrid", station:"ST-31", operation:"ADAS DCU flash + EOL test",  takeTimeSec:140, status:"warning" },
];

const merActivityFeed: ActivityEntry[] = [
  { id:1, type:"warning",  text:"Warranty cluster · rear liftgate actuator on 14 pilot VINs",      user:"Field Quality", time:"2h ago" },
  { id:2, type:"cve",      text:"Critical CVE on IHU log4j-core · 3,420 VINs (ECN-2244 approved)",  user:"Cyber WG",      time:"6h ago" },
  { id:3, type:"approval", text:"ECN-2242 (liftgate actuator) approved by CCB",                     user:"Ravi Kumar",    time:"11h ago" },
  { id:4, type:"sync",     text:"MBOM Pune re-synced with EBOM rev 2.4",                            user:"System",        time:"1d ago" },
  { id:5, type:"cve",      text:"BMS firmware v4.2.3 raised (ECN-2245) · fixes 2 CVEs",             user:"Battery WG",    time:"1d ago" },
];

const merAiBriefing: AIBriefingItem[] = [
  { priority:1, text:"ECN-2241 (battery cell tab, EV) blocks 2 supplier requotes. Approve or escalate today.", impact:"$1.4M tooling at risk" },
  { priority:2, text:"Critical CVE on Infotainment IHU affects 3,420 pilot VINs. OTA campaign staged (ECN-2244).", impact:"UNECE R155 exposure" },
  { priority:3, text:"Pune ST-22 is 8% over takt after HV pack rework.", impact:"+12s per vehicle" },
  { priority:4, text:"Anonymous PCB Co. (Taiwan) downgraded to financial watch — BMS ECU single-source.", impact:"Supply continuity" },
];

const merChangeVelocity: ChangeVelocityEntry[] = [
  { week:"W1",  proposed:7,  approved:4, rejected:1, cycle:5 },{ week:"W2",  proposed:9,  approved:6, rejected:1, cycle:5 },
  { week:"W3",  proposed:12, approved:8, rejected:2, cycle:6 },{ week:"W4",  proposed:8,  approved:5, rejected:1, cycle:4 },
  { week:"W5",  proposed:11, approved:7, rejected:2, cycle:5 },{ week:"W6",  proposed:14, approved:9, rejected:3, cycle:6 },
  { week:"W7",  proposed:10, approved:6, rejected:2, cycle:5 },{ week:"W8",  proposed:8,  approved:5, rejected:1, cycle:4 },
  { week:"W9",  proposed:13, approved:8, rejected:2, cycle:6 },{ week:"W10", proposed:11, approved:7, rejected:2, cycle:5 },
  { week:"W11", proposed:12, approved:8, rejected:2, cycle:5 },{ week:"W12", proposed:10, approved:7, rejected:1, cycle:4 },
];

// ============================================================================
// PROGRAM 2 — ATLAS SEDAN (MY2026, Concept)
// ============================================================================

const atlParts: Part[] = [
  p("atlas-sedan","ATL-VEH-0001","Atlas Sedan MY2026",          "Vehicle",     { revision:"0.8", owner:"Program Mgmt",   cost:28000, description:"C-segment compact sedan · ICE & BEV variants" }),
  p("atlas-sedan","ATL-PWT-SYS","Powertrain System",            "System",      { owner:"Powertrain WG", cost:7200 }),
  p("atlas-sedan","ATL-CHS-SYS","Chassis & Suspension System",  "System",      { owner:"Chassis WG",    cost:3800 }),
  p("atlas-sedan","ATL-BDY-SYS","Body & Exterior System",       "System",      { owner:"Body WG",       cost:4200 }),
  p("atlas-sedan","ATL-INT-SYS","Interior & HVAC System",       "System",      { owner:"Interior WG",   cost:2800 }),
  p("atlas-sedan","ATL-ELE-SYS","Electrical System",            "System",      { owner:"E/E WG",        cost:2200, health:"warning" }),
  // Powertrain
  p("atlas-sedan","ATL-ENG-1001","1.5L Petrol Engine Assembly",  "Assembly",   { revision:"A", lifecycle:"In Work", owner:"Powertrain WG", supplierId:"SUP-TATA",  cost:2400, leadTimeDays:28, health:"warning" }),
  p("atlas-sedan","ATL-CVT-1001","CVT Transmission",             "Assembly",   { revision:"A", lifecycle:"In Work", owner:"Transmission Eng.", supplierId:"SUP-AISIN", cost:1800, leadTimeDays:35 }),
  p("atlas-sedan","ATL-EXH-1001","Exhaust & Catalytic Assembly", "Assembly",   { revision:"A", lifecycle:"In Work", owner:"Emissions Eng.", supplierId:"SUP-TATA", cost:480, leadTimeDays:21 }),
  // Chassis
  p("atlas-sedan","ATL-SUS-1001","Front MacPherson Strut Assembly","Assembly", { revision:"A", lifecycle:"In Work", owner:"Chassis WG", supplierId:"SUP-ZF",     cost:320, leadTimeDays:21, serviceable:true }),
  p("atlas-sedan","ATL-BRK-1001","Disc Brake Assembly (4-wheel)", "Assembly",  { revision:"A", lifecycle:"Released", owner:"Brakes Eng.", supplierId:"SUP-BREMBO", cost:480, leadTimeDays:21, serviceable:true, fru:true }),
  p("atlas-sedan","ATL-STR-1001","Electric Power Steering Rack",  "Assembly",  { revision:"A", lifecycle:"In Work", owner:"Chassis WG", supplierId:"SUP-BOSCH",  cost:340, leadTimeDays:28 }),
  // Body
  p("atlas-sedan","ATL-BDY-1001","Sedan Body Shell (BIW)",        "Assembly",  { revision:"A", lifecycle:"In Work", owner:"Body WG",   supplierId:"SUP-MAGNA",  cost:3200, leadTimeDays:42 }),
  p("atlas-sedan","ATL-DOR-1001","Door Module Set (4-door)",       "Assembly",  { revision:"A", lifecycle:"In Work", owner:"Body WG",   supplierId:"SUP-MAGNA",  cost:1200, leadTimeDays:35, fru:true }),
  p("atlas-sedan","ATL-GLS-1001","Windshield (standard)",          "Part",      { revision:"A", lifecycle:"Released", owner:"Glazing",   supplierId:"SUP-VALEO",  cost:180, leadTimeDays:14, serviceable:true }),
  // Interior
  p("atlas-sedan","ATL-HVC-1001","HVAC Climate Unit",              "Assembly",  { revision:"A", lifecycle:"In Work", owner:"HVAC Eng.", supplierId:"SUP-DENSO",  cost:380, leadTimeDays:28, fru:true }),
  p("atlas-sedan","ATL-SEA-1001","Front Seat Set",                 "Assembly",  { revision:"A", lifecycle:"In Work", owner:"Seats",     supplierId:"SUP-ADIENT", cost:480, leadTimeDays:35, fru:true }),
  // Electrical
  p("atlas-sedan","ATL-IHU-1001","7\" Infotainment Head Unit",     "ECU",       { revision:"fw 1.0.0", lifecycle:"In Work", owner:"E/E WG", supplierId:"SUP-HARMAN",  cost:320, leadTimeDays:28, fru:true }),
  p("atlas-sedan","ATL-CLU-1001","Digital Instrument Cluster",     "ECU",       { revision:"fw 1.0.0", lifecycle:"In Work", owner:"E/E WG", supplierId:"SUP-VISTEON", cost:180, leadTimeDays:21, fru:true }),
  p("atlas-sedan","ATL-HRN-1001","Main Wiring Harness",            "Harness",   { revision:"A", lifecycle:"In Work", owner:"E/E WG",   supplierId:"SUP-APTIV",   cost:380, leadTimeDays:28 }),
];

const atlEdges: BomEdge[] = [
  { parentPN:"ATL-VEH-0001", childPN:"ATL-PWT-SYS", qty:1 },
  { parentPN:"ATL-VEH-0001", childPN:"ATL-CHS-SYS", qty:1 },
  { parentPN:"ATL-VEH-0001", childPN:"ATL-BDY-SYS", qty:1 },
  { parentPN:"ATL-VEH-0001", childPN:"ATL-INT-SYS", qty:1 },
  { parentPN:"ATL-VEH-0001", childPN:"ATL-ELE-SYS", qty:1 },
  { parentPN:"ATL-PWT-SYS",  childPN:"ATL-ENG-1001",qty:1 },
  { parentPN:"ATL-PWT-SYS",  childPN:"ATL-CVT-1001",qty:1 },
  { parentPN:"ATL-PWT-SYS",  childPN:"ATL-EXH-1001",qty:1 },
  { parentPN:"ATL-CHS-SYS",  childPN:"ATL-SUS-1001",qty:2, refDes:"FL/FR" },
  { parentPN:"ATL-CHS-SYS",  childPN:"ATL-BRK-1001",qty:4 },
  { parentPN:"ATL-CHS-SYS",  childPN:"ATL-STR-1001",qty:1 },
  { parentPN:"ATL-BDY-SYS",  childPN:"ATL-BDY-1001",qty:1 },
  { parentPN:"ATL-BDY-SYS",  childPN:"ATL-DOR-1001",qty:1 },
  { parentPN:"ATL-BDY-SYS",  childPN:"ATL-GLS-1001",qty:1 },
  { parentPN:"ATL-INT-SYS",  childPN:"ATL-HVC-1001",qty:1 },
  { parentPN:"ATL-INT-SYS",  childPN:"ATL-SEA-1001",qty:1 },
  { parentPN:"ATL-ELE-SYS",  childPN:"ATL-IHU-1001",qty:1 },
  { parentPN:"ATL-ELE-SYS",  childPN:"ATL-CLU-1001",qty:1 },
  { parentPN:"ATL-ELE-SYS",  childPN:"ATL-HRN-1001",qty:1 },
];

const atlVariants: Variant[] = [
  { code:"ATL-ICE-BASE-AS", name:"Atlas 1.5 Base (Asia)",    powertrain:"Petrol 1.5",  trim:"Base",    market:"Asia Pacific", startEffectivity:"2026-11-01", unitsPlanned:12000, conflicts:0, includesPNs:[], excludesPNs:[] },
  { code:"ATL-ICE-PREM-EU", name:"Atlas 1.5 Premium (EU)",   powertrain:"Petrol 1.5",  trim:"Premium", market:"Europe",       startEffectivity:"2026-12-01", unitsPlanned:8500,  conflicts:0, includesPNs:[], excludesPNs:[] },
  { code:"ATL-BEV-BASE-CN", name:"Atlas BEV Base (China)",   powertrain:"BEV 55 kWh",  trim:"Base",    market:"China",        startEffectivity:"2027-02-01", unitsPlanned:18000, conflicts:1, includesPNs:[], excludesPNs:["ATL-ENG-1001","ATL-CVT-1001","ATL-EXH-1001"] },
];

const atlEcns: ECN[] = [
  { id:"ECN-3001", title:"CVT belt material grade upgrade", state:"In Review", priority:"High", raisedBy:"Liu Wei", raisedAt:"2026-03-10", affectedPNs:["ATL-CVT-1001"], affectedVariants:["ATL-ICE-BASE-AS","ATL-ICE-PREM-EU"], reason:"Quality", estCostImpactUsd:8, estVinsAffected:0, description:"Belt delamination at 80°C soak. Aisin proposes carbon-fibre reinforced grade.",
    timeline:[{ at:"2026-03-10", by:"Liu Wei", role:"Transmission Engineer", event:"ECN raised" }] },
  { id:"ECN-3002", title:"BEV wiring harness routing — door intrusion",state:"Draft", priority:"Medium", raisedBy:"Soo-Ah Kim", raisedAt:"2026-03-22", affectedPNs:["ATL-HRN-1001"], affectedVariants:["ATL-BEV-BASE-CN"], reason:"Engineering", estCostImpactUsd:4, estVinsAffected:0, description:"Harness contacts door seal in BEV variant. Reroute through B-pillar.",
    timeline:[{ at:"2026-03-22", by:"Soo-Ah Kim", role:"E/E Architect", event:"Draft opened" }] },
  { id:"ECN-3003", title:"Infotainment localisation — Mandarin TTS", state:"Approved", priority:"Low", raisedBy:"Chen Fang", raisedAt:"2026-02-15", approver:"Liu Wei", affectedPNs:["ATL-IHU-1001"], affectedVariants:["ATL-BEV-BASE-CN"], reason:"Engineering", estCostImpactUsd:0, estVinsAffected:0, description:"Add Mandarin text-to-speech pack to IHU firmware for China launch.",
    timeline:[{ at:"2026-02-15", by:"Chen Fang", role:"Localisation Lead", event:"ECN raised" },{ at:"2026-02-28", by:"Liu Wei", role:"Program Manager", event:"Approved" }] },
];

const atlFieldEvents: FieldEvent[] = [
  { id:"FLD-ATL-001", severity:"medium", title:"CVT overheating in stop-start traffic",   partNumber:"ATL-CVT-1001", vinsAffected:3,  ageHours:12, variant:"ICE Base Asia",   reportedBy:"Prototype Fleet", status:"Investigating" },
  { id:"FLD-ATL-002", severity:"low",    title:"Door rattle at highway speed",             partNumber:"ATL-DOR-1001", vinsAffected:2,  ageHours:48, variant:"ICE Premium EU",  reportedBy:"Prototype Fleet", status:"Open" },
];

const atlServiceKits: ServiceKit[] = [
  { id:"ATL-SVC-10K", name:"10,000 km Routine Service",     category:"Routine", intervalKm:10000, intervalMonths:12, laborHours:1.0, price:180, items:[{partNumber:"ATL-HVC-1001",qty:0}] },
  { id:"ATL-SVC-BRK", name:"Brake Pad Replacement (4-wheel)",category:"Wear",                                       laborHours:1.5, price:280, items:[{partNumber:"ATL-BRK-1001",qty:1}] },
];

const atlSoftware: SoftwareComponent[] = [
  { id:"ATL-SW-001", name:"android-auto", version:"12.0",   license:"Commercial", supplier:"Google",  runsOnECU:"ATL-IHU-1001", critical:false, cves:[{ id:"CVE-2024-00112", severity:"Medium", published:"2024-01-15" }] },
  { id:"ATL-SW-002", name:"can-stack",    version:"2.1.0",  license:"MIT",        supplier:"in-house",runsOnECU:"ATL-CLU-1001", critical:false, cves:[] },
];

const atlMbomOps: MbomOp[] = [
  { id:"ATL-OP-001", partNumber:"ATL-ENG-1001", plantId:"PLT-CHN", line:"Line 1 · ICE", station:"ST-10", operation:"Engine sub-assembly & dress-up", takeTimeSec:160, status:"pending" },
  { id:"ATL-OP-002", partNumber:"ATL-CVT-1001", plantId:"PLT-CHN", line:"Line 1 · ICE", station:"ST-14", operation:"CVT mate + fluid fill",         takeTimeSec:130, status:"pending" },
  { id:"ATL-OP-003", partNumber:"ATL-BDY-1001", plantId:"PLT-CHN", line:"Line 1 · ICE", station:"ST-02", operation:"BIW load & fixture",            takeTimeSec:300, status:"pending" },
];

const atlActivityFeed: ActivityEntry[] = [
  { id:1, type:"warning",  text:"CVT overheating detected on 3 prototype VINs during city-cycle testing", user:"Proto Fleet",  time:"12h ago" },
  { id:2, type:"approval", text:"ECN-3003 Mandarin TTS pack approved for China IHU firmware",              user:"Liu Wei",      time:"1d ago" },
  { id:3, type:"add",      text:"BEV variant ATL-BEV-BASE-CN added to CAT BOM",                           user:"Prog. Mgmt",   time:"2d ago" },
];

const atlAiBriefing: AIBriefingItem[] = [
  { priority:1, text:"ECN-3001 CVT belt upgrade pending — must resolve before China homologation gate.", impact:"3-week schedule risk" },
  { priority:2, text:"BEV harness routing conflict (ECN-3002) must close before prototype build-2 BOM freeze.", impact:"Prototype delay" },
];

const atlChangeVelocity: ChangeVelocityEntry[] = [
  { week:"W1", proposed:3, approved:2, rejected:0, cycle:6 },{ week:"W2", proposed:4, approved:2, rejected:1, cycle:7 },
  { week:"W3", proposed:5, approved:3, rejected:1, cycle:6 },{ week:"W4", proposed:3, approved:2, rejected:0, cycle:5 },
  { week:"W5", proposed:6, approved:4, rejected:1, cycle:6 },{ week:"W6", proposed:5, approved:3, rejected:0, cycle:5 },
  { week:"W7", proposed:4, approved:3, rejected:1, cycle:6 },{ week:"W8", proposed:6, approved:4, rejected:1, cycle:5 },
  { week:"W9", proposed:5, approved:3, rejected:0, cycle:5 },{ week:"W10",proposed:7, approved:5, rejected:1, cycle:6 },
  { week:"W11",proposed:4, approved:3, rejected:0, cycle:5 },{ week:"W12",proposed:5, approved:4, rejected:0, cycle:5 },
];

// ============================================================================
// PROGRAM 3 — TITAN TRUCK (MY2027, Design)
// ============================================================================

const ttnParts: Part[] = [
  p("titan-truck","TTN-VEH-0001","Titan Pickup Truck MY2027",    "Vehicle",     { revision:"0.4", owner:"Program Mgmt", cost:42000, description:"Full-size body-on-frame pickup · Diesel & Petrol" }),
  p("titan-truck","TTN-PWT-SYS","Powertrain System",             "System",      { owner:"Powertrain WG", cost:14000 }),
  p("titan-truck","TTN-CHS-SYS","Chassis & Frame System",        "System",      { owner:"Chassis WG",    cost:8400 }),
  p("titan-truck","TTN-BDY-SYS","Cab & Cargo Body System",       "System",      { owner:"Body WG",       cost:6200 }),
  p("titan-truck","TTN-INT-SYS","Interior System",               "System",      { owner:"Interior WG",   cost:2400 }),
  p("titan-truck","TTN-ELE-SYS","Electrical System",             "System",      { owner:"E/E WG",        cost:1800 }),
  // Powertrain
  p("titan-truck","TTN-ENG-3001","3.5L Diesel Engine Assembly",  "Assembly",    { revision:"A", lifecycle:"In Work", owner:"Powertrain WG", supplierId:"SUP-CUMMINS", cost:8200, leadTimeDays:56, health:"warning" }),
  p("titan-truck","TTN-GBX-3001","6-speed Manual Gearbox",       "Assembly",    { revision:"A", lifecycle:"In Work", owner:"Transmission Eng.", supplierId:"SUP-ZF",     cost:2800, leadTimeDays:42 }),
  p("titan-truck","TTN-4WD-3001","4WD Transfer Case",            "Assembly",    { revision:"A", lifecycle:"In Work", owner:"Drivetrain Eng.",   supplierId:"SUP-MAGNA",  cost:1400, leadTimeDays:35 }),
  // Chassis
  p("titan-truck","TTN-FRM-3001","Ladder Frame Chassis",         "Assembly",    { revision:"A", lifecycle:"In Work", owner:"Chassis WG",    supplierId:"SUP-MAGNA",  cost:3600, leadTimeDays:42 }),
  p("titan-truck","TTN-SUS-3001","Front Double-Wishbone Assy",   "Assembly",    { revision:"A", lifecycle:"In Work", owner:"Chassis WG",    supplierId:"SUP-ZF",     cost:680,  leadTimeDays:28, serviceable:true, fru:true }),
  p("titan-truck","TTN-BRK-3001","Heavy-Duty Brake System",      "Assembly",    { revision:"A", lifecycle:"Released", owner:"Brakes Eng.",   supplierId:"SUP-BREMBO", cost:920,  leadTimeDays:28, serviceable:true, fru:true }),
  // Body
  p("titan-truck","TTN-BED-3001","Truck Bed Assembly",           "Assembly",    { revision:"A", lifecycle:"In Work", owner:"Body WG",  supplierId:"SUP-MAGNA",  cost:1800, leadTimeDays:35 }),
  p("titan-truck","TTN-TOW-3001","Tow Hitch Assembly (5,000 kg)","Assembly",    { revision:"A", lifecycle:"Released", owner:"Body WG",  supplierId:"SUP-MAGNA",  cost:480,  leadTimeDays:21, serviceable:true, fru:true }),
  p("titan-truck","TTN-CAB-3001","Crew Cab Body Assembly",       "Assembly",    { revision:"A", lifecycle:"In Work", owner:"Body WG",  supplierId:"SUP-MAGNA",  cost:4200, leadTimeDays:42 }),
  // Interior
  p("titan-truck","TTN-HVC-3001","HVAC Unit",                    "Assembly",    { revision:"A", lifecycle:"Released", owner:"HVAC Eng.", supplierId:"SUP-DENSO", cost:320, leadTimeDays:21, fru:true }),
  // Electrical
  p("titan-truck","TTN-IHU-3001","8\" Infotainment Unit",        "ECU",         { revision:"fw 1.0.0", lifecycle:"In Work", owner:"E/E WG", supplierId:"SUP-HARMAN", cost:280, leadTimeDays:28, fru:true }),
  p("titan-truck","TTN-HRN-3001","Main Wiring Harness",          "Harness",     { revision:"A", lifecycle:"In Work", owner:"E/E WG", supplierId:"SUP-APTIV",  cost:480, leadTimeDays:28 }),
];

const ttnEdges: BomEdge[] = [
  { parentPN:"TTN-VEH-0001", childPN:"TTN-PWT-SYS", qty:1 },
  { parentPN:"TTN-VEH-0001", childPN:"TTN-CHS-SYS", qty:1 },
  { parentPN:"TTN-VEH-0001", childPN:"TTN-BDY-SYS", qty:1 },
  { parentPN:"TTN-VEH-0001", childPN:"TTN-INT-SYS", qty:1 },
  { parentPN:"TTN-VEH-0001", childPN:"TTN-ELE-SYS", qty:1 },
  { parentPN:"TTN-PWT-SYS",  childPN:"TTN-ENG-3001",qty:1 },
  { parentPN:"TTN-PWT-SYS",  childPN:"TTN-GBX-3001",qty:1 },
  { parentPN:"TTN-PWT-SYS",  childPN:"TTN-4WD-3001",qty:1 },
  { parentPN:"TTN-CHS-SYS",  childPN:"TTN-FRM-3001",qty:1 },
  { parentPN:"TTN-CHS-SYS",  childPN:"TTN-SUS-3001",qty:2, refDes:"FL/FR" },
  { parentPN:"TTN-CHS-SYS",  childPN:"TTN-BRK-3001",qty:4 },
  { parentPN:"TTN-BDY-SYS",  childPN:"TTN-BED-3001",qty:1 },
  { parentPN:"TTN-BDY-SYS",  childPN:"TTN-TOW-3001",qty:1 },
  { parentPN:"TTN-BDY-SYS",  childPN:"TTN-CAB-3001",qty:1 },
  { parentPN:"TTN-INT-SYS",  childPN:"TTN-HVC-3001",qty:1 },
  { parentPN:"TTN-ELE-SYS",  childPN:"TTN-IHU-3001",qty:1 },
  { parentPN:"TTN-ELE-SYS",  childPN:"TTN-HRN-3001",qty:1 },
];

const ttnVariants: Variant[] = [
  { code:"TTN-DSL-BASE-NA",  name:"Titan 3.5 Diesel Base (NA)",   powertrain:"Diesel 3.5L", trim:"Base",    market:"North America", startEffectivity:"2027-06-01", unitsPlanned:7200,  conflicts:0, includesPNs:[], excludesPNs:[] },
  { code:"TTN-DSL-PREM-MX",  name:"Titan 3.5 Diesel Premium (MX)",powertrain:"Diesel 3.5L", trim:"Premium", market:"Mexico",        startEffectivity:"2027-07-01", unitsPlanned:4800,  conflicts:0, includesPNs:[], excludesPNs:[] },
  { code:"TTN-GAS-BASE-NA",  name:"Titan 3.0 Petrol Base (NA)",   powertrain:"Petrol 3.0L", trim:"Base",    market:"North America", startEffectivity:"2027-08-01", unitsPlanned:5600,  conflicts:0, includesPNs:[], excludesPNs:["TTN-ENG-3001"] },
];

const ttnEcns: ECN[] = [
  { id:"ECN-4001", title:"Diesel engine NVH damper revision", state:"In Review", priority:"Medium", raisedBy:"Jake Morrison", raisedAt:"2026-04-01", affectedPNs:["TTN-ENG-3001"], affectedVariants:["TTN-DSL-BASE-NA","TTN-DSL-PREM-MX"], reason:"Engineering", estCostImpactUsd:14, estVinsAffected:0, description:"Torsional damper resonance at 1,800 rpm identified in rig test.",
    timeline:[{ at:"2026-04-01", by:"Jake Morrison", role:"NVH Engineer", event:"ECN raised" }] },
  { id:"ECN-4002", title:"Tow hitch load rating documentation update", state:"Released", priority:"Low", raisedBy:"Maria Reyes", raisedAt:"2026-03-01", approver:"Jake Morrison", affectedPNs:["TTN-TOW-3001"], affectedVariants:[], reason:"Regulatory", estCostImpactUsd:0, estVinsAffected:0, description:"Update SAE J2807 compliance documentation — no hardware change.",
    timeline:[{ at:"2026-03-01", by:"Maria Reyes", role:"Regulatory Engineer", event:"ECN raised" },{ at:"2026-03-12", by:"Jake Morrison", role:"Program Manager", event:"Released" }] },
];

const ttnFieldEvents: FieldEvent[] = [
  { id:"FLD-TTN-001", severity:"medium", title:"Diesel cold-start smoke excess at -20°C", partNumber:"TTN-ENG-3001", vinsAffected:1, ageHours:24, variant:"Diesel Base NA", reportedBy:"Cold-Climate Test", status:"Investigating" },
];

const ttnServiceKits: ServiceKit[] = [
  { id:"TTN-SVC-OIL", name:"Diesel Oil & Filter Service", category:"Routine", intervalKm:15000, intervalMonths:12, laborHours:1.0, price:220, items:[{partNumber:"TTN-ENG-3001",qty:0}] },
  { id:"TTN-SVC-BRK", name:"Heavy-Duty Brake Service",    category:"Wear",                                        laborHours:2.5, price:420, items:[{partNumber:"TTN-BRK-3001",qty:1}] },
];

const ttnSoftware: SoftwareComponent[] = [
  { id:"TTN-SW-001", name:"diesel-ecu-fw", version:"2.3.1", license:"Commercial", supplier:"Cummins", runsOnECU:"TTN-IHU-3001", critical:true,  cves:[] },
];

const ttnMbomOps: MbomOp[] = [
  { id:"TTN-OP-001", partNumber:"TTN-ENG-3001", plantId:"PLT-SAN", line:"Line 1 · Diesel", station:"ST-10", operation:"Diesel engine dress-up", takeTimeSec:220, status:"pending" },
  { id:"TTN-OP-002", partNumber:"TTN-FRM-3001", plantId:"PLT-SAN", line:"Line 1 · Diesel", station:"ST-02", operation:"Frame load & fixture",   takeTimeSec:180, status:"pending" },
];

const ttnActivityFeed: ActivityEntry[] = [
  { id:1, type:"warning",  text:"Diesel NVH resonance at 1,800 rpm found in rig test (ECN-4001 raised)",   user:"NVH Team",   time:"1d ago" },
  { id:2, type:"approval", text:"ECN-4002 tow hitch documentation released — regulatory gate cleared",     user:"Maria Reyes",time:"3d ago" },
  { id:3, type:"add",      text:"Cold-climate test fleet dispatched to Arvidsjaur, Sweden",                user:"Prog. Mgmt", time:"4d ago" },
];

const ttnAiBriefing: AIBriefingItem[] = [
  { priority:1, text:"ECN-4001 diesel NVH fix must close before D1 design freeze in 6 weeks.", impact:"SOP gate risk" },
  { priority:2, text:"Single-source dependency on Cummins diesel ECU — qualify secondary supplier.", impact:"Supply continuity" },
];

const ttnChangeVelocity: ChangeVelocityEntry[] = [
  { week:"W1", proposed:2, approved:1, rejected:0, cycle:7 },{ week:"W2", proposed:3, approved:2, rejected:0, cycle:7 },
  { week:"W3", proposed:2, approved:1, rejected:1, cycle:8 },{ week:"W4", proposed:4, approved:3, rejected:0, cycle:6 },
  { week:"W5", proposed:3, approved:2, rejected:0, cycle:7 },{ week:"W6", proposed:2, approved:1, rejected:0, cycle:6 },
  { week:"W7", proposed:4, approved:3, rejected:1, cycle:7 },{ week:"W8", proposed:3, approved:2, rejected:0, cycle:6 },
  { week:"W9", proposed:2, approved:2, rejected:0, cycle:5 },{ week:"W10",proposed:3, approved:2, rejected:0, cycle:6 },
  { week:"W11",proposed:4, approved:3, rejected:1, cycle:7 },{ week:"W12",proposed:3, approved:2, rejected:0, cycle:6 },
];

// ============================================================================
// PROGRAM 4 — NOVA EV CROSSOVER (MY2027, Engineering)
// ============================================================================

const novParts: Part[] = [
  p("nova-ev","NOV-VEH-0001","Nova EV Crossover MY2027",        "Vehicle",     { revision:"1.1", owner:"Program Mgmt",  cost:58000, description:"Pure-BEV D-segment crossover · ADAS Level 3 capable" }),
  p("nova-ev","NOV-PWT-SYS","Electric Powertrain System",       "System",      { owner:"e-Drive WG",  cost:22000 }),
  p("nova-ev","NOV-BAT-SYS","Battery & Charging System",        "System",      { owner:"Battery WG",  cost:28000, health:"warning" }),
  p("nova-ev","NOV-CHS-SYS","Chassis System",                   "System",      { owner:"Chassis WG",  cost:5800 }),
  p("nova-ev","NOV-ELE-SYS","ADAS & Infotainment System",       "System",      { owner:"E/E WG",      cost:9200, health:"warning" }),
  // Powertrain
  p("nova-ev","NOV-MTR-4001","Dual Motor AWD Drive Unit",        "Assembly",    { revision:"B", lifecycle:"In Review", owner:"e-Drive WG", supplierId:"SUP-NIDEC", cost:8400, leadTimeDays:42, health:"warning", warnings:1 }),
  p("nova-ev","NOV-INV-4001","Dual Traction Inverter",           "Assembly",    { revision:"A", owner:"Power Elec.", supplierId:"SUP-BOSCH", cost:1800, leadTimeDays:35 }),
  // Battery
  p("nova-ev","NOV-BAT-4001","95 kWh Lithium Battery Pack",      "Assembly",    { revision:"B", owner:"Battery WG", supplierId:"SUP-LGES",  cost:16800, leadTimeDays:56, health:"warning", warnings:2, description:"NMC pouch cells, 120-module, 800V architecture" }),
  p("nova-ev","NOV-BMS-4001","Battery Management System ECU",    "ECU",         { revision:"fw 2.1.0", lifecycle:"In Review", owner:"E/E WG", supplierId:"SUP-CONTI", cost:520, leadTimeDays:35, cves:1, fru:true }),
  p("nova-ev","NOV-CHR-4001","DC Fast-Charge Port (CCS2/CHAdeMO)","Part",       { revision:"A", owner:"Battery Elec.", supplierId:"SUP-APTIV", cost:280, leadTimeDays:21, fru:true }),
  p("nova-ev","NOV-THR-4001","Active Thermal Management System", "Assembly",    { revision:"A", owner:"Thermal Eng.", supplierId:"SUP-VALEO", cost:820, leadTimeDays:28 }),
  // Chassis
  p("nova-ev","NOV-SUS-4001","Adaptive Air Suspension System",   "Assembly",    { revision:"A", lifecycle:"In Work", owner:"Chassis WG", supplierId:"SUP-ZF",  cost:2400, leadTimeDays:42, serviceable:true, fru:true }),
  // ADAS & Electrical
  p("nova-ev","NOV-LDR-4001","Solid-State LiDAR Unit",           "Assembly",    { revision:"A", lifecycle:"In Review", owner:"ADAS", supplierId:"SUP-LUMINAR", cost:1800, leadTimeDays:42, health:"warning", fru:true }),
  p("nova-ev","NOV-CAM-4001","360° Camera Array (×8)",           "Assembly",    { revision:"A", owner:"ADAS", supplierId:"SUP-BOSCH", cost:640, leadTimeDays:28, fru:true }),
  p("nova-ev","NOV-OTA-4001","OTA Manager ECU",                  "ECU",         { revision:"fw 1.4.0", owner:"E/E WG", supplierId:"SUP-NVIDIA", cost:480, leadTimeDays:35, fru:true }),
  p("nova-ev","NOV-IHU-4001","Premium 15\" Infotainment Head Unit","ECU",        { revision:"fw 3.2.0", lifecycle:"In Review", owner:"E/E WG", supplierId:"SUP-HARMAN", cost:980, leadTimeDays:35, cves:1, fru:true }),
];

const novEdges: BomEdge[] = [
  { parentPN:"NOV-VEH-0001", childPN:"NOV-PWT-SYS", qty:1 },
  { parentPN:"NOV-VEH-0001", childPN:"NOV-BAT-SYS", qty:1 },
  { parentPN:"NOV-VEH-0001", childPN:"NOV-CHS-SYS", qty:1 },
  { parentPN:"NOV-VEH-0001", childPN:"NOV-ELE-SYS", qty:1 },
  { parentPN:"NOV-PWT-SYS",  childPN:"NOV-MTR-4001",qty:1 },
  { parentPN:"NOV-PWT-SYS",  childPN:"NOV-INV-4001",qty:1 },
  { parentPN:"NOV-BAT-SYS",  childPN:"NOV-BAT-4001",qty:1 },
  { parentPN:"NOV-BAT-SYS",  childPN:"NOV-CHR-4001",qty:1 },
  { parentPN:"NOV-BAT-SYS",  childPN:"NOV-THR-4001",qty:1 },
  { parentPN:"NOV-BAT-4001", childPN:"NOV-BMS-4001", qty:1 },
  { parentPN:"NOV-CHS-SYS",  childPN:"NOV-SUS-4001",qty:4 },
  { parentPN:"NOV-ELE-SYS",  childPN:"NOV-LDR-4001",qty:2 },
  { parentPN:"NOV-ELE-SYS",  childPN:"NOV-CAM-4001",qty:1 },
  { parentPN:"NOV-ELE-SYS",  childPN:"NOV-OTA-4001",qty:1 },
  { parentPN:"NOV-ELE-SYS",  childPN:"NOV-IHU-4001",qty:1 },
];

const novVariants: Variant[] = [
  { code:"NOV-EV-BASE-NA", name:"Nova EV Base (NA)",      powertrain:"BEV 95 kWh", trim:"Base",      market:"North America", startEffectivity:"2027-09-01", unitsPlanned:14000, conflicts:0, includesPNs:[], excludesPNs:["NOV-LDR-4001"] },
  { code:"NOV-EV-PREM-EU", name:"Nova EV Premium (EU)",   powertrain:"BEV 95 kWh", trim:"Premium",   market:"European Union", startEffectivity:"2027-10-01", unitsPlanned:11000, conflicts:0, includesPNs:[], excludesPNs:[] },
  { code:"NOV-EV-SIG-NA",  name:"Nova EV Signature (NA)", powertrain:"BEV 95 kWh", trim:"Signature", market:"North America", startEffectivity:"2027-11-01", unitsPlanned:6000,  conflicts:1, includesPNs:["NOV-LDR-4001"], excludesPNs:[] },
];

const novEcns: ECN[] = [
  { id:"ECN-5001", title:"800V pack cell supplier qualification", state:"In Review", priority:"High", raisedBy:"Yuki Tanaka", raisedAt:"2026-04-20", affectedPNs:["NOV-BAT-4001"], affectedVariants:["NOV-EV-BASE-NA","NOV-EV-PREM-EU","NOV-EV-SIG-NA"], reason:"Supplier", estCostImpactUsd:0, estVinsAffected:0, description:"Qualify CATL as secondary supplier for 800V pouch cells.",
    timeline:[{ at:"2026-04-20", by:"Yuki Tanaka", role:"Battery Engineer", event:"ECN raised" }] },
  { id:"ECN-5002", title:"LiDAR firmware CVE patch", state:"Draft", priority:"High", raisedBy:"Sara Okonkwo", raisedAt:"2026-04-25", affectedPNs:["NOV-LDR-4001"], affectedVariants:["NOV-EV-SIG-NA"], reason:"Cyber", estCostImpactUsd:0, estVinsAffected:0, description:"Remote code execution CVE discovered in LiDAR perception stack firmware.",
    timeline:[{ at:"2026-04-25", by:"Sara Okonkwo", role:"Product Security", event:"Draft opened" }] },
  { id:"ECN-5003", title:"Dual motor torque vectoring calibration", state:"Approved", priority:"Medium", raisedBy:"Yuki Tanaka", raisedAt:"2026-03-12", approver:"Sara Okonkwo", affectedPNs:["NOV-MTR-4001","NOV-INV-4001"], affectedVariants:[], reason:"Engineering", estCostImpactUsd:0, estVinsAffected:0, description:"Torque split algorithm revision to eliminate torque spiking under cornering.",
    timeline:[{ at:"2026-03-12", by:"Yuki Tanaka", role:"e-Drive Engineer", event:"ECN raised" },{ at:"2026-03-28", by:"Sara Okonkwo", role:"Program Manager", event:"Approved" }] },
];

const novFieldEvents: FieldEvent[] = [
  { id:"FLD-NOV-001", severity:"high",   title:"LiDAR false-positive emergency braking",  partNumber:"NOV-LDR-4001", vinsAffected:2,  ageHours:4,  variant:"Signature NA", reportedBy:"ADAS Test Team",  status:"Investigating" },
  { id:"FLD-NOV-002", severity:"medium", title:"800V pack charge timeout at 150 kW DC",   partNumber:"NOV-BAT-4001", vinsAffected:5,  ageHours:24, variant:"All variants", reportedBy:"Charging Team",   status:"Investigating" },
  { id:"FLD-NOV-003", severity:"low",    title:"OTA update stall on cellular hand-off",    partNumber:"NOV-OTA-4001", vinsAffected:12, ageHours:48, variant:"Premium EU",   reportedBy:"Connectivity WG", status:"Open" },
];

const novServiceKits: ServiceKit[] = [
  { id:"NOV-SVC-CHK", name:"Annual EV Checkup",             category:"Routine", intervalKm:20000, intervalMonths:12, laborHours:1.0, price:180, items:[{partNumber:"NOV-BMS-4001",qty:0}] },
  { id:"NOV-SVC-BAT", name:"Battery Pack Health Assessment", category:"Major",   intervalKm:80000, intervalMonths:60, laborHours:3.0, price:480, items:[{partNumber:"NOV-BAT-4001",qty:0}] },
];

const novSoftware: SoftwareComponent[] = [
  { id:"NOV-SW-001", name:"lidar-perception",version:"2.1.0", license:"Commercial", supplier:"Luminar",  runsOnECU:"NOV-LDR-4001", critical:true,  cves:[{ id:"CVE-2026-00188", severity:"High", published:"2026-04-20" }] },
  { id:"NOV-SW-002", name:"ota-manager",     version:"1.4.0", license:"Commercial", supplier:"in-house", runsOnECU:"NOV-OTA-4001", critical:true,  cves:[] },
  { id:"NOV-SW-003", name:"bms-nova-fw",     version:"2.1.0", license:"Commercial", supplier:"Continental",runsOnECU:"NOV-BMS-4001",critical:true,  cves:[{ id:"CVE-2026-00202", severity:"Medium", published:"2026-04-24" }] },
];

const novMbomOps: MbomOp[] = [
  { id:"NOV-OP-001", partNumber:"NOV-BAT-4001", plantId:"PLT-FRE", line:"Line 1 · EV", station:"ST-20", operation:"800V pack lower & torque",       takeTimeSec:300, status:"pending" },
  { id:"NOV-OP-002", partNumber:"NOV-MTR-4001", plantId:"PLT-FRE", line:"Line 1 · EV", station:"ST-14", operation:"Dual motor install + coupling",   takeTimeSec:200, status:"pending" },
  { id:"NOV-OP-003", partNumber:"NOV-LDR-4001", plantId:"PLT-GIG", line:"Line 1 · EV", station:"ST-40", operation:"LiDAR calibration & boresight",   takeTimeSec:240, status:"warning" },
  { id:"NOV-OP-004", partNumber:"NOV-BAT-4001", plantId:"PLT-GIG", line:"Line 1 · EV", station:"ST-20", operation:"800V pack lower & torque",        takeTimeSec:300, status:"pending" },
];

const novActivityFeed: ActivityEntry[] = [
  { id:1, type:"critical", text:"LiDAR false-positive emergency braking on 2 test VINs — ADAS investigation opened", user:"ADAS Test",    time:"4h ago" },
  { id:2, type:"cve",      text:"LiDAR perception CVE discovered (ECN-5002 opened)",                                   user:"Security WG", time:"12h ago" },
  { id:3, type:"warning",  text:"800V pack charge timeout at 150 kW DC on 5 prototype VINs",                          user:"Charging WG", time:"1d ago" },
  { id:4, type:"approval", text:"ECN-5003 torque vectoring calibration approved",                                      user:"Sara Okonkwo",time:"2d ago" },
];

const novAiBriefing: AIBriefingItem[] = [
  { priority:1, text:"LiDAR false-positive braking is a Level 3 safety regression — pause road testing until root cause confirmed.", impact:"L3 homologation at risk" },
  { priority:2, text:"ECN-5001 secondary battery supplier qualification must complete before Q3 SOP gate.", impact:"Supply continuity" },
  { priority:3, text:"OTA stall rate 0.8% on cellular hand-off exceeds 0.3% target.", impact:"Field quality metric" },
];

const novChangeVelocity: ChangeVelocityEntry[] = [
  { week:"W1", proposed:5, approved:3, rejected:0, cycle:6 },{ week:"W2", proposed:6, approved:4, rejected:1, cycle:7 },
  { week:"W3", proposed:8, approved:5, rejected:1, cycle:6 },{ week:"W4", proposed:6, approved:4, rejected:0, cycle:5 },
  { week:"W5", proposed:9, approved:6, rejected:2, cycle:6 },{ week:"W6", proposed:7, approved:5, rejected:1, cycle:5 },
  { week:"W7", proposed:8, approved:5, rejected:1, cycle:6 },{ week:"W8", proposed:6, approved:4, rejected:0, cycle:5 },
  { week:"W9", proposed:10,approved:7, rejected:2, cycle:6 },{ week:"W10",proposed:8, approved:5, rejected:1, cycle:5 },
  { week:"W11",proposed:9, approved:6, rejected:1, cycle:6 },{ week:"W12",proposed:7, approved:5, rejected:0, cycle:5 },
];

// ============================================================================
// PROGRAMS ARRAY
// ============================================================================

export const programs: VehicleProgram[] = [
  {
    id: "meridian-suv", name: "Meridian SUV", codename: "Project Meridian", modelYear: "MY2026",
    stage: "Pre-Production", category: "SUV", daysToSOP: 84, plannedAnnualVolume: 48000,
    pilotVinsBuilt: 247, activeEcns: 5, openFieldEvents: 4, globalRevision: "rev 2.4",
    lastUpdated: "47 min ago", healthScore: 74,
    activityFeed: merActivityFeed, aiBriefing: merAiBriefing, changeVelocity: merChangeVelocity,
    parts: merParts, bomEdges: merEdges, variants: merVariants, ecns: merEcns,
    fieldEvents: merFieldEvents, serviceKits: merServiceKits, softwareComponents: merSoftware,
    plants: merPlants, mbomOps: merMbomOps,
  },
  {
    id: "atlas-sedan", name: "Atlas Sedan", codename: "Project Atlas", modelYear: "MY2026",
    stage: "Concept", category: "Sedan", daysToSOP: 312, plannedAnnualVolume: 62000,
    pilotVinsBuilt: 0, activeEcns: 2, openFieldEvents: 2, globalRevision: "rev 0.8",
    lastUpdated: "2h ago", healthScore: 62,
    activityFeed: atlActivityFeed, aiBriefing: atlAiBriefing, changeVelocity: atlChangeVelocity,
    parts: atlParts, bomEdges: atlEdges, variants: atlVariants, ecns: atlEcns,
    fieldEvents: atlFieldEvents, serviceKits: atlServiceKits, softwareComponents: atlSoftware,
    plants: atlPlants, mbomOps: atlMbomOps,
  },
  {
    id: "titan-truck", name: "Titan Truck", codename: "Project Titan", modelYear: "MY2027",
    stage: "Design", category: "Truck", daysToSOP: 448, plannedAnnualVolume: 28000,
    pilotVinsBuilt: 0, activeEcns: 1, openFieldEvents: 1, globalRevision: "rev 0.4",
    lastUpdated: "5h ago", healthScore: 58,
    activityFeed: ttnActivityFeed, aiBriefing: ttnAiBriefing, changeVelocity: ttnChangeVelocity,
    parts: ttnParts, bomEdges: ttnEdges, variants: ttnVariants, ecns: ttnEcns,
    fieldEvents: ttnFieldEvents, serviceKits: ttnServiceKits, softwareComponents: ttnSoftware,
    plants: ttnPlants, mbomOps: ttnMbomOps,
  },
  {
    id: "nova-ev", name: "Nova EV", codename: "Project Nova", modelYear: "MY2027",
    stage: "Engineering", category: "EV Crossover", daysToSOP: 524, plannedAnnualVolume: 35000,
    pilotVinsBuilt: 18, activeEcns: 3, openFieldEvents: 3, globalRevision: "rev 1.1",
    lastUpdated: "30 min ago", healthScore: 66,
    activityFeed: novActivityFeed, aiBriefing: novAiBriefing, changeVelocity: novChangeVelocity,
    parts: novParts, bomEdges: novEdges, variants: novVariants, ecns: novEcns,
    fieldEvents: novFieldEvents, serviceKits: novServiceKits, softwareComponents: novSoftware,
    plants: novPlants, mbomOps: novMbomOps,
  },
];

// ============================================================================
// FLAT BACKWARD-COMPATIBLE EXPORTS
// ============================================================================

export const parts: Part[]             = programs.flatMap(pg => pg.parts);
export const bomEdges: BomEdge[]       = programs.flatMap(pg => pg.bomEdges);
export const variants: Variant[]       = programs.flatMap(pg => pg.variants);
export const ecns: ECN[]               = programs.flatMap(pg => pg.ecns);
export const fieldEvents: FieldEvent[] = programs.flatMap(pg => pg.fieldEvents);
export const serviceKits: ServiceKit[] = programs.flatMap(pg => pg.serviceKits);
export const softwareComponents: SoftwareComponent[] = programs.flatMap(pg => pg.softwareComponents);
export const plants: Plant[]           = programs.flatMap(pg => pg.plants);
export const mbomOps: MbomOp[]         = programs.flatMap(pg => pg.mbomOps);
export const activityFeed              = programs[0].activityFeed;
export const aiBriefing                = programs[0].aiBriefing;
export const changeVelocity            = programs[0].changeVelocity;

// Legacy single-program header (Meridian)
export const program = {
  id: "MER-MY2026", name: "Meridian SUV", codename: "Project Meridian", modelYear: "MY2026",
  stage: "Pre-Production" as const, globalRevision: "rev 2.4",
  daysToSOP: 84, plannedAnnualVolume: 48000, pilotVinsBuilt: 247,
  activeECNs: 5, openFieldEvents: 4, lastUpdated: "47 min ago", lastUpdatedBy: "Ravi Kumar",
};
export const products = programs.map(pg => ({
  id: pg.id, name: pg.name, modelYear: pg.modelYear, stage: pg.stage, category: pg.category,
}));
export const product = { name: program.name, version: program.modelYear, stage: program.stage, lastUpdated: program.lastUpdated, lastUpdatedBy: "Ravi Kumar", daysToSOP: program.daysToSOP, vinsProduced: program.pilotVinsBuilt, activeECNs: program.activeECNs };

// ─────────────── COMPLIANCE (global) ─────────────────────────────────────────
export const complianceFrameworks: ComplianceFramework[] = [
  { id:"UNECE-R155", name:"UNECE R155 · CSMS",             scope:"Cybersecurity management",   score:88, status:"compliant", controls:47,  passing:41,  nextAuditDate:"2026-06-14" },
  { id:"UNECE-R156", name:"UNECE R156 · SUMS",             scope:"Software update management", score:92, status:"compliant", controls:32,  passing:30,  nextAuditDate:"2026-06-14" },
  { id:"ISO-26262",  name:"ISO 26262 · Functional Safety", scope:"E/E safety lifecycle",        score:94, status:"compliant", controls:122, passing:115, nextAuditDate:"2026-07-22" },
  { id:"IATF-16949", name:"IATF 16949",                    scope:"Automotive QMS",              score:91, status:"compliant", controls:78,  passing:71,  nextAuditDate:"2026-11-12" },
  { id:"EU-BATT",    name:"EU Battery Regulation",         scope:"Battery passport & carbon",   score:76, status:"warning",   controls:64,  passing:49,  nextAuditDate:"2026-08-18" },
  { id:"FMVSS",      name:"FMVSS / Homologation (NA)",     scope:"NHTSA safety standards",      score:89, status:"compliant", controls:86,  passing:77,  nextAuditDate:"2026-06-05" },
  { id:"DPP",        name:"Digital Product Passport",      scope:"Traceability disclosure",     score:64, status:"warning",   controls:58,  passing:37,  nextAuditDate:"2026-09-30" },
];

export const notifications = [
  { id:1, type:"cve",         title:"LiDAR CVE · Nova EV",          desc:"Remote code exec in LiDAR stack · ECN-5002 opened",  time:"4h ago" },
  { id:2, type:"cve",         title:"Log4j CVE · Meridian IHU",     desc:"log4j-core 2.14.0 · 3,420 VINs · ECN-2244 approved", time:"6h ago" },
  { id:3, type:"drift",       title:"MBOM drift · Meridian",        desc:"MBOM 3 days behind EBOM rev 2.4",                    time:"2h ago" },
  { id:4, type:"approval",    title:"ECN-2241 awaits CCB",          desc:"Battery cell tab · EV variants",                     time:"5h ago" },
  { id:5, type:"warranty",    title:"Field cluster · Meridian",     desc:"Power liftgate · 14 pilot VINs",                     time:"1d ago" },
];

export const supplierRiskHeatmap = [
  { region:"North America", Financial:1, Geopolitical:0, "Single-Source":2, Quality:1, Delivery:2 },
  { region:"Europe",        Financial:2, Geopolitical:1, "Single-Source":3, Quality:1, Delivery:1 },
  { region:"East Asia",     Financial:1, Geopolitical:4, "Single-Source":5, Quality:2, Delivery:3 },
  { region:"South Asia",    Financial:0, Geopolitical:1, "Single-Source":2, Quality:1, Delivery:2 },
  { region:"Other",         Financial:0, Geopolitical:0, "Single-Source":1, Quality:0, Delivery:1 },
];
export const cveHeatmap = supplierRiskHeatmap.map(r => ({ ...r, service: r.region }));

export const cveTimeline = [
  { week: "Wk 1", critical: 1, high: 2, medium: 4, low: 2 },
  { week: "Wk 2", critical: 0, high: 1, medium: 3, low: 3 },
  { week: "Wk 3", critical: 2, high: 3, medium: 5, low: 1 },
  { week: "Wk 4", critical: 1, high: 2, medium: 2, low: 4 },
  { week: "Wk 5", critical: 3, high: 4, medium: 6, low: 2 },
  { week: "Wk 6", critical: 1, high: 1, medium: 3, low: 3 },
];

export const revisions: RevisionLogEntry[] = [
  { partNumber:"BAT-PCK-8500", revision:"A",       date:"2024-08-12", by:"Ravi Kumar",   note:"Initial release" },
  { partNumber:"BAT-PCK-8500", revision:"D",       date:"2025-04-22", by:"Battery WG",   note:"Thermal interface revised post-hot-test" },
  { partNumber:"BDY-LFT-7701", revision:"C",       date:"2026-02-08", by:"Body WG",      note:"Spring rate reduced" },
  { partNumber:"BDY-LFT-7701", revision:"D",       date:"2026-04-15", by:"Ravi Kumar",   ecnId:"ECN-2242", note:"Bracket reinforcement" },
  { partNumber:"ELE-IHU-4400", revision:"fw 12.4.2",date:"2026-02-20",by:"Harman",       note:"Stability & CarPlay 5.2" },
  { partNumber:"ELE-IHU-4400", revision:"fw 12.5.0",date:"2026-04-21",by:"Ravi Kumar",   ecnId:"ECN-2244", note:"Log4j remediation" },
];

export const drift = [
  { stage:"EBOM", date:"Apr 22", offset:96 },
  { stage:"MBOM", date:"Apr 19", offset:72 },
  { stage:"Service", date:"Apr 16", offset:88 },
];

// ──────────────────────── HELPERS ────────────────────────────────────────────

const partIndex = new Map<string, Part>(parts.map(pt => [pt.partNumber, pt]));

export const getPart = (pn: string) => partIndex.get(pn);

export const getChildren = (pn: string, variantCode?: string): BomEdge[] =>
  bomEdges.filter(e =>
    e.parentPN === pn &&
    (!variantCode || !e.effectivity || e.effectivity.includes(variantCode))
  );

export const getWhereUsed = (pn: string): BomEdge[] =>
  bomEdges.filter(e => e.childPN === pn);

export type EbomNode = {
  id: string; name: string; type: PartType; partNumber: string;
  version?: string; revision?: string; owner?: string; status?: Lifecycle;
  health?: Health; cves?: number; warnings?: number;
  supplier?: string; supplierId?: string; cost?: number; qty?: number;
  children?: EbomNode[];
};

const supplierName = (id?: string) => (id ? suppliers.find(s => s.id === id)?.name : undefined);

export function buildEbomTree(rootPN = "MER-VEH-0001", variantCode?: string): EbomNode {
  const walk = (pn: string, qty = 1): EbomNode => {
    const part = partIndex.get(pn);
    const kids = getChildren(pn, variantCode).map(e => walk(e.childPN, e.qty));
    return {
      id: pn, name: part?.name ?? pn, type: part?.type ?? "Part", partNumber: pn,
      version: part?.revision ? (part.type === "ECU" ? part.revision : `rev ${part.revision}`) : undefined,
      revision: part?.revision, owner: part?.owner, status: part?.lifecycle,
      health: part?.health, cves: part?.cves, warnings: part?.warnings,
      supplier: supplierName(part?.supplierId), supplierId: part?.supplierId,
      cost: part?.cost, qty, children: kids.length ? kids : undefined,
    };
  };
  return walk(rootPN);
}

export const ebomTree: EbomNode = buildEbomTree();

export const totals = {
  parts: parts.length,
  ebomParts: parts.filter(pt => pt.type !== "Vehicle" && pt.type !== "System").length,
  uniqueAssemblies: parts.filter(pt => pt.type === "Assembly" || pt.type === "Sub-Assembly").length,
  ecus: parts.filter(pt => pt.type === "ECU").length,
  serviceableParts: parts.filter(pt => pt.serviceable).length,
  frus: parts.filter(pt => pt.fru).length,
  suppliers: suppliers.length,
  singleSource: suppliers.filter(s => s.singleSource).length,
  variants: variants.length,
  plants: plants.length,
  mbomOps: mbomOps.length,
  serviceKits: serviceKits.length,
  softwareComponents: softwareComponents.length,
  openCves: softwareComponents.reduce((s, c) => s + c.cves.length, 0),
  criticalCves: softwareComponents.reduce((s, c) => s + c.cves.filter(v => v.severity === "Critical").length, 0),
  activeEcns: ecns.filter(e => e.state !== "Released" && e.state !== "Rejected" && e.state !== "Cancelled").length,
  approvedEcns: ecns.filter(e => e.state === "Approved").length,
  releasedEcns: ecns.filter(e => e.state === "Released").length,
  openFieldEvents: fieldEvents.filter(f => f.status === "Open" || f.status === "Investigating").length,
  complianceAvg: Math.round(complianceFrameworks.reduce((s, f) => s + f.score, 0) / complianceFrameworks.length),
};

export const pipeline = [
  { id:"cat",     name:"CAT BOM",  components: totals.variants,           issues: variants.reduce((s,v)=>s+v.conflicts,0),       health:"healthy" as Health, drift:null,              countLabel:"variants"  },
  { id:"ebom",    name:"EBOM",     components: totals.ebomParts,          issues: parts.filter(pt=>pt.warnings).length,           health:"healthy" as Health, drift:null,              countLabel:"parts"     },
  { id:"mbom",    name:"MBOM",     components: totals.mbomOps,            issues: mbomOps.filter(o=>o.status!=="ready").length,   health:"warning" as Health, drift:"3d behind EBOM",  countLabel:"ops"       },
  { id:"sbom",    name:"Software", components: totals.softwareComponents, issues: totals.openCves,                                health:"critical" as Health,drift:`${totals.criticalCves} critical CVEs`,countLabel:"packages" },
  { id:"service", name:"Service",  components: totals.serviceKits,        issues: 0,                                              health:"healthy" as Health, drift:null,              countLabel:"kits"      },
];

const merSysRoots = [
  { key:"PWT-SYS-0001", label:"Powertrain",        color:"hsl(var(--primary))" },
  { key:"BAT-SYS-0001", label:"Battery & HV",      color:"hsl(var(--accent))"  },
  { key:"CHS-SYS-0001", label:"Chassis",           color:"hsl(152 76% 45%)"    },
  { key:"BDY-SYS-0001", label:"Body & Closures",   color:"hsl(190 95% 55%)"    },
  { key:"INT-SYS-0001", label:"Interior & HVAC",   color:"hsl(38 92% 55%)"     },
  { key:"ELE-SYS-0001", label:"Electrical & ADAS", color:"hsl(280 80% 65%)"    },
];

const countUnder = (rootPN: string): number => {
  const seen = new Set<string>();
  const walk = (pn: string) => { if(seen.has(pn))return; seen.add(pn); getChildren(pn).forEach(e=>walk(e.childPN)); };
  walk(rootPN); seen.delete(rootPN); return seen.size;
};

export const distribution = merSysRoots.map(s => ({ name: s.label, value: countUnder(s.key), color: s.color }));

export const healthScores = {
  ebom:       { score:86, components:totals.ebomParts,    warnings:parts.filter(pt=>pt.warnings).length, lastUpdate:"2h ago" },
  mbom:       { score:74, artifacts:totals.mbomOps,       steps:mbomOps.filter(o=>o.status!=="ready").length, lastGen:"1d ago" },
  sbom:       { score:62, cves:totals.openCves,           critical:totals.criticalCves, license:94 },
  supply:     { score:71, single:totals.singleSource,     watchlist:suppliers.filter(s=>s.geoRisk==="High"||s.financialRating==="B"||s.financialRating==="C").length, leadStress:"Med" },
  compliance: { score:totals.complianceAvg, regs:complianceFrameworks.length, gaps:complianceFrameworks.filter(f=>f.status!=="compliant").length, deadline:"Jun 14" },
  service:    { score:91, kits:totals.serviceKits, frus:totals.frus },
};

// Legacy aliases
export const catVariants = variants.map(v => ({ code:v.code, powertrain:v.powertrain, trim:v.trim, market:v.market, units:v.unitsPlanned, conflicts:v.conflicts }));
export const mbomArtifacts = mbomOps.map(o => ({ id:o.id, name:`${o.partNumber} · ${o.operation}`, type:"Station Op", size:`${plants.find(pl=>pl.id===o.plantId)?.name} · ${o.station}`, build:o.workInstructionId??"", deploy:o.line, status:o.status }));
export const sbomComponents = softwareComponents.map(c => ({ name:c.name, version:c.version, license:c.license, cves:c.cves.length, severity:c.cves.length?c.cves[0].severity:"—", service:getPart(c.runsOnECU)?.name??c.runsOnECU }));
export const ecuInventory = parts.filter(pt=>pt.type==="ECU").map(e => ({ name:e.name, supplier:supplierName(e.supplierId)??"", fw:e.revision, target:null, cves:e.cves??0, status:(e.cves??0)>0?"Update Pending":"In Sync", zone:e.partNumber.startsWith("ELE-")?"center":(e.partNumber.startsWith("BAT-")||e.partNumber.startsWith("NOV-BAT"))?"rear":"front" }));
export const lineageEvents = revisions.filter(r=>r.partNumber==="BAT-PCK-8500").map(r => ({ v:`rev ${r.revision}`, date:r.date, note:r.note, by:r.by }));
export const mbomConsumables = [
  { code:"CON-THR-0001", name:"Thread-locker (Loctite 243) 50ml",  uom:"ml",  qtyPerVehicle:22,  supplier:"Henkel"    },
  { code:"CON-OIL-0001", name:"Engine Oil 5W-30 (ICE/Hybrid)",     uom:"l",   qtyPerVehicle:4.5, supplier:"Castrol"   },
  { code:"CON-COO-0001", name:"Battery Coolant (ethylene glycol)", uom:"l",   qtyPerVehicle:9,   supplier:"Valvoline" },
  { code:"CON-REF-0001", name:"AC Refrigerant R-1234yf",           uom:"kg",  qtyPerVehicle:0.7, supplier:"Honeywell" },
  { code:"CON-ADH-0001", name:"Windshield PU Adhesive",            uom:"ml",  qtyPerVehicle:120, supplier:"Dow"       },
];

export const SERVICE_LABOR_RATE_USD_PER_HOUR = 95;
const defaultLaborByType: Record<PartType, number> = {
  Vehicle:0, System:0, Assembly:2.5, "Sub-Assembly":3.0, Part:1.0,
  ECU:1.0, Harness:6.0, Fastener:0.1, Consumable:0.25, Software:0.5,
};
export const laborHoursForPart = (pn: string): number => {
  const part = getPart(pn); if(!part)return 1; return defaultLaborByType[part.type]??1;
};
export type KitCosts = { partsSubtotal:number; laborCost:number; serviceCost:number; diySavings:number; itemBreakdown:{partNumber:string;qty:number;unitCost:number;lineTotal:number;name:string}[] };
export const computeKitCosts = (kit: ServiceKit): KitCosts => {
  const itemBreakdown = kit.items.map(it => { const part=getPart(it.partNumber); const unitCost=part?.cost??0; return { partNumber:it.partNumber, qty:it.qty, unitCost, lineTotal:unitCost*it.qty, name:part?.name??it.partNumber }; });
  const partsSubtotal = itemBreakdown.reduce((s,i)=>s+i.lineTotal,0);
  const laborCost = Math.round(kit.laborHours*SERVICE_LABOR_RATE_USD_PER_HOUR);
  return { partsSubtotal, laborCost, serviceCost:partsSubtotal+laborCost, diySavings:laborCost, itemBreakdown };
};
export type PartServiceCost = { replacementCost:number; laborHours:number; laborCost:number; serviceCost:number };
export const computePartServiceCost = (pn: string): PartServiceCost => {
  const part = getPart(pn); const replacementCost=part?.cost??0;
  const lh = laborHoursForPart(pn); const laborCost=Math.round(lh*SERVICE_LABOR_RATE_USD_PER_HOUR);
  return { replacementCost, laborHours:lh, laborCost, serviceCost:replacementCost+laborCost };
};

// Sankey kept for legacy imports — now uses Meridian data
export const sankeyNodes = [
  { name:"Petrol 2.0T",   group:"cat"     as const },
  { name:"Hybrid 1.5",    group:"cat"     as const },
  { name:"EV 85 kWh",     group:"cat"     as const },
  { name:"Powertrain",    group:"ebom"    as const },
  { name:"Battery & HV",  group:"ebom"    as const },
  { name:"Chassis",       group:"ebom"    as const },
  { name:"Body",          group:"ebom"    as const },
  { name:"Pune",          group:"mbom"    as const },
  { name:"Detroit",       group:"mbom"    as const },
  { name:"Routine svc",   group:"service" as const },
  { name:"Wear/Major",    group:"service" as const },
  { name:"Recall svc",    group:"service" as const },
];
export const sankeyLinks = [
  {source:0,target:3,value:14},{source:0,target:5,value:8},{source:1,target:3,value:10},{source:1,target:6,value:6},
  {source:2,target:4,value:18},{source:2,target:6,value:12},{source:3,target:7,value:16},{source:3,target:8,value:12},
  {source:4,target:7,value:10},{source:4,target:8,value:8},{source:5,target:7,value:9},{source:5,target:8,value:5},
  {source:6,target:7,value:11},{source:6,target:8,value:7},{source:7,target:9,value:20},{source:7,target:10,value:12},
  {source:7,target:11,value:4},{source:8,target:9,value:14},{source:8,target:10,value:8},{source:8,target:11,value:3},
];
