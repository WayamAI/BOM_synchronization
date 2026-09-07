import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TopNav } from "@/components/layout/TopNav";
import { PipelineBar } from "@/components/layout/PipelineBar";
import { ProgramProvider } from "@/context/ProgramContext";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/ebom",
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

describe("TopNav & PipelineBar Modernization (Phase 4)", () => {
  describe("TopNav Component", () => {
    it("renders brand mark, active vehicle program, and scope filter", () => {
      render(
        <ProgramProvider>
          <TopNav />
        </ProgramProvider>
      );

      expect(screen.getByText("SAMA")).toBeDefined();
      expect(screen.getByText("Enterprise 2.4")).toBeDefined();
      expect(screen.getByText("Scope")).toBeDefined();
    });

    it("renders search bar and user profile initials", () => {
      render(
        <ProgramProvider>
          <TopNav />
        </ProgramProvider>
      );

      expect(screen.getByPlaceholderText("Search parts, ECNs, suppliers…")).toBeDefined();
      expect(screen.getByText("Ravi Kumar")).toBeDefined();
      expect(screen.getByText("Program Mgr")).toBeDefined();
      expect(screen.getByText("RK")).toBeDefined();
    });

    it("triggers onOpenMobileNav when mobile menu button is clicked", () => {
      const onOpenMobileNav = vi.fn();
      render(
        <ProgramProvider>
          <TopNav onOpenMobileNav={onOpenMobileNav} />
        </ProgramProvider>
      );

      const menuBtn = screen.getByRole("button", { name: "Open navigation menu" });
      expect(menuBtn).toBeDefined();
      fireEvent.click(menuBtn);
      expect(onOpenMobileNav).toHaveBeenCalledTimes(1);
    });
  });

  describe("PipelineBar Component", () => {
    it("renders all 5 core BOM lifecycle stages without fake metrics", () => {
      render(<PipelineBar />);

      expect(screen.getByText("Lifecycle")).toBeDefined();
      expect(screen.getByText("CAT BOM")).toBeDefined();
      expect(screen.getByText("EBOM")).toBeDefined();
      expect(screen.getByText("MBOM")).toBeDefined();
      expect(screen.getByText("Software")).toBeDefined();
      expect(screen.getByText("Service")).toBeDefined();
      expect(screen.getByText("Pipeline In Sync")).toBeDefined();
    });

    it("marks the active stage based on current route", () => {
      render(<PipelineBar />);

      const ebomButton = screen.getByRole("button", { name: /^EBOM/i });
      expect(ebomButton.getAttribute("aria-current")).toBe("step");
    });

    it("triggers router.push to stage route on click", () => {
      render(<PipelineBar />);

      const mbomButton = screen.getByRole("button", { name: /^MBOM/i });
      fireEvent.click(mbomButton);
      expect(mockPush).toHaveBeenCalledWith("/mbom");
    });
  });
});

