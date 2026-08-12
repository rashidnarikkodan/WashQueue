import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  Car,
  QrCode,
  ArrowRight,
  User,
  CheckCircle2,
  Play,
  CheckCheck,
  Building2,
  X,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { managerApi } from "@/shared/apis/manager.api"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse } from "@/shared/apis/booking.api"

export default function ManagerQueuePage() {
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
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* 1. Top Summary Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl sm:text-4xl font-black italic text-blue-300 tracking-tight">
              {stationInfo?.stationName || "Station Alpha-7"}
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
          <CalendarIcon className="h-4 w-4 text-blue-400" />
          <span>{currentDateFormatted}</span>
        </div>
      </div>

      {/* KPI Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Today's Bookings */}
        <div className="rounded-3xl bg-[#191F31] p-6 border border-slate-800/80 space-y-3 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            TODAY'S BOOKINGS
          </span>
          <div className="text-4xl font-extrabold text-blue-300">
            {isLoading ? "..." : todayBookingsCount}
          </div>
          <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <span>+12% from yesterday</span>
          </p>
        </div>

        {/* Card 2: Active Queue */}
        <div className="rounded-3xl bg-[#191F31] p-6 border border-slate-800/80 space-y-3 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            ACTIVE QUEUE
          </span>
          <div className="text-4xl font-extrabold text-blue-300">
            {isLoading ? "..." : activeQueueCount}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Est. Wait: {estimatedWaitMinutes}m</span>
          </p>
        </div>

        {/* Card 3: Avg Service Time */}
        <div className="rounded-3xl bg-[#191F31] p-6 border border-slate-800/80 space-y-3 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            AVG SERVICE TIME
          </span>
          <div className="text-4xl font-extrabold text-blue-300">18m</div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span>Target: 20m</span>
          </p>
        </div>

        {/* Card 4: New Check-in Action */}
        <div
          onClick={() => setIsCheckInOpen(true)}
          className="rounded-3xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 border border-blue-500/30 hover:border-blue-500 transition-all cursor-pointer space-y-3 flex flex-col justify-between group shadow-lg shadow-blue-500/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">
              NEW CHECK-IN
            </span>
            <QrCode className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Scan QR code or enter Booking ID to check in arriving customers.
          </p>
          <span className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Scan / Check-in <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

      </div>

      {/* 2. Main Operational Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px]">
        
        {/* Left Panel: Queue List (40% width / 5 Cols) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-400" />
              Booking Queue
            </h2>
            <span className="px-3 py-1 rounded-lg bg-slate-800/80 text-xs font-bold text-slate-400 border border-slate-700/60">
              FIFO Protocol
            </span>
          </div>

          {/* Next Up Highlight Card */}
          {nextUpBooking && (
            <div className="rounded-3xl bg-blue-500/10 border-2 border-blue-400/30 p-5 space-y-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-blue-400 uppercase">
                  NEXT UP
                </span>
                <h3 className="text-lg font-bold text-white">
                  {nextUpBooking.vehicleDetails?.brand || "Vehicle"} {nextUpBooking.vehicleDetails?.model || ""}
                </h3>
                <p className="text-xs text-slate-400">
                  {nextUpBooking.serviceType} Wash • {nextUpBooking.vehicleDetails?.registrationNumber || "Reg No"}
                </p>
              </div>
              <span className="text-2xl font-black text-blue-400/40">#01</span>
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
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === t.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/80 text-slate-400 hover:bg-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Queue List Items */}
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                Loading queue list...
              </div>
            ) : queueList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm space-y-2 bg-[#191F31] rounded-2xl border border-slate-800">
                <Sparkles className="h-8 w-8 text-slate-600 mx-auto" />
                <p>No active queued vehicles.</p>
              </div>
            ) : (
              queueList.map((b, idx) => {
                const isSelected = selectedBooking?.id === b.id
                const isWashing = b.status === "IN_SERVICE"

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer border flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-800/90 border-blue-400/80 shadow-lg shadow-blue-500/10"
                        : "bg-[#191F31] border-slate-800/80 hover:border-slate-700"
                    } ${isWashing ? "border-l-4 border-l-emerald-400" : ""}`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                        #{idx + 1}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {b.vehicleDetails?.brand || "Vehicle"} {b.vehicleDetails?.model || ""}
                        </h4>
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          {b.status.replace("_", " ")} • {b.serviceType} WASH
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-200">
                        {b.vehicleDetails?.model || "Vehicle"}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {b.vehicleDetails?.registrationNumber || ""}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active Session Detail (60% width / 7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#191F31] border border-slate-800/80 p-6 sm:p-8 space-y-6 flex flex-col justify-between relative overflow-hidden">
          
          <div className="space-y-6">
            
            {/* Session Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Active Session
              </h2>

              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                  IN PROGRESS:
                </span>
                <span className="font-mono text-sm font-bold text-blue-400">08:42</span>
              </div>
            </div>

            {selectedBooking ? (
              <div className="space-y-6">
                
                {/* Customer & Vehicle Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                  
                  {/* Customer Card */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      CUSTOMER DETAILS
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {selectedBooking.customerDetails?.name || selectedBooking.walkInCustomer?.name || "Customer"}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {selectedBooking.customerDetails?.phone || selectedBooking.walkInCustomer?.phone || "No Phone"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Model & Plate */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      VEHICLE INFORMATION
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {selectedBooking.vehicleDetails?.brand || ""} {selectedBooking.vehicleDetails?.model || "Vehicle"}
                      </h3>
                      <p className="text-sm font-mono font-bold text-blue-400">
                        {selectedBooking.vehicleDetails?.registrationNumber || selectedBooking.walkInVehicle?.registrationNumber || "Reg Plate"}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Service Details Box */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    SERVICE & PAYMENT DETAILS
                  </span>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {selectedBooking.serviceType} WASH PACKAGE
                      </h4>
                      <p className="text-xs text-slate-400">
                        Total Price: ₹{selectedBooking.pricingSnapshot?.totalPrice || 0}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                      {selectedBooking.paymentStatus}
                    </span>
                  </div>

                  {selectedBooking.extraServices && selectedBooking.extraServices.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Extra Services:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedBooking.extraServices.map((ex) => (
                          <span
                            key={ex.serviceId}
                            className="px-2.5 py-0.5 rounded-md bg-slate-800 text-[11px] font-semibold text-slate-300"
                          >
                            {ex.name} (+₹{ex.price})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Session Control Action Buttons */}
                <div className="pt-4 flex flex-wrap gap-3">
                  {selectedBooking.status === "CHECKED_IN" || selectedBooking.status === "CONFIRMED" ? (
                    <button
                      onClick={() => handleAdvanceStatus("IN_SERVICE")}
                      disabled={isAdvancing}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="h-4 w-4" />
                      Start Wash Service
                    </button>
                  ) : selectedBooking.status === "IN_SERVICE" ? (
                    <button
                      onClick={() => handleAdvanceStatus("SERVICE_COMPLETED")}
                      disabled={isAdvancing}
                      className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark Service Completed
                    </button>
                  ) : selectedBooking.status === "SERVICE_COMPLETED" ? (
                    <button
                      onClick={() => handleAdvanceStatus("COMPLETED")}
                      disabled={isAdvancing}
                      className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Handover
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold italic">
                      Session Completed / Closed
                    </span>
                  )}
                </div>

              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-sm space-y-2">
                <Car className="h-10 w-10 text-slate-600 mx-auto" />
                <p>Select a vehicle from the Queue List to inspect its session.</p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* New Check-In Modal */}
      {isCheckInOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <QrCode className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Customer Check-In</h3>
              </div>
              <button
                onClick={() => setIsCheckInOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Scan QR Token or Enter Booking ID
              </label>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#090D16] border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. WQ-9921 or QR Hash"
                />
              </div>
            </div>

            <button
              onClick={handleCheckInSubmit}
              disabled={isCheckInSubmitting}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              {isCheckInSubmitting ? "Checking In..." : "Confirm Customer Check-In"}
            </button>

          </div>
        </div>
      )}

    </div>
  )
}
