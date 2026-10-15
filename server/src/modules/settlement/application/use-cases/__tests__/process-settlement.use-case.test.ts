import { describe, it, expect, vi, beforeEach } from "vitest"
import { ProcessSettlementUseCase } from "../process-settlement.use-case"
import { Settlement, SettlementProps, SettlementStatus } from "../../../domain/entities/Settlement"
import { Payout, PayoutStatus } from "../../../domain/entities/Payout"
import { ISettlementRepository } from "../../../domain/repositories/settlement.repository.interface"
import { IPayoutRepository } from "../../../domain/repositories/payout.repository.interface"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { IPayoutProvider } from "@/core/application/interfaces/payout-provider.interface"
import { INotificationDispatcherService } from "@/modules/notification/notification.module"

describe("ProcessSettlementUseCase", () => {
  let mockSettlementRepo: Partial<ISettlementRepository>
  let mockPayoutRepo: Partial<IPayoutRepository>
  let mockOwnerRepo: Partial<IOwnerRepository>
  let mockPayoutProvider: Partial<IPayoutProvider>
  let mockNotificationDispatcher: Partial<INotificationDispatcherService>
  let useCase: ProcessSettlementUseCase

  const sampleSettlementProps: SettlementProps = {
    id: "stl-1",
    bookingId: "b-1",
    stationId: "st-1",
    ownerId: "owner-1",
    totalAmount: 1000,
    platformCommissionRate: 0.1,
    platformCommission: 100,
    stationSettlementAmount: 900,
    currency: "INR",
    status: SettlementStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const sampleOwner = {
    id: "owner-1",
    userId: "user-owner-1",
    razorpayFundAccountId: "fa_123",
  }

  beforeEach(() => {
    mockSettlementRepo = {
      findById: vi.fn().mockImplementation(() => Promise.resolve(new Settlement(sampleSettlementProps))),
      save: vi.fn().mockImplementation((s) => Promise.resolve(s)),
      updateStatusWithGuard: vi.fn().mockImplementation((_id, status) => {
        const updated = new Settlement({
          ...sampleSettlementProps,
          status,
        })
        return Promise.resolve(updated)
      }),
    }

    mockPayoutRepo = {
      findBySettlementId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation((p: Payout) => {
        const saved = new Payout({
          id: p.id || "payout-1",
          settlementId: p.settlementId,
          ownerId: p.ownerId,
          provider: p.provider,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          idempotencyKey: p.idempotencyKey,
          razorpayPayoutId: p.razorpayPayoutId,
          createdAt: new Date(),
        })
        return Promise.resolve(saved)
      }),
    }

    mockOwnerRepo = {
      findById: vi.fn().mockResolvedValue(sampleOwner),
    }

    mockPayoutProvider = {
      createPayout: vi.fn().mockResolvedValue({
        providerPayoutId: "pout_rzp_123",
        status: PayoutStatus.PROCESSED,
      }),
      getPayout: vi.fn(),
    }

    mockNotificationDispatcher = {
      dispatch: vi.fn().mockResolvedValue(null),
    }

    useCase = new ProcessSettlementUseCase(
      mockSettlementRepo as ISettlementRepository,
      mockPayoutRepo as IPayoutRepository,
      mockOwnerRepo as IOwnerRepository,
      mockPayoutProvider as IPayoutProvider,
      undefined,
      mockNotificationDispatcher as INotificationDispatcherService
    )
  })

  it("should dispatch notification to owner only after payout succeeds with PROCESSED status", async () => {
    const result = await useCase.execute("stl-1")

    expect(result.status).toBe(SettlementStatus.PROCESSED)
    expect(mockPayoutProvider.createPayout).toHaveBeenCalledTimes(1)
    expect(mockNotificationDispatcher.dispatch).toHaveBeenCalledTimes(1)
    expect(mockNotificationDispatcher.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: "user-owner-1",
        title: expect.stringContaining("Settlement Payout Processed"),
      })
    )
  })

  it("should NOT dispatch payout processed notification when payout provider fails", async () => {
    mockPayoutProvider.createPayout = vi.fn().mockRejectedValue(new Error("RazorpayX balance insufficient"))

    const result = await useCase.execute("stl-1")

    expect(result.status).toBe(SettlementStatus.FAILED)
    expect(mockNotificationDispatcher.dispatch).not.toHaveBeenCalled()
  })
})
