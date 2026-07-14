import type React from "react";
import type { PaginationMeta } from "@/shared/components/ui/Pagination";

export type { PaginationMeta };

// ─── Column Definition ────────────────────────────────────────────────────────

export interface Column<T> {
  id: string;
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

export interface TabConfig {
  /** Unique identifier matched against `activeTab` prop */
  id: string;
  label: string;
  /** Tailwind classes for border + text when this tab is active.
   *  Defaults to "border-primary text-primary" */
  activeColor?: string;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface SelectFilterOption {
  label: string;
  value: string;
}

export interface SelectFilter {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectFilterOption[];
}

export interface ToggleFilter {
  id: string;
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
  /** Tailwind classes applied to the track when ON. Defaults to "bg-primary/25 border border-primary/30" */
  activeColor?: string;
  /** Tailwind color class for the thumb when ON. Defaults to "bg-[#ADC6FF]" */
  thumbActiveColor?: string;
}

// ─── DataTable Props ──────────────────────────────────────────────────────────

export interface DataTableProps<T> {
  // Data
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;

  // Toolbar — search
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;

  // Toolbar — tabs
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;

  // Toolbar — filters
  selectFilters?: SelectFilter[];
  toggleFilters?: ToggleFilter[];

  // State
  isLoading?: boolean;
  loadingText?: string;
  errorMsg?: string | null;
  emptyMessage?: string;

  // Pagination
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}
