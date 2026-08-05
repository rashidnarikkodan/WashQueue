import type { TabConfig, SelectFilter, ToggleFilter } from "./types"
import Search from "./Search"
import FilterBar from "./FilterBar"
import ScrollableTabs from "../ui/ScrollableTabs"

interface ToolbarProps {
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
}

const Toolbar = ({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  searchColSpan = "md:col-span-2",
  tabs = [],
  activeTab = "",
  onTabChange,
  selectFilters,
  toggleFilters,
}: ToolbarProps) => {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md overflow-hidden flex flex-col gap-4 p-1 shadow-md">
      {/* Tab strip with scroll arrows & arrow key navigation */}
      {tabs.length > 0 && (
        <div className="px-3 pt-3 border-b border-border/30">
          <ScrollableTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => onTabChange?.(tabId)}
          />
        </div>
      )}

      {/* Filters grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-5 px-5 pb-5 pt-2 items-end">
        {onSearchChange && (
          <Search
            value={searchQuery}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            label={searchLabel}
            className={searchColSpan}
          />
        )}
        <FilterBar selectFilters={selectFilters} toggleFilters={toggleFilters} />
      </div>
    </div>
  )
}

export default Toolbar
