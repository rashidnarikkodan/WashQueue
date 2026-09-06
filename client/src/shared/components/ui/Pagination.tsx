import React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginationProps {
  meta: PaginationMeta | null | undefined
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  pageSizeOptions?: number[]
  variant?: "default" | "minimal" | "compact"
  showDetails?: boolean
  showFirstLast?: boolean
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  meta,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50, 100],
  variant = "default",
  showDetails = true,
  showFirstLast = false,
  className = "",
}) => {
  if (!meta || meta.totalPages <= 1) return null

  const { total, page, limit, totalPages, hasNextPage, hasPrevPage } = meta

  const startEntry = (page - 1) * limit + 1
  const endEntry = Math.min(page * limit, total)
  const isMinimal = variant === "minimal"
  const isCompact = variant === "compact"

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...")
      }
    }
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 py-2 px-2 select-none w-full ${className}`}
    >
      {showDetails && !isMinimal && (
        <div className="text-xs text-muted-foreground/90 font-medium flex items-center gap-2">
          <span>
            Showing <span className="font-semibold text-foreground">{startEntry}</span>–
            <span className="font-semibold text-foreground">{endEntry}</span> of{" "}
            <span className="font-semibold text-foreground">{total}</span>
          </span>

          {onLimitChange && (
            <div className="hidden md:flex items-center gap-1.5 ml-2 pl-3 border-l border-border/40">
              <span className="text-muted-foreground/70">Per page:</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="bg-transparent border border-border/40 hover:border-border text-foreground text-xs rounded-full px-2.5 py-0.5 font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors cursor-pointer"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt} className="bg-card text-foreground">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1">
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={!hasPrevPage}
            aria-label="First page"
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-25 disabled:pointer-events-none transition-all duration-150 cursor-pointer"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => hasPrevPage && onPageChange(page - 1)}
          disabled={!hasPrevPage}
          aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-25 disabled:pointer-events-none transition-all duration-150 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex sm:hidden items-center px-2 text-xs font-medium text-muted-foreground">
          <span className="font-semibold text-foreground">{page}</span>
          <span className="mx-1 opacity-50">/</span>
          <span>{totalPages}</span>
        </div>

        {!isCompact && (
          <div className="hidden sm:flex items-center gap-1">
            {pageNumbers.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 h-8 flex items-center justify-center text-xs text-muted-foreground/50 font-medium select-none"
                  >
                    •••
                  </span>
                )
              }

              const pageNum = p as number
              const isCurrent = pageNum === page

              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => onPageChange(pageNum)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isCurrent
                      ? "bg-primary text-primary-foreground font-bold shadow-xs shadow-primary/20 scale-105"
                      : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={() => hasNextPage && onPageChange(page + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-25 disabled:pointer-events-none transition-all duration-150 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            aria-label="Last page"
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-25 disabled:pointer-events-none transition-all duration-150 cursor-pointer"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </nav>
  )
}

export default Pagination
