import { describe, it, expect } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import EbomManager from "@/pages/EbomManager";

const renderEbom = () =>
  render(
    <ThemeProvider>
      <TooltipProvider>
        <MemoryRouter initialEntries={["/ebom"]}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/ebom" element={<EbomManager />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    </ThemeProvider>,
  );

describe("EBOM toolbar", () => {
  it("shows the view tabs, the variant select and the page search", () => {
    renderEbom();
    const main = screen.getByRole("main");
    const tabs = within(main).getAllByRole("tab").map(t => t.textContent);
    expect(tabs).toEqual(["Tree view", "Table view", "Graph view"]);
    expect(within(main).getByRole("combobox", { name: "Filter by variants" })).toBeInTheDocument();
    expect(within(main).getByPlaceholderText("Search EBOM by name or PN")).toBeInTheDocument();
  });

  it("keeps the page search and the top bar search separate", () => {
    renderEbom();
    const page = screen.getByPlaceholderText("Search EBOM by name or PN") as HTMLInputElement;
    const top = screen.getByLabelText("Search") as HTMLInputElement;
    fireEvent.change(page, { target: { value: "Battery Management" } });
    expect(page.value).toBe("Battery Management");
    expect(top.value).toBe("");
    expect(top.readOnly).toBe(true);
  });
});

describe("plural", () => {
  it("uses the singular for exactly one and groups thousands", async () => {
    const { plural } = await import("@/lib/format");
    expect(plural(1, "part")).toBe("1 part");
    expect(plural(0, "part")).toBe("0 parts");
    expect(plural(2, "assembly", "assemblies")).toBe("2 assemblies");
    expect(plural(1, "assembly", "assemblies")).toBe("1 assembly");
    expect(plural(1200, "CVE")).toBe("1,200 CVEs");
  });

  it("EBOM structure title says '1 Part' for a single match", () => {
    renderEbom();
    fireEvent.change(screen.getByPlaceholderText("Search EBOM by name or PN"), { target: { value: "Battery Management" } });
    expect(screen.getByText("Structure · 1 Part")).toBeInTheDocument();
  });
});

describe("EBOM drawer child components", () => {
  const childComponents = () => {
    const label = screen.getAllByText("Child components").find(el => el.tagName === "P")!;
    return label.nextElementSibling!.textContent;
  };

  it("shows 0 for a leaf part", () => {
    renderEbom();
    fireEvent.click(screen.getByText("ICE 2.0L Turbo Engine Assy"));
    expect(childComponents()).toBe("0");
  });

  it("counts every descendant of an assembly", () => {
    renderEbom();
    fireEvent.click(screen.getByText("HV Battery Pack 85 kWh"));
    expect(Number(childComponents())).toBeGreaterThanOrEqual(1);
  });
});
