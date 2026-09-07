import { describe, it, expect, vi, beforeEach } from "vitest"
import { Settlement, SettlementStatus } from "../domain/entities/Settlement"
import { ISettlementRepository } from "../domain/repositories/settlement.repository"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { CreateSettlementUseCase } from "../application/use-cases/create-settlement.use-case"
import { ManageSettlementHoldUseCase } from "../application/use-cases/manage-settlement-hold.use-case"
import { RetrySettlementUseCase } from "../application/use-cases/retry-settlement.use-case"
import { GetOwnerSettlementSummaryUseCase } from "../application/use-cases/get-owner-settlement-summary.use-case"
import { ProcessPendingSettlementsUseCase } from "../application/use-cases/process-pending-settlements.use-case"
import { IProcessSettlementUseCase } from "../application/interfaces/settlement.usecases"
import { ConflictError } from "@/common/errors/conflict-error"

describe("Settlement Module Unit Tests", () => {
  let mockSettlementRepo: ISettlementRepository
  let mockOwnerRepo: IOwnerRepository
  let mockProcessSettlementUseCase: IProcessSettlementUseCase

  beforeEach(() => {
    mockSettlementRepo = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      findByBookingId: vi.fn(),
      findMany: vi.fn(),
      getOwnerAggregatedEarnings: vi.fn(),
      getAdminAggregatedMetrics: vi.fn(),
      updateStatusWithGuard: vi.fn(),
    }

    mockOwnerRepo = {
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      findByUserId: vi.fn(),
      findByEmail: vi.fn(),
      findByPhoneNumber: vi.fn(),
      findByBusinessName: vi.fn(),
      findPendingKycOwners: vi.fn(),
      findOwnersWithFilter: vi.fn(),
      countOwnersWithFilter: vi.fn(),
    } as unknown as IOwnerRepository

    mockProcessSettlementUseCase = {
      execute: vi.fn(),
    }
  })

  describe("Settlement Domain Entity", () => {
    it("should instantiate with correct properties and default status", () => {
      const s = new Settlement({
        bookingId: "bk-1",
        ownerId: "owner-1",
        stationId: "st-1",
        totalAmount: 1000,
        platformCommission: 100,
        platformCommissionRate: 10,
        stationSettlementAmount: 900,
        currency: "INR",
        status: SettlementStatus.PENDING,
        createdAt: new Date(),
      })

      expect(s.bookingId).toBe("bk-1")
      expect(s.totalAmount).toBe(1000)
      expect(s.stationSettlementAmount).toBe(900)
      expect(s.status).toBe(SettlementStatus.PENDING)
    })

    it("should allow marking as processed", () => {
      const s = new Settlement({
        bookingId: "bk-1",
        ownerId: "owner-1",
        stationId: "st-1",
        totalAmount: 1000,
        platformCommission: 100,
        platformCommissionRate: 10,
        stationSettlementAmount: 900,
        currency: "INR",
        status: SettlementStatus.PENDING,
        createdAt: new Date(),
      })

      s.markProcessed("payout-123")
      expect(s.status).toBe(SettlementStatus.PROCESSED)
      expect(s.payoutId).toBe("payout-123")
      expect(s.processedAt).toBeDefined()
    })
  })

  describe("CreateSettlementUseCase", () => {
    it("should return existing settlement if already created", async () => {
      const existing = new Settlement({
        id: "set-existing",
        bookingId: "bk-1",
        ownerId: "owner-1",
        stationId: "st-1",
        totalAmount: 500,
        platformCommission: 50,
        platformCommissionRate: 10,
        stationSettlementAmount: 450,
        currency: "INR",
        status: SettlementStatus.PENDING,
        createdAt: new Date(),
      })

      vi.mocked(mockSettlementRepo.findByBookingId).mockResolvedValue(existing)
      const useCase = new CreateSettlementUseCase(mockSettlementRepo)

      const result = await useCase.execute({
        bookingId: "bk-1",
        ownerId: "owner-1",
        stationId: "st-1",
        totalAmount: 500,
        platformCommission: 50,
        platformCommissionRate: 10,
        stationSettlementAmount: 450,
      })

      expect(result.id).toBe("set-existing")
      expect(mockSettlementRepo.save).not.toHaveBeenCalled()
    })

    it("should create and save a new settlement using base repo save()", async () => {
      vi.mocked(mockSettlementRepo.findByBookingId).mockResolvedValue(null)
      vi.mocked(mockSettlementRepo.save).mockImplementation(async (s) => {
        return new Settlement({
          ...s.getProps(),
          id: "set-new",
        })
      })

      const useCase = new CreateSettlementUseCase(mockSettlementRepo)
      const result = await useCase.execute({
        bookingId: "bk-2",
        ownerId: "owner-1",
        stationId: "st-1",
        totalAmount: 1000,
        platformCommission: 100,
        platformCommissionRate: 10,
        stationSettlementAmount: 900,
      })

      expect(result.id).toBe("set-new")
      expect(mockSettlementRepo.save).toHaveBeenCalled()
    })
  })

  describe("ManageSettlementHoldUseCase", () => {
    it("should place settlement on hold", async () => {
      const settlement = new Settlement({
        id: "set-1",
        bookingId: "bk-1",
        ownerId: "owner-1",
        stationId: "st-1",
        totalAmount: 1000,
        platformCommission: 100,
        platformCommissionRate: 10,
        stationSettlementAmount: 900,
        currency: "INR",
        status: SettlementStatus.PENDING,
        createdAt: new Date(),
      })

      vi.mocked(mockSettlementRepo.findById).mockResolvedValue(settlement)
      vi.mocked(mockSettlementRepo.updateStatusWithGuard).mockResolvedValue(
        new Settlement({
          ...settlement.getProps(),
          status: SettlementStatus.HELD,
          holdReason: "Audit check",
        })
      )

      const useCase = new ManageSettlementHoldUseCase(mockSettlementRepo)
      const result = await useCase.hold("set-1", "Audit check")

      expect(result.status).toBe(SettlementStatus.HELD)
      expect(mockSettlementRepo.updateStatusWithGuard).toHaveBeenCalledWith(
        "set-1",
        SettlementStatus.HELD,
        [SettlementStatus.PENDING, SettlementStatus.PROCESSING, SettlementStatus.FAILED],
        { holdReason: "Audit check" }
      )
    })

    it("should throw ConflictError if holding an already PROCESSED settlement", async () => {
      const settlement = new Settlement({
        id: "set-1",
        bookingId: "bk-1",
        ownerId: "owner-1",
        stationId: "st-1",
        totalAmount: 1000,
        platformCommission: 100,
        platformCommissionRate: 10,
        stationSettlementAmount: 900,
        currency: "INR",
        status: SettlementStatus.PROCESSED,
        createdAt: new Date(),
      })

      vi.mocked(mockSettlementRepo.findById).mockResolvedValue(settlement)
      const useCase = new ManageSettlementHoldUseCase(mockSettlementRepo)

      await expect(useCase.hold("set-1", "Audit check")).rejects.toThrow(ConflictError)
    })
  })

  describe("RetrySettlementUseCase", () => {
    it("should reset status to pending and re-execute process settlement", async () => {
      const settlement = new Settlement({
        id: "set-1",
        bookingId: "bk-1",
        ownerId: "owner-1",
        stationId: "st-1",
        totalAmount: 1000,
        platformCommission: 100,
        platformCommissionRate: 10,
        stationSettlementAmount: 900,
        currency: "INR",
        status: SettlementStatus.FAILED,
        createdAt: new Date(),
      })

      vi.mocked(mockSettlementRepo.findById).mockResolvedValue(settlement)
      vi.mocked(mockProcessSettlementUseCase.execute).mockResolvedValue(settlement)

      const useCase = new RetrySettlementUseCase(mockSettlementRepo, mockProcessSettlementUseCase)
      await useCase.execute("set-1")

      expect(mockSettlementRepo.updateStatusWithGuard).toHaveBeenCalledWith(
        "set-1",
        SettlementStatus.PENDING,
        [SettlementStatus.HELD, SettlementStatus.FAILED],
        { holdReason: undefined, failureReason: undefined }
      )
      expect(mockProcessSettlementUseCase.execute).toHaveBeenCalledWith("set-1")
    })
  })

  describe("GetOwnerSettlementSummaryUseCase", () => {
    it("should return aggregated earnings and masked account information", async () => {
      const mockOwner = {
        id: "owner-1",
        razorpayFundAccountId: "fa_12345",
        bankName: "HDFC Bank",
        accountHolderName: "Station Owner",
        accountNumber: "123456789012",
      }

      vi.mocked(mockOwnerRepo.findByUserId).mockResolvedValue(mockOwner as any)
      vi.mocked(mockSettlementRepo.getOwnerAggregatedEarnings).mockResolvedValue({
        totalGrossRevenue: 15000,
        totalPlatformCommission: 1500,
        totalNetEarnings: 13500,
        settledAmount: 13000,
        pendingAmount: 2000,
        processingAmount: 0,
        heldAmount: 0,
        failedAmount: 0,
        completedBookingsCount: 15,
      })

      const useCase = new GetOwnerSettlementSummaryUseCase(mockSettlementRepo, mockOwnerRepo)
      const result = await useCase.execute("user-owner-1")

      expect(result.totalGrossRevenue).toBe(15000)
      expect(result.totalNetEarnings).toBe(13500)
      expect(result.payoutAccountStatus.hasLinkedAccount).toBe(true)
      expect(result.payoutAccountStatus.accountNumberMasked).toBe("•••• •••• 9012")
    })
  })

  describe("ProcessPendingSettlementsUseCase", () => {
    it("should process batch of pending settlements", async () => {
      const s1 = new Settlement({
        id: "set-1",
        bookingId: "bk-1",
        ownerId: "owner-1",
        stationId: "st-1",
        totalAmount: 1000,
        platformCommission: 100,
        platformCommissionRate: 10,
        stationSettlementAmount: 900,
        currency: "INR",
        status: SettlementStatus.PENDING,
        createdAt: new Date(),
      })

      vi.mocked(mockSettlementRepo.findMany).mockResolvedValue({
        settlements: [s1],
        total: 1,
      })

      const useCase = new ProcessPendingSettlementsUseCase(
        mockSettlementRepo,
        mockProcessSettlementUseCase
      )
      await useCase.execute()

      expect(mockProcessSettlementUseCase.execute).toHaveBeenCalledWith("set-1")
    })
  })
})
