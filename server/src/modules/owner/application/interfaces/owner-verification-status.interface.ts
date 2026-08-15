export interface OwnerVerificationStatusChangeInput {
  userId: string
  userEmail: string
  userName?: string
  updates: {
    isVerified?: boolean
    onboardingStep?: number
    rejectionReason?: string
    phone?: string
  }
}

export interface IOwnerVerificationStatusService {
  handleVerificationStatusChange(input: OwnerVerificationStatusChangeInput): Promise<void>
}
