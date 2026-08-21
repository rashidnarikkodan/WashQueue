import { api } from "../config/axios"

export interface OnboardingDetails {
  fullName?: string
  phone?: string
  whatsapp?: string
  businessName?: string
  gstNumber?: string
  idProofType?: string
  idProofUrl?: string
  businessLicenseUrl?: string
  gstCertificateUrl?: string
  accountHolderName?: string
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  bankProofUrl?: string
  rejectionReason?: string
}

export interface OnboardingStatus {
  step: number
  details: OnboardingDetails
  isSubmitted: boolean
}

export const ownerApi = {
  getOnboardingStatus: async (): Promise<OnboardingStatus> => {
    const response = await api.get("/owner/onboarding/status", {
      skipToast: true,
    })
    return response.data.data
  },

  saveOnboardingStep: async (step: number, formData: FormData): Promise<OnboardingStatus> => {
    formData.append("step", String(step))
    const response = await api.post("/owner/onboarding/step", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      skipToast: true,
    })
    return response.data.data
  },

  submitOnboarding: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/owner/onboarding/submit", {}, { skipToast: true })
    return response.data.data
  },
}
