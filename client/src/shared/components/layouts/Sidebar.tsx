import { useEffect, useRef } from "react"
import { NavLink, useLocation } from "react-router-dom"
import type { SidebarItem } from "../../config/sidebar.config"

type Props = {
  items: SidebarItem[]
}

const Sidebar = ({ items }: Props) => {
  const location = useLocation()
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an editable field
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

        let nextIndex = 0
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
    <aside
      className="
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
        w-[76px]
        flex-col
        rounded-r-[2rem]
        border
        border-border/80
        bg-card/90
        backdrop-blur-md
        p-3
        [@media(max-height:800px)]:p-2
        transition-all
        duration-300
        hover:w-[280px]
        shadow-xl
        overflow-y-auto
        scrollbar-none
      "
    >
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
              className={({ isActive }) =>
                `
                flex
                items-center
                justify-center
                group-hover:justify-start
                overflow-hidden
                rounded-2xl
                p-3
                [@media(max-height:800px)]:p-2
                group-hover:px-4
                transition-all
                duration-200
                border
                focus:outline-none
                focus:ring-1
                focus:ring-primary
                focus:border-primary

                ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20"
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
                  max-w-0
                  opacity-0
                  overflow-hidden
                  transition-all
                  duration-200
                  group-hover:max-w-xs
                  group-hover:opacity-100
                  group-hover:ml-4
                "
              >
                {item.name}
              </span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
