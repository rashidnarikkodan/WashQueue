import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { ProcessSettlementUseCase } from "./process-settlement.use-case"
import { CreateSettlementUseCase } from "./create-settlement.use-case"
import { Settlement, SettlementStatus } from "../../domain/entities/Settlement"
import { ISettlementRepository } from "../../domain/repositories/settlement.repository"
import { IOwnerRepository } from "@/modules/owner/domain/repositories/owner.repository"
import { Owner } from "@/modules/owner/domain/entities/Owner"
import {
  CreateTransferParams,
  ITransferService,
  TransferResult,
} from "@/core/application/interfaces/transfer.interface"
import { NotFoundError } from "@/common/errors/not-found-error"
import { ConflictError } from "@/common/errors/conflict-error"

class MockSettlementRepository implements ISettlementRepository {
  public settlements = new Map<string, Settlement>()

  async findById(id: string): Promise<Settlement | null> {
    return this.settlements.get(id) || null
  }

  async findByBookingId(bookingId: string): Promise<Settlement | null> {
    for (const s of this.settlements.values()) {
      if (s.bookingId === bookingId) return s
    }
    return null
  }

  async save(settlement: Settlement): Promise<Settlement> {
    const id = settlement.id || `settle_${Date.now()}`
    const props = settlement.getProps()
    const saved = new Settlement({
      ...props,
      id,
    })
    this.settlements.set(id, saved)
    return saved
  }

  async delete(): Promise<void> {}
  async update(): Promise<Settlement | null> {
    return null
  }
}

class MockOwnerRepository implements Partial<IOwnerRepository> {
  public owner: Owner | null = null

  async findById(id: string): Promise<Owner | null> {
    if (this.owner && this.owner.id === id) return this.owner
    return null
  }

  async findByUserId(userId: string): Promise<Owner | null> {
    if (this.owner && this.owner.userId === userId) return this.owner
    return null
  }
}

class MockTransferService implements ITransferService {
  public params: CreateTransferParams | null = null
  public status: "SUCCESS" | "FAILED" = "SUCCESS"
  public returnTransferId = "trf_mock_789"

  async transfer(params: CreateTransferParams): Promise<TransferResult> {
    this.params = params
    return {
      transferId: this.returnTransferId,
      status: this.status,
    }
  }
}

describe("ProcessSettlementUseCase & CreateSettlementUseCase", () => {
  it("should create settlement with pending status", async () => {
    const settlementRepo = new MockSettlementRepository()
    const createUseCase = new CreateSettlementUseCase(settlementRepo)

    const settlement = await createUseCase.execute({
      bookingId: "booking_123",
      ownerId: "owner_456",
      totalAmount: 1000,
      platformCommission: 100,
      stationSettlementAmount: 900,
    })

    assert.strictEqual(settlement.status, SettlementStatus.PENDING)
    assert.strictEqual(settlement.stationSettlementAmount, 900)
    assert.strictEqual(settlement.platformCommission, 100)
    assert.strictEqual(settlement.totalAmount, 1000)
  })

  it("should return existing settlement if already created for bookingId", async () => {
    const settlementRepo = new MockSettlementRepository()
    const createUseCase = new CreateSettlementUseCase(settlementRepo)

    const first = await createUseCase.execute({
      bookingId: "booking_123",
      ownerId: "owner_456",
      totalAmount: 1000,
      platformCommission: 100,
      stationSettlementAmount: 900,
    })

    const second = await createUseCase.execute({
      bookingId: "booking_123",
      ownerId: "owner_456",
      totalAmount: 1000,
      platformCommission: 100,
      stationSettlementAmount: 900,
    })

    assert.strictEqual(first.id, second.id)
  })

  it("should throw NotFoundError if settlement does not exist", async () => {
    const settlementRepo = new MockSettlementRepository()
    const ownerRepo = new MockOwnerRepository() as unknown as IOwnerRepository
    const transferService = new MockTransferService()

    const useCase = new ProcessSettlementUseCase(
      settlementRepo,
      ownerRepo,
      transferService
    )

    await assert.rejects(
      async () => {
        await useCase.execute("non_existent_id")
      },
      (err: any) => {
        assert.ok(err instanceof NotFoundError)
        return true
      }
    )
  })

  it("should throw ConflictError if settlement is already SETTLED", async () => {
    const settlementRepo = new MockSettlementRepository()
    const ownerRepo = new MockOwnerRepository() as unknown as IOwnerRepository
    const transferService = new MockTransferService()

    const initial = new Settlement({
      id: "settle_1",
      bookingId: "b1",
      ownerId: "o1",
      totalAmount: 500,
      platformCommission: 50,
      stationSettlementAmount: 450,
      status: SettlementStatus.SETTLED,
      createdAt: new Date(),
    })
    settlementRepo.settlements.set("settle_1", initial)

    const useCase = new ProcessSettlementUseCase(
      settlementRepo,
      ownerRepo,
      transferService
    )

    await assert.rejects(
      async () => {
        await useCase.execute("settle_1")
      },
      (err: any) => {
        assert.ok(err instanceof ConflictError)
        return true
      }
    )
  })

  it("should process transfer and mark settlement as SETTLED when owner has transferId", async () => {
    const settlementRepo = new MockSettlementRepository()
    const ownerRepo = new MockOwnerRepository() as unknown as IOwnerRepository
    const transferService = new MockTransferService()

    const owner = new Owner({
      id: "owner_1",
      userId: "user_owner_1",
      legalFullName: "Station Master",
      transferId: "acc_razorpay_999",
    })
    ;(ownerRepo as any).owner = owner

    const pendingSettlement = new Settlement({
      id: "settle_pending",
      bookingId: "booking_99",
      ownerId: "owner_1",
      totalAmount: 1000,
      platformCommission: 100,
      stationSettlementAmount: 900,
      status: SettlementStatus.PENDING,
      createdAt: new Date(),
    })
    settlementRepo.settlements.set("settle_pending", pendingSettlement)

    const useCase = new ProcessSettlementUseCase(
      settlementRepo,
      ownerRepo,
      transferService
    )

    const processed = await useCase.execute("settle_pending")

    assert.strictEqual(processed.status, SettlementStatus.SETTLED)
    assert.strictEqual(processed.transferId, "trf_mock_789")
    assert.ok(processed.settledAt)
    assert.ok(transferService.params)
    assert.strictEqual(transferService.params.amountInPaise, 90000)
    assert.strictEqual(transferService.params.recipientId, "acc_razorpay_999")
  })

  it("should mark settlement as FAILED if owner has no transferId", async () => {
    const settlementRepo = new MockSettlementRepository()
    const ownerRepo = new MockOwnerRepository() as unknown as IOwnerRepository
    const transferService = new MockTransferService()

    const ownerWithoutTransfer = new Owner({
      id: "owner_no_acc",
      userId: "user_owner_2",
      legalFullName: "Unapproved Owner",
    })
    ;(ownerRepo as any).owner = ownerWithoutTransfer

    const pendingSettlement = new Settlement({
      id: "settle_fail",
      bookingId: "booking_fail",
      ownerId: "owner_no_acc",
      totalAmount: 500,
      platformCommission: 50,
      stationSettlementAmount: 450,
      status: SettlementStatus.PENDING,
      createdAt: new Date(),
    })
    settlementRepo.settlements.set("settle_fail", pendingSettlement)

    const useCase = new ProcessSettlementUseCase(
      settlementRepo,
      ownerRepo,
      transferService
    )

    const result = await useCase.execute("settle_fail")

    assert.strictEqual(result.status, SettlementStatus.FAILED)
    assert.strictEqual(transferService.params, null)
  })
})
