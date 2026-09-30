import { randomInt } from "node:crypto"

export class CaseReferenceService {
  static generate(): string {
    const randomSeq = String(randomInt(100000, 999999))
    return `CASE-${randomSeq}`
  }
}
