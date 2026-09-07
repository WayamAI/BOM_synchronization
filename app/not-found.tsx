"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="rounded-lg border border-border bg-card p-6 text-center max-w-sm w-full shadow-xl">
        <h1 className="text-4xl font-bold tracking-tight text-foreground tabular-nums">404</h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">Resource or route not found</p>
        <p className="mt-2 text-xs text-muted-foreground">The requested URL does not exist in the SAMA registry.</p>
        <div className="mt-4">
          <Link
            href="/"
            className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Return to Command Center
          </Link>
        </div>
      </div>
    </div>
  );
}
