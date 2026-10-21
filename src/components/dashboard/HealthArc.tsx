import { cn } from "@/lib/utils";
import { Unit } from "@/components/ui/primitives";

interface Props {
  value: number; // 0 to 100
  label: string;
  /** "higher-better": 85+ healthy, 65+ watch, below risk. "lower-better" (a risk share) is the mirror: 15 or less healthy, 35 or less watch. */
  direction?: "higher-better" | "lower-better";
  micro?: { label: string; value: string }[];
}

// Status colour follows the value, never the position of the card.
const gaugeStatus = (value: number, direction: Props["direction"] = "higher-better") => {
  const score = direction === "lower-better" ? 100 - value : value;
  if (score >= 85) return "success";
  if (score >= 65) return "warning";
  return "error";
};

const toneStroke = { success: "stroke-success", warning: "stroke-warning", error: "stroke-error" } as const;

export const HealthArc = ({ value, label, direction = "higher-better", micro = [] }: Props) => {
  const r = 70;
  const c = Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  const status = gaugeStatus(value, direction);

  return (
    <div className="rounded-lg border border-hairline bg-container p-4">
      <div className="type-eyebrow text-quaternary">{label}</div>
      <div className="relative mt-2 flex items-center justify-center">
        <svg viewBox="0 0 180 100" className="w-full max-w-[200px]" role="img" aria-label={`${label}: ${Math.round(value)} percent`}>
          <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" className="stroke-raised-2" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M 20 90 A 70 70 0 0 1 160 90"
            fill="none"
            className={toneStroke[status]}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <div className="type-display-xl tabular text-foreground">{Math.round(value)}<Unit>%</Unit></div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {micro.map(m => (
          <div key={m.label} className="text-center">
            <div className="type-body-md tabular text-foreground">{m.value}</div>
            <div className="type-caption whitespace-nowrap text-quaternary">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
