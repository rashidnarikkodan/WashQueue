import { useEffect, useState, useRef } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useVehicleStore } from "../store/vehicle.store"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import AddVehicleModal from "./AddVehicleModal"
import VehicleCard from "./VehicleCard"
import ConfirmationModal from "@/shared/components/modals/ConfirmationModal"
import AuthRequiredModal from "@/shared/components/modals/AuthRequiredModal"
import type { Vehicle } from "../types"

export default function GarageSection() {
  const { vehicles, isActionLoading, loadVehicles, addVehicle, deleteVehicle } = useVehicleStore()
  const { categories, classes, loadData } = useVehicleCatelogStore()
  const { isAuthenticated, user } = useAuthStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadVehicles()
    }
    if (categories.length === 0 || classes.length === 0) {
      loadData()
    }
  }, [isAuthenticated, loadVehicles, categories.length, classes.length, loadData])

  useEffect(() => {
    checkScroll()
    const container = scrollRef.current
    if (container) {
      container.addEventListener("scroll", checkScroll, { passive: true })
      window.addEventListener("resize", checkScroll)
      return () => {
        container.removeEventListener("scroll", checkScroll)
        window.removeEventListener("resize", checkScroll)
      }
    }
  }, [vehicles.length])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 380
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleAddVehicleClick = () => {
    if (!isAuthenticated || !user) {
      setIsAuthModalOpen(true)
      return
    }
    setIsModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return
    const success = await deleteVehicle(vehicleToDelete.id)
    if (success) {
      setVehicleToDelete(null)
    }
  }

  return (
    <section className="mb-12 space-y-6 text-left">
      <div className="flex flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground">Digital Garage</h2>
          <p className="text-sm text-muted-foreground font-medium">
            Manage your registered premium vehicles
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="p-2.5 rounded-2xl bg-card border border-border/80 text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="p-2.5 rounded-2xl bg-card border border-border/80 text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
      >
        {vehicles.map((vehicle) => {
          const categoryName = categories.find((c) => c.id === vehicle.categoryId)?.name || "Car"
          const className = classes.find((c) => c.id === vehicle.classId)?.name || "Sedan"

          const image =
            vehicle.image?.url ||
            (categoryName.toLowerCase().includes("suv")
              ? "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80"
              : "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80")

          return (
            <div
              key={vehicle.id}
              className="w-[300px] sm:w-[350px] lg:w-[380px] shrink-0 snap-start flex flex-col"
            >
              <VehicleCard
                image={image}
                vehicle={vehicle}
                className={className}
                categoryName={categoryName}
                onDelete={(v) => setVehicleToDelete(v)}
              />
            </div>
          )
        })}

        <div className="w-[300px] sm:w-[350px] lg:w-[380px] shrink-0 snap-start flex">
          <button
            onClick={handleAddVehicleClick}
            className="border-2 border-dashed border-border hover:border-primary/40 rounded-3xl p-6 flex flex-col justify-center items-center text-center gap-4 transition-all duration-300 min-h-[400px] w-full cursor-pointer bg-card/40 hover:bg-card/80"
          >
            <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center border border-border text-muted-foreground">
              <Plus size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Add New Vehicle</h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-medium">
                Register new premium cars or SUVs into your digital garage for customized wait
                alerts and detailing quotes.
              </p>
            </div>
            <span className="px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground font-extrabold text-xs tracking-wider transition-all">
              Register Vehicle
            </span>
          </button>
        </div>
      </div>

      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addVehicle}
        isSubmitting={isActionLoading}
      />

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign in to Register Vehicle"
        message="You must be logged in to add vehicles to your digital garage for customized booking slots and wait alerts."
        actionName="add a vehicle"
      />

      <ConfirmationModal
        isOpen={Boolean(vehicleToDelete)}
        onClose={() => setVehicleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Vehicle"
        message={`Are you sure you want to remove ${
          vehicleToDelete ? `${vehicleToDelete.brand} ${vehicleToDelete.model}` : "this vehicle"
        } from your digital garage?`}
        confirmText="Delete Vehicle"
        confirmVariant="danger"
        isLoading={isActionLoading}
      />
    </section>
  )
}
