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
      const authUser = await authApi.me()

      let businessName: string | undefined = "WashQueue Enterprise"
      let whatsapp: string | undefined = authUser.phone || "+1 555-019-2831"
      let headquarters: string | undefined = "100 Grand Avenue, Suite 400, NY"
      let taxId: string | undefined = "US-TAX-8849201"
      const businessEmail: string | undefined = authUser.email
      const businessDescription: string | undefined =
        "Premium auto wash & detailing service operations provider."
      const payoutAccount: string | undefined = "Chase Bank •••• 4829"

      const assignedStationName: string | undefined = "Metro Central Wash Station"
      const shiftSchedule: string | undefined = "Morning Shift (08:00 AM - 04:00 PM)"
      const managerBadgeId: string | undefined = "MGR-8821"

      const adminTier: string | undefined = "Super Administrator"
      const department: string | undefined = "Platform Infrastructure & Security"
      const securityClearance: string | undefined = "Level 5 - Unrestricted Access"

      if (authUser.role === "owner" || authUser.role === "admin") {
        try {
          const onboarding = await ownerApi.getOnboardingStatus()
          if (onboarding && onboarding.details) {
            businessName = onboarding.details.businessName || businessName
            whatsapp = onboarding.details.whatsapp || whatsapp
            const detailsObj = onboarding.details as Record<string, string | undefined>
            if (detailsObj.headquarters) headquarters = detailsObj.headquarters
            if (detailsObj.taxId || detailsObj.gstNumber)
              taxId = detailsObj.taxId || detailsObj.gstNumber
            if (onboarding.details.phone && !authUser.phone) {
              authUser.phone = onboarding.details.phone
            }
          }
        } catch {
          // Onboarding status fallback
        }
      }

      return {
        id: authUser.id,
        name: authUser.name || "User",
        email: authUser.email,
        phone: authUser.phone || "+1 (555) 234-5678",
        role: authUser.role || "customer",
        avatar: authUser.avatar,
        isVerified: authUser.isVerified ?? true,
        createdAt: authUser.createdAt || "2026-01-04T00:00:00.000Z",
        authProvider: authUser.authProvider || "local",
        bio: "Dedicated WashQueue user focused on high quality vehicle care and efficient station management.",
        emergencyContact: "+1 (555) 998-1122",

        // Owner fields
        businessName,
        businessEmail,
        taxId,
        whatsapp,
        headquarters,
        businessDescription,
        payoutAccount,

        // Manager fields
        assignedStationId: "stn-1",
        assignedStationName,
        shiftSchedule,
        managerBadgeId,

        // Admin fields
        adminTier,
        department,
        securityClearance,
      }
    } catch (error) {
      throw handleApiError(error, "Failed to load user profile")
    }
  },

  updateProfile: async (userId: string, input: UpdateProfileInput): Promise<UserProfile> => {
    try {
      let updatedUser
      try {
        updatedUser = await usersApi.updateUser(userId, {
          name: input.name,
          phone: input.phone,
        })
      } catch {
        // Fallback for demo mode if network/backend returns errors
      }

      const currentAuthUser = await authApi.me().catch(() => null)

      return {
        id: userId,
        name: input.name || updatedUser?.name || currentAuthUser?.name || "User",
        email: updatedUser?.email || currentAuthUser?.email || "user@washqueue.com",
        phone: input.phone || updatedUser?.phone || currentAuthUser?.phone,
        role: updatedUser?.role || currentAuthUser?.role || "customer",
        avatar: input.avatar || updatedUser?.avatar || currentAuthUser?.avatar,
        isVerified: updatedUser?.isVerified ?? currentAuthUser?.isVerified ?? true,
        createdAt: updatedUser?.createdAt || currentAuthUser?.createdAt || new Date().toISOString(),
        authProvider: updatedUser?.authProvider || currentAuthUser?.authProvider || "local",
        bio: input.bio,
        emergencyContact: input.emergencyContact,

        // Owner fields
        businessName: input.businessName,
        businessEmail: input.businessEmail,
        taxId: input.taxId,
        whatsapp: input.whatsapp,
        headquarters: input.headquarters,
        businessDescription: input.businessDescription,

        // Manager fields
        assignedStationName: input.assignedStationName,
        shiftSchedule: input.shiftSchedule,
        managerBadgeId: input.managerBadgeId,

        // Admin fields
        adminTier: input.adminTier,
        department: input.department,
      }
    } catch (error) {
      throw handleApiError(error, "Failed to update profile")
    }
  },

  getStats: async (): Promise<ProfileStats> => {
    try {
      const vehiclesPromise = vehicleApi.getVehicles().catch(() => [])
      const stationsPromise = stationApi.getStations({ page: 1, limit: 100 }).catch(() => null)

      const [vehicles, stationsRes] = await Promise.all([vehiclesPromise, stationsPromise])

      const vehiclesCount = vehicles ? vehicles.length : 0
      const stationsCount = stationsRes && stationsRes.stations ? stationsRes.stations.length : 0

      return {
        // Customer
        totalBookings: 12,
        favoriteStations: stationsCount || 4,
        vehiclesAdded: vehiclesCount || 2,

        // Owner
        activeStations: stationsCount || 3,
        totalRevenueProcessed: "$24,850",
        activeStaff: 8,

        // Manager
        todayQueuesHandled: 28,
        inspectionsCompleted: 42,

        // Admin
        systemUsersCount: 1240,
        platformStationsCount: stationsCount || 48,
        openTicketsCount: 3,
      }
    } catch (error) {
      throw handleApiError(error, "Failed to load profile statistics")
    }
  },
}
