import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { EnterpriseTable, type TableColumn } from "@/components/ui/enterprise-table";

interface TestItem {
  id: string;
  name: string;
  count: number;
  status: string;
}

const testColumns: TableColumn<TestItem>[] = [
  {
    id: "name",
    header: "Item Name",
    cell: (row) => row.name,
    sortValue: (row) => row.name,
  },
  {
    id: "count",
    header: "Quantity",
    cell: (row) => row.count,
    sortValue: (row) => row.count,
    align: "right",
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => row.status,
    // unsortable intentionally
  },
];

const testRows: TestItem[] = [
  { id: "item-1", name: "Alpha Battery", count: 50, status: "Active" },
  { id: "item-2", name: "Gamma Motor", count: 12, status: "Pending" },
  { id: "item-3", name: "Beta Sensor", count: 120, status: "Active" },
];

describe("EnterpriseTable<T> (Phase 5)", () => {
  it("renders table with headers and row data", () => {
    render(
      <EnterpriseTable
        rows={testRows}
        columns={testColumns}
        rowKey={(row) => row.id}
        caption="Inventory table"
      />
    );

    // Headers
    expect(screen.getByText("Item Name")).toBeDefined();
    expect(screen.getByText("Quantity")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();

    // Rows
    expect(screen.getByText("Alpha Battery")).toBeDefined();
    expect(screen.getByText("Gamma Motor")).toBeDefined();
    expect(screen.getByText("Beta Sensor")).toBeDefined();

    // Caption
    expect(screen.getByText("Inventory table")).toBeDefined();
  });

  it("handles client-side sorting for string and numeric columns", () => {
    const { container } = render(
      <EnterpriseTable
        rows={testRows}
        columns={testColumns}
        rowKey={(row) => row.id}
      />
    );

    const nameSortBtn = screen.getByRole("button", { name: "Sort by Item Name" });
    const countSortBtn = screen.getByRole("button", { name: "Sort by Quantity" });

    // Initial order: Alpha, Gamma, Beta
    let rows = container.querySelectorAll("tbody tr");
    expect(rows[0]?.textContent).toContain("Alpha Battery");
    expect(rows[1]?.textContent).toContain("Gamma Motor");
    expect(rows[2]?.textContent).toContain("Beta Sensor");

    // Click name sort (asc): Alpha, Beta, Gamma
    fireEvent.click(nameSortBtn);
    rows = container.querySelectorAll("tbody tr");
    expect(rows[0]?.textContent).toContain("Alpha Battery");
    expect(rows[1]?.textContent).toContain("Beta Sensor");
    expect(rows[2]?.textContent).toContain("Gamma Motor");

    // Click name sort again (desc): Gamma, Beta, Alpha
    fireEvent.click(nameSortBtn);
    rows = container.querySelectorAll("tbody tr");
    expect(rows[0]?.textContent).toContain("Gamma Motor");
    expect(rows[1]?.textContent).toContain("Beta Sensor");
    expect(rows[2]?.textContent).toContain("Alpha Battery");

    // Click numeric count sort (asc): Gamma (12), Alpha (50), Beta (120)
    fireEvent.click(countSortBtn);
    rows = container.querySelectorAll("tbody tr");
    expect(rows[0]?.textContent).toContain("Gamma Motor");
    expect(rows[1]?.textContent).toContain("Alpha Battery");
    expect(rows[2]?.textContent).toContain("Beta Sensor");

    // Click numeric count sort again (desc): Beta (120), Alpha (50), Gamma (12)
    fireEvent.click(countSortBtn);
    rows = container.querySelectorAll("tbody tr");
    expect(rows[0]?.textContent).toContain("Beta Sensor");
    expect(rows[1]?.textContent).toContain("Alpha Battery");
    expect(rows[2]?.textContent).toContain("Gamma Motor");
  });

  it("updates aria-sort attributes appropriately", () => {
    render(
      <EnterpriseTable
        rows={testRows}
        columns={testColumns}
        rowKey={(row) => row.id}
      />
    );

    const nameTh = screen.getByText("Item Name").closest("th");
    const countTh = screen.getByText("Quantity").closest("th");
    const statusTh = screen.getByText("Status").closest("th");

    expect(nameTh?.getAttribute("aria-sort")).toBe("none");
    expect(countTh?.getAttribute("aria-sort")).toBe("none");
    expect(statusTh?.getAttribute("aria-sort")).toBe("none");

    // Sort by name
    fireEvent.click(screen.getByRole("button", { name: "Sort by Item Name" }));
    expect(nameTh?.getAttribute("aria-sort")).toBe("ascending");

    // Descending
    fireEvent.click(screen.getByRole("button", { name: "Sort by Item Name" }));
    expect(nameTh?.getAttribute("aria-sort")).toBe("descending");
  });

  it("supports expandable rows and toggles drawer visibility", () => {
    render(
      <EnterpriseTable
        rows={testRows}
        columns={testColumns}
        rowKey={(row) => row.id}
        renderExpanded={(row) => (
          <div data-testid={`expanded-${row.id}`}>
            Detailed specifications for {row.name}
          </div>
        )}
      />
    );

    // Expansion buttons present
    const expandButtons = screen.getAllByRole("button", { name: "Expand row details" });
    expect(expandButtons.length).toBe(3);
    expect(expandButtons[0]?.getAttribute("aria-expanded")).toBe("false");

    // Drawer should not be rendered yet
    expect(screen.queryByTestId("expanded-item-1")).toBeNull();

    // Expand first row
    fireEvent.click(expandButtons[0]!);
    expect(screen.getByTestId("expanded-item-1")).toBeDefined();
    expect(screen.getByText("Detailed specifications for Alpha Battery")).toBeDefined();

    // Toggle button aria-expanded should now be true
    const collapseButton = screen.getByRole("button", { name: "Collapse row details" });
    expect(collapseButton.getAttribute("aria-expanded")).toBe("true");

    // Collapse first row
    fireEvent.click(collapseButton);
    expect(screen.queryByTestId("expanded-item-1")).toBeNull();
  });

  it("renders empty state when rows is empty", () => {
    render(
      <EnterpriseTable
        rows={[]}
        columns={testColumns}
        rowKey={(row: TestItem) => row.id}
        emptyMessage="No automotive parts found."
      />
    );

    expect(screen.getByText("No automotive parts found.")).toBeDefined();
    expect(screen.queryByText("Item Name")).toBeNull();
  });

  it("renders loading skeleton when isLoading is true", () => {
    const { container } = render(
      <EnterpriseTable
        rows={testRows}
        columns={testColumns}
        rowKey={(row) => row.id}
        isLoading={true}
      />
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(screen.queryByText("Alpha Battery")).toBeNull();
  });

  it("handles row click events while stopping propagation from expand button", () => {
    const onRowClick = vi.fn();
    render(
      <EnterpriseTable
        rows={testRows}
        columns={testColumns}
        rowKey={(row) => row.id}
        onRowClick={onRowClick}
        renderExpanded={(row) => <div>Expanded {row.name}</div>}
      />
    );

    // Click on row cell
    fireEvent.click(screen.getByText("Alpha Battery"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(testRows[0]);

    // Click expand button should not trigger onRowClick
    const expandButtons = screen.getAllByRole("button", { name: "Expand row details" });
    fireEvent.click(expandButtons[1]!);
    expect(onRowClick).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  it("applies tabular-nums to numeric right-aligned columns", () => {
    const { container } = render(
      <EnterpriseTable
        rows={testRows}
        columns={testColumns}
        rowKey={(row) => row.id}
      />
    );

    const countCells = container.querySelectorAll("td.tabular-nums");
    expect(countCells.length).toBe(3);
  });

  it("supports pagination with accurate range display and page navigation", () => {
    const { container } = render(
      <EnterpriseTable
        rows={testRows}
        columns={testColumns}
        rowKey={(row) => row.id}
        pageSize={2}
      />
    );

    // Initial page 1: 2 rows visible
    expect(screen.getByText(/Showing/i)).toBeDefined();
    expect(screen.getByText(/1\s*\/\s*2/)).toBeDefined();
    expect(screen.getByText("Alpha Battery")).toBeDefined();
    expect(screen.getByText("Gamma Motor")).toBeDefined();
    expect(screen.queryByText("Beta Sensor")).toBeNull();

    // Previous button should be disabled on page 1
    const prevBtn = screen.getByRole("button", { name: "Previous page" });
    const nextBtn = screen.getByRole("button", { name: "Next page" });
    expect(prevBtn.hasAttribute("disabled")).toBe(true);
    expect(nextBtn.hasAttribute("disabled")).toBe(false);

    // Click Next page
    fireEvent.click(nextBtn);

    // Page 2: remaining 1 row visible
    expect(screen.getByText(/2\s*\/\s*2/)).toBeDefined();
    expect(screen.queryByText("Alpha Battery")).toBeNull();
    expect(screen.getByText("Beta Sensor")).toBeDefined();
    expect(nextBtn.hasAttribute("disabled")).toBe(true);
    expect(prevBtn.hasAttribute("disabled")).toBe(false);

    // Click Previous page
    fireEvent.click(prevBtn);
    expect(screen.getByText(/1\s*\/\s*2/)).toBeDefined();
    expect(screen.getByText("Alpha Battery")).toBeDefined();
  });

  it("applies sticky column styling to the first identity column", () => {
    const { container } = render(
      <EnterpriseTable
        rows={testRows}
        columns={testColumns}
        rowKey={(row) => row.id}
        stickyFirstColumn={true}
      />
    );

    const firstTh = container.querySelector("thead th:nth-child(1)");
    expect(firstTh?.className).toContain("sticky");

    const firstTd = container.querySelector("tbody tr:nth-child(1) td:nth-child(1)");
    expect(firstTd?.className).toContain("sticky");
  });
});


