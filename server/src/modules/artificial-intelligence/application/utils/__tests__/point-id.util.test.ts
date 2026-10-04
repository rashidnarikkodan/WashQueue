import { describe, it, expect } from "vitest"
import { generateChunkPointId } from "../point-id.util"

describe("generateChunkPointId", () => {
  it("should generate deterministic point IDs for the same documentId and chunkIndex", () => {
    const id1 = generateChunkPointId("doc-123", 0)
    const id2 = generateChunkPointId("doc-123", 0)

    expect(id1).toBe(id2)
  })

  it("should generate distinct point IDs for different chunk indices of the same document", () => {
    const idChunk0 = generateChunkPointId("doc-123", 0)
    const idChunk1 = generateChunkPointId("doc-123", 1)

    expect(idChunk0).not.toBe(idChunk1)
  })

  it("should generate distinct point IDs for different documents with the same chunk index", () => {
    const idDocA = generateChunkPointId("doc-A", 0)
    const idDocB = generateChunkPointId("doc-B", 0)

    expect(idDocA).not.toBe(idDocB)
  })

  it("should output valid RFC 4122 v5 UUID format accepted by Qdrant", () => {
    const id = generateChunkPointId("507f1f77bcf86cd799439011", 3)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    expect(id).toMatch(uuidRegex)
  })
})
