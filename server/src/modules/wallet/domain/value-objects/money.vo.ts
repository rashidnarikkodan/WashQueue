import { AppError } from "@/common/errors/app-error"
import { HTTP_STATUS } from "@/common/constants/http.constants"

export class Money {
  private readonly _amount: number
  private readonly _currency: string

  constructor(amount: number, currency: string = "INR") {
    if (isNaN(amount)) {
      throw new AppError("Invalid monetary amount", HTTP_STATUS.BAD_REQUEST)
    }

    // Round to 2 decimal places to prevent floating point precision errors
    this._amount = Math.round((amount + Number.EPSILON) * 100) / 100
    this._currency = currency.toUpperCase()
  }

  public get amount(): number {
    return this._amount
  }

  public get currency(): string {
    return this._currency
  }

  public isNegative(): boolean {
    return this._amount < 0
  }

  public isZero(): boolean {
    return this._amount === 0
  }

  public isLessThan(other: Money): boolean {
    this.assertSameCurrency(other)
    return this._amount < other._amount
  }

  public isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other)
    return this._amount > other._amount
  }

  public add(other: Money): Money {
    this.assertSameCurrency(other)
    return new Money(this._amount + other._amount, this._currency)
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other)
    return new Money(this._amount - other._amount, this._currency)
  }

  public equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new AppError(
        `Currency mismatch: cannot operate on ${this._currency} and ${other._currency}`,
        HTTP_STATUS.BAD_REQUEST
      )
    }
  }

  public static zero(currency: string = "INR"): Money {
    return new Money(0, currency)
  }
}
