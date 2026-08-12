import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"
import { Money } from "../value-objects/money.vo"
import {
  WalletTransaction,
  TransactionCategory,
} from "./wallet-transaction.entity"

export type WalletStatus = "ACTIVE" | "SUSPENDED" | "LOCKED"

export interface WalletProps {
  id?: string
  userId: string
  balance: Money
  currency?: string
  status?: WalletStatus
  createdAt?: Date
  updatedAt?: Date
}

export interface WalletOperationResult {
  updatedWallet: Wallet
  transaction: WalletTransaction
}

export class Wallet {
  private readonly _id?: string
  private readonly _userId: string
  private _balance: Money
  private readonly _currency: string
  private _status: WalletStatus
  private readonly _createdAt: Date
  private _updatedAt: Date

  constructor(props: WalletProps) {
    this._id = props.id
    this._userId = props.userId
    this._balance = props.balance
    this._currency = props.currency || props.balance.currency || "INR"
    this._status = props.status || "ACTIVE"
    this._createdAt = props.createdAt || new Date()
    this._updatedAt = props.updatedAt || new Date()
  }

  public get id(): string | undefined {
    return this._id
  }

  public get userId(): string {
    return this._userId
  }

  public get balance(): Money {
    return this._balance
  }

  public get currency(): string {
    return this._currency
  }

  public get status(): WalletStatus {
    return this._status
  }

  public get createdAt(): Date {
    return this._createdAt
  }

  public get updatedAt(): Date {
    return this._updatedAt
  }

  public isActive(): boolean {
    return this._status === "ACTIVE"
  }

  public canDebit(amount: Money): boolean {
    if (!this.isActive()) return false
    return !this._balance.isLessThan(amount)
  }

  public credit(
    amount: Money,
    category: TransactionCategory,
    description: string,
    referenceId?: string,
    metadata?: Record<string, unknown>
  ): WalletOperationResult {
    this.ensureActive()

    if (amount.isNegative() || amount.isZero()) {
      throw new AppError(
        "Credit amount must be greater than zero",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const balanceBefore = this._balance
    const balanceAfter = this._balance.add(amount)

    this._balance = balanceAfter
    this._updatedAt = new Date()

    const transaction = new WalletTransaction({
      walletId: this._id || "",
      userId: this._userId,
      type: "CREDIT",
      category,
      amount,
      balanceBefore,
      balanceAfter,
      referenceId,
      description,
      status: "COMPLETED",
      metadata,
    })

    return {
      updatedWallet: this,
      transaction,
    }
  }

  public debit(
    amount: Money,
    category: TransactionCategory,
    description: string,
    referenceId?: string,
    metadata?: Record<string, unknown>
  ): WalletOperationResult {
    this.ensureActive()

    if (amount.isNegative() || amount.isZero()) {
      throw new AppError(
        "Debit amount must be greater than zero",
        HTTP_STATUS.BAD_REQUEST
      )
    }

    if (this._balance.isLessThan(amount)) {
      throw new AppError(
        `Insufficient wallet balance. Current: ₹${this._balance.amount}, Required: ₹${amount.amount}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }

    const balanceBefore = this._balance
    const balanceAfter = this._balance.subtract(amount)

    this._balance = balanceAfter
    this._updatedAt = new Date()

    const transaction = new WalletTransaction({
      walletId: this._id || "",
      userId: this._userId,
      type: "DEBIT",
      category,
      amount,
      balanceBefore,
      balanceAfter,
      referenceId,
      description,
      status: "COMPLETED",
      metadata,
    })

    return {
      updatedWallet: this,
      transaction,
    }
  }

  private ensureActive(): void {
    if (this._status !== "ACTIVE") {
      throw new AppError(
        `Wallet is currently ${this._status.toLowerCase()} and cannot perform transactions`,
        HTTP_STATUS.FORBIDDEN
      )
    }
  }
}
