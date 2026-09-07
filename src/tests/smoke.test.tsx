import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "../../app/(app)/page";
import Variants from "../../app/(app)/variants/page";
import EbomManager from "../../app/(app)/ebom/page";
import MbomManager from "../../app/(app)/mbom/page";
import ServiceBom from "../../app/(app)/service/page";
import SoftwareBom from "../../app/(app)/software/page";
import Changes from "../../app/(app)/changes/page";
import BomCompare from "../../app/(app)/compare/page";
import PartMaster from "../../app/(app)/parts/page";
import SupplierIntel from "../../app/(app)/suppliers/page";
import FieldQuality from "../../app/(app)/field/page";
import Reports from "../../app/(app)/reports/page";

const renderPage = (comp: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <AppShell>{comp}</AppShell>
      </TooltipProvider>
    </ThemeProvider>
  );
};

describe("smoke", () => {
  beforeEach(() => {
    window.localStorage.setItem("wayam_auth", "1");
  });

  const pages: [string, React.ReactElement][] = [
    ["/",                    <Dashboard />],
    ["/variants",            <Variants />],
    ["/ebom",                <EbomManager />],
    ["/mbom",                <MbomManager />],
    ["/service",             <ServiceBom />],
    ["/software",            <SoftwareBom />],
    ["/changes",             <Changes />],
    ["/changes/ECN-2241",    <Changes />],
    ["/compare",             <BomCompare />],
    ["/parts",               <PartMaster />],
    ["/parts/BAT-PCK-8500",  <PartMaster />],
    ["/suppliers",           <SupplierIntel />],
    ["/field",               <FieldQuality />],
    ["/reports",             <Reports />],
  ];

  for (const [path, comp] of pages) {
    it(`renders ${path}`, () => {
      expect(() => renderPage(comp)).not.toThrow();
    });
  }
});
