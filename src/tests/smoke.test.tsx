import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import EbomManager from "@/pages/EbomManager";
import MbomManager from "@/pages/MbomManager";
import ServiceBom from "@/pages/ServiceBom";
import SoftwareBom from "@/pages/SoftwareBom";
import Variants from "@/pages/Variants";
import Changes from "@/pages/Changes";
import BomCompare from "@/pages/BomCompare";
import PartMaster from "@/pages/PartMaster";
import SupplierIntel from "@/pages/SupplierIntel";
import FieldQuality from "@/pages/FieldQuality";
import Reports from "@/pages/Reports";

const renderAt = (path: string) => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/variants" element={<Variants />} />
              <Route path="/ebom" element={<EbomManager />} />
              <Route path="/mbom" element={<MbomManager />} />
              <Route path="/service" element={<ServiceBom />} />
              <Route path="/software" element={<SoftwareBom />} />
              <Route path="/changes" element={<Changes />} />
              <Route path="/changes/:id" element={<Changes />} />
              <Route path="/compare" element={<BomCompare />} />
              <Route path="/parts" element={<PartMaster />} />
              <Route path="/parts/:pn" element={<PartMaster />} />
              <Route path="/suppliers" element={<SupplierIntel />} />
              <Route path="/field" element={<FieldQuality />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Routes>
        </MemoryRouter>
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
  for (const [path] of pages) {
    it(`renders ${path}`, () => {
      expect(() => renderAt(path)).not.toThrow();
    });
  }
});
