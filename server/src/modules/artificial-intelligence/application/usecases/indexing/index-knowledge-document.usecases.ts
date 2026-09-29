import { NotFoundError } from "@/common/errors/not-found-error"
import { IKnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository"
import { IEmbeddingProvider } from "../../ports/ai-provider.interface"
import { IChunkerService } from "../../ports/chunker.interface"
import { IVectorStore, VectorChunk } from "../../ports/vector.interface"
import { IIndexKnowledgeDocumentUseCase } from "../../interfaces/knowledge-document-usecases.interface"
import { generateChunkPointId } from "../../utils/point-id.util"

export { generateChunkPointId }

export class IndexKnowledgeDocumentUseCase implements IIndexKnowledgeDocumentUseCase {
  constructor(
    private readonly chunker: IChunkerService,
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly documentsRepository: IKnowledgeDocumentRepository,
    private readonly vectorStore: IVectorStore
  ) {}

  async execute(documentId: string): Promise<void> {
    const document = await this.documentsRepository.findById(documentId)
    if (!document) {
      throw new NotFoundError("Knowledge Document not found")
    }

    const chunks = await this.chunker.chunk(document.content)
    if (chunks.length === 0) {
      throw new Error("Document produced no chunks")
    }

    const embeddings = await this.embeddingProvider.embedBatch(chunks)
    if (embeddings.length !== chunks.length) {
      throw new Error(
        `Embedding count mismatch: expected ${chunks.length}, got ${embeddings.length}`
      )
    }

    const vectorChunks: VectorChunk[] = chunks.map((content, index) => ({
      id: generateChunkPointId(document.id, index),
      documentId: document.id,
      content,
      vector: embeddings[index] || [],
      metadata: {
        category: document.category,
        locale: document.locale,
        version: document.version,
        chunkIndex: index,
        totalChunks: chunks.length,
      },
    }))

    // 1. Upsert chunks into Qdrant using deterministic IDs (existing chunks update in place)
    await this.vectorStore.upsert(vectorChunks)

    // 2. Remove stale chunks from previous indexing (e.g. if document was re-indexed with fewer chunks)
    const currentChunkIds = vectorChunks.map((chunk) => chunk.id)
    await this.vectorStore.deleteStaleChunks(document.id, currentChunkIds)

    // 3. Keep MongoDB as the source of truth for the document's chunk count
    document.setChunkCount(chunks.length)
    await this.documentsRepository.update(document.id, document)
  }
}
