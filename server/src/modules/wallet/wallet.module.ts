import { WalletMongoRepository } from "./infrastructure/repositories/wallet.mongo.repository"
import { WalletTransactionMongoRepository } from "./infrastructure/repositories/wallet-transaction.mongo.repository"
import { RazorpayWalletPaymentService } from "./infrastructure/services/razorpay-wallet-payment.service"

import { GetWalletBalanceUseCase } from "./application/use-cases/get-wallet-balance.use-case"
import { CreditWalletUseCase } from "./application/use-cases/credit-wallet.use-case"
import { DebitWalletUseCase } from "./application/use-cases/debit-wallet.use-case"
import { GetTransactionLedgerUseCase } from "./application/use-cases/get-transaction-ledger.use-case"
import { CreateTopUpOrderUseCase } from "./application/use-cases/create-topup-order.use-case"
import { VerifyTopUpPaymentUseCase } from "./application/use-cases/verify-topup-payment.use-case"
import { PayWithWalletUseCase } from "./application/use-cases/pay-with-wallet.use-case"

import { WalletController } from "./presentation/wallet.controller"
import { createWalletRouter } from "./presentation/wallet.routes"

// Instantiate repositories & services
export const walletRepository = new WalletMongoRepository()
export const walletTransactionRepository = new WalletTransactionMongoRepository()
export const walletPaymentGateway = new RazorpayWalletPaymentService()

// Instantiate use cases
export const getWalletBalanceUseCase = new GetWalletBalanceUseCase(walletRepository)
export const creditWalletUseCase = new CreditWalletUseCase(walletRepository)
export const debitWalletUseCase = new DebitWalletUseCase(walletRepository)
export const getTransactionLedgerUseCase = new GetTransactionLedgerUseCase(
  walletTransactionRepository
)
export const createTopUpOrderUseCase = new CreateTopUpOrderUseCase(walletPaymentGateway)
export const verifyTopUpPaymentUseCase = new VerifyTopUpPaymentUseCase(
  walletPaymentGateway,
  creditWalletUseCase,
  walletTransactionRepository
)
export const payWithWalletUseCase = new PayWithWalletUseCase(debitWalletUseCase)

// Instantiate controller
export const walletController = new WalletController(
  getWalletBalanceUseCase,
  creditWalletUseCase,
  debitWalletUseCase,
  getTransactionLedgerUseCase,
  createTopUpOrderUseCase,
  verifyTopUpPaymentUseCase,
  payWithWalletUseCase
)

// Create router
const walletRouter = createWalletRouter(walletController)

export default walletRouter
