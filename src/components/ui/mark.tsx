"use client";

import React from "react";

export type MarkId =
  | "mark-insight"
  | "mark-agent"
  | "mark-gate"
  | "mark-audit"
  | "mark-at-risk"
  | "mark-sparkline"
  | "mark-dirty-claim"
  | "mark-clean-claim"
  | "mark-vault"
  | "reason-complex-denial"
  | "status-open"
  | "status-in-progress"
  | "status-done"
  | string;

export function markSrc(id: MarkId): string {
  return `/images/marks/${id}.png`;
}

export interface MarkProps {
  id: MarkId;
  size?: number;
  className?: string;
}

/**
 * Decorative 3D mark adapted from Chronos design system.
 * Used for high-signal semantic meaning (intelligence, risk, audit, gate, status).
 */
export function Mark({ id, size = 32, className = "" }: MarkProps) {
  return (
    <img
      src={markSrc(id)}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={`pointer-events-none shrink-0 select-none object-contain ${className}`}
    />
  );
}
