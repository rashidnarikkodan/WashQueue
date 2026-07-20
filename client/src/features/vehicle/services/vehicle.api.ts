import { api } from "@/shared/config/axios"
import { API_ROUTES } from "@/shared/constants/api.const"
import { handleApiError } from "@/shared/utils/handleApiError"
import type { Vehicle, CreateVehicleInput } from "../types"

export const vehicleApi = {
  getVehicles: async (): Promise<Vehicle[]> => {
    try {
      const response = await api.get<{ data: Vehicle[] }>(API_ROUTES.VEHICLES.ROOT)
      return response.data.data || []
    } catch (error) {
      throw handleApiError(error, "Failed to retrieve vehicles")
    }
  },

  getVehicleById: async (id: string): Promise<Vehicle> => {
    try {
      const response = await api.get<{ data: Vehicle }>(API_ROUTES.VEHICLES.BY_ID(id))
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to retrieve vehicle details")
    }
  },

  createVehicle: async (input: CreateVehicleInput): Promise<Vehicle> => {
    try {
      const response = await api.post<{ data: Vehicle }>(API_ROUTES.VEHICLES.ROOT, input)
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to create vehicle")
    }
  },

  updateVehicle: async (id: string, input: Partial<CreateVehicleInput>): Promise<Vehicle> => {
    try {
      const response = await api.patch<{ data: Vehicle }>(API_ROUTES.VEHICLES.BY_ID(id), input)
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to update vehicle")
    }
  },

  deleteVehicle: async (id: string): Promise<void> => {
    try {
      await api.delete(API_ROUTES.VEHICLES.BY_ID(id))
    } catch (error) {
      throw handleApiError(error, "Failed to delete vehicle")
    }
  },

  setPrimaryVehicle: async (id: string): Promise<Vehicle> => {
    try {
      const response = await api.patch<{ data: Vehicle }>(API_ROUTES.VEHICLES.PRIMARY(id))
      return response.data.data
    } catch (error) {
      throw handleApiError(error, "Failed to set primary vehicle")
    }
  },
}
