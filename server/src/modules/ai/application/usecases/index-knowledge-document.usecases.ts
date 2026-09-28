import { IKnowledgeDocumentRepository } from "../../domain/repositories/knowledge-document.repository"
import { IVectorStore } from "../interfaces/vector.interface"

export interface IEmbeddingService {
  generate(chunks: string[]): Promise<number[][]>
}

export class IndexKnowledgeDocument {
  constructor(
    private readonly documentRepository: IKnowledgeDocumentRepository,
    private readonly embeddingService: IEmbeddingService,
    private readonly vectorStore: IVectorStore
  ) {}

  async execute(documentId: string): Promise<void> {
    const document = await this.documentRepository.findById(documentId)

    if (!document) {
      throw new Error("Knowledge document not found")
    }

    const chunks = this.chunkDocument(document)

    const embeddings = await this.embeddingService.generate(chunks)

    const vectorChunks = chunks.map((chunk: string, index: number) => ({
      id: `${document.id}-${index}`,
      documentId: document.id,
      content: chunk,
      embedding: embeddings[index],
      metadata: {
        category: document.category,
        locale: document.locale,
        version: document.version,
      },
    }))

    await this.vectorStore.upsert(vectorChunks)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private chunkDocument(document: any): string[] {
    return [document.content]
  }
}
