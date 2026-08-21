import { randomBytes, createHash } from "node:crypto"

export interface GeneratedQR {
  rawToken: string
  qrTokenHash: string
  qrExpiresAt: Date
}

export class QRTokenService {
  static generateToken(windowEnd: Date): GeneratedQR {
    const rawToken = randomBytes(32).toString("hex")
    const qrTokenHash = this.hashToken(rawToken)

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
