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
  if (!src || failed) return <EntityIcon id={id} className={cn("text-quaternary", className)} />;
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
