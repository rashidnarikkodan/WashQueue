import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { RefreshCw } from "lucide-react"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import { DataTable, DataTableToolbar } from "@/shared/components/data-table"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import type { Booking } from "../types/booking.types"
import { ROLE, type RoleType } from "@/shared/constants/role.const"
import { BOOKING_STATUS } from "@/shared/constants/booking.constants"
import { MANAGEMENT_BOOKING_TABS } from "../config/booking-tabs.config"
import { getManagementColumns } from "../config/booking-columns.config"
import { useBookingList } from "../hooks/useBookingList"

interface BookingManagementPageProps {
  role?: RoleType
}

export default function BookingManagementPage({ role = ROLE.MANAGER }: BookingManagementPageProps) {
  const navigate = useNavigate()
  const isAdmin = role === ROLE.ADMIN
  const isOwner = role === ROLE.OWNER
  const isManager = role === ROLE.MANAGER

  const {
    searchQuery,
    activeTab,
    selectedStationId,
    ownerStations,
    page,
    pagination,
    filteredBookings,
    isLoading,
    error,
    managedStation,
    updateParams,
    handleRefresh,
  } = useBookingList({ isManager, isOwner, isAdmin })

  const isOwnerScopedToOwnStations = isOwner && selectedStationId === "ALL"

  const stats: StatItem[] = useMemo(() => {
    const totalCount = isOwnerScopedToOwnStations
      ? filteredBookings.length
      : (pagination?.total ?? filteredBookings.length)
    const confirmedCount = filteredBookings.filter(
      (b) => b.status === BOOKING_STATUS.CONFIRMED
    ).length
    const inProgressCount = filteredBookings.filter(
      (b) => b.status === BOOKING_STATUS.CHECKED_IN || b.status === BOOKING_STATUS.IN_SERVICE
    ).length
    const completedCount = filteredBookings.filter(
      (b) => b.status === BOOKING_STATUS.COMPLETED
    ).length
    const totalRevenue = filteredBookings
      .filter((b) => b.status === BOOKING_STATUS.COMPLETED)
      .reduce((sum, b) => sum + (b.amount || 0), 0)

    if (isManager) {
      return [
        {
          label: "Total Station Bookings",
          value: totalCount,
          subtext: managedStation ? `At ${managedStation.stationName}` : "Assigned station",
          color: "blue",
        },
        {
          label: "Active In-Bay Slots",
          value: inProgressCount,
          subtext: "Active washing slots",
          color: "amber",
        },
        {
          label: "Completed Slots",
          value: completedCount,
          subtext: "Finished today",
          color: "emerald",
        },
        {
          label: "Confirmed Upcoming",
          value: confirmedCount,
          subtext: "Next scheduled slots",
          color: "indigo",
        },
      ]
    }

    if (isOwner) {
      return [
        {
          label: "Total Owned Bookings",
          value: totalCount,
          subtext: "Across all stations",
          color: "blue",
        },
        {
          label: "Active Washing Slots",
          value: inProgressCount,
          subtext: "Currently in bay",
          color: "amber",
        },
        {
          label: "Completed Services",
          value: completedCount,
          subtext: "Successfully serviced",
          color: "emerald",
        },
        {
          label: "Gross Revenue",
          value: `₹${totalRevenue.toLocaleString("en-IN")}`,
          subtext: "From completed bookings",
          color: "indigo",
        },
      ]
    }

    return [
      {
        label: "System Total Bookings",
        value: totalCount,
        subtext: "Platform-wide volume",
        color: "blue",
      },
      {
        label: "Active In-Bay Washing",
        value: inProgressCount,
        subtext: "Live active queues",
        color: "amber",
      },
      {
        label: "Fulfilled Bookings",
        value: completedCount,
        subtext: "Successfully completed",
        color: "emerald",
      },
      {
        label: "Total Service Value",
        value: `₹${totalRevenue.toLocaleString("en-IN")}`,
        subtext: "System transaction volume",
        color: "indigo",
      },
    ]
  }, [
    filteredBookings,
    pagination?.total,
    isManager,
    isOwner,
    isOwnerScopedToOwnStations,
    managedStation,
  ])

  const basePath = isAdmin
    ? "/admin/bookings"
    : isOwner
      ? "/owner/bookings"
      : isManager
        ? "/manager/bookings"
        : "/bookings"

  const columns = useMemo(
    () =>
      getManagementColumns({
        onNavigate: (id) => navigate(`${basePath}/${id}`),
        isManager,
      }),
    [navigate, basePath, isManager]
  )

  const paginationMeta = useMemo(() => {
    const limit = pagination?.limit ?? 10
    const total = isOwnerScopedToOwnStations
      ? filteredBookings.length
      : (pagination?.total ?? filteredBookings.length)
    const totalPages = Math.max(1, Math.ceil(total / limit))
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  }, [pagination, isOwnerScopedToOwnStations, filteredBookings.length, page])

  const backPath = isAdmin
    ? "/admin/dashboard"
    : isOwner
      ? "/owner/dashboard"
      : isManager
        ? "/manager/dashboard"
        : "/"

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-16 space-y-6 min-h-screen text-left animate-in fade-in duration-300">
      <Breadcrumbs
        items={[
          {
            label: isAdmin ? "Admin" : isOwner ? "Owner" : isManager ? "Manager" : "Home",
            path: backPath,
          },
          { label: "Booking Management" },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Booking Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Monitor, update, and manage customer wash reservations and queue operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw
              size={15}
              className={isLoading ? "animate-spin text-primary" : "text-primary"}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={handleRefresh} className="underline hover:opacity-80 text-xs">
            Retry
          </button>
        </div>
      )}

      <StatsHUD stats={stats} />

      <DataTableToolbar
        tabs={MANAGEMENT_BOOKING_TABS}
        activeTab={activeTab}
        onTabChange={(tabId) => updateParams({ tab: tabId, page: 1 })}
        searchQuery={searchQuery}
        onSearchChange={(q) => updateParams({ q, page: 1 })}
        searchPlaceholder="Search booking ID, customer name, vehicle plate..."
        selectFilters={
          isOwner && ownerStations.length > 0
            ? [
                {
                  id: "stationFilter",
                  label: "Filter by Station",
                  value: selectedStationId,
                  onChange: (val) => updateParams({ stationId: val, page: 1 }),
                  options: [
                    { label: "All Stations", value: "ALL" },
                    ...ownerStations.map((st) => ({ label: st.name, value: st.id })),
                  ],
                },
              ]
            : undefined
        }
      />

      <DataTable<Booking>
        data={filteredBookings}
        columns={columns}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No bookings found. There are no reservations matching your current search or status filter."
        pagination={paginationMeta}
        onPageChange={(p: number) => updateParams({ page: p })}
      />
    </div>
  )
}
