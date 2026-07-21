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
      const { imageFile, ...rest } = input

      if (imageFile) {
        const form = new FormData()
        form.append("nickname", rest.nickname)
        form.append("brand", rest.brand)
        form.append("model", rest.model)
        form.append("year", String(rest.year))
        if (rest.registrationNumber) form.append("registrationNumber", rest.registrationNumber)
        form.append("categoryId", rest.categoryId)
        form.append("classId", rest.classId)
        if (rest.isPrimary !== undefined) form.append("isPrimary", String(rest.isPrimary))
        form.append("image", imageFile)

        const response = await api.post<{ data: Vehicle }>(API_ROUTES.VEHICLES.ROOT, form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data.data
      }

      const response = await api.post<{ data: Vehicle }>(API_ROUTES.VEHICLES.ROOT, rest)
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
