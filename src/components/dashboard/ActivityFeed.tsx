import { activityFeed } from "@/lib/mockData";
import { ArrowUpRight, Plus, Skull, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

const iconFor = (t: string) => {
  switch (t) {
    case "upgrade": return { Icon: ArrowUpRight, cls: "text-foreground bg-raised" };
    case "add": return { Icon: Plus, cls: "text-accent bg-raised" };
    case "cve": return { Icon: Skull, cls: "text-error bg-error-surface" };
    case "approval": return { Icon: CheckCircle2, cls: "text-success bg-success/10" };
    case "warning": return { Icon: AlertTriangle, cls: "text-warning bg-warning/10" };
    default: return { Icon: RefreshCw, cls: "text-tertiary bg-raised" };
  }
};

export const ActivityFeed = () => {
  return (
    <div className="rounded-xl border border-hairline bg-container shadow-card h-full flex flex-col">
      <div className="p-4 border-b border-hairline flex items-center justify-between">
        <h3 className="type-body-md font-semibold">Activity Pulse</h3>
        <span className="type-caption text-success flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
          LIVE
        </span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin max-h-[420px]">
        {activityFeed.map((e, i) => {
          const { Icon, cls } = iconFor(e.type);
          return (
            <div
              key={e.id}
              className="flex gap-3 p-3 border-b border-hairline last:border-0 hover:bg-raised cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className={`h-8 w-8 rounded-lg grid place-items-center shrink-0 ${cls}`}>
                <Icon aria-hidden className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="type-body-sm leading-snug">{e.text}</p>
                <p className="type-caption text-tertiary mt-0.5">{e.user} · {e.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
