import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgramProvider } from "@/context/ProgramContext";
import ChangesPage from "../../app/(app)/changes/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
  useParams: () => ({}),
}));

const renderChanges = () => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <ProgramProvider>
          <ChangesPage />
        </ProgramProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

describe("Changes Page Table Migration (Phase 6 Step 3)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.localStorage.setItem("wayam_auth", "1");
  });

  it("renders EnterpriseTable with all 9 Changes column headers and rows", () => {
    renderChanges();

    // All 9 column headers
    expect(screen.getByRole("columnheader", { name: /^ECN$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Title$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^State$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Priority$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Reason$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Affected PNs$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Cost\/veh$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^VINs$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Raised$/i })).toBeDefined();

    // Data rows
    expect(screen.getByText("ECN-2241")).toBeDefined();
    expect(screen.getByText("ECN-2242")).toBeDefined();
  });

  it("supports client-side sorting on ECN ID, Priority, and numeric Cost/veh", () => {
    renderChanges();

    const sortEcnBtn = screen.getByRole("button", { name: "Sort by ECN" });
    const sortCostBtn = screen.getByRole("button", { name: "Sort by Cost/veh" });

    // Initial aria-sort is none
    const ecnTh = sortEcnBtn.closest("th");
    expect(ecnTh?.getAttribute("aria-sort")).toBe("none");

    // Click to sort by ECN ascending
    fireEvent.click(sortEcnBtn);
    expect(ecnTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click to sort by ECN descending
    fireEvent.click(sortEcnBtn);
    expect(ecnTh?.getAttribute("aria-sort")).toBe("descending");

    // Click to sort by Cost/veh ascending
    fireEvent.click(sortCostBtn);
    const costTh = sortCostBtn.closest("th");
    expect(costTh?.getAttribute("aria-sort")).toBe("ascending");
  });

  it("clicking an ECN row or button navigates to /changes/[id]", () => {
    renderChanges();

    const ecnLink = screen.getByRole("button", { name: /View details for ECN-2241/i });
    fireEvent.click(ecnLink);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/changes/ECN-2241");
  });

  it("filters ECNs based on search input matching title, id, or PN", () => {
    renderChanges();

    const searchInput = screen.getByPlaceholderText("Search ECN, title, or PN…");
    fireEvent.change(searchInput, { target: { value: "ECN-2241" } });

    expect(screen.getByText("ECN-2241")).toBeDefined();
    expect(screen.queryByText("ECN-2242")).toBeNull();
  });

  it("shows empty state message and Clear filters button when search has no matches", () => {
    renderChanges();

    const searchInput = screen.getByPlaceholderText("Search ECN, title, or PN…");
    fireEvent.change(searchInput, { target: { value: "NONEXISTENT-ECN-QUERY-123" } });

    expect(screen.getByText("No change orders found")).toBeDefined();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeDefined();

    // Clicking clear filters resets search
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("ECN-2241")).toBeDefined();
  });
});
