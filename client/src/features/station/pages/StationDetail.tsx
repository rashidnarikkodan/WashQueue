import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useStationStore } from "../store/stationStore"
import { useAuthStore } from "@/features/auth/store/authStore"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import Loading from "@/shared/components/ui/Loading"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import {
  StationHeroHeader,
  StationKpiHud,
  StationLiveOpsCard,
  StationRevenueChart,
  StationBookingsTable,
  StationMetadataCard,
  StationServiceTiersCard,
  StationAmenitiesCard,
  StationFinancialCard,
  StationBottomUtilities,
  StationStickyFooter,
  EditStationModal,
} from "../components/station-detail"
import { STATION_STATUS } from "../types"
import type { UpdateStationInput } from "../types"

export default function StationDetail() {
  const { stationId } = useParams<{ stationId: string }>()
  const {
    selectedStation,
    isLoading,
    isSubmitting,
    fetchStationById,
    updateStation,
    clearSelected,
  } = useStationStore()

  const user = useAuthStore((state) => state.user)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showUnlistConfirm, setShowUnlistConfirm] = useState(false)
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false)

  useEffect(() => {
    if (stationId) {
      fetchStationById(stationId)
    }
    return () => clearSelected()
  }, [stationId, fetchStationById, clearSelected])

  if (isLoading || !selectedStation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loading size="lg" />
        <p className="text-sm text-[#8c909f] font-medium animate-pulse">
          Loading HydroStream Hub station details…
        </p>
      </div>
    )
  }

  const { station, pricing } = selectedStation

  const handleToggleStatus = async () => {
    if (!stationId) return
    const nextStatus =
      station.status === STATION_STATUS.ACTIVE ? STATION_STATUS.DRAFT : STATION_STATUS.ACTIVE
    await updateStation(stationId, { step: 1, status: nextStatus })
  }

  const handleSaveStep = async (_stepNum: 1 | 2 | 3 | 4, input: UpdateStationInput) => {
    if (!stationId) return
    await updateStation(stationId, input)
  }

  const handleConfirmUnlist = async () => {
    if (!stationId) return
    await updateStation(stationId, { step: 1, status: STATION_STATUS.INACTIVE })
    setShowUnlistConfirm(false)
  }

  const handleConfirmEmergencyPause = async () => {
    if (!stationId) return
    await updateStation(stationId, { step: 1, status: STATION_STATUS.DRAFT })
    setShowEmergencyConfirm(false)
  }

  return (
    <div className="min-h-screen text-[#dce1fb] pb-32 space-y-12">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Owner", path: "/owner/dashboard" },
          { label: "Stations", path: "/owner/stations" },
          { label: station.name },
        ]}
      />

      {/* Hero Overview Header */}
      <StationHeroHeader
        station={station}
        onEdit={() => setIsEditModalOpen(true)}
        onToggleStatus={handleToggleStatus}
        isSubmitting={isSubmitting}
      />

      {/* KPI HUD Section */}
      <StationKpiHud station={station} />

      {/* Main Bento Grid */}
      <main className="grid grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Live Ops, Revenue Velocity & Active Bookings */}
        <section className="col-span-12 lg:col-span-8 space-y-10">
          <StationLiveOpsCard station={station} />
          <StationRevenueChart />
          <StationBookingsTable />
        </section>

        {/* Right Column: Metadata, Service Tiers, Amenities, Financials */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <StationMetadataCard station={station} ownerName={user?.name || "David Steinberg"} />
          <StationServiceTiersCard
            pricing={pricing}
            onEditPricing={() => setIsEditModalOpen(true)}
          />
          <StationAmenitiesCard amenities={station.amenities} />
          <StationFinancialCard />
        </aside>
      </main>

      {/* Bottom Utility Bar */}
      <StationBottomUtilities onUnlist={() => setShowUnlistConfirm(true)} />

      {/* Sticky Utility Actions Footer */}
      <StationStickyFooter
        onQuickBooking={() => setIsEditModalOpen(true)}
        onEmergencyPause={() => setShowEmergencyConfirm(true)}
      />

      {/* Edit Station Modal Drawer */}
      {isEditModalOpen && (
        <EditStationModal
          stationDetail={selectedStation}
          onClose={() => setIsEditModalOpen(false)}
          onSaveStep={handleSaveStep}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Unlist Station Confirmation Modal */}
      {showUnlistConfirm && (
        <ConfirmationModal
          isOpen={showUnlistConfirm}
          onClose={() => setShowUnlistConfirm(false)}
          onConfirm={handleConfirmUnlist}
          title="Unlist Station"
          message="Are you sure you want to unlist this station? It will be removed from public discovery and all active bookings will be paused."
          confirmText="Unlist Station"
          confirmVariant="danger"
          isLoading={isSubmitting}
        />
      )}

      {/* Emergency Pause Confirmation Modal */}
      {showEmergencyConfirm && (
        <ConfirmationModal
          isOpen={showEmergencyConfirm}
          onClose={() => setShowEmergencyConfirm(false)}
          onConfirm={handleConfirmEmergencyPause}
          title="Emergency Pause"
          message="Initiate emergency pause for this station? Operating hours and online queueing will be instantly suspended."
          confirmText="Pause Immediately"
          confirmVariant="danger"
          isLoading={isSubmitting}
        />
      )}
    </div>
  )
}
