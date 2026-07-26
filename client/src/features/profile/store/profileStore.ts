import { create } from "zustand"
import { toast } from "sonner"
import type { UserProfile, UpdateProfileInput, ProfileStats } from "../types"
import { profileApi } from "../services/profile.api"
import { getErrorMessage } from "@/shared/utils/error"
import { useAuthStore } from "@/features/auth/store/authStore"

interface ProfileStore {
  profile: UserProfile | null
  stats: ProfileStats
  isLoading: boolean
  isUpdating: boolean
  isEditModalOpen: boolean
  isChangePasswordModalOpen: boolean

  setEditModalOpen: (open: boolean) => void
  setChangePasswordModalOpen: (open: boolean) => void
  loadProfile: () => Promise<void>
  updateProfile: (input: UpdateProfileInput) => Promise<boolean>
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  stats: {
    totalBookings: 0,
    favoriteStations: 0,
    vehiclesAdded: 0,
  },
  isLoading: false,
  isUpdating: false,
  isEditModalOpen: false,
  isChangePasswordModalOpen: false,

  setEditModalOpen: (open) => set({ isEditModalOpen: open }),
  setChangePasswordModalOpen: (open) => set({ isChangePasswordModalOpen: open }),

  loadProfile: async () => {
    set({ isLoading: true })
    try {
      const [fetchedProfile, fetchedStats] = await Promise.all([
        profileApi.getProfile(),
        profileApi.getStats(),
      ])

      set({
        profile: fetchedProfile,
        stats: fetchedStats,
      })
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load profile details"))
    } finally {
      set({ isLoading: false })
    }
  },

  updateProfile: async (input) => {
    const current = get().profile
    if (!current) return false

    set({ isUpdating: true })
    try {
      // Send real API request to server
      const updated = await profileApi.updateProfile(current.id, input)

      // Merge updated fields into store state
      set({
        profile: {
          ...current,
          ...updated,
          ...input,
        },
      })

      // Sync updated user info with global authStore & localStorage
      const authUser = useAuthStore.getState().user
      if (authUser) {
        const newAuthUser = {
          ...authUser,
          name: updated.name || input.name || authUser.name,
          phone: updated.phone || input.phone || authUser.phone,
        }
        useAuthStore.setState({ user: newAuthUser })
        localStorage.setItem("wq_user", JSON.stringify(newAuthUser))
      }

      toast.success("Profile updated successfully")
      set({ isEditModalOpen: false })
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile"))
      return false
    } finally {
      set({ isUpdating: false })
    }
  },
}))
