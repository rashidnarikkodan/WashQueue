import type { TabConfig, SelectFilter, ToggleFilter } from "./types"
import Search from "./Search"
import FilterBar from "./FilterBar"
import ScrollableTabs from "../ui/ScrollableTabs"

export interface DataTableToolbarProps {
  searchQuery?: string
  onSearchChange?: (q: string) => void
  searchPlaceholder?: string
  searchLabel?: string
  searchColSpan?: string
  tabs?: TabConfig[]
  activeTab?: string
  onTabChange?: (tab: string) => void
  selectFilters?: SelectFilter[]
  toggleFilters?: ToggleFilter[]
  className?: string
}

export function DataTableToolbar({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  searchColSpan,
  tabs = [],
  activeTab = "",
  onTabChange,
  selectFilters,
  toggleFilters,
  className = "",
}: DataTableToolbarProps) {
  const hasFilters =
    (selectFilters && selectFilters.length > 0) || (toggleFilters && toggleFilters.length > 0)
  const computedSearchColSpan = searchColSpan || (hasFilters ? "md:col-span-2" : "md:col-span-6")

  const hasContent = Boolean(onSearchChange || tabs.length > 0 || hasFilters)
  if (!hasContent) return null

  return (
    <div
      className={`rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md overflow-hidden flex flex-col gap-4 p-1 shadow-md ${className}`}
    >
      {tabs.length > 0 && (
        <div className="px-3 pt-3 border-b border-border/30">
          <ScrollableTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => onTabChange?.(tabId)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-5 px-5 pb-5 pt-2 items-end">
        {onSearchChange && (
          <Search
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            label={searchLabel}
            className={computedSearchColSpan}
          />
        )}
        <FilterBar selectFilters={selectFilters} toggleFilters={toggleFilters} />
      </div>
    </div>
  )
}

export default DataTableToolbar
