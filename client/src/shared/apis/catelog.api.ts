import { api } from "@/shared/config/axios"
import { handleApiError } from "@/shared/utils/handleApiError"
import type {
  VehicleCategory,
  CreateCategoryInput,
  UpdateCategoryInput,
  VehicleClass,
  CreateClassInput,
  UpdateClassInput,
} from "@/features/vehicle-catelog/types"

// Response wrappers matching backend's standard JSON format
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const vehicleCatelogApi = {
  // --- Category APIs ---
  getCategories: async (): Promise<VehicleCategory[]> => {
    try {
      const response = await api.get<ApiResponse<VehicleCategory[]>>("/vehicle-catalog/categories")
      return response.data.data ?? []
    } catch (error: unknown) {
      handleApiError(error, "Failed to retrieve categories")
    }
  },

  getCategory: async (id: string): Promise<VehicleCategory> => {
    try {
      const response = await api.get<ApiResponse<VehicleCategory>>(
        `/vehicle-catalog/categories/${id}`
      )
      return response.data.data
    } catch (error: unknown) {
      handleApiError(error, "Failed to retrieve category details")
    }
  },

  createCategory: async (data: CreateCategoryInput): Promise<VehicleCategory> => {
    try {
      const response = await api.post<ApiResponse<VehicleCategory>>(
        "/vehicle-catalog/categories",
        data,
        {
          successToast: "Category created successfully",
        }
      )
      return response.data.data
    } catch (error: unknown) {
      handleApiError(error, "Failed to create category")
    }
  },

  updateCategory: async (id: string, data: UpdateCategoryInput): Promise<VehicleCategory> => {
    try {
      const response = await api.patch<ApiResponse<VehicleCategory>>(
        `/vehicle-catalog/categories/${id}`,
        data,
        {
          successToast: "Category updated successfully",
        }
      )
      return response.data.data
    } catch (error: unknown) {
      handleApiError(error, "Failed to update category")
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      await api.delete(`/vehicle-catalog/categories/${id}`, {
        successToast: "Category deleted successfully",
      })
    } catch (error: unknown) {
      handleApiError(error, "Failed to delete category")
    }
  },

  // --- Class APIs ---
  getClasses: async (filters?: { categoryId?: string }): Promise<VehicleClass[]> => {
    try {
      const response = await api.get<ApiResponse<VehicleClass[]>>("/vehicle-catalog/classes", {
        params: filters,
      })
      return response.data.data ?? []
    } catch (error: unknown) {
      handleApiError(error, "Failed to retrieve classes")
    }
  },

  getClass: async (id: string): Promise<VehicleClass> => {
    try {
      const response = await api.get<ApiResponse<VehicleClass>>(`/vehicle-catalog/classes/${id}`)
      return response.data.data
    } catch (error: unknown) {
      handleApiError(error, "Failed to retrieve class details")
    }
  },

  createClass: async (data: CreateClassInput): Promise<VehicleClass> => {
    try {
      const response = await api.post<ApiResponse<VehicleClass>>("/vehicle-catalog/classes", data, {
        successToast: "Class created successfully",
      })
      return response.data.data
    } catch (error: unknown) {
      handleApiError(error, "Failed to create class")
    }
  },

  updateClass: async (id: string, data: UpdateClassInput): Promise<VehicleClass> => {
    try {
      const response = await api.put<ApiResponse<VehicleClass>>(
        `/vehicle-catalog/classes/${id}`,
        data,
        {
          successToast: "Class updated successfully",
        }
      )
      return response.data.data
    } catch (error: unknown) {
      handleApiError(error, "Failed to update class")
    }
  },

  deleteClass: async (id: string): Promise<void> => {
    try {
      await api.delete(`/vehicle-catalog/classes/${id}`, {
        successToast: "Class deleted successfully",
      })
    } catch (error: unknown) {
      handleApiError(error, "Failed to delete class")
    }
  },
}
