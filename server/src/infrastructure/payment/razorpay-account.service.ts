import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import Razorpay from "razorpay"
import {
  CreatePaymentAccountParams,
  IPaymentAccountService,
} from "@/core/application/interfaces/payment-account.interface"

export class PaymentAccountService implements IPaymentAccountService {
  private readonly razorpay: Razorpay

  constructor() {
    this.razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  }

  async createAccount(params: CreatePaymentAccountParams): Promise<string> {
    const email = params.email?.trim().toLowerCase()
    if (!email) {
      throw new AppError("Email is required to create payment account", HTTP_STATUS.BAD_REQUEST)
    }

    const rawPhone = String(params.phone || "").replace(/\D/g, "")
    if (!rawPhone) {
      throw new AppError(
        "Phone number is required to create payment account",
        HTTP_STATUS.BAD_REQUEST
      )
    }
    const phone = rawPhone.length >= 10 ? rawPhone.slice(-10) : rawPhone

    const legalBusinessName = params.legal_business_name?.trim()
    if (!legalBusinessName) {
      throw new AppError(
        "Legal business name is required to create payment account",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const contactName = params.contact_name?.trim()
    if (!contactName) {
      throw new AppError(
        "Contact name is required to create payment account",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    // Build structured Route linked account payload strictly from provided data
    const requestBody: Record<string, any> = {
      email,
      phone,
      type: "route",
      legal_business_name: legalBusinessName,
      business_type: params.business_type || "individual",
      contact_name: contactName,
    }

    if (params.customer_facing_business_name?.trim()) {
      requestBody.customer_facing_business_name = params.customer_facing_business_name.trim()
    }

    if (params.reference_id?.trim()) {
      requestBody.reference_id = params.reference_id.trim()
    }

    if (params.profile) {
      requestBody.profile = params.profile
    }

    if (params.legal_info && (params.legal_info.gst || params.legal_info.pan)) {
      requestBody.legal_info = {
        ...(params.legal_info.gst ? { gst: params.legal_info.gst } : {}),
        ...(params.legal_info.pan ? { pan: params.legal_info.pan } : {}),
      }
    }

    if (params.notes && Object.keys(params.notes).length > 0) {
      requestBody.notes = params.notes
    }

    const bankAccount = params.bankAccount
    if (!bankAccount?.account_number || !bankAccount?.ifsc_code || !bankAccount?.beneficiary_name) {
      throw new AppError(
        "Bank account details are required to create payment account",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    let accountId: string
    try {
      const account = (await this.razorpay.accounts.create(requestBody as any)) as { id: string }

      if (!account || !account.id) {
        throw new Error("Razorpay did not return a valid account ID")
      }

      accountId = account.id
      logger.info(`Razorpay Route account created successfully: ${accountId}`)
    } catch (error: any) {
      const errorMsg =
        error?.error?.description || error?.message || "Failed to create Razorpay account"

      logger.error(
        `Razorpay account creation error: ${errorMsg} (code: ${error?.error?.code || "UNKNOWN"})`
      )

      throw new AppError(
        `Failed to create Razorpay payment account: ${errorMsg}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    try {
      // The SDK's type declares `kyc` as mandatory, but Razorpay's actual API accepts a
      // stakeholder without PAN (KYC can be completed later) — cast to bypass that mismatch.
      await this.razorpay.stakeholders.create(accountId, {
        name: contactName,
        email,
        phone: { primary: phone },
        ...(params.pan ? { kyc: { pan: params.pan } } : {}),
        ...(params.profile?.addresses?.registered
          ? {
              addresses: {
                residential: {
                  street: [
                    params.profile.addresses.registered.street1,
                    params.profile.addresses.registered.street2,
                  ]
                    .filter(Boolean)
                    .join(", "),
                  city: params.profile.addresses.registered.city,
                  state: params.profile.addresses.registered.state,
                  postal_code: params.profile.addresses.registered.postal_code,
                  country: params.profile.addresses.registered.country,
                },
              },
            }
          : {}),
      } as unknown as Parameters<Razorpay["stakeholders"]["create"]>[1])

      const product = await this.razorpay.products.requestProductConfiguration(accountId, {
        product_name: "route",
        tnc_accepted: true,
      })

      if (!product?.id) {
        throw new Error("Razorpay did not return a valid product configuration ID")
      }

      await this.razorpay.products.edit(accountId, product.id, {
        settlements: {
          account_number: bankAccount.account_number,
          ifsc_code: bankAccount.ifsc_code,
          beneficiary_name: bankAccount.beneficiary_name,
        },
        tnc_accepted: true,
      })

      logger.info(`Razorpay Route account ${accountId} configured for settlements`)
    } catch (error: any) {
      const errorMsg =
        error?.error?.description || error?.message || "Failed to configure Razorpay payout account"

      logger.error(
        `Razorpay Route configuration error for account ${accountId}: ${errorMsg} (code: ${error?.error?.code || "UNKNOWN"})`
      )

      throw new AppError(
        `Failed to configure Razorpay payout account: ${errorMsg}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    return accountId
  }
}

export const paymentAccountService = new PaymentAccountService()
