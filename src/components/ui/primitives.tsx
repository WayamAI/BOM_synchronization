import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

// Chronus shared primitives (CHRONUS_DESIGN_SYSTEM.md section 4).
// Components use semantic tokens only: bg-container, border-hairline, text-quaternary...

export type Tone = "success" | "info" | "warning" | "error" | "neutral";

const toneText: Record<Tone, string> = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  error: "text-error",
  neutral: "text-tertiary",
};

const toneDot: Record<Tone, string> = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  error: "bg-error",
  neutral: "bg-quaternary",
};

/** Unit or percent sign beside a Michroma value: Geist, same colour, slightly smaller. */
export const Unit = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("ml-0.5 font-sans text-[0.7em] tracking-normal", className)}>{children}</span>
);

/** Content card: 8px radius, hairline border, no shadow, optional eyebrow header. */
export const Panel = ({
  title,
  action,
  padded = true,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) => (
  <section className={cn("flex flex-col overflow-hidden rounded-lg border border-hairline bg-container", className)}>
    {title && (
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-hairline px-4">
        <h3 className="type-eyebrow truncate text-quaternary">{title}</h3>
        {action && <div className="shrink-0">{action}</div>}
      </header>
    )}
    <div className={cn("min-h-0 flex-1 overflow-auto", padded && "p-4", bodyClassName)}>{children}</div>
  </section>
);

/** KPI tile: eyebrow label, Michroma tabular value, signed delta and hint. */
export const KpiTile = ({
  label,
  value,
  unit,
  delta,
  tone = "neutral",
  hint,
  onClick,
  className,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: string;
  tone?: Tone;
  hint?: string;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  className?: string;
  valueClassName?: string;
}) => {
  const body = (
    <>
      <span className="type-eyebrow truncate text-quaternary">{label}</span>
      <span className={cn("type-display-xl sm:type-display-2xl tabular text-foreground", valueClassName)}>{value}{unit && <Unit>{unit}</Unit>}</span>
      {(delta || hint) && (
        <span className="flex items-baseline gap-2">
          {delta && <span className={cn("type-body-sm tabular", toneText[tone])}>{delta}</span>}
          {hint && <span className="type-caption truncate text-quaternary">{hint}</span>}
        </span>
      )}
    </>
  );
  const base = "flex min-w-0 flex-col gap-1.5 rounded-lg border border-hairline bg-container px-4 py-3.5 text-left";
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={cn(base, "outline-none transition-colors duration-[150ms] hover:border-strong focus-visible:ring-2 focus-visible:ring-active", className)}
    >
      {body}
    </button>
  ) : (
    <div className={cn(base, className)}>{body}</div>
  );
};

export const StatusDot = ({ tone = "neutral", className }: { tone?: Tone; className?: string }) => (
  <span aria-hidden className={cn("inline-block size-1.5 shrink-0 rounded-full", toneDot[tone], className)} />
);

/** Normal states are quiet: a status dot and plain text. Reserve solid Badges for states that need attention. */
export const QuietStatus = ({ tone = "success", children, className }: { tone?: Tone; children: ReactNode; className?: string }) => (
  <span className={cn("type-body-sm inline-flex items-center gap-1.5 whitespace-nowrap text-tertiary", className)}>
    <StatusDot tone={tone} />
    {children}
  </span>
);

/** BOM lifecycle state. Released and In Work are quiet; In Review and Obsolete get a solid badge. */
export const LifecycleStatus = ({ status }: { status?: string }) => {
  if (!status) return <span className="type-body-sm text-quaternary">—</span>;
  if (status === "In Review") return <Badge variant="warning">{status}</Badge>;
  if (status === "Obsolete") return <Badge variant="neutral">{status}</Badge>;
  return <QuietStatus tone={status === "In Work" ? "info" : "success"}>{status}</QuietStatus>;
};

/** Plain statement, no illustration, no call to action. */
export const EmptyState = ({ title = "Nothing to show", detail, className }: { title?: string; detail?: string; className?: string }) => (
  <div className={cn("flex min-h-[160px] flex-col items-center justify-center gap-1.5 px-6 text-center", className)}>
    <p className="type-body-md text-tertiary">{title}</p>
    {detail && <p className="type-body-sm text-quaternary">{detail}</p>}
  </div>
);
