import { describe, it, expect, vi, beforeEach } from "vitest"
import { UpdateKnowledgeDocumentUseCase } from "../update-knowledge-document.use-case"
import KnowledgeDocument from "../../../../domain/entities/KnowledgeDocument.entity"
import type { IKnowledgeDocumentRepository } from "../../../../domain/repositories/knowledge-document.repository"
import type { IIndexKnowledgeDocumentUseCase } from "../../../interfaces/knowledge-document-usecases.interface"

describe("UpdateKnowledgeDocumentUseCase", () => {
  let useCase: UpdateKnowledgeDocumentUseCase
  let mockRepository: IKnowledgeDocumentRepository
  let mockIndexUseCase: IIndexKnowledgeDocumentUseCase

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      update: vi.fn().mockImplementation((_id, doc) => Promise.resolve(doc)),
      delete: vi.fn(),
    } as unknown as IKnowledgeDocumentRepository

    mockIndexUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    }

    useCase = new UpdateKnowledgeDocumentUseCase(mockRepository, mockIndexUseCase)
  })

  it("should successfully publish an archived document and set publishedAt", async () => {
    const archivedDoc = new KnowledgeDocument({
      id: "6abba205e60220a786d90afe",
      title: "Archived Doc",
      content: "This document was previously archived.",
      category: "FAQ",
      status: "ARCHIVED",
      locale: "en",
      version: 1,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
    })

    vi.spyOn(mockRepository, "findById").mockResolvedValue(archivedDoc)

    const result = await useCase.execute("6abba205e60220a786d90afe", {
      status: "PUBLISHED",
    })

    expect(result.status).toBe("PUBLISHED")
    expect(result.publishedAt).toBeDefined()
    expect(mockIndexUseCase.execute).toHaveBeenCalledWith("6abba205e60220a786d90afe")
  })

  it("should transition between statuses freely (PUBLISHED -> ARCHIVED -> DRAFT -> PUBLISHED)", async () => {
    const publishedDoc = new KnowledgeDocument({
      id: "doc-123",
      title: "Active Doc",
      content: "Active document content.",
      category: "POLICY",
      status: "PUBLISHED",
      locale: "en",
      version: 1,
      publishedAt: new Date("2026-01-01T12:00:00Z"),
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T12:00:00Z"),
    })

    vi.spyOn(mockRepository, "findById").mockResolvedValue(publishedDoc)

    // Move to ARCHIVED
    const res1 = await useCase.execute("doc-123", { status: "ARCHIVED" })
    expect(res1.status).toBe("ARCHIVED")

    // Move from ARCHIVED to DRAFT
    const res2 = await useCase.execute("doc-123", { status: "DRAFT" })
    expect(res2.status).toBe("DRAFT")

    // Move from DRAFT to PUBLISHED
    const res3 = await useCase.execute("doc-123", { status: "PUBLISHED" })
    expect(res3.status).toBe("PUBLISHED")
  })
})
