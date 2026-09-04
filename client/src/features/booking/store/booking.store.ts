import { create } from "zustand"
import { toast } from "sonner"
import { bookingApi } from "@/shared/apis/booking.api"
import { managerApi } from "@/shared/apis/manager.api"
import { getErrorMessage } from "@/shared/utils/error"
import type { Booking, BookingStatus, PaymentStatus } from "../types/booking.types"

type ManagedStationItem = Awaited<ReturnType<typeof managerApi.getManagedStation>>[number]

export interface LoadBookingsParams {
  activeTab?: string
  stationId?: string
  q?: string
  page?: number
  limit?: number
  userName?: string
  userPhone?: string
  /** Forces the result to be scoped strictly to the caller's own userId, regardless of role. */
  mine?: boolean
}

interface BookingStore {
  bookings: Booking[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  isLoading: boolean
  isActionLoading: boolean
  error: string | null
  managedStation: ManagedStationItem | null
  isFetchingManagerStation: boolean

  selectedBookingForQr: Booking | null
  selectedBookingForCancel: Booking | null
  cancellationReason: string
  isSubmittingCancel: boolean

  loadBookings: (
    params?: string | LoadBookingsParams,
    userName?: string,
    userPhone?: string
  ) => Promise<void>
  loadManagerStation: () => Promise<void>
  cancelBooking: (id: string, reason?: string) => Promise<boolean>
  setSelectedBookingForQr: (booking: Booking | null) => void
  setSelectedBookingForCancel: (booking: Booking | null) => void
  setCancellationReason: (reason: string) => void
  clearError: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  isActionLoading: false,
  error: null,
  managedStation: null,
  isFetchingManagerStation: false,
  selectedBookingForQr: null,
  selectedBookingForCancel: null,
  cancellationReason: "",
  isSubmittingCancel: false,

  loadBookings: async (params = "ALL", userNameArg, userPhoneArg) => {
    set({ isLoading: true, error: null })
    try {
      const opts: LoadBookingsParams =
        typeof params === "string"
          ? { activeTab: params, userName: userNameArg, userPhone: userPhoneArg }
          : params

      const activeTab = opts.activeTab || "ALL"
      const page = opts.page || 1
      const limit = opts.limit || 10
      const q = opts.q
      const stationId = opts.stationId
      const userName = opts.userName || userNameArg
      const userPhone = opts.userPhone || userPhoneArg

      const apiParams: Record<string, unknown> = {
        page,
        limit,
      }

      if (opts.mine) {
        apiParams.mine = true
      }

      if (q && q.trim()) {
        apiParams.q = q.trim()
      }

      if (stationId && stationId !== "ALL") {
        apiParams.stationId = stationId
      }

      if (activeTab && activeTab !== "ALL") {
        if (activeTab === "CONFIRMED") {
          apiParams.status = "CONFIRMED"
        } else if (activeTab === "COMPLETED") {
          apiParams.status = "COMPLETED"
        } else if (activeTab === "CANCELLED") {
          apiParams.status = "CANCELLED"
        } else if (activeTab === "NO_SHOW") {
          apiParams.type = "noshow"
          apiParams.status = "NO_SHOW"
        } else if (activeTab === "IN_PROGRESS") {
          apiParams.type = "upcoming"
        }
      }

      const res = await bookingApi.getUserBookings(apiParams)

      const mapped: Booking[] = (res.bookings || []).map((b) => {
        const startDate = new Date(b.scheduling.windowStart)
        const endDate = new Date(b.scheduling.windowEnd)
        const timeFormat = (d: Date) =>
          d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const dateFormat = (d: Date) =>
          d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

        const stationName = b.stationDetails?.name || "WashQueue Station"
        const customerName =
          b.customerDetails?.name ||
          b.walkInCustomer?.name ||
          (b.userId ? userName || "Customer" : "Walk-In Customer")
        const customerPhone = b.customerDetails?.phone || b.walkInCustomer?.phone || userPhone || ""
        const vehicleNumber =
          b.vehicleDetails?.registrationNumber ||
          b.walkInVehicle?.registrationNumber ||
          "Vehicle Plate"
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
          windowStart: b.scheduling?.windowStart,
          scheduling: b.scheduling,
          pricingSnapshot: b.pricingSnapshot,
          amount: b.pricingSnapshot.totalPrice,
          paymentStatus: b.paymentStatus as PaymentStatus,
          status: b.status as BookingStatus,
          createdAt: b.createdAt,
        }
      })

      const getStatusPriority = (status?: string): number => {
        switch (status) {
          case "IN_SERVICE":
          case "CHECKED_IN":
            return 1
          case "CONFIRMED":
          case "PENDING":
            return 2
          case "SERVICE_COMPLETED":
          case "AWAITING_HANDOVER":
            return 3
          case "COMPLETED":
            return 4
          case "NO_SHOW":
          case "CANCELLED":
            return 5
          default:
            return 6
        }
      }

      mapped.sort((a, b) => {
        const pA = getStatusPriority(a.status)
        const pB = getStatusPriority(b.status)
        if (pA !== pB) {
          return pA - pB
        }
        const startA = a.windowStart ? new Date(a.windowStart).getTime() : 0
        const startB = b.windowStart ? new Date(b.windowStart).getTime() : 0
        if (pA <= 2) {
          return startA - startB
        }
        return startB - startA
      })

      const pagination = res.pagination || {
        total: mapped.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(mapped.length / limit)),
        hasNextPage: page < Math.max(1, Math.ceil(mapped.length / limit)),
        hasPrevPage: page > 1,
      }

      set({ bookings: mapped, pagination, isLoading: false })
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load bookings")
      set({ error: msg, isLoading: false })
    }
  },

  loadManagerStation: async () => {
    set({ isFetchingManagerStation: true })
    try {
      const res = await managerApi.getManagedStation()
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
  setSelectedBookingForCancel: (booking) =>
    set({ selectedBookingForCancel: booking, cancellationReason: "" }),
  setCancellationReason: (reason) => set({ cancellationReason: reason }),
  clearError: () => set({ error: null }),
}))
