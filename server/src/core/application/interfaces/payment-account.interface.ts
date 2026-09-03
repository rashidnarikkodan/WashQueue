export interface RegisteredAddress {
  street1: string
  street2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface PaymentAccountProfile {
  category?: string
  subcategory?: string
  addresses?: {
    registered?: RegisteredAddress
    operation?: RegisteredAddress
  }
}

export interface PaymentAccountLegalInfo {
  pan?: string
  gst?: string
}

export interface BankAccountDetails {
  account_number: string
  ifsc_code: string
  beneficiary_name: string
}

export interface CreatePaymentAccountParams {
  email: string
  phone: string
  legal_business_name: string
  business_type?: string
  contact_name: string
  reference_id?: string
  customer_facing_business_name?: string
  type?: string
  profile?: PaymentAccountProfile
  legal_info?: PaymentAccountLegalInfo
  notes?: Record<string, string | number>
  bankAccount: BankAccountDetails
  pan?: string
}

export interface IPaymentAccountService {
  createAccount(params: CreatePaymentAccountParams): Promise<string>
}
