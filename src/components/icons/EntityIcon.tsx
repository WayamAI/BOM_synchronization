import { useState } from "react";
import { cn } from "@/lib/utils";
import { getEntityIcon, markUrl } from "./iconMap";

// Greyscale lucide icon for rows, tabs and chips. Decorative: always sits next to a text label.
export const EntityIcon = ({ id, className }: { id: string; className?: string }) => {
  const Icon = getEntityIcon(id).lucide;
  return <Icon aria-hidden strokeWidth={1.75} className={cn("size-3.5 shrink-0 text-tertiary", className)} />;
};

// Chronus mark: 44px page header, 36px card, 72px empty state. Empty alt because a text label is
// always next to it. Falls back to the lucide icon if the PNG is missing or fails to load.
export const EntityMark = ({ id, size, className }: { id: string; size: 36 | 44 | 72; className?: string }) => {
  const [failed, setFailed] = useState(false);
  const src = markUrl(id);
  if (!src || failed) {
    const Icon = getEntityIcon(id).lucide;
    return <Icon aria-hidden strokeWidth={1.5} style={{ width: size * 0.5, height: size * 0.5 }} className={cn("shrink-0 text-quaternary", className)} />;
  }
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      draggable={false}
      onError={() => setFailed(true)}
      data-entity-mark={id}
      className={cn("shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    />
  );
};

// Chronus glyph: a mark at 20 to 32px (96px cut) in panel headers, nav pucks, KPI tiles and system tiles.
// Decorative and always beside a text label. Falls back to the lucide icon if the PNG is missing or
// fails to load. Never use it for a status.
export const EntityGlyph = ({ id, size, className }: { id: string; size: 20 | 22 | 24 | 28 | 32; className?: string }) => {
  const [failed, setFailed] = useState(false);
  const src = markUrl(id, size);
  if (!src || failed) {
    const Icon = getEntityIcon(id).lucide;
    return <Icon aria-hidden strokeWidth={1.75} style={{ width: size * 0.8, height: size * 0.8 }} className={cn("shrink-0 text-tertiary", className)} />;
  }
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      draggable={false}
      onError={() => setFailed(true)}
      data-entity-glyph={id}
      className={cn("shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    />
  );
};
