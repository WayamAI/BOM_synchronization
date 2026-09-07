import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgramProvider } from "@/context/ProgramContext";
import BomComparePage from "../../app/(app)/compare/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

const renderCompare = () => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <ProgramProvider>
          <BomComparePage />
        </ProgramProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

describe("Compare Page Table Migration (Phase 6 Step 5)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.localStorage.setItem("wayam_auth", "1");
  });

  it("renders Compare page in variants mode by default with selector controls", () => {
    renderCompare();

    expect(screen.getByText("BOM Compare")).toBeDefined();
    expect(screen.getByRole("button", { name: "Variant A vs Variant B" })).toBeDefined();
    expect(screen.getByRole("button", { name: "EBOM vs MBOM" })).toBeDefined();

    // Mode-specific content for variants
    expect(screen.getByText(/Only in A/i)).toBeDefined();
    expect(screen.getByText("In Both")).toBeDefined();
    expect(screen.getByText(/Only in B/i)).toBeDefined();
  });

  it("switches to EBOM vs MBOM mode and renders EnterpriseTable with all 4 column headers", () => {
    renderCompare();

    // Switch to EBOM vs MBOM mode
    const ebomMbomBtn = screen.getByRole("button", { name: "EBOM vs MBOM" });
    fireEvent.click(ebomMbomBtn);

    // Summary metric cards
    expect(screen.getByText("Mapped both ways")).toBeDefined();
    expect(screen.getByText("EBOM only (no routing)")).toBeDefined();
    expect(screen.getByText("MBOM only (phantom)")).toBeDefined();

    // Section title
    expect(screen.getByRole("heading", { name: "Unmapped EBOM Assemblies" })).toBeDefined();

    // All 4 EnterpriseTable column headers
    expect(screen.getByRole("columnheader", { name: /^Part Number$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Name$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Type$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Supplier$/i })).toBeDefined();
  });

  it("supports client-side sorting on Part Number, Name, Type, and Supplier headers", () => {
    renderCompare();

    // Switch to EBOM vs MBOM mode
    fireEvent.click(screen.getByRole("button", { name: "EBOM vs MBOM" }));

    const sortPnBtn = screen.getByRole("button", { name: "Sort by Part Number" });
    const sortNameBtn = screen.getByRole("button", { name: "Sort by Name" });
    const sortTypeBtn = screen.getByRole("button", { name: "Sort by Type" });
    const sortSupBtn = screen.getByRole("button", { name: "Sort by Supplier" });

    const pnTh = sortPnBtn.closest("th");
    expect(pnTh?.getAttribute("aria-sort")).toBe("none");

    // Click to sort by Part Number ascending
    fireEvent.click(sortPnBtn);
    expect(pnTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click to sort by Part Number descending
    fireEvent.click(sortPnBtn);
    expect(pnTh?.getAttribute("aria-sort")).toBe("descending");

    // Click Name sort
    fireEvent.click(sortNameBtn);
    const nameTh = sortNameBtn.closest("th");
    expect(nameTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click Type sort
    fireEvent.click(sortTypeBtn);
    const typeTh = sortTypeBtn.closest("th");
    expect(typeTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click Supplier sort
    fireEvent.click(sortSupBtn);
    const supTh = sortSupBtn.closest("th");
    expect(supTh?.getAttribute("aria-sort")).toBe("ascending");
  });

  it("clicking a Part Number or table row navigates to /parts/[pn]", () => {
    renderCompare();

    // Switch to EBOM vs MBOM mode
    fireEvent.click(screen.getByRole("button", { name: "EBOM vs MBOM" }));

    // Find any rendered part button or row
    const partButtons = screen.getAllByRole("button", { name: /View details for/i });
    if (partButtons.length > 0) {
      fireEvent.click(partButtons[0]);
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush.mock.calls[0][0]).toMatch(/^\/parts\//);
    }
  });

  it("renders export diff button with AppIcon", () => {
    renderCompare();

    const exportBtn = screen.getByRole("button", { name: /Export diff \(CSV\)/i });
    expect(exportBtn).toBeDefined();
  });
});
