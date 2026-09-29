import { describe, it, expect, vi, beforeEach } from "vitest"
import { QdrantVectorStore } from "../qdrant.store"
import { qdrant } from "@/infrastructure/database/qdrant/connect"
import { VECTOR_COLLECTIONS } from "@/common/constants/vector-collections.constants"
import type { VectorChunk } from "../../../application/ports/vector.interface"

vi.mock("@/infrastructure/database/qdrant/connect", () => ({
  qdrant: {
    upsert: vi.fn(),
    delete: vi.fn(),
    scroll: vi.fn(),
    count: vi.fn(),
    query: vi.fn(),
  },
}))

describe("QdrantVectorStore", () => {
  let store: QdrantVectorStore

  beforeEach(() => {
    vi.clearAllMocks()
    store = new QdrantVectorStore()
  })

  it("should upsert vector chunks with chunkIndex and totalChunks in payload", async () => {
    const chunks: VectorChunk[] = [
      {
        id: "chunk-uuid-0",
        documentId: "doc-1",
        content: "content 1",
        vector: [0.1, 0.2],
        metadata: {
          category: "FAQ",
          locale: "en",
          version: 1,
          chunkIndex: 0,
          totalChunks: 2,
        },
      },
      {
        id: "chunk-uuid-1",
        documentId: "doc-1",
        content: "content 2",
        vector: [0.3, 0.4],
        metadata: {
          category: "FAQ",
          locale: "en",
          version: 1,
          chunkIndex: 1,
          totalChunks: 2,
        },
      },
    ]

    await store.upsert(chunks)

    expect(qdrant.upsert).toHaveBeenCalledWith(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
      wait: true,
      points: [
        {
          id: "chunk-uuid-0",
          vector: [0.1, 0.2],
          payload: {
            content: "content 1",
            documentId: "doc-1",
            chunkIndex: 0,
            totalChunks: 2,
            metadata: chunks[0]!.metadata,
          },
        },
        {
          id: "chunk-uuid-1",
          vector: [0.3, 0.4],
          payload: {
            content: "content 2",
            documentId: "doc-1",
            chunkIndex: 1,
            totalChunks: 2,
            metadata: chunks[1]!.metadata,
          },
        },
      ],
    })
  })

  it("should delete stale chunks that are no longer part of currentChunkIds", async () => {
    const documentId = "doc-1"
    const currentChunkIds = ["chunk-uuid-0", "chunk-uuid-1"]

    // Existing points in Qdrant has an old chunk "chunk-uuid-2" and a legacy point "old-random-uuid"
    vi.mocked(qdrant.scroll).mockResolvedValueOnce({
      points: [
        { id: "chunk-uuid-0" },
        { id: "chunk-uuid-1" },
        { id: "chunk-uuid-2" },
        { id: "old-random-uuid" },
      ],
      next_page_offset: null,
    } as unknown as Awaited<ReturnType<typeof qdrant.scroll>>)

    await store.deleteStaleChunks(documentId, currentChunkIds)

    expect(qdrant.delete).toHaveBeenCalledWith(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
      wait: true,
      points: ["chunk-uuid-2", "old-random-uuid"],
    })
  })

  it("should not invoke qdrant.delete if there are no stale chunks", async () => {
    const documentId = "doc-1"
    const currentChunkIds = ["chunk-uuid-0", "chunk-uuid-1"]

    vi.mocked(qdrant.scroll).mockResolvedValueOnce({
      points: [{ id: "chunk-uuid-0" }, { id: "chunk-uuid-1" }],
      next_page_offset: null,
    } as unknown as Awaited<ReturnType<typeof qdrant.scroll>>)

    await store.deleteStaleChunks(documentId, currentChunkIds)

    expect(qdrant.delete).not.toHaveBeenCalled()
  })

  it("should count points by documentId using qdrant.count", async () => {
    vi.mocked(qdrant.count).mockResolvedValueOnce({ count: 3 } as unknown as Awaited<
      ReturnType<typeof qdrant.count>
    >)

    const count = await store.countByDocumentId("doc-1")

    expect(count).toBe(3)
    expect(qdrant.count).toHaveBeenCalledWith(VECTOR_COLLECTIONS.KNOWLEDGE_DOCUMENT, {
      filter: {
        must: [
          {
            key: "documentId",
            match: {
              value: "doc-1",
            },
          },
        ],
      },
      exact: true,
    })
  })
})
