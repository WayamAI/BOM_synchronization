import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgramProvider } from "@/context/ProgramContext";
import { SystemHealthMatrix } from "@/components/dashboard/SystemHealthMatrix";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

const renderMatrix = () => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <ProgramProvider>
          <SystemHealthMatrix />
        </ProgramProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

describe("System Health Matrix Modernization (Phase 7 Step 4)", { timeout: 15000 }, () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.localStorage.setItem("wayam_auth", "1");
  });

  it("renders the matrix header, description, and governed status legend", () => {
    renderMatrix();

    expect(screen.getByText("System Health Matrix")).toBeDefined();
    expect(
      screen.getByText("Cross-discipline readiness across design, manufacturing, supply, and cybersecurity.")
    ).toBeDefined();

    // Governed status legend
    expect(screen.getByText("Healthy ≥85")).toBeDefined();
    expect(screen.getByText("Watch 65–84")).toBeDefined();
    expect(screen.getByText("Risk <65")).toBeDefined();
  });

  it("does not use stretching h-full or vertical justify-between on container", () => {
    const { container } = renderMatrix();
    const root = container.querySelector(".rounded-lg") as HTMLElement;
    expect(root).toBeDefined();
    expect(root.className).not.toContain("h-full");
    expect(root.className).not.toContain("justify-between");
    expect(root.className).toContain("flex-col");
    expect(root.className).toContain("gap-3");
  });

  it("renders headline rollup summary tiles for Systems, Parts, and 4 dimensions", () => {
    renderMatrix();

    // Rollup labels
    expect(screen.getByText("Systems")).toBeDefined();
    expect(screen.getAllByText("Parts").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Design").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Manufacturing").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Supply").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Cyber").length).toBeGreaterThanOrEqual(1);
  });

  it("renders diagnostic rows for active program subsystems with accessible navigation affordances", () => {
    renderMatrix();

    // Meridian SUV subsystems include Powertrain, Battery, Chassis, Body, Interior, Electrical
    const sysButtons = screen.getAllByRole("button", { name: /system part master/i });
    expect(sysButtons.length).toBeGreaterThanOrEqual(4);

    // Clicking first subsystem button navigates to /parts/[pn]
    fireEvent.click(sysButtons[0]);
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\/parts\//));
  });

  it("dimension metric cell buttons navigate to respective domain pages", () => {
    renderMatrix();

    // Design cell -> /ebom
    const designButtons = screen.getAllByRole("button", { name: /Design readiness:/i });
    expect(designButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(designButtons[0]);
    expect(mockPush).toHaveBeenCalledWith("/ebom");

    // Manufacturing cell -> /mbom
    mockPush.mockClear();
    const mfgButtons = screen.getAllByRole("button", { name: /Manufacturing readiness:/i });
    expect(mfgButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(mfgButtons[0]);
    expect(mockPush).toHaveBeenCalledWith("/mbom");

    // Supply cell -> /suppliers
    mockPush.mockClear();
    const supplyButtons = screen.getAllByRole("button", { name: /Supply readiness:/i });
    expect(supplyButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(supplyButtons[0]);
    expect(mockPush).toHaveBeenCalledWith("/suppliers");

    // Cyber cell -> /software
    mockPush.mockClear();
    const cyberButtons = screen.getAllByRole("button", { name: /Cyber readiness:/i });
    expect(cyberButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(cyberButtons[0]);
    expect(mockPush).toHaveBeenCalledWith("/software");
  });

  it("open ECN buttons navigate to /changes", () => {
    renderMatrix();

    const ecnButtons = screen.queryAllByRole("button", { name: /open ECNs affecting/i });
    if (ecnButtons.length > 0) {
      fireEvent.click(ecnButtons[0]);
      expect(mockPush).toHaveBeenCalledWith("/changes");
    }
  });
});
