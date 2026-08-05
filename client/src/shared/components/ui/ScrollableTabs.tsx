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

  return (
    <div
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={`relative flex items-center group outline-none ${className}`}
    >
      {/* Left Arrow Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="p-2 border-b-2 border-transparent bg-background/80 hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all duration-300 cursor-pointer shrink-0 select-none rounded-none focus:outline-none focus:ring-1 focus:ring-primary"
          title="Scroll left"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="flex items-center gap-0 overflow-x-auto scrollbar-none scroll-smooth py-0 px-0 w-full"
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
              className={`px-5 py-2.5 text-xs font-bold transition-all duration-300 ease-out cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 select-none rounded-none border-b-2 focus:outline-none focus:ring-1 focus:ring-primary ${
                isActive
                  ? "bg-primary/10 text-primary border-primary font-black"
                  : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/20"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-none ${
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
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="p-2 border-b-2 border-transparent bg-background/80 hover:bg-muted/30 text-muted-foreground hover:text-foreground transition-all duration-300 cursor-pointer shrink-0 select-none rounded-none focus:outline-none focus:ring-1 focus:ring-primary"
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
