import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Star,
  CheckCircle2,
  Car,
  ShieldCheck,
  ChevronRight,
  Clock,
  Droplets,
  Calendar,
  Tag,
  Loader2,
  Building2,
  User,
  Hash,
} from "lucide-react"
import { useVehicleStore } from "../store/vehicle.store"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import AddVehicleModal from "../components/AddVehicleModal"
import ConfirmationModal from "@/shared/components/modals/ConfirmationModal"
import { APP_ROUTES } from "@/shared/constants/appRoutes.const"
import { bookingApi } from "@/shared/apis/booking.api"
import type { BookingResponse } from "@/shared/types/booking.types"

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

  const [vehicleBookings, setVehicleBookings] = useState<BookingResponse[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)

  useEffect(() => {
    if (id) {
      loadVehicleById(id)
    }
    if (categories.length === 0 || classes.length === 0) {
      loadData()
    }
  }, [id, loadVehicleById, categories.length, classes.length, loadData])

  useEffect(() => {
    if (!currentVehicle?.id) return
    let isSubscribed = true
    Promise.resolve().then(() => {
      if (!isSubscribed) return
      setIsLoadingBookings(true)
      bookingApi
        .getUserBookings("all")
        .then((res) => {
          if (!isSubscribed) return
          const list = res.bookings || []
          const filtered = list.filter((b) => b.vehicleId === currentVehicle.id)
          setVehicleBookings(filtered)
        })
        .catch((err) => {
          console.error("Failed to load vehicle wash history:", err)
        })
        .finally(() => {
          if (isSubscribed) setIsLoadingBookings(false)
        })
    })
    return () => {
      isSubscribed = false
    }
  }, [currentVehicle?.id])

  if (isLoadingCurrentVehicle) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center gap-4 pt-24 pb-16">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading vehicle details...</p>
      </div>
    )
  }

  if (!currentVehicle) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center gap-4 pt-24 pb-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center text-primary">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Vehicle Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The requested vehicle could not be loaded or may have been removed.
        </p>
        <button
          onClick={() => navigate(APP_ROUTES.HOME)}
          className="mt-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-md"
        >
          Return to Garage
        </button>
      </div>
    )
  }

  const categoryName = categories.find((c) => c.id === currentVehicle.categoryId)?.name || "Vehicle"
  const className = classes.find((cl) => cl.id === currentVehicle.classId)?.name || "Standard"

  const defaultPlaceholderImage = categoryName.toLowerCase().includes("suv")
    ? "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
    : categoryName.toLowerCase().includes("bike") ||
        categoryName.toLowerCase().includes("motorcycle")
      ? "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80"
      : "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"

  const vehicleImage = currentVehicle.image?.url || defaultPlaceholderImage

  const formattedDateAdded = currentVehicle.createdAt
    ? new Date(currentVehicle.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A"

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

  const getBookingStatusBadge = (b: BookingResponse) => {
    if (b.cancellation) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-destructive/10 text-destructive text-[11px] font-bold uppercase tracking-wider">
          Cancelled
        </span>
      )
    }
    if (b.completedAt || b.serviceCompletedAt) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-success/15 text-success text-[11px] font-bold uppercase tracking-wider">
          Completed
        </span>
      )
    }
    if (b.serviceStartedAt) {
      return (
        <span className="px-2.5 py-1 rounded-md bg-primary/15 text-primary text-[11px] font-bold uppercase tracking-wider">
          In Progress
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-md bg-warning/15 text-warning text-[11px] font-bold uppercase tracking-wider">
        Confirmed
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Link
            to={APP_ROUTES.HOME}
            className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Digital Garage
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {currentVehicle.nickname}
              </h1>
              {currentVehicle.isPrimary && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/15 text-success border border-success/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Default Vehicle
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentVehicle.brand} {currentVehicle.model} ({currentVehicle.year})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-muted text-foreground border border-border font-semibold text-sm transition-all cursor-pointer shadow-sm"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
              <span>Edit Vehicle</span>
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive font-semibold text-sm transition-all cursor-pointer shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            {!currentVehicle.isPrimary && (
              <button
                onClick={handleSetPrimaryToggle}
                disabled={isActionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Star className="w-4 h-4" />
                <span>Set as Default</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative">
            <div className="flex items-center gap-2 z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {categoryName}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground border border-border">
                {className}
              </span>
            </div>

            <div className="my-6 relative rounded-2xl overflow-hidden bg-muted/30 border border-border p-3 shadow-inner flex items-center justify-center min-h-[220px]">
              <img
                src={vehicleImage}
                alt={`${currentVehicle.brand} ${currentVehicle.model}`}
                className="w-full h-52 sm:h-60 object-cover rounded-xl shadow-md transition-transform duration-500 hover:scale-105"
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-end justify-between border-b border-border/60 pb-3">
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">
                    {currentVehicle.brand} {currentVehicle.model}
                  </h2>
                  <p className="text-sm font-mono text-primary font-bold tracking-widest uppercase mt-1">
                    {currentVehicle.registrationNumber || "NO REGISTRATION PLATE"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-muted-foreground block">Model Year</span>
                  <span className="text-lg font-black text-foreground">{currentVehicle.year}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="bg-muted/40 p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-border/60">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[11px] font-bold text-foreground">{categoryName}</span>
                </div>
                <div className="bg-muted/40 p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-border/60">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[11px] font-bold text-foreground">{className}</span>
                </div>
                <div className="bg-muted/40 p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-border/60">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[11px] font-bold text-foreground">
                    {currentVehicle.year}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-primary" />
                <h3 className="text-xl font-bold text-foreground">Vehicle & Owner Specs</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Owner Name
                  </span>
                  <p className="text-lg font-semibold text-foreground">{user?.name || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> Registration Number
                  </span>
                  <p className="text-lg font-semibold text-foreground font-mono">
                    {currentVehicle.registrationNumber || "Not Registered"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Nickname
                  </span>
                  <p className="text-lg font-semibold italic text-primary">
                    "{currentVehicle.nickname}"
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Date Registered
                  </span>
                  <p className="text-lg font-semibold text-foreground">{formattedDateAdded}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Category
                  </span>
                  <p className="text-base font-semibold text-foreground">{categoryName}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Class
                  </span>
                  <p className="text-base font-semibold text-foreground">{className}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60">
                <div className="bg-muted/40 border border-border/80 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">
                        Default Primary Vehicle
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Automatically selected when creating a new wash booking
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSetPrimaryToggle}
                    disabled={currentVehicle.isPrimary || isActionLoading}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentVehicle.isPrimary
                        ? "bg-success/15 text-success border border-success/30 cursor-default"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {currentVehicle.isPrimary ? "Default Active" : "Set as Default"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg">
              <Droplets className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-foreground">
                Book a Wash for {currentVehicle.nickname}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                Select a top-rated wash station and schedule your service for {currentVehicle.brand}{" "}
                {currentVehicle.model}.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/stations?vehicleId=${currentVehicle.id}`)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Find Wash Stations</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full bg-primary" />
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-xl font-bold text-foreground">Wash History</h3>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {vehicleBookings.length} {vehicleBookings.length === 1 ? "Session" : "Sessions"}
            </span>
          </div>

          {isLoadingBookings ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-medium">Fetching wash history...</p>
            </div>
          ) : vehicleBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicleBookings.map((b) => {
                const dateStr = b.scheduling?.windowStart
                  ? new Date(b.scheduling.windowStart).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"

                return (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/bookings/${b.id}`)}
                    className="p-5 rounded-2xl bg-muted/30 border border-border hover:border-primary/40 transition-all flex flex-col justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {b.stationDetails?.name || "Wash Station"}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>{b.serviceType === "FULL" ? "Full Wash" : "Express Wash"}</span>
                            <span>•</span>
                            <span>{dateStr}</span>
                          </p>
                        </div>
                      </div>

                      {getBookingStatusBadge(b)}
                    </div>

                    <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                      <span className="font-mono text-muted-foreground">#{b.bookingNumber}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground">
                          ${b.pricingSnapshot?.totalPrice?.toFixed(2) || "0.00"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-3 text-center bg-muted/20">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Droplets className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">No Wash History Yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                There are no recorded wash sessions for this vehicle yet. Book a wash to get
                started.
              </p>
              <button
                onClick={() => navigate(`/stations?vehicleId=${currentVehicle.id}`)}
                className="mt-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
              >
                Book First Wash
              </button>
            </div>
          )}
        </div>
      </div>

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
