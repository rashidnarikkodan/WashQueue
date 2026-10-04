import { Request, Response } from "express"
import { GetWalletBalanceUseCase } from "../application/use-cases/get-wallet-balance.use-case"
import { CreditWalletUseCase } from "../application/use-cases/credit-wallet.use-case"
import { DebitWalletUseCase } from "../application/use-cases/debit-wallet.use-case"
import { GetTransactionLedgerUseCase } from "../application/use-cases/get-transaction-ledger.use-case"
import { CreateTopUpOrderUseCase } from "../application/use-cases/create-topup-order.use-case"
import { VerifyTopUpPaymentUseCase } from "../application/use-cases/verify-topup-payment.use-case"
import { PayWithWalletUseCase } from "../application/use-cases/pay-with-wallet.use-case"
import { UnauthorizedError } from "@/common/errors/unauthorized-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import success from "@/common/utils/success"
import { TransactionCategory, TransactionType } from "../domain/entities/wallet-transaction.entity"

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string
    id?: string
    role?: string
  }
}

export class WalletController {
  constructor(
    private readonly getWalletBalanceUseCase: GetWalletBalanceUseCase,
    private readonly creditWalletUseCase: CreditWalletUseCase,
    private readonly debitWalletUseCase: DebitWalletUseCase,
    private readonly getTransactionLedgerUseCase: GetTransactionLedgerUseCase,
    private readonly createTopUpOrderUseCase: CreateTopUpOrderUseCase,
    private readonly verifyTopUpPaymentUseCase: VerifyTopUpPaymentUseCase,
    private readonly payWithWalletUseCase: PayWithWalletUseCase
  ) {}

  public getBalance = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.userId || authReq.user?.id

    if (!userId) {
      throw new UnauthorizedError()
    }

    const wallet = await this.getWalletBalanceUseCase.execute(userId)

    success(res, wallet, HTTP_STATUS.OK, "Wallet balance retrieved successfully")
  }

  public getLedger = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.userId || authReq.user?.id

    if (!userId) {
      throw new UnauthorizedError()
    }

    const { page, limit, type, category, startDate, endDate } = req.query

    const result = await this.getTransactionLedgerUseCase.execute(userId, {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      type: type as TransactionType,
      category: category as TransactionCategory,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    })

    success(
      res,
      {
        transactions: result.transactions,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
      HTTP_STATUS.OK,
      "Transaction ledger retrieved successfully"
    )
  }

  public createTopUpOrder = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.userId || authReq.user?.id

    if (!userId) {
      throw new UnauthorizedError()
    }

    const { amount, currency } = req.body

    const order = await this.createTopUpOrderUseCase.execute(userId, amount, currency)

    success(res, order, HTTP_STATUS.OK, "Top-up order created successfully")
  }

  public verifyTopUpPayment = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.userId || authReq.user?.id

    if (!userId) {
      throw new UnauthorizedError()
    }

    const { amount, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const transaction = await this.verifyTopUpPaymentUseCase.execute(userId, amount, {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    })

    success(res, transaction, HTTP_STATUS.OK, "Wallet topped up successfully")
  }

  public payWithWallet = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.userId || authReq.user?.id

    if (!userId) {
      throw new UnauthorizedError()
    }

    const { amount, referenceId, description, metadata } = req.body

    const transaction = await this.payWithWalletUseCase.execute({
      userId,
      amount,
      referenceId,
      description,
      metadata,
    })

    success(res, transaction, HTTP_STATUS.OK, "Payment processed using wallet balance")
  }

  public creditWallet = async (req: Request, res: Response): Promise<void> => {
    const { userId, amount, category, description, referenceId, metadata } = req.body

    const transaction = await this.creditWalletUseCase.execute({
      userId,
      amount,
      category,
      description,
      referenceId,
      metadata,
    })

    success(res, transaction, HTTP_STATUS.OK, "Wallet credited successfully")
  }

  public debitWallet = async (req: Request, res: Response): Promise<void> => {
    const { userId, amount, category, description, referenceId, metadata } = req.body

    const transaction = await this.debitWalletUseCase.execute({
      userId,
      amount,
      category,
      description,
      referenceId,
      metadata,
    })

    success(res, transaction, HTTP_STATUS.OK, "Wallet debited successfully")
  }

  public exportTransactions = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest
    const userId = authReq.user?.userId || authReq.user?.id

    if (!userId) {
      throw new UnauthorizedError()
    }

    const { type, category, startDate, endDate } = req.query

    const result = await this.getTransactionLedgerUseCase.execute(userId, {
      page: 1,
      limit: 1000,
      type: type as TransactionType,
      category: category as TransactionCategory,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    })

    const BOM = "\uFEFF"
    let csv =
      BOM +
      "Transaction ID,Date & Time,Description,Type,Category,Amount (INR),Status,Reference ID\n"

    result.transactions.forEach((tx) => {
      const dateStr = new Date(tx.createdAt).toLocaleString("en-IN")
      const desc = `"${(tx.description || "").replace(/"/g, '""')}"`
      const refId = `"${(tx.referenceId || "").replace(/"/g, '""')}"`
      csv += `${tx.id},"${dateStr}",${desc},${tx.type},${tx.category},${tx.amount.toFixed(2)},${tx.status},${refId}\n`
    })

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="wallet-transactions-${Date.now()}.csv"`
    )
    res.status(HTTP_STATUS.OK).send(csv)
  }
}
