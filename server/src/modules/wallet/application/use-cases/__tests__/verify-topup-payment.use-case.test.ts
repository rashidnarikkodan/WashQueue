import { describe, it, expect, vi, beforeEach, type Mocked } from "vitest"
import { VerifyTopUpPaymentUseCase } from "../verify-topup-payment.use-case"
import { IWalletPaymentGateway } from "../../interfaces/wallet-payment-gateway.interface"
import { CreditWalletUseCase } from "../credit-wallet.use-case"
import { IWalletTransactionRepository } from "../../../domain/repositories/wallet-transaction.repository.interface"
import { AppError } from "@/common/errors/app-error"

describe("VerifyTopUpPaymentUseCase", () => {
  let paymentGateway: Mocked<IWalletPaymentGateway>
  let creditWalletUseCase: Mocked<CreditWalletUseCase>
  let transactionRepository: Mocked<IWalletTransactionRepository>
  let useCase: VerifyTopUpPaymentUseCase

  beforeEach(() => {
    paymentGateway = {
      createTopUpOrder: vi.fn(),
      verifyTopUpSignature: vi.fn().mockReturnValue(true),
      getOrderDetails: vi.fn().mockResolvedValue({
        id: "order_123",
        amountInPaise: 50000, // ₹500
        currency: "INR",
        status: "paid",
        notes: { userId: "user_1" },
      }),
    }

    creditWalletUseCase = {
      execute: vi.fn().mockResolvedValue({
        id: "tx_123",
        userId: "user_1",
        amount: 500,
        type: "CREDIT",
        category: "TOP_UP",
        status: "COMPLETED",
        balanceAfter: 500,
        createdAt: new Date(),
      }),
    } as unknown as Mocked<CreditWalletUseCase>

    transactionRepository = {
      findByReferenceId: vi.fn().mockResolvedValue(null),
    } as unknown as Mocked<IWalletTransactionRepository>

    useCase = new VerifyTopUpPaymentUseCase(
      paymentGateway,
      creditWalletUseCase,
      transactionRepository
    )
  })

  it("should successfully verify and credit authoritative order amount", async () => {
    const result = await useCase.execute("user_1", 500, {
      razorpayOrderId: "order_123",
      razorpayPaymentId: "pay_123",
      razorpaySignature: "valid_sig",
    })

    expect(paymentGateway.verifyTopUpSignature).toHaveBeenCalledWith(
      "order_123",
      "pay_123",
      "valid_sig"
    )
    expect(paymentGateway.getOrderDetails).toHaveBeenCalledWith("order_123")
    expect(creditWalletUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        amount: 500,
        category: "TOP_UP",
      })
    )
    expect(result.id).toBe("tx_123")
  })

  it("should reject when signature verification fails", async () => {
    paymentGateway.verifyTopUpSignature.mockReturnValue(false)

    await expect(
      useCase.execute("user_1", 500, {
        razorpayOrderId: "order_123",
        razorpayPaymentId: "pay_123",
        razorpaySignature: "invalid_sig",
      })
    ).rejects.toThrow(AppError)
  })

  it("should reject when transaction has already been credited (idempotency)", async () => {
    transactionRepository.findByReferenceId.mockResolvedValue({
      id: "existing_tx",
    } as unknown as ReturnType<IWalletTransactionRepository["findByReferenceId"]> extends Promise<
      infer U
    >
      ? U
      : never)

    await expect(
      useCase.execute("user_1", 500, {
        razorpayOrderId: "order_123",
        razorpayPaymentId: "pay_123",
        razorpaySignature: "valid_sig",
      })
    ).rejects.toThrow(AppError)
  })

  it("should reject when user attempts to claim another user order", async () => {
    paymentGateway.getOrderDetails.mockResolvedValue({
      id: "order_123",
      amountInPaise: 50000,
      currency: "INR",
      status: "paid",
      notes: { userId: "different_user" },
    })

    await expect(
      useCase.execute("user_1", 500, {
        razorpayOrderId: "order_123",
        razorpayPaymentId: "pay_123",
        razorpaySignature: "valid_sig",
      })
    ).rejects.toThrow(/Payment order does not belong to this user/)
  })

  it("should reject when client-provided amount does not match gateway verified amount", async () => {
    // Gateway has 50000 paise (₹500), but client tries to claim ₹50,000
    await expect(
      useCase.execute("user_1", 50000, {
        razorpayOrderId: "order_123",
        razorpayPaymentId: "pay_123",
        razorpaySignature: "valid_sig",
      })
    ).rejects.toThrow(/Payment amount mismatch with verified gateway order/)
  })
})
