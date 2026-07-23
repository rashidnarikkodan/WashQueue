import { useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Breadcrumbs from "@/shared/components/ui/Breadcrumbs"
import StationCard from "@/shared/components/cards/StationCard"
import { useStationStore } from "../../store/stationStore"
import { Plus } from "lucide-react"
import { useAuthStore } from "@/features/auth/store/authStore"
import { STATION_STATUS } from "../../types"

const StationManagement = () => {
  const navigate = useNavigate()
  const { stations, isLoading, error, fetchStations } = useStationStore()
  const user = useAuthStore((state) => state.user)

  const loadStations = useCallback(async () => {
    // Filter stations by the logged-in owner's ownerId
    if (user?.ownerId) {
      await fetchStations({ ownerId: user.ownerId })
    } else {
      // If user isn't fully onboarded yet or has no owner record, load normally
      await fetchStations()
    }
  }, [user, fetchStations])

  useEffect(() => {
    loadStations()
  }, [loadStations])

  return (
    <div className="space-y-6 min-h-screen">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: "Owner", path: "/owner/dashboard" }, { label: "Stations" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Stations Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Maintain and Manage all your stations.
          </p>
        </div>
        <button
          onClick={() => navigate("/owner/stations/new")}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground font-semibold px-4.5 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md select-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Station</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-muted-foreground">
          Loading stations...
        </div>
      ) : (
        /* Responsive Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {stations.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center min-h-[60vh]">
              <p className="text-[#C2C6D6] font-medium mb-1">No stations found</p>
              <p className="text-sm text-[#C2C6D6]/70 text-center">
                Get started by creating your first station.
              </p>
            </div>
          ) : (
            stations.map((station) => (
              <StationCard
                key={station.id}
                id={station.id}
                name={station.name}
                showFavoriteButton={false}
                image={
                  station.images?.find((img) => img.isPrimary)?.url ||
                  station.images[0]?.url ||
                  "https://placehold.co/400x200/1a2240/60a5fa?text=No+Image"
                }
                address={`${station.address?.street || ""}, ${station.address?.city || ""}`}
                status={station.status}
                rating={station.rating || 0}
                reviewCount={station.reviewCount || 0}
                queueCount={0}
                baysCount={station.slotConfig?.bays || 0}
                operatingHours={
                  station.operatingHours?.[0]
                    ? `${station.operatingHours[0].open} - ${station.operatingHours[0].close}`
                    : "Not Set"
                }
                services={station.amenities || []}
                onPrimaryAction={() => {
                  if (
                    station.status === STATION_STATUS.DRAFT ||
                    station.status === STATION_STATUS.REJECTED
                  ) {
                    navigate(`/owner/stations/${station.id}/edit`)
                  } else {
                    navigate(`/owner/stations/${station.id}`)
                  }
                }}
                onSecondaryAction={() => navigate(`/owner/stations/${station.id}`)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default StationManagement