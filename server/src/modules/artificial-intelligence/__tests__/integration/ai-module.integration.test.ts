import { describe, it, expect, beforeAll, afterAll } from "vitest"
import mongoose from "mongoose"
import env from "@/configs/env.config"
import { initializeQdrant } from "@/infrastructure/database/qdrant/connect"
import { LangChainChunker } from "../../infrastructure/services/chunker.service"
import { LocalEmbeddingModel } from "../../infrastructure/services/embedding.service"
import { QdrantVectorStore } from "../../infrastructure/vector/qdrant.store"
import { KnowledgeDocumentRepository } from "../../infrastructure/repositories/knowledge-document.mongo.repository"
import { CreateKnowledgeDocumentUseCase } from "../../application/usecases/knowledge-document/create-knowledge-document.use-case"
import { IndexKnowledgeDocumentUseCase } from "../../application/usecases/indexing/index-knowledge-document.usecases"
import { SearchKnowledgeDocumentUseCase } from "../../application/usecases/search/search-knowledge-document.usecase"
import { KnowledgeDocumentModel } from "../../infrastructure/model/knowledge-document.model"
import { CreateKnowledgeDocumentDto } from "../../application/dto/knowledge-document.dto"

describe("Artificial Intelligence Module - Full End-to-End Flow", () => {
  let createUseCase: CreateKnowledgeDocumentUseCase
  let indexUseCase: IndexKnowledgeDocumentUseCase
  let searchUseCase: SearchKnowledgeDocumentUseCase
  let repository: KnowledgeDocumentRepository
  let vectorStore: QdrantVectorStore
  let documentId: string

  beforeAll(async () => {
    // 1. Setup Databases
    await mongoose.connect(env.MONGODB_URI)
    await initializeQdrant()

    // 2. Setup Services & Repositories
    const chunker = new LangChainChunker()
    const embedder = new LocalEmbeddingModel()
    vectorStore = new QdrantVectorStore()
    repository = new KnowledgeDocumentRepository()

    // 3. Setup Use Cases
    indexUseCase = new IndexKnowledgeDocumentUseCase(chunker, embedder, repository, vectorStore)
    createUseCase = new CreateKnowledgeDocumentUseCase(repository, indexUseCase)
    searchUseCase = new SearchKnowledgeDocumentUseCase(embedder, vectorStore)
  })

  afterAll(async () => {
    // Clean up MongoDB and Qdrant
    if (documentId) {
      await KnowledgeDocumentModel.deleteOne({ _id: documentId })
      await vectorStore.deleteByDocumentId(documentId)
    }
    await mongoose.disconnect()
  })

  it("should create a knowledge document, index it, and make it searchable", async () => {
    // 1. Create a new document
    const content = `WashQueue is an intelligent car wash management and automated queue scheduling platform designed to eliminate long waiting queues and streamline station operations.

Customers can seamlessly book car wash appointments by choosing their preferred service tier (e.g., Express Wash, Deluxe Interior Detailing, Ceramic Coating), picking an available station, and selecting real-time time slots. The platform provides live wait-time estimations using predictive traffic and station load analysis.

Station managers have access to a dedicated dashboard where they can manage active service bays, admit walk-in customers, and transition vehicles through defined workflow stages: In Queue, Under Wash, Interior Cleaning, Drying & Polishing, and Ready for Pickup. Automated notifications and SMS alerts keep customers updated at every stage of the process.`

    const dto: CreateKnowledgeDocumentDto = {
      title: "WashQueue Booking and Queue Management",
      content,
      category: "SERVICE",
      locale: "en",
      status: "PUBLISHED",
    }

    const createdDoc = await createUseCase.execute(dto)
    documentId = createdDoc.id

    expect(createdDoc.title).toBe(dto.title)
    expect(createdDoc.content).toBe(dto.content)

    await new Promise((resolve) => setTimeout(resolve, 3000))

    // 2. Search for related concepts
    const searchQuery = "How do station managers update vehicle status in queue?"
    const searchResults = await searchUseCase.execute({
      query: searchQuery,
      limit: 3,
      filter: { documentId },
    })

    // 3. Assert Results
    expect(searchResults.length).toBeGreaterThan(0)

    // The top result should be from our newly created document
    const bestResult = searchResults[0]
    expect(bestResult?.payload?.documentId).toBe(documentId)
    expect(bestResult?.payload?.content).toBeDefined()
    expect(bestResult?.score).toBeGreaterThan(0)
  }, 15000)

  it("should not create duplicate points when re-indexing the same document repeatedly", async () => {
    if (!documentId) return

    // Re-index the same document twice
    await indexUseCase.execute(documentId)
    await indexUseCase.execute(documentId)

    const count = await vectorStore.countByDocumentId(documentId)
    const docInDb = await repository.findById(documentId)

    expect(count).toBe(docInDb?.chunkCount)
    expect(count).toBeGreaterThan(0)
  }, 15000)

  it("should remove stale chunks when re-indexed with fewer chunks", async () => {
    if (!documentId) return

    // Update document in MongoDB with shorter content that yields fewer chunks
    const doc = await repository.findById(documentId)
    expect(doc).toBeDefined()
    doc!.updateContent(doc!.title, "Short single sentence content.")
    await repository.update(documentId, doc!)

    // Re-index
    await indexUseCase.execute(documentId)

    const count = await vectorStore.countByDocumentId(documentId)
    expect(count).toBe(1)

    const updatedDocInDb = await repository.findById(documentId)
    expect(updatedDocInDb?.chunkCount).toBe(1)
  }, 15000)
})
