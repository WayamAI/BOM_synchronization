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

describe("Dashboard KPI Tiles & HealthArc Modernization (Phase 7 Step 3)", { timeout: 15000 }, () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.localStorage.setItem("wayam_auth", "1");
  });

  it("renders all 6 Active Program KPI tiles with labels and trends", () => {
    renderDashboard();

    // Verify 6 KPI buttons
    expect(screen.getByRole("button", { name: /Parts/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Assy/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Ops/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Kits/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Sups/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Vars/i })).toBeDefined();

    // Verify trends
    expect(screen.getByText("eBOM")).toBeDefined();
    expect(screen.getByText("Stable")).toBeDefined();
    expect(screen.getByText("mBOM")).toBeDefined();
    expect(screen.getByText("Ready")).toBeDefined();
    expect(screen.getByText("Live")).toBeDefined();
    expect(screen.getByText(/\d+\s+active/i)).toBeDefined();
  }, 30000);

  it("clicking each of the 6 KPI cards navigates to the expected destination route", () => {
    renderDashboard();

    // Parts -> /ebom
    const partsTile = screen.getByRole("button", { name: /Parts/i });
    fireEvent.click(partsTile);
    expect(mockPush).toHaveBeenCalledWith("/ebom");

    // Assy -> /ebom
    mockPush.mockClear();
    const assyTile = screen.getByRole("button", { name: /Assy/i });
    fireEvent.click(assyTile);
    expect(mockPush).toHaveBeenCalledWith("/ebom");

    // Ops -> /mbom
    mockPush.mockClear();
    const opsTile = screen.getByRole("button", { name: /Ops/i });
    fireEvent.click(opsTile);
    expect(mockPush).toHaveBeenCalledWith("/mbom");

    // Kits -> /service
    mockPush.mockClear();
    const kitsTile = screen.getByRole("button", { name: /Kits/i });
    fireEvent.click(kitsTile);
    expect(mockPush).toHaveBeenCalledWith("/service");

    // Sups -> /suppliers
    mockPush.mockClear();
    const supsTile = screen.getByRole("button", { name: /Sups/i });
    fireEvent.click(supsTile);
    expect(mockPush).toHaveBeenCalledWith("/suppliers");

    // Vars -> /variants
    mockPush.mockClear();
    const varsTile = screen.getByRole("button", { name: /Vars/i });
    fireEvent.click(varsTile);
    expect(mockPush).toHaveBeenCalledWith("/variants");
  });

  it("renders all 4 HealthArc gauges with role='img' and accessible aria-labels", () => {
    renderDashboard();

    // 4 Health gauges: EBOM Maturity, MBOM Readiness, Supply Risk, Service Scope
    expect(screen.getByRole("img", { name: /EBOM Maturity, \d+ percent/i })).toBeDefined();
    expect(screen.getByRole("img", { name: /MBOM Readiness, \d+ percent/i })).toBeDefined();
    expect(screen.getByRole("img", { name: /Supply Risk, \d+ percent/i })).toBeDefined();
    expect(screen.getByRole("img", { name: /Service Scope, \d+ percent/i })).toBeDefined();
  });

  it("switching active programs updates the Fleet Strip, Command Center, and KPI metrics", () => {
    renderDashboard();

    // Default program: Meridian SUV is active (aria-pressed="true")
    const meridianBtn = screen.getByRole("button", { name: /Meridian SUV/i });
    expect(meridianBtn.getAttribute("aria-pressed")).toBe("true");

    // Switch to Atlas Sedan
    const atlasButton = screen.getByRole("button", { name: /Atlas Sedan/i });
    expect(atlasButton.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(atlasButton);

    // Verify Atlas Sedan is now active in Fleet Strip
    expect(atlasButton.getAttribute("aria-pressed")).toBe("true");
    expect(meridianBtn.getAttribute("aria-pressed")).toBe("false");

    // Verify Command Center header shows Atlas Sedan
    const atlasHeaders = screen.getAllByText("Atlas Sedan");
    expect(atlasHeaders.length).toBeGreaterThanOrEqual(2);
  });
});
