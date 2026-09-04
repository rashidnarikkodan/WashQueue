import { PayoutStatus } from "@/modules/booking/domain/entities/Payout"

export interface OwnerPayoutProfile {
  id: string
  legalFullName?: string
  businessName?: string
  accountHolderName?: string
  businessEmail?: string
  phone?: string
  accountNumber?: string
  ifscCode?: string
  razorpayContactId?: string
  razorpayFundAccountId?: string
}

export interface EnsurePayoutDestinationResult {
  contactId: string
  fundAccountId: string
}

export interface CreatePayoutParams {
  fundAccountId: string
  amountInPaise: number
  currency?: string
  referenceId: string
  narration?: string
}

export interface PayoutProviderResult {
  providerPayoutId: string
  status: PayoutStatus
  utr?: string
  failureReason?: string
}

export interface IPayoutProvider {
  ensurePayoutDestination(owner: OwnerPayoutProfile): Promise<EnsurePayoutDestinationResult>

  createPayout(params: CreatePayoutParams): Promise<PayoutProviderResult>

  getPayout(providerPayoutId: string): Promise<PayoutProviderResult>

  mapWebhookEventToStatus(eventType: string): PayoutStatus | null
}
