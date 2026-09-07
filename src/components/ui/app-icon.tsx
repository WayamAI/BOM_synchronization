import { icons, type IconName } from "@/lib/icons";

/**
 * Standard icon size scale.
 * Strictly avoids arbitrary ad-hoc sizes throughout the application.
 */
export const iconSizeMap = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
} as const;

export type IconSize = keyof typeof iconSizeMap;

export interface AppIconProps {
  /** Semantic concept name defined in src/lib/icons.ts */
  name: IconName;
  /** Governed size preset: xs (12px), sm (14px), md (16px), lg (20px), xl (24px), 2xl (32px) */
  size?: IconSize;
  /** Custom stroke width, locked to 1.75 by default to mirror Tasara's industrial density */
  strokeWidth?: number;
  /** Optional Tailwind class overrides */
  className?: string;
  /** Accessible label for standalone icon buttons / non-decorative usages */
  "aria-label"?: string;
  /** Force hide from assistive technology */
  "aria-hidden"?: boolean;
}

/**
 * AppIcon — Unified semantic icon wrapper for BOM Sync.
 * Enforces consistent 1.75 stroke weight, disciplined size presets, and accessibility rules.
 */
export function AppIcon({
  name,
  size = "md",
  strokeWidth = 1.75,
  className,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: AppIconProps) {
  const IconComponent = icons[name];

  if (!IconComponent) {
    return null;
  }

  const pixelSize = iconSizeMap[size];
  const isHidden = ariaHidden ?? (ariaLabel ? undefined : true);

  return (
    <IconComponent
      size={pixelSize}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={isHidden}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      style={{ flexShrink: 0 }}
    />
  );
}

