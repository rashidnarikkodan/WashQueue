import { SearchKnowledgeDocumentDto } from "../../dto/knowledge-document.dto"
import { ISearchKnowledgeDocumentUseCase } from "../../interfaces/knowledge-document-usecases.interface"
import { IEmbeddingProvider } from "../../ports/ai-provider.interface"
import { IVectorStore, RetrievedChunk } from "../../ports/vector.interface"

export class SearchKnowledgeDocumentUseCase implements ISearchKnowledgeDocumentUseCase {
  constructor(
    private readonly embeddingProvider: IEmbeddingProvider,
    private readonly vectorStore: IVectorStore
  ) {}

  async execute(data: SearchKnowledgeDocumentDto): Promise<RetrievedChunk[]> {
    const embedding = await this.embeddingProvider.embed(data.query)

    const results = await this.vectorStore.search(embedding, {
      limit: data.limit || 5,
      minScore: data.minScore,
      filter: data.filter,
    })

    return results
  }
}
