import type { TabConfig } from "@/shared/components/data-table"

export const CUSTOMER_BOOKING_TABS: TabConfig[] = [
  { id: "ALL", label: "All" },
  { id: "CONFIRMED", label: "Upcoming" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "NO_SHOW", label: "No Show" },
]

export const MANAGEMENT_BOOKING_TABS: TabConfig[] = [
  { id: "ALL", label: "All Bookings" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "NO_SHOW", label: "No Show" },
]
