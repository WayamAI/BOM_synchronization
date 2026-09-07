import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgramProvider } from "@/context/ProgramContext";
import PartMasterPage from "../../app/(app)/parts/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useParams: () => ({}),
}));

const renderParts = () => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <ProgramProvider>
          <PartMasterPage />
        </ProgramProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

describe("Parts Page Table Migration (Phase 6 Step 4)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.localStorage.setItem("wayam_auth", "1");
  });

  it("renders EnterpriseTable with all 10 Parts column headers and rows", () => {
    renderParts();

    // All 10 column headers
    expect(screen.getByRole("columnheader", { name: /^Part Number$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Name$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Program$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Type$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Rev$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Lifecycle$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Owner$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Supplier$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Cost$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Lead$/i })).toBeDefined();

    // Data rows
    expect(screen.getByText("BAT-PCK-8500")).toBeDefined();
    expect(screen.getByText("PWT-ENG-2001")).toBeDefined();
  });

  it("supports client-side sorting on Part Number and numeric Cost and Lead columns", () => {
    renderParts();

    const sortPnBtn = screen.getByRole("button", { name: "Sort by Part Number" });
    const sortCostBtn = screen.getByRole("button", { name: "Sort by Cost" });
    const sortLeadBtn = screen.getByRole("button", { name: "Sort by Lead" });

    // Initial aria-sort is none
    const pnTh = sortPnBtn.closest("th");
    expect(pnTh?.getAttribute("aria-sort")).toBe("none");

    // Click to sort by Part Number ascending
    fireEvent.click(sortPnBtn);
    expect(pnTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click to sort by Part Number descending
    fireEvent.click(sortPnBtn);
    expect(pnTh?.getAttribute("aria-sort")).toBe("descending");

    // Click to sort by Cost ascending
    fireEvent.click(sortCostBtn);
    const costTh = sortCostBtn.closest("th");
    expect(costTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click to sort by Lead ascending
    fireEvent.click(sortLeadBtn);
    const leadTh = sortLeadBtn.closest("th");
    expect(leadTh?.getAttribute("aria-sort")).toBe("ascending");
  });

  it("clicking a Part Number navigates to /parts/[pn]", () => {
    renderParts();

    const pnBtn = screen.getByRole("button", { name: /View details for BAT-PCK-8500/i });
    fireEvent.click(pnBtn);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/parts/BAT-PCK-8500");
  });

  it("filters parts based on search input matching PN, name, or supplier", () => {
    renderParts();

    const searchInput = screen.getByPlaceholderText("Search by PN, name, supplier…");
    fireEvent.change(searchInput, { target: { value: "BAT-PCK-8500" } });

    expect(screen.getByText("BAT-PCK-8500")).toBeDefined();
    expect(screen.queryByText("PWT-ENG-2001")).toBeNull();
  });

  it("shows empty state message and Clear filters button when search has no matches", () => {
    renderParts();

    const searchInput = screen.getByPlaceholderText("Search by PN, name, supplier…");
    fireEvent.change(searchInput, { target: { value: "NONEXISTENT-PART-XYZ-999" } });

    expect(screen.getByText("No parts found")).toBeDefined();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeDefined();

    // Clicking clear filters resets search
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("BAT-PCK-8500")).toBeDefined();
  });
});

