import { IKnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository"
import { KnowledgeDocumentProps } from "../../../domain/entities/KnowledgeDocument.entity"
import { IGetKnowledgeDocumentUseCase } from "../../interfaces/knowledge-document/knowledge-document-usecases.interface"
import { NotFoundError } from "@/common/errors/not-found-error"

export class GetKnowledgeDocumentUseCase implements IGetKnowledgeDocumentUseCase {
  constructor(private readonly repository: IKnowledgeDocumentRepository) {}

  async execute(id: string): Promise<KnowledgeDocumentProps> {
    const doc = await this.repository.findById(id)
    if (!doc) {
      throw new NotFoundError("Knowledge Document not found")
    }
    return doc.toJSON()
  }
}
