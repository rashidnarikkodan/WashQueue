import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { useVehicleStore } from "../store/vehicle.store"
import { useVehicleCatelogStore } from "@/features/vehicle-catelog/store/catelog.store"
import { useAuthStore } from "@/features/auth/store/auth.store"
import AddVehicleModal from "./AddVehicleModal"
import VehicleCard from "./VehicleCard"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import AuthRequiredModal from "@/shared/components/ui/AuthRequiredModal"
import type { Vehicle } from "../types"

export default function GarageSection() {
  const { vehicles, isActionLoading, loadVehicles, addVehicle, deleteVehicle } = useVehicleStore()
  const { categories, classes, loadData } = useVehicleCatelogStore()
  const { isAuthenticated, user } = useAuthStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadVehicles()
    }
    if (categories.length === 0 || classes.length === 0) {
      loadData()
    }
  }, [isAuthenticated, loadVehicles, categories.length, classes.length, loadData])

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-foreground">Digital Garage</h2>
          <p className="text-sm text-muted-foreground font-medium">
            Manage your registered premium vehicles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vehicles.map((vehicle) => {
          const categoryName = categories.find((c) => c.id === vehicle.categoryId)?.name || "Car"
          const className = classes.find((c) => c.id === vehicle.classId)?.name || "Sedan"

          const image =
            vehicle.image?.url ||
            (categoryName.toLowerCase().includes("suv")
              ? "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80"
              : "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80")

          return (
            <VehicleCard
              key={vehicle.id}
              image={image}
              vehicle={vehicle}
              className={className}
              categoryName={categoryName}
              onDelete={(v) => setVehicleToDelete(v)}
            />
          )
        })}

        <button
          onClick={handleAddVehicleClick}
          className="border-2 border-dashed border-border hover:border-primary/40 rounded-3xl p-6 flex flex-col justify-center items-center text-center gap-4 transition-all duration-300 min-h-120 w-full cursor-pointer bg-transparent"
        >
          <div className="w-16 h-16 rounded-full bg-muted/40 flex items-center justify-center border border-border text-muted-foreground">
            <Plus size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Add New Vehicle</h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed font-medium">
              Register new premium cars or SUVs into your digital garage for customized wait alerts
              and detailing quotes.
            </p>
          </div>
          <span className="px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground font-extrabold text-xs tracking-wider transition-all">
            Register Vehicle
          </span>
        </button>
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
