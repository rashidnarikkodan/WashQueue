import axios, { AxiosInstance, isAxiosError } from "axios"
import crypto from "crypto"
import env from "@/configs/env.config"
import logger from "@/configs/logger.config"
import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { PayoutStatus } from "@/modules/settlement/domain/entities/Payout"
import {
  CreatePayoutParams,
  EnsurePayoutDestinationResult,
  IPayoutProvider,
  OwnerPayoutProfile,
  PayoutProviderError,
  PayoutProviderResult,
} from "@/core/application/interfaces/payout-provider.interface"

function sanitizeNarration(narration: string): string {
  const cleaned = narration.replace(/[^a-zA-Z0-9 ]/g, "").trim()
  return (cleaned || "Settlement payout").slice(0, 30)
}

function sanitizeReferenceId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_ -]/g, "").slice(0, 40)
}

function sanitizeIdempotencyKey(value: string): string {
  return value.replace(/[^a-zA-Z0-9_ -]/g, "").slice(0, 36)
}

function sanitizeBeneficiaryName(name: string, maxLength: number): string {
  const cleaned = name
    .replace(/[^a-zA-Z0-9 '\-_/().]/g, "")
    .trim()
    .replace(/[^a-zA-Z0-9.]+$/, "")
    .slice(0, maxLength)
  return cleaned.length >= 3 ? cleaned : "Owner"
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

      const name = sanitizeBeneficiaryName(
        owner.legalFullName?.trim() || owner.businessName?.trim() || "Owner",
        50
      )

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
            name: sanitizeBeneficiaryName(
              owner.accountHolderName?.trim() || owner.legalFullName?.trim() || "Owner",
              120
            ),
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
    const referenceId = sanitizeReferenceId(params.referenceId)
    const idempotencyKey = sanitizeIdempotencyKey(params.referenceId)
    const narration = sanitizeNarration(params.narration ?? "WashQueue owner settlement")

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
          reference_id: referenceId,
          narration,
        },
        {
          headers: { "X-Payout-Idempotency": idempotencyKey },
        }
      )

      logger.info(
        {
          referenceId,
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
      if (axios.isAxiosError(error)) {
        logger.error(
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            method: error.config?.method,
            headers: error.response?.headers,
          },
          "RazorpayX raw API error"
        )
      }

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
