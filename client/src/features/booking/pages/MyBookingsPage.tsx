import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { RefreshCw, QrCode, XCircle } from "lucide-react"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import { DataTable, DataTableToolbar } from "@/shared/components/data-table"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import type { Booking } from "../types/booking.types"
import { CUSTOMER_BOOKING_TABS } from "../config/booking-tabs.config"
import { getCustomerColumns } from "../config/booking-columns.config"
import { useBookingList } from "../hooks/useBookingList"
import CancellationModal from "../components/CancellationModal"

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const {
    searchQuery,
    activeTab,
    page,
    pagination,
    bookings,
    filteredBookings,
    isLoading,
    error,
    selectedBookingForQr,
    setSelectedBookingForQr,
    selectedBookingForCancel,
    setSelectedBookingForCancel,
    updateParams,
    handleRefresh,
    cancelBooking,
  } = useBookingList()

  const stats: StatItem[] = useMemo(() => {
    const totalCount = pagination?.total ?? bookings.length
    const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length
    const completedCount = bookings.filter((b) => b.status === "COMPLETED").length

    return [
      {
        label: "Total Bookings",
        value: totalCount,
        subtext: "All-time vehicle washes",
        color: "blue",
      },
      {
        label: "Upcoming Wash Slots",
        value: confirmedCount,
        subtext: "Scheduled upcoming",
        color: "amber",
      },
      {
        label: "Completed Services",
        value: completedCount,
        subtext: "Successfully washed",
        color: "emerald",
      },
    ]
  }, [bookings, pagination?.total])

  const columns = useMemo(
    () =>
      getCustomerColumns({
        onNavigate: (id) => navigate(`/bookings/${id}`),
      }),
    [navigate]
  )

  const paginationMeta = useMemo(() => {
    if (pagination) return pagination
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
  }, [pagination, filteredBookings.length, page])

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-16 space-y-6 min-h-screen text-left animate-in fade-in duration-300">
      <Breadcrumbs items={[{ label: "Home", path: "/" }, { label: "My Bookings" }]} />

      <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            My Bookings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            View and manage your scheduled vehicle wash appointments and history
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="px-4 py-2.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
          title="Refresh list"
        >
          <RefreshCw
            size={15}
            className={isLoading ? "animate-spin text-primary" : "text-primary"}
          />
          <span>Refresh</span>
        </button>
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
        tabs={CUSTOMER_BOOKING_TABS}
        activeTab={activeTab}
        onTabChange={(tabId) => updateParams({ tab: tabId, page: 1 })}
        searchQuery={searchQuery}
        onSearchChange={(q) => updateParams({ q, page: 1 })}
        searchPlaceholder="Search booking ID, vehicle number, service..."
      />

      <DataTable<Booking>
        data={filteredBookings}
        columns={columns}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No bookings found. You don't have any bookings matching your current filter criteria."
        pagination={paginationMeta}
        onPageChange={(p: number) => updateParams({ page: p })}
      />

      {selectedBookingForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl text-center relative">
            <button
              onClick={() => setSelectedBookingForQr(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
            >
              <XCircle size={20} />
            </button>

            <div className="space-y-1 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                <QrCode size={14} />
                <span>{selectedBookingForQr.bookingNumber}</span>
              </div>
              <h3 className="text-lg font-extrabold text-foreground pt-2">Scan for Gate Entry</h3>
              <p className="text-xs text-muted-foreground">
                Show this QR code at the station entrance bay
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-center mx-auto w-48 h-48 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedBookingForQr.bookingNumber)}`}
                alt="Booking Ticket QR"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-3 rounded-xl bg-muted/60 text-xs text-muted-foreground space-y-1 text-left">
              <div className="flex justify-between font-medium">
                <span>Station:</span>
                <span className="font-bold text-foreground">
                  {selectedBookingForQr.stationName}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Slot:</span>
                <span className="font-bold text-foreground">{selectedBookingForQr.slotTime}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedBookingForQr(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
            >
              Close Ticket
            </button>
          </div>
        </div>
      )}

      {selectedBookingForCancel && (
        <CancellationModal
          booking={selectedBookingForCancel}
          isOpen={Boolean(selectedBookingForCancel)}
          onClose={() => setSelectedBookingForCancel(null)}
          onConfirmCancel={async (reason: string) => {
            await cancelBooking(selectedBookingForCancel.id, reason)
            handleRefresh()
          }}
          onBookAgain={() => navigate("/stations")}
          onBackToHome={() => navigate("/")}
        />
      )}
    </div>
  )
}
