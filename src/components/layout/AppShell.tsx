import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { PipelineBar } from "./PipelineBar";
import { ProgramProvider } from "@/context/ProgramContext";

export const AppShell = () => {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // The off-canvas sidebar closes after navigating.
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <ProgramProvider>
      {/* Fixed-viewport shell: the document never scrolls, <main> does. */}
      <div className="flex h-screen w-full overflow-hidden bg-page">
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <Sidebar
          expanded={expanded}
          onToggleExpanded={() => setExpanded(v => !v)}
          mobileOpen={mobileOpen}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav onOpenNav={() => setMobileOpen(true)} />
          <PipelineBar />
          <main className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ProgramProvider>
  );
};
