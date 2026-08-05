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

  const handlePrevTab = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab)
    if (currentIndex > 0) {
      onTabChange(tabs[currentIndex - 1].id)
    } else {
      scroll("left")
    }
  }

  const handleNextTab = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeTab)
    if (currentIndex < tabs.length - 1) {
      onTabChange(tabs[currentIndex + 1].id)
    } else {
      scroll("right")
    }
  }

  // Keyboard Left / Right Arrow Key Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      handlePrevTab()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      handleNextTab()
    }
  }

  if (tabs.length === 0) return null

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative flex items-center group focus:outline-none ${className}`}
    >
      {/* Left Arrow Button */}
      <button
        type="button"
        onClick={handlePrevTab}
        disabled={!canScrollLeft && tabs.findIndex((t) => t.id === activeTab) <= 0}
        className={`p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shrink-0 mr-1.5 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed select-none ${
          canScrollLeft ? "opacity-100" : "opacity-60"
        }`}
        title="Previous tab (Left Arrow)"
        aria-label="Previous tab"
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
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 select-none ${
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
        onClick={handleNextTab}
        disabled={!canScrollRight && tabs.findIndex((t) => t.id === activeTab) >= tabs.length - 1}
        className={`p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shrink-0 ml-1.5 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed select-none ${
          canScrollRight ? "opacity-100" : "opacity-60"
        }`}
        title="Next tab (Right Arrow)"
        aria-label="Next tab"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

export default ScrollableTabs
