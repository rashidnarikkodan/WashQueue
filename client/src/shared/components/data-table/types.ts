import type React from "react"
import type { PaginationMeta } from "@/shared/components/ui/Pagination"

export type { PaginationMeta }

export interface Column<T> {
  id: string
  header: string
  accessor?: keyof T
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
  align?: "left" | "center" | "right"
}

export interface TabConfig {
  id: string
  label: string
  activeColor?: string
}

export interface SelectFilterOption {
  label: string
  value: string
}

export interface SelectFilter {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectFilterOption[]
}

export interface ToggleFilter {
  id: string
  label: string
  value: boolean
  onChange: (val: boolean) => void
  activeColor?: string
  thumbActiveColor?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string

  toolbar?: React.ReactNode

  searchQuery?: string
  onSearchChange?: (q: string) => void
  searchPlaceholder?: string
  searchLabel?: string

  tabs?: TabConfig[]
  activeTab?: string
  onTabChange?: (tab: string) => void

  selectFilters?: SelectFilter[]
  toggleFilters?: ToggleFilter[]

  isLoading?: boolean
  loadingText?: string
  errorMsg?: string | null
  emptyMessage?: string

  pagination?: PaginationMeta
  onPageChange?: (page: number) => void
}
