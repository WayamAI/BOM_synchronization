import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { PipelineBar } from "./PipelineBar";
import { ProgramProvider } from "@/context/ProgramContext";

export const AppShell = () => {
  return (
    <ProgramProvider>
      <div className="min-h-screen bg-background relative overflow-x-hidden">
        {/* Ambient mesh & grid textures */}
        <div aria-hidden className="pointer-events-none fixed inset-0 bg-mesh opacity-80" />
        <div aria-hidden className="pointer-events-none fixed inset-0 pattern-grid opacity-[0.03]" />
        <div aria-hidden className="pointer-events-none fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />

        <div className="relative flex flex-col min-h-screen">
          <div className="fixed top-0 left-0 right-0 z-50 h-16">
            <TopNav />
          </div>
          <div className="fixed top-16 left-0 right-0 z-40 h-16">
            <PipelineBar />
          </div>

          <div className="flex flex-1 pt-32">
            <div className="fixed top-32 left-0 bottom-0 w-64 z-30">
              <Sidebar />
            </div>
            <main className="flex-1 min-w-0 ml-64 p-4 md:p-6 lg:p-8 w-full max-w-[1920px] mx-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </ProgramProvider>
  );
};
