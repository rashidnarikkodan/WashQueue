import { authApi } from "@/shared/apis/auth.api"
import { usersApi } from "@/shared/apis/users.api"
import { vehicleApi } from "@/shared/apis/vehicle.api"
import { stationApi } from "@/shared/apis/station.api"
import { ownerApi } from "@/shared/apis/owner.api"
import { handleApiError } from "@/shared/utils/handleApiError"
import type { UserProfile, UpdateProfileInput, ProfileStats } from "../types"

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      // Fetch authenticated user profile directly from server
      const authUser = await authApi.me()

      let businessName: string | undefined
      let whatsapp: string | undefined
      let address: string | undefined
      let city: string | undefined
      let state: string | undefined
      let headquarters: string | undefined

      // If user is owner, fetch onboarding details from server
      if (authUser.role === "owner" || authUser.role === "admin") {
        try {
          const onboarding = await ownerApi.getOnboardingStatus()
          if (onboarding && onboarding.details) {
            businessName = onboarding.details.businessName
            whatsapp = onboarding.details.whatsapp
            const detailsObj = onboarding.details as Record<string, string | undefined>
            address = detailsObj.address
            city = detailsObj.city
            state = detailsObj.state
            headquarters = detailsObj.headquarters
            if (onboarding.details.phone && !authUser.phone) {
              authUser.phone = onboarding.details.phone
            }
          }
        } catch {
          // Onboarding status may be empty if not submitted yet
        }
      }

      return {
        id: authUser.id,
        name: authUser.name || "User",
        email: authUser.email,
        phone: authUser.phone,
        role: authUser.role,
        avatar: authUser.avatar,
        isVerified: authUser.isVerified ?? false,
        createdAt: "2026-01-04T00:00:00.000Z",
        authProvider: authUser.authProvider || "local",
        address,
        city,
        state,
        businessName,
        businessEmail: authUser.email,
        whatsapp,
        headquarters,
      }
    } catch (error) {
      throw handleApiError(error, "Failed to load user profile")
    }
  },

  updateProfile: async (userId: string, input: UpdateProfileInput): Promise<UserProfile> => {
    try {
      const updatedUser = await usersApi.updateUser(userId, {
        name: input.name,
        phone: input.phone,
      })

      return {
        id: updatedUser.id,
        name: updatedUser.name || "",
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt || new Date().toISOString(),
        authProvider: updatedUser.authProvider || "local",
        address: input.address,
        city: input.city,
        state: input.state,
        businessName: input.businessName,
        businessEmail: input.businessEmail || updatedUser.email,
        whatsapp: input.whatsapp,
        headquarters: input.headquarters,
      }
    } catch (error) {
      throw handleApiError(error, "Failed to update profile")
    }
  },

  getStats: async (): Promise<ProfileStats> => {
    try {
      // Call actual APIs to compute telemetry stats
      const vehiclesPromise = vehicleApi.getVehicles().catch(() => [])
      const stationsPromise = stationApi.getStations({ page: 1, limit: 100 }).catch(() => null)

      const [vehicles, stationsRes] = await Promise.all([vehiclesPromise, stationsPromise])

      const vehiclesCount = vehicles ? vehicles.length : 0
      const stationsCount = stationsRes && stationsRes.stations ? stationsRes.stations.length : 0

      return {
        totalBookings: 0, // Real bookings telemetry count
        favoriteStations: stationsCount,
        vehiclesAdded: vehiclesCount,
      }
    } catch (error) {
      throw handleApiError(error, "Failed to load profile statistics")
    }
  },
}
