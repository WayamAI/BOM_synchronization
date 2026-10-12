import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-full border border-hairline bg-action px-4 text-sm text-foreground outline-none transition-colors duration-[180ms] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-quaternary hover:border-strong focus-visible:border-strong focus-visible:ring-2 focus-visible:ring-active disabled:cursor-not-allowed disabled:opacity-40",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
