import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  IndexKnowledgeDocumentUseCase,
  generateChunkPointId,
} from "../index-knowledge-document.usecases"
import { NotFoundError } from "@/common/errors/not-found-error"
import KnowledgeDocument from "../../../../domain/entities/KnowledgeDocument.entity"
import type { IKnowledgeDocumentRepository } from "../../../../domain/repositories/knowledge-document.repository"
import type { IEmbeddingProvider } from "../../../ports/ai-provider.interface"
import type { IChunkerService } from "../../../ports/chunker.interface"
import type { IVectorStore, VectorChunk } from "../../../ports/vector.interface"

describe("IndexKnowledgeDocumentUseCase", () => {
  let useCase: IndexKnowledgeDocumentUseCase
  let mockChunker: IChunkerService
  let mockEmbedder: IEmbeddingProvider
  let mockRepository: IKnowledgeDocumentRepository
  let mockVectorStore: IVectorStore

  const sampleDoc = new KnowledgeDocument({
    id: "6abba205e60220a786d90afe",
    title: "Test Document",
    content: "Chunk 1 content. Chunk 2 content. Chunk 3 content.",
    category: "FAQ",
    status: "PUBLISHED",
    locale: "en",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  beforeEach(() => {
    mockChunker = {
      chunk: vi.fn(),
    }
    mockEmbedder = {
      embed: vi.fn(),
      embedBatch: vi.fn(),
    }
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as IKnowledgeDocumentRepository
    mockVectorStore = {
      upsert: vi.fn().mockResolvedValue(undefined),
      search: vi.fn(),
      deleteByDocumentId: vi.fn().mockResolvedValue(undefined),
      deleteStaleChunks: vi.fn().mockResolvedValue(undefined),
    }

    useCase = new IndexKnowledgeDocumentUseCase(
      mockChunker,
      mockEmbedder,
      mockRepository,
      mockVectorStore
    )
  })

  it("should generate deterministic point IDs and upsert them into vectorStore", async () => {
    const chunks = ["Chunk 1", "Chunk 2"]
    const mockEmbeddings = [new Array(768).fill(0.1), new Array(768).fill(0.2)]

    vi.mocked(mockRepository.findById).mockResolvedValue(sampleDoc)
    vi.mocked(mockChunker.chunk).mockResolvedValue(chunks)
    vi.mocked(mockEmbedder.embedBatch).mockResolvedValue(mockEmbeddings)
    vi.mocked(mockRepository.update).mockResolvedValue(sampleDoc)

    await useCase.execute(sampleDoc.id)

    expect(mockVectorStore.upsert).toHaveBeenCalledTimes(1)
    const upsertedChunks: VectorChunk[] = vi.mocked(mockVectorStore.upsert).mock.calls[0]![0]

    expect(upsertedChunks).toHaveLength(2)
    // Verify deterministic IDs
    expect(upsertedChunks[0]!.id).toBe(generateChunkPointId(sampleDoc.id, 0))
    expect(upsertedChunks[1]!.id).toBe(generateChunkPointId(sampleDoc.id, 1))

    // Verify metadata
    expect(upsertedChunks[0]!.metadata.chunkIndex).toBe(0)
    expect(upsertedChunks[0]!.metadata.totalChunks).toBe(2)
    expect(upsertedChunks[1]!.metadata.chunkIndex).toBe(1)
    expect(upsertedChunks[1]!.metadata.totalChunks).toBe(2)
  })

  it("should produce identical point IDs across multiple indexing runs of the same document (no duplicate IDs)", async () => {
    const chunks = ["Chunk 1", "Chunk 2", "Chunk 3"]
    const mockEmbeddings = [
      new Array(768).fill(0.1),
      new Array(768).fill(0.2),
      new Array(768).fill(0.3),
    ]

    vi.mocked(mockRepository.findById).mockResolvedValue(sampleDoc)
    vi.mocked(mockChunker.chunk).mockResolvedValue(chunks)
    vi.mocked(mockEmbedder.embedBatch).mockResolvedValue(mockEmbeddings)
    vi.mocked(mockRepository.update).mockResolvedValue(sampleDoc)

    // Run 1
    await useCase.execute(sampleDoc.id)
    const run1Chunks: VectorChunk[] = vi.mocked(mockVectorStore.upsert).mock.calls[0]![0]

    // Run 2 (re-index same document)
    await useCase.execute(sampleDoc.id)
    const run2Chunks: VectorChunk[] = vi.mocked(mockVectorStore.upsert).mock.calls[1]![0]

    expect(run1Chunks).toHaveLength(run2Chunks.length)
    for (let i = 0; i < run1Chunks.length; i++) {
      expect(run2Chunks[i]!.id).toBe(run1Chunks[i]!.id)
    }
  })

  it("should call deleteStaleChunks with current chunk IDs when re-indexed with fewer chunks", async () => {
    // Document originally had 4 chunks, now reduced to 2 chunks
    const fewerChunks = ["Condensed chunk 1", "Condensed chunk 2"]
    const mockEmbeddings = [new Array(768).fill(0.1), new Array(768).fill(0.2)]

    vi.mocked(mockRepository.findById).mockResolvedValue(sampleDoc)
    vi.mocked(mockChunker.chunk).mockResolvedValue(fewerChunks)
    vi.mocked(mockEmbedder.embedBatch).mockResolvedValue(mockEmbeddings)
    vi.mocked(mockRepository.update).mockResolvedValue(sampleDoc)

    await useCase.execute(sampleDoc.id)

    const expectedCurrentIds = [
      generateChunkPointId(sampleDoc.id, 0),
      generateChunkPointId(sampleDoc.id, 1),
    ]

    expect(mockVectorStore.deleteStaleChunks).toHaveBeenCalledWith(sampleDoc.id, expectedCurrentIds)
  })

  it("should update chunkCount in MongoDB keeping it as the source of truth", async () => {
    const chunks = ["Single chunk"]
    const mockEmbeddings = [new Array(768).fill(0.1)]

    vi.mocked(mockRepository.findById).mockResolvedValue(sampleDoc)
    vi.mocked(mockChunker.chunk).mockResolvedValue(chunks)
    vi.mocked(mockEmbedder.embedBatch).mockResolvedValue(mockEmbeddings)
    vi.mocked(mockRepository.update).mockResolvedValue(sampleDoc)

    await useCase.execute(sampleDoc.id)

    expect(mockRepository.update).toHaveBeenCalledWith(
      sampleDoc.id,
      expect.objectContaining({
        chunkCount: 1,
      })
    )
    expect(sampleDoc.chunkCount).toBe(1)
  })

  it("should throw NotFoundError if document is not found in MongoDB", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null)

    await expect(useCase.execute("non-existent-id")).rejects.toThrow(NotFoundError)
    expect(mockVectorStore.upsert).not.toHaveBeenCalled()
  })

  it("should throw an error if document produces zero chunks", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleDoc)
    vi.mocked(mockChunker.chunk).mockResolvedValue([])

    await expect(useCase.execute(sampleDoc.id)).rejects.toThrow("Document produced no chunks")
    expect(mockVectorStore.upsert).not.toHaveBeenCalled()
  })

  it("should throw an error if embedding count does not match chunk count", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleDoc)
    vi.mocked(mockChunker.chunk).mockResolvedValue(["Chunk 1", "Chunk 2"])
    vi.mocked(mockEmbedder.embedBatch).mockResolvedValue([new Array(768).fill(0.1)]) // only 1 embedding for 2 chunks

    await expect(useCase.execute(sampleDoc.id)).rejects.toThrow("Embedding count mismatch")
    expect(mockVectorStore.upsert).not.toHaveBeenCalled()
  })
})
