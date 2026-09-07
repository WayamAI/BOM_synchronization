"use client";

import React, {
  Fragment,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { ChevronDown, ChevronRight, ChevronLeft, ArrowUpDown, ArrowUp, ArrowDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  /** Unique column identifier */
  id: string;
  /** Column header label */
  header: string;
  /** Cell rendering function */
  cell: (row: T) => ReactNode;
  /** Value extraction function for client-side sorting. Omit to make column unsortable. */
  sortValue?: (row: T) => string | number | boolean;
  /** Tailwind width class (e.g., "w-32", "w-48") */
  width?: string;
  /** Text and content alignment */
  align?: "left" | "right" | "center";
  /** Custom CSS classes for header cells */
  headerClassName?: string;
  /** Custom CSS classes for data cells */
  cellClassName?: string;
}

export type SortDirection = "asc" | "desc";

export interface EnterpriseTableProps<T> {
  /** Dataset rows */
  rows: T[];
  /** Strongly typed column definitions */
  columns: TableColumn<T>[];
  /** Required stable identifier extractor for React keys and expansion tracking */
  rowKey: (row: T) => string | number;
  /** Optional nested detail view beneath a row. Supplying this automatically adds an expander column. */
  renderExpanded?: (row: T) => ReactNode;
  /** Optional click handler for entire row */
  onRowClick?: (row: T) => void;
  /** Pre-expanded row keys (e.g. for deep links) */
  initialExpanded?: (string | number)[];
  /** Custom message or component when dataset is empty */
  emptyMessage?: ReactNode;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Minimum table width to ensure columns do not crunch before internal scroll engages (default: min-w-[700px]) */
  minWidth?: string;
  /** Compact density flag (row height ~36px instead of default ~40px) */
  dense?: boolean;
  /** Optional container class overrides */
  className?: string;
  /** Accessible table caption for assistive technology */
  caption?: string;
  /** Optional active/selected row key */
  selectedKey?: string | number;
  /** Number of rows per page (default: 25). Set to 0 to disable pagination. */
  pageSize?: number;
  /** Whether to freeze the first meaningful identity column during horizontal scroll (default: true) */
  stickyFirstColumn?: boolean;
  /** Whether to show the bottom pagination bar (default: true) */
  showPagination?: boolean;
}

/**
 * EnterpriseTable — Production-grade high-density data table for BOM Sync.
 * Architecturally adapted from Chronos DataTable with:
 * - Sticky header & sticky first identity column
 * - Full client-side bidirectional sorting (string, numeric, boolean)
 * - Accurate dataset-calculated pagination with range counters & pill controls
 * - Expandable sub-rows and row selection
 * - Geist typography (font-sans) and tabular numbers (tabular-nums), with ZERO monospace
 * - Restrained dark charcoal surface geometry (rounded-lg, subtle hairline borders)
 */
export function EnterpriseTable<T>({
  rows,
  columns,
  rowKey,
  renderExpanded,
  onRowClick,
  initialExpanded,
  emptyMessage = "No records found.",
  isLoading = false,
  minWidth = "min-w-[700px]",
  dense = false,
  className = "",
  caption,
  selectedKey,
  pageSize = 25,
  stickyFirstColumn = true,
  showPagination = true,
}: EnterpriseTableProps<T>) {
  const [sort, setSort] = useState<{ id: string; dir: SortDirection } | null>(null);
  const [expanded, setExpanded] = useState<(string | number)[]>(initialExpanded ?? []);
  const [page, setPage] = useState(0);

  // Reset pagination when dataset or sort changes
  useEffect(() => {
    setPage(0);
  }, [rows, sort]);

  // Client-side sorting logic
  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.id === sort.id);
    if (!column?.sortValue) return rows;

    const getValue = column.sortValue;
    return [...rows].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let cmp = 0;
      if (typeof valA === "number" && typeof valB === "number") {
        cmp = valA - valB;
      } else if (typeof valA === "boolean" && typeof valB === "boolean") {
        cmp = valA === valB ? 0 : valA ? 1 : -1;
      } else {
        cmp = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, columns, sort]);

  // Pagination calculations
  const effectivePageSize = pageSize > 0 ? pageSize : sortedRows.length || 1;
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / effectivePageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleRows =
    showPagination && pageSize > 0
      ? sortedRows.slice(currentPage * effectivePageSize, (currentPage + 1) * effectivePageSize)
      : sortedRows;

  const startRow = sortedRows.length > 0 ? currentPage * effectivePageSize + 1 : 0;
  const endRow = Math.min((currentPage + 1) * effectivePageSize, sortedRows.length);

  const toggleSort = (id: string) => {
    setSort((current) => {
      if (current?.id === id) {
        return { id, dir: current.dir === "asc" ? "desc" : "asc" };
      }
      return { id, dir: "asc" };
    });
  };

  const toggleExpanded = (key: string | number) => {
    setExpanded((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const colSpan = columns.length + (renderExpanded ? 1 : 0);

  // Loading skeleton state
  if (isLoading) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-card shadow-none",
          className
        )}
      >
        <div className="h-10 bg-card border-b border-border px-4 flex items-center">
          <div className="h-3 w-32 bg-surface-raised rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-2.5">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="h-9 bg-surface-raised/40 rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state container
  if (rows.length === 0) {
    if (typeof emptyMessage !== "string") {
      return (
        <div
          className={cn(
            "rounded-lg border border-border bg-card shadow-none overflow-hidden",
            className
          )}
        >
          {emptyMessage}
        </div>
      );
    }
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border border-border bg-card p-10 text-center shadow-none",
          className
        )}
      >
        <div className="h-10 w-10 rounded-full bg-surface-raised flex items-center justify-center mb-3">
          <Package className="h-5 w-5 text-muted-foreground/60" aria-hidden />
        </div>
        <div className="text-xs text-muted-foreground font-sans">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative isolate flex flex-col rounded-lg border border-border bg-card overflow-hidden shadow-none select-none",
        className
      )}
    >
      <div className="w-full overflow-x-auto scrollbar-thin flex-1 min-h-0">
        <table className={cn("w-full border-collapse text-left", minWidth)}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="sticky top-0 z-20 bg-card">
            <tr className="border-b border-border text-[10px] font-sans uppercase tracking-[0.08em] text-muted-foreground font-medium">
              {/* Expander column */}
              {renderExpanded && (
                <th
                  scope="col"
                  className={cn(
                    "w-10 px-2 py-2 text-center bg-card",
                    stickyFirstColumn && "sticky left-0 z-30"
                  )}
                />
              )}

              {columns.map((column, colIdx) => {
                const sortable = Boolean(column.sortValue);
                const isActiveSort = sort?.id === column.id;
                const alignClass =
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                    ? "text-center"
                    : "text-left";
                const isStickyCol = stickyFirstColumn && colIdx === 0;
                const stickyLeftOffset = renderExpanded ? 40 : 0;

                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={
                      isActiveSort
                        ? sort.dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={cn(
                      "px-3 py-2 font-medium text-muted-foreground whitespace-nowrap bg-card",
                      alignClass,
                      column.width,
                      isStickyCol && "sticky z-30 border-r border-border/40",
                      column.headerClassName
                    )}
                    style={isStickyCol ? { left: stickyLeftOffset } : undefined}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        aria-label={"Sort by " + column.header}
                        className={cn(
                          "inline-flex items-center gap-1.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded px-1 py-0.5 -mx-1",
                          isActiveSort && "text-foreground font-semibold",
                          column.align === "right" && "ml-auto flex-row-reverse"
                        )}
                      >
                        <span>{column.header}</span>
                        {isActiveSort ? (
                          sort.dir === "asc" ? (
                            <ArrowUp size={12} strokeWidth={2} className="text-primary" aria-hidden />
                          ) : (
                            <ArrowDown size={12} strokeWidth={2} className="text-primary" aria-hidden />
                          )
                        ) : (
                          <ArrowUpDown size={11} strokeWidth={1.5} className="opacity-30 group-hover:opacity-70" aria-hidden />
                        )}
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {visibleRows.map((row) => {
              const key = rowKey(row);
              const isOpen = expanded.includes(key);
              const isSelected = selectedKey !== undefined && selectedKey === key;
              const stickyBg = isSelected
                ? "bg-primary/10"
                : isOpen
                ? "bg-surface-raised/60"
                : "bg-card group-hover:bg-surface-raised";

              return (
                <Fragment key={key}>
                  <tr
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "group transition-colors duration-150 outline-none",
                      dense ? "h-9" : "h-10",
                      onRowClick && "cursor-pointer",
                      isSelected
                        ? "bg-primary/10 ring-1 ring-inset ring-primary/30"
                        : isOpen
                        ? "bg-surface-raised/40"
                        : "hover:bg-surface-raised",
                      "focus-visible:ring-1 focus-visible:ring-primary"
                    )}
                  >
                    {/* Expander toggle cell */}
                    {renderExpanded && (
                      <td
                        className={cn(
                          "w-10 px-2 text-center align-middle transition-colors",
                          stickyFirstColumn && cn("sticky left-0 z-10", stickyBg)
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => toggleExpanded(key)}
                          aria-expanded={isOpen}
                          aria-label={isOpen ? "Collapse row details" : "Expand row details"}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-raised hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        >
                          {isOpen ? (
                            <ChevronDown size={14} strokeWidth={2} aria-hidden />
                          ) : (
                            <ChevronRight size={14} strokeWidth={2} aria-hidden />
                          )}
                        </button>
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((column, colIdx) => {
                      const isStickyCol = stickyFirstColumn && colIdx === 0;
                      const stickyLeftOffset = renderExpanded ? 40 : 0;
                      const alignClass =
                        column.align === "right"
                          ? "text-right tabular-nums font-sans"
                          : column.align === "center"
                          ? "text-center"
                          : "text-left";

                      return (
                        <td
                          key={column.id}
                          className={cn(
                            "px-3 py-2 text-xs font-sans text-foreground whitespace-nowrap align-middle transition-colors",
                            alignClass,
                            isStickyCol && cn("sticky z-10 border-r border-border/40", stickyBg),
                            column.cellClassName
                          )}
                          style={isStickyCol ? { left: stickyLeftOffset } : undefined}
                        >
                          {column.cell(row)}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Inline Expandable Drawer Row */}
                  {renderExpanded && isOpen && (
                    <tr className="border-b border-border bg-surface-raised/30">
                      <td colSpan={colSpan} className="p-4 border-l-2 border-primary">
                        <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                          {renderExpanded(row)}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Production-Grade Chronos Pagination Bar */}
      {showPagination && sortedRows.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-4 py-2.5">
          <span className="text-xs text-muted-foreground font-sans">
            Showing <span className="tabular-nums font-medium text-foreground">{startRow}</span>–
            <span className="tabular-nums font-medium text-foreground">{endRow}</span> of{" "}
            <span className="tabular-nums font-medium text-foreground">{sortedRows.length}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              aria-label="Previous page"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-action px-3 py-1 text-xs font-sans text-muted-foreground transition-colors hover:border-border hover:bg-surface-raised hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={13} strokeWidth={1.75} aria-hidden />
              <span>Previous</span>
            </button>
            <span className="text-xs tabular-nums text-muted-foreground font-sans px-1">
              {currentPage + 1} / {pageCount}
            </span>
            <button
              type="button"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              aria-label="Next page"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-action px-3 py-1 text-xs font-sans text-muted-foreground transition-colors hover:border-border hover:bg-surface-raised hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
            >
              <span>Next</span>
              <ChevronRight size={13} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
