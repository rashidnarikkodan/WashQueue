import { randomBytes, createHash } from "node:crypto"

export interface GeneratedQR {
  rawToken: string
  qrTokenHash: string
  qrExpiresAt: Date
}

export class QRTokenService {
  /**
   * Generates a secure random QR token string, SHA-256 hash, and expiry date.
   */
  static generateToken(windowEnd: Date): GeneratedQR {
    const rawToken = randomBytes(32).toString("hex")
    const qrTokenHash = this.hashToken(rawToken)

    // Expires 24 hours after time window end
    const qrExpiresAt = new Date(windowEnd.getTime() + 24 * 60 * 60 * 1000)

    return {
      rawToken,
      qrTokenHash,
      qrExpiresAt,
    }
  }

  static hashToken(rawToken: string): string {
    return createHash("sha256").update(rawToken).digest("hex")
  }
}
