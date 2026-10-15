import type { DataTableProps } from "./types"
import TableHeader from "./TableHeader"
import TableBody from "./TableBody"
import Toolbar from "./Toolbar"
import Pagination from "@/shared/components/ui/Pagination"
import Loading from "@/shared/components/ui/Loading"

function DefaultMobileCard<T>({
  columns,
  row,
}: {
  columns: import("./types").Column<T>[]
  row: T
}) {
  const getCellContent = (col: import("./types").Column<T>) => {
    if (col.cell) return col.cell(row)
    if (col.accessor) return (row[col.accessor] as React.ReactNode) ?? "—"
    return "—"
  }

  const isActionCol = (c: import("./types").Column<T>) =>
    c.id.toLowerCase().includes("action") ||
    c.header.toLowerCase().includes("action") ||
    c.header.trim() === ""

  const actionCol = columns.find(isActionCol)
  const regularCols = columns.filter((c) => !isActionCol(c))
  const primaryCol = regularCols[0]
  const otherCols = regularCols.slice(1)

  return (
    <div className="bg-card/90 border border-border/70 rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:border-primary/30 transition-colors">
      {primaryCol && (
        <div className="flex items-start justify-between gap-2 pb-2 border-b border-border/40">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              {primaryCol.header}
            </span>
            <div className="text-sm font-bold text-foreground mt-0.5 break-words">
              {getCellContent(primaryCol)}
            </div>
          </div>
          {actionCol && (
            <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
              {getCellContent(actionCol)}
            </div>
          )}
        </div>
      )}

      {otherCols.length > 0 && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {otherCols.map((col) => (
            <div
              key={col.id}
              className="min-w-0 bg-muted/20 p-2 rounded-lg border border-border/30"
            >
              <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate mb-0.5">
                {col.header}
              </span>
              <div className="text-foreground font-semibold text-xs break-words">
                {getCellContent(col)}
              </div>
            </div>
          ))}
        </div>
      )}

      {!primaryCol && actionCol && (
        <div className="flex justify-end pt-2 border-t border-border/40">
          {getCellContent(actionCol)}
        </div>
      )}
    </div>
  )
}

function DataTable<T>({
  columns,
  data,
  rowKey,
  variant = "default",
  toolbar,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  tabs,
  activeTab,
  onTabChange,
  selectFilters,
  toggleFilters,
  isLoading = false,
  loadingText = "Loading...",
  errorMsg,
  emptyMessage,
  pagination,
  onPageChange,
  renderMobileCard,
}: DataTableProps<T>) {
  const hasFilters =
    (selectFilters && selectFilters.length > 0) || (toggleFilters && toggleFilters.length > 0)
  const searchColSpan = hasFilters ? "md:col-span-2" : "md:col-span-6"

  const hasBuiltInToolbar = onSearchChange || (tabs && tabs.length > 0) || hasFilters

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-full min-w-0">
      {toolbar
        ? toolbar
        : hasBuiltInToolbar && (
            <Toolbar
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              searchPlaceholder={searchPlaceholder}
              searchLabel={searchLabel}
              searchColSpan={searchColSpan}
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={onTabChange}
              selectFilters={selectFilters}
              toggleFilters={toggleFilters}
            />
          )}

      {isLoading ? (
        <Loading size="lg" text={loadingText} className="py-16 sm:py-20 gap-3" />
      ) : (
        <div
          key={activeTab ?? "__default__"}
          className={
            variant === "widget"
              ? "overflow-hidden w-full max-w-full min-w-0"
              : "border border-border bg-card rounded-xl sm:rounded-2xl shadow-xs sm:shadow-sm overflow-hidden animate-in fade-in slide-from-bottom-2 duration-200 w-full max-w-full min-w-0"
          }
        >
          {/* Mobile Card List (md:hidden) */}
          <div className="md:hidden divide-y divide-border/60">
            {data.length === 0 ? (
              <div className="py-12 px-4 text-center text-muted-foreground text-xs font-medium">
                {errorMsg ? (
                  <span className="text-rose-400 font-semibold">{errorMsg}</span>
                ) : (
                  emptyMessage || "No results found."
                )}
              </div>
            ) : (
              data.map((row, idx) => (
                <div key={rowKey(row)} className="p-3">
                  {renderMobileCard ? (
                    renderMobileCard(row, idx)
                  ) : (
                    <DefaultMobileCard columns={columns} row={row} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto w-full max-w-full custom-scrollbar">
            <table className="w-full text-sm text-left border-collapse">
              <TableHeader columns={columns} />
              <TableBody
                columns={columns}
                data={data}
                rowKey={rowKey}
                errorMsg={errorMsg}
                emptyMessage={emptyMessage}
              />
            </table>
          </div>

          {pagination && onPageChange && (
            <div className="border-t border-border/60 bg-card/30">
              <Pagination meta={pagination} onPageChange={onPageChange} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DataTable
