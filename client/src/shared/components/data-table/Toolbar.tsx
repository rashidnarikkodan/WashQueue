import { useRef, useEffect, useState } from "react"
import type { TabConfig, SelectFilter, ToggleFilter } from "./types"
import Search from "./Search"
import FilterBar from "./FilterBar"

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
  activeTab,
  onTabChange,
  selectFilters,
  toggleFilters,
}: ToolbarProps) => {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const stripRef = useRef<HTMLDivElement>(null)

  // Move the sliding indicator to the active tab button
  useEffect(() => {
    if (!activeTab) return
    const btn = tabRefs.current[activeTab]
    const strip = stripRef.current
    if (!btn || !strip) return

    const stripRect = strip.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setIndicatorStyle({
      left: btnRect.left - stripRect.left,
      width: btnRect.width,
    })
  }, [activeTab, tabs])

  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md overflow-hidden flex flex-col gap-4 p-1 shadow-md">
      {/* Tab strip with sliding indicator */}
      {tabs.length > 0 && (
        <div
          ref={stripRef}
          className="border-b border-border/30 w-full flex gap-6 px-5 pt-3 relative"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const activeTextColor = tab.activeColor
              ? (tab.activeColor.split(" ").find((c) => c.startsWith("text-")) ?? "text-primary")
              : "text-primary"

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el
                }}
                onClick={() => onTabChange?.(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border-b-2 transition-all duration-300 ease-out cursor-pointer relative transform active:scale-95 ${
                  isActive
                    ? `bg-primary/10 ${activeTextColor} border-primary font-bold shadow-xs`
                    : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {tab.label}
              </button>
            )
          })}

          {/* Sliding underline indicator */}
          {activeTab && (
            <span
              className="absolute bottom-0 h-0.5 rounded-full transition-all duration-300 ease-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
                background: (() => {
                  const activeTabDef = tabs.find((t) => t.id === activeTab)
                  const colorClass = activeTabDef?.activeColor ?? ""
                  if (colorClass.includes("[#ADC6FF]")) return "#ADC6FF"
                  return "var(--color-primary, #60a5fa)"
                })(),
              }}
            />
          )}
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
