import type { TabConfig, SelectFilter, ToggleFilter } from "./types";
import Search from "./Search";
import FilterBar from "./FilterBar";

interface ToolbarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  /** Tailwind col-span class applied to the search container. Auto-computed by DataTable. */
  searchColSpan?: string;
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  selectFilters?: SelectFilter[];
  toggleFilters?: ToggleFilter[];
}

const Toolbar = ({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  searchColSpan = "md:col-span-2",
  tabs = [],
  activeTab,
  onTabChange,
  selectFilters,
  toggleFilters,
}: ToolbarProps) => (
  <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md overflow-hidden flex flex-col gap-4 p-1 shadow-md">
    {/* Tab strip */}
    {tabs.length > 0 && (
      <div className="border-b border-border/30 w-full flex gap-6 px-5 pt-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const activeClass = tab.activeColor ?? "border-primary text-primary";
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`pb-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer relative ${
                isActive
                  ? activeClass
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
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
);

export default Toolbar;
