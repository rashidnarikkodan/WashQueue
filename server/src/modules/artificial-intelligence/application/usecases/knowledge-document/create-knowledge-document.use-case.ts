import { IKnowledgeDocumentRepository } from "../../../domain/repositories/knowledge-document.repository"
import KnowledgeDocument, {
  KnowledgeDocumentProps,
} from "../../../domain/entities/KnowledgeDocument.entity"
import { CreateKnowledgeDocumentDto } from "../../dto/knowledge-document.dto"
import {
  ICreateKnowledgeDocumentUseCase,
  IIndexKnowledgeDocumentUseCase,
} from "../../interfaces/knowledge-document-usecases.interface"
import mongoose from "mongoose"

export class CreateKnowledgeDocumentUseCase implements ICreateKnowledgeDocumentUseCase {
  constructor(
    private readonly repository: IKnowledgeDocumentRepository,
    private readonly indexUseCase: IIndexKnowledgeDocumentUseCase
  ) {}

  async execute(data: CreateKnowledgeDocumentDto): Promise<KnowledgeDocumentProps> {
    const isPublished = data.status === "PUBLISHED"
    const doc = new KnowledgeDocument({
      ...data,
      id: new mongoose.Types.ObjectId().toString(),
      version: 1,
      publishedAt: isPublished ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const savedDoc = await this.repository.save(doc)

    // Trigger background indexing
    this.indexUseCase.execute(savedDoc.id).catch((err) => {
      console.error("Failed to index knowledge document:", err)
    })

    return savedDoc.toJSON()
  }
}
