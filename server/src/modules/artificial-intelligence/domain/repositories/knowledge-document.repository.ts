import { IBaseRepository } from "@/core/domain/repository.interface"
import KnowledgeDocument from "../entities/KnowledgeDocument.entity"

export interface IKnowledgeDocumentRepository extends IBaseRepository<KnowledgeDocument> {
  findAll(query: Record<string, unknown>): Promise<{ data: KnowledgeDocument[]; total: number }>
}
