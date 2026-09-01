export interface ApproveOwnerInput {
  ownerIdOrUserId: string
  isApproved: boolean
  rejectionReason?: string
}

export interface ApproveOwnerResult {
  id?: string
  userId: string
  isVerified: boolean
  onboardingStep: number
  rejectionReason?: string
  verifiedAt?: Date
}
