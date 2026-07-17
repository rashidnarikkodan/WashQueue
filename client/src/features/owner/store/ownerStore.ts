import { create } from "zustand";
import { toast } from "sonner";
import { ownerApi, type OnboardingDetails } from "../services/owner.api";
import { useAuthStore } from "../../auth/store/authStore";
import { getErrorMessage } from "../../../shared/utils/error";

interface OwnerStore {
  isLoading: boolean;
  isFetchingStatus: boolean;
  onboardingStep: number;
  onboardingDetails: OnboardingDetails;
  isSubmitted: boolean;

  /** Load draft from server on page mount */
  fetchOnboardingStatus: () => Promise<void>;

  /** Save current step data and advance to next step */
  saveStepAndContinue: (
    currentStep: number,
    formData: FormData,
    nextStep: number,
    setStep: (s: number) => void
  ) => Promise<void>;

  /** Final submit of the completed onboarding application */
  submitOnboarding: () => Promise<boolean>;
}

export const useOwnerStore = create<OwnerStore>((set) => ({
  isLoading: false,
  isFetchingStatus: false,
  onboardingStep: 1,
  onboardingDetails: {},
  isSubmitted: false,

  fetchOnboardingStatus: async () => {
    set({ isFetchingStatus: true });
    try {
      const status = await ownerApi.getOnboardingStatus();
      set({
        onboardingStep: status.step,
        onboardingDetails: status.details,
        isSubmitted: status.isSubmitted,
        isFetchingStatus: false,
      });
      // Sync authStore user profile to update onboardingStep & prevent redirect loops
      await useAuthStore.getState().refreshUser();
    } catch {
      // Silently fail — user may simply not have started onboarding yet
      set({ isFetchingStatus: false });
    }
  },

  saveStepAndContinue: async (currentStep, formData, nextStep, setStep) => {
    set({ isLoading: true });
    try {
      const result = await ownerApi.saveOnboardingStep(currentStep, formData);
      set({
        onboardingStep: nextStep,
        onboardingDetails: result.details,
        isLoading: false,
      });
      await useAuthStore.getState().refreshUser();
      setStep(nextStep);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save progress. Please try again."));
      set({ isLoading: false });
    }
  },

  submitOnboarding: async () => {
    set({ isLoading: true });
    try {
      const result = await ownerApi.submitOnboarding();
      toast.success(result.message || "Application submitted successfully!");
      await useAuthStore.getState().refreshUser();
      set({ isLoading: false, isSubmitted: true });
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to submit application."));
      set({ isLoading: false });
      return false;
    }
  },
}));
