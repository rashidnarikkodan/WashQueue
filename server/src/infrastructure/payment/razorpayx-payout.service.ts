import axios, { AxiosInstance, isAxiosError } from "axios"
import crypto from "crypto"
import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { PayoutStatus } from "@/modules/booking/domain/entities/Payout"
import {
  CreatePayoutParams,
  EnsurePayoutDestinationResult,
  IPayoutProvider,
  OwnerPayoutProfile,
  PayoutProviderResult,
} from "@/core/application/interfaces/payout-provider.interface"

export class PayoutProviderError extends Error {
  constructor(
    message: string,
    public readonly retryable: boolean
  ) {
    super(message)
  }
}

function mapRazorpayStatusWord(status: string): PayoutStatus {
  switch (status) {
    case "queued":
      return PayoutStatus.QUEUED
    case "pending":
    case "processing":
      return PayoutStatus.PROCESSING
    case "processed":
      return PayoutStatus.PROCESSED
    case "reversed":
      return PayoutStatus.REVERSED
    case "rejected":
    case "cancelled":
    case "failed":
      return PayoutStatus.FAILED
    default:
      return PayoutStatus.PROCESSING
  }
}

export class RazorpayXPayoutProvider implements IPayoutProvider {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: "https://api.razorpay.com/v1",
      auth: {
        username: env.RAZORPAY_KEY_ID,
        password: env.RAZORPAY_KEY_SECRET,
      },
      timeout: 15000,
    })
  }

  async ensurePayoutDestination(owner: OwnerPayoutProfile): Promise<EnsurePayoutDestinationResult> {
    if (owner.razorpayContactId && owner.razorpayFundAccountId) {
      return { contactId: owner.razorpayContactId, fundAccountId: owner.razorpayFundAccountId }
    }

    let contactId = owner.razorpayContactId
    if (!contactId) {
      if (!owner.businessEmail || !owner.phone) {
        throw new AppError(
          "Owner email and phone are required to create a RazorpayX contact",
          HTTP_STATUS.BAD_REQUEST
        )
      }

      const name = owner.legalFullName?.trim() || owner.businessName?.trim() || "Owner"

      try {
        const response = await this.client.post("/contacts", {
          name,
          email: owner.businessEmail,
          contact: owner.phone,
          type: "vendor",
          reference_id: owner.id,
        })
        contactId = response.data.id
        logger.info({ ownerId: owner.id, contactId }, "RazorpayX contact created")
      } catch (error) {
        throw this.toProviderError(error, "Failed to create RazorpayX contact")
      }
    }

    let fundAccountId = owner.razorpayFundAccountId
    if (!fundAccountId) {
      if (!owner.accountNumber || !owner.ifscCode) {
        throw new AppError(
          "Owner bank account details are required to create a RazorpayX fund account",
          HTTP_STATUS.BAD_REQUEST
        )
      }

      try {
        const response = await this.client.post("/fund_accounts", {
          contact_id: contactId,
          account_type: "bank_account",
          bank_account: {
            name: owner.accountHolderName?.trim() || owner.legalFullName?.trim() || "Owner",
            ifsc: owner.ifscCode,
            account_number: owner.accountNumber,
          },
        })
        fundAccountId = response.data.id
        logger.info({ ownerId: owner.id, fundAccountId }, "RazorpayX fund account created")
      } catch (error) {
        throw this.toProviderError(error, "Failed to create RazorpayX fund account")
      }
    }

    return { contactId: contactId as string, fundAccountId: fundAccountId as string }
  }

  async createPayout(params: CreatePayoutParams): Promise<PayoutProviderResult> {
    try {
      const response = await this.client.post(
        "/payouts",
        {
          account_number: env.RAZORPAYX_ACCOUNT_NUMBER,
          fund_account_id: params.fundAccountId,
          amount: params.amountInPaise,
          currency: params.currency ?? "INR",
          mode: "IMPS",
          purpose: "payout",
          queue_if_low_balance: true,
          reference_id: params.referenceId,
          narration: params.narration ?? "WashQueue owner settlement",
        },
        {
          headers: { "X-Payout-Idempotency": params.referenceId },
        }
      )

      logger.info(
        {
          referenceId: params.referenceId,
          providerPayoutId: response.data.id,
          status: response.data.status,
        },
        "RazorpayX payout created"
      )

      return {
        providerPayoutId: response.data.id,
        status: mapRazorpayStatusWord(response.data.status),
        utr: response.data.utr || undefined,
      }
    } catch (error) {
      throw this.toProviderError(error, "Failed to create RazorpayX payout")
    }
  }

  async getPayout(providerPayoutId: string): Promise<PayoutProviderResult> {
    try {
      const response = await this.client.get(`/payouts/${providerPayoutId}`)
      return {
        providerPayoutId: response.data.id,
        status: mapRazorpayStatusWord(response.data.status),
        utr: response.data.utr || undefined,
        failureReason: response.data.failure_reason || undefined,
      }
    } catch (error) {
      throw this.toProviderError(error, "Failed to fetch RazorpayX payout status")
    }
  }

  mapWebhookEventToStatus(eventType: string): PayoutStatus | null {
    if (!eventType.startsWith("payout.")) {
      return null
    }
    const statusWord = eventType.slice("payout.".length)
    return mapRazorpayStatusWord(statusWord)
  }

  private toProviderError(error: unknown, fallbackMessage: string): PayoutProviderError {
    if (isAxiosError(error)) {
      const statusCode = error.response?.status
      const description =
        (error.response?.data as { error?: { description?: string } })?.error?.description ||
        error.message

      logger.error(
        { statusCode, code: error.code, description },
        `RazorpayX API error: ${fallbackMessage}`
      )

      // Timeouts and 5xx are transient/provider-side; 4xx indicates a permanently invalid request
      // (bad fund account, validation failure) and must never be blindly retried.
      const retryable = !statusCode || statusCode >= 500 || error.code === "ECONNABORTED"
      return new PayoutProviderError(description, retryable)
    }

    const message = error instanceof Error ? error.message : fallbackMessage
    logger.error({ err: error }, `RazorpayX error: ${fallbackMessage}`)
    return new PayoutProviderError(message, false)
  }
}

export function verifyRazorpayXWebhookSignature(rawBody: string, signature: string): boolean {
  if (!signature) return false

  try {
    const expected = crypto
      .createHmac("sha256", env.RAZORPAYX_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex")

    const expectedBuf = Buffer.from(expected, "utf-8")
    const actualBuf = Buffer.from(signature, "utf-8")
    return expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf)
  } catch (error) {
    logger.error({ err: error }, "RazorpayX webhook signature verification error")
    return false
  }
}

export const razorpayXPayoutProvider = new RazorpayXPayoutProvider()
