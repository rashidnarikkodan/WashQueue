import { api } from "../config/axios"
import { API_ROUTES } from "../constants/api.const"

export interface OnboardingDetails {
  fullName?: string
  phone?: string
  whatsapp?: string
  businessName?: string
  gstNumber?: string
  street1?: string
  street2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
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
    const response = await api.get(API_ROUTES.OWNER.ONBOARDING_STATUS, {
      skipToast: true,
    })
    return response.data.data
  },

  saveOnboardingStep: async (step: number, formData: FormData): Promise<OnboardingStatus> => {
    formData.append("step", String(step))
    const response = await api.post(API_ROUTES.OWNER.ONBOARDING_STEP, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      skipToast: true,
    })
    return response.data.data
  },

  submitOnboarding: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(API_ROUTES.OWNER.ONBOARDING_SUBMIT, {}, { skipToast: true })
    return response.data.data
  },

  approveOwner: async (
    id: string,
    isApproved: boolean,
    rejectionReason?: string
  ): Promise<{ success: boolean; data: unknown }> => {
    const response = await api.patch(
      API_ROUTES.OWNER.APPROVAL(id),
      { isApproved, rejectionReason },
      { skipToast: true }
    )
    return response.data
  },
}
