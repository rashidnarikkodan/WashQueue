import { api } from "../../../shared/config/axios";

export const ownerApi = {
  /**
   * Submit onboarding details to the server (multipart form data)
   */
  submitOnboarding: async (formData: FormData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post("/owner/onboarding", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        skipToast: true,
      });
      return response.data;
    } catch (error: any) {
      console.error("Owner Onboarding API failed:", error);
      const message = error.response?.data?.message || error.message || "Failed to submit onboarding details";
      throw new Error(message);
    }
  },
};
