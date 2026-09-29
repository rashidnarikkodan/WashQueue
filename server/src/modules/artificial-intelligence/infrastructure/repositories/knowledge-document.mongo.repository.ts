import { BaseRepository } from "@/infrastructure/database/repository/base.repository"
import KnowledgeDocument from "../../domain/entities/KnowledgeDocument.entity"
import { IKnowledgeDocument, KnowledgeDocumentModel } from "../model/knowledge-document.model"
import { IKnowledgeDocumentRepository } from "../../domain/repositories/knowledge-document.repository"
import { KnowledgeDocumentMapper } from "../mappers/knowledge-document.mapper"

export class KnowledgeDocumentRepository
  extends BaseRepository<KnowledgeDocument, IKnowledgeDocument>
  implements IKnowledgeDocumentRepository
{
  constructor() {
    super(KnowledgeDocumentModel, new KnowledgeDocumentMapper())
  }

  async findAll(
    query: Record<string, unknown>
  ): Promise<{ data: KnowledgeDocument[]; total: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {}
    if (query.category && query.category !== "ALL") {
      filter.category = query.category
    }
    if (query.status && query.status !== "ALL") {
      filter.status = query.status
    }
    if (query.search && typeof query.search === "string" && query.search.trim()) {
      const searchRegex = { $regex: query.search.trim(), $options: "i" }
      filter.$or = [{ title: searchRegex }, { content: searchRegex }]
    }

    const page = query.page ? parseInt(query.page as string, 10) : 1
    const limit = query.limit ? parseInt(query.limit as string, 10) : 10
    const skip = (page - 1) * limit

    const [docs, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ])

    return {
      data: docs.map((doc) => this.mapper.toDomain(doc)),
      total,
    }
  }
}
