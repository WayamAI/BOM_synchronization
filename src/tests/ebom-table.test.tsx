import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgramProvider } from "@/context/ProgramContext";
import EbomManager from "../../app/(app)/ebom/page";

const renderEbom = () => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <ProgramProvider>
          <EbomManager />
        </ProgramProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const switchToTableView = () => {
  const tableTab = screen.getByRole("tab", { name: /Table View/i });
  fireEvent.pointerDown(tableTab);
  fireEvent.click(tableTab);
  fireEvent.keyDown(tableTab, { key: "Enter" });
};

describe("EBOM Page Table Migration (Phase 6)", () => {
  beforeEach(() => {
    window.localStorage.setItem("wayam_auth", "1");
  });

  it("switches to table view and renders EnterpriseTable with headers and rows", () => {
    renderEbom();
    switchToTableView();

    // Check table headers
    expect(screen.getByRole("columnheader", { name: /Part Number/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Name/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Type/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Rev/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Qty/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Cost/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Supplier/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /Lifecycle/i })).toBeDefined();

    // Check rows exist
    expect(screen.getByText("BAT-PCK-8500")).toBeDefined();
    expect(screen.getByText("HV Battery Pack 85 kWh")).toBeDefined();
  });

  it("allows sorting on Part Number and Cost columns", () => {
    renderEbom();
    switchToTableView();

    const sortPartBtn = screen.getByRole("button", { name: "Sort by Part Number", hidden: true });
    const sortCostBtn = screen.getByRole("button", { name: "Sort by Cost", hidden: true });

    // Initial aria-sort is none
    const partTh = sortPartBtn.closest("th");
    expect(partTh?.getAttribute("aria-sort")).toBe("none");

    // Click to sort by Part Number asc
    fireEvent.click(sortPartBtn);
    expect(partTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click to sort by Part Number desc
    fireEvent.click(sortPartBtn);
    expect(partTh?.getAttribute("aria-sort")).toBe("descending");

    // Click to sort by Cost asc
    fireEvent.click(sortCostBtn);
    const costTh = sortCostBtn.closest("th");
    expect(costTh?.getAttribute("aria-sort")).toBe("ascending");
  });

  it("clicking an EBOM row opens the SidePanel inspector drawer", () => {
    renderEbom();
    switchToTableView();

    // Find the cell in the table and click it
    const cells = screen.getAllByText("HV Battery Pack 85 kWh");
    // Click the last cell (which belongs to the table)
    fireEvent.click(cells[cells.length - 1]!);

    // Inspector side panel should now be visible
    expect(screen.getByText("Dependency depth")).toBeDefined();
    expect(screen.getByText("Child components")).toBeDefined();
    expect(screen.getByRole("button", { name: "Overview" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Where-Used" })).toBeDefined();
  });

  it("filters EBOM rows based on search input", () => {
    renderEbom();
    switchToTableView();

    const searchInput = screen.getByPlaceholderText("Search EBOM by name or PN…");
    fireEvent.change(searchInput, { target: { value: "BAT-PCK-8500" } });

    // Should show Battery Pack
    expect(screen.getByText("BAT-PCK-8500")).toBeDefined();
    expect(screen.queryByText("INV-SIC-400V")).toBeNull();
  });
});
