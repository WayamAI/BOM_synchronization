"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { PipelineBar } from "./PipelineBar";
import { ProgramProvider } from "@/context/ProgramContext";

/**
 * Chronos-Adapted AppShell Layout.
 * Features:
 * - Left Navigation Rail / Sidebar spanning full height of viewport
 * - Main content column containing solid opaque TopNav (56px) + PipelineBar (36px)
 * - Scrollable main viewport body with 8px pill scrollbar
 * - Mobile off-canvas drawer with backdrop overlay
 */
export const AppShell = ({ children }: { children?: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sama_sidebar_expanded") || localStorage.getItem("bomsync_sidebar_expanded");
      if (saved !== null) {
        setIsExpanded(saved === "true");
      }
    } catch {
      // Ignore if localStorage is restricted
    }
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sama_sidebar_expanded", String(next));
      } catch {}
      return next;
    });
  }, []);

  return (
    <ProgramProvider>
      <div className="flex h-screen w-full overflow-hidden bg-page text-foreground">
        {/* Mobile Backdrop Overlay */}
        {isMobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
        )}

        {/* Full-Height Navigation Sidebar */}
        <Sidebar
          isExpanded={isExpanded}
          onToggleExpand={toggleExpanded}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Solid Opaque TopNav Header (56px) */}
          <TopNav onOpenMobileNav={() => setIsMobileOpen(true)} />

          {/* Lifecycle Pipeline Bar (36px) */}
          <PipelineBar />

          {/* Primary Viewport Main Body with Consistent Global Clearance */}
          <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-page p-4 sm:p-5 lg:p-6" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </ProgramProvider>
  );
};
