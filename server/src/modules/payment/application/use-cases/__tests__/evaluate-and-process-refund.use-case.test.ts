import { describe, it, expect, vi, beforeEach } from "vitest"
import { EvaluateAndProcessRefundUseCase } from "../evaluate-and-process-refund.use-case"
import { IBookingRepository, RefundDetailsSnapshot } from "@/modules/booking/domain/repositories/booking.repository"
import { IBookingNotificationService } from "@/modules/notification/notification.module"
import { Booking, BookingStatus, PaymentMethod, PaymentStatus, ServiceType } from "@/modules/booking/domain/entities/Booking"
import { CreditWalletUseCase } from "@/modules/wallet/application/use-cases/credit-wallet.use-case"

describe("EvaluateAndProcessRefundUseCase", () => {
  let mockBookingRepo: Partial<IBookingRepository>
  let mockNotificationService: Partial<IBookingNotificationService>
  let mockWalletExecutor: { execute: ReturnType<typeof vi.fn> }
  let useCase: EvaluateAndProcessRefundUseCase

  const sampleBooking = new Booking({
    id: "booking-123",
    bookingNumber: "WQ-123",
    userId: "user-1",
    ownerId: "owner-1",
    stationId: "station-1",
    serviceType: ServiceType.FULL,
    vehicleId: "vehicle-1",
    vehicleSnapshot: {
      vehicleCategoryId: "cat-1",
      vehicleClassId: "cls-1",
    },
    extraServices: [],
    isWalkIn: false,
    createdByUserId: "user-1",
    qr: {
      qrTokenHash: "hash-123",
      qrExpiresAt: new Date(Date.now() + 3600000),
    },
    cashAmount: 0,
    refundAmount: 0,
    settlement: {
      platformCommission: 50,
      stationSettlement: 450,
    },
    status: BookingStatus.CANCELLED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: PaymentMethod.ONLINE,
    depositAmount: 500,
    pricingSnapshot: {
      basePrice: 500,
      extraPrice: 0,
      totalPrice: 500,
      currency: "INR",
    },
    scheduling: {
      windowStart: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h ahead for 100% refund
      windowEnd: new Date(Date.now() + 49 * 60 * 60 * 1000),
      timeWindowId: "tw-1",
    },
    cancellation: {
      cancelledAt: new Date(),
      cancellationReason: "User requested",
      cancelledBy: "user-1",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  beforeEach(() => {
    mockBookingRepo = {
      findById: vi.fn().mockResolvedValue(sampleBooking),
      getRefundDetails: vi.fn().mockResolvedValue(null),
      applyRefund: vi.fn().mockImplementation((_id, refund, paymentStatus) => {
        return Promise.resolve({
          ...sampleBooking,
          paymentStatus,
          refundDetails: refund,
        })
      }),
    }
    mockNotificationService = {
      notify: vi.fn().mockResolvedValue(undefined),
    }
    mockWalletExecutor = {
      execute: vi.fn().mockResolvedValue({ id: "tx-wallet-123" }),
    }

    useCase = new EvaluateAndProcessRefundUseCase(
      mockBookingRepo as IBookingRepository,
      mockWalletExecutor as unknown as CreditWalletUseCase,
      mockNotificationService as IBookingNotificationService
    )
  })

  it("should process refund, mark status as PROCESSED, and dispatch notification on success", async () => {
    const result = await useCase.execute({
      bookingId: "booking-123",
      responsibility: "CUSTOMER",
      reason: "Customer cancelled",
    })

    expect(result.refundAmount).toBeGreaterThan(0)
    expect(mockWalletExecutor.execute).toHaveBeenCalledTimes(1)
    expect(mockBookingRepo.applyRefund).toHaveBeenCalledWith(
      "booking-123",
      expect.objectContaining({
        status: "PROCESSED",
        amount: result.refundAmount,
        transactionId: "tx-wallet-123",
      }),
      PaymentStatus.REFUNDED
    )
    expect(mockNotificationService.notify).toHaveBeenCalledWith(
      "REFUND_COMPLETED",
      expect.anything(),
      expect.objectContaining({
        refundAmount: result.refundAmount,
      })
    )
  })

  it("should mark refund status as FAILED, preserve payment status, and rethrow error when wallet credit fails", async () => {
    mockWalletExecutor.execute.mockRejectedValue(new Error("Wallet gateway timeout"))

    await expect(
      useCase.execute({
        bookingId: "booking-123",
        responsibility: "CUSTOMER",
        reason: "Customer cancelled",
      })
    ).rejects.toThrow("Wallet gateway timeout")

    expect(mockBookingRepo.applyRefund).toHaveBeenCalledWith(
      "booking-123",
      expect.objectContaining({
        status: "FAILED",
        reason: expect.stringContaining("Wallet refund failed: Wallet gateway timeout"),
        transactionId: null,
      }),
      PaymentStatus.PAID // Not REFUNDED
    )
    expect(mockNotificationService.notify).not.toHaveBeenCalled()
  })

  it("should return existing refund immediately on idempotent replay when status is PROCESSED", async () => {
    const existingSnapshot: RefundDetailsSnapshot = {
      refundType: "FULL",
      refundMethod: "WALLET",
      status: "PROCESSED",
      amount: 500,
      reason: "Previous refund",
      transactionId: "tx-prev-1",
    }
    mockBookingRepo.getRefundDetails = vi.fn().mockResolvedValue(existingSnapshot)

    const result = await useCase.execute({
      bookingId: "booking-123",
    })

    expect(result.refundAmount).toBe(500)
    expect(result.reason).toBe("Previous refund")
    expect(mockWalletExecutor.execute).not.toHaveBeenCalled()
    expect(mockBookingRepo.applyRefund).not.toHaveBeenCalled()
  })
})
