import { IKnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository"
import KnowledgeDocument, {
  KnowledgeDocumentProps,
} from "../../../domain/entities/KnowledgeDocument.entity"
import { CreateKnowledgeDocumentDto } from "../../dto/knowledge-document.dto"
import { ICreateKnowledgeDocumentUseCase } from "../../interfaces/knowledge-document-usecases.interface"
import mongoose from "mongoose"

export class CreateKnowledgeDocumentUseCase implements ICreateKnowledgeDocumentUseCase {
  constructor(private readonly repository: IKnowledgeDocumentRepository) {}

  async execute(data: CreateKnowledgeDocumentDto): Promise<KnowledgeDocumentProps> {
    const doc = new KnowledgeDocument({
      ...data,
      id: new mongoose.Types.ObjectId().toString(),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const savedDoc = await this.repository.save(doc)
    return savedDoc.toJSON()
  }
}
