export const PAYMENT = {
  STATUS: {
    PENDING: "PENDING",
    PARTIAL: "PARTIAL",
    PAID: "PAID",
    REFUNDED: "REFUNDED",
    FAILED: "FAILED",
  },
  METHOD: {
    WALLET: "WALLET",
    ONLINE: "ONLINE",
    WALLET_AND_ONLINE: "WALLET_AND_ONLINE",
    PAY_AT_STATION: "PAY_AT_STATION",
    NO_PAYMENT: "NO_PAYMENT",
  },
  REFUND: {
    METHOD: {},
    STATUS: {
      NONE: "NONE",
      PENDING: "PENDING",
      PROCESSED: "PROCESSED",
      FAILED: "FAILED",
    },
  },
} as const

export type PaymentStatusType = (typeof PAYMENT.STATUS)[keyof typeof PAYMENT.STATUS]
export type PaymentMethodType = (typeof PAYMENT.METHOD)[keyof typeof PAYMENT.METHOD]

export type RefundStatusType = (typeof PAYMENT.REFUND.STATUS)[keyof typeof PAYMENT.REFUND.STATUS]
