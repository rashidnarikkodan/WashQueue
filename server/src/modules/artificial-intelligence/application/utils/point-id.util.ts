import crypto from "crypto"

/**
 * Generates a deterministic RFC 4122 v5 UUID based on documentId and chunkIndex.
 * Ensures Qdrant accepts the point ID while guaranteeing that identical chunks receive
 * the identical ID across re-index operations, allowing in-place updates without duplicates.
 */
export function generateChunkPointId(documentId: string, chunkIndex: number): string {
  const hash = crypto.createHash("sha256").update(`${documentId}:${chunkIndex}`).digest("hex")

  // Format 32 hex characters into standard RFC 4122 v5 UUID format (8-4-4-4-12)
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "5" + hash.slice(13, 16),
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") +
      hash.slice(18, 20),
    hash.slice(20, 32),
  ].join("-")
}
