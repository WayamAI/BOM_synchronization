import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Chronus buttons: pills. One solid primary per view; everything else is an
// outline pill or a text button. Focus is a 2px ring; disabled is opacity-40.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-xs font-medium outline-none transition-colors duration-[180ms] ease-out focus-visible:ring-2 focus-visible:ring-active disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-[13px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-action-primary text-on-color hover:bg-action-primary-hover disabled:bg-action-primary-disabled disabled:opacity-100",
        destructive: "bg-error-badge text-badge hover:opacity-90",
        outline: "border border-hairline bg-action text-secondary-foreground hover:border-strong hover:bg-raised-2 hover:text-foreground",
        secondary: "bg-action text-secondary-foreground hover:bg-raised-2 hover:text-foreground",
        ghost: "text-tertiary hover:bg-action hover:text-foreground",
        link: "text-secondary-foreground underline-offset-2 hover:text-foreground hover:underline",
      },
      size: {
        default: "h-8 px-3",
        sm: "h-8 px-3",
        lg: "h-11 px-5 text-sm",
        icon: "size-8 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
