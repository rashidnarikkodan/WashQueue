import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"

export interface CreateBookingInput {
  stationId: string
  vehicleId: string
  timeWindowId: string
  serviceType: "HALF" | "FULL"
  extraServiceIds?: string[]
  paymentType?: "ONLINE_FULL" | "DEPOSIT_PLUS_CASH" | "CASH_WALKIN"
}

export interface BookingStatusHistoryItem {
  id: string
  bookingId: string
  fromStatus: string | null
  toStatus: string
  changedBy: string
  reason?: string
  notes?: string
  createdAt: string
}

export interface BookingResponse {
  id: string
  bookingNumber: string
  userId?: string | null
  providerId: string
  stationId: string
  vehicleId?: string | null
  serviceType: "HALF" | "FULL"
  pricingSnapshot: {
    basePrice: number
    extraPrice: number
    totalPrice: number
    currency: string
  }
  scheduling: {
    timeWindowId: string
    windowStart: string
    windowEnd: string
  }
  stationDetails?: {
    name?: string
    city?: string
    phone?: string
  }
  vehicleDetails?: {
    nickname?: string
    brand?: string
    model?: string
    registrationNumber?: string
  }
  customerDetails?: {
    name?: string
    email?: string
    phone?: string
  }
  walkInCustomer?: {
    name?: string
    phone?: string
  } | null
  walkInVehicle?: {
    registrationNumber?: string
    categoryId?: string
    classId?: string
  } | null
  extraServices?: Array<{
    serviceId: string
    name: string
    price: number
  }>
  rawQrToken?: string
  status: string
  paymentStatus: string
  paymentType: string
  depositAmount: number
  cashAmount: number
  statusHistory?: BookingStatusHistoryItem[]
  createdAt: string
  updatedAt: string
}

export interface GetUserBookingsParams {
  type?: "upcoming" | "history" | "all"
  page?: number
  limit?: number
  status?: string
  stationId?: string
  providerId?: string
  q?: string
}

export interface BookingListApiResponse {
  bookings: BookingResponse[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const bookingApi = {
  createBooking: async (input: CreateBookingInput): Promise<BookingResponse> => {
    try {
      const response = await api.post(API_ROUTES.BOOKINGS.ROOT, input)
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to create booking")
    }
  },

  getBookingById: async (bookingId: string): Promise<BookingResponse> => {
    try {
      const response = await api.get(API_ROUTES.BOOKINGS.BY_ID(bookingId))
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to fetch booking details")
    }
  },

  getUserBookings: async (
    params: "upcoming" | "history" | "all" | GetUserBookingsParams = "all"
  ): Promise<BookingListApiResponse> => {
    try {
      const queryParams = typeof params === "string" ? { type: params } : params
      const response = await api.get(API_ROUTES.BOOKINGS.ROOT, { params: queryParams })
      const raw = response.data.data

      if (Array.isArray(raw)) {
        return {
          bookings: raw,
          pagination: {
            total: raw.length,
            page: typeof queryParams === "object" ? queryParams.page || 1 : 1,
            limit: typeof queryParams === "object" ? queryParams.limit || 10 : 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }
      }

      return {
        bookings: raw?.bookings || [],
        pagination: raw?.pagination,
      }
    } catch (error) {
      throw handleApiError(error, "Failed to fetch user bookings")
    }
  },

  cancelBooking: async (bookingId: string, reason: string): Promise<BookingResponse> => {
    try {
      const response = await api.patch(API_ROUTES.BOOKINGS.CANCEL(bookingId), { reason })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to cancel booking")
    }
  },

  advanceStatus: async (bookingId: string, targetStatus: string): Promise<BookingResponse> => {
    try {
      const response = await api.patch(`${API_ROUTES.BOOKINGS.ROOT}/${bookingId}/status`, {
        targetStatus,
      })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to update booking status")
    }
  },

  checkIn: async (qrToken: string): Promise<BookingResponse> => {
    try {
      const response = await api.post(`${API_ROUTES.BOOKINGS.ROOT}/check-in`, { qrToken })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to check in booking")
    }
  },

  createWalkIn: async (input: {
    stationId: string
    serviceType: "HALF" | "FULL"
    walkInCustomer?: { name: string; phone: string }
    walkInVehicle: { registrationNumber: string; categoryId: string; classId: string }
    extraServiceIds?: string[]
  }): Promise<BookingResponse> => {
    try {
      const response = await api.post(`${API_ROUTES.BOOKINGS.ROOT}/walk-in`, input)
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to create walk-in booking")
    }
  },

  downloadInvoice: async (bookingId: string, bookingNumber: string): Promise<void> => {
    try {
      const response = await api.get(`${API_ROUTES.BOOKINGS.ROOT}/${bookingId}/invoice`, {
        responseType: "blob",
      })
      const blob = new Blob([response.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Invoice-${bookingNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      throw handleApiError(error, "Failed to download invoice")
    }
  },
}
