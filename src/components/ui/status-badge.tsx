import React from "react";
import { AppIcon } from "@/components/ui/app-icon";
import type { IconName } from "@/lib/icons";

/**
 * The core semantic status tones in BOM Sync.
 * Implements Chronos solid dark backgrounds with crisp white text.
 */
export type StatusTone =
  | "critical"
  | "warning"
  | "success"
  | "info"
  | "pending"
  | "neutral";

export type StatusBadgeVariant = "subtle" | "solid";
export type StatusBadgeSize = "xs" | "sm" | "md";

/**
 * Chronos dark solid semantic tone classes with white text.
 * WCAG AA compliant (> 4.5:1 contrast against white text).
 */
const toneClasses: Record<StatusTone, string> = {
  critical: "bg-[#891f24] dark:bg-[#70151a] text-white border-transparent",
  warning: "bg-[#9a3814] dark:bg-[#713810] text-white border-transparent",
  success: "bg-[#275a3b] dark:bg-[#1a442b] text-white border-transparent",
  info: "bg-[#1c5083] dark:bg-[#133c63] text-white border-transparent",
  pending: "bg-[#5b2170] dark:bg-[#481b59] text-white border-transparent",
  neutral: "bg-[#464646] dark:bg-[#323232] text-white border-transparent",
};

const sizeClasses: Record<StatusBadgeSize, string> = {
  xs: "px-2 py-0.5 text-[10px] leading-none",
  sm: "px-2.5 py-0.5 text-[11px] leading-tight",
  md: "px-3 py-1 text-xs leading-normal",
};

const iconSizes: Record<StatusBadgeSize, "xs" | "sm"> = {
  xs: "xs",
  sm: "xs",
  md: "sm",
};

export interface StatusBadgeProps {
  /** The semantic tone governing badge coloration */
  tone: StatusTone;
  /** Badge content label */
  children: React.ReactNode;
  /** Optional leading icon (white) to ensure accessibility */
  icon?: IconName;
  /** Visual presentation variant */
  variant?: StatusBadgeVariant;
  /** Size scale: xs (10px), sm (11px), md (12px) */
  size?: StatusBadgeSize;
  /** Accessible title attribute for hover details */
  title?: string;
  /** Additional Tailwind overrides */
  className?: string;
}

/**
 * Reusable StatusBadge primitive for BOM Sync adapted from Chronos.
 * Enforces dark solid background, pure white text, rounded-full pill geometry, and Geist font.
 */
export function StatusBadge({
  tone,
  children,
  icon,
  size = "sm",
  title,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex shrink-0 items-center gap-1 font-medium font-sans rounded-full border whitespace-nowrap select-none ${toneClasses[tone]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <AppIcon name={icon} size={iconSizes[size]} className="text-white shrink-0" aria-hidden />}
      <span className="text-white">{children}</span>
    </span>
  );
}

/* ---------------------------------------------------------------------------
   BOM Sync Domain Vocabulary Mappers
   Guarantees that individual modules never invent ad-hoc color mappings.
   ------------------------------------------------------------------------ */

/** Maps BOM part lifecycle states to standard status tones */
export function lifecycleTone(lifecycle?: string): StatusTone {
  const normalized = (lifecycle ?? "").toLowerCase().trim();
  switch (normalized) {
    case "released":
    case "production":
    case "clean":
      return "success";
    case "in review":
    case "in-review":
    case "review":
    case "prototype":
    case "validation":
      return "warning";
    case "in work":
    case "in-work":
      return "info";
    case "obsolete":
    case "deprecated":
    case "draft":
      return "neutral";
    case "critical":
    case "flagged":
      return "critical";
    default:
      return "neutral";
  }
}

/** Maps component and system health to standard status tones */
export function healthTone(health?: string): StatusTone {
  const normalized = (health ?? "").toLowerCase().trim();
  switch (normalized) {
    case "healthy":
      return "success";
    case "warning":
      return "warning";
    case "critical":
      return "critical";
    default:
      return "neutral";
  }
}

/** Maps ECN change states to standard status tones */
export function ecnStateTone(state?: string): StatusTone {
  const normalized = (state ?? "").toLowerCase().trim();
  switch (normalized) {
    case "approved":
    case "released":
      return "success";
    case "in review":
      return "warning";
    case "rejected":
    case "cancelled":
      return "critical";
    case "draft":
      return "neutral";
    default:
      return "pending";
  }
}

/** Maps issue/alert severity to standard status tones */
export function severityTone(severity?: string): StatusTone {
  const normalized = (severity ?? "").toLowerCase().trim();
  switch (normalized) {
    case "critical":
      return "critical";
    case "high":
    case "warning":
      return "warning";
    case "medium":
    case "info":
      return "info";
    case "low":
    case "clean":
      return "neutral";
    default:
      return "neutral";
  }
}
