export class Rating {
  private readonly value: number

  constructor(value: number) {
    if (typeof value !== "number" || isNaN(value)) {
      throw new Error("Rating must be a valid number")
    }

    if (value < 1 || value > 5) {
      throw new Error("Rating must be between 1 and 5")
    }

    this.value = value
  }

  get val(): number {
    return this.value
  }

  equals(other: Rating): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value.toString()
  }
}
