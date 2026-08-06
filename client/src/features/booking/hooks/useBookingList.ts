import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { bookingApi } from "@/shared/apis/booking.api"
import { managerApi } from "@/shared/apis/manager.api"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { toast } from "sonner"
import type { Booking, BookingStatus, PaymentStatus } from "../types/booking.types"

type ManagedStationItem = Awaited<ReturnType<typeof managerApi.getManagedStations>>[number]

export interface UseBookingListOptions {
  isCustomer?: boolean
  isManager?: boolean
}

export function useBookingList({ isManager = false }: UseBookingListOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()

  // Query state from URL
  const searchQuery = searchParams.get("q") || ""
  const activeTab = (searchParams.get("tab") as BookingStatus) || "ALL"
  const page = parseInt(searchParams.get("page") || "1", 10)
  const refetchParam = searchParams.get("refetch")

  // State
  const [managedStation, setManagedStation] = useState<ManagedStationItem | null>(null)
  const [isFetchingManagerStation, setIsFetchingManagerStation] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modals state
  const [selectedBookingForQr, setSelectedBookingForQr] = useState<Booking | null>(null)
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false)

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

  // Fetch bookings data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const type =
        activeTab === "CONFIRMED"
          ? "upcoming"
          : activeTab === "COMPLETED" || activeTab === "CANCELLED"
            ? "history"
            : "all"

      const res = await bookingApi.getUserBookings(type)

      const mapped: Booking[] = res.map((b) => {
        const startDate = new Date(b.scheduling.windowStart)
        const endDate = new Date(b.scheduling.windowEnd)
        const timeFormat = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const dateFormat = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

        const stationName = b.stationDetails?.name || "WashQueue Station"
        const customerName =
          b.customerDetails?.name || b.walkInCustomer?.name || (b.userId ? user?.name || "Customer" : "Walk-In Customer")
        const customerPhone = b.customerDetails?.phone || b.walkInCustomer?.phone || user?.phone || ""
        const vehicleNumber = b.vehicleDetails?.registrationNumber || b.walkInVehicle?.registrationNumber || "Vehicle Plate"
        const vehicleType = b.vehicleDetails?.brand
          ? `${b.vehicleDetails.brand} ${b.vehicleDetails.model || ""}`.trim()
          : "Vehicle"

        return {
          id: b.id,
          bookingNumber: b.bookingNumber,
          stationId: b.stationId,
          stationName,
          customerId: b.userId || "",
          customerName,
          customerPhone,
          serviceName: b.serviceType === "FULL" ? "Complete Full Wash" : "Express Half Wash",
          vehicleNumber,
          vehicleType,
          slotDate: dateFormat(startDate),
          slotTime: `${timeFormat(startDate)} - ${timeFormat(endDate)}`,
          amount: b.pricingSnapshot.totalPrice,
          paymentStatus: b.paymentStatus as PaymentStatus,
          status: b.status as BookingStatus,
          createdAt: b.createdAt,
        }
      })

      setBookings(mapped)
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      console.error("Failed to fetch bookings:", err)
      setError(errorObj?.message || "Failed to load bookings")
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, user?.name, user?.phone])

  useEffect(() => {
    loadData()
  }, [loadData, refetchParam])

  // Fetch manager station if role is manager
  useEffect(() => {
    if (!isManager) return
    let isMounted = true

    queueMicrotask(() => {
      if (isMounted) setIsFetchingManagerStation(true)
    })

    managerApi
      .getManagedStations()
      .then((res) => {
        if (isMounted && res && res.length > 0) {
          setManagedStation(res[0])
        }
      })
      .catch(() => {
        if (isMounted) setError("Failed to fetch manager station assignment.")
      })
      .finally(() => {
        if (isMounted) setIsFetchingManagerStation(false)
      })

    return () => {
      isMounted = false
    }
  }, [isManager])

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
    setIsSubmittingCancel(true)
    try {
      await bookingApi.cancelBooking(selectedBookingForCancel.id, cancellationReason || "Requested cancellation")
      toast.success(`Booking ${selectedBookingForCancel.bookingNumber} cancelled successfully.`)
      setSelectedBookingForCancel(null)
      setCancellationReason("")
      loadData()
    } catch (err: unknown) {
      const errorObj = err as { message?: string }
      toast.error(errorObj?.message || "Failed to cancel booking")
    } finally {
      setIsSubmittingCancel(false)
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
