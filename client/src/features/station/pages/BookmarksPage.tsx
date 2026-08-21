import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bookmark, MapPin, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import StationCard from "@/shared/components/cards/StationCard"
import { Pagination } from "@/shared/components/ui/Pagination"
import { usersApi } from "@/shared/apis/users.api"
import type { Station } from "@/features/station/types"

const PAGE_SIZE = 9

export default function BookmarksPage() {
  const navigate = useNavigate()
  const [stations, setStations] = useState<Station[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = (await usersApi.getBookmarks()) as Station[]
        setStations(data || [])
      } catch (err: unknown) {
        console.error("Error loading bookmarks:", err)
        setError("Failed to load bookmarked stations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarks()
  }, [])

  const handleToggleBookmark = async (stationId: string): Promise<boolean> => {
    // Optimistically remove from list
    const previousStations = stations
    setStations((prev) => prev.filter((s) => s.id !== stationId))
    try {
      await usersApi.toggleBookmark(stationId)
      return true
    } catch (err) {
      console.error("Failed to update bookmark:", err)
      toast.error("Failed to update bookmark")
      // Refetch if toggle failed; fall back to the pre-toggle list if the refetch also fails
      // rather than leaving the station permanently (and silently) missing from the page.
      try {
        const data = (await usersApi.getBookmarks()) as Station[]
        setStations(data || [])
      } catch (refetchErr) {
        console.error("Failed to refresh bookmarks after a failed toggle:", refetchErr)
        setStations(previousStations)
      }
      return false
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 sm:py-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Bookmarks</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your saved wash stations for quick booking and easy access
              </p>
            </div>
          </div>

          {!isLoading && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border text-xs font-semibold text-muted-foreground self-start sm:self-center">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>
                {stations.length} Saved {stations.length === 1 ? "Station" : "Stations"}
              </span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading your bookmarked stations...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
            <p className="text-red-400 font-semibold text-sm mb-4">{error}</p>
            <button
              onClick={() => {
                setIsLoading(true)
                setError(null)
                usersApi
                  .getBookmarks()
                  .then((data) => setStations((data as Station[]) || []))
                  .catch(() => setError("Failed to load bookmarked stations"))
                  .finally(() => setIsLoading(false))
              }}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && stations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <Bookmark className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground">No Bookmarked Stations Yet</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md">
              Save your favorite wash stations to quickly view live queue status and book
              appointments.
            </p>
            <button
              onClick={() => navigate("/stations")}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-all cursor-pointer"
            >
              <span>Explore Stations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Station Cards Grid */}
        {!isLoading && !error && stations.length > 0 && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((station, pageIndex) => {
              const globalIndex = (currentPage - 1) * PAGE_SIZE + pageIndex
              const stationId =
                station.id || (station as unknown as { _id?: string })._id || `station-${globalIndex}`
              const primaryImage =
                station.images?.find((img) => img.isPrimary)?.url || station.images?.[0]?.url || ""
              const formattedAddress = station.address
                ? `${station.address.street || ""}${
                    station.address.city ? `, ${station.address.city}` : ""
                  }`
                : "Address not available"

              return (
                <StationCard
                  key={stationId}
                  id={stationId}
                  name={station.name || "Wash Station"}
                  image={primaryImage}
                  address={formattedAddress}
                  status={station.status}
                  rating={station.rating || 0}
                  reviewCount={station.reviewCount || 0}
                  queueCount={station.queueDepth ?? 0}
                  baysCount={station.slotConfig?.bays || 0}
                  services={station.amenities || []}
                  distanceKm={station.distanceKm}
                  isFavorite={true}
                  onFavoriteToggle={() => handleToggleBookmark(stationId)}
                  onClick={() => navigate(`/stations/${stationId}`)}
                />
              )
            })}
          </div>
          <Pagination
            meta={{
              total: stations.length,
              page: currentPage,
              limit: PAGE_SIZE,
              totalPages: Math.max(1, Math.ceil(stations.length / PAGE_SIZE)),
              hasNextPage: currentPage * PAGE_SIZE < stations.length,
              hasPrevPage: currentPage > 1,
            }}
            onPageChange={setCurrentPage}
          />
          </>
        )}
      </div>
    </div>
  )
}
