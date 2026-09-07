"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import { IconButton } from "@/components/ui/icon-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { BrandLogo } from "@/components/layout/BrandLogo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { products, notifications } from "@/lib/mockData";
import { useProgramContext } from "@/context/ProgramContext";
import { logout } from "@/lib/auth";

const routeLabels: Record<string, string> = {
  "": "Command Center",
  variants: "Variants & Configuration",
  ebom: "Engineering BOM",
  mbom: "Manufacturing BOM",
  service: "Service BOM",
  software: "Software BOM",
  changes: "Change Management",
  compare: "BOM Compare",
  parts: "Part Master",
  suppliers: "Supplier Intelligence",
  field: "Field Quality",
  reports: "Reports & Exports",
};

export interface TopNavProps {
  onOpenMobileNav?: () => void;
}

/**
 * Chronos-Adapted TopBar Component.
 * - Solid opaque page background (no transparency or blur)
 * - Exact 56px height
 * - Rounded pill controls and search
 * - Single BrandLogo on desktop, preserved mobile navigation trigger
 * - Preserved Program Context selector and Scope filter
 */
export const TopNav = ({ onOpenMobileNav }: TopNavProps) => {
  const { activeProgram, setActiveProgramId } = useProgramContext();
  const pathname = usePathname();
  const router = useRouter();
  const segments = (pathname || "").split("/").filter(Boolean);
  const crumbs =
    segments.length === 0
      ? [{ label: "Command Center", path: "/" }]
      : [
          { label: "Command Center", path: "/" },
          ...segments.map((s, i) => ({
            label: routeLabels[s] || s,
            path: "/" + segments.slice(0, i + 1).join("/"),
          })),
        ];

  return (
    <header className="h-14 shrink-0 border-b border-stroke-subtle bg-page z-30 select-none">
      <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-5">
        {/* Left Section: Mobile Menu Trigger + Brand Logo + Program Selector + Scope */}
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Mobile Menu Trigger */}
          {onOpenMobileNav && (
            <IconButton
              icon="menu"
              label="Open navigation menu"
              size="sm"
              onClick={onOpenMobileNav}
              className="lg:hidden"
            />
          )}

          {/* SAMA Product Identity */}
          <div className="flex items-center gap-2 pr-3 border-r border-stroke-subtle shrink-0">
            <span className="font-display text-sm font-bold tracking-tight text-foreground">
              SAMA
            </span>
            <span className="text-[10px] text-muted-foreground font-sans">
              Enterprise 2.4
            </span>
          </div>

          {/* Vehicle Program Selector Pill */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 h-8 rounded-full border border-stroke-default bg-surface-primary px-3 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
              >
                <span className="truncate max-w-[130px] sm:max-w-[180px]">{activeProgram.name}</span>
                <StatusBadge tone="neutral" size="xs">
                  {activeProgram.modelYear}
                </StatusBadge>
                <AppIcon name="chevronDown" size="xs" className="opacity-60 shrink-0" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 rounded-lg border-stroke-subtle bg-popover p-1 shadow-xl">
              <DropdownMenuLabel className="text-[10px] uppercase font-sans font-medium tracking-[0.08em] text-muted-foreground px-2 py-1.5">
                Switch Vehicle Program
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              {products.map((program) => (
                <DropdownMenuItem
                  key={program.id}
                  onClick={() => setActiveProgramId(program.id)}
                  className="flex items-center justify-between cursor-pointer rounded-md px-2 py-1.5 text-xs transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                    <span className="font-medium text-foreground truncate">{program.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {program.category} · {program.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs tabular-nums text-muted-foreground">{program.modelYear}</span>
                    {activeProgram.id === program.id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Operational Scope Popover Pill */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 h-8 rounded-full border border-stroke-default bg-surface-primary px-3 text-xs font-medium text-foreground hover:bg-surface-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
              >
                <AppIcon name="mapPin" size="xs" className="text-primary" aria-hidden />
                <span className="text-xs font-medium">Scope</span>
                <AppIcon name="chevronDown" size="xs" className="opacity-60" aria-hidden />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 rounded-lg border-stroke-subtle bg-popover p-3 shadow-xl" align="start">
              <div className="flex items-center justify-between pb-2 border-b border-stroke-subtle">
                <span className="text-xs font-semibold text-foreground">VIN Scope Filter</span>
                <span className="text-[10px] text-muted-foreground">Default: Global</span>
              </div>
              <div className="space-y-2 pt-2.5 text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Assembly Plant</span>
                  <span className="text-foreground font-medium">All Plants (2)</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Target Market</span>
                  <span className="text-foreground font-medium">Global (5 Regions)</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Variant Scope</span>
                  <span className="text-foreground font-medium">All Trims (Base, Premium, Sig)</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Breadcrumb Trail */}
          <nav
            aria-label="Breadcrumb"
            className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground ml-2"
          >
            {crumbs.map((crumb, idx) => {
              const isLast = idx === crumbs.length - 1;
              return (
                <span key={crumb.path} className="flex items-center gap-1.5">
                  {idx > 0 && (
                    <AppIcon
                      name="chevronRight"
                      size="xs"
                      className="text-muted-foreground/40 shrink-0"
                      aria-hidden
                    />
                  )}
                  <Link
                    href={crumb.path}
                    className={`transition-colors truncate max-w-[160px] ${
                      isLast ? "text-foreground font-medium" : "hover:text-foreground"
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </span>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Universal Search, Notifications, Profile */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Universal Search (Chronos Pill Input) */}
          <div className="relative hidden md:block">
            <AppIcon
              name="search"
              size="xs"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search parts, ECNs, suppliers…"
              className="h-8 w-56 lg:w-64 pl-8 pr-12 text-xs rounded-full bg-surface-secondary/70 border border-stroke-subtle text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:border-stroke-default transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-4 items-center rounded border border-stroke-subtle px-1 text-[9px] font-sans text-muted-foreground">
              Ctrl K
            </kbd>
          </div>

          {/* Notifications Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative">
                <IconButton icon="bell" label="Notifications" size="sm" variant="subtle" className="rounded-full" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-critical pointer-events-none ring-2 ring-page" />
              </div>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-84 p-0 rounded-lg border-stroke-subtle bg-popover shadow-2xl">
              <div className="p-3 border-b border-stroke-subtle flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Program Alerts</span>
                <StatusBadge tone="warning" size="xs">
                  {notifications.length} unread
                </StatusBadge>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-stroke-subtle">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 hover:bg-surface-hover cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-foreground">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Export Action Button */}
          <IconButton icon="download" label="Export data and audits" size="sm" variant="subtle" className="rounded-full" />

          {/* User Account Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full p-1 hover:bg-surface-hover transition-colors border border-transparent hover:border-stroke-subtle outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
              >
                <div className="h-7 w-7 rounded-full bg-surface-elevated border border-stroke-default flex items-center justify-center text-xs font-semibold text-foreground">
                  RK
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight pr-1">
                  <span className="text-xs font-medium text-foreground">Ravi Kumar</span>
                  <span className="text-[10px] uppercase font-sans tracking-wider text-muted-foreground">
                    Program Mgr
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-lg border-stroke-subtle bg-popover p-1 shadow-xl">
              <DropdownMenuLabel className="text-xs font-medium text-foreground px-2 py-1.5">
                Ravi Kumar (Chief Engineer)
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem className="text-xs rounded-md cursor-pointer">
                Profile & Key Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs rounded-md cursor-pointer">
                Switch Organization
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem
                className="text-xs text-critical rounded-md cursor-pointer font-medium"
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
