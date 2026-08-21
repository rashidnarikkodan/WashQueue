import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import { PAYMENT_METHOD, type PaymentMethod } from "@/shared/constants/payment.constants"

export interface CreateBookingInput {
  stationId: string
  vehicleId: string
  timeWindowId: string
  serviceType: "HALF" | "FULL"
  extraServiceIds?: string[]
  paymentMethod?: PaymentMethod
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
  vehicleSnapshot?: {
    vehicleCategoryId: string
    vehicleClassId: string
  }
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
  isWalkIn?: boolean
  rescheduleCount?: number
  checkedInAt?: string | null
  serviceStartedAt?: string | null
  serviceCompletedAt?: string | null
  completedAt?: string | null
  cancellation?: {
    cancellationReason?: string
    cancelledBy?: string
    cancelledAt?: string
  } | null
  rawQrToken?: string
  preServiceInspection?: {
    photos: string[]
    notes?: string
    capturedBy: string
    capturedAt: string
  } | null
  postServiceInspection?: {
    photos: string[]
    notes?: string
    capturedBy: string
    capturedAt: string
  } | null
  status: string
  paymentStatus: string
  paymentMethod: string
  depositAmount: number
  cashAmount: number
  statusHistory?: BookingStatusHistoryItem[]
  createdAt: string
  updatedAt: string
}

export interface GetUserBookingsParams {
  type?: "upcoming" | "history" | "all" | "noshow"
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
    params: "upcoming" | "history" | "all" | "noshow" | GetUserBookingsParams = "all"
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

  rescheduleBooking: async (
    bookingId: string,
    newTimeWindowId: string
  ): Promise<BookingResponse> => {
    try {
      const response = await api.patch(API_ROUTES.BOOKINGS.RESCHEDULE(bookingId), {
        newTimeWindowId,
      })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to reschedule booking")
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

  validateQr: async (inputVal: string): Promise<BookingResponse> => {
    try {
      const cleanVal = inputVal.trim().replace(/^#+\s*/, "")
      const response = await api.post(API_ROUTES.BOOKINGS.VALIDATE_QR, {
        qrToken: cleanVal,
        bookingId: cleanVal,
      })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "QR pass validation failed")
    }
  },

  completeHandover: async (bookingId: string, notes?: string): Promise<BookingResponse> => {
    try {
      const response = await api.post(API_ROUTES.BOOKINGS.HANDOVER_BY_ID(bookingId), {
        notes,
        bookingId
      })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to complete vehicle handover")
    }
  },

  savePostInspection: async (
    bookingId: string,
    data: { photos?: string[]; notes?: string }
  ): Promise<BookingResponse> => {
    try {
      const response = await api.post(
        `${API_ROUTES.BOOKINGS.ROOT}/${bookingId}/post-inspection`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to submit post-service inspection")
    }
  },

  stallBooking: async (bookingId: string, reason: string): Promise<BookingResponse> => {
    try {
      const response = await api.post(`${API_ROUTES.BOOKINGS.ROOT}/${bookingId}/stall`, {
        reason,
      })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to stall booking")
    }
  },

  resolveStalled: async (
    bookingId: string,
    resolution: string,
    targetStatus?: "CHECKED_IN" | "IN_SERVICE" | "CANCELLED"
  ): Promise<BookingResponse> => {
    try {
      const response = await api.post(`${API_ROUTES.BOOKINGS.ROOT}/${bookingId}/resolve-stalled`, {
        resolution,
        targetStatus,
      })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to resolve stalled booking")
    }
  },

  savePreInspection: async (
    bookingId: string,
    data: { photos?: string[]; notes?: string }
  ): Promise<BookingResponse> => {
    try {
      const response = await api.post(
        `${API_ROUTES.BOOKINGS.ROOT}/${bookingId}/pre-inspection`,
        data
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to complete pre-service inspection")
    }
  },

  getLiveQueue: async (stationId: string): Promise<{
    stationId: string
    stationName: string
    totalBays: number
    activeServicesCount: number
    availableBays: number
    queueDepth: number
    totalActiveAndWaiting: number
    averageWashDurationMinutes: number
    waitingQueue: Array<{
      bookingId: string
      bookingNumber: string
      stationId: string
      status: string
      serviceType: string
      isWalkIn: boolean
      customerName: string
      customerPhone: string
      registrationNumber: string
      vehicleModel?: string
      windowStart?: string
      windowEnd?: string
      checkedInAt?: string
      serviceStartedAt?: string
      queuePosition: number
      isBayActive: boolean
      assignedBayNumber?: number
      estimatedWaitMinutes: number
    }>
    activeServices: Array<{
      bookingId: string
      bookingNumber: string
      stationId: string
      status: string
      serviceType: string
      isWalkIn: boolean
      customerName: string
      customerPhone: string
      registrationNumber: string
      vehicleModel?: string
      windowStart?: string
      windowEnd?: string
      checkedInAt?: string
      serviceStartedAt?: string
      queuePosition: number
      isBayActive: boolean
      assignedBayNumber?: number
      estimatedWaitMinutes: number
    }>
  }> => {
    try {
      const response = await api.get(
        `${API_ROUTES.BOOKINGS.ROOT}/stations/${stationId}/queue`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to load live station queue")
    }
  },

  startService: async (bookingId: string): Promise<BookingResponse> => {
    try {
      const response = await api.post(`${API_ROUTES.BOOKINGS.ROOT}/${bookingId}/start-service`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to start wash service")
    }
  },

  createWalkIn: async (input: {
    stationId: string
    timeWindowId?: string
    serviceType: "HALF" | "FULL"
    customer?: { userId?: string; name: string; phone: string }
    walkInCustomer?: { name: string; phone: string }
    vehicle?: { vehicleId?: string; registrationNumber: string; categoryId: string; classId: string }
    walkInVehicle?: { registrationNumber: string; categoryId: string; classId: string }
    extraServiceIds?: string[]
  }): Promise<BookingResponse> => {
    try {
      const payload = {
        stationId: input.stationId,
        timeWindowId: input.timeWindowId,
        serviceType: input.serviceType,
        paymentMethod: PAYMENT_METHOD.PAY_AT_STATION,
        extraServiceIds: input.extraServiceIds || [],
        customer: input.customer || (input.walkInCustomer ? { name: input.walkInCustomer.name, phone: input.walkInCustomer.phone } : undefined),
        vehicle: input.vehicle || (input.walkInVehicle ? { registrationNumber: input.walkInVehicle.registrationNumber, categoryId: input.walkInVehicle.categoryId, classId: input.walkInVehicle.classId } : undefined),
      }
      const response = await api.post(`${API_ROUTES.BOOKINGS.ROOT}/walk-in`, payload)
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
