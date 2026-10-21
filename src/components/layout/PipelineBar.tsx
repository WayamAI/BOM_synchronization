import { plural } from "@/lib/format";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { pipeline } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { EntityIcon } from "@/components/icons/EntityIcon";

const routes: Record<string, string> = {
  cat: "/variants", ebom: "/ebom", mbom: "/mbom", sbom: "/software", service: "/service",
};

const stageIcon: Record<string, string> = {
  cat: "variant", ebom: "ebom", mbom: "mbom", sbom: "software", service: "service-kit",
};

const dotClass = (h: string) => {
  if (h === "critical") return "bg-error";
  if (h === "warning")  return "bg-warning";
  return "bg-success";
};

// Slim lifecycle strip under the top bar, in Chronus chip style. It scrolls
// horizontally (scrollbar hidden) and fades on the right edge while more is off-screen.
export const PipelineBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scroller = useRef<HTMLDivElement>(null);
  const [moreRight, setMoreRight] = useState(false);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setMoreRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div className="relative shrink-0 border-b border-hairline bg-page">
      <div
        ref={scroller}
        onScroll={measure}
        className="flex h-10 items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden"
      >
        <span className="type-eyebrow mr-1 shrink-0 text-quaternary">Lifecycle</span>
        {pipeline.map((s, idx) => {
          const path = routes[s.id];
          const active = path && location.pathname === path;
          return (
            <div key={s.id} className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => path && navigate(path)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 type-body-sm font-medium outline-none transition-colors duration-[150ms] ease-out focus-visible:ring-2 focus-visible:ring-active",
                  active
                    ? "border-transparent bg-action-primary text-on-color"
                    : "border-hairline bg-action text-tertiary hover:border-strong hover:bg-raised-2 hover:text-secondary-foreground",
                )}
              >
                <span className={cn("size-1.5 rounded-full", dotClass(s.health))} />
                <EntityIcon id={stageIcon[s.id] ?? "part"} className={active ? "text-on-color" : undefined} />
                <span>{s.name}</span>
                <span className={cn("tabular hidden xl:inline", active ? "opacity-70" : "text-quaternary")}>
                  {plural(s.components, s.countLabel.replace(/s$/, ""), s.countLabel)} · {plural(s.issues, "issue")}
                </span>
                {s.drift && (
                  <span className={cn("hidden lg:inline", active ? "opacity-80" : "text-warning")}>
                    · {s.drift}
                  </span>
                )}
              </button>
              {idx < pipeline.length - 1 && <ChevronRight className="size-3 text-quaternary" aria-hidden />}
            </div>
          );
        })}
        <div className="type-caption ml-auto hidden shrink-0 items-center gap-1.5 pl-2 text-success md:flex">
          <span className="size-1.5 rounded-full bg-success" />
          Pipeline streaming live
        </div>
      </div>
      {moreRight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-page to-transparent"
        />
      )}
    </div>
  );
};
