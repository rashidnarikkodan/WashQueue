import type { DataTableProps } from "./types"
import TableHeader from "./TableHeader"
import TableBody from "./TableBody"
import Toolbar from "./Toolbar"
import Pagination from "@/shared/components/ui/Pagination"
import Loading from "@/shared/components/ui/Loading"

function DataTable<T>({
  columns,
  data,
  rowKey,
  // Toolbar
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  tabs,
  activeTab,
  onTabChange,
  selectFilters,
  toggleFilters,
  // State
  isLoading = false,
  loadingText = "Loading...",
  errorMsg,
  emptyMessage,
  // Pagination
  pagination,
  onPageChange,
}: DataTableProps<T>) {
  // Search takes full width only when no side-by-side select/toggle filters exist
  const hasFilters =
    (selectFilters && selectFilters.length > 0) || (toggleFilters && toggleFilters.length > 0)
  const searchColSpan = hasFilters ? "md:col-span-2" : "md:col-span-6"

  const hasToolbar = onSearchChange || (tabs && tabs.length > 0) || hasFilters

  return (
    <div className="space-y-4">
      {hasToolbar && (
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
        <Loading size="lg" text={loadingText} className="py-20 gap-3" />
      ) : (
        <div
          key={activeTab ?? "__default__"}
          className="border border-border/80 bg-card/60 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="overflow-x-auto">
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
