import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { useBookingStore } from "../store/booking.store"
import type { BookingStatus } from "../types/booking.types"

export interface UseBookingListOptions {
  isManager?: boolean
  isOwner?: boolean
  isAdmin?: boolean
}

export function useBookingList({
  isManager = false,
  isOwner = false,
  isAdmin = false,
}: UseBookingListOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()

  const [filterStations, setFilterStations] = useState<Array<{ id: string; name: string }>>([])

  // Zustand Store
  const {
    bookings,
    pagination,
    isLoading,
    error,
    managedStation,
    isFetchingManagerStation,
    selectedBookingForQr,
    selectedBookingForCancel,
    cancellationReason,
    isSubmittingCancel,
    loadBookings,
    loadManagerStation,
    cancelBooking,
    setSelectedBookingForQr,
    setSelectedBookingForCancel,
    setCancellationReason,
  } = useBookingStore()

  // Query state from URL
  const searchQuery = searchParams.get("q") || ""
  const activeTab = (searchParams.get("tab") as BookingStatus) || "ALL"
  const selectedStationId = searchParams.get("stationId") || "ALL"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = 10
  const refetchParam = searchParams.get("refetch")

  // Fetch station list for station filter dropdown when Admin or Owner
  useEffect(() => {
    if (isAdmin || isOwner) {
      import("@/shared/apis/station.api")
        .then(({ stationApi }) => stationApi.getStations({ limit: 100 }))
        .then((res) => {
          if (res && res.stations) {
            const list = res.stations.map((st) => ({
              id: st.id,
              name: st.name || "Wash Station",
            }))
            setFilterStations(list)
          }
        })
        .catch(() => {
          // Ignore error fallback
        })
    }
  }, [isAdmin, isOwner])

  // Derive unique stations fallback if filterStations empty
  const ownerStations = useMemo(() => {
    if (filterStations.length > 0) return filterStations

    const map = new Map<string, string>()
    bookings.forEach((b) => {
      if (b.stationId && b.stationName) {
        map.set(b.stationId, b.stationName)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [filterStations, bookings])

  // Helper to update query parameters
  const updateParams = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      setSearchParams((prev) => {
        const updated = new URLSearchParams(prev)
        Object.entries(newParams).forEach(([key, val]) => {
          if (val === undefined || val === "" || val === 1 || val === "ALL") {
            updated.delete(key)
          } else {
            updated.set(key, String(val))
          }
        })
        return updated
      })
    },
    [setSearchParams]
  )

  // Fetch bookings data on URL params change
  useEffect(() => {
    loadBookings({
      activeTab,
      stationId: selectedStationId,
      q: searchQuery,
      page,
      limit,
      userName: user?.name,
      userPhone: user?.phone,
    })
  }, [
    loadBookings,
    activeTab,
    selectedStationId,
    searchQuery,
    page,
    user?.name,
    user?.phone,
    refetchParam,
  ])

  // Fetch manager station if manager role
  useEffect(() => {
    if (isManager) {
      loadManagerStation()
    }
  }, [isManager, loadManagerStation])

  const filteredBookings = bookings

  // Handle Cancel Submit
  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return
    const success = await cancelBooking(selectedBookingForCancel.id, cancellationReason)
    if (success) {
      loadBookings({
        activeTab,
        stationId: selectedStationId,
        q: searchQuery,
        page,
        limit,
        userName: user?.name,
        userPhone: user?.phone,
      })
    }
  }

  const handleRefresh = () => {
    updateParams({ refetch: Date.now() })
  }

  return {
    searchQuery,
    activeTab,
    selectedStationId,
    ownerStations,
    page,
    pagination,
    bookings,
    filteredBookings,
    isLoading,
    error,
    managedStation,
    isFetchingManagerStation,
    selectedBookingForQr,
    setSelectedBookingForQr,
    selectedBookingForCancel,
    setSelectedBookingForCancel,
    cancellationReason,
    setCancellationReason,
    isSubmittingCancel,
    updateParams,
    handleConfirmCancel,
    handleRefresh,
  }
}
