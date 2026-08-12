import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  QrCode,
  PlusCircle,
  Car,
  Sparkles,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Building2,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { managerApi } from "@/shared/apis/manager.api"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse } from "@/shared/apis/booking.api"

export default function ManagerWalkInPage() {
  const navigate = useNavigate()
  const [stationInfo, setStationInfo] = useState<{
    stationId: string
    stationName: string
  } | null>(null)

  // Form State
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [category, setCategory] = useState("Car")
  const [vehicleClass, setVehicleClass] = useState("Sedan")
  const [serviceType, setServiceType] = useState<"HALF" | "FULL">("FULL")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  
  // Customer Details State
  const [phone, setPhone] = useState("")
  const [fullName, setFullName] = useState("")
  const [isCustomerFound, setIsCustomerFound] = useState(false)
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<BookingResponse | null>(null)

  // Fetch Station
  const fetchStation = useCallback(async () => {
    try {
      const stations = await managerApi.getManagedStations()
      if (stations && stations.length > 0) {
        setStationInfo({
          stationId: stations[0].stationId,
          stationName: stations[0].stationName,
        })
      }
    } catch (err) {
      console.error("Failed to load station:", err)
    }
  }, [])

  useEffect(() => {
    fetchStation()
  }, [fetchStation])

  // Customer Lookup Search
  const handleCustomerSearch = () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    setIsSearchingCustomer(true)
    setTimeout(() => {
      setIsSearchingCustomer(false)
      setIsCustomerFound(true)
      setFullName("John Doe")
      toast.success("Existing Customer Profile Found!")
    }, 600)
  }

  // Toggle Extra Services
  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Price Calculation
  const basePrice = serviceType === "HALF" ? 250 : 450
  const extraPriceMap: Record<string, number> = {
    "interior-cleaning": 150,
    "wax-polish": 200,
    "tire-shine": 50,
    "engine-cleaning": 300,
  }
  const extrasTotal = selectedExtras.reduce(
    (sum, exId) => sum + (extraPriceMap[exId] || 0),
    0
  )
  const grandTotal = basePrice + extrasTotal

  // Submit Walk-In Booking
  const handleCreateWalkIn = async () => {
    if (!stationInfo?.stationId) {
      toast.error("No active station assigned.")
      return
    }
    if (!registrationNumber.trim()) {
      toast.error("Please enter a vehicle registration number.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await bookingApi.createWalkIn({
        stationId: stationInfo.stationId,
        serviceType,
        walkInVehicle: {
          registrationNumber: registrationNumber.trim().toUpperCase(),
          categoryId: category,
          classId: vehicleClass,
        },
        walkInCustomer: fullName.trim()
          ? { name: fullName.trim(), phone: phone.trim() }
          : undefined,
        extraServiceIds: selectedExtras,
      })

      toast.success(`Walk-In booking created! Number: ${res.bookingNumber}`)
      setCreatedBooking(res)
    } catch (err: any) {
      console.error("Failed to create walk-in booking:", err)
      toast.error(err?.message || "Failed to create walk-in booking.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 sm:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-100 tracking-tight">
              Customer Arrival Desk
            </h1>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            Manage customer arrivals, booking check-ins, and walk-in bookings.
          </p>
        </div>
      </div>

      {/* Tab Navigation Pills */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-2">
        <button
          onClick={() => navigate("/manager/check-in")}
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
        >
          <QrCode className="h-4 w-4" />
          <span>[ Check-In ]</span>
        </button>

        <button
          className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm bg-blue-500/10 text-blue-400 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4 text-blue-400" />
          <span>[ Walk-In Booking ]</span>
        </button>
      </div>

      {/* Main Body 70%-30% Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (70% width / 8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Vehicle Details */}
          <div className="rounded-3xl bg-[#0F172A] border border-white/5 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Car className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Vehicle Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                  REGISTRATION NUMBER
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. MH 12 AB 1234"
                  className="w-full px-5 py-3.5 rounded-2xl bg-[#070D1F] border border-slate-800 text-white font-mono text-base font-bold focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-[#070D1F] border border-slate-800 text-white font-medium text-base focus:outline-none focus:border-blue-400 transition-colors cursor-pointer"
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Truck">Truck</option>
                </select>
              </div>

            </div>

            {/* Vehicle Class Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                CLASS
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Hatchback", "Sedan", "SUV", "Premium"].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setVehicleClass(cls)}
                    className={`py-3 px-4 rounded-2xl text-sm font-bold transition-all cursor-pointer border ${
                      vehicleClass === cls
                        ? "bg-blue-500/10 text-blue-300 border-blue-400/80 shadow-lg shadow-blue-500/10"
                        : "bg-[#070D1F] text-slate-400 border-white/5 hover:border-slate-700"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Card 2: Service Details */}
          <div className="rounded-3xl bg-[#0F172A] border border-white/5 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Sparkles className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Service Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Wash Type */}
              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                  WASH TYPE
                </span>

                <div className="space-y-3">
                  {[
                    { type: "HALF", name: "Half Wash", price: 250 },
                    { type: "FULL", name: "Full Wash", price: 450 },
                  ].map((w) => (
                    <div
                      key={w.type}
                      onClick={() => setServiceType(w.type as any)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        serviceType === w.type
                          ? "bg-slate-900 border-blue-400/80 shadow-md shadow-blue-500/10"
                          : "bg-[#070D1F] border-white/5 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                            serviceType === w.type
                              ? "bg-blue-400 border-blue-400 text-slate-900"
                              : "border-slate-600 bg-slate-800"
                          }`}
                        >
                          {serviceType === w.type && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-bold text-white">{w.name}</span>
                      </div>
                      <span className="text-sm font-extrabold text-blue-300">₹{w.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-On Extras */}
              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                  ADD-ON EXTRAS
                </span>

                <div className="space-y-2.5">
                  {[
                    { id: "interior-cleaning", label: "Interior Cleaning", price: 150 },
                    { id: "wax-polish", label: "Wax Polish", price: 200 },
                    { id: "tire-shine", label: "Tire Shine", price: 50 },
                    { id: "engine-cleaning", label: "Engine Cleaning", price: 300 },
                  ].map((ex) => {
                    const isChecked = selectedExtras.includes(ex.id)
                    return (
                      <div
                        key={ex.id}
                        onClick={() => toggleExtra(ex.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? "bg-slate-900 border-blue-400/60"
                            : "bg-[#070D1F] border-white/5 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-4 w-4 rounded border flex items-center justify-center ${
                              isChecked ? "bg-blue-400 border-blue-400 text-slate-900" : "border-slate-600"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-medium text-slate-300">{ex.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400">+₹{ex.price}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Card 3: Customer Details (Optional) */}
          <div className="rounded-3xl bg-[#0F172A] border border-white/5 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white">Customer Details (Optional)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                    PHONE NUMBER
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="flex-1 px-4 py-3.5 rounded-2xl bg-[#070D1F] border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleCustomerSearch}
                      disabled={isSearchingCustomer}
                      className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors cursor-pointer"
                    >
                      {isSearchingCustomer ? "..." : "Search"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#070D1F] border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
              </div>

              {/* Found Customer Card */}
              {isCustomerFound && (
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-emerald-400">Customer Found</span>
                      <h4 className="text-base font-bold text-white">{fullName}</h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-around pt-2 border-t border-emerald-500/20 text-center">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Visits</span>
                      <p className="text-lg font-bold text-white">12</p>
                    </div>
                    <div className="h-6 w-px bg-slate-700" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Last Visit</span>
                      <p className="text-lg font-bold text-white">4d ago</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Column (30% width / 4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Live Queue Status */}
          <div className="rounded-3xl bg-[#0F172A] border border-white/5 overflow-hidden space-y-6">
            
            <div className="p-4 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <Clock className="h-4 w-4" /> LIVE QUEUE AVAILABILITY
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-black uppercase">
                AVAILABLE
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  CURRENT WINDOW
                </span>
                <h3 className="text-2xl font-black text-white">09:00 AM - 09:30 AM</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">QUEUE LENGTH</span>
                  <p className="text-xl font-bold text-white">8</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">CAPACITY</span>
                  <p className="text-xl font-bold text-emerald-400">2 Slots</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">REMAINING</span>
                  <p className="text-xl font-bold text-blue-300">1 Walk-In</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">WAIT TIME</span>
                  <p className="text-xl font-bold text-white">22m</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Next Window</span>
                <span className="font-bold text-white">09:30 AM</span>
              </div>
            </div>

          </div>

          {/* Card 2: Booking Summary & Final Payment */}
          <div className="rounded-3xl bg-[#0F172A] border border-white/5 p-6 space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              Booking Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span>{serviceType} Wash</span>
                <span className="font-bold text-white">₹{basePrice}</span>
              </div>

              {extrasTotal > 0 && (
                <div className="flex items-center justify-between text-slate-300">
                  <span>Add-on Extras</span>
                  <span className="font-bold text-white">₹{extrasTotal}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base">
                <span className="font-extrabold text-white">Grand Total</span>
                <span className="font-black text-2xl text-blue-400">₹{grandTotal}</span>
              </div>
            </div>

            <button
              onClick={handleCreateWalkIn}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>{isSubmitting ? "Creating..." : "Create Walk-In & Print Ticket"}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Confirmation Modal */}
      {createdBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-6 text-center shadow-2xl animate-in zoom-in-95">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
            
            <div>
              <h3 className="text-2xl font-bold text-white">Walk-In Booking Created</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ticket #{createdBooking.bookingNumber} • Cash Paid: ₹{grandTotal}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCreatedBooking(null)
                  navigate("/manager/queues")
                }}
                className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all cursor-pointer"
              >
                Go to Queue Board
              </button>

              <button
                onClick={() => {
                  setCreatedBooking(null)
                  setRegistrationNumber("")
                }}
                className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors cursor-pointer"
              >
                New Booking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
