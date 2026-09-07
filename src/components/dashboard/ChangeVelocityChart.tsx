"use client";

import { useMemo } from "react";
import {
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { ChangeVelocityEntry } from "@/lib/mockData";

export interface ChangeVelocityChartProps {
  data: ChangeVelocityEntry[];
  programName: string;
  className?: string;
}

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color?: string;
}

function ChangeVelocityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 shadow-xl text-[11px] font-sans">
      <div className="text-muted-foreground font-semibold uppercase tracking-wide mb-1.5 border-b border-border/50 pb-1">
        Week {label}
      </div>
      <div className="space-y-1">
        {payload.map((entry) => {
          const isApproved = entry.dataKey === "approved";
          const isRejected = entry.dataKey === "rejected";
          const colorClass = isApproved
            ? "text-success"
            : isRejected
            ? "text-critical"
            : "text-primary";
          const labelText = isApproved
            ? "Approved ECNs"
            : isRejected
            ? "Rejected ECNs"
            : "Cycle Time";
          const unit = entry.dataKey === "cycle" ? "d" : "";

          return (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isApproved
                      ? "bg-success"
                      : isRejected
                      ? "bg-critical"
                      : "bg-primary"
                  )}
                />
                <span>{labelText}:</span>
              </div>
              <span className={cn("font-bold tabular-nums", colorClass)}>
                {entry.value}
                {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChangeVelocityChart({
  data,
  programName,
  className,
}: ChangeVelocityChartProps) {
  return (
    <div
      role="region"
      aria-label={`Change Velocity chart for ${programName}`}
      className={cn(
        "rounded-lg border border-border bg-card p-3.5 shadow-none h-full min-h-[300px] flex flex-col justify-between",
        className
      )}
    >
      {/* Header with Title, Program Context & Disciplined Series Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5 mb-2.5">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            Change Velocity
          </h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            {programName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span>Approved</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-critical" />
              <span>Rejected</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-primary rounded-full" />
              <span>Cycle Time</span>
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[210px] w-full min-w-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border) / 0.5)"
            />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "hsl(var(--muted-foreground))",
                fontFamily: "var(--font-geist-sans, sans-serif)",
              }}
              dy={4}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 10,
                fill: "hsl(var(--muted-foreground))",
                fontFamily: "var(--font-geist-sans, sans-serif)",
              }}
              width={28}
            />
            <Tooltip content={<ChangeVelocityTooltip />} />
            <Bar
              dataKey="approved"
              name="Approved ECNs"
              stackId="a"
              fill="hsl(var(--success))"
              barSize={10}
            />
            <Bar
              dataKey="rejected"
              name="Rejected ECNs"
              stackId="a"
              fill="hsl(var(--critical))"
              barSize={10}
              radius={[2, 2, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="cycle"
              name="Cycle Time"
              stroke="hsl(var(--primary))"
              strokeWidth={1.75}
              dot={{
                r: 2,
                fill: "hsl(var(--card))",
                stroke: "hsl(var(--primary))",
                strokeWidth: 1.5,
              }}
              activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
