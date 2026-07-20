import { useState, useEffect } from "react"
import { useVehicleStore } from "@/features/vehicle/store/vehicleStore"
import VehicleCarousel from "@/features/vehicle/components/VehicleCarousel"
import AddVehicleModal from "@/features/vehicle/components/AddVehicleModal"
import type { Vehicle } from "@/features/vehicle/types"

export default function GarageSection() {
  const {
    vehicles,
    isLoading,
    isActionLoading,
    loadVehicles,
    addVehicle,
    deleteVehicle,
    setPrimary,
  } = useVehicleStore()

  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadVehicles()
  }, [loadVehicles])

  const handleBookWash = (vehicle: Vehicle) => {
    // Navigate or trigger booking with selected vehicle
    console.log("Book wash for vehicle:", vehicle)
  }

  return (
    <section className="mb-12 space-y-6 text-left">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-foreground">Digital Garage</h2>
        <p className="text-sm text-muted-foreground font-medium">
          Manage your registered premium vehicles
        </p>
      </div>

      <VehicleCarousel
        vehicles={vehicles}
        isLoading={isLoading}
        isActionLoading={isActionLoading}
        onSetPrimary={setPrimary}
        onDelete={deleteVehicle}
        onBookWash={handleBookWash}
        onAddClick={() => setIsModalOpen(true)}
      />

      <AddVehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addVehicle}
        isSubmitting={isActionLoading}
      />
    </section>
  )
}
