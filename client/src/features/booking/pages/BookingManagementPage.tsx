import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { RefreshCw, Building2, XCircle } from "lucide-react"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import { DataTable } from "@/shared/components/data-table"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import type { Booking } from "../types/booking.types"
import { ROLE, type RoleType } from "@/shared/constants/role.const"
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
    bookings,
    filteredBookings,
    isLoading,
    error,
    managedStation,
    isFetchingManagerStation,
    selectedBookingForCancel,
    setSelectedBookingForCancel,
    cancellationReason,
    setCancellationReason,
    isSubmittingCancel,
    updateParams,
    handleConfirmCancel,
    handleRefresh,
  } = useBookingList({ isManager, isOwner })

  // Operational HUD Stats
  const stats: StatItem[] = useMemo(() => {
    const totalCount = bookings.length
    const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length
    const inProgressCount = bookings.filter((b) => b.status === "CHECKED_IN" || b.status === "IN_SERVICE" || b.status === "IN_PROGRESS").length
    const completedCount = bookings.filter((b) => b.status === "COMPLETED").length
    const totalRevenue = bookings
      .filter((b) => b.status === "COMPLETED")
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
  }, [bookings, isManager, isOwner, managedStation])

  // Columns definition
  const columns = useMemo(
    () =>
      getManagementColumns({
        onNavigate: (id) => navigate(`/bookings/${id}`),
        isManager,
      }),
    [navigate, isManager]
  )

  const paginationMeta = useMemo(() => {
    const total = filteredBookings.length
    const limit = 10
    const totalPages = Math.max(1, Math.ceil(total / limit))
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  }, [filteredBookings.length, page])

  const backPath = isAdmin
    ? "/admin/dashboard"
    : isOwner
      ? "/owner/dashboard"
      : isManager
        ? "/manager/dashboard"
        : "/"

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-16 space-y-6 min-h-screen text-left animate-in fade-in duration-300">
      {/* Breadcrumb Bar */}
      <Breadcrumbs
        items={[
          {
            label: isAdmin ? "Admin" : isOwner ? "Owner" : isManager ? "Manager" : "Home",
            path: backPath,
          },
          { label: "Booking Management" },
        ]}
      />

      {/* Top Header Row with Heading & Parallel Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Booking Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Monitor, update, and manage customer wash reservations and queue operations
          </p>
        </div>

        {/* Manager Assigned Station Badge or Info */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isOwner && ownerStations.length > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground shadow-xs">
              <Building2 size={15} className="text-primary shrink-0" />
              <select
                value={selectedStationId}
                onChange={(e) => updateParams({ stationId: e.target.value, page: 1 })}
                className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL" className="bg-card text-foreground">
                  All Stations ({ownerStations.length})
                </option>
                {ownerStations.map((st) => (
                  <option key={st.id} value={st.id} className="bg-card text-foreground">
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isManager && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground shadow-xs">
              <Building2 size={15} className="text-primary shrink-0" />
              <span>
                {isFetchingManagerStation
                  ? "Loading Station..."
                  : managedStation
                    ? managedStation.stationName
                    : "Assigned Station"}
              </span>
            </div>
          )}

          {/* Parallel Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin text-primary" : "text-primary"} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={handleRefresh} className="underline hover:opacity-80 text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Operational Stats HUD */}
      <StatsHUD stats={stats} />

      {/* Management DataTable */}
      <DataTable<Booking>
        data={filteredBookings}
        columns={columns}
        rowKey={(r) => r.id}
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
        isLoading={isLoading}
        emptyMessage="No bookings found. There are no reservations matching your current search or status filter."
        pagination={paginationMeta}
        onPageChange={(p: number) => updateParams({ page: p })}
      />

      {/* Operational Cancel Modal */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <XCircle className="text-red-400" size={20} />
                <span>Cancel Booking</span>
              </h3>
              <button
                onClick={() => setSelectedBookingForCancel(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
              >
                <XCircle size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to cancel booking{" "}
              <strong className="text-foreground">{selectedBookingForCancel.bookingNumber}</strong> for{" "}
              <span className="font-bold text-foreground">{selectedBookingForCancel.customerName}</span>?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Staff Cancellation Note
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Reason for staff cancellation..."
                rows={3}
                className="w-full p-3 rounded-xl bg-muted/50 border border-border text-foreground text-xs focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForCancel(null)}
                className="px-4 py-2 rounded-xl border border-border bg-muted/60 text-muted-foreground hover:text-foreground text-xs font-bold transition-all"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmittingCancel ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
