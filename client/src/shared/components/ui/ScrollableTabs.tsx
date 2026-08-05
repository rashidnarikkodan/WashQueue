import React, { useRef, useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface TabItem {
  id: string
  label: string
  count?: number
  activeColor?: string
}

interface ScrollableTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export const ScrollableTabs: React.FC<ScrollableTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [checkScroll, tabs])

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!activeTab) return
    const activeBtn = tabRefs.current[activeTab]
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
    checkScroll()
  }, [activeTab, checkScroll])

  const scroll = (direction: "left" | "right") => {
    const el = containerRef.current
    if (!el) return
    const scrollAmount = direction === "left" ? -200 : 200
    el.scrollBy({ left: scrollAmount, behavior: "smooth" })
    setTimeout(checkScroll, 300)
  }

  // Keyboard Left / Right Arrow Key Focus Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()

      // Find which tab button currently has focus
      const activeFocusedIndex = tabs.findIndex(
        (t) => tabRefs.current[t.id] === document.activeElement
      )

      let nextIndex = 0
      if (activeFocusedIndex !== -1) {
        if (e.key === "ArrowRight") {
          nextIndex = (activeFocusedIndex + 1) % tabs.length
        } else {
          nextIndex = (activeFocusedIndex - 1 + tabs.length) % tabs.length
        }
      } else {
        const currentActiveIndex = tabs.findIndex((t) => t.id === activeTab)
        if (e.key === "ArrowRight") {
          nextIndex = currentActiveIndex < tabs.length - 1 ? currentActiveIndex + 1 : 0
        } else {
          nextIndex = currentActiveIndex > 0 ? currentActiveIndex - 1 : tabs.length - 1
        }
      }

      const targetTab = tabs[nextIndex]
      if (targetTab && tabRefs.current[targetTab.id]) {
        tabRefs.current[targetTab.id]?.focus()
      }
    }
  }

  if (tabs.length === 0) return null

  return (
    <div
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={`relative flex items-center group outline-none ${className}`}
    >
      {/* Left Arrow Button */}
      <button
        type="button"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className={`p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shrink-0 mr-1.5 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          canScrollLeft ? "opacity-100" : "opacity-60"
        }`}
        title="Scroll left"
        aria-label="Scroll left"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Tabs Container */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth py-1 px-0.5 w-full"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el
              }}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isActive
                  ? "bg-primary/10 text-primary border-primary/40 font-extrabold shadow-xs"
                  : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Right Arrow Button */}
      <button
        type="button"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className={`p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shrink-0 ml-1.5 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed select-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          canScrollRight ? "opacity-100" : "opacity-60"
        }`}
        title="Scroll right"
        aria-label="Scroll right"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

export default ScrollableTabs
