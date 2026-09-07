import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Sidebar, navGroups } from "@/components/layout/Sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/ebom",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("Adaptive Sidebar Navigation (Phase 3)", () => {
  it("preserves all 12 SAMA routes across 3 logical groups", () => {
    const totalItems = navGroups.reduce((sum, g) => sum + g.items.length, 0);
    expect(totalItems).toBe(12);

    const routes = navGroups.flatMap((g) => g.items.map((i) => i.to));
    expect(routes).toContain("/");
    expect(routes).toContain("/variants");
    expect(routes).toContain("/ebom");
    expect(routes).toContain("/mbom");
    expect(routes).toContain("/service");
    expect(routes).toContain("/software");
    expect(routes).toContain("/changes");
    expect(routes).toContain("/compare");
    expect(routes).toContain("/parts");
    expect(routes).toContain("/suppliers");
    expect(routes).toContain("/field");
    expect(routes).toContain("/reports");
  });

  it("renders in collapsed mode with accessible link labels and active route indicator", () => {
    render(<Sidebar isExpanded={false} />);
    const ebomLink = screen.getByRole("link", { name: "Engineering BOM" });
    expect(ebomLink).toBeDefined();
    expect(ebomLink.getAttribute("aria-current")).toBe("page");
  });

  it("renders group section headers and route titles when expanded", () => {
    render(<Sidebar isExpanded={true} />);
    expect(screen.getByText("BOM Structures")).toBeDefined();
    expect(screen.getByText("Change & Supply Chain")).toBeDefined();
    expect(screen.getByText("Engineering BOM")).toBeDefined();
    expect(screen.getByText("Software BOM")).toBeDefined();
  });

  it("calls onToggleExpand when the toggle button is clicked", () => {
    const onToggleExpand = vi.fn();
    render(<Sidebar isExpanded={false} onToggleExpand={onToggleExpand} />);
    const toggleButton = screen.getByRole("button", { name: "Expand navigation" });
    fireEvent.click(toggleButton);
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
  });

  it("renders off-canvas mobile drawer with close control when isMobileOpen=true", () => {
    const onCloseMobile = vi.fn();
    render(
      <Sidebar
        isExpanded={false}
        isMobileOpen={true}
        onCloseMobile={onCloseMobile}
      />
    );
    const closeBtn = screen.getByRole("button", { name: "Close navigation" });
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn);
    expect(onCloseMobile).toHaveBeenCalledTimes(1);
  });
});

