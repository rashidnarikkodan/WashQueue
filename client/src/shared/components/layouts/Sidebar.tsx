import { useState, useEffect, useRef } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { ChevronRight, X } from "lucide-react"
import type { SidebarItem } from "../../config/sidebar.config"

type Props = {
  items: SidebarItem[]
}

const Sidebar = ({ items }: Props) => {
  const location = useLocation()
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [isOpenMobile, setIsOpenMobile] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return
      }

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()

        const activeFocusedIndex = itemRefs.current.findIndex(
          (el) => el && el === document.activeElement
        )

        let nextIndex: number
        if (activeFocusedIndex !== -1) {
          if (e.key === "ArrowDown") {
            nextIndex = (activeFocusedIndex + 1) % items.length
          } else {
            nextIndex = (activeFocusedIndex - 1 + items.length) % items.length
          }
        } else {
          const currentActiveIndex = items.findIndex((item) =>
            location.pathname.startsWith(item.path)
          )
          if (currentActiveIndex !== -1) {
            nextIndex =
              e.key === "ArrowDown"
                ? (currentActiveIndex + 1) % items.length
                : (currentActiveIndex - 1 + items.length) % items.length
          } else {
            nextIndex = e.key === "ArrowDown" ? 0 : items.length - 1
          }
        }

        const targetEl = itemRefs.current[nextIndex]
        if (targetEl) {
          targetEl.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [items, location.pathname])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpenMobile(true)}
        aria-label="Open sidebar menu"
        className={`
          fixed left-0 top-24 z-50 md:hidden
          flex items-center justify-center
          w-7 h-12 rounded-r-xl
          bg-primary text-primary-foreground shadow-lg shadow-primary/20
          border border-l-0 border-primary/30
          transition-all duration-300 active:scale-95 cursor-pointer
          ${isOpenMobile ? "opacity-0 pointer-events-none -translate-x-full" : "opacity-100 translate-x-0"}
        `}
      >
        <ChevronRight size={18} className="animate-pulse" />
      </button>

      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          group
          fixed
          left-0
          top-[96px]
          [@media(max-height:800px)]:top-[80px]
          z-50
          flex
          h-auto
          max-h-[calc(100vh-120px)]
          [@media(max-height:800px)]:max-h-[calc(100vh-100px)]
          flex-col
          rounded-r-[2rem]
          border
          border-border/80
          bg-card/95
          backdrop-blur-md
          p-3
          [@media(max-height:800px)]:p-2
          transition-all
          duration-300
          shadow-xl
          overflow-y-auto
          scrollbar-none

          md:w-[76px]
          md:hover:w-[280px]
          md:translate-x-0

          ${isOpenMobile ? "w-[260px] translate-x-0" : "-translate-x-full w-[260px] md:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 md:hidden px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Navigation
          </span>
          <button
            type="button"
            onClick={() => setIsOpenMobile(false)}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 [@media(max-height:800px)]:gap-1 overflow-y-auto max-h-full scrollbar-none">
          {items.map((item, index) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                onClick={() => setIsOpenMobile(false)}
                className={({ isActive }) =>
                  `
                  flex
                  items-center
                  justify-start
                  md:justify-center
                  md:group-hover:justify-start
                  overflow-hidden
                  rounded-2xl
                  p-3
                  [@media(max-height:800px)]:p-2
                  px-4
                  md:px-3
                  md:group-hover:px-4
                  transition-all
                  duration-200
                  border
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary

                  ${
                    isActive
                      ? "bg-primary/10 text-primary border-primary/20 font-bold"
                      : "text-muted-foreground border-transparent hover:bg-muted/40 hover:text-foreground"
                  }
                `
                }
              >
                <div className="w-7 h-7 min-w-7 flex items-center justify-center">
                  <Icon size={20} />
                </div>

                <span
                  className="
                    whitespace-nowrap
                    text-sm
                    font-semibold
                    ml-3
                    md:ml-0
                    md:max-w-0
                    md:opacity-0
                    overflow-hidden
                    transition-all
                    duration-200
                    md:group-hover:max-w-xs
                    md:group-hover:opacity-100
                    md:group-hover:ml-4
                  "
                >
                  {item.name}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
