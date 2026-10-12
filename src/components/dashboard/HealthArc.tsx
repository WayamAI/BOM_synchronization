import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0–100
  label: string;
  tone?: "primary" | "success" | "warning" | "danger";
  micro?: { label: string; value: string }[];
}

const toneStroke: Record<string, string> = {
  primary: "var(--action-primary-default)",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  danger: "hsl(var(--critical))",
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
    <div className="relative overflow-hidden rounded-lg border border-hairline bg-container p-4">
      <div className="relative">
        <div className="type-eyebrow text-quaternary">{label}</div>
        <div className="flex items-center justify-center mt-2 relative">
          <svg viewBox="0 0 180 100" className="w-full max-w-[220px]">
            <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="var(--surface-raised-x2)" strokeWidth="12" strokeLinecap="round" />
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
            <div className="type-display-2xl tabular text-foreground">{Math.round(v)}<span className="type-body-md text-tertiary">%</span></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {micro.map(m => (
            <div key={m.label} className="text-center">
              <div className="type-body-md tabular text-foreground">{m.value}</div>
              <div className="type-caption text-quaternary">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
