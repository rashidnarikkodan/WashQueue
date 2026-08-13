import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar as CalendarIcon,
  Clock,
  Car,
  QrCode,
  ArrowRight,
  Play,
  CheckCheck,
  Building2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { managerApi } from "@/shared/apis/manager.api"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse } from "@/shared/apis/booking.api"

export default function ManagerQueuePage() {
  const navigate = useNavigate()
  const [stationInfo, setStationInfo] = useState<{
    stationId: string
    stationName: string
  } | null>(null)
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [filterType, setFilterType] = useState<"ALL" | "QUEUED" | "IN_SERVICE" | "COMPLETED">("ALL")

  // Check-In Modal state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [qrInput, setQrInput] = useState("")
  const [isCheckInSubmitting, setIsCheckInSubmitting] = useState(false)

  // 1. Fetch Manager Station
  const fetchStationAndQueue = useCallback(async () => {
    setIsLoading(true)
    try {
      const stations = await managerApi.getManagedStations()
      if (stations && stations.length > 0) {
        const activeStation = stations[0]
        setStationInfo({
          stationId: activeStation.stationId,
          stationName: activeStation.stationName,
        })

        // Fetch bookings for this station
        const res = await bookingApi.getUserBookings({
          stationId: activeStation.stationId,
          limit: 50,
        })
        const bList = res.bookings || []
        setBookings(bList)

        // Default select the first active/in-service booking
        const firstActive = bList.find(
          (b: BookingResponse) => b.status === "IN_SERVICE" || b.status === "CHECKED_IN"
        )
        if (firstActive) {
          setSelectedBookingId(firstActive.id)
        } else if (bList.length > 0) {
          setSelectedBookingId(bList[0].id)
        }
      } else {
        toast.error("No active station assignment found for your manager account.")
      }
    } catch (err) {
      console.error("Failed to load queue data:", err)
      toast.error("Failed to load queue data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStationAndQueue()
  }, [fetchStationAndQueue])

  // Active Selected Booking
  const selectedBooking = useMemo(() => {
    return bookings.find((b) => b.id === selectedBookingId) || bookings[0] || null
  }, [bookings, selectedBookingId])

  // Filtered Queue List
  const queueList = useMemo(() => {
    return bookings.filter((b) => {
      if (filterType === "QUEUED") return b.status === "CONFIRMED" || b.status === "CHECKED_IN"
      if (filterType === "IN_SERVICE") return b.status === "IN_SERVICE"
      if (filterType === "COMPLETED") return b.status === "SERVICE_COMPLETED" || b.status === "COMPLETED"
      return b.status !== "CANCELLED" && b.status !== "NO_SHOW"
    })
  }, [bookings, filterType])

  // KPI Calculations
  const todayBookingsCount = bookings.length
  const activeQueueCount = bookings.filter(
    (b) => b.status === "CHECKED_IN" || b.status === "IN_SERVICE" || b.status === "CONFIRMED"
  ).length
  const estimatedWaitMinutes = activeQueueCount * 15

  // Next Up Booking (First checked-in or confirmed booking)
  const nextUpBooking = useMemo(() => {
    return bookings.find((b) => b.status === "CHECKED_IN" || b.status === "CONFIRMED")
  }, [bookings])

  // Handle Advance Booking Status
  const handleAdvanceStatus = async (targetStatus: string) => {
    if (!selectedBooking) return
    setIsAdvancing(true)
    try {
      const updated = await bookingApi.advanceStatus(selectedBooking.id, targetStatus)
      toast.success(`Booking status updated to ${targetStatus.replace("_", " ")}`)
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    } catch (err) {
      console.error("Status update error:", err)
      toast.error("Failed to update booking status")
    } finally {
      setIsAdvancing(false)
    }
  }

  // Handle QR / Booking ID Check-In
  const handleCheckInSubmit = async () => {
    if (!qrInput.trim()) {
      toast.error("Please enter a valid Booking ID or QR Token")
      return
    }

    setIsCheckInSubmitting(true)
    try {
      await bookingApi.checkIn(qrInput.trim())
      toast.success("Customer checked in successfully!")
      setIsCheckInOpen(false)
      setQrInput("")
      fetchStationAndQueue()
    } catch (err) {
      console.error("Check in error:", err)
      toast.error("Failed to check in customer. Verify QR Token / Booking ID.")
    } finally {
      setIsCheckInSubmitting(false)
    }
  }

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* 1. Top Summary Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-black italic text-foreground tracking-tight">
              {stationInfo?.stationName || "Station Manager Queue"}
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE STATION
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium bg-muted/60 px-4 py-2 rounded-xl border border-border">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <span>{currentDateFormatted}</span>
        </div>
      </div>

      {/* KPI Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Today's Bookings */}
        <div className="rounded-3xl bg-card text-card-foreground p-6 border border-border space-y-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            TODAY'S BOOKINGS
          </span>
          <div className="text-4xl font-extrabold text-primary">
            {isLoading ? "..." : todayBookingsCount}
          </div>
          <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
            <span>+12% from yesterday</span>
          </p>
        </div>

        {/* Card 2: Active Queue */}
        <div className="rounded-3xl bg-card text-card-foreground p-6 border border-border space-y-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ACTIVE QUEUE
          </span>
          <div className="text-4xl font-extrabold text-primary">
            {isLoading ? "..." : activeQueueCount}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Est. Wait: {estimatedWaitMinutes}m</span>
          </p>
        </div>

        {/* Card 3: Avg Service Time */}
        <div className="rounded-3xl bg-card text-card-foreground p-6 border border-border space-y-3 flex flex-col justify-between shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            AVG SERVICE TIME
          </span>
          <div className="text-4xl font-extrabold text-primary">18m</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>Target: 20m</span>
          </p>
        </div>

        {/* Card 4: New Check-in Action */}
        <div
          onClick={() => navigate("/manager/check-in")}
          className="rounded-3xl bg-card text-card-foreground p-6 border border-primary/40 hover:border-primary transition-all cursor-pointer space-y-3 flex flex-col justify-between group shadow-md shadow-primary/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
              NEW CHECK-IN
            </span>
            <QrCode className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Scan QR code or enter Booking ID to check in arriving customers.
          </p>
          <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Scan / Check-in <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

      </div>

      {/* 2. Main Operational Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
        
        {/* Left Panel: Queue List (40% width / 5 Cols) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Booking Queue
            </h2>
            <span className="px-3 py-1 rounded-lg bg-muted text-xs font-bold text-muted-foreground border border-border">
              FIFO Protocol
            </span>
          </div>

          {/* Next Up Highlight Card */}
          {nextUpBooking && (
            <div className="rounded-3xl bg-primary/10 border-2 border-primary/30 p-5 space-y-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-primary uppercase">
                  NEXT UP
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {nextUpBooking.vehicleDetails?.brand || "Vehicle"} {nextUpBooking.vehicleDetails?.model || ""}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {nextUpBooking.serviceType} Wash • {nextUpBooking.vehicleDetails?.registrationNumber || "Reg No"}
                </p>
              </div>
              <span className="text-2xl font-black text-primary/40">#01</span>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "ALL", label: "All Queue" },
              { id: "QUEUED", label: "Waiting" },
              { id: "IN_SERVICE", label: "In Service" },
              { id: "COMPLETED", label: "Completed" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  filterType === t.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Queue List Items */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Loading queue list...
              </div>
            ) : queueList.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm rounded-3xl bg-card border border-border">
                No bookings in this queue view.
              </div>
            ) : (
              queueList.map((item, index) => {
                const isSelected = item.id === selectedBookingId
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedBookingId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-card border-primary shadow-md shadow-primary/10"
                        : "bg-card/50 border-border hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">
                        #{item.bookingNumber || `WQ-${index + 1}`}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.status === "IN_SERVICE"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                            : item.status === "CHECKED_IN"
                            ? "bg-blue-500/10 text-blue-500 border border-blue-500/30"
                            : item.status === "COMPLETED" || item.status === "SERVICE_COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {item.vehicleDetails?.brand || "Car"} {item.vehicleDetails?.model || ""}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.vehicleDetails?.registrationNumber || item.walkInVehicle?.registrationNumber || "MH 12 AB 1234"}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-foreground block">
                          ₹{item.pricingSnapshot?.totalPrice || (item as any).totalAmount || 450}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{item.serviceType} Wash</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Session Inspector (60% width / 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 shadow-md">
            
            {!selectedBooking ? (
              <div className="py-24 text-center text-muted-foreground space-y-2">
                <Car className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-base font-bold text-foreground">Select a booking to view active bay session</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">
                      ACTIVE BAY INSPECTOR
                    </span>
                    <h3 className="text-2xl font-bold text-foreground">
                      Booking #{selectedBooking.bookingNumber}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      selectedBooking.status === "IN_SERVICE"
                        ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                        : selectedBooking.status === "CHECKED_IN"
                        ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {selectedBooking.status.replace("_", " ")}
                  </span>
                </div>

                {/* Grid Vehicle Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 p-5 rounded-2xl bg-muted/40 border border-border text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">VEHICLE</span>
                    <p className="text-sm font-bold text-foreground">
                      {selectedBooking.vehicleDetails?.brand || "Silver"} {selectedBooking.vehicleDetails?.model || "Sedan"}
                    </p>
                    <p className="font-mono text-muted-foreground">
                      {selectedBooking.vehicleDetails?.registrationNumber || selectedBooking.walkInVehicle?.registrationNumber || "KA 01 MR 7829"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">CUSTOMER</span>
                    <p className="text-sm font-bold text-foreground">
                      {selectedBooking.customerDetails?.name || selectedBooking.walkInCustomer?.name || "Rashid N."}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedBooking.customerDetails?.phone || selectedBooking.walkInCustomer?.phone || "+91 98450••••12"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">SERVICE TYPE</span>
                    <p className="text-sm font-bold text-primary">
                      {selectedBooking.serviceType} WASH
                    </p>
                    <p className="text-muted-foreground">₹{selectedBooking.pricingSnapshot?.totalPrice || (selectedBooking as any).totalAmount || 450}</p>
                  </div>
                </div>

                {/* Workflow Phase Stepper */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                    BAY WORKFLOW PROGRESSION
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Step 1: Pre-Service Inspection */}
                    <button
                      type="button"
                      onClick={() => navigate(`/manager/bookings/${selectedBooking.id}/inspection`)}
                      className="p-4 rounded-2xl bg-card border border-border hover:border-primary transition-all text-left space-y-2 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-primary uppercase">PHASE 01</span>
                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">Pre-Inspection</h4>
                      <p className="text-[11px] text-muted-foreground">Capture dents, scratches & photos</p>
                    </button>

                    {/* Step 2: Wash In-Service */}
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus("IN_SERVICE")}
                      disabled={isAdvancing || selectedBooking.status === "IN_SERVICE"}
                      className="p-4 rounded-2xl bg-card border border-border hover:border-primary transition-all text-left space-y-2 cursor-pointer disabled:opacity-50 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-500 uppercase">PHASE 02</span>
                        <Play className="h-4 w-4 text-amber-500" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">Start Washing</h4>
                      <p className="text-[11px] text-muted-foreground">Move vehicle into wash bay</p>
                    </button>

                    {/* Step 3: Post-Service Inspection */}
                    <button
                      type="button"
                      onClick={() => navigate(`/manager/bookings/${selectedBooking.id}/post-inspection`)}
                      className="p-4 rounded-2xl bg-card border border-border hover:border-primary transition-all text-left space-y-2 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">PHASE 03</span>
                        <CheckCheck className="h-4 w-4 text-emerald-500" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">Post-Inspection</h4>
                      <p className="text-[11px] text-muted-foreground">Final quality checklist & handover</p>
                    </button>

                  </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    Payment Status: <strong className="text-emerald-500 font-bold uppercase">{selectedBooking.paymentStatus}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAdvanceStatus("COMPLETED")}
                    disabled={isAdvancing || selectedBooking.status === "COMPLETED"}
                    className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xs hover:opacity-90 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    Mark Handover Complete
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

      </div>

      {/* Check-In Quick Modal */}
      {isCheckInOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-xl font-bold text-foreground">Customer Quick Check-In</h3>
              <button onClick={() => setIsCheckInOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  SCAN QR TOKEN OR BOOKING ID
                </label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="e.g. WQ-28472 or qr_token_..."
                  className="w-full px-4 py-3 rounded-2xl bg-muted border border-border text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <button
                onClick={handleCheckInSubmit}
                disabled={isCheckInSubmitting}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {isCheckInSubmitting ? "Processing..." : "Complete Check-In"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
