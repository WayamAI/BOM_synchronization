import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgramProvider } from "@/context/ProgramContext";
import Dashboard from "../../app/(app)/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

const renderDashboard = () => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <ProgramProvider>
          <Dashboard />
        </ProgramProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

describe("AI Briefing, Security Hub, and Live Quality Stream Modernization (Phase 7 Step 7)", { timeout: 15000 }, () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.localStorage.setItem("wayam_auth", "1");
  });

  describe("AI Assistant · Briefing", () => {
    it("renders AI Briefing header, eyebrow, and insights count badge", () => {
      renderDashboard();

      expect(screen.getByText("Intelligence")).toBeDefined();
      expect(screen.getByRole("heading", { name: /AI Assistant · Briefing/i })).toBeDefined();
      expect(screen.getByText(/insights/i)).toBeDefined();
    });

    it("renders existing briefing items and critical impact metadata", () => {
      renderDashboard();

      // Meridian SUV briefing text
      expect(screen.getByText(/ECN-2241 \(battery cell tab, EV\) blocks 2 supplier requotes/i)).toBeDefined();
      expect(screen.getByText(/CRITICAL IMPACT · \$1.4M tooling at risk/i)).toBeDefined();
      expect(screen.getByText(/Critical CVE on Infotainment IHU affects 3,420 pilot VINs/i)).toBeDefined();
      expect(screen.getByText(/CRITICAL IMPACT · UNECE R155 exposure/i)).toBeDefined();
    });

    it("renders Actionable Insight quote for active program first ECN", () => {
      renderDashboard();

      expect(screen.getByText("Actionable Insight")).toBeDefined();
      expect(screen.getByText(/"Battery cell tab geometry update \(EV\) \(ECN-2241\) — prioritize resolution before next gate\."/i)).toBeDefined();
    });

    it("preserves non-functional Explore AI Strategy button with accessible label", () => {
      renderDashboard();

      const aiBtn = screen.getByRole("button", { name: /Explore AI Strategy/i });
      expect(aiBtn).toBeDefined();
      fireEvent.click(aiBtn);
      // Confirmed dead action was not turned into a fake action
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("switching program updates AI Briefing content reactively", () => {
      renderDashboard();

      // Switch to Nova EV
      const novaBtn = screen.getByRole("button", { name: /Nova EV/i });
      fireEvent.click(novaBtn);

      expect(screen.getByText(/LiDAR false-positive braking is a Level 3 safety regression/i)).toBeDefined();
      expect(screen.getByText(/CRITICAL IMPACT · L3 homologation at risk/i)).toBeDefined();
    });
  });

  describe("Security Hub", () => {
    it("renders Security Hub with eyebrow, header, and 5-point SOC integrity indicator", () => {
      renderDashboard();

      expect(screen.getByText("Cybersecurity")).toBeDefined();
      expect(screen.getByRole("heading", { name: /Security Hub/i })).toBeDefined();

      const socStatus = screen.getByRole("status", { name: /SOC Status: Normal/i });
      expect(socStatus).toBeDefined();
    });

    it("renders accurate security copy with hours and status indicator", () => {
      renderDashboard();

      expect(screen.getByText(/No active cybersecurity threats detected in the last/i)).toBeDefined();
      expect(screen.getByText("240 hours")).toBeDefined();
      expect(screen.getAllByText("Normal").length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Live Quality Stream", () => {
    it("renders Live Quality Stream header, eyebrow, and events count", () => {
      renderDashboard();

      expect(screen.getByText("Field Intelligence")).toBeDefined();
      expect(screen.getByRole("heading", { name: /Live Quality Stream · Meridian SUV/i })).toBeDefined();
      expect(screen.getByText(/events/i)).toBeDefined();
    });

    it("renders existing field event items with severity, ageHours, title, and variant", () => {
      renderDashboard();

      // Meridian SUV field events
      expect(screen.getByText("Warranty cluster · Power liftgate actuator")).toBeDefined();
      expect(screen.getByText("2h ago")).toBeDefined();
      expect(screen.getByText("Premium / Signature")).toBeDefined();
      expect(screen.getByText("14 VINs")).toBeDefined();

      expect(screen.getByText("Critical CVE · Infotainment IHU")).toBeDefined();
      expect(screen.getByText("6h ago")).toBeDefined();
      expect(screen.getByText("3420 VINs")).toBeDefined();
    });

    it("clicking Expand Stream navigates to /field", () => {
      renderDashboard();

      const expandBtn = screen.getByRole("button", { name: /Expand stream in field events view/i });
      fireEvent.click(expandBtn);

      expect(mockPush).toHaveBeenCalledWith("/field");
    });

    it("switching program updates Live Quality Stream reactively", () => {
      renderDashboard();

      // Switch to Titan Truck
      const titanBtn = screen.getByRole("button", { name: /Titan Truck/i });
      fireEvent.click(titanBtn);

      expect(screen.getByRole("heading", { name: /Live Quality Stream · Titan Truck/i })).toBeDefined();
      expect(screen.getByText("Diesel cold-start smoke excess at -20°C")).toBeDefined();
      expect(screen.getByText("24h ago")).toBeDefined();
      expect(screen.getByText("Diesel Base NA")).toBeDefined();
    });
  });
});
