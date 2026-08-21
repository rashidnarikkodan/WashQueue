export enum PaymentStatus {
  PENDING = "PENDING",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export enum PaymentMethod {
  WALLET = "WALLET",
  ONLINE = "ONLINE",
  WALLET_AND_ONLINE = "WALLET_AND_ONLINE",
  PAY_AT_STATION = "PAY_AT_STATION",
  NO_PAYMENT = "NO_PAYMENT",
}

export enum RefundStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
}

export const PAYMENT = {
  STATUS: PaymentStatus,
  METHOD: PaymentMethod,
  REFUND: {
    STATUS: RefundStatus,
  },
} as const
