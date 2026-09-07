"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import type { IconName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import wayamLogoLight from "@/assets/brand/wayam-logo-light.svg";
import wayamLogoDark from "@/assets/brand/wayam-logo-dark.svg";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BrandLogo } from "@/components/layout/BrandLogo";

export interface NavItemConfig {
  to: string;
  label: string;
  shortLabel: string;
  icon: IconName;
  description: string;
  end?: boolean;
}

export interface NavGroupConfig {
  id: string;
  title: string;
  items: NavItemConfig[];
}

/**
 * Governed 12 BOM Sync Routes grouped into logical operational domains.
 * All route paths, names, and concepts are strictly preserved.
 */
export const navGroups: NavGroupConfig[] = [
  {
    id: "core",
    title: "Command Center",
    items: [
      {
        to: "/",
        label: "Command Center",
        shortLabel: "Dashboard",
        icon: "dashboard",
        description: "Program overview, cross-BOM synchronization status, and live telemetry",
        end: true,
      },
    ],
  },
  {
    id: "structures",
    title: "BOM Structures",
    items: [
      {
        to: "/variants",
        label: "Variants & Config",
        shortLabel: "Variants",
        icon: "variants",
        description: "Vehicle trims, powertrain configurations, and 150% CAT BOM matrix",
      },
      {
        to: "/ebom",
        label: "Engineering BOM",
        shortLabel: "EBOM",
        icon: "ebom",
        description: "Hierarchical CAD assembly tree, revisions, and engineering parts",
      },
      {
        to: "/mbom",
        label: "Manufacturing BOM",
        shortLabel: "MBOM",
        icon: "mbom",
        description: "Plant routing operations, stations, and line-side assembly order",
      },
      {
        to: "/service",
        label: "Service BOM",
        shortLabel: "Service",
        icon: "service",
        description: "Field replacement kits, maintenance intervals, and service parts",
      },
      {
        to: "/software",
        label: "Software BOM",
        shortLabel: "SBOM",
        icon: "software",
        description: "ECU firmware packages, container builds, and security CVE tracking",
      },
    ],
  },
  {
    id: "execution",
    title: "Change & Supply Chain",
    items: [
      {
        to: "/changes",
        label: "Change Management",
        shortLabel: "Changes",
        icon: "changes",
        description: "Engineering Change Notices (ECN), approval gates, and revision history",
      },
      {
        to: "/compare",
        label: "BOM Compare",
        shortLabel: "Compare",
        icon: "compare",
        description: "Multi-baseline diff reconciliation and cross-structure parity analysis",
      },
      {
        to: "/parts",
        label: "Part Master",
        shortLabel: "Parts",
        icon: "parts",
        description: "Enterprise component catalog, lifecycle states, and lead times",
      },
      {
        to: "/suppliers",
        label: "Supplier Intelligence",
        shortLabel: "Suppliers",
        icon: "suppliers",
        description: "Tier-1/2 supplier resilience, certifications, and geographic risk ratings",
      },
      {
        to: "/field",
        label: "Field Quality & Warranty",
        shortLabel: "Field",
        icon: "field",
        description: "Field telematics, warranty incident tracking, and root cause investigation",
      },
      {
        to: "/reports",
        label: "Reports & Exports",
        shortLabel: "Reports",
        icon: "reports",
        description: "Exportable compliance audits, BOM cost roll-ups, and mass summaries",
      },
    ],
  },
];

export interface SidebarProps {
  isExpanded: boolean;
  onToggleExpand?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

/**
 * Chronos-Adapted Application Navigation Sidebar.
 * Features:
 * - Collapsed mode (~68px) with high-contrast circular pucks
 * - Expanded mode (~252px) with labeled routes and category eyebrows
 * - Full viewport height on the left
 * - Integrated 32px Wayam brand mark
 * - Accessible hover flyouts in collapsed mode
 * - Mobile off-canvas drawer mode
 */
export const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  onToggleExpand,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const [flyout, setFlyout] = useState<{ item: NavItemConfig; top: number } | null>(null);
  const flyoutTimer = useRef<NodeJS.Timeout | null>(null);

  const logoLightSrc =
    typeof wayamLogoLight === "object" && "src" in wayamLogoLight
      ? (wayamLogoLight as any).src
      : wayamLogoLight;
  const logoDarkSrc =
    typeof wayamLogoDark === "object" && "src" in wayamLogoDark
      ? (wayamLogoDark as any).src
      : wayamLogoDark;

  const isItemActive = useCallback(
    (to: string, end?: boolean) => {
      if (end) return pathname === to;
      return pathname === to || (pathname?.startsWith(`${to}/`) ?? false);
    },
    [pathname]
  );

  const scheduleClose = useCallback(() => {
    flyoutTimer.current = setTimeout(() => setFlyout(null), 180);
  }, []);

  const cancelClose = useCallback(() => {
    if (flyoutTimer.current) {
      clearTimeout(flyoutTimer.current);
      flyoutTimer.current = null;
    }
  }, []);

  const openFlyout = useCallback(
    (item: NavItemConfig, el: HTMLElement) => {
      cancelClose();
      const rect = el.getBoundingClientRect();
      const top = Math.max(8, Math.min(rect.top, window.innerHeight - 100));
      setFlyout({ item, top });
    },
    [cancelClose]
  );

  useEffect(() => cancelClose, [cancelClose]);

  const prevPathname = useRef(pathname);

  // Close flyout and mobile drawer only when pathname actually changes
  useEffect(() => {
    setFlyout(null);
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    }
  }, [pathname, isMobileOpen, onCloseMobile]);

  const showExpanded = isExpanded || isMobileOpen;

  return (
    <>
      <aside
        aria-label="Primary Navigation"
        data-expanded={showExpanded}
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-stroke-subtle bg-surface-primary select-none z-50",
          "transition-[width,transform] duration-200 ease-out",
          "fixed inset-y-0 left-0 lg:relative lg:z-30 lg:translate-x-0",
          showExpanded ? "w-[252px]" : "w-[68px]",
          isMobileOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full pointer-events-none lg:pointer-events-auto lg:translate-x-0"
        )}
      >
        {/* Top Brand Header (56px) matching Chronos */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-stroke-subtle",
            showExpanded ? "gap-2.5 px-4 justify-between" : "justify-center"
          )}
        >
          <BrandLogo showWordmark={showExpanded} href="/" />
          {isMobileOpen && (
            <button
              type="button"
              aria-label="Close navigation"
              onClick={onCloseMobile}
              className="flex size-7 items-center justify-center rounded-full hover:bg-surface-secondary text-muted-foreground hover:text-foreground lg:hidden ml-auto"
            >
              <AppIcon name="close" size="xs" aria-hidden />
            </button>
          )}
        </div>

        {/* Navigation Groups List */}
        <nav
          aria-label="Main navigation"
          className={cn(
            "min-h-0 flex-1 py-3 overflow-y-auto overflow-x-hidden",
            showExpanded ? "px-3" : "px-[14px]"
          )}
        >
          <div className="flex flex-col gap-4">
            {navGroups.map((group, gIdx) => (
              <div key={group.id} className="flex flex-col gap-1">
                {/* Group Title Eyebrow (expanded) or Divider (collapsed) */}
                {showExpanded ? (
                  <span className="px-2 pb-0.5 text-[10px] font-sans font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {group.title}
                  </span>
                ) : gIdx > 0 ? (
                  <div className="w-7 h-[1px] bg-stroke-subtle my-1.5 mx-auto shrink-0" />
                ) : null}

                {/* Items */}
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const active = isItemActive(item.to, item.end);

                    return (
                      <li
                        key={item.to}
                        className="relative"
                        onMouseEnter={(e) => {
                          if (!showExpanded) openFlyout(item, e.currentTarget);
                        }}
                        onMouseLeave={() => {
                          if (!showExpanded) scheduleClose();
                        }}
                      >
                        <Link
                          href={item.to}
                          aria-label={item.label}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group relative flex items-center rounded-full outline-none transition-colors duration-150",
                            "focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-1",
                            showExpanded ? "w-full gap-3 pr-3" : "justify-center"
                          )}
                        >
                          {/* Navigation Puck matching Chronos */}
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-150",
                              active
                                ? "bg-[#101010] text-white dark:bg-white dark:text-black shadow-sm"
                                : "bg-surface-secondary/70 text-muted-foreground group-hover:bg-surface-elevated group-hover:text-foreground"
                            )}
                          >
                            <AppIcon name={item.icon} size="sm" aria-hidden />
                          </span>

                          {/* Expanded Label */}
                          {showExpanded && (
                            <span
                              className={cn(
                                "truncate text-xs font-medium transition-colors duration-150",
                                active
                                  ? "text-foreground font-semibold"
                                  : "text-muted-foreground group-hover:text-foreground"
                              )}
                            >
                              {item.label}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom Utility Controls matching Chronos */}
        <div
          className={cn(
            "flex shrink-0 flex-col gap-1.5 border-t border-stroke-subtle py-2.5",
            showExpanded ? "px-3" : "px-[14px]"
          )}
        >
          {/* Collapse / Expand Toggle Button (Desktop) */}
          <div className="hidden lg:contents">
            <button
              type="button"
              aria-label={showExpanded ? "Collapse navigation" : "Expand navigation"}
              onClick={onToggleExpand}
              className={cn(
                "group relative flex items-center rounded-full outline-none transition-colors duration-150",
                "focus-visible:ring-2 focus-visible:ring-foreground/40",
                showExpanded ? "w-full gap-3 pr-3" : "justify-center"
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary/60 text-muted-foreground group-hover:bg-surface-elevated group-hover:text-foreground transition-colors">
                <AppIcon
                  name={showExpanded ? "chevronLeft" : "chevronRight"}
                  size="sm"
                  aria-hidden
                />
              </span>
              {showExpanded && (
                <span className="truncate text-xs font-medium text-muted-foreground group-hover:text-foreground">
                  Collapse navigation
                </span>
              )}
            </button>
          </div>

          {/* Theme Mode Toggle Item */}
          <div
            className={cn(
              "flex items-center",
              showExpanded ? "gap-3 px-1 py-0.5" : "justify-center"
            )}
          >
            <ThemeToggle />
            {showExpanded && (
              <span className="truncate text-xs font-medium text-muted-foreground">
                Theme
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Collapsed Hover Flyout Card */}
      {flyout && !showExpanded && (
        <div
          style={{ top: flyout.top }}
          className="fixed left-[72px] z-50 pointer-events-auto"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="w-56 rounded-lg border border-stroke-default bg-surface-primary p-3 shadow-xl backdrop-blur-none">
            <p className="text-xs font-semibold text-foreground">{flyout.item.label}</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {flyout.item.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
