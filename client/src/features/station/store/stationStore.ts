import { create } from "zustand"
import { toast } from "sonner"

import type {
  Station,
  StationDetail,
  CreateStationInput,
  UpdateStationInput,
  GetStationsQuery,
} from "../types"
import { getErrorMessage } from "@/shared/utils/error"
import { stationApi } from "@/shared/apis"

interface StationStore {
  // State
  stations: Station[]
  selectedStation: StationDetail | null
  isLoading: boolean
  isSubmitting: boolean
  error: string | null

  // Actions
  fetchStations: (query?: GetStationsQuery) => Promise<void>
  fetchStationById: (id: string) => Promise<void>
  createStation: (input: CreateStationInput) => Promise<Station | null>
  updateStation: (id: string, input: UpdateStationInput) => Promise<StationDetail | null>
  submitStation: (id: string) => Promise<boolean>
  reviewStation: (id: string, action: "APPROVE" | "REJECT", rejectionReason?: string) => Promise<boolean>
  deleteStation: (id: string) => Promise<boolean>
  toggleActiveStation: (id: string) => Promise<Station | null>
  clearError: () => void
  clearSelected: () => void
}

export const useStationStore = create<StationStore>((set) => ({
  stations: [],
  selectedStation: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchStations: async (query = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await stationApi.getStations(query)
      set({ stations: response.stations, isLoading: false })
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load stations")
      set({ error: msg, isLoading: false })
    }
  },

  fetchStationById: async (id: string) => {
    set({ isLoading: true, error: null, selectedStation: null })
    try {
      const detail = await stationApi.getStationById(id)
      set({ selectedStation: detail, isLoading: false })
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to load station details")
      set({ error: msg, isLoading: false })
    }
  },

  createStation: async (input: CreateStationInput) => {
    set({ isSubmitting: true, error: null })
    try {
      const result = await stationApi.createStation(input)
      const station = result.station
      // Optimistically add the new station to the list
      set((state) => ({
        stations: [station, ...state.stations],
        isSubmitting: false,
      }))
      toast.success("Station draft created successfully!")
      return station
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to create station")
      set({ error: msg, isSubmitting: false })
      return null
    }
  },

  updateStation: async (id: string, input: UpdateStationInput) => {
    set({ isSubmitting: true, error: null })
    try {
      const detail = await stationApi.updateStation(id, input)
      // Update the selected station and the list entry
      set((state) => ({
        selectedStation: detail,
        stations: state.stations.map((s) =>
          s.id === id ? detail.station : s
        ),
        isSubmitting: false,
      }))
      toast.success("Station updated successfully!")
      return detail
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update station")
      set({ error: msg, isSubmitting: false })
      return null
    }
  },

  submitStation: async (id: string) => {
    set({ isSubmitting: true, error: null })
    try {
      const updated = await stationApi.submitStation(id)
      // Update status in list and selected station
      set((state) => ({
        stations: state.stations.map((s) => (s.id === id ? updated : s)),
        selectedStation: state.selectedStation
          ? { ...state.selectedStation, station: updated }
          : null,
        isSubmitting: false,
      }))
      toast.success("Station submitted for review!")
      return true
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to submit station")
      set({ error: msg, isSubmitting: false })
      return false
    }
  },

  reviewStation: async (id: string, action: "APPROVE" | "REJECT", rejectionReason?: string) => {
    set({ isSubmitting: true, error: null })
    try {
      const updated = await stationApi.reviewStation(id, action, rejectionReason)
      set((state) => ({
        stations: state.stations.map((s) => (s.id === id ? updated : s)),
        selectedStation: state.selectedStation && state.selectedStation.station.id === id
          ? { ...state.selectedStation, station: updated }
          : state.selectedStation,
        isSubmitting: false,
      }))
      toast.success(`Station ${action === "APPROVE" ? "approved" : "rejected"} successfully!`)
      return true
    } catch (err) {
      const msg = getErrorMessage(err, `Failed to ${action.toLowerCase()} station`)
      set({ error: msg, isSubmitting: false })
      return false
    }
  },

  deleteStation: async (id: string) => {
    set({ isSubmitting: true, error: null })
    try {
      await stationApi.deleteStation(id)
      set((state) => ({
        stations: state.stations.filter((s) => s.id !== id),
        selectedStation: state.selectedStation?.station.id === id ? null : state.selectedStation,
        isSubmitting: false,
      }))
      toast.success("Station draft deleted successfully!")
      return true
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to delete station draft")
      set({ error: msg, isSubmitting: false })
      return false
    }
  },

  toggleActiveStation: async (id: string) => {
    set({ isSubmitting: true, error: null })
    try {
      const updated = await stationApi.toggleActiveStation(id)
      set((state) => ({
        stations: state.stations.map((s) => (s.id === id ? updated : s)),
        selectedStation: state.selectedStation && state.selectedStation.station.id === id
          ? { ...state.selectedStation, station: updated }
          : state.selectedStation,
        isSubmitting: false,
      }))
      toast.success(`Station ${updated.isActive ? "activated" : "deactivated"} successfully!`)
      return updated
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to toggle station active status")
      set({ error: msg, isSubmitting: false })
      return null
    }
  },

  clearError: () => set({ error: null }),
  clearSelected: () => set({ selectedStation: null }),
}))
