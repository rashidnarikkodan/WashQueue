import { describe, expect, it, vi } from "vitest"
import { Owner } from "@/modules/owner/domain/entities/Owner"
import type { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import type { IPayoutProvider } from "@/core/application/interfaces/payout-provider.interface"
import { Payout, PayoutStatus } from "../domain/entities/Payout"
import { Settlement, SettlementStatus } from "../domain/entities/Settlement"
import type { IPayoutRepository } from "../domain/repositories/payout.repository.interface"
import type { ISettlementRepository } from "../domain/repositories/settlement.repository.interface"
import { ProcessSettlementUseCase } from "../application/use-cases/process-settlement.use-case"

describe("ProcessSettlementUseCase", () => {
  it("marks the settlement processed when the mock payout provider succeeds", async () => {
    const pendingSettlement = new Settlement({
      id: "settlement-1",
      bookingId: "booking-1",
      ownerId: "owner-1",
      totalAmount: 1000,
      platformCommission: 100,
      stationSettlementAmount: 900,
      currency: "INR",
      status: SettlementStatus.PENDING,
      createdAt: new Date(),
    })
    const owner = new Owner({
      id: "owner-1",
      userId: "user-1",
      razorpayFundAccountId: "mock-fund-account",
    })

    const settlementRepository = {
      findById: vi.fn().mockResolvedValue(pendingSettlement),
      updateStatusWithGuard: vi.fn().mockResolvedValue(
        new Settlement({
          ...pendingSettlement.getProps(),
          status: SettlementStatus.PROCESSING,
        })
      ),
      save: vi.fn(async (settlement: Settlement) => settlement),
    } as unknown as ISettlementRepository

    const payoutRepository = {
      findBySettlementId: vi.fn().mockResolvedValue(null),
      save: vi.fn(async (payout: Payout) => new Payout({ ...payout.getProps(), id: "payout-1" })),
    } as unknown as IPayoutRepository

    const ownerRepository = {
      findById: vi.fn().mockResolvedValue(owner),
      save: vi.fn(async (savedOwner: Owner) => savedOwner),
    } as unknown as IOwnerRepository

    const payoutProvider: IPayoutProvider = {
      ensurePayoutDestination: vi.fn(),
      createPayout: vi.fn().mockResolvedValue({
        providerPayoutId: "mock-provider-payout-1",
        status: PayoutStatus.PROCESSED,
      }),
      getPayout: vi.fn(),
      mapWebhookEventToStatus: vi.fn(),
    }

    const useCase = new ProcessSettlementUseCase(
      settlementRepository,
      payoutRepository,
      ownerRepository,
      payoutProvider
    )

    const result = await useCase.execute("settlement-1")

    expect(payoutProvider.createPayout).toHaveBeenCalledWith(
      expect.objectContaining({
        fundAccountId: "mock-fund-account",
        amountInPaise: 90_000,
        currency: "INR",
      })
    )
    expect(result.status).toBe(SettlementStatus.PROCESSED)
    expect(result.payoutId).toBe("payout-1")
    expect(result.processedAt).toBeDefined()
    expect(settlementRepository.save).toHaveBeenCalledWith(result)
  })
})
