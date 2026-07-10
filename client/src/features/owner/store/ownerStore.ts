import { create } from "zustand";
import { toast } from "sonner";
import { ownerApi } from "../services/owner.api";

interface OwnerStore {
  isLoading: boolean;
  submitOnboarding: (formData: FormData) => Promise<boolean>;
}

export const useOwnerStore = create<OwnerStore>((set) => ({
  isLoading: false,

  submitOnboarding: async (formData) => {
    set({ isLoading: true });
    try {
      const response = await ownerApi.submitOnboarding(formData);
      toast.success(response.message || "Onboarding credentials submitted successfully!");
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to submit onboarding details");
      set({ isLoading: false });
      return false;
    }
  },
}));
