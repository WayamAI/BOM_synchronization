import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { pipeline } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const routes: Record<string, string> = {
  cat: "/variants", ebom: "/ebom", mbom: "/mbom", sbom: "/software", service: "/service",
};

const dotClass = (h: string) => {
  if (h === "critical") return "bg-critical";
  if (h === "warning")  return "bg-warning";
  return "bg-success";
};

export const PipelineBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur-md sticky top-16 z-30">
      <div className="px-5 py-3 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mr-3 shrink-0">
          Lifecycle
        </span>
        {pipeline.map((s, idx) => {
          const path = routes[s.id];
          const active = path && location.pathname === path;
          return (
            <div key={s.id} className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => path && navigate(path)}
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg border px-3 py-1.5 transition-all",
                  active
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-card hover:bg-muted/50"
                )}
              >
                <span className={cn("h-2 w-2 rounded-full animate-pulse-dot", dotClass(s.health))} />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold">{s.name}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {s.components.toLocaleString()} {s.countLabel} · {s.issues} issue{s.issues === 1 ? "" : "s"}
                  </span>
                </div>
                {s.drift && (
                  <span className="ml-1 flex items-center gap-1 text-[10px] text-warning">
                    <AlertTriangle className="h-3 w-3" />
                    {s.drift}
                  </span>
                )}
              </button>
              {idx < pipeline.length - 1 && (
                <svg width="20" height="16" viewBox="0 0 20 16" className="shrink-0 text-border">
                  <path d="M1 8 H14" stroke="currentColor" strokeWidth="1.25" fill="none" />
                  <path d="M13 4 L17 8 L13 12" stroke="currentColor" strokeWidth="1.25" fill="none" />
                </svg>
              )}
            </div>
          );
        })}
        <div className="ml-auto hidden md:flex items-center gap-1.5 text-[11px] text-success shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Pipeline streaming live
        </div>
      </div>
    </div>
  );
};
