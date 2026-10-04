import { IKnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository"
import { IDeleteKnowledgeDocumentUseCase } from "../../interfaces/knowledge-document-usecases.interface"
import { IVectorStore } from "../../ports/vector.interface"
import { NotFoundError } from "@/common/errors/not-found-error"

export class DeleteKnowledgeDocumentUseCase implements IDeleteKnowledgeDocumentUseCase {
  constructor(
    private readonly repository: IKnowledgeDocumentRepository,
    private readonly vectorStore?: IVectorStore
  ) {}

  async execute(id: string): Promise<void> {
    const doc = await this.repository.findById(id)
    if (!doc) {
      throw new NotFoundError("Knowledge Document not found")
    }
    await this.repository.delete(id)
    if (this.vectorStore) {
      await this.vectorStore.deleteByDocumentId(id).catch((err) => {
        console.error("Failed to delete vector embeddings for document:", err)
      })
    }
  }
}
