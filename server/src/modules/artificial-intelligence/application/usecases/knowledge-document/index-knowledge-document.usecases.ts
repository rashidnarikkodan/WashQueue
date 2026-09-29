import crypto from "crypto"
import { NotFoundError } from "@/common/errors/not-found-error"
import { IKnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository"
import { IEmbeddingProvider } from "../../ports/ai-provider.interface"
import { IChunkerService } from "../../ports/chunker.interface"
import { IVectorStore, VectorChunk } from "../../ports/vector.interface"
import { IIndexKnowledgeDocumentUseCase } from "../../interfaces/knowledge-document-usecases.interface"

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
      throw new NotFoundError("Documnet Not Found")
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
      id: crypto.randomUUID(),
      documentId: document.id,
      content,
      vector: embeddings[index] || [],
      metadata: {
        category: document.category,
        locale: document.locale,
        version: document.version,
      },
    }))

    await this.vectorStore.upsert(vectorChunks)
  }
}
