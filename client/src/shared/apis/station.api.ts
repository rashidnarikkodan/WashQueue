import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import type {
  CreateStationInput,
  CreateStationResponse,
  FilterMetadata,
  GetStationsQuery,
  GetStationsResponse,
  Station,
  StationDetail,
  UpdateStationInput,
} from "@/features/station/types"

import type { ApiResponse } from "../types/ApiResponse"
import type { Window as TimeWindowSlot } from "@/features/booking/types/booking.types"

export const stationApi = {
  getFilterOptions: async (): Promise<FilterMetadata> => {
    try {
      const response = await api.get(`${API_ROUTES.STATIONS.ROOT}/filter-options`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to retrieve filter options")
    }
  },

  getStations: async (query: GetStationsQuery = {}): Promise<GetStationsResponse> => {
    try {
      console.log(query)
      const response = await api.get(API_ROUTES.STATIONS.ROOT, {
        params: query,
      })

      const raw = response.data.data
      if (Array.isArray(raw)) {
        return {
          stations: raw,
          pagination: {
            total: raw.length,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }
      }

      return {
        stations: raw?.stations || [],
        pagination: raw?.pagination || {
          total: 0,
          page: query.page ?? 1,
          limit: query.limit ?? 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }
    } catch (error) {
      throw handleApiError(error, "Failed to retrieve stations")
    }
  },

  getStationById: async (id: string): Promise<StationDetail> => {
    try {
      const response = await api.get<{ data: StationDetail }>(API_ROUTES.STATIONS.BY_ID(id))
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to retrieve station details")
    }
  },

  createStation: async (input: CreateStationInput | FormData): Promise<CreateStationResponse> => {
    try {
      const isFormData = typeof FormData !== "undefined" && input instanceof FormData
      const response = await api.post<ApiResponse<CreateStationResponse>>(
        API_ROUTES.STATIONS.ROOT,
        input,
        isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to create station")
    }
  },

  updateStation: async (
    id: string,
    input: UpdateStationInput | FormData
  ): Promise<StationDetail> => {
    try {
      const isFormData = typeof FormData !== "undefined" && input instanceof FormData
      const response = await api.patch<{ data: StationDetail }>(
        API_ROUTES.STATIONS.BY_ID(id),
        input,
        isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to update station")
    }
  },

  submitStation: async (id: string): Promise<Station> => {
    try {
      const response = await api.post<{ data: Station }>(API_ROUTES.STATIONS.SUBMIT(id))
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to submit station for review")
    }
  },

  reviewStation: async (
    id: string,
    action: "APPROVE" | "REJECT" | "SUSPEND",
    rejectionReason?: string
  ): Promise<Station> => {
    try {
      const response = await api.patch<{ data: Station }>(API_ROUTES.STATIONS.REVIEW(id), {
        action,
        rejectionReason,
      })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, `Failed to ${action.toLowerCase()} station`)
    }
  },

  deleteStation: async (id: string): Promise<void> => {
    try {
      await api.delete(API_ROUTES.STATIONS.BY_ID(id))
    } catch (error) {
      throw handleApiError(error, "Failed to delete station draft")
    }
  },

  toggleActiveStation: async (id: string): Promise<Station> => {
    try {
      const response = await api.patch<{ data: Station }>(
        `${API_ROUTES.STATIONS.BY_ID(id)}/toggle-active`
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to toggle station activation status")
    }
  },

  getBookingCalendar: async (
    stationId: string
  ): Promise<{
    minDate: string
    maxDate: string
    dates: { date: string; status: "AVAILABLE" | "FULL" | "HOLIDAY" | "CLOSED" }[]
  }> => {
    try {
      const response = await api.get(`/stations/${stationId}/booking-calendar`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to retrieve booking calendar")
    }
  },

  getAvailableTimeWindows: async (
    stationId: string,
    date: string
  ): Promise<{
    stationId: string
    date: string
    windows: TimeWindowSlot[]
  }> => {
    try {
      const response = await api.get(`/stations/${stationId}/time-windows`, {
        params: { date },
      })
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to retrieve time windows")
    }
  },

  getPublicLiveQueue: async (
    stationId: string
  ): Promise<{
    stationId: string
    stationName: string
    totalBays: number
    activeServicesCount: number
    availableBays: number
    queueDepth: number
    totalActiveAndWaiting: number
    averageWashDurationMinutes: number
    activeServices: Array<{
      id: string
      bookingNumber: string
      bayNumber: number
      vehicle: string
      package: string
      serviceType: string
      status: string
      serviceStartedAt?: string
      isBayActive: boolean
    }>
    waitingQueue: Array<{
      id: string
      bookingNumber: string
      position: number
      vehicle: string
      package: string
      serviceType: string
      status: string
      estimatedWaitMinutes?: number
      estimatedServiceStart?: string
      isBayActive: boolean
    }>
  }> => {
    try {
      const response = await api.get(`/bookings/stations/${stationId}/public-queue`)
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to retrieve station live queue")
    }
  },
}
