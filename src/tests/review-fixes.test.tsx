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
