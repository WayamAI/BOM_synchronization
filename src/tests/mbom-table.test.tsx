import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgramProvider } from "@/context/ProgramContext";
import MbomManager from "../../app/(app)/mbom/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

const renderMbom = () => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <ProgramProvider>
          <MbomManager />
        </ProgramProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

describe("MBOM Page Table Migration (Phase 6 Step 2)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.localStorage.setItem("wayam_auth", "1");
  });

  it("renders EnterpriseTable with all 9 MBOM headers and data rows", () => {
    renderMbom();

    // Headers
    expect(screen.getByRole("columnheader", { name: /Op ID/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Produces/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Operation/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Plant/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Line/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Station/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Takt/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Work Instr\./i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Status/i })).toBeDefined();

    // Data rows
    expect(screen.getByText("OP-001")).toBeDefined();
    expect(screen.getByText("OP-002")).toBeDefined();
  });

  it("supports client-side sorting on Op ID and Takt numeric column", () => {
    renderMbom();

    const sortOpBtn = screen.getByRole("button", { name: "Sort by Op ID" });
    const sortTaktBtn = screen.getByRole("button", { name: "Sort by Takt" });

    // Initial aria-sort is none
    const opTh = sortOpBtn.closest("th");
    expect(opTh?.getAttribute("aria-sort")).toBe("none");

    // Click to sort by Op ID ascending
    fireEvent.click(sortOpBtn);
    expect(opTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click to sort by Op ID descending
    fireEvent.click(sortOpBtn);
    expect(opTh?.getAttribute("aria-sort")).toBe("descending");

    // Click to sort by Takt ascending
    fireEvent.click(sortTaktBtn);
    const taktTh = sortTaktBtn.closest("th");
    expect(taktTh?.getAttribute("aria-sort")).toBe("ascending");
  });

  it("clicking a part in Produces navigates to /parts/[pn]", () => {
    renderMbom();

    // Find the first part button in Produces column
    const producesButtons = screen.getAllByRole("button").filter(
      b => b.textContent?.includes("BAT-PCK-8500") || b.textContent?.includes("PWT-ENG-2001")
    );

    expect(producesButtons.length).toBeGreaterThan(0);
    fireEvent.click(producesButtons[0]!);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush.mock.calls[0]![0]).toMatch(/^\/parts\//);
  });

  it("filters routing operations based on search input", () => {
    renderMbom();

    const searchInput = screen.getByPlaceholderText("Search routing by PN, station, operation…");
    fireEvent.change(searchInput, { target: { value: "PWT-ENG-2001" } });

    // Operations for PWT-ENG-2001 should be present, other parts should not
    expect(screen.getAllByText("PWT-ENG-2001").length).toBeGreaterThan(0);
    expect(screen.queryByText("BAT-PCK-8500")).toBeNull();
  });

  it("shows empty state message when search matches no routing operations", () => {
    renderMbom();

    const searchInput = screen.getByPlaceholderText("Search routing by PN, station, operation…");
    fireEvent.change(searchInput, { target: { value: "NON_EXISTENT_OP_XYZ" } });

    expect(
      screen.getByText("No routing operations match the active plant or status filter.")
    ).toBeDefined();
  });
});
