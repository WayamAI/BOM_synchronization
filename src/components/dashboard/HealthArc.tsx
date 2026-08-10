import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0–100
  label: string;
  tone?: "primary" | "success" | "warning" | "danger";
  micro?: { label: string; value: string }[];
}

const toneStroke: Record<string, string> = {
  primary: "url(#g-primary)",
  success: "url(#g-success)",
  warning: "url(#g-warning)",
  danger: "url(#g-danger)",
};

export const HealthArc = ({ value, label, tone = "primary", micro = [] }: Props) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
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
    <div className="rounded-xl border border-border bg-card p-5 shadow-card relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="relative">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
        <div className="flex items-center justify-center mt-2 relative">
          <svg viewBox="0 0 180 100" className="w-full max-w-[220px]">
            <defs>
              <linearGradient id="g-primary" x1="0" x2="1"><stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="100%" stopColor="hsl(var(--primary-glow))" /></linearGradient>
              <linearGradient id="g-success" x1="0" x2="1"><stop offset="0%" stopColor="hsl(var(--success))" /><stop offset="100%" stopColor="hsl(170 80% 50%)" /></linearGradient>
              <linearGradient id="g-warning" x1="0" x2="1"><stop offset="0%" stopColor="hsl(var(--warning))" /><stop offset="100%" stopColor="hsl(28 92% 58%)" /></linearGradient>
              <linearGradient id="g-danger" x1="0" x2="1"><stop offset="0%" stopColor="hsl(var(--critical))" /><stop offset="100%" stopColor="hsl(28 92% 58%)" /></linearGradient>
            </defs>
            <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="hsl(var(--secondary))" strokeWidth="12" strokeLinecap="round" />
            <path
              d="M 20 90 A 70 70 0 0 1 160 90"
              fill="none"
              stroke={toneStroke[tone]}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <div className="text-3xl font-bold tabular-nums">{Math.round(v)}<span className="text-base text-muted-foreground">%</span></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {micro.map(m => (
            <div key={m.label} className="text-center">
              <div className="text-sm font-semibold tabular-nums">{m.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
