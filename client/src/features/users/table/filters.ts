import type { SelectFilter } from "@/shared/components/data-table"
import { FILTER_STATUS } from "@/shared/constants/status.const"

interface BuildUserFiltersOptions {
  statusFilter: string
  setStatusFilter: (status: string) => void
}

export function buildUserFilters({
  statusFilter,
  setStatusFilter,
}: BuildUserFiltersOptions): {
  selectFilters: SelectFilter[]
} {
  const selectFilters: SelectFilter[] = [
    {
      id: "status",
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: "Any Status", value: FILTER_STATUS.ALL },
        { label: "Active", value: FILTER_STATUS.ACTIVE },
        { label: "Blocked", value: FILTER_STATUS.BLOCKED },
      ],
    },
  ]

  return { selectFilters }
}
