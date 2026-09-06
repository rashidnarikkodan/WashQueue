import { create } from "zustand"
import { toast } from "sonner"
import { useAuthStore } from "../../auth/store/auth.store"
import { getErrorMessage } from "../../../shared/utils/error"
import { ownerApi, type OnboardingDetails } from "@/shared/apis/owner.api"

interface OwnerStore {
  isLoading: boolean
  isFetchingStatus: boolean
  onboardingStep: number
  onboardingDetails: OnboardingDetails
  isSubmitted: boolean

  fetchOnboardingStatus: () => Promise<void>

  saveStepAndContinue: (
    currentStep: number,
    formData: FormData,
    nextStep: number,
    setStep: (s: number) => void
  ) => Promise<void>

  submitOnboarding: () => Promise<boolean>
}

export const useOwnerStore = create<OwnerStore>((set) => ({
  isLoading: false,
  isFetchingStatus: true,
  onboardingStep: 1,
  onboardingDetails: {},
  isSubmitted: false,

  fetchOnboardingStatus: async () => {
    set({ isFetchingStatus: true })
    try {
      const status = await ownerApi.getOnboardingStatus()
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          onboardingStep: status.step,
          onboardingDetails: status.details,
        }
        useAuthStore.setState({ user: updatedUser })
        localStorage.setItem("wq_user", JSON.stringify(updatedUser))
      }
      set({
        onboardingStep: status.step,
        onboardingDetails: status.details,
        isSubmitted: status.isSubmitted,
        isFetchingStatus: false,
      })
    } catch {
      set({ isFetchingStatus: false })
    }
  },

  saveStepAndContinue: async (currentStep, formData, nextStep, setStep) => {
    set({ isLoading: true })
    try {
      const result = await ownerApi.saveOnboardingStep(currentStep, formData)
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          onboardingStep: nextStep,
          onboardingDetails: result.details,
        }
        useAuthStore.setState({ user: updatedUser })
        localStorage.setItem("wq_user", JSON.stringify(updatedUser))
      }
      set({
        onboardingStep: nextStep,
        onboardingDetails: result.details,
        isLoading: false,
      })
      setStep(nextStep)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save progress. Please try again."))
      set({ isLoading: false })
    }
  },

  submitOnboarding: async () => {
    set({ isLoading: true })
    try {
      const result = await ownerApi.submitOnboarding()
      toast.success(result.message || "Application submitted successfully!")
      await useAuthStore.getState().refreshUser()
      set({ isLoading: false, isSubmitted: true })
      return true
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to submit application."))
      set({ isLoading: false })
      return false
    }
  },
}))
