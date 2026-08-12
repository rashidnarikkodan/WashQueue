import { z } from "zod"

export const createTopUpOrderSchema = z.object({
  amount: z.number().min(1, "Minimum top-up amount is ₹1"),
  currency: z.string().optional().default("INR"),
})

export const verifyTopUpPaymentSchema = z.object({
  amount: z.number().min(1, "Minimum top-up amount is ₹1"),
  razorpay_order_id: z.string().min(1, "razorpay_order_id is required"),
  razorpay_payment_id: z.string().min(1, "razorpay_payment_id is required"),
  razorpay_signature: z.string().min(1, "razorpay_signature is required"),
})

export const payWithWalletSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  referenceId: z.string().min(1, "referenceId (e.g. bookingId) is required"),
  description: z.string().optional().default("Wallet payment for booking"),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const creditWalletSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  category: z.enum([
    "TOP_UP",
    "BOOKING_PAYMENT",
    "REFUND",
    "CASHBACK",
    "ADMIN_ADJUSTMENT",
  ]),
  description: z.string().min(1, "Description is required"),
  referenceId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const debitWalletSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  category: z.enum([
    "TOP_UP",
    "BOOKING_PAYMENT",
    "REFUND",
    "CASHBACK",
    "ADMIN_ADJUSTMENT",
  ]),
  description: z.string().min(1, "Description is required"),
  referenceId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const getLedgerQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  type: z.enum(["CREDIT", "DEBIT"]).optional(),
  category: z
    .enum(["TOP_UP", "BOOKING_PAYMENT", "REFUND", "CASHBACK", "ADMIN_ADJUSTMENT"])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})
