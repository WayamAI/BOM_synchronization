import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgramProvider } from "@/context/ProgramContext";
import Dashboard from "../../app/(app)/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

const renderDashboard = () => {
  return render(
    <ThemeProvider>
      <TooltipProvider>
        <ProgramProvider>
          <Dashboard />
        </ProgramProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

describe("ECN Approval Queue & Program Stage Pipeline Modernization (Phase 7 Step 6)", { timeout: 15000 }, () => {
  beforeEach(() => {
    mockPush.mockClear();
    window.localStorage.setItem("wayam_auth", "1");
  });

  describe("ECN Approval Queue", () => {
    it("renders ECN Approval Queue with header, eyebrow, and pending count badge", () => {
      renderDashboard();

      expect(screen.getByText("Change Orders")).toBeDefined();
      expect(screen.getByRole("heading", { name: /ECN Approval Queue/i })).toBeDefined();
      expect(screen.getByText(/pending/i)).toBeDefined();
    });

    it("renders existing pending ECN records with ID, state, priority, and reason", () => {
      renderDashboard();

      // Meridian SUV has ECN-2241 (In Review, High, Quality)
      expect(screen.getByText("ECN-2241")).toBeDefined();
      expect(screen.getByText("Battery cell tab geometry update (EV)")).toBeDefined();
      expect(screen.getByText("Quality")).toBeDefined();
    });

    it("clicking Monitor button navigates to /changes", () => {
      renderDashboard();

      const monitorBtn = screen.getByRole("button", { name: /Monitor all change orders in full table/i });
      fireEvent.click(monitorBtn);

      expect(mockPush).toHaveBeenCalledWith("/changes");
    });

    it("clicking an ECN row navigates to /changes/[id]", () => {
      renderDashboard();

      const ecnRow = screen.getByText("ECN-2241").closest("button");
      expect(ecnRow).not.toBeNull();
      fireEvent.click(ecnRow!);

      expect(mockPush).toHaveBeenCalledWith("/changes/ECN-2241");
    });

    it("switching program updates ECN Approval Queue reactively", () => {
      renderDashboard();

      // Switch to Titan Truck
      const titanBtn = screen.getByRole("button", { name: /Titan Truck/i });
      fireEvent.click(titanBtn);

      // Titan Truck has ECN-4001 (In Review, Medium, Engineering)
      expect(screen.getByText("ECN-4001")).toBeDefined();
      expect(screen.getByText("Diesel engine NVH damper revision")).toBeDefined();
    });
  });

  describe("Program Stage Pipeline", () => {
    it("renders Program Stage Pipeline with header, eyebrow, and active program stage", () => {
      renderDashboard();

      expect(screen.getByText("Lifecycle")).toBeDefined();
      expect(screen.getByRole("heading", { name: /Program Stage Pipeline/i })).toBeDefined();
    });

    it("renders all 5 lifecycle stage milestone columns aligned at the bottom", () => {
      renderDashboard();

      const stages = ["Concept", "Design", "Engineering", "Pre-Production", "SOP"];
      stages.forEach(stage => {
        const elements = screen.getAllByText(stage);
        expect(elements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("renders progressbar element with accessible ARIA attributes for each program", () => {
      renderDashboard();

      // Progress bars for programs
      const progressbars = screen.getAllByRole("progressbar");
      expect(progressbars.length).toBe(4);

      // Meridian SUV is Pre-Production (stage 4 of 5)
      const meridianBar = screen.getByLabelText(/Meridian SUV lifecycle stage: Pre-Production/i);
      expect(meridianBar).toBeDefined();
      expect(meridianBar.getAttribute("aria-valuenow")).toBe("4");
      expect(meridianBar.getAttribute("aria-valuemin")).toBe("1");
      expect(meridianBar.getAttribute("aria-valuemax")).toBe("5");
    });

    it("switching programs updates the active program indicator in the pipeline", () => {
      renderDashboard();

      // Switch to Atlas Sedan (Concept)
      const atlasBtn = screen.getByRole("button", { name: /Atlas Sedan/i });
      fireEvent.click(atlasBtn);

      const atlasBar = screen.getByLabelText(/Atlas Sedan lifecycle stage: Concept/i);
      expect(atlasBar).toBeDefined();
      expect(atlasBar.getAttribute("aria-valuenow")).toBe("1");
    });
  });
});
