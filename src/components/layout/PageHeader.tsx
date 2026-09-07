import { ReactNode } from "react";

export interface PageHeaderProps {
  /** Page title heading */
  title: string;
  /** Optional secondary subtitle or description explaining the page's purpose */
  subtitle?: string;
  /** Optional alias for subtitle */
  description?: string;
  /** Small category context tag above the title (e.g., "Engineering", "Supply Chain") */
  eyebrow?: string;
  /** Right-aligned action buttons or interactive controls */
  actions?: ReactNode;
  /** Optional page content wrapped inside the header container */
  children?: ReactNode;
  /** Optional root container className override */
  className?: string;
}

/**
 * Chronos-Adapted PageHeader component for BOM Sync.
 * Provides consistent typographic hierarchy, optional category eyebrow, and action alignment.
 * Uses Geist font for metadata (zero monospace) and proper case for headlines.
 */
export const PageHeader = ({
  title,
  subtitle,
  description,
  eyebrow,
  actions,
  children,
  className = "",
}: PageHeaderProps) => {
  const effectiveDescription = subtitle ?? description;

  return (
    <div className={`space-y-4 pb-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[10px] font-sans font-medium uppercase tracking-[0.08em] text-muted-foreground mb-1">
              {eyebrow}
            </div>
          )}
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground font-sans">
            {title}
          </h1>
          {effectiveDescription && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-prose leading-relaxed">
              {effectiveDescription}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 pt-0.5">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};
