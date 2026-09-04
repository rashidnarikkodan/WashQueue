import { IPayoutRepository } from "../../domain/repositories/payout.repository"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { IPayoutProvider } from "@/core/application/interfaces/payout-provider.interface"
import { applyPayoutOutcome } from "../services/apply-payout-outcome"
import WebhookEventModel from "../../infrastructure/models/webhook-event.model"
import logger from "@/configs/logger.config"

export interface PayoutWebhookResult {
  success: boolean
  message?: string
}

export interface IHandlePayoutWebhookUseCase {
  execute(rawBody: string, signature: string): Promise<PayoutWebhookResult>
}

const PROVIDER = "RAZORPAY_X"

interface RazorpayXPayoutWebhookPayload {
  id?: string
  event: string
  created_at?: number
  payload?: {
    payout?: {
      entity?: {
        id?: string
        status?: string
        utr?: string
        failure_reason?: string
      }
    }
  }
}

export class HandlePayoutWebhookUseCase implements IHandlePayoutWebhookUseCase {
  constructor(
    private readonly payoutRepository: IPayoutRepository,
    private readonly settlementRepository: ISettlementRepository,
    private readonly payoutProvider: IPayoutProvider,
    private readonly verifySignature: (rawBody: string, signature: string) => boolean
  ) {}

  async execute(rawBody: string, signature: string): Promise<PayoutWebhookResult> {
    if (!signature || !this.verifySignature(rawBody, signature)) {
      logger.error("RazorpayX payout webhook signature verification failed")
      return { success: false, message: "Invalid webhook signature" }
    }

    let event: RazorpayXPayoutWebhookPayload
    try {
      event = JSON.parse(rawBody)
    } catch {
      return { success: false, message: "Malformed webhook payload" }
    }

    const payoutEntity = event.payload?.payout?.entity
    const razorpayPayoutId = payoutEntity?.id
    if (!event.event || !razorpayPayoutId) {
      return { success: false, message: "Webhook payload missing required payout fields" }
    }

    // Razorpay's payload does not always guarantee an "id" field for the event envelope itself;
    // fall back to a deterministic composite key so retried/duplicate deliveries still dedupe.
    const eventId = event.id || `${razorpayPayoutId}:${event.event}:${event.created_at ?? ""}`

    const isNewEvent = await this.recordEventOnce(eventId, event.event)
    if (!isNewEvent) {
      logger.info({ eventId, eventType: event.event }, "webhook ignored as duplicate")
      return { success: true, message: "Duplicate event ignored" }
    }

    logger.info({ eventId, eventType: event.event, razorpayPayoutId }, "webhook received")

    const status = this.payoutProvider.mapWebhookEventToStatus(event.event)
    if (!status) {
      logger.info({ eventType: event.event }, "webhook ignored: unrecognized event type")
      return { success: true, message: "Event type ignored" }
    }

    const payout = await this.payoutRepository.findByRazorpayPayoutId(razorpayPayoutId)
    if (!payout) {
      logger.warn(
        { razorpayPayoutId },
        "webhook ignored: no local payout found for provider payout id"
      )
      return { success: true, message: "Unknown payout ignored" }
    }

    const settlement = await this.settlementRepository.findById(payout.settlementId)
    if (!settlement) {
      logger.error(
        { payoutId: payout.id, settlementId: payout.settlementId },
        "Payout webhook references a settlement that no longer exists"
      )
      return { success: true, message: "Settlement not found" }
    }

    applyPayoutOutcome(payout, settlement, {
      status,
      failureReason: payoutEntity?.failure_reason,
    })

    await this.payoutRepository.save(payout)
    await this.settlementRepository.save(settlement)

    logger.info(
      {
        payoutId: payout.id,
        settlementId: settlement.id,
        status: payout.status,
        provider: PROVIDER,
      },
      `payout ${payout.status.toLowerCase()}`
    )

    return { success: true }
  }

  /** Returns true if this is the first time this event id has been seen. */
  private async recordEventOnce(eventId: string, eventType: string): Promise<boolean> {
    try {
      await WebhookEventModel.create({ provider: PROVIDER, eventId, eventType })
      return true
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string }
      if (err?.code === 11000 || err?.message?.includes("E11000")) {
        return false
      }
      throw error
    }
  }
}
