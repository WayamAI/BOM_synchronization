// Chronus chart styling constants (CHRONUS_DESIGN_SYSTEM.md section 4.14).
// Always CSS variables, so charts follow the light/dark theme.

/** Series colour by position: blue, green, orange, red, grey, purple, then repeat. */
export const seriesColor = (index: number) => `var(--analytics-series-${(index % 6) + 1})`;

export const chartTooltipStyle = {
  background: "var(--surface-container)",
  border: "1px solid var(--stroke-muted)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--text-primary)",
};

export const chartTooltipLabelStyle = { color: "var(--text-primary)" };

/** Axis tick: 11px quaternary text, no axis line, no tick line (set on the axis). */
export const axisTick = { fill: "var(--text-quaternary)", fontSize: 11 };
