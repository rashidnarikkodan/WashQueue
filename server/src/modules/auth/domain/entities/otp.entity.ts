export class Otp {
  public readonly email: string
  public readonly code: string
  public readonly expiresAt: Date

  constructor(props: { email: string; code: string; expiresAt?: Date }) {
    this.email = props.email.toLowerCase()
    this.code = props.code
    this.expiresAt = props.expiresAt || new Date(Date.now() + 300 * 1000) // Default 5 minutes TTL
  }

  isExpired(now: Date = new Date()): boolean {
    return now > this.expiresAt
  }

  verify(code: string, now: Date = new Date()): boolean {
    return this.code === code && !this.isExpired(now)
  }
}
