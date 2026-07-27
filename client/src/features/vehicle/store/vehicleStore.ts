import { create } from "zustand"
import { toast } from "sonner"
import type { Vehicle, CreateVehicleInput } from "../types"
import { getErrorMessage } from "@/shared/utils/error"
import { vehicleApi } from "@/shared/apis"

interface VehicleStore {
  vehicles: Vehicle[]
  currentVehicle: Vehicle | null
  isLoading: boolean
  isLoadingCurrentVehicle: boolean
  isActionLoading: boolean

  loadVehicles: () => Promise<void>
  loadVehicleById: (id: string) => Promise<Vehicle | null>
  addVehicle: (input: CreateVehicleInput) => Promise<boolean>
  updateVehicle: (id: string, input: Partial<CreateVehicleInput>) => Promise<boolean>
  deleteVehicle: (id: string) => Promise<boolean>
  setPrimary: (id: string) => Promise<boolean>
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],
  currentVehicle: null,
  isLoading: false,
  isLoadingCurrentVehicle: false,
  isActionLoading: false,

  loadVehicles: async () => {
    set({ isLoading: true })
    try {
      const vehicles = await vehicleApi.getVehicles()
      set({ vehicles })
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load vehicles"))
    } finally {
      set({ isLoading: false })
    }
  },

  loadVehicleById: async (id: string) => {
    set({ isLoadingCurrentVehicle: true })
    try {
      const vehicle = await vehicleApi.getVehicleById(id)
      set({ currentVehicle: vehicle })
      return vehicle
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load vehicle details"))
      return null
    } finally {
      set({ isLoadingCurrentVehicle: false })
    }
  },

  addVehicle: async (input) => {
    set({ isActionLoading: true })
    try {
      const vehicle = await vehicleApi.createVehicle(input)
      set((state) => {
        const updatedVehicles = vehicle.isPrimary
          ? state.vehicles.map((v) => ({ ...v, isPrimary: false }))
          : state.vehicles
        return { vehicles: [vehicle, ...updatedVehicles] }
      })
      toast.success("Vehicle registered successfully")
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add vehicle"))
      return false
    } finally {
      set({ isActionLoading: false })
    }
  },

  updateVehicle: async (id, input) => {
    set({ isActionLoading: true })
    try {
      const updated = await vehicleApi.updateVehicle(id, input)
      set((state) => ({
        vehicles: state.vehicles.map((v) => (v.id === id ? updated : v)),
        currentVehicle: state.currentVehicle?.id === id ? updated : state.currentVehicle,
      }))
      toast.success("Vehicle updated successfully")
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update vehicle"))
      return false
    } finally {
      set({ isActionLoading: false })
    }
  },

  deleteVehicle: async (id) => {
    set({ isActionLoading: true })
    try {
      const vehicleToDelete = get().vehicles.find((v) => v.id === id)
      const wasPrimary = vehicleToDelete?.isPrimary

      await vehicleApi.deleteVehicle(id)

      set((state) => {
        const filtered = state.vehicles.filter((v) => v.id !== id)
        if (wasPrimary && filtered.length > 0) {
          filtered[0] = { ...filtered[0], isPrimary: true }
        }
        return {
          vehicles: filtered,
          currentVehicle: state.currentVehicle?.id === id ? null : state.currentVehicle,
        }
      })

      toast.success("Vehicle removed successfully")
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete vehicle"))
      return false
    } finally {
      set({ isActionLoading: false })
    }
  },

  setPrimary: async (id) => {
    set({ isActionLoading: true })
    try {
      const updated = await vehicleApi.setPrimaryVehicle(id)
      set((state) => ({
        vehicles: state.vehicles.map((v) =>
          v.id === id ? { ...v, isPrimary: true } : { ...v, isPrimary: false }
        ),
        currentVehicle:
          state.currentVehicle?.id === id
            ? { ...state.currentVehicle, isPrimary: true }
            : state.currentVehicle
            ? { ...state.currentVehicle, isPrimary: false }
            : null,
      }))
      toast.success(`${updated.nickname} set as primary vehicle`)
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to set primary vehicle"))
      return false
    } finally {
      set({ isActionLoading: false })
    }
  },
}))
