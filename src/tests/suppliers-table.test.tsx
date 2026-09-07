import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgramProvider } from "@/context/ProgramContext";
import SupplierIntelPage from "../../app/(app)/suppliers/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

const renderSuppliers = () => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <ProgramProvider>
          <SupplierIntelPage />
        </ProgramProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

describe("Suppliers Page Table Migration (Phase 6 Step 6)", () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.localStorage.setItem("wayam_auth", "1");
  });

  it("renders PageHeader, KPIs, and EnterpriseTable with all 10 Supplier column headers", () => {
    renderSuppliers();

    expect(screen.getByText("Supplier & Risk Intelligence")).toBeDefined();
    expect(screen.getByText("Active suppliers")).toBeDefined();
    expect(screen.getByText("Single-source suppliers")).toBeDefined();

    // All 10 column headers
    expect(screen.getByRole("columnheader", { name: /^Supplier$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Country \/ Region$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Tier$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Parts$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Single-source$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Financial$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Geo risk$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^On-time$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Defects PPM$/i })).toBeDefined();
    expect(screen.getByRole("columnheader", { name: /^Risk$/i })).toBeDefined();
  });

  it("supports client-side sorting on Supplier, Parts, On-time, and Risk headers", () => {
    renderSuppliers();

    const sortSupplierBtn = screen.getByRole("button", { name: "Sort by Supplier" });
    const sortPartsBtn = screen.getByRole("button", { name: "Sort by Parts" });
    const sortOnTimeBtn = screen.getByRole("button", { name: "Sort by On-time" });
    const sortRiskBtn = screen.getByRole("button", { name: "Sort by Risk" });

    const supTh = sortSupplierBtn.closest("th");
    expect(supTh?.getAttribute("aria-sort")).toBe("none");

    // Click to sort by Supplier ascending
    fireEvent.click(sortSupplierBtn);
    expect(supTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click to sort by Supplier descending
    fireEvent.click(sortSupplierBtn);
    expect(supTh?.getAttribute("aria-sort")).toBe("descending");

    // Click Parts sort (numeric)
    fireEvent.click(sortPartsBtn);
    const partsTh = sortPartsBtn.closest("th");
    expect(partsTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click On-time sort (numeric)
    fireEvent.click(sortOnTimeBtn);
    const onTimeTh = sortOnTimeBtn.closest("th");
    expect(onTimeTh?.getAttribute("aria-sort")).toBe("ascending");

    // Click Risk sort (numeric)
    fireEvent.click(sortRiskBtn);
    const riskTh = sortRiskBtn.closest("th");
    expect(riskTh?.getAttribute("aria-sort")).toBe("ascending");
  });

  it("filters suppliers based on search query matching name, country, or region", () => {
    renderSuppliers();

    const searchInput = screen.getByPlaceholderText("Search suppliers…");
    fireEvent.change(searchInput, { target: { value: "Bosch" } });

    expect(screen.getByText(/Bosch Mobility/i)).toBeDefined();
    expect(screen.queryByText(/CATL Energy/i)).toBeNull();
  });

  it("shows empty state and resets search when Clear search is clicked", () => {
    renderSuppliers();

    const searchInput = screen.getByPlaceholderText("Search suppliers…");
    fireEvent.change(searchInput, { target: { value: "NONEXISTENT_SUPPLIER_XYZ" } });

    expect(screen.getByText("No suppliers found")).toBeDefined();
    const clearBtn = screen.getByRole("button", { name: "Clear search" });
    expect(clearBtn).toBeDefined();

    fireEvent.click(clearBtn);
    expect(screen.getByText(/Bosch Mobility/i)).toBeDefined();
  });

  it("clicking Open Part Master button navigates to /parts", () => {
    renderSuppliers();

    const openPartsBtn = screen.getByRole("button", { name: /Open Part Master →/i });
    fireEvent.click(openPartsBtn);

    expect(mockPush).toHaveBeenCalledWith("/parts");
  });
});

