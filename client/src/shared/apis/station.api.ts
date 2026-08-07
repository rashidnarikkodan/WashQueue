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

  /**
   * Fetch a single station by ID (owner-authenticated).
   */
  getStationById: async (id: string): Promise<StationDetail> => {
    try {
      const response = await api.get<{ data: StationDetail }>(API_ROUTES.STATIONS.BY_ID(id))
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to retrieve station details")
    }
  },

  /**
   * Create a new station draft (Step 1 of setup, supports FormData multipart file upload).
   */
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

  /**
   * Update a station with any of the 4 setup steps (supports FormData multipart file upload).
   */
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

  /**
   * Submit a station for review (transitions DRAFT → PENDING_REVIEW).
   */
  submitStation: async (id: string): Promise<Station> => {
    try {
      const response = await api.post<{ data: Station }>(API_ROUTES.STATIONS.SUBMIT(id))
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to submit station for review")
    }
  },

  /**
   * Review (approve, reject, or suspend) a station.
   */
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

  /**
   * Delete a station draft or rejected application.
   */
  deleteStation: async (id: string): Promise<void> => {
    try {
      await api.delete(API_ROUTES.STATIONS.BY_ID(id))
    } catch (error) {
      throw handleApiError(error, "Failed to delete station draft")
    }
  },

  /**
   * Toggle station active status (ACTIVE ↔ INACTIVE).
   */
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

  /**
   * Assign manager (self or invite) for a station.
   */
  assignManager: async (
    id: string,
    input: { managerType: "SELF" | "INVITE"; email?: string }
  ): Promise<Station> => {
    try {
      const response = await api.post<{ data: Station }>(
        API_ROUTES.STATIONS.ASSIGN_MANAGER(id),
        input
      )
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to assign manager for this station")
    }
  },

  /**
   * Fetch booking calendar statuses for a station.
   */
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

  /**
   * Fetch available time windows for a station on a given date.
   */
  getAvailableTimeWindows: async (
    stationId: string,
    date: string
  ): Promise<{
    stationId: string
    date: string
    windows: {
      windowId: string
      start: string
      end: string
      bookedCount: number
      remainingCapacity: number
      status: "OPEN" | "FULL" | "CLOSED" | "PAST"
    }[]
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
}
