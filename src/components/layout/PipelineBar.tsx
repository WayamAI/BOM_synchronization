"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppIcon } from "@/components/ui/app-icon";
import { pipeline } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const routes: Record<string, string> = {
  cat: "/variants",
  ebom: "/ebom",
  mbom: "/mbom",
  sbom: "/software",
  service: "/service",
};

const dotClass = (h: string) => {
  if (h === "critical") return "bg-critical";
  if (h === "warning") return "bg-warning";
  return "bg-success";
};

/**
 * Chronos-Adapted PipelineBar component.
 * Fully opaque solid page background with zero blur, pill-shaped stages, and Geist font.
 */
export const PipelineBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="h-9 shrink-0 border-b border-stroke-subtle bg-page z-20 select-none">
      <div className="h-full px-4 sm:px-5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {/* Category Lead-in */}
        <div className="flex items-center gap-1.5 mr-2 shrink-0">
          <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground font-sans font-semibold">
            Lifecycle
          </span>
        </div>

        {/* Pipeline Stage Nodes */}
        {pipeline.map((stage, idx) => {
          const path = routes[stage.id];
          const active = path && (pathname === path || pathname?.startsWith(`${path}/`));

          return (
            <div key={stage.id} className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => path && router.push(path)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs transition-colors h-6 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-primary/50",
                  active
                    ? "border-primary/50 bg-primary/10 text-foreground font-medium"
                    : "border-stroke-subtle bg-surface-primary hover:bg-surface-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Status Dot */}
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotClass(stage.health))} />

                {/* Stage Name */}
                <span className="font-medium text-xs text-foreground">{stage.name}</span>

                {/* Component Count */}
                <span className="text-[11px] text-muted-foreground tabular-nums font-sans">
                  {stage.components.toLocaleString()}{" "}
                  <span className="text-[10px] opacity-70">{stage.countLabel}</span>
                </span>

                {/* Drift Warning */}
                {stage.drift && (
                  <span className="flex items-center gap-1 text-[11px] text-white bg-[#8a430f] px-1.5 py-0.2 rounded-full font-medium">
                    <AppIcon name="warning" size="xs" aria-hidden />
                    <span>{stage.drift}</span>
                  </span>
                )}
              </button>

              {/* Inter-stage Connector Chevron */}
              {idx < pipeline.length - 1 && (
                <AppIcon
                  name="chevronRight"
                  size="xs"
                  className="shrink-0 text-muted-foreground/30 mx-0.5"
                  aria-hidden
                />
              )}
            </div>
          );
        })}

        {/* Ambient Sync Status Indicator */}
        <div className="ml-auto hidden md:flex items-center gap-2 text-[11px] text-muted-foreground shrink-0 pl-3 border-l border-stroke-subtle font-sans">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span>Pipeline In Sync</span>
        </div>
      </div>
    </div>
  );
};
