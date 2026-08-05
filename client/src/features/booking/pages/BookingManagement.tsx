import { useState, useEffect, useMemo, useCallback } from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { Clock, Car, RefreshCw } from "lucide-react"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import { DataTable, type Column, type TabConfig } from "@/shared/components/data-table"
import { StatsHUD, type StatItem } from "@/shared/components/stats"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { ROLE, type RoleType } from "@/shared/constants/role.const"
import { managerApi } from "@/shared/apis/manager.api"
import type { Booking, BookingStatus } from "../types/booking.types"

type ManagedStationItem = Awaited<ReturnType<typeof managerApi.getManagedStations>>[number]

interface BookingManagementProps {
  role?: RoleType
}

const BOOKING_TABS: TabConfig[] = [
  { id: "ALL", label: "All Bookings" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "NO_SHOW", label: "No Show" },
]

export default function BookingManagement({ role: propRole }: BookingManagementProps) {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()

  // Determine current role based on prop, pathname, or logged in user
  const currentRole: RoleType = useMemo(() => {
    if (propRole) return propRole
    if (location.pathname.startsWith("/admin")) return ROLE.ADMIN
    if (location.pathname.startsWith("/owner")) return ROLE.OWNER
    if (location.pathname.startsWith("/manager")) return ROLE.MANAGER
    return user?.role ? (user.role as RoleType) : ROLE.CUSTOMER
  }, [propRole, location.pathname, user?.role])

  const isAdmin = currentRole === ROLE.ADMIN
  const isOwner = currentRole === ROLE.OWNER
  const isManager = currentRole === ROLE.MANAGER

  // Query state from search params
  const searchQuery = searchParams.get("q") || ""
  const activeTab = (searchParams.get("tab") as BookingStatus) || "ALL"
  const page = parseInt(searchParams.get("page") || "1", 10)

  // Manager state for assigned station
  const [managedStation, setManagedStation] = useState<ManagedStationItem | null>(null)
  const [isFetchingManagerStation, setIsFetchingManagerStation] = useState(false)

  // Bookings list state
  const [bookings] = useState<Booking[]>([])
  const [isLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Auto-fetch manager's station if manager role
  useEffect(() => {
    if (isManager) {
      setIsFetchingManagerStation(true)
      managerApi
        .getManagedStations()
        .then((res) => {
          if (res && res.length > 0) {
            setManagedStation(res[0])
          }
        })
        .catch(() => {
          setError("Failed to fetch manager station assignment.")
        })
        .finally(() => {
          setIsFetchingManagerStation(false)
        })
    }
  }, [isManager])

  // Stat HUD Items dynamically calculated or structured based on role
  const stats: StatItem[] = useMemo(() => {
    const totalCount = bookings.length
    const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length
    const inProgressCount = bookings.filter((b) => b.status === "IN_PROGRESS").length
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

    // Admin view
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

  // Columns definition for DataTable
  const columns: Column<Booking>[] = useMemo(() => {
    const cols: Column<Booking>[] = [
      {
        id: "bookingNumber",
        header: "Booking ID",
        accessor: "bookingNumber",
        cell: (b) => (
          <div className="space-y-0.5 text-left">
            <span className="font-mono font-bold text-foreground text-xs">{b.bookingNumber}</span>
            <div className="text-[10px] text-muted-foreground">{b.slotDate}</div>
          </div>
        ),
      },
      {
        id: "customerName",
        header: "Customer",
        accessor: "customerName",
        cell: (b) => (
          <div className="space-y-0.5 text-left">
            <span className="font-bold text-foreground text-xs">{b.customerName}</span>
            {b.customerPhone && (
              <div className="text-[10px] text-muted-foreground">{b.customerPhone}</div>
            )}
          </div>
        ),
      },
    ]

    // Only render Station column if NOT a Manager (since Manager is already scoped to 1 station)
    if (!isManager) {
      cols.push({
        id: "stationName",
        header: "Station",
        accessor: "stationName",
        cell: (b) => (
          <div className="space-y-0.5 text-left">
            <span className="font-semibold text-foreground text-xs">{b.stationName}</span>
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
              {b.vehicleType && <span>({b.vehicleType})</span>}
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
      }
    )

    return cols
  }, [isManager])

  const backPath = isAdmin
    ? "/admin/dashboard"
    : isOwner
      ? "/owner/dashboard"
      : isManager
        ? "/manager/dashboard"
        : "/"

  return (
    <div className="space-y-6 min-h-screen text-left animate-in fade-in duration-300">
      {/* Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            {
              label: isAdmin ? "Admin" : isOwner ? "Owner" : isManager ? "Manager" : "Home",
              path: backPath,
            },
            { label: "Bookings Management" },
          ]}
        />

        {/* Header Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateParams({ refetch: Date.now() })}
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
            title="Refresh list"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border/80 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              Booking Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              {currentRole}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {isManager ? (
              <>
                Showing live queue and scheduled slot bookings for{" "}
                <strong className="text-foreground">
                  {managedStation ? managedStation.stationName : "your assigned station"}
                </strong>
                .
              </>
            ) : isOwner ? (
              "Monitor, filter, and track slot bookings across all your wash stations."
            ) : isAdmin ? (
              "System-wide booking monitoring and queue status control."
            ) : (
              "View and manage your upcoming vehicle wash bookings."
            )}
          </p>
        </div>
      </div>

      {/* Stats HUD */}
      <StatsHUD stats={stats} />

      {/* Main DataTable with Toolbar */}
      <DataTable<Booking>
        columns={columns}
        data={bookings}
        rowKey={(b) => b.id}
        searchQuery={searchQuery}
        onSearchChange={(q) => updateParams({ q })}
        searchPlaceholder={
          isManager
            ? "Search by booking #, customer, vehicle no..."
            : "Search by booking #, station, customer, vehicle no..."
        }
        searchLabel="Search Bookings"
        tabs={BOOKING_TABS}
        activeTab={activeTab}
        onTabChange={(tab) => updateParams({ tab })}
        isLoading={isLoading || isFetchingManagerStation}
        loadingText="Fetching booking records..."
        errorMsg={error}
        emptyMessage={
          isManager
            ? "No bookings found for your assigned station."
            : "No booking records match the selected filter."
        }
        pagination={{
          total: bookings.length,
          page: page,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        }}
        onPageChange={(p) => updateParams({ page: p })}
      />
    </div>
  )
}
