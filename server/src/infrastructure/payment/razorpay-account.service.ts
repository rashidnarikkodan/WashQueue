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

    try {
      const account = (await this.razorpay.accounts.create(requestBody as any)) as { id: string }

      if (!account || !account.id) {
        throw new Error("Razorpay did not return a valid account ID")
      }

      logger.info(`Razorpay Route account created successfully: ${account.id}`)
      return account.id
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
  }
}

export const paymentAccountService = new PaymentAccountService()
