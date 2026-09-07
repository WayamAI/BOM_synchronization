import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface HealthArcProps {
  value: number; // 0–100
  label: string;
  tone?: "primary" | "success" | "warning" | "danger";
  micro?: { label: string; value: string }[];
  className?: string;
}

const toneStroke: Record<string, string> = {
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--critical))",
};

export const HealthArc = ({
  value,
  label,
  tone = "primary",
  micro = [],
  className,
}: HealthArcProps) => {
  const [v, setV] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 800;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const r = 70;
  const c = Math.PI * r;
  const offset = c - (v / 100) * c;

  return (
    <div
      role="img"
      aria-label={`${label}, ${Math.round(value)} percent`}
      className={cn(
        "rounded-lg border border-border bg-card p-3.5 shadow-none relative flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </div>
        <div className="flex items-center justify-center my-1 relative">
          <svg viewBox="0 0 180 96" className="w-full max-w-[190px]" aria-hidden="true">
            {/* Subtle technical track */}
            <path
              d="M 20 86 A 70 70 0 0 1 160 86"
              fill="none"
              stroke="currentColor"
              className="text-muted/30"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Value arc */}
            <path
              d="M 20 86 A 70 70 0 0 1 160 86"
              fill="none"
              stroke={toneStroke[tone]}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5 pointer-events-none">
            <div className="text-2xl font-bold font-display tabular-nums text-foreground tracking-tight">
              {Math.round(v)}
              <span className="text-xs font-normal text-muted-foreground ml-0.5">%</span>
            </div>
          </div>
        </div>
      </div>

      {micro.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-border/50">
          {micro.map(m => (
            <div key={m.label} className="text-center">
              <div className="text-xs font-semibold tabular-nums text-foreground">{m.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{m.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
