export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
} as const

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]
export type PaymentStatusType = PaymentStatus

export const PAYMENT_TYPE = {
  ONLINE_FULL: "ONLINE_FULL",
  PAY_AT_STATION: "PAY_AT_STATION",
  DEPOSIT_PLUS_CASH: "DEPOSIT_PLUS_CASH",
  CASH_WALKIN: "CASH_WALKIN",
} as const

export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE]

export const PAYMENT_METHOD = {
  WALLET: "WALLET",
  ONLINE: "ONLINE",
  WALLET_AND_ONLINE: "WALLET_AND_ONLINE",
  PAY_AT_STATION: "PAY_AT_STATION",
  NO_PAYMENT: "NO_PAYMENT",
} as const

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]
export type PaymentMethodType = PaymentMethod

export const REFUND_STATUS = {
  NONE: "NONE",
  PENDING: "PENDING",
  PROCESSED: "PROCESSED",
  FAILED: "FAILED",
} as const

export type RefundStatus = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS]
export type RefundStatusType = RefundStatus

export const PAYMENT = {
  STATUS: PAYMENT_STATUS,
  TYPE: PAYMENT_TYPE,
  METHOD: PAYMENT_METHOD,
  REFUND: {
    STATUS: REFUND_STATUS,
  },
} as const
