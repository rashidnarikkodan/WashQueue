import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Star,
  CheckCircle2,
  Zap,
  Car,
  Users,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  FileText,
  Eye,
  Download,
  Upload,
  Loader2,
  MapPin,
  Ticket,
  Droplets,
  Wind,
  Clock,
} from "lucide-react"
import { useVehicleStore } from "../store/vehicleStore"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/vehicleCatelogStore"
import { useAuthStore } from "@/features/auth/store/authStore"
import AddVehicleModal from "../components/AddVehicleModal"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { toast } from "sonner"
import type { VehicleDocument, VehicleWashActivity } from "../types"

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { user } = useAuthStore()
  const {
    currentVehicle,
    isLoadingCurrentVehicle,
    isActionLoading,
    loadVehicleById,
    updateVehicle,
    deleteVehicle,
    setPrimary,
  } = useVehicleStore()

  const { categories, classes, loadData } = useVehicleCatelogStore()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Document management state
  const [documents, setDocuments] = useState<VehicleDocument[]>([
    {
      id: "doc-1",
      name: "RC Document.pdf",
      size: "1.2 MB",
      uploadedAt: "Oct 24, 2023",
    },
    {
      id: "doc-2",
      name: "Insurance_2024.pdf",
      size: "2.4 MB",
      uploadedAt: "Jan 10, 2024",
    },
  ])
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)

  // Mock wash activity history (can be linked to bookings api)
  const [washActivities] = useState<VehicleWashActivity[]>([
    {
      id: "act-1",
      stationName: "Downtown Sentinel Hub",
      serviceName: "ECO-HYDRO WASH",
      date: "MAR 12, 2024",
      amount: 24.0,
      status: "COMPLETED",
    },
    {
      id: "act-2",
      stationName: "North Ridge Station",
      serviceName: "DEEP INTERIOR",
      date: "FEB 28, 2024",
      amount: 45.0,
      status: "COMPLETED",
    },
    {
      id: "act-3",
      stationName: "Express Lane West",
      serviceName: "QUICK EXTERIOR",
      date: "JAN 15, 2024",
      amount: 18.0,
      status: "CANCELLED",
    },
  ])

  useEffect(() => {
    if (id) {
      loadVehicleById(id)
    }
    if (categories.length === 0 || classes.length === 0) {
      loadData()
    }
  }, [id, loadVehicleById, categories.length, classes.length, loadData])

  if (isLoadingCurrentVehicle) {
    return (
      <div className="min-h-screen bg-[#020617] text-[#DCE1FB] flex flex-col justify-center items-center gap-4 pt-24 pb-16">
        <Loader2 className="w-10 h-10 animate-spin text-[#ADC6FF]" />
        <p className="text-sm text-[#C2C6D6] font-medium">Loading vehicle telemetry...</p>
      </div>
    )
  }

  if (!currentVehicle) {
    return (
      <div className="min-h-screen bg-[#020617] text-[#DCE1FB] flex flex-col justify-center items-center gap-4 pt-24 pb-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#191F31] border border-[#3E495D] flex items-center justify-center text-[#ADC6FF]">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#DCE1FB]">Vehicle Not Found</h2>
        <p className="text-sm text-[#C2C6D6] max-w-md">
          The requested vehicle could not be loaded or may have been removed.
        </p>
        <button
          onClick={() => navigate(APP_ROUTES.HOME)}
          className="mt-2 px-6 py-3 rounded-xl bg-[#ADC6FF] text-[#002E6A] font-bold text-sm hover:bg-[#c2d7ff] transition-all cursor-pointer"
        >
          Return to Garage
        </button>
      </div>
    )
  }

  const categoryName =
    categories.find((c) => c.id === currentVehicle.categoryId)?.name || "Car"
  const className =
    classes.find((cl) => cl.id === currentVehicle.classId)?.name || "Sedan"

  const vehicleImage =
    currentVehicle.image?.url ||
    (categoryName.toLowerCase().includes("suv")
      ? "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
      : "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80")

  const formattedDateAdded = currentVehicle.createdAt
    ? new Date(currentVehicle.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Oct 24, 2023"

  const handleDeleteConfirm = async () => {
    const success = await deleteVehicle(currentVehicle.id)
    if (success) {
      setIsDeleteModalOpen(false)
      navigate(APP_ROUTES.HOME)
    }
  }

  const handleSetPrimaryToggle = async () => {
    if (currentVehicle.isPrimary) return
    await setPrimary(currentVehicle.id)
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingDoc(true)
    setTimeout(() => {
      const newDoc: VehicleDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }
      setDocuments((prev) => [newDoc, ...prev])
      setIsUploadingDoc(false)
      toast.success(`Document "${file.name}" uploaded successfully`)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#DCE1FB] font-sans pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div>
          <Link
            to={APP_ROUTES.HOME}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#ADC6FF] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Digital Garage
          </Link>
        </div>

        {/* HEADER ACTIONS (SUPPLEMENTARY FOR TOP RIGHT) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#DCE1FB] tracking-tight">
              Digital Garage
            </h1>
            <p className="text-sm text-[#C2C6D6]">
              Manage your vehicle telemetry and service preferences.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Edit Vehicle */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3E495D]/60 hover:bg-[#3E495D] text-[#AEB9D0] font-semibold text-sm transition-all cursor-pointer border border-slate-700/50"
            >
              <Pencil className="w-4 h-4 text-[#AEB9D0]" />
              <span>Edit Vehicle</span>
            </button>

            {/* Delete */}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3E495D]/60 hover:bg-red-950/60 hover:border-red-500/40 text-[#AEB9D0] hover:text-red-400 font-semibold text-sm transition-all cursor-pointer border border-slate-700/50"
            >
              <Trash2 className="w-4 h-4 text-[#AEB9D0]" />
              <span>Delete</span>
            </button>

            {/* Set as Default */}
            <button
              onClick={handleSetPrimaryToggle}
              disabled={currentVehicle.isPrimary || isActionLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
                currentVehicle.isPrimary
                  ? "bg-[#4AE176]/20 text-[#4AE176] border border-[#4AE176]/30 cursor-default"
                  : "bg-[#ADC6FF] text-[#002E6A] hover:bg-[#c2d7ff] shadow-[#ADC6FF]/10"
              }`}
            >
              {currentVehicle.isPrimary ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#4AE176]" />
                  <span>Default Vehicle</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 text-[#002E6A]" />
                  <span>Set as Default</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* TOP SECTION: VEHICLE OVERVIEW (Grid: 5 Cols Left, 7 Cols Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Vehicle Visual Card */}
          <div className="lg:col-span-5 bg-[#191F31] border border-slate-800/80 rounded-3xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative">
            
            {/* Category / Class Badges */}
            <div className="flex items-center gap-2 z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ADC6FF]/20 text-[#ADC6FF] border border-[#ADC6FF]/20 backdrop-blur-md">
                {categoryName.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#2E3447] text-[#C2C6D6] backdrop-blur-md">
                {className.toUpperCase()}
              </span>
            </div>

            {/* Vehicle Hero Image Container */}
            <div className="my-6 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#191F31] to-[#151B2D] border border-slate-800/60 p-4 shadow-xl flex items-center justify-center min-h-[220px]">
              <img
                src={vehicleImage}
                alt={`${currentVehicle.brand} ${currentVehicle.model}`}
                className="w-full h-48 sm:h-56 object-cover rounded-xl shadow-2xl transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Vehicle Details Title & License Tag */}
            <div className="space-y-4 pt-2">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#DCE1FB] tracking-tight">
                    {currentVehicle.brand} {currentVehicle.model}
                  </h2>
                  <p className="text-lg font-mono text-[#ADC6FF] tracking-widest uppercase mt-1">
                    {currentVehicle.registrationNumber || "NV 04 TS 2024"}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <Zap className="w-5 h-5 text-[#4AE176]" />
                  <span className="text-xs font-semibold text-[#C2C6D6] mt-1">
                    EV Platform
                  </span>
                </div>
              </div>

              {/* 3 Technical Features Pills */}
              <div className="grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-4">
                <div className="bg-[#151B2D] p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-slate-800/50">
                  <Zap className="w-4 h-4 text-[#C2C6D6]" />
                  <span className="text-xs font-bold text-[#DCE1FB]">Electric</span>
                </div>
                <div className="bg-[#151B2D] p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-slate-800/50">
                  <Users className="w-4 h-4 text-[#C2C6D6]" />
                  <span className="text-xs font-bold text-[#DCE1FB]">5 Seater</span>
                </div>
                <div className="bg-[#151B2D] p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-slate-800/50">
                  <Sparkles className="w-4 h-4 text-[#C2C6D6]" />
                  <span className="text-xs font-bold text-[#DCE1FB]">Dual Motor</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Owner Information & Quick Actions */}
          <div className="lg:col-span-7 bg-[#191F31] border border-slate-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            <div className="space-y-8">
              
              {/* Heading */}
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-[#ADC6FF]" />
                <h3 className="text-xl font-bold text-[#DCE1FB]">Owner Information</h3>
              </div>

              {/* Owner Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C2C6D6] block">
                    OWNER NAME
                  </span>
                  <p className="text-lg font-semibold text-[#DCE1FB]">
                    {user?.name || "Julian Blackwood"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C2C6D6] block">
                    REGISTERED PHONE
                  </span>
                  <p className="text-lg font-semibold text-[#DCE1FB]">
                    {user?.phone || "+1 (555) 012-3456"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C2C6D6] block">
                    NICKNAME
                  </span>
                  <p className="text-lg font-semibold italic text-[#ADC6FF]">
                    "{currentVehicle.nickname}"
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C2C6D6] block">
                    DATE ADDED
                  </span>
                  <p className="text-lg font-semibold text-[#DCE1FB]">
                    {formattedDateAdded}
                  </p>
                </div>
              </div>

              {/* Default Vehicle Card Toggle Box */}
              <div className="pt-4">
                <div className="bg-[#151B2D] border border-slate-800/80 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#ADC6FF]/10 flex items-center justify-center text-[#ADC6FF] shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#DCE1FB]">Default Vehicle</h4>
                      <p className="text-sm text-[#C2C6D6]">
                        Quick-book this vehicle by default
                      </p>
                    </div>
                  </div>

                  {/* Custom Switch Component */}
                  <button
                    type="button"
                    onClick={handleSetPrimaryToggle}
                    disabled={isActionLoading}
                    className={`w-14 h-8 rounded-full transition-colors duration-200 relative flex items-center px-1 cursor-pointer ${
                      currentVehicle.isPrimary ? "bg-[#ADC6FF]" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-[#002E6A] transition-transform duration-200 shadow-md ${
                        currentVehicle.isPrimary ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECOND ROW BENTO GRID FOR SECONDARY CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SERVICE COMPATIBILITY (Wide - 8 Cols) */}
          <div className="lg:col-span-8 bg-[#191F31] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-[#4AE176]" />
                <h3 className="text-xl font-bold text-[#DCE1FB]">Available Services</h3>
              </div>
              <span className="text-sm text-[#C2C6D6]">
                Optimized for {className}
              </span>
            </div>

            {/* 2 Compatible Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Service Card 1 */}
              <div className="bg-[#151B2D] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-[#ADC6FF]/40 transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-[#ADC6FF]/10 text-[#ADC6FF]">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#00A74B] text-[#003111] text-[10px] font-black uppercase tracking-wider">
                      HIGHLY COMPATIBLE
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-[#DCE1FB]">Eco-Hydro Wash</h4>
                    <p className="text-xs text-[#C2C6D6] leading-relaxed mt-2">
                      High-pressure exterior cleaning with bio-degradable polymer wax coating. Safe for EV sensors.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-2">
                  <span className="text-xl font-black text-[#DCE1FB]">$24.00</span>
                  <button
                    onClick={() => navigate("/stations")}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#ADC6FF] hover:text-white transition-colors cursor-pointer"
                  >
                    <span>VIEW DETAILS</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Service Card 2 */}
              <div className="bg-[#151B2D] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-[#ADC6FF]/40 transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-[#ADC6FF]/10 text-[#ADC6FF]">
                      <Wind className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#3E495D] text-[#AEB9D0] text-[10px] font-black uppercase tracking-wider">
                      STANDARD
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-[#DCE1FB]">Deep Interior Purge</h4>
                    <p className="text-xs text-[#C2C6D6] leading-relaxed mt-2">
                      Steam cleaning and antimicrobial treatment for synthetic leather and high-tech cabin surfaces.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4 mt-2">
                  <span className="text-xl font-black text-[#DCE1FB]">$45.00</span>
                  <button
                    onClick={() => navigate("/stations")}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#ADC6FF] hover:text-white transition-colors cursor-pointer"
                  >
                    <span>VIEW DETAILS</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS (Vertical - 4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Call to action highlight card */}
            <div className="bg-[#ADC6FF] text-[#002E6A] rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-2xl">
              <div className="space-y-2">
                <h3 className="text-2xl font-black leading-snug">
                  Need a<br />Quick Wash?
                </h3>
                <p className="text-xs font-medium opacity-90 leading-relaxed">
                  Priority queueing available for "{currentVehicle.nickname}".
                </p>
              </div>

              <button
                onClick={() => navigate("/stations")}
                className="w-full py-4 rounded-xl bg-[#002E6A] hover:bg-[#00204a] text-[#ADC6FF] font-black text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer"
              >
                BOOK WASH NOW
              </button>
            </div>

            {/* Quick action buttons list */}
            <div className="bg-[#191F31] border border-slate-800/80 rounded-3xl p-6 space-y-3 shadow-2xl">
              <button
                onClick={() => navigate("/stations")}
                className="w-full p-4 rounded-2xl bg-[#151B2D] hover:bg-slate-800/80 border border-slate-800/60 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#C2C6D6]" />
                  <span className="text-sm font-semibold text-[#DCE1FB]">Find Nearby Stations</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C2C6D6]" />
              </button>

              <button
                onClick={() => navigate("/stations")}
                className="w-full p-4 rounded-2xl bg-[#151B2D] hover:bg-slate-800/80 border border-slate-800/60 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Ticket className="w-5 h-5 text-[#C2C6D6]" />
                  <span className="text-sm font-semibold text-[#DCE1FB]">View Pricing Fleet</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C2C6D6]" />
              </button>
            </div>
          </div>
        </div>

        {/* THIRD ROW: ACTIVITY & INSIGHTS (7 Cols Left, 5 Cols Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* RECENT WASH ACTIVITY (7 Cols) */}
          <div className="lg:col-span-7 bg-[#191F31] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
              <Clock className="w-5 h-5 text-[#C2C6D6]" />
              <h3 className="text-xl font-bold text-[#DCE1FB]">Recent Wash Activity</h3>
            </div>

            <div className="space-y-3">
              {washActivities.map((act) => (
                <div
                  key={act.id}
                  className={`p-4 rounded-2xl bg-[#151B2D]/90 border border-slate-800/60 flex items-center justify-between gap-4 transition-all ${
                    act.status === "CANCELLED" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2E3447] flex items-center justify-center text-[#ADC6FF]">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#DCE1FB]">{act.stationName}</h4>
                      <p className="text-xs font-semibold text-[#C2C6D6] tracking-wider uppercase mt-0.5">
                        {act.serviceName} • {act.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-[#DCE1FB]">
                      ${act.amount.toFixed(2)}
                    </span>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          act.status === "COMPLETED" ? "bg-[#4AE176]" : "bg-[#C2C6D6]"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider ${
                          act.status === "COMPLETED" ? "text-[#4AE176]" : "text-[#C2C6D6]"
                        }`}
                      >
                        {act.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAINTENANCE & DOCUMENTS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Maintenance Insights */}
            <div className="bg-[#191F31] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <h3 className="text-xl font-bold text-[#DCE1FB]">Maintenance Insights</h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                  <div>
                    <span className="text-xs font-bold text-[#C2C6D6] uppercase tracking-wider block">
                      USAGE PATTERN
                    </span>
                    <span className="text-base font-semibold text-[#ADC6FF] mt-0.5 block">
                      Frequent Commuter
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#C2C6D6] uppercase tracking-wider block">
                      LAST WASH
                    </span>
                    <span className="text-base font-semibold text-[#DCE1FB] mt-0.5 block">
                      12 Days Ago
                    </span>
                  </div>
                </div>

                {/* Recommended action banner */}
                <div className="p-4 rounded-2xl bg-[#93000A]/20 border border-[#FFB4AB]/20 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#FFB4AB] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#FFB4AB] uppercase tracking-wider">
                      Action Recommended
                    </h4>
                    <p className="text-xs text-[#FFDAD6] leading-relaxed mt-1">
                      Interior cleaning recommended based on usage patterns and spring pollen levels.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
                  <span className="text-xs font-bold text-[#C2C6D6] uppercase tracking-wider">
                    SUGGESTED NEXT WASH
                  </span>
                  <span className="text-lg font-black text-[#DCE1FB]">Mar 26</span>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-[#191F31] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <h3 className="text-xl font-bold text-[#DCE1FB]">Documents</h3>

              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-[#151B2D] border border-slate-800/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-5 h-5 text-[#ADC6FF] shrink-0" />
                      <span className="text-sm font-medium text-[#DCE1FB] truncate">
                        {doc.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        title="View Document"
                        onClick={() => toast.info(`Viewing ${doc.name}`)}
                        className="p-2 rounded-lg text-[#C2C6D6] hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Download Document"
                        onClick={() => toast.success(`Downloading ${doc.name}`)}
                        className="p-2 rounded-lg text-[#C2C6D6] hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload New Document Button */}
                <label className="border-2 border-dashed border-slate-700 hover:border-[#ADC6FF]/60 rounded-2xl p-4 flex items-center justify-center gap-2 cursor-pointer transition-all bg-[#151B2D]/40 hover:bg-[#151B2D]">
                  {isUploadingDoc ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#ADC6FF]" />
                  ) : (
                    <Upload className="w-4 h-4 text-[#C2C6D6]" />
                  )}
                  <span className="text-xs font-bold text-[#C2C6D6] uppercase tracking-wider">
                    {isUploadingDoc ? "UPLOADING..." : "UPLOAD NEW DOCUMENT"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleDocumentUpload}
                    disabled={isUploadingDoc}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Vehicle Modal */}
      <AddVehicleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialVehicle={currentVehicle}
        onSubmit={async (input) => {
          const success = await updateVehicle(currentVehicle.id, input)
          if (success) {
            loadVehicleById(currentVehicle.id)
          }
          return success
        }}
        isSubmitting={isActionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message={`Are you sure you want to remove ${currentVehicle.brand} ${currentVehicle.model} (${currentVehicle.nickname}) from your digital garage?`}
        confirmText="Delete Vehicle"
        confirmVariant="danger"
        isLoading={isActionLoading}
      />
    </div>
  )
}
