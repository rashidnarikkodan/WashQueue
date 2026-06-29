import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

const Pagination = ({ meta, onPageChange }: PaginationProps) => {
  const { total, page, limit, totalPages, hasNextPage, hasPrevPage } = meta;

  if (totalPages <= 1) return null;

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  // Helper to generate page number buttons with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // page window size

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-6 border-t border-border bg-card/20 select-none">
      {/* Description text */}
      <div className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{startEntry}</span> to{" "}
        <span className="font-semibold text-foreground">{endEntry}</span> of{" "}
        <span className="font-semibold text-foreground">{total}</span> results
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1.5">
        {/* Prev Page Button */}
        <button
          onClick={() => hasPrevPage && onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:hover:bg-card hover:text-foreground transition-all cursor-pointer disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers list */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, index) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-9 h-9 flex items-center justify-center text-xs text-muted-foreground font-semibold"
                >
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isCurrent = pageNum === page;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  isCurrent
                    ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          onClick={() => hasNextPage && onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground disabled:opacity-50 disabled:hover:bg-card hover:text-foreground transition-all cursor-pointer disabled:cursor-not-allowed"
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
