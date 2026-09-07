import React from "react";
import { AppIcon, type IconSize } from "./app-icon";
import type { IconName } from "@/lib/icons";

export type IconButtonVariant = "ghost" | "subtle" | "outline" | "primary";
export type IconButtonSize = "xs" | "sm" | "md" | "lg";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Semantic icon name to render */
  icon: IconName;
  /** Mandatory accessible label (rendered as aria-label and title) */
  label: string;
  /** Visual variant: ghost, subtle, outline, or primary */
  variant?: IconButtonVariant;
  /** Button dimensions: xs (24px), sm (28px), md (32px), lg (36px) */
  size?: IconButtonSize;
  /** Active toggled state */
  active?: boolean;
  /** Optional class overrides */
  className?: string;
}

const containerSizes: Record<IconButtonSize, string> = {
  xs: "h-6 w-6 rounded",
  sm: "h-7 w-7 rounded",
  md: "h-8 w-8 rounded-md",
  lg: "h-9 w-9 rounded-md",
};

const iconSizes: Record<IconButtonSize, IconSize> = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "md",
};

const variantClasses: Record<IconButtonVariant, string> = {
  ghost:
    "text-muted-foreground hover:bg-surface-hover hover:text-foreground active:bg-surface-active focus-visible:ring-1 focus-visible:ring-ring",
  subtle:
    "bg-surface-secondary text-muted-foreground hover:bg-surface-elevated hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring",
  outline:
    "border border-border bg-card/50 text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring",
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-1 focus-visible:ring-ring",
};

/**
 * Reusable IconButton primitive for BOM Sync.
 * Enforces mandatory accessible labeling, standard sizing, and restrained dark surfaces.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      variant = "ghost",
      size = "md",
      active = false,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const activeClass =
      active && variant !== "primary"
        ? "bg-surface-elevated text-foreground border-border"
        : "";

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        disabled={disabled}
        className={`inline-flex shrink-0 items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-40 ${containerSizes[size]} ${variantClasses[variant]} ${activeClass} ${className}`}
        {...props}
      >
        <AppIcon name={icon} size={iconSizes[size]} aria-hidden />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

