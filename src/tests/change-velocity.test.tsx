import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ChangeVelocityChart } from "@/components/dashboard/ChangeVelocityChart";
import { programs } from "@/lib/mockData";

describe("Change Velocity Chart Modernization (Phase 7 Step 5)", () => {
  it("renders the Change Velocity panel with title, program context, and series legend", () => {
    const prog = programs[0]; // Meridian SUV
    render(
      <ChangeVelocityChart
        data={prog.changeVelocity}
        programName={prog.name}
      />
    );

    // Title and program label
    expect(screen.getByText("Change Velocity")).toBeDefined();
    expect(screen.getByText("Meridian SUV")).toBeDefined();

    // Disciplined series legend
    expect(screen.getByText("Approved")).toBeDefined();
    expect(screen.getByText("Rejected")).toBeDefined();
    expect(screen.getByText("Cycle Time")).toBeDefined();
  });

  it("has accessible region role and descriptive aria-label", () => {
    const prog = programs[1]; // Atlas Sedan
    render(
      <ChangeVelocityChart
        data={prog.changeVelocity}
        programName={prog.name}
      />
    );

    const region = screen.getByRole("region", {
      name: "Change Velocity chart for Atlas Sedan",
    });
    expect(region).toBeDefined();
  });

  it("renders correctly with different program data without throwing", () => {
    for (const prog of programs) {
      const { unmount } = render(
        <ChangeVelocityChart
          data={prog.changeVelocity}
          programName={prog.name}
        />
      );
      expect(screen.getByText(prog.name)).toBeDefined();
      unmount();
    }
  });
});

