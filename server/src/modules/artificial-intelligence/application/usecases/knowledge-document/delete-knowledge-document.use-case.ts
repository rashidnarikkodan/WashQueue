import { IKnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository"
import { IDeleteKnowledgeDocumentUseCase } from "../../interfaces/knowledge-document-usecases.interface"
import { NotFoundError } from "@/common/errors/not-found-error"

export class DeleteKnowledgeDocumentUseCase implements IDeleteKnowledgeDocumentUseCase {
  constructor(private readonly repository: IKnowledgeDocumentRepository) {}

  async execute(id: string): Promise<void> {
    const doc = await this.repository.findById(id)
    if (!doc) {
      throw new NotFoundError("Knowledge Document not found")
    }
    await this.repository.delete(id)
  }
}
