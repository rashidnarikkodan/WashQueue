// Main orchestrator
export { default as DataTable } from "./DataTable"

// Composable sub-components
export { default as Toolbar } from "./Toolbar"
export { default as Search } from "./Search"
export { default as FilterBar } from "./FilterBar"
export { default as TableHeader } from "./TableHeader"
export { default as TableBody } from "./TableBody"
export { default as TableRow } from "./TableRow"
export { default as EmptyState } from "./EmptyState"

// Types
export type {
  Column,
  TabConfig,
  SelectFilter,
  SelectFilterOption,
  ToggleFilter,
  DataTableProps,
  PaginationMeta,
} from "./types"
