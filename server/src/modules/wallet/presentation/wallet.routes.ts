import { Router } from "express"
import { WalletController } from "./wallet.controller"
import asyncHandler from "@/common/utils/async-handler"
import { authenticate } from "@/infrastructure/http/middleware/authenticate"
import { authorize } from "@/infrastructure/http/middleware/authorize"
import { ROLE } from "@/common/constants/role.constants"
import { validateRequest } from "@/infrastructure/http/middleware/validation.middleware"
import {
  createTopUpOrderSchema,
  verifyTopUpPaymentSchema,
  payWithWalletSchema,
  creditWalletSchema,
  debitWalletSchema,
  getLedgerQuerySchema,
} from "./schema/wallet.schema"

export const createWalletRouter = (walletController: WalletController): Router => {
  const router = Router()

  router.use(authenticate)

  router.get("/", asyncHandler(walletController.getBalance))
  router.get("/transactions", validateRequest(getLedgerQuerySchema, "query"), asyncHandler(walletController.getLedger))
  router.get("/export", validateRequest(getLedgerQuerySchema, "query"), asyncHandler(walletController.exportTransactions))
  router.post("/topup/order", validateRequest(createTopUpOrderSchema), asyncHandler(walletController.createTopUpOrder))
  router.post("/topup/verify", validateRequest(verifyTopUpPaymentSchema), asyncHandler(walletController.verifyTopUpPayment))
  router.post("/pay", validateRequest(payWithWalletSchema), asyncHandler(walletController.payWithWallet))

  router.post(
    "/credit",
    authorize(ROLE.ADMIN),
    validateRequest(creditWalletSchema),
    asyncHandler(walletController.creditWallet)
  )
  router.post(
    "/debit",
    authorize(ROLE.ADMIN),
    validateRequest(debitWalletSchema),
    asyncHandler(walletController.debitWallet)
  )

  return router
}
