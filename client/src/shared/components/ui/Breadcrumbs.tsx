import { Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-1.5 text-xs font-medium text-muted-foreground/80 py-1.5 overflow-x-auto scrollbar-none">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors duration-200"
      >
        <Home size={13} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <div key={index} className="flex items-center space-x-1.5">
            <ChevronRight size={12} className="text-muted-foreground/45 shrink-0" />
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="hover:text-foreground transition-colors duration-200 whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-semibold whitespace-nowrap">{item.label}</span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs
