import { useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { useBookingStore } from "../store/booking.store"
import type { BookingStatus } from "../types/booking.types"

export interface UseBookingListOptions {
  isManager?: boolean
}

export function useBookingList({ isManager = false }: UseBookingListOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()

  // Zustand Store
  const {
    bookings,
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
  const page = parseInt(searchParams.get("page") || "1", 10)
  const refetchParam = searchParams.get("refetch")

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

  // Fetch bookings data on tab/user/refetch change
  useEffect(() => {
    loadBookings(activeTab, user?.name, user?.phone)
  }, [loadBookings, activeTab, user?.name, user?.phone, refetchParam])

  // Fetch manager station if manager role
  useEffect(() => {
    if (isManager) {
      loadManagerStation()
    }
  }, [isManager, loadManagerStation])

  // Filtered bookings calculation
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (activeTab !== "ALL") {
        if (activeTab === "IN_PROGRESS") {
          if (b.status !== "IN_PROGRESS" && b.status !== "IN_SERVICE" && b.status !== "CHECKED_IN") {
            return false
          }
        } else if (b.status !== activeTab) {
          return false
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          b.bookingNumber.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.stationName.toLowerCase().includes(q) ||
          b.serviceName.toLowerCase().includes(q) ||
          b.vehicleNumber.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [bookings, activeTab, searchQuery])

  // Handle Cancel Submit
  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return
    const success = await cancelBooking(selectedBookingForCancel.id, cancellationReason)
    if (success) {
      loadBookings(activeTab, user?.name, user?.phone)
    }
  }

  const handleRefresh = () => {
    updateParams({ refetch: Date.now() })
  }

  return {
    searchQuery,
    activeTab,
    page,
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
