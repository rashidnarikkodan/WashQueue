import { Money } from "../value-objects/money.vo"

export type TransactionType = "CREDIT" | "DEBIT"

export type TransactionCategory =
  | "TOP_UP"
  | "BOOKING_PAYMENT"
  | "REFUND"
  | "CASHBACK"
  | "ADMIN_ADJUSTMENT"

export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED"

export interface WalletTransactionProps {
  id?: string
  walletId: string
  userId: string
  type: TransactionType
  category: TransactionCategory
  amount: Money
  balanceBefore: Money
  balanceAfter: Money
  referenceId?: string
  description: string
  status: TransactionStatus
  metadata?: Record<string, unknown>
  createdAt?: Date
}

export class WalletTransaction {
  private readonly _id?: string
  private readonly _walletId: string
  private readonly _userId: string
  private readonly _type: TransactionType
  private readonly _category: TransactionCategory
  private readonly _amount: Money
  private readonly _balanceBefore: Money
  private readonly _balanceAfter: Money
  private readonly _referenceId?: string
  private readonly _description: string
  private readonly _status: TransactionStatus
  private readonly _metadata?: Record<string, unknown>
  private readonly _createdAt: Date

  constructor(props: WalletTransactionProps) {
    this._id = props.id
    this._walletId = props.walletId
    this._userId = props.userId
    this._type = props.type
    this._category = props.category
    this._amount = props.amount
    this._balanceBefore = props.balanceBefore
    this._balanceAfter = props.balanceAfter
    this._referenceId = props.referenceId
    this._description = props.description
    this._status = props.status
    this._metadata = props.metadata
    this._createdAt = props.createdAt || new Date()
  }

  public get id(): string | undefined {
    return this._id
  }

  public get walletId(): string {
    return this._walletId
  }

  public get userId(): string {
    return this._userId
  }

  public get type(): TransactionType {
    return this._type
  }

  public get category(): TransactionCategory {
    return this._category
  }

  public get amount(): Money {
    return this._amount
  }

  public get balanceBefore(): Money {
    return this._balanceBefore
  }

  public get balanceAfter(): Money {
    return this._balanceAfter
  }

  public get referenceId(): string | undefined {
    return this._referenceId
  }

  public get description(): string {
    return this._description
  }

  public get status(): TransactionStatus {
    return this._status
  }

  public get metadata(): Record<string, unknown> | undefined {
    return this._metadata
  }

  public get createdAt(): Date {
    return this._createdAt
  }
}
