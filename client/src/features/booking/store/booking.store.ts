import { create } from "zustand"
import { toast } from "sonner"
import { bookingApi } from "@/shared/apis/booking.api"
import { managerApi } from "@/shared/apis/manager.api"
import { getErrorMessage } from "@/shared/utils/error"
import type { Booking, BookingStatus, PaymentStatus } from "../types/booking.types"

type ManagedStationItem = Awaited<ReturnType<typeof managerApi.getManagedStations>>[number]

interface BookingStore {
  // State
  bookings: Booking[]
  isLoading: boolean
  isActionLoading: boolean
  error: string | null
  managedStation: ManagedStationItem | null
  isFetchingManagerStation: boolean

  // Modals state
  selectedBookingForQr: Booking | null
  selectedBookingForCancel: Booking | null
  cancellationReason: string
  isSubmittingCancel: boolean

  // Actions
  loadBookings: (activeTab?: string, userName?: string, userPhone?: string) => Promise<void>
  loadManagerStation: () => Promise<void>
  cancelBooking: (id: string, reason?: string) => Promise<boolean>
  setSelectedBookingForQr: (booking: Booking | null) => void
  setSelectedBookingForCancel: (booking: Booking | null) => void
  setCancellationReason: (reason: string) => void
  clearError: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  isLoading: false,
  isActionLoading: false,
  error: null,
  managedStation: null,
  isFetchingManagerStation: false,
  selectedBookingForQr: null,
  selectedBookingForCancel: null,
  cancellationReason: "",
  isSubmittingCancel: false,

  loadBookings: async (activeTab = "ALL", userName, userPhone) => {
    set({ isLoading: true, error: null })
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
          b.customerDetails?.name || b.walkInCustomer?.name || (b.userId ? userName || "Customer" : "Walk-In Customer")
        const customerPhone = b.customerDetails?.phone || b.walkInCustomer?.phone || userPhone || ""
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

      set({ bookings: mapped, isLoading: false })
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load bookings")
      set({ error: msg, isLoading: false })
    }
  },

  loadManagerStation: async () => {
    set({ isFetchingManagerStation: true })
    try {
      const res = await managerApi.getManagedStations()
      if (res && res.length > 0) {
        set({ managedStation: res[0] })
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to fetch manager station assignment")
      set({ error: msg })
    } finally {
      set({ isFetchingManagerStation: false })
    }
  },

  cancelBooking: async (id: string, reason = "Requested cancellation") => {
    set({ isSubmittingCancel: true })
    try {
      await bookingApi.cancelBooking(id, reason)
      toast.success("Booking cancelled successfully")
      set({ selectedBookingForCancel: null, cancellationReason: "", isSubmittingCancel: false })
      return true
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to cancel booking"))
      set({ isSubmittingCancel: false })
      return false
    }
  },

  setSelectedBookingForQr: (booking) => set({ selectedBookingForQr: booking }),
  setSelectedBookingForCancel: (booking) => set({ selectedBookingForCancel: booking, cancellationReason: "" }),
  setCancellationReason: (reason) => set({ cancellationReason: reason }),
  clearError: () => set({ error: null }),
}))
