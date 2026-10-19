import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Chronus status badge: solid pill, white label. Tone variants map to the
// feedback tokens (critical -> error, high -> warning, medium -> info, low -> neutral).
const badgeVariants = cva(
  "inline-flex items-center truncate rounded-full border px-2.5 py-0.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-active",
  {
    variants: {
      variant: {
        default: "border-transparent bg-action-primary text-on-color",
        secondary: "border-transparent bg-raised-2 text-secondary-foreground",
        destructive: "border-transparent bg-error-badge text-badge",
        outline: "border-hairline text-secondary-foreground",
        success: "border-transparent bg-success-badge text-badge",
        info: "border-transparent bg-info-badge text-badge",
        warning: "border-transparent bg-warning-badge text-badge",
        error: "border-transparent bg-error-badge text-badge",
        neutral: "border-transparent bg-neutral-badge text-badge",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
