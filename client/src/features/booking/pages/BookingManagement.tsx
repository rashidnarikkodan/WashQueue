import { useState, useEffect, useMemo, useCallback } from "react"
import { useLocation, useSearchParams, useNavigate } from "react-router-dom"
import { Clock, Car, RefreshCw, QrCode, XCircle, Building2, CheckCircle2, Eye } from "lucide-react"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import { DataTable, type Column, type TabConfig } from "@/shared/components/data-table"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ROLE, VIEW_MODE, type RoleType } from "@/shared/constants/role.const"
import { managerApi } from "@/shared/apis/manager.api"
import { bookingApi } from "@/shared/apis/booking.api"
import { toast } from "sonner"
import type { Booking, BookingStatus, PaymentStatus } from "../types/booking.types"

type ManagedStationItem = Awaited<ReturnType<typeof managerApi.getManagedStations>>[number]

interface BookingManagementProps {
  role?: RoleType
}

const BOOKING_TABS: TabConfig[] = [
  { id: "ALL", label: "All Bookings" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled text" },
  { id: "NO_SHOW", label: "No Show" },
]

const CUSTOMER_BOOKING_TABS: TabConfig[] = [
  { id: "ALL", label: "All" },
  { id: "CONFIRMED", label: "Upcoming" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
]

export default function BookingManagement({ role: propRole }: BookingManagementProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, activeViewMode } = useAuthStore()

  // Determine current role dynamically based on activeViewMode, route, and user role
  const currentRole: RoleType = useMemo(() => {
    // Check path for admin dashboard override
    if (location.pathname.startsWith("/admin")) return ROLE.ADMIN

    // If user has switched activeViewMode (e.g. Manager/Owner viewing as Customer)
    if (activeViewMode === VIEW_MODE.CUSTOMER) return ROLE.CUSTOMER
    if (activeViewMode === VIEW_MODE.MANAGER) return ROLE.MANAGER
    if (activeViewMode === VIEW_MODE.OWNER) return ROLE.OWNER

    if (propRole) return propRole
    if (location.pathname.startsWith("/owner")) return ROLE.OWNER
    if (location.pathname.startsWith("/manager")) return ROLE.MANAGER

    return user?.role ? (user.role as RoleType) : ROLE.CUSTOMER
  }, [propRole, location.pathname, user?.role, activeViewMode])

  const isAdmin = currentRole === ROLE.ADMIN
  const isOwner = currentRole === ROLE.OWNER
  const isManager = currentRole === ROLE.MANAGER
  const isCustomer = !isAdmin && !isOwner && !isManager

  // Query state from search params
  const searchQuery = searchParams.get("q") || ""
  const activeTab = (searchParams.get("tab") as BookingStatus) || "ALL"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const refetchParam = searchParams.get("refetch")

  // Manager state for assigned station
  const [managedStation, setManagedStation] = useState<ManagedStationItem | null>(null)
  const [isFetchingManagerStation, setIsFetchingManagerStation] = useState(false)

  // Bookings list state
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modals state
  const [selectedBookingForQr, setSelectedBookingForQr] = useState<Booking | null>(null)
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false)

  // Update query params helper
  const updateParams = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      setSearchParams((prev) => {
        const updated = new URLSearchParams(prev)
        Object.entries(newParams).forEach(([key, val]) => {
          if (val === undefined || val === "" || val === 1 || val === "ALL") {
            updated.delete(key)
          } else {
            updated.set(key, String(val))
          }
        })
        return updated
      })
    },
    [setSearchParams]
  )

  // Fetch bookings helper
  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const type = activeTab === "CONFIRMED" ? "upcoming" : activeTab === "COMPLETED" || activeTab === "CANCELLED" ? "history" : "all"
      const res = await bookingApi.getUserBookings(type)

      const mapped: Booking[] = res.map((b) => {
        const startDate = new Date(b.scheduling.windowStart)
        const endDate = new Date(b.scheduling.windowEnd)
        const timeFormat = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const dateFormat = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

        const stationName = b.stationDetails?.name || "WashQueue Station"
        const customerName = b.customerDetails?.name || b.walkInCustomer?.name || (b.userId ? user?.name || "Customer" : "Walk-In Customer")
        const customerPhone = b.customerDetails?.phone || b.walkInCustomer?.phone || user?.phone || ""
        const vehicleNumber = b.vehicleDetails?.registrationNumber || b.walkInVehicle?.registrationNumber || "Vehicle Plate"
        const vehicleType = b.vehicleDetails?.brand
          ? `${b.vehicleDetails.brand} ${b.vehicleDetails.model || ""}`.trim()
          : "Vehicle"

        return {
          id: b.id,
          bookingNumber: b.bookingNumber,
          stationId: b.stationId,
          stationName,
          customerId: b.userId || "",
          customerName,
          customerPhone,
          serviceName: b.serviceType === "FULL" ? "Complete Full Wash" : "Express Half Wash",
          vehicleNumber,
          vehicleType,
          slotDate: dateFormat(startDate),
          slotTime: `${timeFormat(startDate)} - ${timeFormat(endDate)}`,
          amount: b.pricingSnapshot.totalPrice,
          paymentStatus: b.paymentStatus as PaymentStatus,
          status: b.status as BookingStatus,
          createdAt: b.createdAt,
        }
      })

      setBookings(mapped)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      console.error("Failed to fetch bookings:", err)
      setError(errorObj?.message || "Failed to load bookings")
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, user?.name, user?.phone])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const type = activeTab === "CONFIRMED" ? "upcoming" : activeTab === "COMPLETED" || activeTab === "CANCELLED" ? "history" : "all"
        const res = await bookingApi.getUserBookings(type)

        if (!isMounted) return

        const mapped: Booking[] = res.map((b) => {
          const startDate = new Date(b.scheduling.windowStart)
          const endDate = new Date(b.scheduling.windowEnd)
          const timeFormat = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          const dateFormat = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

          const stationName = b.stationDetails?.name || "WashQueue Station"
          const customerName = b.customerDetails?.name || b.walkInCustomer?.name || (b.userId ? user?.name || "Customer" : "Walk-In Customer")
          const customerPhone = b.customerDetails?.phone || b.walkInCustomer?.phone || user?.phone || ""
          const vehicleNumber = b.vehicleDetails?.registrationNumber || b.walkInVehicle?.registrationNumber || "Vehicle Plate"
          const vehicleType = b.vehicleDetails?.brand
            ? `${b.vehicleDetails.brand} ${b.vehicleDetails.model || ""}`.trim()
            : "Vehicle"

          return {
            id: b.id,
            bookingNumber: b.bookingNumber,
            stationId: b.stationId,
            stationName,
            customerId: b.userId || "",
            customerName,
            customerPhone,
            serviceName: b.serviceType === "FULL" ? "Complete Full Wash" : "Express Half Wash",
            vehicleNumber,
            vehicleType,
            slotDate: dateFormat(startDate),
            slotTime: `${timeFormat(startDate)} - ${timeFormat(endDate)}`,
            amount: b.pricingSnapshot.totalPrice,
            paymentStatus: b.paymentStatus as PaymentStatus,
            status: b.status as BookingStatus,
            createdAt: b.createdAt,
          }
        })

        setBookings(mapped)
      } catch (err: unknown) {
        const errorObj = err as { message?: string }
        if (isMounted) setError(errorObj?.message || "Failed to load bookings")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [activeTab, user?.name, user?.phone, refetchParam])

  // Filtered bookings calculation
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab !== "ALL") {
        if (activeTab === "IN_PROGRESS") {
          // Match in progress
        } else if (b.status !== activeTab) {
          return false
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          b.bookingNumber.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.stationName.toLowerCase().includes(q) ||
          b.serviceName.toLowerCase().includes(q) ||
          b.vehicleNumber.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [bookings, activeTab, searchQuery])

  // Auto-fetch manager's station if manager role
  useEffect(() => {
    if (!isManager) return
    let isMounted = true

    queueMicrotask(() => {
      if (isMounted) setIsFetchingManagerStation(true)
    })

    managerApi
      .getManagedStations()
      .then((res) => {
        if (isMounted && res && res.length > 0) {
          setManagedStation(res[0])
        }
      })
      .catch(() => {
        if (isMounted) setError("Failed to fetch manager station assignment.")
      })
      .finally(() => {
        if (isMounted) setIsFetchingManagerStation(false)
      })

    return () => {
      isMounted = false
    }
  }, [isManager])

  // Handle Cancel Submit
  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return
    setIsSubmittingCancel(true)
    try {
      await bookingApi.cancelBooking(selectedBookingForCancel.id, cancellationReason || "Customer requested cancellation")
      toast.success(`Booking ${selectedBookingForCancel.bookingNumber} cancelled successfully.`)
      setSelectedBookingForCancel(null)
      setCancellationReason("")
      fetchBookings()
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      toast.error(errorObj?.message || "Failed to cancel booking")
    } finally {
      setIsSubmittingCancel(false)
    }
  }

  // Stat HUD Items dynamically calculated or structured based on role
  const stats: StatItem[] = useMemo(() => {
    const totalCount = bookings.length
    const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length
    const inProgressCount = bookings.filter((b) => b.status === "CHECKED_IN" || b.status === "IN_SERVICE").length
    const completedCount = bookings.filter((b) => b.status === "COMPLETED").length
    const totalRevenue = bookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.amount || 0), 0)

    if (isManager) {
      return [
        {
          label: "Station Bookings Today",
          value: totalCount,
          subtext: managedStation ? managedStation.stationName : "Assigned Station",
          color: "blue",
        },
        {
          label: "In Progress Bays",
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

    if (isAdmin) {
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
    }

    return []
  }, [bookings, isManager, isOwner, isAdmin, managedStation])

  // Columns definition for DataTable
  const columns: Column<Booking>[] = useMemo(() => {
    const cols: Column<Booking>[] = [
      {
        id: "bookingNumber",
        header: "Booking ID",
        accessor: "bookingNumber",
        cell: (b) => (
          <div
            onClick={() => navigate(`/bookings/${b.id}`)}
            className="space-y-0.5 text-left cursor-pointer group"
          >
            <span className="font-mono font-bold text-foreground text-xs group-hover:text-primary transition-colors flex items-center gap-1">
              <span>{b.bookingNumber}</span>
              <Eye size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <div className="text-[10px] text-muted-foreground">{b.slotDate}</div>
          </div>
        ),
      },
    ]

    // Only show Customer column for Staff/Manager/Owner/Admin (redundant in Customer mode)
    if (!isCustomer) {
      cols.push({
        id: "customerName",
        header: "Customer",
        accessor: "customerName",
        cell: (b) => (
          <div className="space-y-0.5 text-left">
            <span className="font-bold text-foreground text-xs">{b.customerName}</span>
            {b.customerPhone && (
              <div className="text-[10px] text-muted-foreground font-mono">{b.customerPhone}</div>
            )}
          </div>
        ),
      })
    }

    // Station column
    if (!isManager) {
      cols.push({
        id: "stationName",
        header: "Wash Station",
        accessor: "stationName",
        cell: (b) => (
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
              <Building2 size={12} className="text-primary shrink-0" />
              <span>{b.stationName}</span>
            </div>
          </div>
        ),
      })
    }

    cols.push(
      {
        id: "serviceName",
        header: "Service & Vehicle",
        accessor: "serviceName",
        cell: (b) => (
          <div className="space-y-0.5 text-left">
            <span className="font-bold text-foreground text-xs">{b.serviceName}</span>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
              <Car size={10} />
              <span>{b.vehicleNumber}</span>
              {b.vehicleType && <span className="text-primary/90 font-sans">({b.vehicleType})</span>}
            </div>
          </div>
        ),
      },
      {
        id: "slotTime",
        header: "Slot Time",
        accessor: "slotTime",
        cell: (b) => (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground text-left">
            <Clock size={12} className="text-muted-foreground shrink-0" />
            <span>{b.slotTime}</span>
          </div>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        accessor: "amount",
        cell: (b) => (
          <div className="space-y-0.5 text-left">
            <span className="font-extrabold text-foreground text-xs">
              ₹{b.amount.toLocaleString("en-IN")}
            </span>
            <div className="text-[10px]">
              <span
                className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                  b.paymentStatus === "PAID"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : b.paymentStatus === "FAILED"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {b.paymentStatus}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        cell: (b) => {
          let badgeStyle = "bg-muted text-muted-foreground border-border"
          if (b.status === "COMPLETED")
            badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          if (b.status === "IN_PROGRESS")
            badgeStyle = "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse"
          if (b.status === "CONFIRMED")
            badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20"
          if (b.status === "CANCELLED")
            badgeStyle = "bg-red-500/10 text-red-400 border-red-500/20"

          return (
            <span
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider ${badgeStyle}`}
            >
              {b.status.replace("_", " ")}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        accessor: "id",
        cell: (b) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/bookings/${b.id}`)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-muted/60 text-foreground hover:bg-muted text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="View Details"
            >
              <Eye size={13} />
              <span>Details</span>
            </button>

            {b.status === "CONFIRMED" && (
              <button
                type="button"
                onClick={() => setSelectedBookingForQr(b)}
                className="px-2.5 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="View Check-In QR"
              >
                <QrCode size={13} />
                <span>QR Code</span>
              </button>
            )}

            {(b.status === "CONFIRMED" || b.status === "PENDING") && (
              <button
                type="button"
                onClick={() => setSelectedBookingForCancel(b)}
                className="px-2.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Cancel Booking"
              >
                <XCircle size={13} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        ),
      }
    )

    return cols
  }, [isCustomer, isManager, navigate])

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            {
              label: isAdmin ? "Admin" : isOwner ? "Owner" : isManager ? "Manager" : "Home",
              path: backPath,
            },
            { label: isCustomer ? "Bookings" : "Bookings Management" },
          ]}
        />

        {/* Header Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateParams({ refetch: Date.now() })}
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh list"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-primary" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Minimal Header */}
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {isCustomer ? "Bookings" : "Booking Management"}
          </h1>
          {!isCustomer && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {currentRole}
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground">
          {isCustomer ? (
            "View and track your upcoming, active, and past wash bookings."
          ) : isManager ? (
            <>
              Showing live queue and scheduled slot bookings for{" "}
              <strong className="text-foreground">
                {managedStation ? managedStation.stationName : "your assigned station"}
              </strong>
              .
            </>
          ) : isOwner ? (
            "Monitor, filter, and track slot bookings across all your wash stations."
          ) : (
            "System-wide booking monitoring and queue status control."
          )}
        </p>
      </div>

      {/* Stats HUD - Only shown for Management roles */}
      {!isCustomer && <StatsHUD stats={stats} />}

      {/* Main DataTable with Toolbar */}
      <DataTable<Booking>
        columns={columns}
        data={filteredBookings}
        rowKey={(b) => b.id}
        searchQuery={searchQuery}
        onSearchChange={(q) => updateParams({ q })}
        searchPlaceholder={
          isCustomer
            ? "Search by booking #, station, service, or vehicle..."
            : isManager
              ? "Search by booking #, customer, vehicle no..."
              : "Search by booking #, station, customer, vehicle no..."
        }
        searchLabel="Search Bookings"
        tabs={isCustomer ? CUSTOMER_BOOKING_TABS : BOOKING_TABS}
        activeTab={activeTab}
        onTabChange={(tab) => updateParams({ tab })}
        isLoading={isLoading || isFetchingManagerStation}
        loadingText="Fetching booking records..."
        errorMsg={error}
        emptyMessage={
          isCustomer
            ? "You don't have any bookings matching this filter."
            : isManager
              ? "No bookings found for your assigned station."
              : "No booking records match the selected filter."
        }
        pagination={{
          total: filteredBookings.length,
          page: page,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }}
        onPageChange={(p) => updateParams({ p })}
      />

      {/* QR Code Dialog */}
      {selectedBookingForQr && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border/80 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-foreground">Check-In Pass</h3>
              <p className="text-xs text-muted-foreground font-mono">
                {selectedBookingForQr.bookingNumber}
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl flex items-center justify-center border border-border">
              <div className="p-2 border-4 border-black rounded-lg text-black font-mono font-black text-center space-y-2">
                <QrCode size={140} className="text-black mx-auto" />
                <div className="text-[10px] tracking-widest uppercase text-slate-800">
                  {selectedBookingForQr.bookingNumber}
                </div>
              </div>
            </div>

            <div className="text-xs text-left bg-muted/40 p-3 rounded-xl space-y-1 border border-border/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Station:</span>
                <span className="font-bold text-foreground">{selectedBookingForQr.stationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slot:</span>
                <span className="font-bold text-foreground">{selectedBookingForQr.slotTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle:</span>
                <span className="font-mono font-bold text-foreground">{selectedBookingForQr.vehicleNumber}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBookingForQr(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border/80 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left">
            <div className="flex items-center gap-3 text-red-400">
              <XCircle size={24} />
              <h3 className="text-lg font-extrabold text-foreground">Cancel Booking</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to cancel booking <strong className="text-foreground font-mono">{selectedBookingForCancel.bookingNumber}</strong> at {selectedBookingForCancel.stationName}?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Reason for Cancellation</label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please state why you are cancelling..."
                className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-primary focus:outline-none min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForCancel(null)}
                disabled={isSubmittingCancel}
                className="px-4 py-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isSubmittingCancel ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Confirm Cancel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
