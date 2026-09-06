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
  variant?: "line" | "pills"
}

export const ScrollableTabs: React.FC<ScrollableTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  variant = "line",
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()

      const activeFocusedIndex = tabs.findIndex(
        (t) => tabRefs.current[t.id] === document.activeElement
      )

      let nextIndex: number
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

  if (variant === "pills") {
    return (
      <div
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`relative flex items-center group outline-none p-1 bg-muted/40 rounded-xl border border-border/40 ${className}`}
      >
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Scroll left"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div
          ref={containerRef}
          onScroll={checkScroll}
          className="flex items-center gap-1 overflow-x-auto scrollbar-none scroll-smooth w-full"
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
                className={`px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-background text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Scroll right"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={`relative flex items-center group outline-none border-b border-border/60 ${className}`}
    >
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="Scroll left"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="-mb-px flex items-center gap-1 overflow-x-auto scrollbar-none scroll-smooth w-full"
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
              className={`px-4 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 select-none border-b-2 rounded-t-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "bg-primary/5 text-primary border-primary font-bold"
                  : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title="Scroll right"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

export default ScrollableTabs
